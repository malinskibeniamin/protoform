export type UIProps<T> = { [K in keyof T]: T[K] | (Pick<T, K> extends Required<Pick<T, K>> ? never : undefined) };
type DefinedProps<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};
function hasDefinedValues<T extends object>(props: T): props is T & DefinedProps<T> {
  return Reflect.ownKeys(props).every((key) => Reflect.get(props, key) !== undefined);
}
export function definedProps<T extends object>(props: T): DefinedProps<T> {
  const result = { ...props };
  for (const key of Reflect.ownKeys(result)) {
    if (Reflect.get(result, key) === undefined) {
      Reflect.deleteProperty(result, key);
    }
  }
  if (hasDefinedValues(result)) {
    return result;
  }
  throw new TypeError('Could not normalize UI properties.');
}
