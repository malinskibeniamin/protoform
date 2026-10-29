import type { ParsedField } from '@/registry/base-nova/protoform/lib/form-types';

const ACRONYMS: Record<string, string> = {
  api: 'API',
  aws: 'AWS',
  dsn: 'DSN',
  gcp: 'GCP',
  grpc: 'gRPC',
  http: 'HTTP',
  https: 'HTTPS',
  id: 'ID',
  json: 'JSON',
  jwt: 'JWT',
  mcp: 'MCP',
  oauth: 'OAuth',
  sasl: 'SASL',
  sdk: 'SDK',
  sns: 'SNS',
  sql: 'SQL',
  sqs: 'SQS',
  ssl: 'SSL',
  tls: 'TLS',
  tts: 'TTS',
  uri: 'URI',
  url: 'URL',
  uuid: 'UUID',
  vpc: 'VPC',
  yaml: 'YAML',
};

function applyAcronyms(label: string): string {
  return label.replaceAll(/\b[A-Za-z]+\b/gu, (word) => ACRONYMS[word.toLowerCase()] ?? word);
}

function beautifyLabel(label: string): string {
  if (!label) {
    return '';
  }
  let output = label.replaceAll(/([A-Z])/gu, ' $1');
  output = output.charAt(0).toUpperCase() + output.slice(1);
  if (!Number.isNaN(Number(output))) {
    return '';
  }
  if (output === '*') {
    return '';
  }
  return applyAcronyms(output);
}

export function getLabel(field: ParsedField): string {
  for (const label of [field.fieldConfig?.label, field.description]) {
    if (typeof label === 'number' || (typeof label === 'string' && label !== '')) {
      return String(label);
    }
  }
  return beautifyLabel(field.key);
}

export function sortFieldsByOrder<TFieldType extends string = string>(
  fields: ParsedField<TFieldType>[] | undefined
): ParsedField<TFieldType>[] {
  if (!fields) {
    return [];
  }
  return fields
    .map((field) => (field.schema ? { ...field, schema: sortFieldsByOrder(field.schema) } : field))
    .sort((a, b) => (a.fieldConfig?.order ?? 0) - (b.fieldConfig?.order ?? 0));
}

export function getPathInObject(obj: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (typeof current !== 'object' || current === null || !Object.hasOwn(current, key)) {
      return;
    }
    current = Reflect.get(current, key);
  }
  return current;
}
