import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PresetLab } from "./preset-lab";
import { buildPresetCode, defaultPreset, defaultRadius, presetDefinitions } from "./preset-lab-presets";

const originalClipboard = navigator.clipboard;
const originalExitFullscreen = document.exitFullscreen;
const workEmailPattern = /work email/i;
const submitPattern = /submit/i;

describe("PresetLab", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/docs/presets");
    document.documentElement.dataset["theme"] = "light";
    localStorage.setItem("blume-theme", "light");
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: null,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: originalExitFullscreen,
    });
    vi.restoreAllMocks();
  });

  it("applies preview mode changes to the Blume docs theme", async () => {
    const user = userEvent.setup();

    render(<PresetLab />);

    await user.click(screen.getByRole("button", { name: "Dark preview" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("blume-theme")).toBe("dark");
  });

  it("tracks Blume docs theme changes without a reload", async () => {
    render(<PresetLab />);

    document.documentElement.dataset["theme"] = "dark";
    localStorage.setItem("blume-theme", "dark");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Dark preview" })).toHaveAttribute("aria-pressed", "true");
    });
    expect(screen.getByTestId("preset-preview")).toHaveClass("dark");
    expect(new URL(window.location.href).searchParams.get("mode")).toBe("dark");
  });

  it("starts from the current Blume docs theme when mode is not shared", () => {
    document.documentElement.dataset["theme"] = "dark";
    localStorage.setItem("blume-theme", "dark");

    render(<PresetLab />);

    expect(screen.getByRole("button", { name: "Dark preview" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preset-preview")).toHaveClass("dark");
  });

  it("keeps every preset close while rendering one focused live form", async () => {
    const user = userEvent.setup();

    render(<PresetLab />);

    expect(screen.getByTestId("preset-lab")).toHaveClass("not-prose");
    expect(
      screen.getByText("Base UI + Nova", {
        selector: "[data-slot='preset-compatibility']",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light preview" })).toHaveTextContent("Light");
    expect(screen.getByRole("button", { name: "Dark preview" })).toHaveTextContent("Dark");
    const workspace = screen.getByTestId("preset-workspace");
    for (const preset of presetDefinitions) {
      expect(
        within(workspace).getByRole("button", {
          name: `Choose ${preset.name} preset`,
        })
      ).toBeInTheDocument();
    }
    const workEmailInput = within(workspace).getByRole("textbox", {
      name: workEmailPattern,
    });
    expect(within(workspace).getAllByRole("button", { name: submitPattern })).toHaveLength(1);
    expect(within(workspace).getByRole("combobox", { name: "Review template" })).toBeInTheDocument();
    expect(
      within(workspace).getByRole("slider", {
        name: "Coverage target slider",
      })
    ).toBeInTheDocument();
    expect(within(workspace).getByRole("textbox", { name: "Review notes" })).toBeInTheDocument();
    expect(
      within(workspace).getByRole("button", {
        name: "Open calendar for Due date",
      })
    ).toBeInTheDocument();
    expect(
      within(workspace).getByRole("checkbox", {
        name: "Require final approval",
      })
    ).toBeInTheDocument();
    expect(screen.getByTestId("preset-preview")).toHaveAttribute("data-preset-id", "neutral");
    expect(screen.getByTestId("preset-preview")).toHaveStyle("--background: oklch(1 0 0)");

    await user.clear(workEmailInput);
    await user.paste("owner@protoform.dev");
    await user.click(screen.getByRole("button", { name: "Choose Ocean preset" }));

    expect(workEmailInput).toHaveValue("owner@protoform.dev");
    expect(screen.getByTestId("preset-preview")).toHaveAttribute("data-preset-id", "ocean");
    expect(screen.getByTestId("preset-preview")).toHaveStyle(
      "--selected: oklch(0.488 0.243 264.376); --selection: oklch(0.488 0.243 264.376)"
    );
    await waitFor(() => {
      expect(new URL(window.location.href).searchParams.get("preset")).toBeTruthy();
    });
    const sharedPreset = new URL(window.location.href).searchParams.get("preset");
    expect(sharedPreset).toBe("b1YmqvjO4");
    expect(screen.getByRole("link", { name: "Open in shadcn/create" })).toHaveAttribute(
      "href",
      `https://ui.shadcn.com/create?base=base&preset=${sharedPreset}`
    );
    expect(screen.getByText(`bunx shadcn@latest create --base base --preset ${sharedPreset}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy Bun command" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Large" }));

    expect(screen.getByTestId("preset-preview")).toHaveStyle("--radius: 0.75rem; --radius-lg: 0.75rem");

    await user.click(screen.getByRole("button", { name: "Dark preview" }));

    expect(screen.getByTestId("preset-preview")).toHaveClass("dark");
    expect(screen.getByTestId("preset-preview")).toHaveStyle("--background: oklch(0.145 0 0)");
    expect(new URL(window.location.href).searchParams.get("mode")).toBe("dark");

    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("enters and exits full screen without replacing the live workspace", async () => {
    const user = userEvent.setup();

    render(<PresetLab />);

    const workspace = screen.getByTestId("preset-workspace");
    const requestFullscreen = vi.fn(() => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: workspace,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    const exitFullscreen = vi.fn(() => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: null,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    Object.defineProperty(workspace, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    await user.click(screen.getByRole("button", { name: "Enter full screen" }));

    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(workspace).toHaveAttribute("data-fullscreen", "true");
    expect(screen.getByRole("button", { name: "Exit full screen" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Exit full screen" }));

    expect(exitFullscreen).toHaveBeenCalledOnce();
    expect(workspace).toHaveAttribute("data-fullscreen", "false");
  });

  it("falls back to an accessible full-viewport mode when the browser API rejects", async () => {
    const user = userEvent.setup();

    render(
      <>
        <div data-testid="page-background">Page background</div>
        <PresetLab />
      </>
    );

    const workspace = screen.getByTestId("preset-workspace");
    Object.defineProperty(workspace, "requestFullscreen", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("Fullscreen blocked")),
    });

    await user.click(screen.getByRole("button", { name: "Enter full screen" }));

    expect(workspace).toHaveAttribute("data-fullscreen", "true");
    expect(workspace).toHaveAttribute("data-fullscreen-mode", "fallback");
    expect(workspace).toHaveAttribute("role", "dialog");
    expect(workspace).toHaveAttribute("aria-modal", "true");
    expect(workspace.parentElement?.parentElement).toBe(document.body);
    expect(screen.getByTestId("page-background").closest("[inert]")).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(workspace).toHaveAttribute("data-fullscreen", "false");
    expect(screen.getByTestId("page-background").closest("[inert]")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Full screen closed");
  });

  it("reports invalid shared presets and clipboard failures", async () => {
    const supportedCode = buildPresetCode(defaultPreset, defaultRadius);
    const noncanonicalCode = `${supportedCode[0]}0${supportedCode.slice(1)}`;
    window.history.replaceState({}, "", `/docs/presets?preset=${noncanonicalCode}&mode=night`);
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard unavailable")),
      },
    });

    render(<PresetLab />);

    expect(screen.getByRole("status")).toHaveTextContent("Showing the default Base UI + Nova preset");

    await user.click(screen.getByRole("button", { name: "Copy preset code" }));

    expect(screen.getByRole("status")).toHaveTextContent("Could not copy the preset code");
  });

  it("preserves a supported preset when only the shared mode is invalid", () => {
    const presetCode = buildPresetCode(defaultPreset, defaultRadius);
    window.history.replaceState({}, "", `/docs/presets?preset=${presetCode}&mode=night`);

    render(<PresetLab />);

    expect(screen.getByTestId("preset-preview")).toHaveAttribute("data-preset-id", "neutral");
    expect(screen.getByRole("status")).toHaveTextContent("Showing the light preview");
    expect(screen.getByRole("status")).not.toHaveTextContent("Showing the default");
  });
});
