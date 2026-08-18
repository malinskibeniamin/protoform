export type ReadinessCategoryId = "aip" | "cel" | "production" | "protobuf" | "protovalidate";

export type ReadinessLevel = "required" | "recommended";
export type AipEvidenceScope = "client" | "external";
export type AipStandardState = "approved" | "draft" | "reviewing";

interface RequirementBase {
  category: ReadinessCategoryId;
  description?: string | undefined;
  evidenceScope?: AipEvidenceScope;
  id: string;
  level: ReadinessLevel;
  sourceUrl?: string;
  standardState?: AipStandardState;
  title: string;
}

export interface VerifiedRequirement extends RequirementBase {
  evidence: {
    file: string;
    testName: string;
  };
  status: "verified";
}

export interface OptionalRequirement extends RequirementBase {
  evidence: {
    file: string;
    testName: string;
  };
  status: "optional";
}

export interface MissingRequirement extends RequirementBase {
  nextTest: string;
  status: "missing";
}

export interface PlannedRequirement extends RequirementBase {
  nextTest: string;
  rationale: string;
  status: "deferred" | "unsupported";
}

export interface ExcludedRequirement extends RequirementBase {
  rationale: string;
  status: "external" | "out-of-target" | "superseded";
}

export type ReadinessRequirement =
  | ExcludedRequirement
  | MissingRequirement
  | OptionalRequirement
  | PlannedRequirement
  | VerifiedRequirement;

export interface ReadinessSummary {
  applicable: number;
  deferred: number;
  excluded: number;
  external: number;
  missing: number;
  optional: number;
  outOfTarget: number;
  percentage: number;
  profileComplete: boolean;
  superseded: number;
  unsupported: number;
  verified: number;
}

export interface ReadinessCategory {
  description: string;
  id: ReadinessCategoryId;
  sourceLabel: string;
  sourceUrl: string;
  title: string;
}

export const readinessProfile = {
  dependencyRanges: {
    "@bufbuild/cel": "^0.6.0",
    "@bufbuild/protobuf": "^2.13.0",
    "@bufbuild/protovalidate": "^1.2.0",
    "@standard-schema/spec": "^1.1.0",
    "@tanstack/react-form": "^1.33.3",
    "final-form": "^5.0.1",
    formik: "^2.4.9",
    react: "^19.2.8",
    "react-final-form": "^7.0.1",
    "react-hook-form": "^7.84.0",
  },
  reviewedAt: "2026-08-14",
  version: 3,
};

export const readinessCategories: readonly ReadinessCategory[] = [
  {
    description: "Form-relevant canonical v2 behavior plus explicitly isolated migration profiles.",
    id: "protobuf",
    sourceLabel: "Protocol Buffers language guide",
    sourceUrl: "https://protobuf.dev/programming-guides/",
    title: "Protobuf",
  },
  {
    description: "Every standard rule family exposed by the installed Protovalidate schema.",
    id: "protovalidate",
    sourceLabel: "Protovalidate standard rules",
    sourceUrl: "https://buf.build/docs/reference/protovalidate/rules/",
    title: "Protovalidate",
  },
  {
    description: "Contract validation expressions and descriptor-provided UI expressions.",
    id: "cel",
    sourceLabel: "Common Expression Language overview",
    sourceUrl: "https://cel.dev/overview/cel-overview",
    title: "CEL",
  },
  {
    description:
      "Verified form and client behavior derived from AIPs; server and organizational conformance remain external.",
    id: "aip",
    sourceLabel: "General API Improvement Proposals",
    sourceUrl: "https://google.aip.dev/general",
    title: "AIP-aware client coverage",
  },
  {
    description: "Framework interoperability, accessibility, resilience, compatibility, and release evidence.",
    id: "production",
    sourceLabel: "Web Content Accessibility Guidelines 2.2",
    sourceUrl: "https://www.w3.org/WAI/WCAG22/quickref/",
    title: "Production runtime",
  },
];

const required = "required" as const;
const recommended = "recommended" as const;

function verified(
  category: ReadinessCategoryId,
  id: string,
  title: string,
  file: string,
  testName: string,
  level: ReadinessLevel = required,
  description?: string
): VerifiedRequirement {
  return {
    category,
    description,
    evidence: { file, testName },
    id,
    level,
    status: "verified",
    title,
  };
}

function excluded(
  category: ReadinessCategoryId,
  id: string,
  title: string,
  status: ExcludedRequirement["status"],
  rationale: string
): ExcludedRequirement {
  return { category, id, level: required, rationale, status, title };
}

function optional(
  category: ReadinessCategoryId,
  id: string,
  title: string,
  file: string,
  testName: string,
  description?: string
): OptionalRequirement {
  return {
    category,
    description,
    evidence: { file, testName },
    id,
    level: recommended,
    status: "optional",
    title,
  };
}

