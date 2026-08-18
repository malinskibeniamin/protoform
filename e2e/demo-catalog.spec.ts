import { expect, test } from "@playwright/test";

const aipCreateHubUrl = /\/docs\/aip-example-catalog#aip-133-standard-methods-create$/u;
const aipGetHubUrl = /\/docs\/aip-example-catalog#aip-131-standard-methods-get$/u;
const bufbuildHubUrl = /\/docs\/protobuf-examples#bufbuild-descriptors$/u;
const celSafetyHubUrl = /\/docs\/cel-examples#cel-safe-evaluation$/u;
const formikHubUrl = /\/docs\/production-examples#formik$/u;
const protobufHubUrl = /\/docs\/protobuf-examples$/u;

test("publishes focused feature and AIP catalogs with working live forms", async ({ page }) => {
  await page.goto("/docs/feature-example-catalog");
  await expect(page).toHaveURL(protobufHubUrl);
  const content = page.locator("#blume-content");
  await expect(content.getByRole("heading", { name: "Protobuf examples" })).toBeVisible();
  await expect(content.getByRole("combobox", { name: "Choose a demo" })).toBeVisible();

  await page.goto("/docs/aip-133-standard-methods-create");
  await expect(page).toHaveURL(aipCreateHubUrl);
  await expect(
    content.getByRole("heading", {
      name: "AIP-133 Standard methods: Create",
    })
  ).toBeVisible();
  await expect(content.getByText("React Hook Form", { exact: true })).toBeVisible({
    timeout: 30_000,
  });

  await page.goto("/docs/example-formik");
  await expect(page).toHaveURL(formikHubUrl);
  const email = content.getByRole("textbox", { name: "Email" });
  await email.fill("ada@example.com");
  await email.blur();
  await expect(email).toHaveValue("ada@example.com");
  const submit = content.getByRole("button", {
    name: "Validate with Formik",
  });
  await submit.focus();
  await expect(submit).toBeFocused();
  await submit.press("Enter");
  await expect(content.getByRole("status")).toContainText("ada@example.com", {
    timeout: 30_000,
  });
});

test("keeps a representative generated form within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/docs/aip-131-standard-methods-get");
  await expect(page).toHaveURL(aipGetHubUrl);
  const content = page.locator("#blume-content");
  await expect(content.getByText("React Hook Form", { exact: true })).toBeVisible({ timeout: 30_000 });
  await content.getByRole("textbox", { name: "Name" }).fill("publishers/acme/books/protoform-guide");
  await content.getByRole("button", { name: "Submit" }).click();
  await expect(content.getByRole("status")).toContainText("protoform-guide", {
    timeout: 30_000,
  });

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test("fills the submitted-value panel without an empty gutter", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 900 });
  await page.goto("/docs/blume-examples/registry/base-nova/protoform/demo/catalog/aip-133-standard-methods-create");
  await page.getByRole("button", { name: "Submit" }).click();

  const status = page.getByRole("status");
  const description = status.locator('[data-slot="alert-description"]');
  const submittedValue = description.locator("pre");
  await expect(submittedValue).toBeVisible();

  const descriptionBox = await description.boundingBox();
  const submittedValueBox = await submittedValue.boundingBox();

  expect(submittedValueBox?.width).toBeCloseTo(descriptionBox?.width ?? 0, 0);
});

test("keeps recursive collection controls clear of their item labels", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto("/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-recursive-messages");
  await page.getByRole("button", { name: "Add Children" }).click();

  const firstItem = page.getByTestId("autoform-field-children-0");
  await expect(firstItem).toHaveAttribute("data-layout", "stacked");

  const labelBox = await firstItem.getByText("Children 1", { exact: true }).boundingBox();
  const copyBox = await firstItem.getByRole("button", { name: "Copy JSON" }).boundingBox();
  const rowBox = await page.getByTestId("autoform-field-children-row-0").boundingBox();

  expect(labelBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(rowBox).not.toBeNull();
  if (!(labelBox && copyBox && rowBox)) {
    throw new Error("Recursive item label, row, or JSON action is not rendered");
  }
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(copyBox.y);
  expect(copyBox.x).toBeGreaterThanOrEqual(rowBox.x);
});

test("labels selected protobuf enum values in the maps demo", async ({ page }) => {
  await page.goto("/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-maps");

  await expect(page.getByTestId("autoform-field-statuses-selected-1")).toHaveText("Active");
  await expect(page.getByTestId("autoform-field-statuses-selected-2")).toHaveText("Paused");
});

test("shows the actual form implementation in the Code preview", async ({ page }) => {
  await page.goto("/docs/example-cel-safe-evaluation");
  await expect(page).toHaveURL(celSafetyHubUrl);

  await page.getByRole("tab", { name: "Code" }).click();
  const codePanel = page.getByRole("tabpanel", { name: "Code" });

  await expect(codePanel).toContainText("getDemoSchema");
  await expect(codePanel).toContainText("AutoForm");
  await expect(codePanel).toContainText("onSubmit");
  await expect(codePanel).not.toContainText("RegistryCapabilityDemo");
});

test("serves consolidated catalogs through static Markdown routes", async ({ request }) => {
  const markdownResponse = await request.get("/docs/aip-example-catalog.md");
  expect(markdownResponse.ok()).toBe(true);
  const markdown = await markdownResponse.text();
  expect(markdown).toContain("AIP examples");
  expect(markdown).toContain("stable deep link");
  expect(markdown).not.toContain("aip-121-resource-oriented-design.tsx");

  const rpcMarkdownResponse = await request.get("/docs/protobuf-examples.md");
  expect(rpcMarkdownResponse.ok()).toBe(true);
  const rpcMarkdown = await rpcMarkdownResponse.text();
  expect(rpcMarkdown).toContain("Protobuf examples");
  expect(rpcMarkdown).toContain("stable deep link");
  expect(rpcMarkdown).not.toContain("LibraryService.method.createBook");
});

test("serves translated hubs and only offers available page languages", async ({ page }) => {
  await page.goto("/docs/reference");
  await expect(page.locator('[aria-label="Language"]')).toHaveCount(0);

  await page.goto("/docs/zh/protobuf-examples#protobuf-oneof");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByRole("heading", { name: "Protobuf 示例" })).toBeVisible();
  await expect(page.locator('[aria-label="语言"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Oneof branch selection" })).toBeVisible({ timeout: 30_000 });
});

test("renders the native OpenAPI reference and real RPC method shape", async ({ page }) => {
  await page.goto("/docs/reference");
  await expect(page.getByRole("heading", { name: "Protoform bookstore Connect API" })).toBeVisible();
  await expect(page.getByRole("link").filter({ hasText: "Create a book" }).first()).toBeVisible();

  await page.goto("/docs/example-bufbuild-descriptors");
  await expect(page).toHaveURL(bufbuildHubUrl);
  await expect(page.getByText("CreateBook", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByText("protoform.conformance.v1.CreateBookRequest", {
      exact: true,
    })
  ).toBeVisible();
});
