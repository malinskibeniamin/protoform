# Protoform domain glossary

- **Edit source message**: The protobuf message loaded for an update form. Unknown wire fields on this message remain attached to the same surviving message nodes when edited form values are converted back to protobuf.
- **Configuration diagnostic**: A deterministic, schema-agnostic pre-render finding that identifies an AutoForm configuration defect by code and schema path.
- **Runtime message**: Protoform-owned user-facing text identified by a stable code, interpolation parameters, and an English fallback. Hosts may translate it without replacing schema-authored or server-authored text.
- **Provider request**: The field context supplied to a data provider, including search text, pagination cursor, selected values, declared dependency values, and a cancellation signal. The provider resolves options but does not own form state.
- **Stale selection**: A value retained in form state that is absent from the provider's current option set. Provider registration declares whether Protoform preserves, clears, or reports it.
- **Mutation request composer**: A pure descriptor-driven operation that wraps resource form output and standard mutation controls in a typed protobuf request. It never performs the RPC.
- **Audit target**: A named AutoForm schema and its declared configuration, renderers, and providers that can be inspected without rendering the form.
- **Form values**: Adapter-neutral values used by form engines. They intentionally omit protobuf runtime metadata and unknown wire fields.
- **Edit baseline**: The accepted field state at the start of an edit session or after a reset.
- **Modification intent**: A field the user intentionally changed after the edit baseline. The intent remains even when the current value equals the baseline again.
- **Partial-edit validation**: Validation that reports field issues only for modification intent while retaining message-level issues that cannot be attributed safely.
- **UI component map**: The exhaustive host-owned set of shadcn-compatible primitives used by Protoform's registry-installed renderers.
- **shadcn adapter**: A registry source file that maps Protoform's UI boundary to the consumer's local shadcn component aliases without copying implementations.
- **Compiled core package**: `@protoform/core`; the versioned manual-form surface for protobuf conversion, validation, server-error mapping, and `useProtoForm`. It never installs AutoForm.
- **AutoForm renderer package**: `@protoform/auto-form`; the versioned engine-neutral renderer and field logic. It requires a host-owned UI component map and does not ship shadcn implementations.
- **React umbrella package**: `@protoform/react`; the versioned React Hook Form surface that composes and re-exports the compiled core package and AutoForm renderer package so both update together.
