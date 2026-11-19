import { formatProtoformMessage, type ProtoformMessageFormatter } from '../core/messages.js';

const REGEX_ERROR_PATTERN = /regex pattern\s*`(?<pattern>[^`]+)`/u;
const MIN_LEN_PATTERN = /^value length must be at least (?<limit>\d+)/u;
const MAX_LEN_PATTERN = /^value length must be at most (?<limit>\d+)/u;
const MIN_ITEMS_PATTERN = /^(?:value )?must contain at least (?<limit>\d+)(?: item(?:\(s\)|s)?)?/u;
const MAX_ITEMS_PATTERN = /^(?:value )?must contain at most (?<limit>\d+)(?: item(?:\(s\)|s)?)?/u;
const GTE_PATTERN = /^value must be greater than or equal to (?<limit>[\d.]+)/u;
const LTE_PATTERN = /^value must be less than or equal to (?<limit>[\d.]+)/u;
const GT_PATTERN = /^value must be greater than (?<limit>[\d.]+)/u;
const LT_PATTERN = /^value must be less than (?<limit>[\d.]+)/u;

interface PatternDescription {
  description: string;
  example: string;
}

const KNOWN_PATTERNS: Record<string, PatternDescription> = {
  '^[A-Z][A-Z0-9_]*$': {
    description: 'Must be UPPER_SNAKE_CASE (start with a letter, then uppercase letters, digits, and underscores)',
    example: 'AWS_ACCESS_KEY_ID',
  },
  '^[a-z][a-z0-9-]*$': {
    description: 'Must be lowercase letters, digits, and hyphens (start with a letter)',
    example: 'my-resource-name',
  },
  '^[a-z0-9][a-z0-9-]*$': {
    description: 'Must be lowercase letters, digits, and hyphens (start with a letter or digit)',
    example: 'my-resource-1',
  },
  '^$|^[A-Z][A-Z0-9_]*$': {
    description: 'Must be empty or UPPER_SNAKE_CASE (uppercase letters, digits, and underscores)',
    example: 'MY_API_KEY',
  },
  '^https?://.+': {
    description: 'Must be a valid URL starting with http:// or https://',
    example: 'https://example.com',
  },
  '^https?://.+$': {
    description: 'Must be a valid URL starting with http:// or https://',
    example: 'https://example.com',
  },
};

const GENERIC_MESSAGES = new Set(['value is required', 'exactly one field is required in oneof']);

export function isGenericValidationMessage(message: string) {
  if (GENERIC_MESSAGES.has(message)) {
    return true;
  }
  if (MIN_LEN_PATTERN.test(message) || MAX_LEN_PATTERN.test(message)) {
    return true;
  }
  if (REGEX_ERROR_PATTERN.test(message)) {
    return true;
  }
  if (
    MIN_ITEMS_PATTERN.test(message) ||
    MAX_ITEMS_PATTERN.test(message) ||
    GTE_PATTERN.test(message) ||
    LTE_PATTERN.test(message) ||
    GT_PATTERN.test(message) ||
    LT_PATTERN.test(message)
  ) {
    return true;
  }
  return false;
}

function humanizeLengthConstraint(message: string, formatter?: ProtoformMessageFormatter) {
  const minLength = MIN_LEN_PATTERN.exec(message)?.groups?.['limit'];
  if (minLength !== undefined && minLength !== '') {
    const limit = Number(minLength);
    return limit === 1
      ? formatProtoformMessage(formatter, 'validation.required', {}, 'This field is required.')
      : formatProtoformMessage(formatter, 'validation.min_length', { limit }, `Must be at least ${limit} characters.`);
  }
  const maxLength = MAX_LEN_PATTERN.exec(message)?.groups?.['limit'];
  if (maxLength === undefined || maxLength === '') {
    return;
  }
  const limit = Number(maxLength);
  return formatProtoformMessage(formatter, 'validation.max_length', { limit }, `Must be at most ${limit} characters.`);
}

function humanizeItemConstraint(message: string, formatter?: ProtoformMessageFormatter) {
  const minItems = MIN_ITEMS_PATTERN.exec(message)?.groups?.['limit'];
  if (minItems !== undefined && minItems !== '') {
    const limit = Number(minItems);
    return formatProtoformMessage(
      formatter,
      'validation.min_items',
      { limit },
      limit === 1 ? 'Add at least one item.' : `Add at least ${limit} items.`
    );
  }
  const maxItems = MAX_ITEMS_PATTERN.exec(message)?.groups?.['limit'];
  if (maxItems === undefined || maxItems === '') {
    return;
  }
  const limit = Number(maxItems);
  return formatProtoformMessage(
    formatter,
    'validation.max_items',
    { limit },
    limit === 1 ? 'At most one item is allowed.' : `At most ${limit} items are allowed.`
  );
}

function humanizeNumericBound(message: string, formatter?: ProtoformMessageFormatter) {
  const gte = GTE_PATTERN.exec(message)?.groups?.['limit'];
  if (gte !== undefined && gte !== '') {
    return formatProtoformMessage(
      formatter,
      'validation.greater_than_or_equal',
      { limit: gte },
      `Must be ${gte} or greater.`
    );
  }
  const lte = LTE_PATTERN.exec(message)?.groups?.['limit'];
  if (lte !== undefined && lte !== '') {
    return formatProtoformMessage(
      formatter,
      'validation.less_than_or_equal',
      { limit: lte },
      `Must be ${lte} or less.`
    );
  }
  const gt = GT_PATTERN.exec(message)?.groups?.['limit'];
  if (gt !== undefined && gt !== '') {
    return formatProtoformMessage(formatter, 'validation.greater_than', { limit: gt }, `Must be greater than ${gt}.`);
  }
  const lt = LT_PATTERN.exec(message)?.groups?.['limit'];
  if (lt === undefined || lt === '') {
    return;
  }
  return formatProtoformMessage(formatter, 'validation.less_than', { limit: lt }, `Must be less than ${lt}.`);
}

function humanizeRegexError(message: string, formatter?: ProtoformMessageFormatter) {
  const pattern = REGEX_ERROR_PATTERN.exec(message)?.groups?.['pattern'];
  if (pattern === undefined || pattern === '') {
    return;
  }
  const known = KNOWN_PATTERNS[pattern];
  const fallback = known ? `${known.description}. Example: ${known.example}` : message;
  return formatProtoformMessage(formatter, 'validation.pattern', { example: known?.example ?? '', pattern }, fallback);
}

export function humanizeValidationError(message: string, formatter?: ProtoformMessageFormatter) {
  if (message === 'value is required') {
    return formatProtoformMessage(formatter, 'validation.required', {}, 'Enter a value.');
  }
  if (message === 'exactly one field is required in oneof') {
    return formatProtoformMessage(formatter, 'validation.oneof_required', {}, 'Select an option.');
  }

  return (
    humanizeLengthConstraint(message, formatter) ??
    humanizeItemConstraint(message, formatter) ??
    humanizeNumericBound(message, formatter) ??
    humanizeRegexError(message, formatter) ??
    message
  );
}

export const SERVER_FIELD_ERROR_FALLBACK = 'Review this value and try again.';

export function humanizeServerFieldError(description: string, formatter?: ProtoformMessageFormatter) {
  const message = description.trim();
  return message
    ? humanizeValidationError(message, formatter)
    : formatProtoformMessage(formatter, 'validation.server_field', {}, SERVER_FIELD_ERROR_FALLBACK);
}
