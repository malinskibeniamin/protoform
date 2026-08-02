export type ShadcnComponentCoverageKind = 'field-control' | 'field-composition' | 'form-shell' | 'display-only';

export type ShadcnComponentCoverage = {
  component: string;
  kind: ShadcnComponentCoverageKind;
  autoFormRole: string;
  protoAnnotation?: string;
};

export type ShadcnAutoFormControl = {
  control: string;
  shadcnComponent: string;
  protoAnnotation: string;
  bestFor: string;
};

export const shadcnAutoFormControls: ShadcnAutoFormControl[] = [
  {
    bestFor: 'Short strings and scalar values',
    control: 'text',
    protoAnnotation: 'CONTROL_TYPE_TEXT',
    shadcnComponent: 'Input',
  },
  {
    bestFor: 'Long strings, descriptions, prompts, and policy text',
    control: 'textarea',
    protoAnnotation: 'CONTROL_TYPE_TEXTAREA',
    shadcnComponent: 'Textarea',
  },
  {
    bestFor: 'Secrets and masked values',
    control: 'password',
    protoAnnotation: 'CONTROL_TYPE_PASSWORD',
    shadcnComponent: 'Input[type=password]',
  },
  {
    bestFor: 'Email addresses',
    control: 'email',
    protoAnnotation: 'CONTROL_TYPE_EMAIL',
    shadcnComponent: 'Input[type=email]',
  },
  {
    bestFor: 'URLs and endpoints',
    control: 'url',
    protoAnnotation: 'CONTROL_TYPE_URL',
    shadcnComponent: 'Input[type=url]',
  },
  {
    bestFor: 'Currency-like numeric input',
    control: 'currency',
    protoAnnotation: 'CONTROL_TYPE_CURRENCY',
    shadcnComponent: 'InputGroup + Input',
  },
  {
    bestFor: 'Required boolean acknowledgement',
    control: 'checkbox',
    protoAnnotation: 'CONTROL_TYPE_CHECKBOX',
    shadcnComponent: 'Checkbox',
  },
  {
    bestFor: 'Boolean feature flags',
    control: 'switch',
    protoAnnotation: 'CONTROL_TYPE_SWITCH',
    shadcnComponent: 'Switch',
  },
  {
    bestFor: 'Compact boolean toggles',
    control: 'toggle',
    protoAnnotation: 'CONTROL_TYPE_TOGGLE',
    shadcnComponent: 'Toggle',
  },
  {
    bestFor: 'Small enum sets where all options should be visible',
    control: 'radio',
    protoAnnotation: 'CONTROL_TYPE_RADIO_GROUP',
    shadcnComponent: 'RadioGroup',
  },
  {
    bestFor: 'Enum or provider-backed single select',
    control: 'select',
    protoAnnotation: 'CONTROL_TYPE_SELECT',
    shadcnComponent: 'Select',
  },
  {
    bestFor: 'Searchable single select',
    control: 'combobox',
    protoAnnotation: 'CONTROL_TYPE_COMBOBOX',
    shadcnComponent: 'Command + Popover',
  },
  {
    bestFor: 'Repeated enum/string choices',
    control: 'multiselect',
    protoAnnotation: 'CONTROL_TYPE_MULTI_SELECT',
    shadcnComponent: 'Command + Badge + Popover',
  },
  {
    bestFor: 'Maps and repeated key/value pairs',
    control: 'keyValue',
    protoAnnotation: 'CONTROL_TYPE_KEY_VALUE',
    shadcnComponent: 'KeyValueField',
  },
  {
    bestFor: 'Struct, Value, Any, or arbitrary object payloads',
    control: 'json',
    protoAnnotation: 'CONTROL_TYPE_JSON',
    shadcnComponent: 'JsonField',
  },
  {
    bestFor: 'Dates and timestamps',
    control: 'date',
    protoAnnotation: 'CONTROL_TYPE_DATE / CONTROL_TYPE_TIMESTAMP',
    shadcnComponent: 'Calendar + Popover',
  },
  {
    bestFor: 'Bounded numeric ranges',
    control: 'slider',
    protoAnnotation: 'CONTROL_TYPE_SLIDER',
    shadcnComponent: 'Slider + Input',
  },
];

