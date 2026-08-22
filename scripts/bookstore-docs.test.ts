import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "@rstest/core";

const ROOT = new URL("../", import.meta.url);
const SIMULATED_IDE_PATTERN = /stackblitz|fake terminal/i;

function read(path: string): string {
  return readFileSync(new URL(path, ROOT), "utf8");
}

describe("bookstore flagship documentation", () => {
  it("ships a native live demo and source workspace", () => {
    const page = read("content/docs/(start-here)/bookstore.mdx");
    const workspace = read("components/docs/bookstore-workspace.astro");

    expect(page).toContain("<BookstoreWorkspace />");
    expect(page).toContain("five RPCs");
    expect(workspace).toContain("<BookstoreDemo");
    expect(workspace).toContain("aip.proto");
    expect(workspace).toContain("aip_pb.ts");
    expect(workspace).toContain("aip_form.ts");
    expect(workspace).toContain("service.ts");
    expect(workspace).toContain("highlightCode");
    expect(workspace).toContain("Loading live demo…");
  });

  it("shows real generated artifacts rather than a simulated IDE", () => {
    expect(existsSync(new URL("conformance/gen/protoform/conformance/v1/aip_pb.ts", ROOT))).toBe(true);
    expect(existsSync(new URL("conformance/gen/protoform/conformance/v1/aip_form.ts", ROOT))).toBe(true);
    expect(read("components/docs/bookstore-workspace.astro")).not.toMatch(SIMULATED_IDE_PATTERN);
  });
});
