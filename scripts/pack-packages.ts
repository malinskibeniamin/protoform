#!/usr/bin/env bun

import { access, mkdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

import { $ } from "bun";
import { z } from "zod";

const packageManifestSchema = z.object({
  name: z.string().regex(/^@protoform\/[a-z-]+$/u),
  version: z.string().regex(/^\d+\.\d+\.\d+$/u),
});
const repositoryRoot = resolve(import.meta.dirname, "..");
const artifactDirectory = join(repositoryRoot, ".tmp", "package-artifacts");
const packageDirectories = ["core", "auto-form", "react"] as const;
const SOURCE_MAP_DIRECTIVE_PATTERN = /\/\/# sourceMappingURL=(?<filename>[^\s]+)/u;

await rm(artifactDirectory, { force: true, recursive: true });
await mkdir(artifactDirectory, { recursive: true });

await Promise.all(
  packageDirectories.map(async (directory) => {
    const packageDirectory = join(repositoryRoot, "packages", directory);
    const manifest = packageManifestSchema.parse(
      JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"))
    );
    const filename = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;
    const declarationPath = join(packageDirectory, "dist", "index.d.ts");
    const declaration = await readFile(declarationPath, "utf8");
    const declarationMap = SOURCE_MAP_DIRECTIVE_PATTERN.exec(declaration)?.groups?.["filename"];

    if (declarationMap) {
      await access(join(packageDirectory, "dist", declarationMap));
    }

    await $`bun pm pack --destination ${artifactDirectory} --ignore-scripts`.cwd(packageDirectory);
    await access(join(artifactDirectory, filename));
  })
);

console.info(`Packed compiled packages in ${artifactDirectory}`);
