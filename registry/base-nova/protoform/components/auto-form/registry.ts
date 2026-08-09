import type React from 'react';

import type { AutoFormFieldProps, ParsedField } from './core-types';
import { getLabel } from './field-utils';
import { getProtoFieldCustomData } from './proto';

export type FieldTypeDefinition<TName extends string = string> = {
  name: TName;
  match: (field: ParsedField, context: FieldMatchContext) => boolean;
  priority: number;
  component: React.ComponentType<AutoFormFieldProps>;
};

export type FieldMatchContext = {
  identity: string; // `${field.key} ${label}`.toLowerCase()
  inputType: string;
  maxLength: number;
};

export class FieldTypeRegistry<TName extends string = never> {
  private definitions: FieldTypeDefinition[] = [];

  register<const TRegisteredName extends string>(
    definition: FieldTypeDefinition<TRegisteredName>
  ): FieldTypeRegistry<TName | TRegisteredName> {
    this.definitions.push(definition);
    this.definitions.sort((a, b) => b.priority - a.priority);
    return this as FieldTypeRegistry<TName | TRegisteredName>;
  }

  resolve(field: ParsedField, context: FieldMatchContext): FieldTypeDefinition<TName> | undefined {
    return this.definitions.find((def) => def.match(field, context)) as
      | FieldTypeDefinition<TName>
      | undefined;
  }

  list(): readonly FieldTypeDefinition<TName>[] {
    return this.definitions as unknown as readonly FieldTypeDefinition<TName>[];
  }

  clone(): FieldTypeRegistry<TName> {
    const registry = new FieldTypeRegistry<TName>();
    for (const def of this.definitions) {
      registry.register(def);
    }
    return registry;
  }
}

export function buildFieldMatchContext(field: ParsedField): FieldMatchContext {
  const label = String(field.fieldConfig?.label ?? getLabel(field));
  const identity = `${field.key} ${label}`.toLowerCase();
  const inputType = String(field.fieldConfig?.inputProps?.type ?? getProtoFieldCustomData(field)?.inputType ?? '');
  const maxLength = Number(field.fieldConfig?.inputProps?.maxLength ?? 0);
  return { identity, inputType, maxLength };
}
