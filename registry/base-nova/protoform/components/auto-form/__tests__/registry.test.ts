import { describe, expect } from "@rstest/core";

import type { AutoFormFieldProps, ParsedField } from "../core-types";
import { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from "../registry";

const MockComponent = (() => null) as unknown as React.ComponentType<AutoFormFieldProps>;

function makeDef(
  name: string,
  priority: number,
  matchFn: (field: ParsedField, ctx: FieldMatchContext) => boolean
): FieldTypeDefinition {
  return { component: MockComponent, match: matchFn, name, priority };
}

const stubField = (type: string, key = "test"): ParsedField =>
  ({ key, required: false, schema: [], type }) as unknown as ParsedField;

const stubContext = (identity = "test test"): FieldMatchContext => ({
  identity,
  inputType: "",
  maxLength: 0,
});

describe("FieldTypeRegistry", () => {
  test("lists and resolves definitions by priority and clones independently", () => {
    const registry = new FieldTypeRegistry()
      .register(makeDef("alpha", 10, (f) => f.type === "string"))
      .register(makeDef("beta", 200, (f) => f.type === "string"))
      .register(makeDef("gamma", 5, () => false));

    expect(registry.list().map((d) => d.name)).toEqual(["beta", "alpha", "gamma"]);
    expect(registry.resolve(stubField("string"), stubContext())?.name).toBe("beta");
    expect(registry.resolve(stubField("number"), stubContext())).toBeUndefined();

    const original = new FieldTypeRegistry().register(makeDef("original", 10, () => true));

    const cloned = original.clone();
    cloned.register(makeDef("extra", 999, () => true));

    expect(original.list()).toHaveLength(1);
    expect(cloned.list()).toHaveLength(2);
    expect(original.list()[0]?.name).toBe("original");
  });
});
