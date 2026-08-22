import { describe, expect } from "@rstest/core";

import { shadcnAutoFormControls, shadcnComponentCoverage } from "../shadcn-controls";

const outOfBoxComponents = [
  "Alert",
  "Badge",
  "Button",
  "Calendar",
  "Card",
  "Checkbox",
  "Choicebox",
  "Collapsible",
  "Combobox",
  "Command",
  "CopyButton",
  "Dialog",
  "Field",
  "Group",
  "Input",
  "InputGroup",
  "JsonField",
  "KeyValueField",
  "Label",
  "MultiSelect",
  "Popover",
  "RadioGroup",
  "Select",
  "Separator",
  "Slider",
  "Spinner",
  "Switch",
  "Tabs",
  "Tags",
  "Textarea",
  "Toggle",
  "ToggleGroup",
  "Tooltip",
  "Typography",
];

describe("shadcn AutoForm coverage manifest", () => {
  test("covers every bundled shadcn Base UI component with an AutoForm role", () => {
    expect(
      shadcnComponentCoverage.map((entry) => entry.component).sort((left, right) => left.localeCompare(right))
    ).toEqual(outOfBoxComponents.sort((left, right) => left.localeCompare(right)));
  });

  test("keeps proto control annotations unique and explicit", () => {
    const controls = shadcnAutoFormControls.map((entry) => entry.control);
    expect(new Set(controls).size).toBe(controls.length);
    expect(shadcnAutoFormControls.every((entry) => entry.protoAnnotation.startsWith("CONTROL_TYPE_"))).toBe(true);
  });
});
