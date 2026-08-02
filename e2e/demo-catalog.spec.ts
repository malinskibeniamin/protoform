import { type APIRequestContext, expect, test } from "@playwright/test";

interface McpTextResponse {
  result: {
    content: [{ text: string; type: "text" }];
  };
}

async function callMcp(
  request: APIRequestContext,
  name: "get_page" | "search_docs",
  args: Record<string, unknown>
): Promise<string> {
  const response = await request.post("/mcp", {
    data: {
      id: name,
      jsonrpc: "2.0",
      method: "tools/call",
      params: { arguments: args, name },
    },
    headers: {
      Accept: "application/json, text/event-stream",
      "Mcp-Protocol-Version": "2025-03-26",
    },
  });
  expect(response.ok()).toBe(true);
  const payload = (await response.json()) as McpTextResponse;
  expect(payload.result.content).toHaveLength(1);
  return payload.result.content[0].text;
}

test("publishes focused feature and AIP catalogs with working live forms", async ({
  page,
}) => {
  await page.goto("/docs/feature-example-catalog");
  const content = page.locator("#blume-content");
  await expect(
    content.getByRole("heading", { name: "Feature demo catalog" })
  ).toBeVisible();
  await expect(
    content.getByRole("link", { name: "Bufbuild service descriptors" })
  ).toBeVisible();
  await expect(
    content.getByRole("link", { name: "CEL strings and RE2" })
  ).toBeVisible();
  await expect(
    content.getByRole("link", { name: "Dynamic JSON and Any" })
  ).toBeVisible();
  await expect(
    content.getByRole("link", { name: "Linear stepper" })
  ).toBeVisible();

  await page.goto("/docs/aip-example-catalog");
  await expect(
    content.getByRole("heading", { name: "AIP demo catalog" })
  ).toBeVisible();
  await expect(
    content.getByRole("link", { name: "AIP-133 Standard methods: Create" })
  ).toBeVisible();

  await page.goto("/docs/aip-133-standard-methods-create");
  const createPreview = page.frameLocator(
    'iframe[title="Preview of registry/base-nova/protoform/demo/catalog/aip-133-standard-methods-create"]'
  );
  await expect(
    createPreview.getByText("React Hook Form", { exact: true })
  ).toBeVisible({
    timeout: 30_000,
  });

  await page.goto("/docs/example-formik");
  const formikPreview = page.frameLocator(
    'iframe[title="Preview of registry/base-nova/protoform/demo/catalog/formik"]'
  );
  await expect(formikPreview.locator("astro-island:not([ssr])")).toHaveCount(1);
  const email = formikPreview.getByRole("textbox", { name: "Email" });
  await email.fill("ada@example.com");
  await email.blur();
  await expect(email).toHaveValue("ada@example.com");
  const submit = formikPreview.getByRole("button", {
    name: "Validate with Formik",
  });
  await submit.focus();
  await expect(submit).toBeFocused();
  await submit.press("Enter");
  await expect(formikPreview.getByRole("status")).toContainText(
    "ada@example.com",
    { timeout: 30_000 }
  );
});

test("keeps a representative generated form within a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/docs/aip-131-standard-methods-get");
  const preview = page.frameLocator(
    'iframe[title="Preview of registry/base-nova/protoform/demo/catalog/aip-131-standard-methods-get"]'
  );
  await expect(
    preview.getByText("React Hook Form", { exact: true })
  ).toBeVisible({ timeout: 30_000 });
  await preview
    .getByRole("textbox", { name: "Name" })
    .fill("publishers/acme/books/protoform-guide");
  await preview.getByRole("button", { name: "Submit" }).click();
  await expect(preview.getByRole("status")).toContainText("protoform-guide", {
    timeout: 30_000,
  });

  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test("fills the submitted-value panel without an empty gutter", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 900 });
  await page.goto(
    "/docs/blume-examples/registry/base-nova/protoform/demo/catalog/aip-133-standard-methods-create"
  );
  await page.getByRole("button", { name: "Submit" }).click();

  const status = page.getByRole("status");
  const description = status.locator('[data-slot="alert-description"]');
  const submittedValue = description.locator("pre");
  await expect(submittedValue).toBeVisible();

  const descriptionBox = await description.boundingBox();
  const submittedValueBox = await submittedValue.boundingBox();

  expect(submittedValueBox?.width).toBeCloseTo(descriptionBox?.width ?? 0, 0);
});

test("keeps recursive collection controls clear of their item labels", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto(
    "/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-recursive-messages"
  );
  await page.getByRole("button", { name: "Add Children" }).click();

  const firstItem = page.getByTestId("autoform-field-children-0");
  await expect(firstItem).toHaveAttribute("data-layout", "stacked");

  const labelBox = await firstItem
    .getByText("Children 1", { exact: true })
    .boundingBox();
  const copyBox = await firstItem
    .getByRole("button", { name: "Copy JSON" })
    .boundingBox();
  const rowBox = await page
    .getByTestId("autoform-field-children-row-0")
    .boundingBox();

  expect(labelBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  expect(rowBox).not.toBeNull();
  if (!(labelBox && copyBox && rowBox)) {
    throw new Error(
      "Recursive item label, row, or JSON action is not rendered"
    );
  }
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(copyBox.y);
  expect(copyBox.x).toBeGreaterThanOrEqual(rowBox.x);
});

