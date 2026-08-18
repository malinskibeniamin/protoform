import { type CelError, CelScalar, celEnv, celError, celFunc, isCelError, parse, plan } from "@bufbuild/cel";

type CelExpr = NonNullable<ReturnType<typeof parse>["expr"]>;

const CONDITIONAL_FUNCTION = "_?_:_";
const INDEX_FUNCTION = "_[_]";
const COST_FUNCTION = "protoform.consume_cost";
const UNKNOWN_ERROR_PREFIX = "protoform unknown attribute: ";
const CEL_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const DEFAULT_CEL_MAX_COST = 10_000;

export interface CompileCelExpressionOptions {
  maxCost?: number;
  unknownAttributes?: readonly string[];
}

export type CelEvaluation =
  | { cost: number; kind: "value"; value: unknown }
  | { attributes: readonly string[]; cost: number; kind: "unknown" }
  | { cost: number; error: CelError; kind: "error" }
  | { cost: number; kind: "cost-exceeded"; limit: number };

export type CompiledCelExpression = (bindings?: Record<string, unknown>) => CelEvaluation;

interface EvaluationBudget {
  cost: number;
  limit: number;
}

class CelCostLimitError extends Error {
  readonly cost: number;
  readonly limit: number;

  constructor(cost: number, limit: number) {
    super(`CEL evaluation cost ${cost} exceeds limit ${limit}.`);
    this.cost = cost;
    this.limit = limit;
    this.name = "CelCostLimitError";
  }
}

function childExpressions(expr: CelExpr): CelExpr[] {
  switch (expr.exprKind.case) {
    case "callExpr":
      return expr.exprKind.value.target
        ? [expr.exprKind.value.target, ...expr.exprKind.value.args]
        : expr.exprKind.value.args;
    case "comprehensionExpr": {
      const comprehension = expr.exprKind.value;
      return [
        comprehension.iterRange,
        comprehension.accuInit,
        comprehension.loopCondition,
        comprehension.loopStep,
        comprehension.result,
      ].filter((child): child is CelExpr => child !== undefined);
    }
    case "listExpr":
      return expr.exprKind.value.elements;
    case "selectExpr":
      return expr.exprKind.value.operand ? [expr.exprKind.value.operand] : [];
    case "structExpr":
      return expr.exprKind.value.entries.flatMap((entry) => {
        const children: CelExpr[] = [];
        if (entry.keyKind.case === "mapKey") {
          children.push(entry.keyKind.value);
        }
        if (entry.value) {
          children.push(entry.value);
        }
        return children;
      });
    case "constExpr":
    case "identExpr":
    case undefined:
      return [];
    default: {
      const exhaustive: never = expr.exprKind;
      return exhaustive;
    }
  }
}

function maximumExpressionId(expr: CelExpr): bigint {
  return childExpressions(expr).reduce((maximum, child) => {
    const childMaximum = maximumExpressionId(child);
    return childMaximum > maximum ? childMaximum : maximum;
  }, expr.id);
}

function constantPathSegment(expr: CelExpr): string | undefined {
  if (expr.exprKind.case !== "constExpr") {
    return undefined;
  }

  const constant = expr.exprKind.value.constantKind;
  switch (constant.case) {
    case "stringValue":
      return CEL_IDENTIFIER_PATTERN.test(constant.value) ? `.${constant.value}` : `[${JSON.stringify(constant.value)}]`;
    case "int64Value":
      return `[${constant.value}]`;
    case "uint64Value":
      return `[${constant.value}]`;
    case "boolValue":
    case "bytesValue":
    case "doubleValue":
    case "durationValue":
    case "nullValue":
    case "timestampValue":
    case undefined:
      return undefined;
    default: {
      const exhaustive: never = constant;
      return exhaustive;
    }
  }
}

function attributePath(expr: CelExpr): string | undefined {
  switch (expr.exprKind.case) {
    case "identExpr":
      return expr.exprKind.value.name;
    case "selectExpr": {
      const { operand } = expr.exprKind.value;
      const parent = operand ? attributePath(operand) : undefined;
      return parent ? `${parent}.${expr.exprKind.value.field}` : undefined;
    }
    case "callExpr": {
      const call = expr.exprKind.value;
      if (call.function !== INDEX_FUNCTION || call.args.length !== 2) {
        return undefined;
      }
      const parent = call.args[0] ? attributePath(call.args[0]) : undefined;
      const segment = call.args[1] ? constantPathSegment(call.args[1]) : undefined;
      return parent && segment ? `${parent}${segment}` : undefined;
    }
    case "comprehensionExpr":
    case "constExpr":
    case "listExpr":
    case "structExpr":
    case undefined:
      return undefined;
    default: {
      const exhaustive: never = expr.exprKind;
      return exhaustive;
    }
  }
}

function replaceWithIdentifier(expr: CelExpr, name: string): void {
  expr.exprKind = {
    case: "identExpr",
    value: {
      $typeName: "cel.expr.Expr.Ident",
      name,
    },
  };
}

