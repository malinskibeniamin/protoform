# Protoform domain glossary

- **Edit source message**: The protobuf message loaded for an update form. Unknown wire fields on this message remain attached to the same surviving message nodes when edited form values are converted back to protobuf.
- **Configuration diagnostic**: A deterministic, schema-agnostic pre-render finding that identifies an AutoForm configuration defect by code and schema path.
- **Form values**: Adapter-neutral values used by form engines. They intentionally omit protobuf runtime metadata and unknown wire fields.