const protobufRequirements: readonly ReadinessRequirement[] = [
  verified(
    "protobuf",
    "protobuf.string",
    "String fields",
    "conformance/protoform.conformance.test.ts",
    "maps $key into the stable field model"
  ),
  verified(
    "protobuf",
    "protobuf.bool",
    "Boolean fields",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips explicit and implicit boolean values"
  ),
  verified(
    "protobuf",
    "protobuf.signed-32",
    "Signed 32-bit integer families",
    "conformance/protobuf-matrix.conformance.test.ts",
    "enforces signed 32-bit boundaries across int32, sint32, and sfixed32"
  ),
  verified(
    "protobuf",
    "protobuf.unsigned-32",
    "Unsigned 32-bit integer families",
    "conformance/protobuf-matrix.conformance.test.ts",
    "enforces unsigned 32-bit boundaries across uint32 and fixed32"
  ),
  verified(
    "protobuf",
    "protobuf.64-bit",
    "int64 and uint64 fields",
    "conformance/protoform.conformance.test.ts",
    "turns valid form values into a typed protobuf message",
    required,
    "The verified fixture covers int64 and uint64 string-to-bigint conversion."
  ),
  verified(
    "protobuf",
    "protobuf.64-bit-variants",
    "Other 64-bit integer families",
    "conformance/protobuf-matrix.conformance.test.ts",
    "enforces signed and unsigned boundaries for other 64-bit integer families"
  ),
  verified(
    "protobuf",
    "protobuf.float-double",
    "Float and double fields",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips float and double decimals, negative zero, NaN, and infinities"
  ),
  verified(
    "protobuf",
    "protobuf.bytes",
    "Bytes as base64",
    "conformance/protoform.conformance.test.ts",
    "round-trips optional, wrapper, JSON, map, bytes, and oneof values"
  ),
  verified(
    "protobuf",
    "protobuf.enum",
    "Enum fields",
    "conformance/protoform.conformance.test.ts",
    "maps $key into the stable field model"
  ),
  verified(
    "protobuf",
    "protobuf.nested-message",
    "Nested messages",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protobuf",
    "protobuf.repeated-scalar",
    "Repeated string and int32 fields",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protobuf",
    "protobuf.repeated-scalar-matrix",
    "Repeated scalar and enum matrix",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips the repeated scalar, bytes, enum, 64-bit, float, and double matrix"
  ),
  verified(
    "protobuf",
    "protobuf.repeated-message",
    "Repeated message fields",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips repeated messages and preserves indexed validation paths after removal"
  ),
  verified(
    "protobuf",
    "protobuf.map-scalar",
    "Maps with scalar values",
    "conformance/protoform.conformance.test.ts",
    "round-trips optional, wrapper, JSON, map, bytes, and oneof values"
  ),
  verified(
    "protobuf",
    "protobuf.map-message",
    "Maps with message values",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protobuf",
    "protobuf.map-key-types",
    "Map key type matrix",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips every legal boolean and integer map key type"
  ),
  verified(
    "protobuf",
    "protobuf.oneof",
    "Oneof selection and branch values",
    "conformance/protoform.conformance.test.ts",
    "keeps every oneof branch discoverable in descriptor order"
  ),
  verified(
    "protobuf",
    "protobuf.optional",
    "Populated proto3 optional fields",
    "conformance/protoform.conformance.test.ts",
    "round-trips optional, wrapper, JSON, map, bytes, and oneof values"
  ),
  verified(
    "protobuf",
    "protobuf.presence-defaults",
    "Presence and default-value semantics",
    "conformance/protobuf-matrix.conformance.test.ts",
    "distinguishes explicit presence while documenting implicit scalar loss"
  ),
  verified(
    "protobuf",
    "protobuf.wrappers",
    "StringValue, Int32Value, and BoolValue",
    "conformance/protoform.conformance.test.ts",
    "round-trips optional, wrapper, JSON, map, bytes, and oneof values"
  ),
  verified(
    "protobuf",
    "protobuf.wrapper-matrix",
    "Remaining scalar wrapper messages",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips every remaining scalar wrapper with unset and default values"
  ),
  verified(
    "protobuf",
    "protobuf.timestamp",
    "Timestamp",
    "registry/base-nova/protoform/lib/protobuf-provider/index.test.ts",
    "converts protobuf messages into form-friendly values"
  ),
  verified(
    "protobuf",
    "protobuf.duration",
    "Duration",
    "registry/base-nova/protoform/lib/protobuf-provider/index.test.ts",
    "converts protobuf messages into form-friendly values"
  ),
  verified(
    "protobuf",
    "protobuf.field-mask",
    "FieldMask",
    "registry/base-nova/protoform/lib/protobuf-provider/index.test.ts",
    "converts protobuf messages into form-friendly values"
  ),
  verified(
    "protobuf",
    "protobuf.dynamic-json",
    "Struct, Value, and ListValue",
    "conformance/protoform.conformance.test.ts",
    "round-trips optional, wrapper, JSON, map, bytes, and oneof values"
  ),
  verified(
    "protobuf",
    "protobuf.any",
    "Any",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips Any bytes, rejects malformed base64, and supports registered unpacking"
  ),
  verified(
    "protobuf",
    "protobuf.json-round-trip",
    "ProtoJSON round trip",
    "registry/base-nova/protoform/hooks/use-proto-form/use-proto-form.test.ts",
    "produces a message that survives JSON round-trip",
    recommended
  ),
  verified(
    "protobuf",
    "protobuf.custom-options",
    "Custom UI options",
    "registry/base-nova/protoform/lib/protobuf-provider/render-hints.test.ts",
    "specific annotation values map onto the right hint properties",
    recommended
  ),
  verified(
    "protobuf",
    "protobuf.recursive-messages",
    "Recursive message descriptors",
    "conformance/recursive-messages.conformance.test.ts",
    "bounds self-referential message and repeated-message expansion with a JSON leaf",
    recommended
  ),
  optional(
    "protobuf",
    "protobuf.v1-proto2-bridge",
    "Protobuf-ES v1 proto2/proto3 migration bridge",
    "registry/base-nova/protoform/lib/protobuf-v1-bridge/provider.test.ts",
    "preserves proto2 required fields, optional presence, enums, and declared defaults",
    "Maintained migration support is verified separately and does not count toward canonical v2 production readiness."
  ),
  verified(
    "protobuf",
    "protobuf.services",
    "Service and RPC descriptors",
    "registry/base-nova/protoform/lib/protobuf-provider/method-workflow.test.ts",
    "getProtoMethodWorkflow",
    required,
    "Generated service methods now expose request descriptors, HTTP field placement, method categories, and long-running operation metadata as form workflow input."
  ),
  excluded(
    "protobuf",
    "protobuf.proto2-extensions",
    "Proto2 groups and extensions",
    "out-of-target",
    "Extension and deprecated group discovery remain outside the canonical v2 target and are not promised by the isolated migration bridge."
  ),
  verified(
    "protobuf",
    "protobuf.unknown-fields",
    "Unknown fields on edited messages",
    "conformance/protobuf-matrix.conformance.test.ts",
    "preserves unknown fields when editing a parsed message"
  ),
  excluded(
    "protobuf",
    "protobuf.binary-wire-runtime",
    "Binary wire compatibility",
    "external",
    "Protobuf-ES owns binary parsing and serialization compatibility; Protoform preserves the messages it receives but does not implement the wire codec."
  ),
  verified(
    "protobuf",
    "protobuf.editions",
    "Editions 2023 descriptor compatibility",
    "conformance/protobuf-editions.conformance.test.ts",
    "accepts Editions descriptors and honors field presence controls"
  ),
  verified(
    "protobuf",
    "protobuf.editions-2024",
    "Edition 2024 visibility and option imports",
    "conformance/protobuf-editions.conformance.test.ts",
    "supports Edition 2024 visibility and option-only imports"
  ),
];

