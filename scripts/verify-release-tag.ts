import { readFileSync } from "node:fs";
import process from "node:process";

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

if (import.meta.main) {
  const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  verifyReleaseTag(process.env["GITHUB_REF_NAME"], manifest.version);
  console.info(`Release tag ${process.env["GITHUB_REF_NAME"]} matches package.json.`);
}