export const shadcnComponentCoverage: ShadcnComponentCoverage[] = [
  { autoFormRole: 'Root validation and destructive form state', component: 'Alert', kind: 'form-shell' },
  { autoFormRole: 'Enum selected values and multi-select chips', component: 'Badge', kind: 'field-composition' },
  { autoFormRole: 'Submit, array add/remove, and custom slot actions', component: 'Button', kind: 'field-composition' },
  { autoFormRole: 'Date and timestamp picker surface', component: 'Calendar', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_DATE / CONTROL_TYPE_TIMESTAMP' },
  { autoFormRole: 'Grouped examples, summaries, and docs demos', component: 'Card', kind: 'display-only' },
  { autoFormRole: 'Boolean fields', component: 'Checkbox', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_CHECKBOX' },
  { autoFormRole: 'Radio-like visual choices via fieldRegistry', component: 'Choicebox', kind: 'field-control' },
  { autoFormRole: 'Nested disclosure via fieldRegistry slots', component: 'Collapsible', kind: 'field-composition' },
  { autoFormRole: 'Searchable selects', component: 'Combobox', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_COMBOBOX' },
  { autoFormRole: 'Combobox and multi-select command surface', component: 'Command', kind: 'field-composition' },
  { autoFormRole: 'Copyable examples and generated payloads', component: 'CopyButton', kind: 'display-only' },
  { autoFormRole: 'Custom modal flows through AutoFormSlot', component: 'Dialog', kind: 'field-composition' },
  { autoFormRole: 'React Hook Form field primitives', component: 'Field', kind: 'form-shell' },
  { autoFormRole: 'Label, description, and error grouping', component: 'Group', kind: 'form-shell' },
  { autoFormRole: 'Text, email, URL, password, and numeric scalars', component: 'Input', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_TEXT / EMAIL / URL / PASSWORD / CURRENCY' },
  { autoFormRole: 'Currency, date, suffix, and prefix affordances', component: 'InputGroup', kind: 'field-composition' },
  { autoFormRole: 'Struct, Value, Any, and raw payload fields', component: 'JsonField', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_JSON' },
  { autoFormRole: 'Map and repeated key/value fields', component: 'KeyValueField', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_KEY_VALUE' },
  { autoFormRole: 'Accessible field names and required state', component: 'Label', kind: 'form-shell' },
  { autoFormRole: 'Repeated enum/string choices', component: 'MultiSelect', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_MULTI_SELECT' },
  { autoFormRole: 'Date pickers, comboboxes, and field help', component: 'Popover', kind: 'field-composition' },
  { autoFormRole: 'Enum fields where every option should stay visible', component: 'RadioGroup', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_RADIO_GROUP' },
  { autoFormRole: 'Single enum/provider-backed values', component: 'Select', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_SELECT' },
  { autoFormRole: 'Visual separation in demos and custom slots', component: 'Separator', kind: 'display-only' },
  { autoFormRole: 'Bounded numeric ranges', component: 'Slider', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_SLIDER' },
  { autoFormRole: 'Loading async data providers', component: 'Spinner', kind: 'form-shell' },
  { autoFormRole: 'Feature flags and boolean toggles', component: 'Switch', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_SWITCH' },
  { autoFormRole: 'JSON/simple/advanced form mode tabs', component: 'Tabs', kind: 'form-shell' },
  { autoFormRole: 'Tag entry through fieldRegistry', component: 'Tags', kind: 'field-control' },
  { autoFormRole: 'Long string fields', component: 'Textarea', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_TEXTAREA' },
  { autoFormRole: 'Compact boolean choices', component: 'Toggle', kind: 'field-control', protoAnnotation: 'CONTROL_TYPE_TOGGLE' },
  { autoFormRole: 'Grouped compact choices through fieldRegistry', component: 'ToggleGroup', kind: 'field-control' },
  { autoFormRole: 'Help text and annotation docs URLs', component: 'Tooltip', kind: 'form-shell' },
  { autoFormRole: 'Headings, captions, and helper text', component: 'Typography', kind: 'form-shell' },
];