const protovalidateRequirements: readonly ReadinessRequirement[] = [
  verified(
    "protovalidate",
    "protovalidate.required",
    "Required field rules",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protovalidate",
    "protovalidate.oneof-required",
    "Required oneof rules",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protovalidate",
    "protovalidate.float-double",
    "Float and double rule families",
    "conformance/protovalidate-numeric.conformance.test.ts",
    "enforces const, comparisons, membership, finite values, and reversed ranges for %s"
  ),
  verified(
    "protovalidate",
    "protovalidate.signed-integers",
    "Signed integer rule families",
    "conformance/protovalidate-numeric.conformance.test.ts",
    "enforces const, comparisons, membership, and reversed ranges for %s"
  ),
  verified(
    "protovalidate",
    "protovalidate.unsigned-integers",
    "Unsigned integer rule families",
    "conformance/protovalidate-numeric.conformance.test.ts",
    "enforces const, comparisons, membership, and reversed ranges for %s"
  ),
  verified(
    "protovalidate",
    "protovalidate.bool",
    "Boolean rules",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces bool const for true, false, and the implicit default"
  ),
  verified(
    "protovalidate",
    "protovalidate.string-core",
    "String value and length rules",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces string const, code-point and byte lengths, pattern, affixes, contains, and membership"
  ),
  verified(
    "protovalidate",
    "protovalidate.string-uri",
    "URI string format",
    "conformance/protoform.conformance.test.ts",
    "reports $name with stable paths",
    required,
    "A malformed URI is verified through the public Standard Schema interface."
  ),
  verified(
    "protovalidate",
    "protovalidate.string-email",
    "Email string format",
    "conformance/email-adapters.conformance.test.tsx",
    "rejects malformed email through every supported form adapter"
  ),
  verified(
    "protovalidate",
    "protovalidate.string-uuid",
    "UUID string formats",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "validates UUID and trimmed UUID forms without rewriting accepted case"
  ),
  verified(
    "protovalidate",
    "protovalidate.string-network-formats",
    "Network and identifier string formats",
    "conformance/protovalidate-formats.conformance.test.ts",
    "validates the %s string format"
  ),
  verified(
    "protovalidate",
    "protovalidate.bytes",
    "Bytes rule family",
    "conformance/protovalidate-formats.conformance.test.ts",
    "validates the %s bytes rule"
  ),
  verified(
    "protovalidate",
    "protovalidate.enum",
    "Enum rule family",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces enum const, defined-only, allow and deny lists, aliases, and unknown values"
  ),
  verified(
    "protovalidate",
    "protovalidate.repeated-items",
    "Repeated item rules",
    "conformance/protoform.conformance.test.ts",
    "returns form-shaped paths for $name failures"
  ),
  verified(
    "protovalidate",
    "protovalidate.repeated-cardinality",
    "Repeated cardinality and uniqueness",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces repeated min, max, and uniqueness while allowing duplicate messages"
  ),
  verified(
    "protovalidate",
    "protovalidate.map-keys-values",
    "Map key and value rules",
    "conformance/protoform.conformance.test.ts",
    "reports $name with stable paths"
  ),
  verified(
    "protovalidate",
    "protovalidate.map-cardinality",
    "Map cardinality rules",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces map min and max pairs and rejects duplicate rendered keys"
  ),
  verified(
    "protovalidate",
    "protovalidate.any",
    "Any allow and deny lists",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces Any type URL allow and deny lists and rejects malformed form values"
  ),
  verified(
    "protovalidate",
    "protovalidate.duration",
    "Duration rule family",
    "conformance/protovalidate-formats.conformance.test.ts",
    "enforces duration const, comparisons, ranges, membership, normalization, and malformed input"
  ),
  verified(
    "protovalidate",
    "protovalidate.field-mask",
    "FieldMask rule family",
    "conformance/protovalidate-formats.conformance.test.ts",
    "enforces FieldMask const, allow, deny, and subpath semantics"
  ),
  verified(
    "protovalidate",
    "protovalidate.timestamp",
    "Timestamp rule family",
    "conformance/protovalidate-formats.conformance.test.ts",
    "enforces timestamp const, comparisons, reversed and now-relative ranges, timezone normalization, and malformed input"
  ),
  verified(
    "protovalidate",
    "protovalidate.ignore",
    "Ignore and zero-value semantics",
    "conformance/protovalidate-formats.conformance.test.ts",
    "applies IGNORE_ALWAYS and IGNORE_IF_ZERO_VALUE across scalar, message, repeated, and map fields"
  ),
  excluded(
    "protovalidate",
    "protovalidate.message-options",
    "Message disabled and skip semantics",
    "superseded",
    "The installed Protovalidate schema reserves the former disabled option and replaces skip behavior with the separately verified ignore rules."
  ),
  verified(
    "protovalidate",
    "protovalidate.all-violations",
    "All violations remain visible",
    "conformance/protoform.conformance.test.ts",
    "reports $name with stable paths"
  ),
  verified(
    "protovalidate",
    "protovalidate.predefined",
    "Custom predefined rules",
    "conformance/protovalidate-formats.conformance.test.ts",
    "executes custom predefined rules with a stable rule id and form path",
    recommended
  ),
  verified(
    "protovalidate",
    "protovalidate.examples",
    "Standard rule examples",
    "conformance/protovalidate-formats.conformance.test.ts",
    "keeps standard rule examples non-validating and surfaces the first example as form guidance",
    recommended
  ),
];

