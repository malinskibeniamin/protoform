# Protoform domain glossary

- **Edit source message**: The protobuf message loaded for an update form. Unknown wire fields on this message remain attached to the same surviving message nodes when edited form values are converted back to protobuf.
- **Configuration diagnostic**: A deterministic, schema-agnostic pre-render finding that identifies an AutoForm configuration defect by code and schema path.
- **Form values**: Adapter-neutral values used by form engines. They intentionally omit protobuf runtime metadata and unknown wire fields.
- **Edit baseline**: The accepted field state at the start of an edit session or after a reset.
- **Modification intent**: A field the user intentionally changed after the edit baseline. The intent remains even when the current value equals the baseline again.
- **Partial-edit validation**: Validation that reports field issues only for modification intent while retaining message-level issues that cannot be attributed safely.
