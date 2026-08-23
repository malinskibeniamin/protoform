"use client";

import { Braces, FileEdit, SpellCheck, Trash2 } from "lucide-react";
import Prism from "prismjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import EditorModule from "react-simple-code-editor";

import { Badge } from "@/registry/base-nova/protoform/components/badge";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Combobox, type ComboboxOption } from "@/registry/base-nova/protoform/components/combobox";
import { CopyButton } from "@/registry/base-nova/protoform/components/copy-button";
import { Input } from "@/registry/base-nova/protoform/components/input";
import { toast } from "@/registry/base-nova/protoform/components/toast";
import { Heading, Text } from "@/registry/base-nova/protoform/components/typography";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

function isCommonJsEditorModule(value: unknown): value is { default: typeof EditorModule } {
  return typeof value === "object" && value !== null && "default" in value;
}

const Editor = isCommonJsEditorModule(EditorModule) ? EditorModule.default : EditorModule;

const JSON_PRISM_GRAMMAR: Prism.Grammar = {
  boolean: /\b(?:false|true)\b/u,
  comment: { greedy: true, pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/u },
  null: { alias: "keyword", pattern: /\bnull\b/u },
  number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iu,
  operator: /:/u,
  property: { greedy: true, lookbehind: true, pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/u },
  punctuation: /[{}[\],]/u,
  string: { greedy: true, lookbehind: true, pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/u },
};

function highlightJson(code: string): string {
  return Prism.highlight(code, Prism.languages["json"] ?? JSON_PRISM_GRAMMAR, "json");
}

// Regex for matching trailing 's' to create singular names
const TRAILING_S_REGEX = /s$/u;

function jsonEditorLabel(propertyName: string | undefined, path: string[]): string {
  const name = propertyName ?? path.at(-1) ?? "value";
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
  maxDepth?: number;
  showPlaceholder?: boolean;
  customFields?: CustomFieldConfig[];
  className?: string;
} & Omit<React.ComponentProps<"div">, "onChange"> &
  SharedProps;

const SIMPLE_JSON_TYPES = new Set(["string", "number", "integer", "boolean", "null"]);

function getJSONProperty(value: JSONValue, key: string): JSONValue {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value[key] : undefined;
}

const isTypeSupported = (type: JSONSchemaType["type"], supportedTypes: ReadonlySet<string>): boolean => {
  if (Array.isArray(type)) {
    return type.every((t) => supportedTypes.has(t));
  }
  return typeof type === "string" && supportedTypes.has(type);
};

const isSimpleObject = (schema: JSONSchemaType): boolean => {
  if (schema.type && isTypeSupported(schema.type, SIMPLE_JSON_TYPES)) {
    return true;
  }
  if (schema.type === "object") {
    // Allow objects with properties (even nested ones) to be considered "simple" for form rendering
    return schema.properties !== undefined && Object.keys(schema.properties).length > 0;
  }
  if (schema.type === "array") {
    // Allow arrays with defined item schemas to be considered "simple"
    return Boolean(schema.items);
  }
  return false;
};

const getArrayItemDefault = (schema: JSONSchemaType): JSONValue => {
  if ("default" in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case "string":
      return "";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    case "null":
      return null;
    default:
      return null;
  }
};

const generateExampleData = (schema: JSONSchemaType): JSONValue => {
  if ("default" in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case "string":
      return (schema.examples?.[0] as string) || "";
    case "number":
    case "integer":
      return (schema.examples?.[0] as number) || 42;
    case "boolean":
      return true;
    case "array":
      if (schema.items) {
        return [generateExampleData(schema.items as JSONSchemaType)];
      }
      return [];
    case "object":
      if (schema.properties) {
        const result: Record<string, JSONValue> = {};
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          result[key] = generateExampleData(propSchema as JSONSchemaType);
        }
        return result;
      }
      return {};
    case "null":
      return null;
    default:
      return null;
  }
};