const celRequirements: readonly ReadinessRequirement[] = [
  verified(
    "cel",
    "cel.syntax-literals",
    "Syntax and literals",
    "conformance/cel-language.conformance.test.ts",
    "supports CEL syntax, literals, scalar types, operators, and conversions"
  ),
  verified(
    "cel",
    "cel.scalar-types",
    "Scalar and null types",
    "conformance/cel-language.conformance.test.ts",
    "supports CEL syntax, literals, scalar types, operators, and conversions"
  ),
  verified(
    "cel",
    "cel.operators",
    "Logical, relational, and arithmetic operators",
    "conformance/cel-language.conformance.test.ts",
    "supports CEL syntax, literals, scalar types, operators, and conversions"
  ),
  verified(
    "cel",
    "cel.conversions",
    "Explicit scalar conversions",
    "conformance/cel-language.conformance.test.ts",
    "supports CEL syntax, literals, scalar types, operators, and conversions"
  ),
  verified(
    "cel",
    "cel.lists-maps",
    "List and map values",
    "conformance/cel-language.conformance.test.ts",
    "supports lists, maps, and every standard comprehension macro"
  ),
  verified(
    "cel",
    "cel.protobuf-messages",
    "Protobuf message values",
    "conformance/cel-protobuf.conformance.test.ts",
    "evaluates protobuf messages, enums, presence, collections, bytes, and temporal values"
  ),
  verified(
    "cel",
    "cel.enums",
    "Protobuf enum values",
    "conformance/cel-protobuf.conformance.test.ts",
    "evaluates protobuf messages, enums, presence, collections, bytes, and temporal values"
  ),
  verified(
    "cel",
    "cel.presence",
    "Protobuf field presence",
    "conformance/cel-protobuf.conformance.test.ts",
    "evaluates protobuf messages, enums, presence, collections, bytes, and temporal values"
  ),
  ...(
    [
      ["cel.comprehension-all", "all comprehension"],
      ["cel.comprehension-exists", "exists comprehension"],
      ["cel.comprehension-exists-one", "exists_one comprehension"],
      ["cel.comprehension-filter", "filter comprehension"],
      ["cel.comprehension-map", "map comprehension"],
    ] as const
  ).map(([id, title]) =>
    verified(
      "cel",
      id,
      title,
      "conformance/cel-language.conformance.test.ts",
      "supports lists, maps, and every standard comprehension macro"
    )
  ),
  verified(
    "cel",
    "cel.strings",
    "String functions and regular expressions",
    "conformance/cel-language.conformance.test.ts",
    "supports string and bytes operations"
  ),
  verified(
    "cel",
    "cel.bytes",
    "Bytes literals and operations",
    "conformance/cel-language.conformance.test.ts",
    "supports string and bytes operations"
  ),
  verified(
    "cel",
    "cel.timestamps",
    "Timestamp functions and arithmetic",
    "conformance/cel-language.conformance.test.ts",
    "supports timestamp and duration construction, comparison, and arithmetic"
  ),
  verified(
    "cel",
    "cel.durations",
    "Duration functions and arithmetic",
    "conformance/cel-language.conformance.test.ts",
    "supports timestamp and duration construction, comparison, and arithmetic"
  ),
  verified(
    "cel",
    "cel.error-propagation",
    "Evaluation error propagation",
    "conformance/cel-language.conformance.test.ts",
    "propagates errors while preserving logical short circuit behavior"
  ),
  verified(
    "cel",
    "cel.unknown-attributes",
    "Partial unknown-set propagation",
    "conformance/cel-runtime.conformance.test.ts",
    "propagates partial unknown attributes separately from evaluation errors",
    recommended
  ),
  verified(
    "cel",
    "cel.short-circuit",
    "Logical short-circuit behavior",
    "conformance/cel-language.conformance.test.ts",
    "propagates errors while preserving logical short circuit behavior"
  ),
  verified(
    "cel",
    "cel.parse-plan-evaluate",
    "Parse, plan, and evaluate lifecycle",
    "conformance/cel-language.conformance.test.ts",
    "parses once and reuses a planned expression across evaluations"
  ),
  verified(
    "cel",
    "cel.compile-cache",
    "Reusable compiled evaluation plans",
    "conformance/cel-language.conformance.test.ts",
    "parses once and reuses a planned expression across evaluations"
  ),
  verified(
    "cel",
    "cel.protovalidate-message",
    "Protovalidate message CEL",
    "conformance/cel.conformance.test.ts",
    "returns every message and field CEL violation without dropping any"
  ),
  verified(
    "cel",
    "cel.protovalidate-field",
    "Protovalidate field CEL",
    "conformance/cel.conformance.test.ts",
    "preserves a field boolean CEL rule id, message, and form path"
  ),
  verified(
    "cel",
    "cel.protovalidate-predefined",
    "Protovalidate predefined CEL rules",
    "conformance/protovalidate-formats.conformance.test.ts",
    "executes custom predefined rules with a stable rule id and form path"
  ),
  verified(
    "cel",
    "cel.ui-profile",
    "Restricted UI expression profile",
    "registry/base-nova/protoform/components/auto-form/ui-rules.test.ts",
    "exposes only form and current-field values to UI expressions"
  ),
  verified(
    "cel",
    "cel.ui-fail-closed",
    "UI expressions fail closed",
    "registry/base-nova/protoform/components/auto-form/ui-rules.test.ts",
    "fails closed for malformed, unknown, erroring, and non-boolean rules"
  ),
  verified(
    "cel",
    "cel.complexity-minimum",
    "Specification minimum nesting and repetition",
    "conformance/cel-language.conformance.test.ts",
    "meets the CEL minimum expression nesting and repetition limits"
  ),
  verified(
    "cel",
    "cel.cost-limits",
    "Configurable evaluation cost limits",
    "conformance/cel-runtime.conformance.test.ts",
    "enforces a configurable execution budget and fails safely",
    recommended
  ),
  verified(
    "cel",
    "cel.safe-failure",
    "Safe runtime failure",
    "conformance/cel-language.conformance.test.ts",
    "returns safe errors instead of throwing for invalid runtime inputs"
  ),
  verified(
    "cel",
    "cel.message-string",
    "Dynamic string-returning violations",
    "examples/kitchen-sink/kitchen-sink-cel.test.ts",
    "an invalid progressive rollout sequence"
  ),
  verified(
    "cel",
    "cel.language-coverage",
    "Form-relevant CEL language coverage",
    "examples/kitchen-sink/kitchen-sink-cel.test.ts",
    "kitchen-sink CEL contract",
    recommended
  ),
  verified(
    "cel",
    "cel.nested-paths",
    "Nested and repeated violation paths",
    "conformance/cel.conformance.test.ts",
    "preserves nested and repeated message CEL paths including every index"
  ),
  verified(
    "cel",
    "cel.multiple-violations",
    "Complete multi-violation reporting",
    "conformance/cel.conformance.test.ts",
    "returns every message and field CEL violation without dropping any"
  ),
  excluded(
    "cel",
    "cel.backend-policy",
    "Backend authorization and policy CEL",
    "external",
    "Protoform evaluates expressions that describe form values and presentation. Authorization and backend policy decisions must remain server-owned."
  ),
];

