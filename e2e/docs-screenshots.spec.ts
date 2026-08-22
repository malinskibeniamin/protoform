import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const screenshotDir = "artifacts/screenshots";
const productionComplexChunkPattern = /\/_astro\/complex-form\.[^/]+\.js$/u;
const focusedExamplePaths = [
  "/docs/bare-bones-form",
  "/docs/two-step-form",
  "/docs/cel-re2-form",
  "/docs/oneof-form",
  "/docs/server-error-form",
  "/docs/aip-resource-form",
] as const;
const wideDemoExamples = [
  {
    label: "bookstore workspace",
    path: "/docs/bookstore",
    selector: "#blume-content article > [data-bookstore-workspace]",
  },
  {
    label: "direct island",
    path: "/docs/bare-bones-form",
    selector: "#blume-content article > div:has(> astro-island)",
  },
] as const;
interface DocsPage {
  diagram?: boolean;
  heading: string;
  name: string;
  path: string;
}

const sidebarHierarchy = [
  {
    label: "Start here",
    pages: ["Getting started", "Bookstore walkthrough", "Registry install"],
  },
  {
    label: "Examples",
    pages: [
      "Bare-bones form",
      "Two-step form",
      "Deeply nested form",
      "CEL and RE2 form",
      "Oneof form",
      "Server-error form",
      "AIP resource form",
      "Kitchen sink",
      "Complex end-to-end example",
    ],
  },
  {
    label: "Feature examples",
    pages: ["Protobuf examples", "Protovalidate examples", "CEL examples", "Production examples"],
  },
  {
    label: "AIP examples",
    pages: ["AIP examples"],
  },
  {
    label: "Build forms",
    pages: [
      "AutoForm annotations",
      "Steppers",
      "Oneof and edge cases",
      "React Hook Form",
      "TanStack Form",
      "Formik",
      "Final Form",
    ],
  },
  {
    label: "Validation and APIs",
    pages: [
      "API recipes",
      "Standard Schema",
      "Protovalidate",
      "CEL expressions",
      "Server errors",
      "Google AIP and protobuf design",
    ],
  },
  {
    label: "Migrations",
    pages: ["Migrating to Protobuf-ES v2", "Migrating from Zod", "Migrating from Yup", "LLM migration playbook"],
  },
  {
    label: "Production",
    pages: ["Testing forms", "Conformance suite", "Production readiness", "Deployment", "Port audit"],
  },
  {
    label: "Reference",
    pages: [
      "Overview",
      "Create a bookPOST",
      "Delete a bookPOST",
      "Get a bookPOST",
      "List booksPOST",
      "Update a bookPOST",
    ],
  },
] as const;

