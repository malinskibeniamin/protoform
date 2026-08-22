import { afterEach, describe, expect, it, rs } from "@rstest/core";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DiagramMaximizer } from "./diagram-maximizer";

const FULL_SCREEN_PATTERN = /full screen/i;

function appendDiagram(tagName = "blume-mermaid", label = "System flow") {
  const diagram = document.createElement(tagName);
  diagram.setAttribute("aria-label", label);
  diagram.setAttribute("data-test-diagram", "");
  diagram.innerHTML = '<div><svg aria-label="Rendered architecture"></svg></div>';
  document.body.append(diagram);
  return diagram;
}

afterEach(() => {
  cleanup();
  for (const element of document.querySelectorAll("[data-test-diagram]")) {
    element.remove();
  }
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    value: null,
  });
});

describe("DiagramMaximizer", () => {
  it("gives an unlabeled Mermaid fallback a readable dialog title", async () => {
    const user = userEvent.setup();
    const diagram = appendDiagram();
    diagram.removeAttribute("aria-label");
    Object.defineProperty(diagram, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });

    render(<DiagramMaximizer />);
    await user.click(
      await screen.findByRole("button", {
        name: "View diagram full screen",
      })
    );

    expect(await screen.findByRole("dialog", { name: "Diagram" })).toBeVisible();
  });

  it("opens an accessible full-viewport fallback and restores focus", async () => {
    const user = userEvent.setup();
    const diagram = appendDiagram();
    Object.defineProperty(diagram, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });

    render(<DiagramMaximizer />);

    const maximize = await screen.findByRole("button", {
      name: "View System flow full screen",
    });
    expect(maximize).toHaveAttribute("title", "View diagram full screen");

    await user.click(maximize);

    const dialog = await screen.findByRole("dialog", { name: "System flow" });
    const preview = within(dialog).getByTestId("diagram-preview");
    expect(preview.querySelector("svg")).not.toBeNull();
    expect(preview.firstElementChild).toHaveAttribute("tabindex", "0");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "System flow" })).not.toBeInTheDocument());
    expect(maximize).toHaveFocus();
  });

  it("enhances generic architecture containers without duplicating nested Mermaid controls", async () => {
    const generic = appendDiagram("figure", "API architecture");
    generic.setAttribute("data-diagram", "");

    const wrapper = appendDiagram("figure", "Deployment architecture");
    wrapper.setAttribute("data-architecture-diagram", "");
    const nestedMermaid = document.createElement("blume-mermaid");
    nestedMermaid.innerHTML = "<div><svg></svg></div>";
    wrapper.append(nestedMermaid);

    render(<DiagramMaximizer />);

    expect(
      await screen.findByRole("button", {
        name: "View API architecture full screen",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "View Deployment architecture full screen",
      })
    ).toBeVisible();
    expect(screen.getAllByRole("button", { name: FULL_SCREEN_PATTERN })).toHaveLength(2);
  });

  it("uses the browser Fullscreen API when available and exits from the same control", async () => {
    const user = userEvent.setup();
    const diagram = appendDiagram();
    const requestFullscreen = rs.fn(() => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: diagram,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    const exitFullscreen = rs.fn(() => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        value: null,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    Object.defineProperty(diagram, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    render(<DiagramMaximizer />);

    await user.click(
      await screen.findByRole("button", {
        name: "View System flow full screen",
      })
    );
    expect(requestFullscreen).toHaveBeenCalledOnce();

    await user.click(
      await screen.findByRole("button", {
        name: "Exit System flow full screen",
      })
    );
    expect(exitFullscreen).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