function aipVerified(
  number: number,
  title: string,
  file: string,
  testName: string,
  description?: string,
  standardState: AipStandardState = "approved"
): VerifiedRequirement {
  return {
    ...verified("aip", `aip.${number}`, `AIP-${number} ${title}`, file, testName, required, description),
    evidenceScope: "client",
    sourceUrl: `https://google.aip.dev/${number}`,
    standardState,
  };
}

function aipExcluded(
  number: number,
  title: string,
  status: ExcludedRequirement["status"],
  rationale: string,
  standardState: AipStandardState = "approved"
): ExcludedRequirement {
  return {
    ...excluded("aip", `aip.${number}`, `AIP-${number} ${title}`, status, rationale),
    evidenceScope: "external",
    sourceUrl: `https://google.aip.dev/${number}`,
    standardState,
  };
}

const aipRequirements: readonly ReadinessRequirement[] = [
  aipExcluded(
    1,
    "AIP purpose and guidelines",
    "external",
    "AIP document governance is owned by the AIP project, not a form runtime."
  ),
  aipExcluded(
    2,
    "AIP numbering",
    "external",
    "Number allocation is owned by the AIP project, not API consumers or form libraries."
  ),
  aipExcluded(
    3,
    "AIP versioning",
    "external",
    "AIP document revisions are governance metadata; API and protobuf compatibility are tracked separately."
  ),
  aipExcluded(
    8,
    "AIP style and guidance",
    "external",
    "Proposal-writing style is a documentation process and cannot be proven by form conformance."
  ),
  aipExcluded(
    9,
    "Glossary",
    "external",
    "The General AIP glossary defines shared terminology but has no executable form behavior."
  ),
  aipExcluded(
    100,
    "API design review FAQ",
    "external",
    "API design review is an organization-owned process, not a Protoform runtime behavior."
  ),
  aipExcluded(
    111,
    "Planes",
    "external",
    "Control-plane and data-plane boundaries are chosen and enforced by the backend architecture."
  ),
  aipVerified(
    121,
    "Resource-oriented design",
    "conformance/aip.conformance.test.ts",
    "parses AIP-121/123 resource type, pattern, singular, and plural metadata",
    "Resource descriptors remain the contract that drives form-visible resource fields."
  ),
  aipVerified(
    122,
    "Resource names",
    "conformance/aip.conformance.test.ts",
    "keeps AIP-122 full resource names distinct from display names and create IDs"
  ),
  aipVerified(
    123,
    "Resource types",
    "conformance/aip.conformance.test.ts",
    "parses AIP-121/123 resource type, pattern, singular, and plural metadata"
  ),
  aipVerified(
    124,
    "Resource association",
    "conformance/aip.conformance.test.ts",
    "preserves AIP-124 parent and resource associations on request fields"
  ),
  aipVerified(
    126,
    "Enumerations",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces enum const, defined-only, allow and deny lists, aliases, and unknown values",
    "Enum values, aliases, and unknown numeric values pass through the same typed form boundary."
  ),
  aipVerified(
    127,
    "HTTP and gRPC transcoding",
    "registry/base-nova/protoform/lib/protobuf-provider/method-workflow.test.ts",
    "classifies standard unary methods and their path, query, and body fields",
    "HTTP annotations partition request fields into path, query, and body roles without changing the typed request descriptor."
  ),
  aipVerified(
    128,
    "Declarative-friendly interfaces",
    "conformance/aip.conformance.test.ts",
    "models AIP-155 request IDs and AIP-163 validation previews as optional mutation controls",
    "Declarative mutation forms preserve validate_only while reconciliation remains server-owned."
  ),
  aipVerified(
    129,
    "Server-modified values and defaults",
    "conformance/aip.conformance.test.ts",
    "treats AIP-148 canonical identity, display, and lifecycle fields correctly",
    "Server-owned output fields are hidden; the backend still computes their values and defaults."
  ),
  aipVerified(
    130,
    "Methods",
    "registry/base-nova/protoform/lib/protobuf-provider/method-workflow.test.ts",
    "getProtoMethodWorkflow",
    "Generated descriptors classify standard, batch, custom, streaming, and long-running method workflows."
  ),
  aipVerified(
    131,
    "Standard methods: Get",
    "conformance/aip.conformance.test.ts",
    "models AIP-131 Get as a field-1 full resource name with a matching reference"
  ),
  aipVerified(
    132,
    "Standard methods: List",
    "conformance/aip.conformance.test.ts",
    "models AIP-132/158/160 List request and response fields without interpreting opaque values"
  ),
  aipVerified(
    133,
    "Standard methods: Create",
    "conformance/aip.conformance.test.ts",
    "models AIP-133 Create with parent, body, resource ID, and no body name input"
  ),
  aipVerified(
    134,
    "Standard methods: Update",
    "registry/base-nova/protoform/lib/protobuf-provider/field-mask.test.ts",
    "excludes AIP-owned fields from update masks",
    "Update masks contain only dirty editable protobuf paths."
  ),
  aipVerified(
    135,
    "Standard methods: Delete",
    "conformance/aip.conformance.test.ts",
    "models AIP-135/154 Delete with full name and optional etag"
  ),
  aipVerified(
    136,
    "Custom methods",
    "examples/basic/basic-form.test.tsx",
    "submits a generated protobuf message to the local Connect server",
    "The canonical SubmitBasicForm workflow proves a typed unary custom mutation without inventing a second RPC."
  ),
  aipVerified(
    140,
    "Field names",
    "registry/base-nova/protoform/lib/protobuf-provider/form-schema.test.ts",
    "invalid form values produce issues with form-shaped camelCase paths",
    "Protobuf snake_case fields map deterministically to TypeScript camelCase form paths."
  ),
  aipVerified(
    141,
    "Quantities",
    "conformance/aip-field-patterns.conformance.test.ts",
    "models AIP-141 quantities with signed numeric fields and units in field names",
    "Quantity units remain explicit in signed numeric field names, while counts use the standard count suffix."
  ),
  aipVerified(
    142,
    "Time and duration",
    "conformance/protovalidate-formats.conformance.test.ts",
    "enforces timestamp const, comparisons, reversed and now-relative ranges, timezone normalization, and malformed input"
  ),
  aipVerified(
    143,
    "Standardized codes",
    "conformance/aip-field-patterns.conformance.test.ts",
    "models AIP-143 standardized codes as validated strings rather than enums",
    "Currency, language, region, and time-zone codes remain forward-compatible strings with schema-owned format validation."
  ),
  aipVerified(
    144,
    "Repeated fields",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips repeated messages and preserves indexed validation paths after removal"
  ),
  aipVerified(
    145,
    "Ranges",
    "conformance/aip-field-patterns.conformance.test.ts",
    "validates AIP-145 inclusive-start, exclusive-end ranges and open bounds",
    "Optional start and end timestamps support open bounds and reject empty or reversed half-open intervals."
  ),
  aipVerified(
    146,
    "Generic fields",
    "conformance/protobuf-matrix.conformance.test.ts",
    "round-trips Any bytes, rejects malformed base64, and supports registered unpacking",
    "Generic protobuf payloads fail safely and require an explicit type registry when unpacked."
  ),
  aipVerified(
    147,
    "Sensitive fields",
    "examples/complex/complex-form.test.tsx",
    "redacts credentials from the final review summary",
    "Sensitive values remain usable for submission but are redacted from review output."
  ),
  aipVerified(
    148,
    "Standard fields",
    "conformance/aip.conformance.test.ts",
    "treats AIP-148 canonical identity, display, and lifecycle fields correctly"
  ),
  aipVerified(
    149,
    "Unset field values",
    "conformance/protobuf-matrix.conformance.test.ts",
    "distinguishes explicit presence while documenting implicit scalar loss"
  ),
  aipVerified(
    151,
    "Long-running operations",
    "registry/base-nova/protoform/lib/protobuf-provider/aip-client-workflow.test.ts",
    "runProtoOperation",
    "The operation runner exposes progress, polls named operations, cancels on abort, and surfaces terminal google.rpc.Status errors."
  ),
  aipVerified(
    152,
    "Jobs",
    "conformance/aip-workflows.conformance.test.ts",
    "models AIP-152 Job configuration and Run request forms",
    "Job resources expose descriptor-driven configuration and Run request forms that compose with the cancellable operation runner."
  ),
  aipVerified(
    153,
    "Import and export",
    "conformance/aip-workflows.conformance.test.ts",
    "models AIP-153 import and export source choices plus partial failures",
    "Required source and destination oneofs, storage validation, and structured partial failures compose with long-running progress."
  ),
  aipVerified(
    154,
    "Resource freshness validation",
    "conformance/aip.conformance.test.ts",
    "models AIP-135/154 Delete with full name and optional etag",
    "Forms preserve etags; comparison and ABORTED responses remain server-owned."
  ),
  aipVerified(
    155,
    "Request identification",
    "conformance/aip.conformance.test.ts",
    "models AIP-155 request IDs and AIP-163 validation previews as optional mutation controls",
    "Mutation requests expose optional UUID-capable request IDs; deduplication remains server-owned."
  ),
  aipVerified(
    156,
    "Singleton resources",
    "conformance/aip.conformance.test.ts",
    "recognizes AIP-156 singleton resources and their Get/Update-only shapes"
  ),
  aipVerified(
    157,
    "Partial responses",
    "registry/base-nova/protoform/lib/protobuf-provider/field-mask.test.ts",
    "normalizes and minimizes explicit read-mask paths",
    "Explicit read projections are validated and minimized; touched fields never guess a response projection."
  ),
  aipVerified(
    158,
    "Pagination",
    "conformance/aip.conformance.test.ts",
    "models AIP-132/158/160 List request and response fields without interpreting opaque values",
    "Forms preserve page_size and opaque page_token fields; token semantics remain server-owned."
  ),
  aipVerified(
    159,
    "Reading across collections",
    "conformance/aip-workflows.conformance.test.ts",
    "enforces AIP-159 cross-collection and AIP-217 partial-result controls",
    "Wildcard parents permit filters and partial success while rejecting cross-collection ordering."
  ),
  aipVerified(
    160,
    "Filtering",
    "conformance/aip.conformance.test.ts",
    "models AIP-132/158/160 List request and response fields without interpreting opaque values",
    "The list form preserves filter and order_by strings; filter parsing and evaluation remain server-owned."
  ),
  aipVerified(
    161,
    "Field masks",
    "registry/base-nova/protoform/lib/protobuf-provider/field-mask.test.ts",
    "includes only dirty protobuf fields and collapses collections"
  ),
  aipVerified(
    162,
    "Resource revisions",
    "conformance/aip.conformance.test.ts",
    "models AIP-162 revisions as nested, server-produced snapshot resources",
    "The draft revision shape is tracked explicitly and may change with the upstream AIP.",
    "draft"
  ),
  aipVerified(
    163,
    "Change validation",
    "conformance/aip.conformance.test.ts",
    "models AIP-155 request IDs and AIP-163 validation previews as optional mutation controls"
  ),
  aipVerified(
    164,
    "Soft delete",
    "conformance/aip.conformance.test.ts",
    "models AIP-164 soft delete lifecycle fields and undelete identity"
  ),
  aipVerified(
    165,
    "Criteria-based delete",
    "conformance/aip-workflows.conformance.test.ts",
    "models the AIP-165 purge preview and destructive confirmation",
    "Purge forms require a filter; force=false remains a non-destructive count/sample preview and force=true requires confirmation."
  ),
  aipVerified(
    180,
    "Backwards compatibility",
    "scripts/buf-policy.test.ts",
    "enforces target-branch compatibility and rejects an isolated fixture",
    "CI compares stable protobuf modules with the pull request target and rejects every non-waived FILE compatibility violation."
  ),
  aipVerified(
    181,
    "Stability levels",
    "registry/base-nova/protoform/lib/protobuf-provider/aip-client-workflow.test.ts",
    "presents AIP-181 alpha, beta, stable, and deprecated guidance from generated descriptors",
    "Versioned descriptor type names and deprecation metadata produce explicit preview and migration guidance."
  ),
  aipVerified(
    182,
    "External software dependencies",
    "scripts/registry-only-distribution.test.ts",
    "ships Protoform under MIT without private package workspaces",
    "Every external runtime dependency is declared by a public source-copy registry item.",
    "reviewing"
  ),
  aipVerified(
    185,
    "API versioning",
    "conformance/aip.conformance.test.ts",
    "keeps AIP-185 API versions in the protobuf package"
  ),
  aipVerified(
    190,
    "Naming conventions",
    "scripts/buf-policy.test.ts",
    "passes Buf STANDARD including the complete Protovalidate lint rule"
  ),
  aipVerified(
    191,
    "File and directory structure",
    "scripts/buf-policy.test.ts",
    "passes Buf STANDARD including the complete Protovalidate lint rule"
  ),
  aipVerified(
    192,
    "Documentation",
    "registry/base-nova/protoform/scripts/protoc-gen-protoform/plugin.test.ts",
    "emits source comments as registered form annotations",
    "Generated bindings preserve public message and field comments as descriptor-keyed form help."
  ),
  aipVerified(
    193,
    "Errors",
    "conformance/aip-errors.conformance.test.ts",
    "extracts field violations plus localized, retry, request, precondition, quota, and machine details"
  ),
  aipVerified(
    194,
    "Automatic retry configuration",
    "registry/base-nova/protoform/lib/protobuf-provider/aip-client-workflow.test.ts",
    "retries only idempotent unary UNAVAILABLE calls and respects RetryInfo",
    "Only explicitly idempotent unary UNAVAILABLE calls retry automatically; unsafe, streaming, and other-code failures surface immediately."
  ),
  aipExcluded(
    200,
    "Precedent",
    "external",
    "AIP precedent labels govern API design decisions and have no executable form behavior."
  ),
  aipVerified(
    202,
    "Fields",
    "conformance/protoform.conformance.test.ts",
    "maps $key into the stable field model",
    "Every declared protobuf field enters the stable provider model without changing its contract identity."
  ),
  aipVerified(
    203,
    "Field behavior documentation",
    "conformance/aip.conformance.test.ts",
    "applies AIP-203 REQUIRED, OPTIONAL, IDENTIFIER, OUTPUT_ONLY, IMMUTABLE, and INPUT_ONLY in create and update forms"
  ),
  aipExcluded(
    205,
    "Beta-blocking changes",
    "external",
    "Beta launch blocking is an API review and release-management process, not form runtime behavior."
  ),
  aipVerified(
    210,
    "Unicode",
    "conformance/protovalidate-matrix.conformance.test.ts",
    "enforces string const, code-point and byte lengths, pattern, affixes, contains, and membership"
  ),
  aipExcluded(
    211,
    "Authorization checks",
    "external",
    "Authorization must be enforced by the server; UI visibility is never treated as an access-control decision."
  ),
  aipVerified(
    213,
    "Common components",
    "conformance/protovalidate-formats.conformance.test.ts",
    "enforces duration const, comparisons, ranges, membership, normalization, and malformed input",
    "Forms use the standard protobuf well-known types rather than frontend-only replacements."
  ),
  aipVerified(
    214,
    "Resource expiration",
    "conformance/aip.conformance.test.ts",
    "models AIP-214 expiration choices and keeps the AIP-216 state server-owned"
  ),
  aipExcluded(
    215,
    "API-specific protos",
    "external",
    "Which shared protos belong to an API surface is a service schema and repository ownership decision."
  ),
  aipVerified(
    216,
    "States",
    "conformance/aip.conformance.test.ts",
    "models AIP-214 expiration choices and keeps the AIP-216 state server-owned"
  ),
  aipVerified(
    217,
    "Unreachable resources",
    "conformance/aip-workflows.conformance.test.ts",
    "enforces AIP-159 cross-collection and AIP-217 partial-result controls",
    "UNORDERED_LIST unreachable names become an incomplete-results warning with a targeted retry action for every resource."
  ),
  aipVerified(
    231,
    "Batch methods: Get",
    "conformance/aip.conformance.test.ts",
    "models AIP-231/233/234/235 batch request and response envelopes"
  ),
  aipVerified(
    233,
    "Batch methods: Create",
    "conformance/aip.conformance.test.ts",
    "models AIP-231/233/234/235 batch request and response envelopes"
  ),
  aipVerified(
    234,
    "Batch methods: Update",
    "conformance/aip.conformance.test.ts",
    "models AIP-231/233/234/235 batch request and response envelopes"
  ),
  aipVerified(
    235,
    "Batch methods: Delete",
    "conformance/aip.conformance.test.ts",
    "models AIP-231/233/234/235 batch request and response envelopes"
  ),
  aipVerified(
    236,
    "Policy preview",
    "conformance/aip-workflows.conformance.test.ts",
    "models AIP-236 policy experiments and distinguishes preview from commit",
    "Experiment forms keep preview metadata output-only, label preview as non-enforcing, and require confirmation plus etag for live commit."
  ),
];

