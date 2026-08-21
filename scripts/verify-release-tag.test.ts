import { describe, expect, it } from "vitest";

import { expectedReleaseTag, verifyReleaseTag } from "./verify-release-tag";

describe("release tag verification", () => {
  it("requires the immutable tag to match the package version", () => {
    expect(expectedReleaseTag("1.0.0")).toBe("v1.0.0");
    expect(() => verifyReleaseTag("v1.0.0", "1.0.0")).not.toThrow();
    expect(() => verifyReleaseTag("v1.0.1", "1.0.0")).toThrow(
      "Release tag v1.0.1 does not match package version 1.0.0"
    );
    expect(() => verifyReleaseTag(undefined, "1.0.0")).toThrow("GITHUB_REF_NAME is required");
  });
});
