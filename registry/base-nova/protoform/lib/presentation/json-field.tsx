'use client';

import { Braces, FileEdit, SpellCheck, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  JSONArrayCardLayout,
  JSONArrayLayout,
  JSONPropertiesLayout,
  JSONPropertyLayout,
} from '@/components/ui/shared/control-layouts';
import { CopyButton } from '@/components/ui/shared/copy-button';
import { Heading, Text } from '@/components/ui/shared/typography';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';
import type { ComboboxOption, JSONFieldControls } from './json-controls';
import { JSONEditor } from './json-editor';
import type { CustomFieldConfig, JSONSchemaType, JSONValue } from './json-model';
import {
  EMPTY_CUSTOM_FIELDS,
  formatNumericValue,
  getArrayItemDefault,
  getJSONProperty,
  getStringInputType,
  initialJSONText,
  isJSONOnlySchema,
  isSimpleObject,
  jsonEditorLabel,
  parseJson,
  TRAILING_S_REGEX,
  updateValueAtPath,
  withJSONDefault,
} from './json-model';

export type JSONFieldProps = {
  schema: JSONSchemaType;
  value: JSONValue;
  onChange: (value: JSONValue) => void;
  onBlur?: () => void;
  label?: string;
  maxDepth?: number;
  showPlaceholder?: boolean;
  customFields?: CustomFieldConfig[];
  className?: string;
} & Omit<React.ComponentProps<'div'>, 'onChange'> &
  SharedProps;

