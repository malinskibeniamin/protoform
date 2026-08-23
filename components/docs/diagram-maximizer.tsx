"use client";

import React from "react";
import { createPortal } from "react-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base-nova/protoform/components/dialog";
import { TooltipProvider } from "@/registry/base-nova/protoform/components/tooltip";
import { DiagramControl } from "./diagram-control";
import type { ActiveDiagram, DiagramPortal } from "./diagram-maximizer-types";
import { ExpandedDiagramPreview } from "./expanded-diagram-preview";

const DIAGRAM_SELECTOR = "blume-mermaid, [data-diagram], [data-architecture-diagram]";

let controlId = 0;

function getDiagramLabel(target: HTMLElement): string {
  const explicitLabel = target.getAttribute("aria-label")?.trim();
  if (explicitLabel) {
    return explicitLabel;
  }

  const caption = target.querySelector("figcaption")?.textContent?.trim();
  if (caption) {
    return caption;
  }

  return "diagram";
}

function findDiagramTargets(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(DIAGRAM_SELECTOR)).filter((target) => {
    if (target.closest("[data-diagram-dialog]")) {
      return false;
    }

    return !target.parentElement?.closest(DIAGRAM_SELECTOR);
  });
}

function createControlHost(target: HTMLElement): HTMLDivElement {
  const host = document.createElement("div");
  host.className = "absolute top-3 right-3 z-10 w-auto";
  host.dataset["diagramControls"] = "";
  controlId += 1;
  host.dataset["diagramControlsId"] = String(controlId);
  target.dataset["diagramEnhanced"] = "";
  target.append(host);
  return host;
}

function samePortals(current: DiagramPortal[], next: DiagramPortal[]): boolean {
  return (
    current.length === next.length &&
    current.every((portal, index) => portal.target === next[index]?.target && portal.host === next[index]?.host)
  );
}

export function DiagramMaximizer() {
  const [portals, setPortals] = React.useState<DiagramPortal[]>([]);
  const [activeDiagram, setActiveDiagram] = React.useState<ActiveDiagram | null>(null);
  const [fullscreenTarget, setFullscreenTarget] = React.useState<Element | null>(null);

  React.useEffect(function discoverDiagrams() {
    const hosts = new Map<HTMLElement, HTMLDivElement>();

    function syncDiagrams() {
      const targets = findDiagramTargets();
      const nextTargets = new Set(targets);

      for (const [target, host] of hosts) {
        if (!nextTargets.has(target)) {
          host.remove();
          target.removeAttribute("data-diagram-enhanced");
          hosts.delete(target);
        }
      }

      const nextPortals = targets.map((target) => {
        const existingHost = hosts.get(target);
        const host = existingHost?.isConnected ? existingHost : createControlHost(target);
        hosts.set(target, host);
        return {
          host,
          id: host.dataset["diagramControlsId"] ?? getDiagramLabel(target),
          label: getDiagramLabel(target),
          target,
        };
      });

      setPortals((current) => (samePortals(current, nextPortals) ? current : nextPortals));
    }

    syncDiagrams();
    const observer = new MutationObserver(syncDiagrams);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("astro:page-load", syncDiagrams);

    return function stopDiscoveringDiagrams() {
      observer.disconnect();
      document.removeEventListener("astro:page-load", syncDiagrams);
      for (const [target, host] of hosts) {
        host.remove();
        target.removeAttribute("data-diagram-enhanced");
      }
    };
  }, []);

  React.useEffect(function trackFullscreenElement() {
    function syncFullscreenElement() {
      setFullscreenTarget(document.fullscreenElement);
    }

    syncFullscreenElement();
    document.addEventListener("fullscreenchange", syncFullscreenElement);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenElement);
  }, []);

  function closeFallback() {
    const trigger = activeDiagram?.trigger;
    setActiveDiagram(null);
    queueMicrotask(() => trigger?.focus());
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      closeFallback();
    }
  }

  async function toggleFullscreen(portal: DiagramPortal, trigger: HTMLButtonElement) {
    if (document.fullscreenElement === portal.target) {
      try {
        await document.exitFullscreen();
      } catch {
        setActiveDiagram({
          label: portal.label,
          target: portal.target,
          trigger,
        });
      }
      return;
    }

    if (portal.target.requestFullscreen) {
      try {
        await portal.target.requestFullscreen();
        return;
      } catch {
        setActiveDiagram({
          label: portal.label,
          target: portal.target,
          trigger,
        });
        return;
      }
    }

    setActiveDiagram({ label: portal.label, target: portal.target, trigger });
  }

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={0}>
      {portals.map((portal) => {
        const isFullscreen = fullscreenTarget === portal.target;

        return createPortal(
          <DiagramControl isFullscreen={isFullscreen} onToggle={toggleFullscreen} portal={portal} />,
          portal.host,
          portal.id
        );
      })}

      <Dialog onOpenChange={handleDialogOpenChange} open={activeDiagram !== null}>
        <DialogContent
          className="translate-0 inset-0 h-[100dvh] max-h-none w-full max-w-none rounded-none border-0 sm:max-w-none"
          data-diagram-dialog=""
          size="full"
        >
          <DialogHeader className="border-border border-b pr-14">
            <DialogTitle>
              {activeDiagram?.label === "diagram" ? "Diagram" : (activeDiagram?.label ?? "Diagram")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-screen diagram view. Press Escape or the close button to return to the page.
            </DialogDescription>
          </DialogHeader>
          {activeDiagram ? <ExpandedDiagramPreview target={activeDiagram.target} /> : null}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
