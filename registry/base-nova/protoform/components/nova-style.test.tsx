import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Select, SelectTrigger, SelectValue } from "./select";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { Textarea } from "./textarea";

describe("Base Nova form controls", () => {
  it("uses Nova textarea geometry by default", () => {
    render(<Textarea aria-label="Description" />);

    expect(screen.getByRole("textbox", { name: "Description" })).toHaveClass("min-h-16", "rounded-lg", "px-2.5");
  });

  it("uses Nova select geometry by default", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Status">
          <SelectValue placeholder="Choose status" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger).toHaveAttribute("data-size", "default");
    expect(trigger).toHaveClass("data-[size=default]:h-8", "rounded-lg");
  });

  it("uses Nova checkbox geometry by default", () => {
    render(<Checkbox aria-label="Accept terms" />);

    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toHaveClass("size-4", "rounded-[4px]");
  });

  it("uses Nova radio geometry by default", () => {
    render(
      <RadioGroup>
        <RadioGroupItem aria-label="First option" value="first" />
      </RadioGroup>
    );

    expect(screen.getByRole("radio", { name: "First option" })).toHaveClass("size-4", "rounded-full");
  });

  it("uses Nova switch geometry by default", () => {
    render(<Switch aria-label="Enable notifications" />);

    const control = screen.getByRole("switch", { name: "Enable notifications" });
    expect(control).toHaveAttribute("data-size", "default");
    expect(control).toHaveClass("data-[size=default]:h-[18.4px]", "data-[size=default]:w-[32px]");
  });

  it("uses Nova slider geometry by default", () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={[50]} />);

    expect(screen.getByRole("slider", { name: "Volume" })).toBeVisible();
    expect(container.querySelector('[data-slot="slider-thumb"]')).toHaveClass("size-3");
  });
});
