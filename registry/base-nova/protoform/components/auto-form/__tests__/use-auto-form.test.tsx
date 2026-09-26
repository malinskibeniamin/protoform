import { describe, expect } from "@rstest/core";
import { renderHook } from "@testing-library/react";
import { useAutoForm } from "../context";

describe("useAutoForm", () => {
  test("throws a clear error when used outside AutoForm", () => {
    expect(() => {
      renderHook(() => useAutoForm());
    }).toThrow("useAutoForm must be used inside an AutoForm component.");
  });
});