const pages: DocsPage[] = [
  { diagram: true, heading: "Protoform", name: "docs-home", path: "/docs" },
  {
    diagram: true,
    heading: "Getting started",
    name: "getting-started",
    path: "/docs/getting-started",
  },
  {
    diagram: true,
    heading: "Migrating to Protobuf-ES v2",
    name: "protobuf-v2-migration",
    path: "/docs/protobuf-v2-migration",
  },
  {
    heading: "Bare-bones form",
    name: "bare-bones-form",
    path: "/docs/bare-bones-form",
  },
  {
    heading: "Two-step form",
    name: "two-step-form",
    path: "/docs/two-step-form",
  },
  {
    diagram: true,
    heading: "Complex end-to-end example",
    name: "complex-example",
    path: "/docs/complex-example",
  },
  {
    diagram: true,
    heading: "Kitchen sink",
    name: "kitchen-sink",
    path: "/docs/kitchen-sink",
  },
  {
    diagram: true,
    heading: "Deeply nested form",
    name: "deeply-nested",
    path: "/docs/deeply-nested",
  },
  {
    heading: "CEL and RE2 form",
    name: "cel-re2-form",
    path: "/docs/cel-re2-form",
  },
  {
    heading: "Oneof form",
    name: "oneof-form",
    path: "/docs/oneof-form",
  },
  {
    diagram: true,
    heading: "Server-error form",
    name: "server-error-form",
    path: "/docs/server-error-form",
  },
  {
    heading: "AIP resource form",
    name: "aip-resource-form",
    path: "/docs/aip-resource-form",
  },
  {
    heading: "React Hook Form",
    name: "react-hook-form",
    path: "/docs/react-hook-form",
  },
  {
    diagram: true,
    heading: "TanStack Form",
    name: "tanstack-form",
    path: "/docs/tanstack-form",
  },
  {
    diagram: true,
    heading: "Formik",
    name: "formik",
    path: "/docs/formik",
  },
  {
    diagram: true,
    heading: "Final Form",
    name: "final-form",
    path: "/docs/final-form",
  },
  {
    heading: "API recipes",
    name: "api-recipes",
    path: "/docs/api-recipes",
  },
  {
    diagram: true,
    heading: "Standard Schema",
    name: "standard-schema",
    path: "/docs/standard-schema",
  },
  {
    heading: "Protovalidate",
    name: "protovalidate",
    path: "/docs/protovalidate",
  },
  {
    heading: "Testing forms",
    name: "testing-forms",
    path: "/docs/testing-forms",
  },
  {
    diagram: true,
    heading: "Conformance suite",
    name: "conformance",
    path: "/docs/conformance",
  },
  {
    heading: "Production readiness",
    name: "production-readiness",
    path: "/docs/production-readiness",
  },
  {
    diagram: true,
    heading: "AutoForm",
    name: "auto-form",
    path: "/docs/auto-form",
  },
  {
    diagram: true,
    heading: "Steppers",
    name: "steppers",
    path: "/docs/steppers",
  },
  {
    heading: "CEL expressions",
    name: "cel-expressions",
    path: "/docs/cel-expressions",
  },
  {
    diagram: true,
    heading: "Server errors",
    name: "server-errors",
    path: "/docs/server-errors",
  },
  {
    heading: "Registry install",
    name: "registry-install",
    path: "/docs/registry-install",
  },
  {
    diagram: true,
    heading: "Google AIP and protobuf design",
    name: "aip-protobuf",
    path: "/docs/aip-protobuf",
  },
  {
    diagram: true,
    heading: "Migrating from Yup",
    name: "yup-migration",
    path: "/docs/yup-migration",
  },
  { heading: "Port audit", name: "port-audit", path: "/docs/port-audit" },
];

test.beforeAll(async () => {
  await mkdir(screenshotDir, { recursive: true });
});

test("organizes the docs sidebar by reader task", async ({ page }) => {
  await page.goto("/docs/getting-started");

  const sidebar = page.locator('aside[aria-label="Primary"] nav');
  const groups = sidebar.locator(":scope > ul > li > details");

  await expect(groups.locator(":scope > summary")).toHaveText(sidebarHierarchy.map((group) => group.label));

  await Promise.all(
    sidebarHierarchy.map((group, index) =>
      expect(groups.nth(index).locator(":scope > div a")).toHaveText(Array.from(group.pages))
    )
  );

  const startHere = groups.nth(sidebarHierarchy.findIndex((group) => group.label === "Start here"));
  await expect(startHere).toHaveAttribute("open", "");
  await expect(startHere.getByRole("link", { name: "Getting started" })).toHaveAttribute("aria-current", "page");
  const examples = groups.nth(sidebarHierarchy.findIndex((group) => group.label === "Examples"));
  await examples.locator(":scope > summary").click();
  await expect(examples.getByRole("link", { name: "Bare-bones form" })).toBeVisible();

  const production = groups.nth(sidebarHierarchy.findIndex((group) => group.label === "Production"));
  await production.locator(":scope > summary").click();
  await expect(production.getByRole("link", { name: "Production readiness" })).toBeVisible();
});

test("syntax-highlights protobuf field declarations", async ({ page }) => {
  await page.goto("/docs/complex-example");

  const proto = page.locator('pre[data-language="proto"]', {
    hasText: "project_id",
  });
  const projectField = proto.locator(".line", { hasText: "project_id" });

  await expect(proto).toBeVisible();
  expect(await projectField.locator(":scope > span").count()).toBeGreaterThan(1);
});

