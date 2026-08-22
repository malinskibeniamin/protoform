import { expect, rs } from "@rstest/core";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TanStackFormExample } from "../examples/tanstack/tanstack-form.js";
import { AutoForm } from "../registry/base-nova/protoform/components/auto-form/index.js";
import { createFinalFormValidator, createFormikValidator } from "../registry/base-nova/protoform/lib/core/index.js";
import { createProtoFormSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { EmailContractSchema } from "./gen/protoform/conformance/v1/conformance_pb.js";

const DISPLAY_NAME_PATTERN = /display name/iu;
const EMAIL_PATTERN = /email/iu;

test("rejects malformed email through every supported form adapter", async () => {
  const schema = createProtoFormSchema(EmailContractSchema);
  const invalidValues = { email: "not-an-email" };
  const direct = await schema["~standard"].validate(invalidValues);

  expect(direct.issues).toEqual([expect.objectContaining({ path: ["email"] })]);
  expect(await createFormikValidator(schema)(invalidValues)).toHaveProperty("email");
  expect(await createFinalFormValidator(schema)(invalidValues)).toHaveProperty("email");
  const onSubmit = rs.fn();
  const reactHookForm = render(
    <AutoForm
      defaultValues={{ email: "not-an-email" }}
      formOptions={{ mode: "all" }}
      onSubmit={onSubmit}
      schema={EmailContractSchema}
      withSubmit
    />
  );
  const reactHookFormEmail = screen.getByLabelText(EMAIL_PATTERN);
  fireEvent.submit(screen.getByTestId("autoform"));

  await waitFor(() => expect(reactHookFormEmail).toHaveAttribute("aria-invalid", "true"));
  expect(onSubmit).not.toHaveBeenCalled();
  reactHookForm.unmount();

  render(<TanStackFormExample />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(DISPLAY_NAME_PATTERN), "Ada Lovelace");
  await user.type(screen.getByLabelText(EMAIL_PATTERN), "not-an-email");
  const submit = screen.getByRole("button", { name: "Create profile" });
  const tanStackForm = submit.closest("form");
  if (!tanStackForm) {
    throw new Error("Expected the TanStack submit button to belong to a form.");
  }
  await act(async () => {
    fireEvent.submit(tanStackForm);
    await Promise.resolve();
  });

  await waitFor(() => expect(screen.getByLabelText(EMAIL_PATTERN)).toHaveAttribute("aria-invalid", "true"));
});
