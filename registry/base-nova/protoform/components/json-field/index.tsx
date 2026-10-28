'use client';

import { Braces, FileEdit, SpellCheck, Trash2 } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { CopyButton } from '@/components/ui/copy-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const JSONCodeEditor = React.lazy(() =>
  import('./json-code-editor').then((module) => ({ default: module.JSONCodeEditor }))
);

function isJsonValue(value: unknown): value is JSONValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return typeof value === 'object' && Object.values(value).every(isJsonValue);
}

function parseJson(source: string): JSONValue {
  const value: unknown = JSON.parse(source);
  if (!isJsonValue(value)) {
    throw new TypeError('Invalid JSON value');
  }
  return value;
}

const TRAILING_S_REGEX = /s$/u;

function jsonEditorLabel(propertyName: string | undefined, path: string[]): string {
  const name = propertyName ?? path.at(-1) ?? 'value';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} JSON`;
}

interface CustomFieldConfig {
  fieldName: string;
  onCreateOption?: (
    newValue: string,
    path: string[],
    handleFieldChange: (path: string[], value: JSONValue) => void
  ) => Promise<void>;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const EMPTY_CUSTOM_FIELDS: CustomFieldConfig[] = [];

type JSONFieldProps = {
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

const SIMPLE_JSON_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'null']);

function getJSONProperty(value: JSONValue, key: string): JSONValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value[key] : undefined;
}

function withJSONDefault(value: JSONValue, fallback: JSONValue): JSONValue {
  if (value === undefined) {
    return fallback;
  }
  return value;
}

const isTypeSupported = (type: JSONSchemaType['type'], supportedTypes: ReadonlySet<string>): boolean => {
  if (Array.isArray(type)) {
    return type.every((t) => supportedTypes.has(t));
  }
  return typeof type === 'string' && supportedTypes.has(type);
};

const isSimpleObject = (schema: JSONSchemaType): boolean => {
  if (schema.type !== undefined && isTypeSupported(schema.type, SIMPLE_JSON_TYPES)) {
    return true;
  }
  if (schema.type === 'object') {
    return schema.properties !== undefined && Object.keys(schema.properties).length > 0;
  }
  if (schema.type === 'array') {
    return Boolean(schema.items);
  }
  return false;
};

function getStringInputType(format: string | undefined) {
  switch (format) {
    case 'email':
      return 'email';
    case 'uri':
      return 'url';
    case 'date':
      return 'date';
    case 'date-time':
      return 'datetime-local';
    default:
      return 'text';
  }
}

const getArrayItemDefault = (schema: JSONSchemaType): JSONValue => {
  if ('default' in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'null':
      return null;
    default:
      return null;
  }
};

const generateExampleData = (schema: JSONSchemaType): JSONValue => {
  if ('default' in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string': {
      const example = schema.examples?.[0];
      const hasExample = Boolean(example);
      return hasExample ? example : '';
    }
    case 'number':
    case 'integer': {
      const example = schema.examples?.[0];
      const hasExample = Boolean(example);
      return hasExample ? example : 42;
    }
    case 'boolean':
      return true;
    case 'array':
      if (schema.items) {
        return [generateExampleData(schema.items)];
      }
      return [];
    case 'object':
      if (schema.properties) {
        const result: Record<string, JSONValue> = {};
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          result[key] = generateExampleData(propSchema);
        }
        return result;
      }
      return {};
    case 'null':
      return null;
    default:
      return null;
  }
};

const hasEmptyValues = (value: JSONValue, schema: JSONSchemaType): boolean => {
  if (value === undefined) {
    return true;
  }

  if (schema.type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, JSONValue>;
    if (Object.keys(obj).length === 0) {
      return true;
    }

    if (schema.properties) {
      return Object.entries(schema.properties).every(([key, propSchema]) => {
        const val = obj[key];
        const subSchema = propSchema;

        if (val === undefined) {
          return true;
        }
        if (subSchema.type === 'string' && val === '') {
          return true;
        }
        if (subSchema.type === 'array' && Array.isArray(val) && val.length === 0) {
          return true;
        }
        if (subSchema.type === 'object' && hasEmptyValues(val, subSchema)) {
          return true;
        }

        return false;
      });
    }
  }

  if (schema.type === 'array' && Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

const JSONField = ({
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
}: JSONFieldProps) => {
  'use no memo';

  const instanceId = React.useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlId = (path: string[]) => `${instanceId}-${encodeURIComponent(JSON.stringify(path))}`;
  const controlLabel = (path: string[]) => [label, ...path].filter(Boolean).join('.') || 'Value';
  const hasValue = value !== undefined;
  const [isJSONMode, setIsJSONMode] = useState(false);
  const [jsonError, setJSONError] = useState<string>();
  const [optionError, setOptionError] = useState<string>();

  const [rawJSONValue, setRawJSONValue] = useState<string>(() => {
    let initialValue: JSONValue;
    if (showPlaceholder === true && hasEmptyValues(value, schema)) {
      initialValue = generateExampleData(schema);
    } else if (hasValue) {
      initialValue = value;
    } else {
      initialValue = schema.type === 'array' ? [] : {};
    }
    return JSON.stringify(initialValue, null, 2);
  });

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
      let displayValue: JSONValue;
      if (showPlaceholder === true && hasEmptyValues(value, schema)) {
        displayValue = generateExampleData(schema);
      } else if (hasValue) {
        displayValue = value;
      } else {
        displayValue = schema.type === 'array' ? [] : {};
      }
      setRawJSONValue(JSON.stringify(displayValue, null, 2));
    },
    [value, schema, showPlaceholder, hasValue]
  );

  const handleSwitchToFormMode = () => {
    const invalidEditor = Array.from(containerRef.current?.querySelectorAll('textarea') ?? []).find(
      (textarea) => !textarea.checkValidity()
    );
    if (invalidEditor) {
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
      let displayValue: JSONValue;
      if (showPlaceholder === true && hasEmptyValues(value, schema)) {
        displayValue = generateExampleData(schema);
      } else if (hasValue) {
        displayValue = value;
      } else {
        displayValue = schema.type === 'array' ? [] : {};
      }
      setRawJSONValue(JSON.stringify(displayValue, null, 2));
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
        if (customFieldConfig) {
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
            <Combobox
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
          )
        ) {
          const oneOfOptions: ComboboxOption[] = propSchema.oneOf.map((option) => ({
            label: option.title,
            value: option.const,
          }));

          return (
            <Combobox
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
            <Combobox
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
            value={typeof currentValue === 'number' ? currentValue.toString() : ''}
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
            value={typeof currentValue === 'number' ? currentValue.toString() : ''}
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
              label={jsonEditorLabel(propertyName, path)}
              onChange={(parsed) => handleFieldChange(path, parsed)}
              value={JSON.stringify(withJSONDefault(currentValue, {}), null, 2)}
            />
          );
        }

        const requiredFields = new Set(propSchema.required);

        return (
          <div className="space-y-2 p-3">
            {Object.entries(propSchema.properties).map(([key, subSchema]) => (
              <div key={key}>
                <div className="mb-1 flex items-center gap-2">
                  <Label htmlFor={controlId([...path, key])} variant="strong">
                    {key}
                    {requiredFields.has(key) && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  <Badge size="sm" variant="outline">
                    {subSchema.type ?? 'unknown'}
                  </Badge>
                </div>
                {renderFormFields(
                  subSchema,
                  getJSONProperty(currentValue, key),
                  [...path, key],
                  depth + 1,
                  propSchema,
                  key
                )}
              </div>
            ))}
          </div>
        );
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
          return (
            <div className="space-y-4">
              {propSchema.description !== undefined && propSchema.description !== '' ? (
                <Text className="text-muted-foreground" variant="small">
                  {propSchema.description}
                </Text>
              ) : null}

              <div className="space-y-4">
                {arrayValue.map((item, index) => {
                  const itemTypeName =
                    [itemSchema?.title, itemSchema?.description, propertyName?.replace(TRAILING_S_REGEX, '')].find(
                      Boolean
                    ) ?? 'Item';
                  const itemDisplayName = itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1);

                  return (
                    <div className="rounded-lg border border-border bg-card p-4" key={index}>
                      <div className="mb-3 flex items-center justify-between">
                        <Heading className="text-sm" level={4}>
                          {itemDisplayName} #{index + 1}
                        </Heading>
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
                      </div>
                      <div className="space-y-3">
                        {itemSchema?.type === 'object' && itemSchema.properties
                          ? Object.entries(itemSchema.properties).map(([key, subSchema]) => (
                              <div className="space-y-1" key={key}>
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={controlId([...path, String(index), key])} variant="strong">
                                    {key}
                                  </Label>
                                  <Badge size="sm" variant="outline">
                                    {subSchema.type ?? 'unknown'}
                                  </Badge>
                                  {requiredItemFields.has(key) && <span className="ml-1 text-destructive">*</span>}
                                </div>
                                {renderFormFields(
                                  subSchema,
                                  getJSONProperty(item, key),
                                  [...path, index.toString(), key],
                                  depth + 1,
                                  itemSchema,
                                  key
                                )}
                              </div>
                            ))
                          : renderFormFields(itemSchema, item, [...path, index.toString()], depth + 1)}
                      </div>
                    </div>
                  );
                })}
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
                  {[itemSchema?.title, itemSchema?.description, propertyName?.replace(TRAILING_S_REGEX, '')].find(
                    Boolean
                  ) ?? 'Item'}
                </Button>
              </div>
            </div>
          );
        }

        return (
          <JSONEditor
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

  const shouldUseJSONMode =
    (schema.type === 'object' && (!schema.properties || Object.keys(schema.properties).length === 0)) ||
    (schema.type === 'array' && !schema.items);

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
                toast.add({
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
};

interface JSONEditorProps {
  error?: string | undefined;
  id?: string | undefined;
  label: string;
  onChange: (value: JSONValue) => void;
  onDraftChange?: (value: string) => void;
  value: string;
}

const JSONEditor = ({ value, onChange, error: externalError, label, onDraftChange, id }: JSONEditorProps) => {
  'use no memo';

  const [editorContent, setEditorContent] = useState(value);
  const [internalError, setInternalError] = useState<string>();
  const generatedId = React.useId();
  const editorId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPublishedText = useRef<string | undefined>(undefined);
  const previousValue = useRef(value);

  useEffect(
    function synchronizeEditor() {
      if (previousValue.current === value) {
        return;
      }
      previousValue.current = value;
      if (value !== lastPublishedText.current && value !== editorContent) {
        setEditorContent(value);
        setInternalError(undefined);
      }
      lastPublishedText.current = undefined;
    },
    [value, editorContent]
  );

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    onDraftChange?.(newContent);
    let parsed: JSONValue;
    try {
      parsed = parseJson(newContent);
    } catch (error) {
      setInternalError(`Invalid JSON. ${error instanceof Error ? error.message : 'Check the syntax.'}`);
      return;
    }
    lastPublishedText.current = JSON.stringify(parsed, null, 2);
    setInternalError(undefined);
    onChange(parsed);
  };

  const displayError = internalError ?? externalError;
  const errorId = `${editorId}-error`;
  const focusEditor = () => containerRef.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus();

  useLayoutEffect(
    function synchronizeTextareaValidity() {
      const textarea = containerRef.current?.querySelector('textarea');
      if (!textarea) {
        return;
      }
      textarea.setCustomValidity(displayError ?? '');
      if (displayError) {
        textarea.setAttribute('aria-invalid', 'true');
        textarea.setAttribute('aria-describedby', errorId);
      } else {
        textarea.removeAttribute('aria-invalid');
        textarea.removeAttribute('aria-describedby');
      }
    },
    [displayError, errorId]
  );

  return (
    <div className="relative" ref={containerRef}>
      <label className="sr-only" htmlFor={editorId}>
        {label}
      </label>
      <div
        className={cn(
          'rounded-md border',
          displayError !== undefined && displayError !== '' ? 'border-destructive' : 'border-border'
        )}
      >
        <Textarea
          aria-hidden="true"
          className="sr-only"
          id={editorId}
          onChange={(event) => handleEditorChange(event.currentTarget.value)}
          onFocus={focusEditor}
          onInvalid={(event) => {
            event.preventDefault();
            focusEditor();
          }}
          tabIndex={-1}
          value={editorContent}
        />
        <React.Suspense
          fallback={
            <div className="min-h-25 p-2.5">
              <Text role="status" variant="small">
                Loading JSON editor…
              </Text>
            </div>
          }
        >
          <JSONCodeEditor
            error={displayError}
            errorId={errorId}
            id={editorId}
            label={label}
            onChange={handleEditorChange}
            value={editorContent}
          />
        </React.Suspense>
      </div>
      {displayError !== undefined && displayError !== '' ? (
        <Text className="mt-1 text-destructive" id={errorId} role="alert" variant="small">
          {displayError}
        </Text>
      ) : null}
    </div>
  );
};

type JSONValue = string | number | boolean | null | undefined | JSONValue[] | { [key: string]: JSONValue };

interface JSONSchemaConst {
  const: JSONValue;
  description?: string;
  title?: string;
}

interface JSONSchemaType {
  anyOf?: (JSONSchemaType | JSONSchemaConst)[];
  const?: JSONValue;
  default?: JSONValue;
  description?: string;
  enum?: string[];
  examples?: JSONValue[];
  format?: string;
  items?: JSONSchemaType;
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  oneOf?: (JSONSchemaType | JSONSchemaConst)[];
  pattern?: string;
  properties?: Record<string, JSONSchemaType>;
  required?: string[];
  title?: string;
  type?:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'
    | ('string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null')[];
}

interface JSONObject {
  [key: string]: JSONValue;
}

function updateValueAtPath(obj: JSONValue, path: string[], value: JSONValue): JSONValue {
  if (path.length === 0) {
    return value;
  }

  let mutableObj = obj;
  if (obj === null || obj === undefined) {
    mutableObj = Number.isNaN(Number(path[0])) ? {} : [];
  }

  if (Array.isArray(mutableObj)) {
    return updateArray(mutableObj, path, value);
  }
  if (typeof mutableObj === 'object' && mutableObj !== null) {
    return updateObject(mutableObj, path, value);
  }
  return mutableObj;
}

function updateArray(array: JSONValue[], path: string[], value: JSONValue): JSONValue[] {
  const [index, ...restPath] = path;
  const arrayIndex = Number(index);

  if (Number.isNaN(arrayIndex)) {
    return array;
  }

  if (arrayIndex < 0) {
    return array;
  }

  let newArray: JSONValue[] = [];
  for (let i = 0; i < array.length; i += 1) {
    newArray[i] = i in array ? array[i] : null;
  }

  if (arrayIndex >= newArray.length) {
    const extendedArray: JSONValue[] = Array.from({ length: arrayIndex }, () => null);
    for (let i = 0; i < newArray.length; i += 1) {
      extendedArray[i] = newArray[i];
    }
    newArray = extendedArray;
  }

  newArray[arrayIndex] = restPath.length === 0 ? value : updateValueAtPath(newArray[arrayIndex], restPath, value);
  return newArray;
}

function updateObject(obj: JSONObject, path: string[], value: JSONValue): JSONObject {
  const [key, ...restPath] = path;

  if (typeof key !== 'string') {
    return obj;
  }

  const newObj = { ...obj };

  if (restPath.length === 0) {
    newObj[key] = value;
  } else {
    if (!(key in newObj)) {
      newObj[key] = {};
    }
    newObj[key] = updateValueAtPath(newObj[key], restPath, value);
  }
  return newObj;
}

export type { CustomFieldConfig, JSONObject, JSONSchemaConst, JSONSchemaType, JSONValue };
export { JSONField };