test("syntax-highlights standalone CEL expressions", async ({ page }) => {
  await page.goto("/docs/kitchen-sink");

  const cel = page.locator('pre[data-title="CEL"]', {
    hasText: "this.services.size() >= 2",
  });
  const firstLine = cel.locator(".line").first();

  await expect(cel).toBeVisible();
  await expect(cel.locator(".blume-lang-icon")).toBeHidden();
  expect(await firstLine.locator(":scope > span").count()).toBeGreaterThan(1);
});

test("opens diagrams in an accessible full-viewport viewer", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/docs");

  const diagram = page.locator("blume-mermaid").first();
  await expect(diagram.locator(":scope > div:not([data-diagram-controls]) svg").first()).toBeVisible();
  const maximize = page.getByRole("button", {
    name: "View diagram full screen",
  });
  await expect(maximize).toBeVisible();

  await maximize.click();

  const viewer = page.getByRole("dialog", { name: "Diagram" });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("[data-diagram-preview] svg").first()).toBeVisible();
  const box = await viewer.boundingBox();
  const viewport = page.viewportSize();
  expect(box?.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 2);
  expect(box?.height).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 2);

  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(maximize).toBeFocused();
});

test("complex example exposes its loading state", async ({ page }) => {
  let delayedExampleChunk = false;
  let releaseExampleChunk: (() => void) | undefined;
  const exampleChunkGate = new Promise<void>((resolve) => {
    releaseExampleChunk = resolve;
  });

  await page.route("**/*", async (route) => {
    const requestPath = new URL(route.request().url()).pathname;
    if (
      !delayedExampleChunk &&
      (requestPath.includes("/examples/complex/complex-form") || productionComplexChunkPattern.test(requestPath))
    ) {
      delayedExampleChunk = true;
      await exampleChunkGate;
    }
    await route.continue();
  });

  try {
    await page.goto("/docs/complex-example", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("status", { name: "Loading complex example" })).toBeVisible();
    expect(delayedExampleChunk).toBe(true);
  } finally {
    releaseExampleChunk?.();
  }

  await expect(page.getByRole("textbox", { name: "Project ID" })).toBeVisible({
    timeout: 30_000,
  });
});

test("keeps the complex stepper usable at a narrow viewport", async ({ browserName, page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/docs/complex-example");

  const projectId = page.getByRole("textbox", { name: "Project ID" });
  await expect(projectId).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("navigation", { name: "Form progress" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true
  );

  await page.screenshot({
    fullPage: true,
    path: join(screenshotDir, `${browserName}-complex-example-mobile.png`),
  });
});

test("adapts five-step progress without wrapping", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 390 });
  await page.goto("/docs/kitchen-sink");

  const progress = page.getByRole("navigation", { name: "Form progress" });
  await expect(page.getByText("Step 1 of 5")).toBeVisible();

  const markers = progress.locator('[data-slot="step-marker"]');
  const labels = progress.locator('[data-slot="step-label"]');
  await expect(markers).toHaveCount(5);
  await expect(labels).toHaveCount(5);
  await expect(labels.first()).toBeHidden();

  const narrowMarkerTops = await markers.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top)
  );
  expect(new Set(narrowMarkerTops).size).toBe(1);

  await page.setViewportSize({ height: 900, width: 800 });
  await expect(labels.first()).toBeVisible();
  const mediumMarker = await markers.first().boundingBox();
  const mediumLabel = await labels.first().boundingBox();
  expect(mediumMarker).not.toBeNull();
  expect(mediumLabel).not.toBeNull();
  expect(mediumLabel?.y).toBeGreaterThan((mediumMarker?.y ?? 0) + (mediumMarker?.height ?? 0));

  await page.setViewportSize({ height: 900, width: 1440 });
  await progress.evaluate((element) => {
    element.style.width = "65rem";
  });
  const wideMarker = await markers.first().boundingBox();
  const wideLabel = await labels.first().boundingBox();
  expect(wideMarker).not.toBeNull();
  expect(wideLabel).not.toBeNull();
  expect(Math.abs((wideLabel?.y ?? 0) - (wideMarker?.y ?? 0))).toBeLessThan(8);
  await progress.evaluate((element) => {
    element.style.removeProperty("width");
  });

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true
  );
});