function JSONField({
  controls,
  deferJSONMode = false,
  schema,
  value,
  onChange,
  onBlur,
  maxDepth = 3,
  showPlaceholder = true,
  customFields = EMPTY_CUSTOM_FIELDS,
  className,
  label,
  id,
  testId,
  ref,
  ...rest
}: JSONFieldProps & { controls: JSONFieldControls; deferJSONMode?: boolean }) {
  'use no memo';

  const { Badge, Button, Combobox: OptionCombobox, Input, Label, notify } = controls;

  const instanceId = React.useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlId = (path: string[]) => `${instanceId}-${encodeURIComponent(JSON.stringify(path))}`;
  const controlLabel = (path: string[]) => [label, ...path].filter(Boolean).join('.') || 'Value';
  const [isJSONMode, setIsJSONMode] = useState(false);
  const [jsonError, setJSONError] = useState<string | undefined>(undefined);
  const [optionError, setOptionError] = useState<string | undefined>(undefined);

  const [rawJSONValue, setRawJSONValue] = useState<string>(() => initialJSONText(value, schema, showPlaceholder));

  const lastPublishedValue = useRef(value);

  const publishValue = (parsed: JSONValue) => {
    lastPublishedValue.current = parsed;
    onChange(parsed);
    setJSONError(undefined);
  };

  useEffect(
    function synchronizeExternalValue() {
      if (Object.is(value, lastPublishedValue.current)) {
        return;
      }
      lastPublishedValue.current = value;
      setJSONError(undefined);
      setRawJSONValue(initialJSONText(value, schema, showPlaceholder));
    },
    [value, schema, showPlaceholder]
  );

  const handleSwitchToFormMode = () => {
    const invalidEditor = Array.from(containerRef.current?.querySelectorAll('textarea') ?? []).find(
      (textarea) => !textarea.checkValidity()
    );
    if (invalidEditor !== undefined) {
      invalidEditor.reportValidity();
      return;
    }
    if (isJSONMode === true) {
      let parsed: JSONValue;
      try {
        parsed = parseJson(rawJSONValue);
      } catch (error) {
        setJSONError(error instanceof Error ? error.message : 'Invalid JSON');
        return;
      }
      publishValue(parsed);
      setIsJSONMode(false);
    } else {
      setRawJSONValue(initialJSONText(value, schema, showPlaceholder));
      setIsJSONMode(true);
    }
  };

  const formatJSON = () => {
    let parsed: JSONValue;
    try {
      const jsonStr = rawJSONValue.trim();
      if (!jsonStr) {
        return;
      }
      parsed = parseJson(jsonStr);
    } catch (error) {
      setJSONError(error instanceof Error ? error.message : 'Invalid JSON');
      return;
    }
    setRawJSONValue(JSON.stringify(parsed, null, 2));
    publishValue(parsed);
  };

  const renderFormFields = (
    propSchema: JSONSchemaType,
    currentValue: JSONValue,
    path: string[] = [],
    depth = 0,
    parentSchema?: JSONSchemaType,
    propertyName?: string
  ): React.ReactNode => {
    if (depth >= maxDepth && (propSchema.type === 'object' || propSchema.type === 'array')) {
      const emptyValue = propSchema.type === 'array' ? [] : {};
      return (
        <JSONEditor
          controls={controls}
          label={jsonEditorLabel(propertyName, path)}
          onChange={(parsed) => handleFieldChange(path, parsed)}
          value={JSON.stringify(withJSONDefault(currentValue, emptyValue), null, 2)}
        />
      );
    }

    const isRequired = parentSchema?.required?.includes(propertyName ?? '') ?? false;

    let fieldType = propSchema.type;
    if (Array.isArray(fieldType)) {
      fieldType = fieldType.find((t) => t !== 'null') ?? fieldType[0];
    }

    switch (fieldType) {
      case 'string': {
        const customFieldConfig = customFields.find((field) => field.fieldName === propertyName);
        if (customFieldConfig !== undefined) {
          const effectiveValue = (() => {
            if (
              customFieldConfig.options.length === 1 &&
              !(currentValue !== undefined && currentValue !== null && Boolean(currentValue))
            ) {
              return customFieldConfig.options[0]?.value ?? '';
            }
            return typeof currentValue === 'string' ? currentValue : '';
          })();

          return (
            <OptionCombobox
              aria-label={controlLabel(path)}
              creatable
              id={controlId(path)}
              onChange={(val) => {
                if (val || isRequired) {
                  handleFieldChange(path, val);
                } else {
                  handleFieldChange(path, undefined);
                }
              }}
              onCreateOption={(newValue) => {
                if (customFieldConfig.onCreateOption) {
                  customFieldConfig
                    .onCreateOption(newValue, path, handleFieldChange)
                    .then(() => setOptionError(undefined))
                    .catch((error: unknown) => {
                      setOptionError(error instanceof Error ? error.message : 'Could not create the option.');
                    });
                } else {
                  const newOption = { label: newValue, value: newValue };
                  customFieldConfig.options.push(newOption);
                  handleFieldChange(path, newValue);
                }
              }}
              options={customFieldConfig.options}
              placeholder={customFieldConfig.placeholder || 'Select an option...'}
              value={effectiveValue ?? ''}
            />
          );
        }

        if (
          propSchema.oneOf?.every(
            (option): option is typeof option & { const: string; title: string } =>
              typeof option.const === 'string' && typeof option.title === 'string'
          ) === true
        ) {
          const oneOfOptions: ComboboxOption[] = propSchema.oneOf.map((option) => ({
            label: option.title,
            value: option.const,
          }));

          return (
            <OptionCombobox
              aria-label={controlLabel(path)}
              creatable
              id={controlId(path)}
              onChange={(val) => {
                if (val || isRequired) {
                  handleFieldChange(path, val);
                } else {
                  handleFieldChange(path, undefined);
                }
              }}
              onCreateOption={(newValue) => {
                const newOption = { label: newValue, value: newValue };
                oneOfOptions.push(newOption);
                handleFieldChange(path, newValue);
              }}
              options={oneOfOptions}
              placeholder="Select an option…"
              value={typeof currentValue === 'string' ? currentValue : ''}
            />
          );
        }

        if (propSchema.enum) {
          const enumOptions: ComboboxOption[] = propSchema.enum.map((option) => ({
            label: option,
            value: option,
          }));

          return (
            <OptionCombobox
              aria-label={controlLabel(path)}
              creatable
              id={controlId(path)}
              onChange={(val) => {
                if (val || isRequired) {
                  handleFieldChange(path, val);
                } else {
                  handleFieldChange(path, undefined);
                }
              }}
              onCreateOption={(newValue) => {
                const newOption = { label: newValue, value: newValue };
                enumOptions.push(newOption);
                handleFieldChange(path, newValue);
              }}
              options={enumOptions}
              placeholder="Select an option…"
              value={typeof currentValue === 'string' ? currentValue : ''}
            />
          );
        }

        const inputType = getStringInputType(propSchema.format);

        return (
          <Input
            aria-label={controlLabel(path)}
            id={controlId(path)}
            maxLength={propSchema.maxLength}
            minLength={propSchema.minLength}
            onChange={(e) => {
              const val = e.target.value;
              handleFieldChange(path, val);
            }}
            pattern={propSchema.pattern}
            placeholder={propSchema.description}
            required={isRequired}
            type={inputType}
            value={typeof currentValue === 'string' ? currentValue : ''}
          />
        );
      }

      case 'number':
        return (
          <Input
            aria-label={controlLabel(path)}
            id={controlId(path)}
            max={propSchema.maximum}
            min={propSchema.minimum}
            onChange={(e) => {
              const val = e.target.value;
              if (val || isRequired) {
                const num = Number(val);
                if (!Number.isNaN(num)) {
                  handleFieldChange(path, num);
                }
              } else {
                handleFieldChange(path, undefined);
              }
            }}
            placeholder={propSchema.description}
            required={isRequired}
            type="number"
            value={typeof currentValue === 'number' ? formatNumericValue(currentValue) : ''}
          />
        );

      case 'integer':
        return (
          <Input
            aria-label={controlLabel(path)}
            id={controlId(path)}
            max={propSchema.maximum}
            min={propSchema.minimum}
            onChange={(e) => {
              const val = e.target.value;
              if (val || isRequired) {
                const num = Number(val);
                if (!Number.isNaN(num) && Number.isInteger(num)) {
                  handleFieldChange(path, num);
                }
              } else {
                handleFieldChange(path, undefined);
              }
            }}
            placeholder={propSchema.description}
            required={isRequired}
            step="1"
            type="number"
            value={typeof currentValue === 'number' ? formatNumericValue(currentValue) : ''}
          />
        );

      case 'boolean':
        return (
          <Input
            aria-label={controlLabel(path)}
            checked={typeof currentValue === 'boolean' ? currentValue : false}
            className="size-4"
            id={controlId(path)}
            onChange={(e) => handleFieldChange(path, e.target.checked)}
            required={isRequired}
            type="checkbox"
          />
        );
      case 'null':
        return null;
      case 'object': {
        if (!propSchema.properties) {
          return (
            <JSONEditor
              controls={controls}
              label={jsonEditorLabel(propertyName, path)}
              onChange={(parsed) => handleFieldChange(path, parsed)}
              value={JSON.stringify(withJSONDefault(currentValue, {}), null, 2)}
            />
          );
        }

        const requiredFields = new Set(propSchema.required);

        const fields = Object.entries(propSchema.properties).map(([key, subSchema]) => {
          const caption = (
            <>
              <Label htmlFor={controlId([...path, key])} variant="strong">
                {key}
                {requiredFields.has(key) && <span className="ml-1 text-destructive">*</span>}
              </Label>
              <Badge size="sm" variant="outline">
                {subSchema.type ?? 'unknown'}
              </Badge>
            </>
          );
          return (
            <JSONPropertyLayout caption={caption} key={key}>
              {renderFormFields(
                subSchema,
                getJSONProperty(currentValue, key),
                [...path, key],
                depth + 1,
                propSchema,
                key
              )}
            </JSONPropertyLayout>
          );
        });
        return <JSONPropertiesLayout>{fields}</JSONPropertiesLayout>;
      }
      case 'array': {
        let arrayValue = Array.isArray(currentValue) ? currentValue : [];
        const itemSchema = propSchema.items;
        if (!itemSchema) {
          return null;
        }

        if (arrayValue.length === 0) {
          const defaultValue = getArrayItemDefault(itemSchema);
          arrayValue = [defaultValue];
        }

        if (isSimpleObject(itemSchema)) {
          const requiredItemFields = new Set(itemSchema.required);
          const description =
            propSchema.description !== undefined && propSchema.description !== '' ? (
              <Text className="text-muted-foreground" variant="small">
                {propSchema.description}
              </Text>
            ) : null;
          const cards = arrayValue.map((item, index) => {
            const itemTypeName =
              [itemSchema.title, itemSchema.description, propertyName?.replace(TRAILING_S_REGEX, '')].find(Boolean) ??
              'Item';
            const itemDisplayName = itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1);
            const title = (
              <Heading className="text-sm" level={4}>
                {itemDisplayName} #{index + 1}
              </Heading>
            );
            const removeAction = (
              <Button
                aria-label={`Remove ${controlLabel([...path, String(index)])}`}
                className={arrayValue.length <= 1 ? 'invisible' : ''}
                disabled={arrayValue.length <= 1}
                onClick={() => {
                  const newArray = [...arrayValue];
                  newArray.splice(index, 1);
                  handleFieldChange(path, newArray);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Trash2 className="size-4" />
              </Button>
            );
            const fields =
              itemSchema.type === 'object' && itemSchema.properties
                ? Object.entries(itemSchema.properties).map(([key, subSchema]) => {
                    const caption = (
                      <>
                        <Label htmlFor={controlId([...path, String(index), key])} variant="strong">
                          {key}
                        </Label>
                        <Badge size="sm" variant="outline">
                          {subSchema.type ?? 'unknown'}
                        </Badge>
                        {requiredItemFields.has(key) && <span className="ml-1 text-destructive">*</span>}
                      </>
                    );
                    return (
                      <JSONPropertyLayout arrayItem caption={caption} key={key}>
                        {renderFormFields(
                          subSchema,
                          getJSONProperty(item, key),
                          [...path, index.toString(), key],
                          depth + 1,
                          itemSchema,
                          key
                        )}
                      </JSONPropertyLayout>
                    );
                  })
                : renderFormFields(itemSchema, item, [...path, index.toString()], depth + 1);
            return (
              <JSONArrayCardLayout action={removeAction} key={index} title={title}>
                {fields}
              </JSONArrayCardLayout>
            );
          });
          const addAction = (
            <Button
              className="w-full"
              onClick={() => {
                const defaultValue = getArrayItemDefault(itemSchema);
                handleFieldChange(path, [...arrayValue, defaultValue]);
              }}
              size="sm"
              type="button"
              variant="dashed"
            >
              + Add{' '}
              {[itemSchema.title, itemSchema.description, propertyName?.replace(TRAILING_S_REGEX, '')].find(Boolean) ??
                'Item'}
            </Button>
          );
          return (
            <JSONArrayLayout action={addAction} description={description}>
              {cards}
            </JSONArrayLayout>
          );
        }

        return (
          <JSONEditor
            controls={controls}
            error={jsonError}
            label={jsonEditorLabel(propertyName, path)}
            onChange={(parsed) => handleFieldChange(path, parsed)}
            value={JSON.stringify(withJSONDefault(currentValue, []), null, 2)}
          />
        );
      }
      default:
        return null;
    }
  };

  const handleFieldChange = (path: string[], fieldValue: JSONValue) => {
    if (path.length === 0) {
      onChange(fieldValue);
      return;
    }

    try {
      const newValue = updateValueAtPath(value, path, fieldValue);
      onChange(newValue);
    } catch {
      onChange(value);
    }
  };
  const handleFieldChangeEffect = React.useEffectEvent(handleFieldChange);

  const shouldUseJSONMode = isJSONOnlySchema(schema);

  if (deferJSONMode !== true && shouldUseJSONMode && isJSONMode !== true) {
    setIsJSONMode(true);
  }

  useEffect(() => {
    if (shouldUseJSONMode && isJSONMode !== true) {
      setIsJSONMode(true);
    }
  }, [shouldUseJSONMode, isJSONMode]);

  useEffect(() => {
    const initializeArrayDefaults = (currentSchema: JSONSchemaType, currentValue: JSONValue, path: string[] = []) => {
      if (currentSchema.type === 'array' && currentSchema.items) {
        const arrayValue = Array.isArray(currentValue) ? currentValue : [];
        if (arrayValue.length === 0) {
          const defaultValue = getArrayItemDefault(currentSchema.items);
          const newValue = updateValueAtPath(value, path, [defaultValue]);
          onChange(newValue);
        }
      } else if (currentSchema.type === 'object' && currentSchema.properties) {
        for (const [key, subSchema] of Object.entries(currentSchema.properties)) {
          const subValue = getJSONProperty(currentValue, key);
          initializeArrayDefaults(subSchema, subValue, [...path, key]);
        }
      }
    };

    if (value !== undefined && isJSONMode !== true) {
      initializeArrayDefaults(schema, value);
    }
  }, [schema, value, onChange, isJSONMode]);

  useEffect(
    function synchronizeCustomFields() {
      const customFieldsByName = new Map(customFields.map((field) => [field.fieldName, field]));
      const syncAutoSelections = (currentSchema: JSONSchemaType, currentValue: JSONValue, path: string[] = []) => {
        if (currentSchema.type === 'object' && currentSchema.properties) {
          for (const [key, subSchema] of Object.entries(currentSchema.properties)) {
            const subValue = getJSONProperty(currentValue, key);
            const customFieldConfig = customFieldsByName.get(key);

            if (
              customFieldConfig?.options.length === 1 &&
              !(subValue !== undefined && subValue !== null && Boolean(subValue))
            ) {
              const autoSelectedValue = customFieldConfig.options[0]?.value ?? '';
              handleFieldChangeEffect([...path, key], autoSelectedValue);
            }

            syncAutoSelections(subSchema, subValue, [...path, key]);
          }
        }
      };

      if (value !== undefined && isJSONMode !== true && customFieldsByName.size > 0) {
        syncAutoSelections(schema, value);
      }
    },
    [schema, value, customFields, isJSONMode]
  );

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid={testId}
      onBlur={onBlur}
      ref={(element) => {
        containerRef.current = element;
        if (typeof ref === 'function') {
          return ref(element);
        }
        if (ref) {
          ref.current = element;
        }
      }}
      {...rest}
    >
      <div className="flex flex-wrap justify-end gap-2">
        {isJSONMode === true ? (
          <>
            <CopyButton
              content={JSON.stringify(value, null, 2)}
              onCopy={() =>
                notify({
                  description: 'The JSON data was copied to your clipboard.',
                  title: 'JSON copied',
                  type: 'success',
                })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              Copy JSON
            </CopyButton>
            <Button onClick={formatJSON} size="sm" type="button" variant="outline">
              <SpellCheck className="size-4" />
              Format JSON
            </Button>
          </>
        ) : null}

        <Button onClick={handleSwitchToFormMode} size="sm" type="button" variant="outline">
          {isJSONMode === true ? (
            <>
              <FileEdit className="size-4" />
              Switch to Form
            </>
          ) : (
            <>
              <Braces className="size-4" />
              Switch to JSON
            </>
          )}
        </Button>
      </div>

      {isJSONMode === false && (optionError ?? jsonError) !== undefined ? (
        <Text className="text-destructive" role="alert">
          {optionError ?? jsonError}
        </Text>
      ) : null}
      {isJSONMode === true ? (
        <JSONEditor
          controls={controls}
          error={jsonError}
          id={id}
          label={label !== undefined && label !== '' ? `${label} JSON` : 'JSON value'}
          onChange={publishValue}
          onDraftChange={setRawJSONValue}
          value={rawJSONValue}
        />
      ) : (
        renderFormFields(schema, value)
      )}
    </div>
  );
}

export type { CustomFieldConfig, JSONObject, JSONSchemaConst, JSONSchemaType, JSONValue } from './json-model';
export { JSONField };
