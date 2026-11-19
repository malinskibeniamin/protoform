import { type CelError, CelScalar, celEnv, celError, celFunc, isCelError, parse, plan } from '@bufbuild/cel';

type CelExpr = NonNullable<ReturnType<typeof parse>['expr']>;

const CONDITIONAL_FUNCTION = '_?_:_';
const INDEX_FUNCTION = '_[_]';
const COST_FUNCTION = 'protoform.consume_cost';
const UNKNOWN_ERROR_PREFIX = 'protoform unknown attribute: ';
const CEL_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;

export const DEFAULT_CEL_MAX_COST = 10_000;

export interface CompileCelExpressionOptions {
  maxCost?: number;
  unknownAttributes?: readonly string[];
}

export type CelEvaluation =
  | { cost: number; kind: 'value'; value: unknown }
  | { attributes: readonly string[]; cost: number; kind: 'unknown' }
  | { cost: number; error: CelError; kind: 'error' }
  | { cost: number; kind: 'cost-exceeded'; limit: number };

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
    this.name = 'CelCostLimitError';
  }
}

function childExpressions(expr: CelExpr) {
  switch (expr.exprKind.case) {
    case 'callExpr':
      return expr.exprKind.value.target
        ? [expr.exprKind.value.target, ...expr.exprKind.value.args]
        : expr.exprKind.value.args;
    case 'comprehensionExpr': {
      const comprehension = expr.exprKind.value;
      return [
        comprehension.iterRange,
        comprehension.accuInit,
        comprehension.loopCondition,
        comprehension.loopStep,
        comprehension.result,
      ].filter((child): child is CelExpr => child !== undefined);
    }
    case 'listExpr':
      return expr.exprKind.value.elements;
    case 'selectExpr':
      return expr.exprKind.value.operand ? [expr.exprKind.value.operand] : [];
    case 'structExpr':
      return expr.exprKind.value.entries.flatMap((entry) => {
        const children: CelExpr[] = [];
        if (entry.keyKind.case === 'mapKey') {
          children.push(entry.keyKind.value);
        }
        if (entry.value) {
          children.push(entry.value);
        }
        return children;
      });
    case 'constExpr':
    case 'identExpr':
    case undefined:
      return [];
    default: {
      const exhaustive: never = expr.exprKind;
      return exhaustive;
    }
  }
}

function maximumExpressionId(expr: CelExpr) {
  const result: bigint = childExpressions(expr).reduce((maximum, child) => {
    const childMaximum = maximumExpressionId(child);
    return childMaximum > maximum ? childMaximum : maximum;
  }, expr.id);
  return result;
}

function constantPathSegment(expr: CelExpr) {
  if (expr.exprKind.case !== 'constExpr') {
    return;
  }

  const constant = expr.exprKind.value.constantKind;
  switch (constant.case) {
    case 'stringValue':
      return CEL_IDENTIFIER_PATTERN.test(constant.value) ? `.${constant.value}` : `[${JSON.stringify(constant.value)}]`;
    case 'int64Value':
      return `[${constant.value}]`;
    case 'uint64Value':
      return `[${constant.value}]`;
    case 'boolValue':
    case 'bytesValue':
    case 'doubleValue':
    case 'durationValue':
    case 'nullValue':
    case 'timestampValue':
    case undefined:
      return;
    default: {
      const exhaustive: never = constant;
      return exhaustive;
    }
  }
}

function attributePath(expr: CelExpr): string | undefined;
function attributePath(expr: CelExpr) {
  switch (expr.exprKind.case) {
    case 'identExpr':
      return expr.exprKind.value.name;
    case 'selectExpr': {
      const { operand } = expr.exprKind.value;
      const parent = operand ? attributePath(operand) : undefined;
      return parent !== undefined && parent !== '' ? `${parent}.${expr.exprKind.value.field}` : undefined;
    }
    case 'callExpr': {
      const call = expr.exprKind.value;
      if (call.function !== INDEX_FUNCTION || call.args.length !== 2) {
        return;
      }
      const parent = call.args[0] ? attributePath(call.args[0]) : undefined;
      const segment = call.args[1] ? constantPathSegment(call.args[1]) : undefined;
      return parent !== undefined && parent !== '' && segment !== undefined && segment !== ''
        ? `${parent}${segment}`
        : undefined;
    }
    case 'comprehensionExpr':
    case 'constExpr':
    case 'listExpr':
    case 'structExpr':
    case undefined:
      return;
    default: {
      const exhaustive: never = expr.exprKind;
      return exhaustive;
    }
  }
}

function replaceWithIdentifier(expr: CelExpr, name: string) {
  expr.exprKind = {
    case: 'identExpr',
    value: {
      $typeName: 'cel.expr.Expr.Ident',
      name,
    },
  };
}

