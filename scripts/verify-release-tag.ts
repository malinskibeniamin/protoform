import { readFileSync } from "node:fs";
import process from "node:process";

import { z } from "zod";

const packageManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
});
const publishedPackageDirectories = ["core", "auto-form", "react"] as const;

export function expectedReleaseTag(version: string): string {
  return `v${version}`;
}

export function verifyReleaseTag(tag: string | undefined, version: string): void {
  if (!tag) {
    throw new Error("GITHUB_REF_NAME is required for a release.");
  }
  if (tag !== expectedReleaseTag(version)) {
    throw new Error(`Release tag ${tag} does not match package version ${version}.`);
  }
}

export function verifyPackageVersions(
  releaseVersion: string,
  packages: ReadonlyArray<{ name: string; version: string }>
): void {
  for (const packageManifest of packages) {
    if (packageManifest.version !== releaseVersion) {
      throw new Error(
        `${packageManifest.name} version ${packageManifest.version} does not match release version ${releaseVersion}.`
      );
    }
  }
}

if (import.meta.main) {
  const manifest = packageManifestSchema.parse(
    JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
  );
  const publishedPackages = publishedPackageDirectories.map((directory) =>
    packageManifestSchema.parse(
      JSON.parse(readFileSync(new URL(`../packages/${directory}/package.json`, import.meta.url), "utf8"))
    )
  );
  verifyReleaseTag(process.env["GITHUB_REF_NAME"], manifest.version);
  verifyPackageVersions(manifest.version, publishedPackages);
  console.info(`Release tag ${process.env["GITHUB_REF_NAME"]} matches every package manifest.`);
}
