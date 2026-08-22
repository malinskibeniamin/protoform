import { readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";

import playwrightConfig from "../playwright.config.js";

const browserInstall = /playwright install chromium firefox webkit/u;

describe("browser production matrix", () => {
  test("runs the end-to-end form suite in Chromium, Firefox, and WebKit", () => {
    expect(playwrightConfig.projects?.map((project) => project.name)).toEqual(["chromium", "firefox", "webkit"]);
    expect(playwrightConfig.fullyParallel).toBe(true);
    expect(readFileSync(".github/workflows/quality.yml", "utf8")).toMatch(browserInstall);
    expect(playwrightConfig.webServer).toEqual(
      expect.arrayContaining([expect.objectContaining({ url: "http://127.0.0.1:55012/health" })])
    );
  });
});
