'use client';

import React from 'react';
import { useAutoForm } from '../context';
import type { ParsedField } from '../core-types';
import { defaultRegistry } from '../fields';
import { getFieldUiConfig, resolveRenderFieldType } from '../helpers';
import { buildFieldMatchContext, type FieldTypeRegistry } from '../registry';
import type { AutoFormSlotProps } from '../slot';
import { ArrayFieldRenderer } from './array';
import { ControlledFieldRenderer } from './controlled';
import { MapFieldRenderer } from './map';
import { NestedFieldRendererContext } from './nested';
import { ObjectFieldRenderer } from './object';
import { OneofFieldRenderer } from './oneof';
import { isFieldHidden } from './shared';

function resolveFieldType(field: ParsedField, registry: FieldTypeRegistry<string>): string {
  const explicitControl = getFieldUiConfig(field).control;
  if (explicitControl !== undefined && explicitControl !== '') {
    return explicitControl;
  }

  const matchContext = buildFieldMatchContext(field);
  const resolved = registry.resolve(field, matchContext);
  return resolved?.name ?? resolveRenderFieldType(field);
}

export function AutoFormFieldRenderer({
  field,
  path,
  inheritedDisabled = false,
  registry,
}: {
  field: ParsedField;
  path: string[];
  inheritedDisabled?: boolean | undefined;
  registry?: FieldTypeRegistry<string> | undefined;
}) {
  return (
    <NestedFieldRendererContext.Provider value={AutoFormFieldRenderer}>
      <ResolvedFieldRenderer field={field} inheritedDisabled={inheritedDisabled} path={path} registry={registry} />
    </NestedFieldRendererContext.Provider>
  );
}

function ResolvedFieldRenderer({
  field,
  path,
  inheritedDisabled,
  registry,
}: {
  field: ParsedField;
  path: string[];
  inheritedDisabled: boolean;
  registry: FieldTypeRegistry<string> | undefined;
}) {
  const { fieldRegistry } = useAutoForm();
  const activeRegistry = registry ?? fieldRegistry ?? defaultRegistry;
  const renderType = resolveFieldType(field, activeRegistry);

  if ((field.type === 'array' || field.type === 'map' || field.type === 'object') && renderType !== field.type) {
    return (
      <ControlledFieldRenderer
        field={field}
        inheritedDisabled={inheritedDisabled}
        path={path}
        renderType={renderType}
      />
    );
  }

  switch (field.type) {
    case 'object':
      return <ObjectFieldRenderer field={field} inheritedDisabled={inheritedDisabled} path={path} />;
    case 'array':
      return <ArrayFieldRenderer field={field} inheritedDisabled={inheritedDisabled} path={path} />;
    case 'map':
      return <MapFieldRenderer field={field} inheritedDisabled={inheritedDisabled} path={path} />;
    case 'oneof':
      return <OneofFieldRenderer field={field} inheritedDisabled={inheritedDisabled} path={path} />;
    default:
      return (
        <ControlledFieldRenderer
          field={field}
          inheritedDisabled={inheritedDisabled}
          path={path}
          renderType={renderType}
        />
      );
  }
}

interface SlotEntry {
  after?: string | undefined;
  before?: string | undefined;
  content: React.ReactNode;
  key: React.Key;
}

function extractSlots(children: React.ReactNode): {
  slots: SlotEntry[];
  other: { content: React.ReactNode; key: React.Key }[];
} {
  const slots: SlotEntry[] = [];
  const other: { content: React.ReactNode; key: React.Key }[] = [];

  for (const child of React.Children.toArray(children)) {
    if (React.isValidElement(child) && (child.type as { displayName?: string }).displayName === 'AutoFormSlot') {
      const props = child.props as AutoFormSlotProps;
      slots.push({
        after: props.after,
        before: props.before,
        content: props.children,
        key: child.key ?? slots.length,
      });
    } else if (React.isValidElement(child)) {
      other.push({ content: child, key: child.key ?? other.length });
    } else {
      other.push({ content: child, key: `text-${other.length}` });
    }
  }

  return { other, slots };
}

export function AutoFormFields({ fields, children }: { fields: ParsedField[]; children?: React.ReactNode }) {
  const { deprecatedFields, fieldRegistry } = useAutoForm();
  const { slots, other } = React.useMemo(() => extractSlots(children), [children]);

  const beforeSlots = React.useMemo(() => {
    const map = new Map<string, SlotEntry[]>();
    for (const slot of slots) {
      if (slot.before !== undefined && slot.before !== '') {
        const existing = map.get(slot.before) ?? [];
        existing.push(slot);
        map.set(slot.before, existing);
      }
    }
    return map;
  }, [slots]);

  const afterSlots = React.useMemo(() => {
    const map = new Map<string, SlotEntry[]>();
    for (const slot of slots) {
      if (slot.after !== undefined && slot.after !== '') {
        const existing = map.get(slot.after) ?? [];
        existing.push(slot);
        map.set(slot.after, existing);
      }
    }
    return map;
  }, [slots]);

  const topSlots = slots.filter(
    (slot) => !((slot.before !== undefined && slot.before !== '') || (slot.after !== undefined && slot.after !== ''))
  );
  const visibleFields = fields.filter((field) => !isFieldHidden(field, deprecatedFields));

  return (
    <div className="divide-y divide-border/60" data-slot="auto-form-fields">
      {topSlots.map((slot) => (
        <div className="py-7 first:pt-0 last:pb-0" key={slot.key}>
          {slot.content}
        </div>
      ))}
      {other.map((entry) => (
        <div className="py-7 first:pt-0 last:pb-0" key={entry.key}>
          {entry.content}
        </div>
      ))}
      {visibleFields.map((field) => (
        <div className="py-7 first:pt-0 last:pb-0" data-slot="auto-form-field-row" key={field.key}>
          {beforeSlots.get(field.key)?.map((slot) => (
            <React.Fragment key={slot.key}>{slot.content}</React.Fragment>
          ))}
          <AutoFormFieldRenderer field={field} path={[field.key]} registry={fieldRegistry} />
          {afterSlots.get(field.key)?.map((slot) => (
            <React.Fragment key={slot.key}>{slot.content}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
