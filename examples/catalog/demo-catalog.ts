import { readinessRequirements } from "../../readiness/profile.js";

export type DemoCategory =
  | "aip"
  | "cel"
  | "interop"
  | "production"
  | "protobuf"
  | "protovalidate";

export type DemoEngine =
  | "final-form"
  | "formik"
  | "react-hook-form"
  | "tanstack-form";

export type DemoSchemaKey =
  | "any"
  | "batch-create"
  | "batch-delete"
  | "batch-get"
  | "batch-update"
  | "book"
  | "cel"
  | "collections"
  | "commit-policy"
  | "create-book"
  | "delete-book"
  | "dynamic-json"
  | "editions"
  | "export-books"
  | "get-book"
  | "import-books"
  | "integers"
  | "list-books"
  | "numeric"
  | "presence"
  | "provision-capacity"
  | "purge-books"
  | "recursive"
  | "run-job"
  | "string-network"
  | "time-range"
  | "undelete-book"
  | "update-book"
  | "update-settings"
  | "validation"
  | "well-known";

export interface DemoCatalogEntry {
  category: DemoCategory;
  description: string;
  engine: DemoEngine;
  id: string;
  registryName: string;
  requirementIds: readonly string[];
  schemaKey: DemoSchemaKey;
  slug: string;
  title: string;
  tryIt: string;
}

interface FeatureDemoDefinition {
  category: Exclude<DemoCategory, "aip">;
  description: string;
  engine?: DemoEngine;
  requirementIds: readonly string[];
  schemaKey: DemoSchemaKey;
  slug: string;
  title: string;
  tryIt: string;
}

const AIP_TITLE_PREFIX = /^AIP-\d+\s+/;

