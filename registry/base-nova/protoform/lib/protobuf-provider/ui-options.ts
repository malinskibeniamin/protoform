import { create, type DescField, type DescMessage, type DescOneof, getExtension } from '@bufbuild/protobuf';
import { FieldOptionsSchema, MessageOptionsSchema, OneofOptionsSchema } from '@bufbuild/protobuf/wkt';

import type {
  FieldUiOptions,
  MessageUiOptions,
  OneofUiOptions,
  UiRule as ProtoUiRuleMessage,
} from './gen/auto_form_ui_pb.js';
import { ControlType, DataProviderId, field_ui, message_ui, oneof_ui } from './gen/auto_form_ui_pb.js';

export interface ProtoUiRule {
  expression: string;
  id?: string | undefined;
  message?: string | undefined;
}

export interface ProtoFieldUiConfig {
  control?: string | undefined;
  dataProvider?: string | undefined;
  description?: string | undefined;
  disabledWhen?: ProtoUiRule[] | undefined;
  docsUrl?: string | undefined;
  dropzone?: boolean | undefined;
  example?: string | undefined;
  help?: string | undefined;
  placeholder?: string | undefined;
  sensitive?: boolean | undefined;
  step?: string | undefined;
  summaryLabel?: string | undefined;
  visibleWhen?: ProtoUiRule[] | undefined;
}

export interface ProtoMessageUiConfig {
  description?: string | undefined;
  secretScope?: string | undefined;
  title?: string | undefined;
}

function normalizeRule(rule: ProtoUiRuleMessage): ProtoUiRule | undefined {
  if (!rule.expression) {
    return;
  }

  return {
    expression: rule.expression,
    id: rule.id || undefined,
    message: rule.message || undefined,
  };
}

function normalizeRules(rules: ProtoUiRuleMessage[] | undefined): ProtoUiRule[] | undefined {
  if (!rules || rules.length === 0) {
    return;
  }

  const normalized: ProtoUiRule[] = [];
  for (const rule of rules) {
    const nextRule = normalizeRule(rule);
    if (nextRule) {
      normalized.push(nextRule);
    }
  }

  return normalized.length > 0 ? normalized : undefined;
}

function controlTypeToFieldType(control: ControlType): string | undefined {
  switch (control) {
    case ControlType.TEXT:
      return 'string';
    case ControlType.TEXTAREA:
      return 'textarea';
    case ControlType.PASSWORD:
      return 'password';
    case ControlType.EMAIL:
      return 'email';
    case ControlType.URL:
      return 'url';
    case ControlType.CURRENCY:
      return 'currency';
    case ControlType.CHECKBOX:
      return 'checkbox';
    case ControlType.SWITCH:
      return 'switch';
    case ControlType.TOGGLE:
      return 'toggle';
    case ControlType.RADIO_GROUP:
      return 'radio';
    case ControlType.SELECT:
      return 'select';
    case ControlType.COMBOBOX:
      return 'combobox';
    case ControlType.MULTI_SELECT:
      return 'multiselect';
    case ControlType.KEY_VALUE:
      return 'keyValue';
    case ControlType.JSON:
      return 'json';
    case ControlType.DATE:
      return 'date';
    case ControlType.TIMESTAMP:
      return 'timestamp';
    case ControlType.SLIDER:
      return 'slider';
    default:
      return;
  }
}

function dataProviderIdToKey(id: DataProviderId): string | undefined {
  if (id === DataProviderId.UNSPECIFIED) {
    return;
  }
  const name = DataProviderId[id];
  return typeof name === 'string' ? name.toLowerCase() : undefined;
}

function extractDescription(options: FieldUiOptions | OneofUiOptions): string | undefined {
  if ('description' in options) {
    const value = options.description;
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function isFieldUiEmpty(options: FieldUiOptions): boolean {
  return !(
    options.control !== ControlType.UNSPECIFIED ||
    options.placeholder ||
    options.example ||
    options.help ||
    ('description' in options && options.description) ||
    options.visibleWhen.length > 0 ||
    options.disabledWhen.length > 0 ||
    options.step ||
    options.summaryLabel ||
    options.sensitive ||
    ('dataProvider' in options && options.dataProvider !== DataProviderId.UNSPECIFIED) ||
    ('dropzone' in options && options.dropzone) ||
    ('docsUrl' in options && options.docsUrl)
  );
}

function isOneofUiEmpty(options: OneofUiOptions): boolean {
  return !(
    options.help ||
    ('description' in options && options.description) ||
    options.visibleWhen.length > 0 ||
    options.disabledWhen.length > 0 ||
    options.step ||
    options.summaryLabel
  );
}

function isMessageUiEmpty(options: MessageUiOptions): boolean {
  return !(options.secretScope || options.title || options.description);
}

export function getProtoMessageUi(desc: DescMessage): ProtoMessageUiConfig | undefined {
  const options = getExtension(desc.proto.options ?? create(MessageOptionsSchema), message_ui);
  if (isMessageUiEmpty(options)) {
    return;
  }

  return {
    description: options.description || undefined,
    secretScope: options.secretScope || undefined,
    title: options.title || undefined,
  };
}

export function getProtoFieldUi(field: DescField): ProtoFieldUiConfig | undefined {
  const options = getExtension(field.proto.options ?? create(FieldOptionsSchema), field_ui);
  if (isFieldUiEmpty(options)) {
    return;
  }

  const dataProviderKey = 'dataProvider' in options ? dataProviderIdToKey(options.dataProvider) : undefined;
  const dropzone = 'dropzone' in options && typeof options.dropzone === 'boolean' ? options.dropzone : undefined;
  const docsUrl =
    'docsUrl' in options && typeof options.docsUrl === 'string' && options.docsUrl ? options.docsUrl : undefined;

  return {
    control: controlTypeToFieldType(options.control),
    dataProvider: dataProviderKey,
    description: extractDescription(options),
    disabledWhen: normalizeRules(options.disabledWhen),
    docsUrl,
    dropzone: dropzone || undefined,
    example: options.example || undefined,
    help: options.help || undefined,
    placeholder: options.placeholder || undefined,
    sensitive: options.sensitive || options.control === ControlType.PASSWORD || undefined,
    step: options.step || undefined,
    summaryLabel: options.summaryLabel || undefined,
    visibleWhen: normalizeRules(options.visibleWhen),
  };
}

export function getProtoOneofUi(oneof: DescOneof): ProtoFieldUiConfig | undefined {
  const options = getExtension(oneof.proto.options ?? create(OneofOptionsSchema), oneof_ui);
  if (isOneofUiEmpty(options)) {
    return;
  }

  return {
    description: extractDescription(options),
    disabledWhen: normalizeRules(options.disabledWhen),
    help: options.help || undefined,
    step: options.step || undefined,
    summaryLabel: options.summaryLabel || undefined,
    visibleWhen: normalizeRules(options.visibleWhen),
  };
}
