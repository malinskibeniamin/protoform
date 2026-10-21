import { expect, test } from '@rstest/core';

test('keeps native media queries and scrolling in the real browser', async () => {
  expect(window.matchMedia('(min-width: 1px)').matches).toBe(true);
  const spacer = document.createElement('div');
  spacer.style.height = '3000px';
  document.body.append(spacer);
  try {
    window.scrollTo(0, 200);
    await expect.poll(() => window.scrollY).toBe(200);
  } finally {
    spacer.remove();
    window.scrollTo(0, 0);
  }
});
