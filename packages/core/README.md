# @protoform/core

Compiled Protoform support for manually authored React Hook Form forms. It includes protobuf
conversion, ProtoValidate and CEL validation, server-error mapping, and `useProtoForm`. It does not
include AutoForm or UI components.

```bash
bun add @protoform/core
```

```tsx
import { useProtoForm } from "@protoform/core";

const form = useProtoForm(RequestSchema);
```

Use `@protoform/react` when the same application also needs schema-generated AutoForm rendering.
