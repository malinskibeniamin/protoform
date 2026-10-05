import { expect, test } from "@playwright/test";
const bufbuildHubUrl = /\/docs\/protobuf-examples#bufbuild-descriptors$/u;
test("renders the native OpenAPI reference and real RPC method shape", async ({ browserName, page }) => {
  await page.goto("/docs/reference");
  await expect(page.getByRole("heading", { name: "Protoform bookstore Connect API" })).toBeVisible();
  const createBook = page.getByRole("link").filter({ hasText: "Create a book" }).first();
  await expect(createBook).toBeVisible();
  await createBook.click();
  const playground = page.locator("[data-playground]");
  const playgroundToggle = page.getByText("Try it", { exact: true });
  await expect(playgroundToggle).toBeVisible();
  await playgroundToggle.click();
  await page.getByRole("combobox", { name: "Base URL" }).selectOption("http://127.0.0.1:55012");
  await page.getByRole("textbox", { name: "Custom base URL" }).fill("http://127.0.0.1:55193");
  const requestBody = page.getByRole("textbox", { name: "Request body" });
  const bookId = `protoform-guide-${browserName}`;
  await requestBody.fill(
    (await requestBody.inputValue()).replace(JSON.stringify("protoform-guide"), JSON.stringify(bookId))
  );
  await page.getByRole("button", { name: "Send" }).click();
  await expect(playground).toContainText("200 OK");

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
