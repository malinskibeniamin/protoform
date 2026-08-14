import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // Base UI's visually hidden sentinels deliberately use role="button" in
    // WebKit so VoiceOver's virtual cursor can trigger the focus trap.
    .exclude("[data-base-ui-focus-guard]")
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );
  expect(
    serious.map((violation) => ({
      help: violation.help,
      id: violation.id,
      targets: violation.nodes.map((node) => node.target),
    }))
  ).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test(`keeps help tooltip text visible in ${theme} theme`, async ({
    page,
  }) => {
    await page.goto("/docs/server-error-form");
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset.theme = nextTheme;
    }, theme);

    const helpButton = page.getByRole("button", {
      name: "Help for Display Name",
    });
    await expect(helpButton).toBeVisible({ timeout: 30_000 });
    await helpButton.hover();

    const content = page.getByTestId(
      "autoform-field-display-name-help-content"
    );
    await expect(content).toBeVisible();
    await expect(content).toContainText(
      "Use the name teammates will recognize"
    );

    const colors = await content.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        foreground: style.color,
      };
    });
    expect(colors.foreground).not.toBe(colors.background);
  });
}

test("keeps localized demo hubs readable in dark theme", async ({ page }) => {
  await page.goto("/docs/pl/production-examples#formik");
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });

  await expect(page.getByLabel("Email")).toBeVisible({ timeout: 30_000 });
  const preview = page.getByRole("tabpanel", { name: "Preview" });
  await expect(preview).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);
});

test("has no serious accessibility violations across representative form states", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });
  });

  await page.goto("/docs");
  await page.getByRole("button", { name: "View diagram full screen" }).click();
  await expect(page.getByRole("dialog", { name: "Diagram" })).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.goto("/docs/server-error-form");
  const displayName = page.getByRole("textbox", { name: "Display name" });
  await expect(displayName).toBeVisible({
    timeout: 30_000,
  });
  await expectNoSeriousViolations(page);

  await displayName.fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@blocked.example");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByText("Use an email address from an approved domain.")
  ).toBeVisible();
  const settledSubmit = page.getByRole("button", { name: "Submit" });
  await expect(settledSubmit).toBeEnabled();
  await expect(settledSubmit).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);

  await page.goto("/docs/complex-example");
  await expect(
    page.getByRole("navigation", { name: "Form progress" })
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 3 of 4")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/docs/kitchen-sink");
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/docs/deeply-nested");
  await expect(page.getByRole("button", { name: "Add Routes" })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/docs/aip-133-standard-methods-create");
  const preview = page.getByRole("tabpanel", { name: "Preview" });
  await expect(
    preview.getByText("React Hook Form", { exact: true })
  ).toBeVisible({ timeout: 30_000 });
  await expect(preview).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);
});