const hasEmptyValues = (value: JSONValue, schema: JSONSchemaType): boolean => {
  if (!value) {
    return true;
  }

  if (schema.type === "object" && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, JSONValue>;
    if (Object.keys(obj).length === 0) {
      return true;
    }

    // Check if all values are empty/default
    if (schema.properties) {
      return Object.entries(schema.properties).every(([key, propSchema]) => {
        const val = obj[key];
        const subSchema = propSchema as JSONSchemaType;

        if (val === undefined || val === null) {
          return true;
        }
        if (subSchema.type === "string" && val === "") {
          return true;
        }
        if ((subSchema.type === "number" || subSchema.type === "integer") && val === 0) {
          return true;
        }
        if (subSchema.type === "boolean" && val === false) {
          return true;
        }
        if (subSchema.type === "array" && Array.isArray(val) && val.length === 0) {
          return true;
        }
        if (subSchema.type === "object" && hasEmptyValues(val, subSchema)) {
          return true;
        }

        return false;
      });
    }
  }

  if (schema.type === "array" && Array.isArray(value)) {
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
  testId,
  ref,
  ...rest
}: JSONFieldProps) => {
  "use no memo";

  const [isJSONMode, setIsJSONMode] = useState(false);
  const [jsonError, setJSONError] = useState<string>();
  const customFieldsByName = React.useMemo(
    () => new Map(customFields.map((field) => [field.fieldName, field])),
    [customFields]
  );

  // Store the raw JSON string to allow immediate feedback during typing
  // while deferring parsing until the user stops typing
  const [rawJSONValue, setRawJSONValue] = useState<string>(() => {
    // Use example data when starting with empty values and showPlaceholder is true
    let initialValue: JSONValue;
    if (showPlaceholder && hasEmptyValues(value, schema)) {
      initialValue = generateExampleData(schema);
    } else {
      initialValue = value || (schema.type === "array" ? [] : {});
    }
    return JSON.stringify(initialValue, null, 2);
  });

  // Use a ref to manage debouncing timeouts to avoid parsing JSON
  // on every keystroke which would be inefficient and error-prone
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce JSON parsing and parent updates to handle typing gracefully
  const debouncedUpdateParent = useCallback(
    (jsonString: string) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        try {
          const parsed = JSON.parse(jsonString);
          onChange(parsed);
          setJSONError(undefined);
        } catch {
          // Don't set error during normal typing
        }
      }, 300);
    },
    [onChange]
  );

  // Update rawJSONValue when value prop changes
  useEffect(
    function synchronizeAutoSelections() {
      // Use example data when the value is empty and showPlaceholder is true
      let displayValue: JSONValue;
      if (showPlaceholder && hasEmptyValues(value, schema)) {
        displayValue = generateExampleData(schema);
      } else {
        displayValue = value || (schema.type === "array" ? [] : {});
      }
      setRawJSONValue(JSON.stringify(displayValue, null, 2));
    },
    [value, schema, showPlaceholder]
  );

  const handleSwitchToFormMode = () => {
    if (isJSONMode) {
      // When switching to Form mode, ensure we have valid JSON
      try {
        const parsed = JSON.parse(rawJSONValue);
        // Update the parent component's state with the parsed value
        onChange(parsed);
        // Switch to form mode
        setIsJSONMode(false);
      } catch (err) {
        setJSONError(err instanceof Error ? err.message : "Invalid JSON");
      }
    } else {
      // When switching to JSON mode, generate example data if showPlaceholder is true and current value is empty
      let displayValue: JSONValue;
      if (showPlaceholder && hasEmptyValues(value, schema)) {
        displayValue = generateExampleData(schema);
      } else {
        displayValue = value || (schema.type === "array" ? [] : {});
      }
      setRawJSONValue(JSON.stringify(displayValue, null, 2));
      setIsJSONMode(true);
    }
  };

  const formatJSON = () => {
    try {
      const jsonStr = rawJSONValue.trim();
      if (!jsonStr) {
        return;
      }
      const formatted = JSON.stringify(JSON.parse(jsonStr), null, 2);
      setRawJSONValue(formatted);
      debouncedUpdateParent(formatted);
      setJSONError(undefined);
    } catch (err) {
      setJSONError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const renderFormFields = (
    propSchema: JSONSchemaType,
    currentValue: JSONValue,
    path: string[] = [],
    depth = 0,
    parentSchema?: JSONSchemaType,
    propertyName?: string
  ): React.ReactNode => {
    if (depth >= maxDepth && (propSchema.type === "object" || propSchema.type === "array")) {
      // Render as JSON editor when max depth is reached
      return (
        <JSONEditor
          error={jsonError}
          label={jsonEditorLabel(propertyName, path)}
          onChange={(newValue) => {
            try {
              const parsed = JSON.parse(newValue);
              handleFieldChange(path, parsed);
              setJSONError(undefined);
            } catch (err) {
              setJSONError(err instanceof Error ? err.message : "Invalid JSON");
            }
          }}
          value={JSON.stringify(currentValue ?? (propSchema.type === "array" ? [] : {}), null, 2)}
        />
      );
    }

    // Check if this property is required in the parent schema
    const isRequired = parentSchema?.required?.includes(propertyName || "") ?? false;

    let fieldType = propSchema.type;
    if (Array.isArray(fieldType)) {
      // Of the possible types, find the first non-null type to determine the control to render
      fieldType = fieldType.find((t) => t !== "null") ?? fieldType[0];
    }

    switch (fieldType) {
      case "string": {
        // Check for custom field configuration
        const customFieldConfig = customFields.find((field) => field.fieldName === propertyName);
        if (customFieldConfig) {
          // Auto-select if there's only one option and no current value
          // Use the default value instead of triggering state updates during render
          const effectiveValue = (() => {
            if (customFieldConfig.options.length === 1 && !currentValue) {
              return customFieldConfig.options[0]?.value ?? "";
            }
            return currentValue as string;
          })();

          return (
            <Combobox
              creatable
              onChange={(val) => {
                if (val || isRequired) {
                  handleFieldChange(path, val);
                } else {
                  handleFieldChange(path, undefined);
                }
              }}
              onCreateOption={(newValue) => {
                if (customFieldConfig.onCreateOption) {
                  customFieldConfig.onCreateOption(newValue, path, handleFieldChange);
                } else {
                  const newOption = { label: newValue, value: newValue };
                  customFieldConfig.options.push(newOption);
                  handleFieldChange(path, newValue);
                }
              }}
              options={customFieldConfig.options}
              placeholder={customFieldConfig.placeholder || "Select an option..."}
              value={effectiveValue ?? ""}
            />
          );
        }

        if (propSchema.oneOf?.every((option) => typeof option.const === "string" && typeof option.title === "string")) {
          const oneOfOptions: ComboboxOption[] = propSchema.oneOf.map((option) => ({
            label: option.title as string,
            value: option.const as string,
          }));

          return (
            <Combobox
              creatable
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
              value={typeof currentValue === "string" ? currentValue : ""}
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
              creatable
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
              value={typeof currentValue === "string" ? currentValue : ""}
            />
          );
        }

        let inputType = "text";
        switch (propSchema.format) {
          case "email":
            inputType = "email";
            break;
          case "uri":
            inputType = "url";
            break;
          case "date":
            inputType = "date";
            break;
          case "date-time":
            inputType = "datetime-local";
            break;
          default:
            inputType = "text";
            break;
        }

        return (
          <Input
            maxLength={propSchema.maxLength}
            minLength={propSchema.minLength}
            onChange={(e) => {
              const val = e.target.value;
              // Always allow setting string values, including empty strings
              handleFieldChange(path, val);
            }}
            pattern={propSchema.pattern}
            placeholder={propSchema.description}
            required={isRequired}
            type={inputType}
            value={typeof currentValue === "string" ? currentValue : ""}
          />
        );
      }

      case "number":
        return (
          <Input
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
            value={typeof currentValue === "number" ? currentValue.toString() : ""}
          />
        );

      case "integer":
        return (
          <Input
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
            value={typeof currentValue === "number" ? currentValue.toString() : ""}
          />
        );

      case "boolean":
        return (
          <Input
            checked={typeof currentValue === "boolean" ? currentValue : false}
            className="size-4"
            onChange={(e) => handleFieldChange(path, e.target.checked)}
            required={isRequired}
            type="checkbox"
          />
        );
      case "null":
        return null;
      case "object": {
        if (!propSchema.properties) {
          return (
            <JSONEditor
              error={jsonError}
              label={jsonEditorLabel(propertyName, path)}
              onChange={(newValue) => {
                try {
                  const parsed = JSON.parse(newValue);
                  handleFieldChange(path, parsed);
                  setJSONError(undefined);
                } catch (err) {
                  setJSONError(err instanceof Error ? err.message : "Invalid JSON");
                }
              }}
              value={JSON.stringify(currentValue ?? {}, null, 2)}
            />
          );
        }

        const requiredFields = new Set(propSchema.required ?? []);

        return (
          <div className="space-y-2 p-3">
            {Object.entries(propSchema.properties).map(([key, subSchema]) => (
              <div key={key}>
                <div className="mb-1 flex items-center gap-2">
                  <Text className="text-sm" variant="label">
                    {key}
                    {requiredFields.has(key) && <span className="ml-1 text-destructive">*</span>}
                  </Text>
                  <Badge className="px-1 py-0 text-xs" variant="outline">
                    {(subSchema as JSONSchemaType).type ?? "unknown"}
                  </Badge>
                </div>
                {renderFormFields(
                  subSchema as JSONSchemaType,
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
      case "array": {
        let arrayValue = Array.isArray(currentValue) ? currentValue : [];
        if (!propSchema.items) {
          return null;
        }

        // Handle empty arrays without triggering state update during render
        if (arrayValue.length === 0) {
          const defaultValue = getArrayItemDefault(propSchema.items as JSONSchemaType);
          arrayValue = [defaultValue];
        }

        // If the array items are simple, render as form fields, otherwise use JSON editor
        if (isSimpleObject(propSchema.items)) {
          const requiredItemFields = new Set(propSchema.items.required ?? []);
          return (
            <div className="space-y-4">
              {propSchema.description ? (
                <Text className="text-muted-foreground" variant="small">
                  {propSchema.description}
                </Text>
              ) : null}

              <div className="space-y-4">
                {arrayValue.map((item, index) => {
                  // Create a contextual name for the array item
                  const itemTypeName =
                    propSchema.items?.title ||
                    propSchema.items?.description ||
                    propertyName?.replace(TRAILING_S_REGEX, "") ||
                    "Item"; // Remove trailing 's' from property name
                  const itemDisplayName = itemTypeName.charAt(0).toUpperCase() + itemTypeName.slice(1);

                  return (
                    <div className="rounded-lg border border-border bg-card p-4" key={index}>
                      <div className="mb-3 flex items-center justify-between">
                        <Heading className="text-sm" level={4}>
                          {itemDisplayName} #{index + 1}
                        </Heading>
                        <Button
                          className={arrayValue.length <= 1 ? "invisible" : ""}
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
                        {propSchema.items?.type === "object" && propSchema.items.properties
                          ? Object.entries(propSchema.items.properties).map(([key, subSchema]) => (
                              <div className="space-y-1" key={key}>
                                <div className="flex items-center gap-2">
                                  <Text className="text-sm" variant="label">
                                    {key}
                                  </Text>
                                  <Badge className="px-1 py-0 text-xs" variant="outline">
                                    {(subSchema as JSONSchemaType).type ?? "unknown"}
                                  </Badge>
                                  {requiredItemFields.has(key) && <span className="ml-1 text-destructive">*</span>}
                                </div>
                                {renderFormFields(
                                  subSchema as JSONSchemaType,
                                  getJSONProperty(item, key),
                                  [...path, index.toString(), key],
                                  depth + 1,
                                  propSchema.items,
                                  key
                                )}
                              </div>
                            ))
                          : renderFormFields(
                              propSchema.items as JSONSchemaType,
                              item,
                              [...path, index.toString()],
                              depth + 1
                            )}
                      </div>
                    </div>
                  );
                })}
                <Button
                  className="w-full"
                  onClick={() => {
                    const defaultValue = getArrayItemDefault(propSchema.items as JSONSchemaType);
                    handleFieldChange(path, [...arrayValue, defaultValue]);
                  }}
                  size="sm"
                  type="button"
                  variant="dashed"
                >
                  + Add{" "}
                  {propSchema.items?.title ||
                    propSchema.items?.description ||
                    propertyName?.replace(TRAILING_S_REGEX, "") ||
                    "Item"}
                </Button>
              </div>
            </div>
          );
        }

        // For complex arrays, fall back to JSON editor
        return (
          <JSONEditor
            error={jsonError}
            label={jsonEditorLabel(propertyName, path)}
            onChange={(newValue) => {
              try {
                const parsed = JSON.parse(newValue);
                handleFieldChange(path, parsed);
                setJSONError(undefined);
              } catch (err) {
                setJSONError(err instanceof Error ? err.message : "Invalid JSON");
              }
            }}
            value={JSON.stringify(currentValue ?? [], null, 2)}
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
    (schema.type === "object" && (!schema.properties || Object.keys(schema.properties).length === 0)) ||
    (schema.type === "array" && !schema.items);

  useEffect(() => {
    if (shouldUseJSONMode && !isJSONMode) {
      setIsJSONMode(true);
    }
  }, [shouldUseJSONMode, isJSONMode]);

  // Handle initialization of empty arrays with default values
  useEffect(() => {
    const initializeArrayDefaults = (currentSchema: JSONSchemaType, currentValue: JSONValue, path: string[] = []) => {
      if (currentSchema.type === "array" && currentSchema.items) {
        const arrayValue = Array.isArray(currentValue) ? currentValue : [];
        if (arrayValue.length === 0) {
          const defaultValue = getArrayItemDefault(currentSchema.items as JSONSchemaType);
          const newValue = updateValueAtPath(value, path, [defaultValue]);
          onChange(newValue);
        }
      } else if (currentSchema.type === "object" && currentSchema.properties) {
        for (const [key, subSchema] of Object.entries(currentSchema.properties)) {
          const subValue = getJSONProperty(currentValue, key);
          initializeArrayDefaults(subSchema as JSONSchemaType, subValue, [...path, key]);
        }
      }
    };

    // Only initialize if we have a value and are not in JSON mode
    if (value !== undefined && !isJSONMode) {
      initializeArrayDefaults(schema, value);
    }
  }, [schema, value, onChange, isJSONMode]);

  // Handle auto-selection for custom fields with single options
  useEffect(() => {
    const syncAutoSelections = (currentSchema: JSONSchemaType, currentValue: JSONValue, path: string[] = []) => {
      if (currentSchema.type === "object" && currentSchema.properties) {
        for (const [key, subSchema] of Object.entries(currentSchema.properties)) {
          const subValue = getJSONProperty(currentValue, key);
          const customFieldConfig = customFieldsByName.get(key);

          if (customFieldConfig && customFieldConfig.options.length === 1 && !subValue) {
            const autoSelectedValue = customFieldConfig.options[0]?.value ?? "";
            handleFieldChangeEffect([...path, key], autoSelectedValue);
          }

          syncAutoSelections(subSchema as JSONSchemaType, subValue, [...path, key]);
        }
      }
    };

    if (value !== undefined && !isJSONMode && customFieldsByName.size > 0) {
      syncAutoSelections(schema, value);
    }
  }, [schema, value, customFieldsByName, isJSONMode]);

  return (
    <div className={cn("space-y-4", className)} data-testid={testId} onBlur={onBlur} ref={ref} {...rest}>
      <div className="flex flex-wrap justify-end gap-2">
        {isJSONMode ? (
          <>
            <CopyButton
              content={JSON.stringify(value, null, 2)}
              onCopy={() =>
                toast.add({
                  description: "The JSON data was copied to your clipboard.",
                  title: "JSON copied",
                  type: "success",
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
          {isJSONMode ? (
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

      {isJSONMode ? (
        <JSONEditor
          error={jsonError}
          label="JSON value"
          onChange={(newValue) => {
            // Always update local state
            setRawJSONValue(newValue);

            // Use the debounced function to attempt parsing and updating parent
            debouncedUpdateParent(newValue);
          }}
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
  label: string;
  onChange: (value: string) => void;
  value: string;
}

const JSONEditor = ({ value, onChange, error: externalError, label }: JSONEditorProps) => {
  "use no memo";

  const [editorContent, setEditorContent] = useState(value || "");
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const editorId = React.useId();

  useEffect(() => {
    setEditorContent(value || "");
  }, [value]);

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    setInternalError(undefined);
    onChange(newContent);
  };

  const displayError = internalError || externalError;

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={editorId}>
        {label}
      </label>
      <div className={cn("rounded-md border", displayError ? "border-destructive" : "border-border")}>
        <Editor
          className="w-full"
          highlight={highlightJson}
          onValueChange={handleEditorChange}
          padding={10}
          style={{
            backgroundColor: "transparent",
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            minHeight: "100px",
          }}
          textareaId={editorId}
          value={editorContent}
        />
      </div>
      {displayError ? (
        <Text className="mt-1 text-destructive" variant="small">
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
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "array"
    | "object"
    | "null"
    | ("string" | "number" | "integer" | "boolean" | "array" | "object" | "null")[];
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
  if (typeof mutableObj === "object" && mutableObj !== null) {
    return updateObject(mutableObj as JSONObject, path, value);
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
    const extendedArray: JSONValue[] = new Array(arrayIndex).fill(null);
    // Copy over the existing elements (now guaranteed to be dense)
    for (let i = 0; i < newArray.length; i += 1) {
      extendedArray[i] = newArray[i];
    }
    newArray = extendedArray;
  }

  if (restPath.length === 0) {
    newArray[arrayIndex] = value;
  } else {
    newArray[arrayIndex] = updateValueAtPath(newArray[arrayIndex], restPath, value);
  }
  return newArray;
}

function updateObject(obj: JSONObject, path: string[], value: JSONValue): JSONObject {
  const [key, ...restPath] = path;

  if (typeof key !== "string") {
    return obj;
  }

  const newObj = { ...obj };

  if (restPath.length === 0) {
    newObj[key] = value;
  } else {
    // Ensure key exists
    if (!(key in newObj)) {
      newObj[key] = {};
    }
    newObj[key] = updateValueAtPath(newObj[key], restPath, value);
  }
  return newObj;
}

export type { CustomFieldConfig, JSONObject, JSONSchemaConst, JSONSchemaType, JSONValue };
export { JSONField };