const productionRequirements: readonly ReadinessRequirement[] = [
  verified(
    "production",
    "production.standard-schema",
    "Standard Schema interoperability",
    "registry/base-nova/protoform/lib/protobuf-provider/form-schema.test.ts",
    "createProtoFormSchema returns a Standard Schema"
  ),
  verified(
    "production",
    "production.standard-schema-consumer",
    "Standard Schema consumer interoperability",
    "conformance/standard-schema.conformance.test.ts",
    "supports callable schemas and forwards vendor options"
  ),
  verified(
    "production",
    "production.react-hook-form",
    "React Hook Form integration",
    "registry/base-nova/protoform/components/auto-form/__tests__/proto-forms.test.tsx",
    "submits protobuf descriptors with protobuf-shaped output"
  ),
  verified(
    "production",
    "production.tanstack-form",
    "TanStack Form integration",
    "examples/tanstack/tanstack-form.test.tsx",
    "submits the Standard Schema output as a typed protobuf message"
  ),
  verified(
    "production",
    "production.formik",
    "Formik integration",
    "examples/form-libraries/form-libraries.test.tsx",
    "validates with Formik and submits a typed protobuf message"
  ),
  verified(
    "production",
    "production.final-form",
    "Final Form integration",
    "examples/form-libraries/form-libraries.test.tsx",
    "validates with Final Form and submits a typed protobuf message"
  ),
  verified(
    "production",
    "production.auto-form",
    "Descriptor-driven AutoForm",
    "registry/base-nova/protoform/components/auto-form/__tests__/proto-forms.test.tsx",
    "shows protobuf field-level validation feedback"
  ),
  verified(
    "production",
    "production.stepper",
    "Semantic linear steppers",
    "registry/base-nova/protoform/components/auto-form/__tests__/stepper.test.tsx",
    "renders one step at a time with semantic progress and linear navigation"
  ),
  verified(
    "production",
    "production.server-errors",
    "Structured server field errors",
    "examples/complex/complex-form.test.tsx",
    "routes a structured submit error back to the step that owns the field"
  ),
  verified(
    "production",
    "production.submit-failures",
    "Submission failures remain visible",
    "registry/base-nova/protoform/components/auto-form/__tests__/resilience.test.tsx",
    "shows root error when onSubmit rejects"
  ),
  verified(
    "production",
    "production.credential-redaction",
    "Sensitive review values are redacted",
    "examples/complex/complex-form.test.tsx",
    "redacts credentials from the final review summary"
  ),
  verified(
    "production",
    "production.accessibility",
    "Automated accessibility",
    "e2e/accessibility.spec.ts",
    "has no serious accessibility violations across representative form states"
  ),
  verified(
    "production",
    "production.keyboard",
    "Keyboard-only workflows",
    "registry/base-nova/protoform/components/auto-form/__tests__/stepper.test.tsx",
    "completes validation recovery and every step using only the keyboard"
  ),
  verified(
    "production",
    "production.cross-browser",
    "Chromium, Firefox, and WebKit",
    "scripts/browser-matrix.test.ts",
    "runs the end-to-end form suite in Chromium, Firefox, and WebKit"
  ),
  verified(
    "production",
    "production.narrow-viewport",
    "Narrow viewport layout",
    "e2e/docs-screenshots.spec.ts",
    "keeps the complex stepper usable at a narrow viewport"
  ),
  verified(
    "production",
    "production.ssr-hydration",
    "SSR and hydration",
    "e2e/docs-screenshots.spec.ts",
    "hydrates and renders docs screenshot:"
  ),
  verified(
    "production",
    "production.local-transport",
    "Generated client to TypeScript server",
    "examples/basic/basic-form.test.tsx",
    "submits a generated protobuf message to the local Connect server"
  ),
  verified(
    "production",
    "production.cancellation",
    "Async cancellation and stale responses",
    "registry/base-nova/protoform/components/auto-form/__tests__/resilience.test.tsx",
    "aborts active provider validation when the form unmounts"
  ),
  verified(
    "production",
    "production.registry-dependencies",
    "Registry dependency contract",
    "scripts/registry-only-distribution.test.ts",
    "ships Protoform under MIT without private package workspaces"
  ),
  verified(
    "production",
    "production.performance",
    "Large-form performance budget",
    "conformance/performance.conformance.test.tsx",
    "keeps render, validation, field change, and step transition within budgets for a $fields-field descriptor",
    recommended
  ),
  verified(
    "production",
    "production.bundle-size",
    "Bundle-size budget",
    "scripts/bundle-budget.test.ts",
    "enforces registry runtime and example budgets",
    recommended
  ),
  verified(
    "production",
    "production.untrusted-input",
    "Untrusted schema and error text",
    "conformance/untrusted-input.conformance.test.tsx",
    "rejects malformed descriptors, conversion values, and server paths without throwing"
  ),
];