function replaceUnknownAttributes(
  expr: CelExpr,
  unknownAttributes: ReadonlySet<string>,
  unknownBindings: Map<string, string>
) {
  const path = attributePath(expr);
  if (path !== undefined && path !== '' && unknownAttributes.has(path)) {
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

function createCostCall(template: CelExpr, id: bigint) {
  const expr = structuredClone(template);
  expr.id = id;
  expr.exprKind = {
    case: 'callExpr',
    value: {
      $typeName: 'cel.expr.Expr.Call',
      args: [],
      function: COST_FUNCTION,
    },
  };
  return expr;
}

function createBooleanConstant(template: CelExpr, id: bigint, value: boolean) {
  const expr = structuredClone(template);
  expr.id = id;
  expr.exprKind = {
    case: 'constExpr',
    value: {
      $typeName: 'cel.expr.Constant',
      constantKind: { case: 'boolValue', value },
    },
  };
  return expr;
}

function instrumentCost(expr: CelExpr, nextExpressionId: () => bigint) {
  for (const child of childExpressions(expr)) {
    instrumentCost(child, nextExpressionId);
  }

  const original = structuredClone(expr);
  expr.id = nextExpressionId();
  expr.exprKind = {
    case: 'callExpr',
    value: {
      $typeName: 'cel.expr.Expr.Call',
      args: [
        createCostCall(original, nextExpressionId()),
        original,
        createBooleanConstant(original, nextExpressionId(), false),
      ],
      function: CONDITIONAL_FUNCTION,
    },
  };
}

function* errorCauseNodes(value: unknown) {
  const pending: unknown[] = [value];
  const visited = new Set<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current !== 'object' || current === null || visited.has(current)) {
      continue;
    }
    visited.add(current);
    yield current;
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        pending.push(current[index]);
      }
    } else if (isCelError(current)) {
      pending.push(current.cause);
    }
  }
}

function collectUnknownAttributes(value: unknown, attributes: Set<string>) {
  for (const current of errorCauseNodes(value)) {
    if (isCelError(current) && current.message.startsWith(UNKNOWN_ERROR_PREFIX)) {
      attributes.add(current.message.slice(UNKNOWN_ERROR_PREFIX.length));
    }
  }
}

function findCostLimitError(value: unknown) {
  let limitError: CelCostLimitError | undefined;
  for (const current of errorCauseNodes(value)) {
    if (current instanceof CelCostLimitError) {
      limitError = current;
      break;
    }
  }
  return limitError;
}

function validateMaxCost(value: number) {
  if (!(Number.isSafeInteger(value) && value > 0)) {
    throw new RangeError('CEL maxCost must be a positive safe integer.');
  }
  return value;
}

export function compileCelExpression(expression: string, options: CompileCelExpressionOptions = {}) {
  const maxCost = validateMaxCost(options.maxCost ?? DEFAULT_CEL_MAX_COST);
  const parsed = parse(expression);
  if (!parsed.expr) {
    throw new Error('CEL parser returned an empty expression.');
  }

  const expr = structuredClone(parsed.expr);
  const unknownBindings = new Map<string, string>();
  replaceUnknownAttributes(expr, new Set(options.unknownAttributes), unknownBindings);

  let expressionId = maximumExpressionId(expr) + 1n;
  const nextExpressionId = () => {
    const next = expressionId;
    expressionId += 1n;
    return next;
  };
  instrumentCost(expr, nextExpressionId);

  let activeBudget: EvaluationBudget | undefined;
  const consumeCost = celFunc(COST_FUNCTION, [], CelScalar.BOOL, () => {
    if (!activeBudget) {
      throw new Error('CEL cost meter used outside an evaluation.');
    }
    activeBudget.cost += 1;
    if (activeBudget.cost > activeBudget.limit) {
      throw new CelCostLimitError(activeBudget.cost, activeBudget.limit);
    }
    return true;
  });
  const evaluate = plan(celEnv({ funcs: [consumeCost] }), expr);

  const resolvedResult: CompiledCelExpression = (bindings = {}) => {
    const budget: EvaluationBudget = { cost: 0, limit: maxCost };
    activeBudget = budget;
    try {
      const activation: Record<string, unknown> = { ...bindings };
      for (const [name, path] of unknownBindings) {
        activation[name] = celError(`${UNKNOWN_ERROR_PREFIX}${path}`);
      }

      const result = evaluate(activation as never);
      if (!isCelError(result)) {
        return { cost: budget.cost, kind: 'value', value: result };
      }

      const costError = findCostLimitError(result);
      if (costError) {
        return {
          cost: costError.cost,
          kind: 'cost-exceeded',
          limit: costError.limit,
        };
      }

      const attributes = new Set<string>();
      collectUnknownAttributes(result, attributes);
      if (attributes.size > 0) {
        return {
          attributes: [...attributes].sort((left, right) => (left < right ? -1 : Number(left > right))),
          cost: budget.cost,
          kind: 'unknown',
        };
      }

      return { cost: budget.cost, error: result, kind: 'error' };
    } catch (error) {
      return { cost: budget.cost, error: celError(error), kind: 'error' };
    } finally {
      activeBudget = undefined;
    }
  };
  return resolvedResult;
}
