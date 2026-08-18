import type { AutoFormFieldComponents } from "../core-types";
import { FieldTypeRegistry } from "../registry";
import type { FieldTypes } from "../types";
import {
  booleanFieldDefinition,
  checkboxFieldDefinition,
  switchFieldDefinition,
  ToggleFieldComponent,
} from "./boolean";
import { bytesFieldDefinition } from "./bytes";
import { choiceboxFieldDefinition } from "./choicebox";
import { comboboxFieldDefinition } from "./combobox";
import { currencyFieldDefinition } from "./currency";
import { dateFieldDefinition, timestampFieldDefinition } from "./date";
import { durationFieldDefinition } from "./duration";
import { emailFieldDefinition } from "./email";
import { MissingFieldComponent } from "./fallback";
import { fieldMaskFieldDefinition } from "./field-mask";
import { int64FieldDefinition } from "./int64";
import { jsonFieldDefinition } from "./json";
import { keyValueFieldDefinition } from "./key-value";
import { dataProviderMultiselectFieldDefinition, multiselectFieldDefinition } from "./multiselect";
import { numberFieldDefinition } from "./number";
import { passwordFieldDefinition } from "./password";
import { radioFieldDefinition } from "./radio";
import { dataProviderSelectFieldDefinition, selectFieldDefinition } from "./select";
import { sliderFieldDefinition } from "./slider";
import { stringFieldDefinition } from "./string";
import { textareaFieldDefinition } from "./textarea";
import { toggleGroupFieldDefinition } from "./toggle-group";
import { urlFieldDefinition } from "./url";

// ---------------------------------------------------------------------------
// Default registry with all built-in field types
// ---------------------------------------------------------------------------

export const defaultRegistry = new FieldTypeRegistry<FieldTypes>();

defaultRegistry
  // Data-provider-annotated fields win over every default matcher — the
  // annotation is an explicit instruction from proto, overriding the
  // string/email/etc. fallbacks.
  .register(dataProviderSelectFieldDefinition)
  // String-family (higher priority first so they match before the generic string)
  .register(passwordFieldDefinition)
  .register(emailFieldDefinition)
  .register(urlFieldDefinition)
  .register(currencyFieldDefinition)
  .register(textareaFieldDefinition)
  .register(stringFieldDefinition)

  // Number-family
  .register(sliderFieldDefinition)
  .register(numberFieldDefinition)

  // Int64
  .register(int64FieldDefinition)

  // Boolean-family
  .register(booleanFieldDefinition)
  .register(checkboxFieldDefinition)
  .register(switchFieldDefinition)

  // Date-family
  .register(dateFieldDefinition)
  .register(timestampFieldDefinition)

  // Select-family
  .register(choiceboxFieldDefinition)
  .register(toggleGroupFieldDefinition)
  .register(comboboxFieldDefinition)
  .register(radioFieldDefinition)
  .register(selectFieldDefinition)

  // Array / map
  .register(dataProviderMultiselectFieldDefinition)
  .register(multiselectFieldDefinition)
  .register(keyValueFieldDefinition)

  // Protobuf-specific
  .register(bytesFieldDefinition)
  .register(durationFieldDefinition)
  .register(fieldMaskFieldDefinition)
  .register(jsonFieldDefinition);

// ---------------------------------------------------------------------------
// Legacy map-based registry for backwards compatibility during migration
// ---------------------------------------------------------------------------

export const AutoFormFieldComponentRegistry = {
  boolean: booleanFieldDefinition.component,
  bytes: bytesFieldDefinition.component,
  checkbox: checkboxFieldDefinition.component,
  choicebox: choiceboxFieldDefinition.component,
  combobox: comboboxFieldDefinition.component,
  currency: currencyFieldDefinition.component,
  dataProviderMultiSelect: dataProviderMultiselectFieldDefinition.component,
  // Share the same component with `select` — the routing rule is
  // different (data-provider annotation vs proto enum), but the
  // component handles both via its internal provider branch.
  dataProviderSelect: dataProviderSelectFieldDefinition.component,
  date: dateFieldDefinition.component,
  "dropzone-json": jsonFieldDefinition.component,
  duration: durationFieldDefinition.component,
  email: emailFieldDefinition.component,
  fallback: MissingFieldComponent,
  fieldMask: fieldMaskFieldDefinition.component,
  int64: int64FieldDefinition.component,
  json: jsonFieldDefinition.component,
  keyValue: keyValueFieldDefinition.component,
  multiselect: multiselectFieldDefinition.component,
  number: numberFieldDefinition.component,
  password: passwordFieldDefinition.component,
  radio: radioFieldDefinition.component,
  select: selectFieldDefinition.component,
  slider: sliderFieldDefinition.component,
  string: stringFieldDefinition.component,
  switch: switchFieldDefinition.component,
  textarea: textareaFieldDefinition.component,
  timestamp: timestampFieldDefinition.component,
  toggle: ToggleFieldComponent,
  toggleGroup: toggleGroupFieldDefinition.component,
  url: urlFieldDefinition.component,
} satisfies AutoFormFieldComponents<FieldTypes>;

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { booleanFieldDefinition, checkboxFieldDefinition, switchFieldDefinition } from "./boolean";
export { bytesFieldDefinition } from "./bytes";
export { choiceboxFieldDefinition } from "./choicebox";
export { comboboxFieldDefinition } from "./combobox";
export { currencyFieldDefinition } from "./currency";
export { dateFieldDefinition, timestampFieldDefinition } from "./date";
export { durationFieldDefinition } from "./duration";
export { emailFieldDefinition } from "./email";
export { MissingFieldComponent } from "./fallback";
export { fieldMaskFieldDefinition } from "./field-mask";
export { int64FieldDefinition } from "./int64";
export { jsonFieldDefinition } from "./json";
export { keyValueFieldDefinition } from "./key-value";
export { dataProviderMultiselectFieldDefinition, multiselectFieldDefinition } from "./multiselect";
export { numberFieldDefinition } from "./number";
export { passwordFieldDefinition } from "./password";
export { radioFieldDefinition } from "./radio";
export { dataProviderSelectFieldDefinition, selectFieldDefinition } from "./select";
export { sliderFieldDefinition } from "./slider";
export { stringFieldDefinition } from "./string";
export { textareaFieldDefinition } from "./textarea";
export { toggleGroupFieldDefinition } from "./toggle-group";
export { urlFieldDefinition } from "./url";
