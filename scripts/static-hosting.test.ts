import { existsSync, readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";

const repositoryDirectory = new URL("../", import.meta.url);

describe("static docs and registry hosting", () => {
  test("builds one Cloudflare Pages artifact containing docs and registry JSON", () => {
    const manifest = JSON.parse(readFileSync(new URL("package.json", repositoryDirectory), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const config = readFileSync(new URL("blume.config.ts", repositoryDirectory), "utf8");
    const deploymentGuide = readFileSync(
      new URL("content/docs/(production)/deployment.mdx", repositoryDirectory),
      "utf8"
    );
    const landingPage = readFileSync(new URL("pages/index.astro", repositoryDirectory), "utf8");

    expect(manifest.scripts?.["build"]).toBe(
      "bun run registry:build && blume build --strict && bun run scripts/finalize-docs-build.ts"
    );
    expect(manifest.scripts?.["docs:blume:e2e"]).toContain("astro preview --root .blume-verify");
    expect(config).toContain('site: "https://protoform.pages.dev"');
    expect(config).not.toContain('adapter: "');
    expect(config).not.toContain('output: "server"');
    expect(config).not.toContain("mcp:");
    expect(landingPage).toContain("siteUrl={data.config.site}");
    expect(landingPage).not.toContain("noindex={true}");
    expect(existsSync(new URL("public/r/protoform.json", repositoryDirectory))).toBe(true);
    expect(deploymentGuide).toContain("https://protoform.pages.dev/docs");
    expect(deploymentGuide).toContain("https://protoform.pages.dev/r/{name}.json");
    expect(deploymentGuide).toContain("BUN_VERSION");
    expect(deploymentGuide).toContain("1.3.14");
    expect(deploymentGuide).toContain("Build command");
    expect(deploymentGuide).toContain("`bun run build`");
    expect(deploymentGuide).toContain("Build output directory");
    expect(deploymentGuide).toContain("`dist`");
  });
});
