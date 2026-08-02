import { describe, expect, it } from 'vitest';

import type { AutoFormFieldProps, ParsedField } from '../core-types';
import { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from '../registry';

const MockComponent = (() => null) as unknown as React.ComponentType<AutoFormFieldProps>;

function makeDef(
  name: string,
  priority: number,
  matchFn: (field: ParsedField, ctx: FieldMatchContext) => boolean
): FieldTypeDefinition {
  return { name, priority, match: matchFn, component: MockComponent };
}

const stubField = (type: string, key = 'test'): ParsedField =>
  ({ type, key, required: false, schema: [] }) as unknown as ParsedField;

const stubContext = (identity = 'test test'): FieldMatchContext => ({
  identity,
  inputType: '',
  maxLength: 0,
});

describe('FieldTypeRegistry', () => {
  it('resolve() returns the highest-priority matching definition', () => {
    const registry = new FieldTypeRegistry()
      .register(makeDef('low', 10, () => true))
      .register(makeDef('high', 100, () => true));

    const result = registry.resolve(stubField('string'), stubContext());

    expect(result?.name).toBe('high');
  });

  it('resolve() returns undefined when no definition matches', () => {
    const registry = new FieldTypeRegistry().register(makeDef('never', 10, () => false));

    const result = registry.resolve(stubField('string'), stubContext());

    expect(result).toBeUndefined();
  });

  it('register() with higher priority wins over lower priority for same match', () => {
    const registry = new FieldTypeRegistry();

    registry.register(makeDef('first', 50, (f) => f.type === 'string'));
    registry.register(makeDef('second', 200, (f) => f.type === 'string'));

    const result = registry.resolve(stubField('string'), stubContext());

    expect(result?.name).toBe('second');
  });

  it('clone() produces an independent copy that does not affect the original', () => {
    const original = new FieldTypeRegistry().register(makeDef('original', 10, () => true));

    const cloned = original.clone();
    cloned.register(makeDef('extra', 999, () => true));

    expect(original.list()).toHaveLength(1);
    expect(cloned.list()).toHaveLength(2);
    expect(original.list()[0].name).toBe('original');
  });

  it('list() returns all registered definitions', () => {
    const registry = new FieldTypeRegistry()
      .register(makeDef('alpha', 10, () => false))
      .register(makeDef('beta', 20, () => false))
      .register(makeDef('gamma', 5, () => false));

    const names = registry.list().map((d) => d.name);

    expect(names).toEqual(['beta', 'alpha', 'gamma']);
    expect(registry.list()).toHaveLength(3);
  });
});
