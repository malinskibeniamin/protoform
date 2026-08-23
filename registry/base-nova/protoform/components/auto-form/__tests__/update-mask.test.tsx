import { create } from "@bufbuild/protobuf";
import { describe, expect, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MaskableProfileSchema } from "@/examples/gen/protoform/examples/v1/forms_pb.js";

import { AutoForm } from "..";

describe("AutoForm update masks", () => {
  test("passes only touched protobuf fields to onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(
      <AutoForm
        defaultValues={create(MaskableProfileSchema, {
          displayName: "Old name",
          name: "profiles/123",
        })}
        onSubmit={onSubmit}
        schema={MaskableProfileSchema}
        withSubmit
      />
    );

    const displayName = screen.getByLabelText("Display Name", { exact: false });
    await user.clear(displayName);
    await user.type(displayName, "New name");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(onSubmit.mock.calls[0]?.[2].updateMask.paths).toEqual(["display_name"]);
  });
});
