import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildRegistry } from "./build-registry.js";

const repositoryRoot = resolve(import.meta.dirname, "..");
const expectedRegistryDigest =
  "d0a38817e617a085e6574f255b1731e9f5c4c5470990b00f32107bf934c66831";
let outputDirectory: string | undefined;

afterEach(async () => {
  if (outputDirectory) {
    await rm(outputDirectory, { force: true, recursive: true });
    outputDirectory = undefined;
  }
});

describe("registry builder", () => {
  it("reproduces every published registry artifact", async () => {
    const actualDirectory = await mkdtemp(
      join(tmpdir(), "protoform-registry-")
    );
    outputDirectory = actualDirectory;

    await buildRegistry({ outputDirectory: actualDirectory, repositoryRoot });

    const files = (await readdir(actualDirectory)).sort();
    expect(files).toHaveLength(129);
    const artifacts = await Promise.all(
      files.map(async (file) => ({
        content: await readFile(resolve(actualDirectory, file)),
        file,
      }))
    );
    const digest = createHash("sha256");
    for (const artifact of artifacts) {
      digest.update(artifact.file);
      digest.update("\0");
      digest.update(artifact.content);
      digest.update("\0");
    }
    expect(digest.digest("hex")).toBe(expectedRegistryDigest);
  });
});
