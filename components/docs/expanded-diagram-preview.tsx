import React from "react";
import { DialogBody } from "@/registry/base-nova/protoform/components/dialog";

export function ExpandedDiagramPreview({ target }: { target: HTMLElement }) {
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(
    function renderPreview() {
      const preview: HTMLDivElement | null = previewRef.current;
      if (!preview) {
        return;
      }

      const clone = target.cloneNode(true) as HTMLElement;
      clone.removeAttribute("data-diagram-enhanced");
      for (const controls of clone.querySelectorAll("[data-diagram-controls]")) {
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
