"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/registry/base-nova/protoform/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base-nova/protoform/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base-nova/protoform/components/tooltip";

const DIAGRAM_SELECTOR =
  "blume-mermaid, [data-diagram], [data-architecture-diagram]";

interface DiagramPortal {
  host: HTMLDivElement;
  id: string;
  label: string;
  target: HTMLElement;
}

interface ActiveDiagram {
  label: string;
  target: HTMLElement;
  trigger: HTMLButtonElement;
}

interface DiagramControlProps {
  isFullscreen: boolean;
  onToggle: (
    portal: DiagramPortal,
    trigger: HTMLButtonElement
  ) => Promise<void>;
  portal: DiagramPortal;
}

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
  return Array.from(
    root.querySelectorAll<HTMLElement>(DIAGRAM_SELECTOR)
  ).filter((target) => {
    if (target.closest("[data-diagram-dialog]")) {
      return false;
    }

    return !target.parentElement?.closest(DIAGRAM_SELECTOR);
  });
}

function createControlHost(target: HTMLElement): HTMLDivElement {
  const host = document.createElement("div");
  host.className = "absolute top-3 right-3 z-10 w-auto";
  host.dataset.diagramControls = "";
  controlId += 1;
  host.dataset.diagramControlsId = String(controlId);
  target.dataset.diagramEnhanced = "";
  target.append(host);
  return host;
}

function samePortals(current: DiagramPortal[], next: DiagramPortal[]): boolean {
  return (
    current.length === next.length &&
    current.every(
      (portal, index) =>
        portal.target === next[index]?.target &&
        portal.host === next[index]?.host
    )
  );
}

function ExpandedDiagramPreview({ target }: { target: HTMLElement }) {
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(
    function renderPreview() {
      const preview = previewRef.current;
      if (!preview) {
        return;
      }

      const clone = target.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-diagram-enhanced");
      for (const controls of clone.querySelectorAll(
        "[data-diagram-controls]"
      )) {
        controls.remove();
      }
      clone.setAttribute("data-diagram-expanded", "");
      clone.tabIndex = 0;
      preview.replaceChildren(clone);

      return () => preview.replaceChildren();
    },
    [target]
  );

  return (
    <DialogBody
      className="flex min-h-0 items-center justify-center overflow-auto p-4 sm:p-8"
      data-diagram-preview=""
      data-testid="diagram-preview"
      ref={previewRef}
      spacing="none"
    />
  );
}

function DiagramControl({
  isFullscreen,
  onToggle,
  portal,
}: DiagramControlProps) {
  const action = isFullscreen ? "Exit" : "View";
  const accessibleName = `${action} ${portal.label} full screen`;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    await onToggle(portal, event.currentTarget);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={accessibleName}
          className="bg-background/90 shadow-sm backdrop-blur"
          onClick={handleClick}
          size="icon-sm"
          title={isFullscreen ? "Exit full screen" : "View diagram full screen"}
          type="button"
          variant="outline"
        >
          {isFullscreen ? (
            <Minimize2 aria-hidden="true" />
          ) : (
            <Maximize2 aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent container={portal.host} side="left">
        {isFullscreen ? "Exit full screen" : "View diagram full screen"}
      </TooltipContent>
    </Tooltip>
  );
}

export function DiagramMaximizer() {
  const [portals, setPortals] = React.useState<DiagramPortal[]>([]);
  const [activeDiagram, setActiveDiagram] =
    React.useState<ActiveDiagram | null>(null);
  const [fullscreenTarget, setFullscreenTarget] =
    React.useState<Element | null>(null);

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
        const host = existingHost?.isConnected
          ? existingHost
          : createControlHost(target);
        hosts.set(target, host);
        return {
          host,
          id: host.dataset.diagramControlsId ?? getDiagramLabel(target),
          label: getDiagramLabel(target),
          target,
        };
      });

      setPortals((current) =>
        samePortals(current, nextPortals) ? current : nextPortals
      );
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
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreenElement);
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

  async function toggleFullscreen(
    portal: DiagramPortal,
    trigger: HTMLButtonElement
  ) {
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
          <DiagramControl
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
            portal={portal}
          />,
          portal.host,
          portal.id
        );
      })}

      <Dialog
        onOpenChange={handleDialogOpenChange}
        open={activeDiagram !== null}
      >
        <DialogContent
          className="inset-0 h-[100dvh] max-h-none w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 sm:max-w-none"
          data-diagram-dialog=""
          size="full"
        >
          <DialogHeader className="border-border border-b pr-14">
            <DialogTitle>
              {activeDiagram?.label === "diagram"
                ? "Diagram"
                : (activeDiagram?.label ?? "Diagram")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full-screen diagram view. Press Escape or the close button to
              return to the page.
            </DialogDescription>
          </DialogHeader>
          {activeDiagram ? (
            <ExpandedDiagramPreview target={activeDiagram.target} />
          ) : null}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
