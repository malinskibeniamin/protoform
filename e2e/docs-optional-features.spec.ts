import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test("links to each page's actual GitHub source and shows its update date", async ({ page }) => {
  await page.goto("/docs/getting-started");
  const edit = page.getByRole("link", { exact: true, name: "Edit on GitHub" });
  await expect(edit).toHaveAttribute(
    "href",
    "https://github.com/malinskibeniamin/protoform/edit/main/content/docs/(start-here)/getting-started.mdx"
  );
  await expect(page.getByText(/^Last updated on /u)).toBeVisible();

  const header = page.getByRole("banner");
  await header.getByLabel("Language: English", { exact: true }).click();
  await header.getByRole("link", { exact: true, name: "Polski" }).click();
  await expect(page).toHaveURL(/\/docs\/pl\/getting-started$/u);
  const polishEdit = page.getByRole("link", { name: "GitHub" }).filter({ hasText: "Edytuj" });
  await expect(polishEdit).toHaveAttribute(
    "href",
    "https://github.com/malinskibeniamin/protoform/edit/main/content/docs/pl/(start-here)/getting-started.mdx"
  );
});

test("exports the current page as PDF and a readable EPUB without a server", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => Reflect.set(window, "__protoformPrinted", true);
  });
  await page.goto("/docs/getting-started");
  await expect(page.locator("[data-blume-page-actions]")).toHaveScreenshot("key-free-page-actions.png");
  await page.getByText("Export", { exact: true }).click();
  await page.getByRole("button", { exact: true, name: "Export to PDF" }).click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__protoformPrinted"))).toBe(true);

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { exact: true, name: "Export to EPUB" }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("docs-getting-started.epub");
  const path = await download.path();
  if (!path) {
    throw new Error("EPUB download has no local file");
  }
  expect(execFileSync("unzip", ["-p", path, "mimetype"], { encoding: "utf8" })).toBe("application/epub+zip");
  const chapters = execFileSync("unzip", ["-p", path, "*.xhtml"], { encoding: "utf8" });
  expect(chapters).toContain("Getting started");
  expect(chapters).toContain("SignupRequest");
});

test("reads prose with browser voices and supports pause, skip, and stop @cross-browser", async ({ page }) => {
  // Speech synthesis is an OS boundary; the real Blume player handles extraction and controls.
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: () =>
          Reflect.set(
            window,
            "__protoformSpeechCancelCount",
            Number(Reflect.get(window, "__protoformSpeechCancelCount") ?? 0) + 1
          ),
        getVoices: () => [{ default: true, lang: "en-US", localService: true, name: "Test English", voiceURI: "test" }],
        resume: () => undefined,
        speak: (utterance: { lang: string; onstart: () => void; text: string }) => {
          Reflect.set(window, "__protoformSpoken", { lang: utterance.lang, text: utterance.text });
          utterance.onstart();
        },
      },
    });
  });
  await page.goto("/docs/getting-started");
  await page.getByRole("button", { name: /Listen to this page/u }).click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "__protoformSpoken")))
    .toEqual({
      lang: "en-US",
      text: "Getting started",
    });
  await page.getByRole("button", { exact: true, name: "Next sentence" }).click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "__protoformSpoken")))
    .not.toEqual({
      lang: "en-US",
      text: "Getting started",
    });
  await page.getByRole("button", { exact: true, name: "Pause" }).click();
  await expect(page.getByRole("button", { exact: true, name: "Play" })).toBeVisible();
  await expect(page.locator("[data-blume-narration-player]")).toHaveScreenshot("browser-narration-paused.png", {
    mask: [page.locator("[data-narration-time]")],
  });
  await page.getByRole("button", { exact: true, name: "Play" }).click();
  const cancellations = await page.evaluate(() => Number(Reflect.get(window, "__protoformSpeechCancelCount")));
  await page.getByRole("button", { exact: true, name: "Stop listening" }).click();
  await expect(page.getByRole("button", { name: /Listen to this page/u })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "__protoformSpeechCancelCount")))
    .toBe(cancellations + 1);
});

test("hides narration when the browser has no voice for the page language", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        addEventListener: () => undefined,
        getVoices: () => [],
        removeEventListener: () => undefined,
      },
    });
  });
  await page.goto("/docs/getting-started");
  await expect(page.locator("[data-blume-narration-player]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Listen to this page/u })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Getting started" })).toBeVisible();
});

test.describe("browser-language routing", () => {
  test.use({ locale: "pl-PL" });

  test("routes first visits but remembers an explicit language choice @cross-browser", async ({ page }) => {
    await page.goto("/docs?reader=first#intro");
    await expect(page).toHaveURL(/\/docs\/pl\?reader=first#intro$/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    const header = page.getByRole("banner");
    await header.getByLabel("Język: Polski", { exact: true }).click();
    await header.getByRole("link", { exact: true, name: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/docs");
    await expect(page).toHaveURL(/\/docs$/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("does not reroute a deep link with no translated API reference", async ({ page }) => {
    await page.goto("/docs/reference");
    await expect(page).toHaveURL(/\/docs\/reference$/u);
    await expect(page.getByRole("heading", { name: "Protoform bookstore Connect API" })).toBeVisible();
    await expect(page.locator("[aria-label^='Language:']")).toHaveCount(0);
  });
});

test("generates all 18 API sample languages and updates samples from the request form @cross-browser", async ({
  page,
}) => {
  await page.goto("/docs/reference");
  await page.getByRole("link").filter({ hasText: "Create a book" }).first().click();
  await expect(page.getByRole("heading", { name: "Create a book" })).toBeVisible();
  const request = page
    .locator("blume-panel-tabs")
    .filter({ has: page.getByRole("tablist", { exact: true, name: "Request" }) });
  await expect(request.getByRole("tab")).toHaveText([
    "cURL",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "Java",
    "PHP",
    "Ruby",
    "PowerShell",
    "Swift",
    "C#",
    ".NET",
    "C",
    "C++",
    "Kotlin",
    "Dart",
  ]);
  await expect(request.getByRole("tabpanel", { includeHidden: true })).toContainText(
    Array.from({ length: 18 }, () => "CreateBook")
  );
  await page.getByText("Try it", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Request body" })
    .fill('{"bookId":"optional-samples","book":{"title":"No key required"}}');
  await request.getByRole("tab", { exact: true, name: "TypeScript" }).click();
  await expect(request.getByRole("tabpanel")).toContainText("optional-samples");
  await expect(request.getByRole("tabpanel")).toContainText("No key required");
});