test("labels selected protobuf enum values in the maps demo", async ({
  page,
}) => {
  await page.goto(
    "/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-maps"
  );

  await expect(
    page.getByTestId("autoform-field-statuses-selected-1")
  ).toHaveText("Active");
  await expect(
    page.getByTestId("autoform-field-statuses-selected-2")
  ).toHaveText("Paused");
});

test("shows the actual form implementation in the Code preview", async ({
  page,
}) => {
  await page.goto("/docs/example-cel-safe-evaluation");

  await page.getByRole("tab", { name: "Code" }).click();
  const codePanel = page.getByRole("tabpanel");

  await expect(codePanel).toContainText("getDemoSchema");
  await expect(codePanel).toContainText("AutoForm");
  await expect(codePanel).toContainText("onSubmit");
  await expect(codePanel).not.toContainText("RegistryCapabilityDemo");
});

test("serves demo source through Markdown and the hosted MCP server", async ({
  request,
}) => {
  const markdownResponse = await request.get(
    "/docs/aip-131-standard-methods-get.md"
  );
  expect(markdownResponse.ok()).toBe(true);
  const markdown = await markdownResponse.text();
  expect(markdown).toContain("```tsx");
  expect(markdown).toContain("getDemoSchema");
  expect(markdown).toContain("<AutoForm");
  expect(markdown).toContain("onSubmit=");
  expect(markdown).not.toContain("RegistryCapabilityDemo");
  expect(markdown).not.toContain("<Component");
  expect(markdown).not.toContain("<CapabilityDemo");

  const searchText = await callMcp(request, "search_docs", {
    limit: 5,
    query: "AIP-131 Standard methods Get",
  });
  const hits = JSON.parse(searchText) as Array<{
    route: string;
    title: string;
    url: string;
  }>;
  const hit = hits.find(
    (candidate) => candidate.route === "/docs/aip-131-standard-methods-get"
  );
  expect(hit).toMatchObject({
    route: "/docs/aip-131-standard-methods-get",
    title: "AIP-131 Standard methods: Get",
    url: "/docs/aip-131-standard-methods-get",
  });

  const pageMarkdown = await callMcp(request, "get_page", {
    route: hit?.route,
  });
  expect(pageMarkdown).toContain("getDemoSchema");
  expect(pageMarkdown).toContain("<AutoForm");
  expect(pageMarkdown).toContain("onSubmit=");
  expect(pageMarkdown).not.toContain("RegistryCapabilityDemo");
  expect(pageMarkdown).not.toContain("<Component");

  const stepperMarkdownResponse = await request.get("/docs/example-stepper.md");
  expect(stepperMarkdownResponse.ok()).toBe(true);
  const stepperMarkdown = await stepperMarkdownResponse.text();
  expect(stepperMarkdown).toContain("AutoFormStep");
  expect(stepperMarkdown).toContain(
    'stepper={{ orientation: "vertical", steps }}'
  );
  expect(stepperMarkdown).not.toContain("lazy(");

  const rpcMarkdownResponse = await request.get(
    "/docs/example-bufbuild-descriptors.md"
  );
  expect(rpcMarkdownResponse.ok()).toBe(true);
  const rpcMarkdown = await rpcMarkdownResponse.text();
  expect(rpcMarkdown).toContain("```tsx");
  expect(rpcMarkdown).toContain("LibraryService.method.createBook");
  expect(rpcMarkdown).not.toContain("<Component");

  const rpcPageMarkdown = await callMcp(request, "get_page", {
    route: "/docs/example-bufbuild-descriptors",
  });
  expect(rpcPageMarkdown).toContain("LibraryService.method.createBook");
  expect(rpcPageMarkdown).not.toContain("<Component");

  const discoveryResponse = await request.get("/.well-known/mcp.json");
  expect(discoveryResponse.ok()).toBe(true);
  await expect(discoveryResponse.json()).resolves.toMatchObject({
    servers: [
      {
        name: "Protoform docs",
        transport: "streamable-http",
        url: "/mcp",
      },
    ],
  });

  const serverCardResponse = await request.get(
    "/.well-known/mcp/server-card.json"
  );
  expect(serverCardResponse.ok()).toBe(true);
  await expect(serverCardResponse.json()).resolves.toMatchObject({
    name: "Protoform docs",
    transport: "streamable-http",
    url: "/mcp",
  });
});

test("renders the native OpenAPI reference and real RPC method shape", async ({
  page,
}) => {
  await page.goto("/docs/reference");
  await expect(
    page.getByRole("heading", { name: "Protoform bookstore Connect API" })
  ).toBeVisible();
  await expect(
    page.getByRole("link").filter({ hasText: "Create a book" }).first()
  ).toBeVisible();

  await page.goto("/docs/example-bufbuild-descriptors");
  const preview = page.frameLocator(
    'iframe[title="Preview of registry/base-nova/protoform/demo/catalog/bufbuild-descriptors"]'
  );
  await expect(preview.getByText("CreateBook", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    preview.getByText("protoform.conformance.v1.CreateBookRequest", {
      exact: true,
    })
  ).toBeVisible();
});
