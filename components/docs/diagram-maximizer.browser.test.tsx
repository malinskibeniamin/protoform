import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { DiagramMaximizer } from './diagram-maximizer';

function observeFullscreenChange() {
  const change = Promise.withResolvers<Element | null>();
  document.addEventListener('fullscreenchange', () => change.resolve(document.fullscreenElement), { once: true });
  return change.promise;
}

test('enters and exits native fullscreen from the same diagram control', async () => {
  const view = await render(
    <>
      <figure aria-label="System flow" data-diagram="">
        <svg aria-label="Rendered architecture" />
      </figure>
      <DiagramMaximizer />
    </>
  );
  const entered = observeFullscreenChange();
  await act(async () => {
    await page.getByRole('button', { name: 'View System flow full screen' }).click();
    await entered;
  });

  expect(await entered).toBe(view.container.querySelector('figure'));
  expect(document.querySelector('[role="dialog"]')).toBeNull();

  const exited = observeFullscreenChange();
  await act(async () => {
    await page.getByRole('button', { name: 'Exit System flow full screen' }).click();
    await exited;
  });

  expect(await exited).toBeNull();
});
