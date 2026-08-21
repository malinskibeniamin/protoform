import { describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { Button } from ".";

describe("Button", () => {
  it("uses Nova density and geometry by default", () => {
    render(<Button onClick={() => undefined}>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("h-8", "rounded-lg");
  });
});
