import { expect, test } from "@playwright/test";
import { z } from "zod";
import { demoCatalog } from "../examples/catalog/demo-catalog";
import { demoHubs, demoRedirects } from "../examples/catalog/demo-docs";

const redirectSchema = z.array(z.object({ from: z.string(), status: z.literal(308), to: z.string() }));

// These are published URLs and status codes, not the preview server's fallback redirects.
test("publishes every permanent legacy redirect without losing its fragment", async ({ request }) => {
  const response = await request.get("/blume-redirects.json");
  expect(response.ok()).toBe(true);
  const redirects = redirectSchema.parse(await response.json());
  expect(redirects).toHaveLength(115);
  expect(new Set(redirects.map((redirect) => redirect.from)).size).toBe(redirects.length);
  const rulesResponse = await request.get("/_redirects");
  expect(rulesResponse.ok()).toBe(true);
  const rules = (await rulesResponse.text()).trim().split("\n");
  for (const redirect of demoRedirects) {
    const from = `/docs${redirect.from}`;
    const to = `/docs${redirect.to}`;
    expect(redirects).toContainEqual({ from, status: 308, to });
    expect(rules).toContain(`${from} ${to} 308`);
  }
});

for (const hub of demoHubs) {
  for (const redirect of demoRedirects.filter((candidate) => candidate.to.startsWith(`/${hub.slug}#`))) {
    test(`opens legacy demo ${redirect.from}`, async ({ page }) => {
      const fragment = new URL(redirect.to, "https://protoform.pages.dev").hash.slice(1);
      const demo = demoCatalog.find((candidate) => candidate.slug === fragment);
      if (!demo) {
        throw new Error(`No demo found for legacy destination ${redirect.to}`);
      }
      await page.goto(`/docs${redirect.from}`);
      await expect(page).toHaveURL(new RegExp(`/docs/${hub.slug}#${fragment}$`, "u"));
      await expect(page.getByRole("heading", { exact: true, name: demo.title })).toBeVisible();
    });
  }
}

test("publishes actionable agent guidance without enabling a server", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain("## Agent guidance");
  expect(text).toContain("Protobuf-ES v2");
  expect(text).toContain("experimental");
  expect(text).toContain("https://protoform.pages.dev/docs/getting-started");
  expect(text).toContain("https://protoform.pages.dev/docs/registry-install");
});

test("finds identifiers that appear inside code blocks", async ({ page }) => {
  await page.goto("/docs/getting-started");
  await page.getByRole("button", { exact: true, name: "Search" }).click();
  await page.getByRole("combobox", { exact: true, name: "Search docs" }).fill("SignupRequest");
  await expect(page.getByRole("option").filter({ hasText: "Getting started" }).first()).toBeVisible();
});

for (const locale of ["en", "zh", "zh-TW", "pl"]) {
  for (const hub of demoHubs) {
    test(`serves machine-readable ${hub.slug} for ${locale}`, async ({ request }) => {
      const route = `/docs/${locale === "en" ? "" : `${locale}/`}${hub.slug}`;
      const response = await request.get(`/api/docs/pages${route}.json`);
      expect(response.ok()).toBe(true);
      const page = z
        .object({ locale: z.string(), markdown: z.string().min(1), route: z.string() })
        .parse(await response.json());
      expect(page.locale).toBe(locale);
      expect(page.route).toBe(route);
      const markdown = await request.get(`${route}.md`);
      expect(markdown.ok()).toBe(true);
      expect((await markdown.text()).trim().length).toBeGreaterThan(0);
    });
  }
}
