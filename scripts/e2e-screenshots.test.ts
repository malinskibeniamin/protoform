import { expect, test } from 'bun:test';
import { PNG } from 'pngjs';
import { compareScreenshotBuffers } from './e2e-screenshots';

function image(width: number, height: number, changedPixel = false): Buffer {
  const png = new PNG({ width, height });
  png.data.fill(255);
  if (changedPixel) {
    png.data.set([0, 0, 0, 255], 4 * (width + 1));
  }
  return PNG.sync.write(png);
}

test('requires identical screenshot dimensions and zero differing pixels at the existing color threshold', () => {
  expect(compareScreenshotBuffers(image(4, 4), image(4, 4)).differentPixels).toBe(0);
  expect(compareScreenshotBuffers(image(4, 4), image(4, 4, true)).differentPixels).toBe(1);
  expect(() => compareScreenshotBuffers(image(4, 4), image(5, 4))).toThrow('dimensions');
});