function replaceUnknownAttributes(
  expr: CelExpr,
  unknownAttributes: ReadonlySet<string>,
  unknownBindings: Map<string, string>
): void {
  const path = attributePath(expr);
  if (path && unknownAttributes.has(path)) {
    let name = [...unknownBindings].find(([, value]) => value === path)?.[0];
    if (!name) {
      name = `_protoform_unknown_${unknownBindings.size}`;
      unknownBindings.set(name, path);
    }
    replaceWithIdentifier(expr, name);
    return;
  }

  for (const child of childExpressions(expr)) {
    replaceUnknownAttributes(child, unknownAttributes, unknownBindings);
  }
}

function createCostCall(template: CelExpr, id: bigint): CelExpr {
  const expr = structuredClone(template);
  expr.id = id;
  expr.exprKind = {
    case: "callExpr",
    value: {
      $typeName: "cel.expr.Expr.Call",
      args: [],
      function: COST_FUNCTION,
    },
  };
  return expr;
}

function createBooleanConstant(template: CelExpr, id: bigint, value: boolean): CelExpr {
  const expr = structuredClone(template);
  expr.id = id;
  expr.exprKind = {
    case: "constExpr",
    value: {
      $typeName: "cel.expr.Constant",
      constantKind: { case: "boolValue", value },
    },
  };
  return expr;
}

function instrumentCost(expr: CelExpr, nextExpressionId: () => bigint): void {
  for (const child of childExpressions(expr)) {
    instrumentCost(child, nextExpressionId);
  }

  const original = structuredClone(expr);
  expr.id = nextExpressionId();
  expr.exprKind = {
    case: "callExpr",
    value: {
      $typeName: "cel.expr.Expr.Call",
      args: [
        createCostCall(original, nextExpressionId()),
        original,
        createBooleanConstant(original, nextExpressionId(), false),
      ],
      function: CONDITIONAL_FUNCTION,
    },
  };
}

function collectUnknownAttributes(value: unknown, attributes: Set<string>, visited: Set<object>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectUnknownAttributes(item, attributes, visited);
    }
    return;
  }
  if (!isCelError(value) || visited.has(value)) {
    return;
  }

  visited.add(value);
  if (value.message.startsWith(UNKNOWN_ERROR_PREFIX)) {
    attributes.add(value.message.slice(UNKNOWN_ERROR_PREFIX.length));
  }
  collectUnknownAttributes(value.cause, attributes, visited);
}

function findCostLimitError(value: unknown, visited = new Set<object>()): CelCostLimitError | undefined {
  if (value instanceof CelCostLimitError) {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCostLimitError(item, visited);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (!isCelError(value) || visited.has(value)) {
    return undefined;
  }

  visited.add(value);
  return findCostLimitError(value.cause, visited);
}

function validateMaxCost(value: number): number {
  if (!(Number.isSafeInteger(value) && value > 0)) {
    throw new RangeError("CEL maxCost must be a positive safe integer.");
  }
  return value;
}

/** Compile a reusable CEL evaluator with partial unknowns and a per-run step budget. */
export function compileCelExpression(
  expression: string,
  options: CompileCelExpressionOptions = {}
): CompiledCelExpression {
  const maxCost = validateMaxCost(options.maxCost ?? DEFAULT_CEL_MAX_COST);
  const parsed = parse(expression);
  if (!parsed.expr) {
    throw new Error("CEL parser returned an empty expression.");
  }

  const expr = structuredClone(parsed.expr);
  const unknownBindings = new Map<string, string>();
  replaceUnknownAttributes(expr, new Set(options.unknownAttributes ?? []), unknownBindings);

  let expressionId = maximumExpressionId(expr) + 1n;
  const nextExpressionId = () => {
    const next = expressionId;
    expressionId += 1n;
    return next;
  };
  instrumentCost(expr, nextExpressionId);

  let activeBudget: EvaluationBudget | undefined;
  const consumeCost = celFunc(COST_FUNCTION, [], CelScalar.BOOL, (): boolean => {
    if (!activeBudget) {
      throw new Error("CEL cost meter used outside an evaluation.");
    }
    activeBudget.cost += 1;
    if (activeBudget.cost > activeBudget.limit) {
      throw new CelCostLimitError(activeBudget.cost, activeBudget.limit);
    }
    return true;
  });
  const evaluate = plan(celEnv({ funcs: [consumeCost] }), expr);

  return (bindings = {}) => {
    const budget: EvaluationBudget = { cost: 0, limit: maxCost };
    activeBudget = budget;
    try {
      const activation: Record<string, unknown> = { ...bindings };
      for (const [name, path] of unknownBindings) {
        activation[name] = celError(`${UNKNOWN_ERROR_PREFIX}${path}`);
      }

      const result = evaluate(activation as never);
      if (!isCelError(result)) {
        return { cost: budget.cost, kind: "value", value: result };
      }

      const costError = findCostLimitError(result);
      if (costError) {
        return {
          cost: costError.cost,
          kind: "cost-exceeded",
          limit: costError.limit,
        };
      }

      const attributes = new Set<string>();
      collectUnknownAttributes(result, attributes, new Set());
      if (attributes.size > 0) {
        return {
          attributes: [...attributes].sort(),
          cost: budget.cost,
          kind: "unknown",
        };
      }

      return { cost: budget.cost, error: result, kind: "error" };
    } catch (error) {
      return { cost: budget.cost, error: celError(error), kind: "error" };
    } finally {
      activeBudget = undefined;
    }
  };
}
