import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { Popover, PopoverAnchor } from ".";

describe("PopoverAnchor", () => {
  test("supports Base UI render composition without adding a wrapper", () => {
    render(
      <Popover>
        <PopoverAnchor render={<button aria-label="Open nested command" type="button" />}>
          Open nested command
        </PopoverAnchor>
      </Popover>
    );

    expect(screen.getByRole("button", { name: "Open nested command" })).toHaveAttribute("data-slot", "popover-anchor");
  });
});
