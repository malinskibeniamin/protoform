#!/usr/bin/env bun
export {};

const [, , zodFile = "<path-to-zod-form.tsx>", protoFile = "<path-to-target.proto>"] = process.argv;

const prompt = `You are migrating a shadcn React Hook Form from Zod to Protoform.

Inputs:
- Zod/RHF file: ${zodFile}
- Target proto file: ${protoFile}

Goal:
Move validation source of truth from Zod into protobuf + buf.validate annotations, then replace zodResolver with useProtoForm.

Steps:
1. Read the Zod schema and list every field, type, optional/default behavior, error message, regex, enum, union, and refine/superRefine rule.
2. Map scalar rules to buf.validate.field annotations.
3. Map cross-field refine/superRefine logic to message-level CEL expressions with stable ids and user-facing messages.
4. Map discriminated unions to protobuf oneof fields. Use useProtoForm.setOneofValue for branch changes.
5. Preserve existing shadcn Field/FieldLabel/FieldDescription/FieldError accessibility semantics.
6. Replace useForm<z.infer<...>> + zodResolver(...) with useProtoForm(MessageSchema, { defaultValues }).
7. Replace submit payload transforms with form.createMessage(values).
8. Add form.setServerErrors(error) handling for ConnectError / google.rpc.BadRequest.FieldViolation.
9. If labels/help text/options are only in React, propose protoform AutoForm UI annotations.
10. Keep the migration incremental: do not rewrite unrelated layout or business logic.

Output:
- Updated proto diff.
- Updated React diff.
- Any validation semantics that cannot be represented exactly.
- Suggested tests for valid input, invalid field annotations, CEL errors, oneof switching, and server error mapping.
`;

console.log(prompt);
