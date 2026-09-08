import { expect, test } from "@playwright/test";

test("host primitives submit, report errors, and recover without a theme dependency", async ({ page }) => {
  const uncaughtErrors: string[] = [];
  page.on("pageerror", (error) => uncaughtErrors.push(error.message));
  await page.goto("/");
  const input = page.getByRole("textbox", { name: /Title\s*\*/u });
  const choice = page.getByRole("combobox", { exact: true, name: "Choice" });
  await expect(choice).toHaveText("Select an option");
  await choice.click();
  await page.getByRole("option", { exact: true, name: "First" }).click();
  await expect(choice).toHaveText("First");
  await input.fill("Adopt without duplicating UI");
  await page.getByRole("button", { exact: true, name: "Submit" }).click();
  await expect(page.getByLabel("Submitted title")).toHaveText("Adopt without duplicating UI");
  await input.blur();
  await expect(page).toHaveScreenshot("host-ui.png");

  await page.getByRole("button", { exact: true, name: "Remove input" }).click();
  await expect(page.getByRole("alert")).toContainText('Protoform requires the "Input" component');
  await expect(page).toHaveScreenshot("missing-control.png");
  await page.getByRole("button", { exact: true, name: "Restore input" }).click();
  await expect(input).toBeVisible();
  await input.fill("");
  await page.getByRole("button", { exact: true, name: "Submit" }).click();
  await expect(page.getByText("Enter a title", { exact: true })).toBeVisible();
  await input.fill("Recovered");
  await page.getByRole("button", { exact: true, name: "Submit" }).click();
  await expect(page.getByLabel("Submitted title")).toHaveText("Recovered");
  await expect(page.getByText("Enter a title", { exact: true })).toHaveCount(0);
  const selection = page.getByRole("combobox", { name: "Nullable selection" });
  await selection.click();
  await page.getByRole("option", { exact: true, name: "Literal null" }).click();
  await expect(page.getByLabel("Selected value")).toHaveText('"null"');
  await selection.click();
  await page.getByRole("option", { exact: true, name: "Not set" }).click();
  await expect(page.getByLabel("Selected value")).toHaveText("null");
  expect(uncaughtErrors).toEqual([]);
});
