import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { unexpectedChildExitCode } from "./production-lifecycle";
import {
  createPublicProxyHeaderResolver,
  resolveProxyTarget,
  resolvePublicProxyHeaders,
} from "./production-routing";

const PACKAGE_REGISTRY_PATTERN = /npm registry|github packages/i;

describe("production same-origin routing", () => {
  it("sends /api Connect requests to the internal service and strips the prefix", () => {
    expect(
      resolveProxyTarget("/api/library.v1.LibraryService/ListBooks")
    ).toEqual({
      pathname: "/library.v1.LibraryService/ListBooks",
      port: 55_112,
    });
    expect(resolveProxyTarget("/api/health?full=1")).toEqual({
      pathname: "/health?full=1",
      port: 55_112,
    });
  });

  it("keeps docs, registry files, and api-like paths on Blume", () => {
    expect(resolveProxyTarget("/docs/bookstore")).toEqual({
      pathname: "/docs/bookstore",
      port: 55_111,
    });
    expect(resolveProxyTarget("/r/bookstore.json")).toEqual({
      pathname: "/r/bookstore.json",
      port: 55_111,
    });
    expect(resolveProxyTarget("/apiary")).toEqual({
      pathname: "/apiary",
      port: 55_111,
    });
  });

  it("uses an explicit public origin instead of forcing http proxy metadata", () => {
    expect(
      resolvePublicProxyHeaders("https://protoform.example", "internal:8080")
    ).toEqual({
      forwardedHost: "protoform.example",
      forwardedProto: "https",
    });
    expect(resolvePublicProxyHeaders(undefined, "localhost:8080")).toEqual({
      forwardedHost: "localhost:8080",
      forwardedProto: "http",
    });
    expect(() =>
      resolvePublicProxyHeaders("ftp://protoform.example", "internal:8080")
    ).toThrow("PUBLIC_ORIGIN must use http or https");
  });

  it("validates the configured public origin before the server starts", () => {
    expect(() =>
      createPublicProxyHeaderResolver("ftp://protoform.example")
    ).toThrow("PUBLIC_ORIGIN must use http or https");

    const configured = createPublicProxyHeaderResolver(
      "https://protoform.example"
    );
    expect(configured("internal:8080")).toEqual({
      forwardedHost: "protoform.example",
      forwardedProto: "https",
    });

    const inferred = createPublicProxyHeaderResolver(undefined);
    expect(inferred("localhost:8080")).toEqual({
      forwardedHost: "localhost:8080",
      forwardedProto: "http",
    });
  });

  it("ships docs, registry, and demo API in one portable container", () => {
    const dockerfile = readFileSync(
      new URL("../Dockerfile.docs", import.meta.url),
      "utf8"
    );

    expect(dockerfile).toContain("bun run registry:build");
    expect(dockerfile).toContain("dist/production-server.mjs");
    expect(dockerfile).toContain("HEALTHCHECK");
    expect(dockerfile).toContain("'/api/health'");
    expect(dockerfile).toContain("'/docs'");
    expect(dockerfile).toContain("process.exit(0)");
    expect(dockerfile).not.toContain("packages:build");
    expect(dockerfile).not.toMatch(PACKAGE_REGISTRY_PATTERN);
  });

  it("treats the docs shutdown signal as expected during graceful stop", () => {
    expect(unexpectedChildExitCode(true, null, "SIGTERM")).toBeNull();
    expect(unexpectedChildExitCode(false, 0, null)).toBe(1);
    expect(unexpectedChildExitCode(false, 4, null)).toBe(4);
    expect(unexpectedChildExitCode(false, null, "SIGTERM")).toBe(1);
  });
});