const featureDemoDefinitions: readonly FeatureDemoDefinition[] = [
  {
    category: "protobuf",
    description:
      "Edit strings, booleans, signed and unsigned numbers, 64-bit values, floats, bytes, and enums without a hand-written DTO.",
    requirementIds: [
      "protobuf.string",
      "protobuf.bool",
      "protobuf.signed-32",
      "protobuf.unsigned-32",
      "protobuf.64-bit",
      "protobuf.64-bit-variants",
      "protobuf.float-double",
      "protobuf.bytes",
      "protobuf.enum",
    ],
    schemaKey: "numeric",
    slug: "protobuf-scalars",
    title: "Protobuf scalar fields",
    tryIt:
      "Change positive, negative, fractional, and 64-bit values, then submit the typed protobuf message.",
  },
  {
    category: "protobuf",
    description:
      "See how optional fields, wrapper messages, and protobuf default values stay distinguishable in form state.",
    requirementIds: [
      "protobuf.optional",
      "protobuf.presence-defaults",
      "protobuf.wrappers",
      "protobuf.wrapper-matrix",
    ],
    schemaKey: "presence",
    slug: "protobuf-presence",
    title: "Presence and wrapper values",
    tryIt:
      "Toggle populated values and submit to compare explicit presence with an unset field.",
  },
  {
    category: "protobuf",
    description:
      "Render nested messages and repeated scalar or message values from descriptors.",
    requirementIds: [
      "protobuf.nested-message",
      "protobuf.repeated-scalar",
      "protobuf.repeated-scalar-matrix",
      "protobuf.repeated-message",
    ],
    schemaKey: "collections",
    slug: "protobuf-nested-collections",
    title: "Nested and repeated messages",
    tryIt:
      "Add and remove rows, edit a nested child, then submit and inspect indexed values.",
  },
  {
    category: "protobuf",
    description:
      "Use string, numeric, boolean, and message-valued protobuf maps as editable key/value collections.",
    requirementIds: [
      "protobuf.map-scalar",
      "protobuf.map-message",
      "protobuf.map-key-types",
    ],
    schemaKey: "collections",
    slug: "protobuf-maps",
    title: "Protobuf maps",
    tryIt:
      "Add map entries, change a key, and confirm the submitted message preserves value types.",
  },
  {
    category: "protobuf",
    description:
      "Switch a protobuf oneof branch while Protoform clears values owned by the previous branch.",
    requirementIds: ["protobuf.oneof"],
    schemaKey: "import-books",
    slug: "protobuf-oneof",
    title: "Oneof branch selection",
    tryIt:
      "Enter one source, switch branches, and submit to prove the hidden branch was removed.",
  },
  {
    category: "protobuf",
    description:
      "Edit Timestamp, Duration, and FieldMask values with purpose-built controls.",
    requirementIds: [
      "protobuf.timestamp",
      "protobuf.duration",
      "protobuf.field-mask",
    ],
    schemaKey: "well-known",
    slug: "protobuf-well-known-types",
    title: "Well-known types",
    tryIt:
      "Change time, duration, and mask values, then submit their protobuf representation.",
  },
  {
    category: "protobuf",
    description:
      "Edit Struct, Value, ListValue, and Any payloads without replacing protobuf's dynamic value semantics.",
    requirementIds: ["protobuf.dynamic-json", "protobuf.any"],
    schemaKey: "dynamic-json",
    slug: "protobuf-dynamic-json-any",
    title: "Dynamic JSON and Any",
    tryIt:
      "Change object, scalar, list, and typed payload values, then submit their protobuf representation.",
  },
  {
    category: "protobuf",
    description:
      "Round-trip ProtoJSON while descriptor custom options continue to drive labels, controls, and help.",
    requirementIds: ["protobuf.json-round-trip", "protobuf.custom-options"],
    schemaKey: "validation",
    slug: "protobuf-json-options",
    title: "ProtoJSON and custom options",
    tryIt:
      "Edit annotated fields and submit to inspect the JSON-safe message shape.",
  },
  {
    category: "protobuf",
    description:
      "Render recursive descriptors safely without expanding an unbounded field tree.",
    requirementIds: ["protobuf.recursive-messages"],
    schemaKey: "recursive",
    slug: "protobuf-recursive-messages",
    title: "Recursive messages",
    tryIt:
      "Edit the bounded recursive node and submit without triggering an infinite render.",
  },
  {
    category: "protobuf",
    description:
      "Use generated service and RPC descriptors to keep a form tied to its request contract.",
    requirementIds: ["protobuf.services"],
    schemaKey: "create-book",
    slug: "bufbuild-descriptors",
    title: "Bufbuild service descriptors",
    tryIt: "Complete the request form that a generated service method accepts.",
  },
  {
    category: "protobuf",
    description:
      "Edit known fields without corrupting unknown protobuf fields retained from a newer producer.",
    requirementIds: ["protobuf.unknown-fields"],
    schemaKey: "book",
    slug: "protobuf-unknown-fields",
    title: "Unknown-field preservation",
    tryIt:
      "Edit the display name; the compatibility evidence verifies unknown wire data survives.",
  },
  {
    category: "protobuf",
    description:
      "Use Editions 2023 descriptors through the same field model as proto3 forms.",
    requirementIds: ["protobuf.editions"],
    schemaKey: "editions",
    slug: "protobuf-editions",
    title: "Protobuf Editions 2023",
    tryIt:
      "Edit edition-backed fields and submit them through the standard AutoForm surface.",
  },
  {
    category: "protovalidate",
    description:
      "Show required scalar and required oneof violations at their exact form paths.",
    requirementIds: ["protovalidate.required", "protovalidate.oneof-required"],
    schemaKey: "validation",
    slug: "protovalidate-required",
    title: "Required values and oneofs",
    tryIt:
      "Clear required fields and submit to see every missing value, then select a oneof branch.",
  },
  {
    category: "protovalidate",
    description:
      "Exercise float, double, signed, and unsigned numeric rules including bounds and membership.",
    requirementIds: [
      "protovalidate.float-double",
      "protovalidate.signed-integers",
      "protovalidate.unsigned-integers",
    ],
    schemaKey: "integers",
    slug: "protovalidate-numeric-rules",
    title: "Numeric validation rules",
    tryIt:
      "Enter boundary and out-of-range values to compare field-specific numeric messages.",
  },
  {
    category: "protovalidate",
    description:
      "Validate boolean constants and enum defined-only, allow-list, deny-list, and alias behavior.",
    requirementIds: ["protovalidate.bool", "protovalidate.enum"],
    schemaKey: "validation",
    slug: "protovalidate-bool-enum",
    title: "Boolean and enum rules",
    tryIt:
      "Change the boolean and enum selections, then submit to exercise allowed values.",
  },
  {
    category: "protovalidate",
    description:
      "Exercise string constants, lengths, patterns, prefixes, suffixes, containment, and membership.",
    requirementIds: ["protovalidate.string-core"],
    schemaKey: "string-network",
    slug: "protovalidate-string-rules",
    title: "Core string rules",
    tryIt:
      "Try short, long, and malformed strings to see each constraint stay attached to its field.",
  },
  {
    category: "protovalidate",
    description:
      "Use purpose-built URL, email, UUID, IP, hostname, and identifier inputs backed by standard format rules.",
    requirementIds: [
      "protovalidate.string-uri",
      "protovalidate.string-email",
      "protovalidate.string-uuid",
      "protovalidate.string-network-formats",
    ],
    schemaKey: "string-network",
    slug: "protovalidate-string-formats",
    title: "String format validation",
    tryIt:
      "Enter malformed addresses and identifiers, then correct them without losing other values.",
  },
  {
    category: "protovalidate",
    description:
      "Validate base64 bytes and Any type URLs against exact, length, pattern, allow, and deny rules.",
    requirementIds: ["protovalidate.bytes", "protovalidate.any"],
    schemaKey: "any",
    slug: "protovalidate-bytes-any",
    title: "Bytes and Any rules",
    tryIt:
      "Change the base64 and type URL inputs to trigger safe validation failures.",
  },
  {
    category: "protovalidate",
    description:
      "Apply repeated-item rules, cardinality limits, uniqueness, and indexed error paths.",
    requirementIds: [
      "protovalidate.repeated-items",
      "protovalidate.repeated-cardinality",
    ],
    schemaKey: "collections",
    slug: "protovalidate-repeated",
    title: "Repeated-field rules",
    tryIt:
      "Add duplicate and invalid rows, then remove one and confirm indexed errors follow the data.",
  },
  {
    category: "protovalidate",
    description:
      "Validate map cardinality plus key and value rules without flattening typed map values.",
    requirementIds: [
      "protovalidate.map-keys-values",
      "protovalidate.map-cardinality",
    ],
    schemaKey: "collections",
    slug: "protovalidate-maps",
    title: "Map validation rules",
    tryIt:
      "Add invalid keys and values to see both violations, then correct each entry.",
  },
  {
    category: "protovalidate",
    description:
      "Validate Duration, Timestamp, and FieldMask values with protobuf-native semantics.",
    requirementIds: [
      "protovalidate.duration",
      "protovalidate.field-mask",
      "protovalidate.timestamp",
    ],
    schemaKey: "well-known",
    slug: "protovalidate-well-known-types",
    title: "Well-known type rules",
    tryIt:
      "Try malformed time, duration, and mask inputs before submitting valid protobuf values.",
  },
  {
    category: "protovalidate",
    description:
      "Compare ignore-empty behavior with explicit zero and unset protobuf values.",
    requirementIds: ["protovalidate.ignore"],
    schemaKey: "presence",
    slug: "protovalidate-ignore",
    title: "Ignore and zero-value semantics",
    tryIt:
      "Clear optional values and compare the result with fields explicitly set to zero.",
  },
  {
    category: "protovalidate",
    description:
      "Render every validation violation instead of stopping at the first failing rule.",
    requirementIds: ["protovalidate.all-violations"],
    schemaKey: "validation",
    slug: "protovalidate-all-errors",
    title: "Complete violation reporting",
    tryIt:
      "Submit the intentionally invalid defaults and fix errors in any order.",
  },
  {
    category: "protovalidate",
    description:
      "Use reusable predefined constraints and the standard Protovalidate rule examples.",
    requirementIds: ["protovalidate.predefined", "protovalidate.examples"],
    schemaKey: "validation",
    slug: "protovalidate-predefined",
    title: "Predefined and example rules",
    tryIt:
      "Change the predefined-rule fields and submit to see reusable messages.",
  },
  {
    category: "cel",
    description:
      "Evaluate CEL literals, scalar types, logical, relational, arithmetic, and explicit conversion expressions.",
    requirementIds: [
      "cel.syntax-literals",
      "cel.scalar-types",
      "cel.operators",
      "cel.conversions",
    ],
    schemaKey: "cel",
    slug: "cel-language-basics",
    title: "CEL language basics",
    tryIt:
      "Change scalar values so the cross-field expression moves between valid and invalid states.",
  },
  {
    category: "cel",
    description:
      "Exercise CEL list and map values plus all, exists, exists_one, filter, and map comprehensions.",
    requirementIds: [
      "cel.lists-maps",
      "cel.comprehension-all",
      "cel.comprehension-exists",
      "cel.comprehension-exists-one",
      "cel.comprehension-filter",
      "cel.comprehension-map",
    ],
    schemaKey: "cel",
    slug: "cel-collections",
    title: "CEL collections and comprehensions",
    tryIt:
      "Add collection values that make each comprehension succeed or fail.",
  },
  {
    category: "cel",
    description:
      "Read protobuf messages, enums, and explicit field presence directly from CEL expressions.",
    requirementIds: ["cel.protobuf-messages", "cel.enums", "cel.presence"],
    schemaKey: "cel",
    slug: "cel-protobuf-values",
    title: "CEL with protobuf values",
    tryIt:
      "Change nested, enum, and optional fields to exercise descriptor-aware CEL access.",
  },
  {
    category: "cel",
    description:
      "Use CEL string helpers and RE2-compatible regular expressions with portable validation messages.",
    requirementIds: ["cel.strings"],
    schemaKey: "cel",
    slug: "cel-re2",
    title: "CEL strings and RE2",
    tryIt:
      "Try an uppercase project ID, then a lowercase hyphenated value that matches RE2.",
  },
  {
    category: "cel",
    description:
      "Evaluate CEL byte literals and byte operations without treating bytes as ordinary Unicode text.",
    requirementIds: ["cel.bytes"],
    schemaKey: "cel",
    slug: "cel-bytes",
    title: "CEL byte values",
    tryIt:
      "Change the encoded payload and submit to exercise byte-aware rules.",
  },
  {
    category: "cel",
    description:
      "Compare timestamps and durations and use CEL time arithmetic across protobuf WKT values.",
    requirementIds: ["cel.timestamps", "cel.durations"],
    schemaKey: "time-range",
    slug: "cel-time",
    title: "CEL timestamps and durations",
    tryIt:
      "Set an end before the start, then correct the half-open time range.",
  },
  {
    category: "cel",
    description:
      "Parse, plan, cache, and repeatedly evaluate the same CEL contract without recompiling per keystroke.",
    requirementIds: [
      "cel.parse-plan-evaluate",
      "cel.compile-cache",
      "cel.language-coverage",
    ],
    schemaKey: "cel",
    slug: "cel-execution",
    title: "CEL parse and evaluation lifecycle",
    tryIt:
      "Edit several values; the same compiled expression plan validates every change.",
  },
  {
    category: "cel",
    description:
      "Fail safely on evaluation errors, unknown attributes, excessive cost, and invalid UI expressions.",
    requirementIds: [
      "cel.error-propagation",
      "cel.unknown-attributes",
      "cel.short-circuit",
      "cel.ui-fail-closed",
      "cel.cost-limits",
      "cel.safe-failure",
    ],
    schemaKey: "cel",
    slug: "cel-safe-evaluation",
    title: "Safe CEL evaluation",
    tryIt:
      "Use the bounded form while executable evidence covers unknown, error, and cost-limit paths.",
  },
  {
    category: "cel",
    description:
      "Attach CEL to messages, fields, and reusable predefined Protovalidate rules.",
    requirementIds: [
      "cel.protovalidate-message",
      "cel.protovalidate-field",
      "cel.protovalidate-predefined",
    ],
    schemaKey: "cel",
    slug: "cel-protovalidate",
    title: "CEL in Protovalidate",
    tryIt: "Trigger both a field-local rule and a cross-field message rule.",
  },
  {
    category: "cel",
    description:
      "Drive progressive disclosure from the restricted, fail-closed CEL UI profile.",
    requirementIds: ["cel.ui-profile"],
    schemaKey: "validation",
    slug: "cel-ui-rules",
    title: "CEL-powered UI rules",
    tryIt:
      "Toggle the controlling value to reveal or disable dependent fields.",
  },
  {
    category: "cel",
    description:
      "Handle the specification's minimum nesting and repetition depth with bounded evaluation cost.",
    requirementIds: ["cel.complexity-minimum"],
    schemaKey: "cel",
    slug: "cel-complex-expressions",
    title: "Complex CEL expressions",
    tryIt:
      "Edit nested collection values while the composed expression validates the complete graph.",
  },
  {
    category: "cel",
    description:
      "Preserve dynamic messages plus nested, repeated, and multiple violation paths.",
    requirementIds: [
      "cel.message-string",
      "cel.nested-paths",
      "cel.multiple-violations",
    ],
    schemaKey: "cel",
    slug: "cel-error-paths",
    title: "CEL messages and error paths",
    tryIt:
      "Submit several invalid nested values to see every precise path and dynamic message.",
  },
  {
    category: "production",
    description:
      "Use the Standard Schema v1 contract with synchronous, asynchronous, object, and callable schema implementations.",
    requirementIds: [
      "production.standard-schema",
      "production.standard-schema-consumer",
    ],
    schemaKey: "validation",
    slug: "standard-schema",
    title: "Standard Schema interoperability",
    tryIt:
      "Submit invalid and valid values through the same provider-neutral validation boundary.",
  },
  {
    category: "production",
    description:
      "Use React Hook Form as Protoform's default native engine without hiding its form API.",
    requirementIds: ["production.react-hook-form"],
    schemaKey: "validation",
    slug: "react-hook-form",
    title: "React Hook Form integration",
    tryIt:
      "Edit, blur, validate, and submit through the default React Hook Form adapter.",
  },
  {
    category: "interop",
    description:
      "Use the same generated field model through the optional TanStack Form adapter.",
    engine: "tanstack-form",
    requirementIds: ["production.tanstack-form"],
    schemaKey: "validation",
    slug: "tanstack-form",
    title: "TanStack Form interoperability",
    tryIt:
      "Use this explicitly labeled adapter demo when your application standardizes on TanStack Form.",
  },
  {
    category: "interop",
    description:
      "Feed Protoform validation results into an existing Formik form without replacing Formik state.",
    engine: "formik",
    requirementIds: ["production.formik"],
    schemaKey: "validation",
    slug: "formik",
    title: "Formik interoperability",
    tryIt:
      "Submit invalid profile values and see Protoform paths surface through Formik.",
  },
  {
    category: "interop",
    description:
      "Feed Protoform validation results into Final Form while preserving its native subscription model.",
    engine: "final-form",
    requirementIds: ["production.final-form"],
    schemaKey: "validation",
    slug: "final-form",
    title: "Final Form interoperability",
    tryIt:
      "Submit invalid profile values and see Protoform paths surface through Final Form.",
  },
  {
    category: "production",
    description:
      "Generate complete fields and controls from a descriptor while keeping source ownership.",
    requirementIds: ["production.auto-form"],
    schemaKey: "validation",
    slug: "auto-form",
    title: "Descriptor-driven AutoForm",
    tryIt:
      "Edit the generated controls and submit without writing a field tree.",
  },
  {
    category: "production",
    description:
      "Split descriptor fields into an accessible linear stepper with stable step IDs.",
    requirementIds: ["production.stepper"],
    schemaKey: "create-book",
    slug: "stepper",
    title: "Linear stepper",
    tryIt:
      "Move forward and back, verify values persist, then submit from the final step.",
  },
  {
    category: "production",
    description:
      "Map structured server field violations and unstructured submit failures into visible, recoverable form states.",
    requirementIds: ["production.server-errors", "production.submit-failures"],
    schemaKey: "validation",
    slug: "server-errors",
    title: "Server errors and recovery",
    tryIt:
      "Submit a blocked value to map a server error back to its field without losing input.",
  },
  {
    category: "production",
    description:
      "Keep sensitive input available for submission while redacting it from review output.",
    requirementIds: ["production.credential-redaction"],
    schemaKey: "book",
    slug: "credential-redaction",
    title: "Sensitive-value redaction",
    tryIt:
      "Enter a token and inspect the review state, which never echoes the secret.",
  },
  {
    category: "production",
    description:
      "Exercise labeled controls, focus management, error relationships, and the full form using only a keyboard.",
    requirementIds: ["production.accessibility", "production.keyboard"],
    schemaKey: "validation",
    slug: "accessible-forms",
    title: "Accessible keyboard workflows",
    tryIt:
      "Complete the form using Tab, Shift+Tab, Enter, Space, and arrow keys.",
  },
  {
    category: "production",
    description:
      "Keep generated forms usable across browser engines and narrow viewports.",
    requirementIds: ["production.cross-browser", "production.narrow-viewport"],
    schemaKey: "collections",
    slug: "responsive-cross-browser",
    title: "Responsive cross-browser forms",
    tryIt:
      "Resize the page to a narrow viewport and complete the same form without horizontal loss.",
  },
  {
    category: "production",
    description:
      "Render descriptor-driven form HTML on the server and hydrate the interactive client without mismatches.",
    requirementIds: ["production.ssr-hydration"],
    schemaKey: "validation",
    slug: "ssr-hydration",
    title: "SSR and hydration",
    tryIt:
      "Interact immediately after the page loads; the hydrated form retains server-rendered structure.",
  },
  {
    category: "production",
    description:
      "Submit generated request messages to a local ConnectRPC TypeScript service.",
    requirementIds: ["production.local-transport"],
    schemaKey: "create-book",
    slug: "connectrpc-transport",
    title: "ConnectRPC transport",
    tryIt:
      "Complete the request; the full example can send the typed message through ConnectRPC.",
  },
  {
    category: "production",
    description:
      "Cancel stale asynchronous validation and submissions so older responses cannot overwrite current state.",
    requirementIds: ["production.cancellation"],
    schemaKey: "validation",
    slug: "async-cancellation",
    title: "Async cancellation",
    tryIt:
      "Change the validated value repeatedly; only the latest result may update the form.",
  },
  {
    category: "production",
    description:
      "Keep the registry source and its public third-party dependencies installable without Protoform packages.",
    requirementIds: ["production.registry-dependencies"],
    schemaKey: "validation",
    slug: "dependency-matrix",
    title: "Registry dependency contract",
    tryIt:
      "Use the live form while the consumer fixture proves the registry-only install boundary.",
  },
  {
    category: "production",
    description:
      "Stay within large-form interaction and tree-shaken bundle budgets.",
    requirementIds: ["production.performance", "production.bundle-size"],
    schemaKey: "collections",
    slug: "performance-bundle",
    title: "Performance and bundle budgets",
    tryIt:
      "Add and edit collection rows while the automated budgets guard render and bundle regressions.",
  },
  {
    category: "production",
    description:
      "Reject malformed descriptors, conversion values, and hostile server error paths without crashing the form.",
    requirementIds: ["production.untrusted-input"],
    schemaKey: "validation",
    slug: "untrusted-input",
    title: "Untrusted input hardening",
    tryIt:
      "Use the safe live contract while executable evidence probes malformed values and paths.",
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const aipSchemas: Readonly<Partial<Record<number, DemoSchemaKey>>> = {
  126: "validation",
  127: "create-book",
  128: "create-book",
  130: "create-book",
  131: "get-book",
  132: "list-books",
  133: "create-book",
  134: "update-book",
  135: "delete-book",
  136: "provision-capacity",
  141: "provision-capacity",
  142: "time-range",
  143: "provision-capacity",
  145: "time-range",
  146: "any",
  149: "presence",
  151: "provision-capacity",
  152: "run-job",
  153: "export-books",
  154: "delete-book",
  155: "create-book",
  156: "update-settings",
  157: "list-books",
  158: "list-books",
  159: "list-books",
  160: "list-books",
  161: "update-book",
  163: "create-book",
  164: "undelete-book",
  165: "purge-books",
  193: "validation",
  194: "create-book",
  213: "well-known",
  217: "list-books",
  231: "batch-get",
  233: "batch-create",
  234: "batch-update",
  235: "batch-delete",
  236: "commit-policy",
};

function schemaForAip(number: number): DemoSchemaKey {
  return aipSchemas[number] ?? "book";
}

const aipDemos: DemoCatalogEntry[] = readinessRequirements
  .filter(
    (requirement) =>
      requirement.category === "aip" && requirement.status === "verified"
  )
  .map((requirement) => {
    const number = Number(requirement.id.slice("aip.".length));
    const shortTitle = requirement.title.replace(AIP_TITLE_PREFIX, "");
    const slug = `aip-${number}-${slugify(shortTitle)}`;

    return {
      category: "aip",
      description:
        requirement.description ??
        `Exercise the form-visible contract for ${requirement.title}.`,
      engine: "react-hook-form",
      id: requirement.id,
      registryName: slug,
      requirementIds: [requirement.id],
      schemaKey: schemaForAip(number),
      slug,
      title: requirement.title,
      tryIt:
        "Edit the focused request, submit it, and compare the live behavior with the executable compatibility evidence below.",
    };
  });

const featureDemos: DemoCatalogEntry[] = featureDemoDefinitions.map(
  (definition) => ({
    ...definition,
    engine: definition.engine ?? "react-hook-form",
    id: `demo.${definition.slug}`,
    registryName: `${definition.slug}-demo`,
  })
);

export const demoCatalog: readonly DemoCatalogEntry[] = [
  ...aipDemos,
  ...featureDemos,
];

export function getDemo(demoId: string): DemoCatalogEntry | undefined {
  return demoCatalog.find((demo) => demo.id === demoId);
}
