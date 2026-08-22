import { describe, expect, it, rs } from "@rstest/core";
import { render, renderHook, screen } from "@testing-library/react";
import { AutoForm } from "..";
import { useAutoForm } from "../context";

describe("useAutoForm", () => {
  it("throws a clear error when used outside AutoForm", () => {
    expect(() => {
      renderHook(() => useAutoForm());
    }).toThrow("useAutoForm must be used inside an AutoForm component.");
  });
});

describe("AutoForm ErrorBoundary", () => {
  it("renders an error alert when schema is invalid", () => {
    // Suppress React error boundary console noise
    const spy = rs.spyOn(console, "error").mockImplementation(() => undefined);

    render(<AutoForm schema={"not a schema" as never} />);

    expect(screen.getByText(/autoform failed to render/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
