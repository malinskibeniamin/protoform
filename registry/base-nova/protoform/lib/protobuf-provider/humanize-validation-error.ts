// Converts raw protovalidate error messages into human-readable messages.
// Acts as a safety net for standard buf.validate constraints that cannot carry
// custom messages. Proto-level CEL expressions with custom messages take
// priority. This utility only fires for generic fallback messages.

const REGEX_ERROR_PATTERN = /regex pattern\s*`([^`]+)`/u;
const MIN_LEN_PATTERN = /^value length must be at least (\d+)/u;
const MAX_LEN_PATTERN = /^value length must be at most (\d+)/u;
const MIN_ITEMS_PATTERN = /^(?:value )?must contain at least (\d+)(?: item(?:\(s\)|s)?)?/u;
const MAX_ITEMS_PATTERN = /^(?:value )?must contain at most (\d+)(?: item(?:\(s\)|s)?)?/u;
const GTE_PATTERN = /^value must be greater than or equal to ([\d.]+)/u;
const LTE_PATTERN = /^value must be less than or equal to ([\d.]+)/u;
const GT_PATTERN = /^value must be greater than ([\d.]+)/u;
const LT_PATTERN = /^value must be less than ([\d.]+)/u;

interface PatternDescription {
  description: string;
  example: string;
}

const KNOWN_PATTERNS: Record<string, PatternDescription> = {
  "^[A-Z][A-Z0-9_]*$": {
    description: "Must be UPPER_SNAKE_CASE (start with a letter, then uppercase letters, digits, and underscores)",
    example: "AWS_ACCESS_KEY_ID",
  },
  "^[a-z][a-z0-9-]*$": {
    description: "Must be lowercase letters, digits, and hyphens (start with a letter)",
    example: "my-resource-name",
  },
  "^[a-z0-9][a-z0-9-]*$": {
    description: "Must be lowercase letters, digits, and hyphens (start with a letter or digit)",
    example: "my-resource-1",
  },
  "^$|^[A-Z][A-Z0-9_]*$": {
    description: "Must be empty or UPPER_SNAKE_CASE (uppercase letters, digits, and underscores)",
    example: "MY_API_KEY",
  },
  // Match the URL pattern with or without a trailing `$` anchor. Both
  // appear in protovalidate output depending on how the rule was authored.
  "^https?://.+": {
    description: "Must be a valid URL starting with http:// or https://",
    example: "https://example.com",
  },
  "^https?://.+$": {
    description: "Must be a valid URL starting with http:// or https://",
    example: "https://example.com",
  },
};

/** Known generic protovalidate messages that should be replaced by custom CEL messages when available. */
const GENERIC_MESSAGES = new Set(["value is required", "exactly one field is required in oneof"]);

/**
 * Returns true if the message is a generic protovalidate constraint message
 * (i.e., not a custom CEL message). Used by the resolver to prefer custom
 * messages over generic ones when a field has multiple validation errors.
 */
export function isGenericValidationMessage(message: string): boolean {
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

function humanizeLengthConstraint(message: string): string | undefined {
  const minLenMatch = MIN_LEN_PATTERN.exec(message);
  if (minLenMatch?.[1]) {
    return minLenMatch[1] === "1" ? "This field is required." : `Must be at least ${minLenMatch[1]} characters.`;
  }
  const maxLenMatch = MAX_LEN_PATTERN.exec(message);
  if (maxLenMatch?.[1]) {
    return `Must be at most ${maxLenMatch[1]} characters.`;
  }
  return;
}

function humanizeItemConstraint(message: string): string | undefined {
  const minItemsMatch = MIN_ITEMS_PATTERN.exec(message);
  if (minItemsMatch?.[1]) {
    return minItemsMatch[1] === "1" ? "Add at least one item." : `Add at least ${minItemsMatch[1]} items.`;
  }
  const maxItemsMatch = MAX_ITEMS_PATTERN.exec(message);
  if (maxItemsMatch?.[1]) {
    return maxItemsMatch[1] === "1" ? "At most one item is allowed." : `At most ${maxItemsMatch[1]} items are allowed.`;
  }
  return;
}

function humanizeNumericBound(message: string): string | undefined {
  const gteMatch = GTE_PATTERN.exec(message);
  if (gteMatch?.[1]) {
    return `Must be ${gteMatch[1]} or greater.`;
  }
  const lteMatch = LTE_PATTERN.exec(message);
  if (lteMatch?.[1]) {
    return `Must be ${lteMatch[1]} or less.`;
  }
  const gtMatch = GT_PATTERN.exec(message);
  if (gtMatch?.[1]) {
    return `Must be greater than ${gtMatch[1]}.`;
  }
  const ltMatch = LT_PATTERN.exec(message);
  if (ltMatch?.[1]) {
    return `Must be less than ${ltMatch[1]}.`;
  }
  return;
}

function humanizeRegexError(message: string): string | undefined {
  const regexMatch = REGEX_ERROR_PATTERN.exec(message);
  if (!regexMatch?.[1]) {
    return;
  }
  const known = KNOWN_PATTERNS[regexMatch[1]];
  return known ? `${known.description}. Example: ${known.example}` : message;
}

/**
 * Replace raw protovalidate error messages with human-readable descriptions.
 * Returns the original message if it's already a custom CEL message.
 */
export function humanizeValidationError(message: string): string {
  if (message === "value is required") {
    return "Enter a value.";
  }
  if (message === "exactly one field is required in oneof") {
    return "Select an option.";
  }

  return (
    humanizeLengthConstraint(message) ??
    humanizeItemConstraint(message) ??
    humanizeNumericBound(message) ??
    humanizeRegexError(message) ??
    message
  );
}

export const SERVER_FIELD_ERROR_FALLBACK = "Review this value and try again.";

/** Humanize a server field violation and ensure blank descriptions stay actionable. */
export function humanizeServerFieldError(description: string): string {
  const message = description.trim();
  return message ? humanizeValidationError(message) : SERVER_FIELD_ERROR_FALLBACK;
}
