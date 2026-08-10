import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { z } from "zod";

const registryFileSchema = z
  .object({
    path: z.string().min(1),
    target: z.string().min(1).optional(),
    type: z.string().min(1),
  })
  .strict();

const registryItemSchema = z
  .object({
    dependencies: z.array(z.string()).optional(),
    description: z.string(),
    files: z.array(registryFileSchema),
    name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    registryDependencies: z.array(z.string()).optional(),
    title: z.string(),
    type: z.string().min(1),
  })
  .strict();

const registrySchema = z
  .object({
    $schema: z.url(),
    homepage: z.url(),
    items: z.array(registryItemSchema),
    name: z.string().min(1),
  })
  .strict();

const registryItemSchemaUrl = "https://ui.shadcn.com/schema/registry-item.json";

interface BuildRegistryOptions {
  outputDirectory: string;
  repositoryRoot: string;
}

function resolveRepositoryFile(repositoryRoot: string, path: string) {
  const sourcePath = resolve(repositoryRoot, path);
  const relativePath = relative(repositoryRoot, sourcePath);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error(`Registry file escapes the repository: ${path}`);
  }
  return sourcePath;
}

export async function buildRegistry({
  outputDirectory,
  repositoryRoot,
}: BuildRegistryOptions) {
  const registryPath = resolve(repositoryRoot, "registry.json");
  const registrySource = await readFile(registryPath, "utf8");
  const registry = registrySchema.parse(JSON.parse(registrySource));

  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(resolve(outputDirectory, "registry.json"), registrySource);

  await Promise.all(
    registry.items.map(async (item) => {
      const files = await Promise.all(
        item.files.map(async (file) => {
          const content = await readFile(
            resolveRepositoryFile(repositoryRoot, file.path),
            "utf8"
          );
          // biome-ignore assist/source/useSortedKeys: registry field order is a published compatibility contract.
          return {
            path: file.path,
            content,
            type: file.type,
            ...(file.target ? { target: file.target } : {}),
          };
        })
      );
      // biome-ignore assist/source/useSortedKeys: registry field order is a published compatibility contract.
      const artifact = {
        $schema: registryItemSchemaUrl,
        name: item.name,
        title: item.title,
        description: item.description,
        ...(item.dependencies ? { dependencies: item.dependencies } : {}),
        ...(item.registryDependencies
          ? { registryDependencies: item.registryDependencies }
          : {}),
        files,
        type: item.type,
      };

      await writeFile(
        resolve(outputDirectory, `${item.name}.json`),
        JSON.stringify(artifact, undefined, 2)
      );
    })
  );
}

if (import.meta.main) {
  buildRegistry({
    outputDirectory: resolve(import.meta.dirname, "../public/r"),
    repositoryRoot: resolve(import.meta.dirname, ".."),
  }).catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Failed to build the registry."
    );
    process.exitCode = 1;
  });
}
