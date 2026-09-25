import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // Base UI's visually hidden sentinels deliberately use role="button" in
    // WebKit so VoiceOver's virtual cursor can trigger the focus trap.
    .exclude("[data-base-ui-focus-guard]")
    .analyze();
  const serious = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  expect(
    serious.map((violation) => ({
      help: violation.help,
      id: violation.id,
      targets: violation.nodes.map((node) => node.target),
    }))
  ).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test(`preserves readiness tooltip appearance in ${theme} theme`, async ({ page }) => {
    await page.goto("/docs/production-readiness");
    await page.locator("astro-island").first().scrollIntoViewIfNeeded();
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset["theme"] = nextTheme;
    }, theme);
    await page.locator("astro-island button[aria-label]").first().hover();
    const content = page.getByRole("tooltip").locator('[data-slot="tooltip-content"]');
    await expect(content).toBeVisible();
    // Pre-lint appearance: neutral-950 surface and white text in both themes.
    await expect(content).toHaveCSS("background-color", "oklch(0.145 0 0)");
    await expect(content).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test(`keeps help tooltip text visible in ${theme} theme`, async ({ page }) => {
    await page.goto("/docs/server-error-form");
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset["theme"] = nextTheme;
    }, theme);

    const helpButton = page.getByRole("button", {
      name: "Help for Display Name",
    });
    await expect(helpButton).toBeVisible({ timeout: 30_000 });
    const triggerShape = await helpButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        radius: Number.parseFloat(style.borderRadius),
        height: element.getBoundingClientRect().height,
      };
    });
    expect(triggerShape.radius).toBeGreaterThanOrEqual(triggerShape.height / 2);
    await expect(helpButton).toHaveCSS("color", theme === "light" ? "oklch(0.53 0 0)" : "oklch(0.68 0 0)");
    // Keep the 24px hit target without squeezing the question-mark glyph to 12px.
    await expect(helpButton).toHaveCSS("width", "24px");
    await expect(helpButton.locator("svg")).toHaveCSS("width", "16px");
    await expect(helpButton.locator("svg")).toHaveCSS("height", "16px");
    await helpButton.hover();

    const content = page.getByRole("tooltip").locator('[data-slot="tooltip-content"]');
    await expect(content).toBeVisible();
    await expect(content).toContainText("Use the name teammates will recognize");

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
    document.documentElement.dataset["theme"] = "dark";
  });

  await expect(page.getByLabel("Email")).toBeVisible({ timeout: 30_000 });
  const preview = page.getByRole("tabpanel", { name: "Preview" });
  await expect(preview).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);
});

test("has no serious accessibility violations across representative form states", async ({ page }) => {
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
  await expect(page.getByText("Use an email address from an approved domain.")).toBeVisible();
  const settledSubmit = page.getByRole("button", { name: "Submit" });
  await expect(settledSubmit).toBeEnabled();
  await expect(settledSubmit).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);

  await page.goto("/docs/complex-example");
  await expect(page.getByRole("navigation", { name: "Form progress" })).toBeVisible();
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
  await expect(preview.getByText("React Hook Form", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(preview).toHaveCSS("opacity", "1");
  await expectNoSeriousViolations(page);
});

test("keeps readiness status colors and progress widths visible", async ({ page }) => {
  await page.goto("/docs/production-readiness");
  const overall = page.getByRole("progressbar", { name: "Overall readiness", exact: true });
  await expect(overall).toBeVisible();
  const fill = overall.locator(":scope > div");
  await expect(fill).not.toHaveCSS("width", "0px");
  await expect(fill).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const verified = page.locator('[data-status="verified"]').first();
  await expect(verified).toBeVisible();
  await expect(verified).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});
