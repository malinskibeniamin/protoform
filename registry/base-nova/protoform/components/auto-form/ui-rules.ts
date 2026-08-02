import { compileCelExpression } from './cel-runtime';
import type { AutoFormUiRule } from './types';

const CEL_CACHE_MAX_SIZE = 256;
const compiledRuleCache = new Map<
  string,
  ReturnType<typeof compileCelExpression>
>();

function getCompiledRule(expression: string) {
  const cached = compiledRuleCache.get(expression);
  if (cached) {
    return cached;
  }

  if (compiledRuleCache.size >= CEL_CACHE_MAX_SIZE) {
    const firstKey = compiledRuleCache.keys().next().value;
    if (firstKey !== undefined) {
      compiledRuleCache.delete(firstKey);
    }
  }

  const compiled = compileCelExpression(expression);
  compiledRuleCache.set(expression, compiled);
  return compiled;
}

export function evaluateUiRules(
  rules: AutoFormUiRule[] | undefined,
  context: {
    form: Record<string, unknown>;
    thisValue: unknown;
  }
): boolean {
  if (!rules?.length) {
    return true;
  }

  return rules.every((rule) => {
    try {
      const result = getCompiledRule(rule.expression)({
        form: context.form,
        this: context.thisValue,
      });
      return result.kind === 'value' && result.value === true;
    } catch {
      return false;
    }
  });
}
