import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { Tooltip, TooltipContent, TooltipTrigger } from '.';

test('keeps text at full size and opacity inside the animated tooltip surface', async () => {
  await render(
    <Tooltip defaultOpen>
      <TooltipTrigger>Help</TooltipTrigger>
      <TooltipContent>
        <span data-testid="tooltip-copy">Helpful guidance</span>
      </TooltipContent>
    </Tooltip>
  );

  const copy = document.querySelector('[data-testid="tooltip-copy"]');
  expect(copy).toBeVisible();
  const surface = copy?.closest('[data-slot="tooltip-content"]');
  expect(surface).toBeVisible();

  let layer = copy;
  while (layer !== null && layer !== surface) {
    const style = getComputedStyle(layer);
    expect(style.transform).toBe('none');
    expect(style.scale).toBe('none');
    expect(style.translate).toBe('none');
    expect(style.opacity).toBe('1');
    layer = layer.parentElement;
  }
});
