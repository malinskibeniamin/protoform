import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repositoryDirectory = new URL("../", import.meta.url);

const readRepositoryFile = (path: string) =>
  readFileSync(new URL(path, repositoryDirectory), "utf8");

const workflows = ["ci.yml", "release.yml", "quality.yml", "security.yml"].map(
  (filename) => readRepositoryFile(`.github/workflows/${filename}`)
);

const FULL_COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const nextWorkflowJob = /\n {2}[a-z][a-z-]+:\n/u;
const PACKAGE_PUBLISH_PATTERN = /setup-node|changeset|npm publish/i;
const AI_CI_CREDENTIAL_PATTERN = /OPENAI_API_KEY|CODEX_API_KEY|@openai\/codex/u;

function workflowJob(workflow: string, name: string): string | undefined {
  return workflow.split(`\n  ${name}:\n`)[1]?.split(nextWorkflowJob)[0];
}

describe("GitHub Actions policy", () => {
  it("pins every third-party action to an immutable commit", () => {
    const actions = workflows.flatMap((workflow) => [
      ...workflow.matchAll(/uses:\s*([^@\s]+)@([^\s]+)/g),
    ]);

    expect(actions.length).toBeGreaterThan(0);
    for (const [, action, version] of actions) {
      expect(version, `${action} is not pinned`).toMatch(
        FULL_COMMIT_SHA_PATTERN
      );
    }
  });

  it("publishes registry snapshots from Git tags without a package registry", () => {
    expect(workflows[1]).toContain("tags:");
    expect(workflows[1]).toContain("gh release create");
    expect(workflows[1]).not.toMatch(PACKAGE_PUBLISH_PATTERN);
  });

  it("limits workflow permissions and runaway jobs", () => {
    expect(workflows[0]).toContain("permissions:\n  contents: read");

    const release = workflows[1] ?? "";
    const releaseJob = workflowJob(release, "release");
    expect(release).toContain("permissions:\n  contents: read");
    expect(releaseJob).toContain("permissions:\n      attestations: write");
    expect(releaseJob).toContain("contents: write");
    expect(releaseJob).toContain("id-token: write");

    for (const workflow of workflows) {
      const jobs = workflow
        .split("\njobs:\n")[1]
        ?.match(/^ {2}[a-z][a-z-]+:\n/gm);
      const timeouts = workflow.match(/^ {4}timeout-minutes: \d+$/gm);
      expect(timeouts).toHaveLength(jobs?.length ?? 0);
    }
  });

  it("runs the complete merge gate on pull requests", () => {
    const ci = workflows[0] ?? "";
    const jobs = ci.split("\njobs:\n")[1]?.match(/^ {2}[a-z][a-z-]+:\n/gm);
    const verify = workflowJob(ci, "verify");

    expect(jobs).toEqual(["  verify:\n"]);
    expect(verify).toContain("timeout-minutes: 20");
    expect(verify).toContain("bun run ci:gate");
    expect(verify).not.toContain("bun run test:ci");
    expect(verify).not.toContain("playwright install");
  });

  it("skips the previous-main comparison on the first public push", () => {
    const ci = workflows[0] ?? "";

    expect(ci).toContain(
      "github.event.before != '0000000000000000000000000000000000000000'"
    );
    expect(ci).toContain("git cat-file -e");
    expect(ci).toContain("git merge-base --is-ancestor");
  });

  it("keeps exhaustive verification outside the pull request path", () => {
    const quality = workflows[2] ?? "";
    const verify = workflowJob(quality, "verify");

    expect(quality).toContain("workflow_dispatch:");
    expect(quality).toContain("schedule:");
    expect(verify).toContain("runs-on: macos-latest");
    expect(verify).toContain("playwright install chromium firefox webkit");
    expect(verify).toContain("bun run quality:gate");
  });

  it("does not block automated gates on dependency audit results", () => {
    const scripts = JSON.parse(readRepositoryFile("package.json")).scripts as
      | Record<string, string>
      | undefined;

    for (const gate of ["ci:gate", "quality:gate", "release:gate"]) {
      expect(scripts?.[gate], gate).not.toContain("bun audit");
    }
  });

  it("keeps documentation CI deterministic and API-key free", () => {
    const manifest = JSON.parse(readRepositoryFile("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(
      existsSync(
        new URL(".github/workflows/docs-eval.yml", repositoryDirectory)
      )
    ).toBe(false);
    expect(workflows.join("\n")).not.toMatch(AI_CI_CREDENTIAL_PATTERN);
    expect(manifest.scripts?.["ci:gate"]).toContain("bun run docs:blume:audit");
    expect(manifest.scripts?.typecheck).toContain("bun run docs:blume:check");
  });

  it("runs the focused test gate with one worker", () => {
    const scripts = JSON.parse(readRepositoryFile("package.json")).scripts as
      | Record<string, string>
      | undefined;
    const testCi = scripts?.["test:ci"];

    expect(testCi).toContain("test:unit:ci");
    expect(testCi).toContain("test:integration:smoke");
    expect(scripts?.["test:unit:ci"]).toContain("--maxWorkers=1");
    expect(scripts?.["test:integration:smoke"]).toContain("--maxWorkers=1");
    expect(scripts?.["test:integration:smoke"]).toContain(
      "examples/catalog/capability-demo.test.tsx"
    );
    expect(scripts?.["test:integration:smoke"]).toContain(
      "components/auto-form/__tests__/proto-forms.test.tsx"
    );
  });

  it("keeps GitHub Actions updates automated", () => {
    const dependabot = readRepositoryFile(".github/dependabot.yml");
    expect(dependabot).toContain("package-ecosystem: github-actions");
    expect(dependabot).toContain("package-ecosystem: bun");
    expect(dependabot).toContain("package-ecosystem: docker");
    expect(dependabot).toContain("interval: weekly");
    expect(dependabot).toContain("dependency-name: node");
    expect(dependabot).toContain("version-update:semver-major");
  });

  it("prepares public CodeQL and Scorecard analysis without exposing the private repository", () => {
    const security = workflows[3] ?? "";

    expect(security).toContain("github.event.repository.private == false");
    expect(security).toContain("github/codeql-action/init@");
    expect(security).toContain("languages: javascript-typescript");
    expect(security).toContain("ossf/scorecard-action@");
    expect(security).toContain("publish_results: true");
  });

  it("runs the complete release gate before creating a release", () => {
    const release = workflows[1] ?? "";
    const job = workflowJob(release, "release");

    expect(job).toContain("playwright install chromium firefox webkit");
    expect(job).toContain("bun run release:gate");
    expect(job?.indexOf("bun run release:gate")).toBeLessThan(
      job?.indexOf("gh release create") ?? -1
    );
  });
});