export const readinessRequirements: readonly ReadinessRequirement[] = [
  ...protobufRequirements,
  ...protovalidateRequirements,
  ...celRequirements,
  ...aipRequirements,
  ...productionRequirements,
];

export function getReadinessSummary(requirements: readonly ReadinessRequirement[]): ReadinessSummary {
  const count = (status: ReadinessRequirement["status"]): number =>
    requirements.filter((requirement) => requirement.status === status).length;
  const verifiedCount = count("verified");
  const missingCount = count("missing");
  const deferredCount = count("deferred");
  const unsupportedCount = count("unsupported");
  const externalCount = count("external");
  const optionalCount = count("optional");
  const outOfTargetCount = count("out-of-target");
  const supersededCount = count("superseded");
  const applicable = verifiedCount + missingCount + deferredCount + unsupportedCount;
  const percentage = applicable === 0 ? 0 : Math.round((verifiedCount / applicable) * 100);
  return {
    applicable,
    deferred: deferredCount,
    excluded: externalCount + optionalCount + outOfTargetCount + supersededCount,
    external: externalCount,
    missing: missingCount,
    optional: optionalCount,
    outOfTarget: outOfTargetCount,
    percentage,
    profileComplete: applicable > 0 && missingCount === 0 && deferredCount === 0 && unsupportedCount === 0,
    superseded: supersededCount,
    unsupported: unsupportedCount,
    verified: verifiedCount,
  };
}
