import { describe, expect } from "@rstest/core";

import { formatSubmittedValue } from "./format-submitted-value.js";

describe("formatSubmittedValue", () => {
  test("formats protobuf JavaScript values as readable JSON", () => {
    const formatted = formatSubmittedValue({
      apiKey: "demo-api-key",
      count: 42n,
      nested: {
        inputToken: "demo-input-token",
        payload: new Uint8Array([1, 2, 3]),
      },
      title: "Visible",
    });

    expect(JSON.parse(formatted)).toEqual({
      apiKey: "demo-api-key",
      count: "42",
      nested: {
        inputToken: "demo-input-token",
        payload: [1, 2, 3],
      },
      title: "Visible",
    });
    expect(formatted).toContain('\n  "title": "Visible"\n');
  });
});
