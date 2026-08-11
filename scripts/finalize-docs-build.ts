import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDirectory = join(process.cwd(), "dist");
const homeHtml = readFileSync(join(outputDirectory, "index.html"), "utf8");
const llmsPath = join(outputDirectory, "llms.txt");
const llms = readFileSync(llmsPath, "utf8");

function requiredMeta(pattern: RegExp, label: string): string {
  const value = homeHtml.match(pattern)?.[1];
  if (!value) {
    throw new Error(`Built home page is missing ${label}`);
  }
  return value;
}

const title = requiredMeta(/<title>([^<]+)<\/title>/, "a title");
const description = requiredMeta(
  /<meta content="([^"]+)" name="description"/,
  "a meta description"
);
const canonical = requiredMeta(
  /<link href="([^"]+)" rel="canonical"/,
  "a canonical URL"
);

// Blume 1.3.1 indexes custom Astro pages but only emits content routes in
// llms.txt. Keep the indexable custom home synchronized with the generated
// manifest so the audit and agent-facing surface describe the same site.
if (!llms.includes(`](${canonical})`)) {
  writeFileSync(
    llmsPath,
    `${llms.trimEnd()}\n\n## Home\n\n- [${title}](${canonical}): ${description}\n`
  );
}
