export function formatSubmittedValue(value: Record<string, unknown>) {
  return JSON.stringify(
    value,
    (_key, nestedValue: unknown) => {
      if (typeof nestedValue === 'bigint') {
        return nestedValue.toString();
      }
      if (nestedValue instanceof Uint8Array) {
        return [...nestedValue];
      }
      return nestedValue;
    },
    2
  );
}
