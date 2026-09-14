import { expect, test } from "@rstest/core";
import { quickJsFieldConfig } from "./presentation";

test("rules cannot undo host hiding or disabling and do not mutate the base config", () => {
  const base = {
    company: { customData: { advanced: true, hidden: true }, inputProps: { disabled: true }, label: "Company" },
  };
  expect(quickJsFieldConfig({ company: { disabled: false, visible: true } }, base)).toEqual(base);
  expect(quickJsFieldConfig({ company: { disabled: true, visible: false } })).toEqual({
    company: { customData: { hidden: true }, inputProps: { disabled: true } },
  });
  expect(base.company.customData.hidden).toBe(true);
});

test("an enabling result emits no false overrides that could erase schema restrictions", () => {
  expect(quickJsFieldConfig({ company: { disabled: false, visible: true } })).toEqual({ company: {} });
});
