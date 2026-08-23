import { Maximize2, Minimize2 } from "lucide-react";
import type React from "react";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base-nova/protoform/components/tooltip";
import type { DiagramPortal } from "./diagram-maximizer-types";

interface DiagramControlProps {
  isFullscreen: boolean;
  onToggle: (portal: DiagramPortal, trigger: HTMLButtonElement) => Promise<void>;
  portal: DiagramPortal;
}

export function DiagramControl({ isFullscreen, onToggle, portal }: DiagramControlProps) {
  const action = isFullscreen ? "Exit" : "View";
  const accessibleName = `${action} ${portal.label} full screen`;

  async function handleFullscreenToggle(event: React.MouseEvent<HTMLButtonElement>) {
    await onToggle(portal, event.currentTarget);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={accessibleName}
          className="bg-background/90 shadow-sm backdrop-blur"
          onClick={handleFullscreenToggle}
          size="icon-sm"
          title={isFullscreen ? "Exit full screen" : "View diagram full screen"}
          type="button"
          variant="outline"
        >
          {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent container={portal.host} side="left">
        {isFullscreen ? "Exit full screen" : "View diagram full screen"}
      </TooltipContent>
    </Tooltip>
  );
}
