# @protoform/react

The combined React Hook Form package for Protoform. It exports `useProtoForm` for manually authored
forms and `AutoForm` for schema-generated forms, so both capabilities update together.

```bash
bun add @protoform/react
```

AutoForm is headless. Pass the application-owned component map:

```tsx
import { AutoForm } from "@protoform/react";
import { protoformComponents } from "./protoform-components";

<AutoForm components={protoformComponents} schema={RequestSchema} />;
```

Install `@protoform/core` instead when the application only uses manual forms.
