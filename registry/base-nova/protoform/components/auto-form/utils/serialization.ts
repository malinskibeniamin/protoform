export function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return value !== null && typeof value === 'object' && 'then' in value;
}

export function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_key, currentValue: unknown) => {
        if (typeof currentValue === 'bigint') {
          return currentValue.toString();
        }
        if (currentValue instanceof Date) {
          return currentValue.toISOString();
        }
        return currentValue;
      },
      2
    );
  } catch {
    return '/* serialization error */';
  }
}
