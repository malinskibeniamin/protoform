#!/usr/bin/env bun
/**
 * Enforce the registry-native Protoform layering contract: core stays
 * schema-system-free. Protobuf and Connect belong to protobuf-provider.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const coreSrc = join(
  import.meta.dir,
  "..",
  "registry",
  "base-nova",
  "protoform",
  "lib",
  "core"
);
const bannedModulePattern =
  /from\s+["'](@bufbuild\/[^"']+|@connectrpc\/[^"']+)["']/g;

async function collectTypescriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => join(entry.parentPath, entry.name));
}

const files = await collectTypescriptFiles(coreSrc);
const violations: string[] = [];

const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
for (const [index, text] of contents.entries()) {
  const file = files[index];
  if (!file) {
    continue;
  }
  for (const match of text.matchAll(bannedModulePattern)) {
    violations.push(
      `${relative(process.cwd(), file)}: imports banned module ${match[1]}`
    );
  }
}

if (violations.length > 0) {
  console.error(
    "registry core layering violations (core must stay protobuf-free):"
  );
  for (const violation of violations) {
    console.error(`  ${violation}`);
  }
  process.exit(1);
}

console.log(`core boundaries OK (${files.length} files checked)`);
