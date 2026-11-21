import { decimalsOf, numberFormatter, parseNumber, roundTo } from '@ui-sdk/core/number';

export function createNumberTextStepper(locale: string) {
  const formatter = numberFormatter(locale, { maximumFractionDigits: 20 });
  return (text: string, delta: number): string | null => {
    const value = text.trim() === '' ? 0 : parseNumber(text, locale);
    if (value === null || !Number.isFinite(value) || !Number.isFinite(delta) || delta === 0) {
      return null;
    }
    const next = value + delta;
    return Number.isFinite(next)
      ? formatter.format(roundTo(next, Math.min(20, Math.max(decimalsOf(value), decimalsOf(delta)))))
      : null;
  };
}
