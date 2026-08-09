import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("Buf runtime dependency policy", () => {
  it("uses one RE2-backed CEL runtime across Protoform and Protovalidate", () => {
    const dependencyTree = execFileSync("bun", ["pm", "ls", "--all"], {
      encoding: "utf8",
    });
    const celVersions = new Set(
      [...dependencyTree.matchAll(/@bufbuild\/cel@([^\s]+)/g)].map(
        ([, version]) => version
      )
    );

    expect(celVersions).toEqual(new Set(["0.6.0"]));
    expect(dependencyTree).toContain("@bufbuild/cel-spec@0.6.0");
    expect(dependencyTree).toContain("@bufbuild/re2@0.6.0");
  });
});
