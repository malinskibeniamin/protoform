import { PNG } from 'pngjs';
import { compareScreenshotBuffers, screenshotPlatform } from './e2e-screenshots';

declare const { expect, test }: typeof import('bun:test');

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

test('selects only the explicitly requested native OS and architecture reference', () => {
  const host = { platform: 'darwin', release: '25.6.0', architecture: 'arm64' } as const;
  expect(screenshotPlatform(host)).toBe('darwin');
  expect(screenshotPlatform(host, 'darwin-25-arm64')).toBe('darwin-25-arm64');
});

test('rejects references from another host or arbitrary paths instead of silently falling back', () => {
  const host = { platform: 'linux', release: '6.14.0-1017-azure', architecture: 'x64' } as const;
  expect(screenshotPlatform(host)).toBe('linux');
  expect(screenshotPlatform(host, 'linux-6-x64')).toBe('linux-6-x64');
  for (const key of ['darwin-25-arm64', 'linux-5-x64', 'linux-6-arm64', '../linux', '', 'linux']) {
    expect(() => screenshotPlatform(host, key)).toThrow('Screenshot platform must match host linux-6-x64');
  }
});