test("positions vertical progress above or beside its panel", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 390 });
  await page.goto("/docs/two-step-form");

  const progress = page.getByRole("navigation", { name: "Form progress" });
  const panel = page.getByRole("region", { name: "Name" });
  await expect(progress).toHaveAttribute("data-orientation", "vertical");

  const narrowProgress = await progress.boundingBox();
  const narrowPanel = await panel.boundingBox();
  expect(narrowProgress).not.toBeNull();
  expect(narrowPanel).not.toBeNull();
  expect(narrowProgress?.y).toBeLessThan(narrowPanel?.y ?? 0);

  await page.setViewportSize({ height: 900, width: 1440 });
  const wideProgress = await progress.boundingBox();
  const widePanel = await panel.boundingBox();
  expect(wideProgress).not.toBeNull();
  expect(widePanel).not.toBeNull();
  expect(wideProgress?.x).toBeLessThan(widePanel?.x ?? 0);
  expect(Math.abs((wideProgress?.y ?? 0) - (widePanel?.y ?? 0))).toBeLessThan(2);
});

for (const path of focusedExamplePaths) {
  test(`keeps ${path} inside a mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      path
    ).toBe(true);
  });
}

test("keeps the Standard Schema guide inside a mobile viewport", async ({ browserName, page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/docs/standard-schema");

  await expect(page.getByRole("heading", { level: 1, name: "Standard Schema" })).toBeVisible();
  await expect(page.getByRole("table").first()).toBeVisible();
  await expect(page.locator("blume-mermaid svg").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true
  );

  await page.screenshot({
    fullPage: true,
    path: join(screenshotDir, `${browserName}-standard-schema-mobile.png`),
  });
});

test("uses a wider content column for the readiness dashboard", async ({ page }) => {
  await page.setViewportSize({ height: 1000, width: 1600 });
  await page.goto("/docs/production-readiness");

  const article = page.locator("#blume-content > article");
  await expect(page.getByRole("progressbar", { name: "Overall readiness" })).toBeVisible();
  expect((await article.boundingBox())?.width).toBeGreaterThan(800);
});

test("keeps the bookstore demo readable inside the docs column", async ({ page }) => {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/docs/bookstore");

  const heading = page.getByRole("heading", { name: "Protoform library" });
  await expect(heading).toBeVisible();
  const headingBox = await heading.boundingBox();
  expect(headingBox?.width).toBeGreaterThan(200);

  const source = page.getByRole("tabpanel");
  await expect(source).toContainText('syntax = "proto3"');
  const sourceBox = await source.boundingBox();
  expect(sourceBox?.x).toBeGreaterThan((headingBox?.x ?? 0) + 200);
  const sourceColors = await source.evaluate((element) => ({
    background: getComputedStyle(element.parentElement as HTMLElement).backgroundColor,
    foreground: getComputedStyle(element.querySelector("code") as HTMLElement).color,
  }));
  expect(sourceColors.foreground).not.toBe(sourceColors.background);
});

test("syntax-highlights every bookstore source language", async ({ page }) => {
  await page.goto("/docs/bookstore");

  const source = page.getByRole("tabpanel");
  const cases = [
    {
      file: "aip.proto",
      line: 'syntax = "proto3"',
    },
    {
      file: "aip_pb.ts",
      line: "import type",
    },
    {
      file: "create-book-form.tsx",
      line: "export function CreateBookForm",
    },
  ] as const;

  for (const syntaxCase of cases) {
    await page.getByRole("tab", { name: syntaxCase.file }).click();
    const highlightedLine = source
      .locator(".line", {
        hasText: syntaxCase.line,
      })
      .first();

    await expect(highlightedLine).toBeVisible();
    expect.soft(await highlightedLine.locator(":scope > span").count(), syntaxCase.file).toBeGreaterThan(1);
  }
});

for (const example of wideDemoExamples) {
  test(`gives each ${example.label} more room than the prose column`, async ({ page }) => {
    await page.setViewportSize({ height: 1000, width: 1600 });
    await page.goto(example.path);

    const prose = page.locator("#blume-content > article");
    const demo = page.locator(example.selector).first();
    await expect(demo).toBeVisible();

    const proseBox = await prose.boundingBox();
    const demoBox = await demo.boundingBox();

    expect.soft(demoBox?.width, example.path).toBeGreaterThan((proseBox?.width ?? 0) + 200);
    expect.soft(demoBox?.x, example.path).toBeGreaterThanOrEqual(0);
    expect.soft((demoBox?.x ?? 0) + (demoBox?.width ?? 0), example.path).toBeLessThanOrEqual(1600);
  });
}

test("shows line numbers in component code previews", async ({ page }) => {
  await page.goto("/docs/bookstore");

  const source = page.locator("pre.blume-source").first();
  await expect(source.locator(".line").first()).toBeVisible();
  expect(
    await source.evaluate((element) => {
      const code = element.querySelector("code");
      const line = element.querySelector(".line");
      if (!(code && line)) {
        throw new Error("Expected highlighted source lines");
      }
      const lineNumber = getComputedStyle(line, "::before");

      return {
        content: lineNumber.content,
        increment: lineNumber.counterIncrement,
        reset: getComputedStyle(code).counterReset,
      };
    })
  ).toEqual({
    content: "counter(line)",
    increment: "line 1",
    reset: "line 0",
  });
});

test("shows the Profile v3 evidence roadmap", async ({ page }) => {
  await page.goto("/docs/production-readiness");

  await expect(page.getByRole("heading", { name: "How to maintain the evidence" })).toBeVisible();
  await expect(page.getByText("Consumer deployment matrix")).toBeVisible();
  await expect(page.getByText("Schema evolution and drafts")).toBeVisible();
  await expect(page.getByText("Security and misuse resistance")).toBeVisible();
});

test("keeps readiness areas readable with enlarged text", async ({ page }) => {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/docs/production-readiness");
  await expect(page.getByRole("progressbar", { name: "Overall readiness" })).toBeVisible();

  const verifiedCheck = page.getByRole("button", {
    name: "String fields: Verified",
  });
  await verifiedCheck.hover();
  await expect(page.getByRole("tooltip")).toContainText("maps $key into the stable field model");
  await page.mouse.move(0, 0);
  const serviceCheck = page.getByRole("button", {
    name: "Service and RPC descriptors: Verified",
  });
  await serviceCheck.focus();
  await expect(page.getByRole("tooltip")).toContainText("Generated service methods now expose request descriptors");

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  const area = page.getByRole("region", { name: "Readiness by area" });
  const cards = area.locator("article");
  await expect(cards).toHaveCount(5);
  expect(
    await cards.evaluateAll((elements) =>
      elements
        .filter((element) => element.scrollWidth > element.clientWidth)
        .map((element) => element.querySelector("h3")?.textContent)
    )
  ).toEqual([]);
});

for (const pageInfo of pages) {
  test(`hydrates and renders docs screenshot: ${pageInfo.name}`, async ({ browserName, page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    await page.goto(pageInfo.path);
    await expect(page.locator("h1", { hasText: pageInfo.heading }).first()).toBeVisible();
    if (pageInfo.diagram) {
      await expect(page.locator("blume-mermaid svg").first()).toBeVisible();
      await expect(page.locator("pre", { hasText: "flowchart TD" })).toHaveCount(0);
    }
    if (pageInfo.name === "bare-bones-form") {
      await page.getByRole("textbox", { name: "Name" }).fill("Ada");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByRole("status")).toContainText("Submitted: Ada");
    }
    if (pageInfo.name === "two-step-form") {
      await expect(page.getByText("Step 1 of 2")).toBeVisible();
      await page.getByRole("textbox", { name: "Name" }).fill("Ada");
      await page.getByRole("button", { name: "Continue" }).click();
      await expect(page.getByText("Step 2 of 2")).toBeVisible();
      await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByRole("status")).toContainText("Submitted: Ada, ada@example.com");
    }
    if (pageInfo.name === "cel-re2-form") {
      await page.getByRole("textbox", { name: "Project ID" }).fill("Not valid");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByRole("alert").filter({ hasText: "Use lowercase letters, digits, and hyphens." })
      ).toBeVisible();
    }
    if (pageInfo.name === "oneof-form") {
      await page.getByRole("combobox", { name: "Contact" }).click();
      await page.getByRole("option", { name: "Phone" }).click();
      await page.getByRole("textbox", { name: "Phone" }).fill("+442079460000");
      await expect(page.getByRole("textbox", { name: "Email" })).toHaveCount(0);
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByRole("status")).toContainText("Submitted phone: +442079460000");
    }
    if (pageInfo.name === "server-error-form") {
      await page.getByRole("textbox", { name: "Display Name" }).fill("Ada Lovelace");
      const email = page.getByRole("textbox", { name: "Email" });
      await email.fill("ada@blocked.example");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Use an email address from an approved domain.")).toBeVisible();
      await expect(email).toHaveAttribute("aria-invalid", "true");
    }
    if (pageInfo.name === "aip-resource-form") {
      const displayName = page.getByRole("textbox", { name: "Display Name" });
      await displayName.fill("Grace Hopper");
      await page.getByRole("textbox", { name: "Biography" }).fill("Compiler pioneer");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByRole("status")).toContainText("Update mask: display_name, biography");
    }
    if (pageInfo.name === "complex-example") {
      const projectId = page.getByRole("textbox", { name: "Project ID" });
      await expect(projectId).toBeVisible();
      await expect(page.getByLabel("Region")).toHaveCount(0);
      expect((await projectId.boundingBox())?.width).toBeGreaterThanOrEqual(200);
    }
    if (pageInfo.name === "kitchen-sink") {
      await expect(
        page.getByRole("heading", {
          name: "Production deployment kitchen sink",
        })
      ).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Form progress" })).toBeVisible();
      await expect(page.getByText("Step 1 of 5")).toBeVisible();
    }
    if (pageInfo.name === "deeply-nested") {
      await expect(
        page.getByRole("heading", {
          name: "Configure a platform blueprint",
        })
      ).toBeVisible();
      await expect(page.getByLabel("Destination Cidr", { exact: false })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Network 1" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Route 1" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Value" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Add Routes" })).toBeVisible();
    }
    if (pageInfo.name === "tanstack-form") {
      await expect(page.getByRole("textbox", { name: "Display name" })).toBeVisible();
      await page.getByRole("button", { name: "Create profile" }).click();
      await expect(page.getByText("value is required")).toHaveCount(2);
    }
    if (pageInfo.name === "formik") {
      await expect(page.getByRole("textbox", { name: "Display name" })).toBeVisible();
      await expect(page.getByRole("status", { name: "Loading Formik example" })).toHaveCount(0);
    }
    if (pageInfo.name === "final-form") {
      await expect(page.getByRole("textbox", { name: "Display name" })).toBeVisible();
      await expect(page.getByRole("status", { name: "Loading Final Form example" })).toHaveCount(0);
    }
    if (pageInfo.name === "production-readiness") {
      await expect(page.getByRole("progressbar", { name: "Overall readiness" })).toBeVisible();
      await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Service and RPC descriptors: Verified",
        })
      ).toBeVisible();
      await page.getByRole("button", { exact: true, name: "All" }).click();
      const ledger = page.getByRole("region", { name: "Capability ledger" });
      const proto2Groups = ledger.getByRole("heading", {
        name: "Proto2 groups and extensions",
      });
      await page.getByPlaceholder("Search checks").fill("Proto2 groups and extensions");
      await expect(proto2Groups).toBeVisible();
      await page.getByPlaceholder("Search checks").fill("Service and RPC descriptors");
      await expect(proto2Groups).toHaveCount(0);
      await expect(ledger.getByRole("heading", { name: "Service and RPC descriptors" })).toBeVisible();
    }
    await page.screenshot({
      fullPage: true,
      path: join(screenshotDir, `${browserName}-${pageInfo.name}.png`),
    });
    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !(pageInfo.name === "server-error-form" && message.includes("server responded with a status of 400"))
    );
    expect(unexpectedConsoleErrors).toEqual([]);
  });
}
