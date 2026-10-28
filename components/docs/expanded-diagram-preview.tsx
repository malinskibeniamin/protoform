import React from 'react';
import { DialogBody } from '@/registry/base-nova/protoform/components/dialog';

export function ExpandedDiagramPreview({ target }: { target: HTMLElement }) {
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(
    function renderPreview() {
      const preview: HTMLDivElement | null = previewRef.current;
      if (!preview) {
        return;
      }

      const clone = target.cloneNode(true);
      if (!(clone instanceof HTMLElement)) {
        throw new TypeError('Expected an HTML diagram preview.');
      }
      Reflect.deleteProperty(clone.dataset, 'diagramEnhanced');
      for (const controls of clone.querySelectorAll('[data-diagram-controls]')) {
        controls.remove();
      }
      clone.dataset['diagramExpanded'] = '';
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
