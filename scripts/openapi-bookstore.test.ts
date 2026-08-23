import { readFileSync } from "node:fs";
import { describe, expect } from "@rstest/core";

const spec = readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8");

describe("bookstore OpenAPI surface", () => {
  test.each(["ListBooks", "GetBook", "CreateBook", "UpdateBook", "DeleteBook"])("documents %s", (method) => {
    expect(spec).toContain(`/protoform.conformance.v1.LibraryService/${method}:`);
    expect(spec).toContain(`operationId: protoform.conformance.v1.LibraryService.${method}`);
  });

  test("documents ISBN-13, update masks, and etags", () => {
    expect(spec).toContain("isbn:");
    expect(spec).toContain('pattern: "^[0-9]{13}$"');
    expect(spec).toContain("updateMask:");
    expect(spec).toContain("etag:");
    expect(spec).not.toContain("immutableIsbn");
  });
});
