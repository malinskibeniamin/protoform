import { readFile } from 'node:fs/promises';
import { release } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { rstest } from '@rstest/core';
import { test as base, expect } from '@rstest/playwright';
import type { Locator, Page } from 'playwright';
import { docsBaseURL, docsContextOptions } from './e2e-context';
import { matchScreenshot, screenshotPlatform } from './e2e-screenshots';

export const test = base.extend({ browserName: 'chromium' });

export function withLocale(locale: string) {
  return test.extend({
    playwright: {
      contextOptions: { ...docsContextOptions, locale },
      requestOptions: { baseURL: docsBaseURL },
      trace: 'retain-on-failure',
    },
  });
}

expect.extend({
  async toHaveScreenshot(this: { isNot: boolean }, target: Page | Locator, name: string) {
    if (this.isNot) {
      throw new Error('Negated screenshot comparisons are not supported');
    }
    if (basename(name) !== name || !name.endsWith('.png')) {
      throw new Error('Screenshot name must be a PNG filename');
    }
    const { testPath } = expect.getState();
    if (testPath === undefined) {
      throw new Error('Screenshot assertion requires an active Rstest test');
    }
    const project = process.env['PROTOFORM_SCREENSHOT_PROJECT'] ?? 'chromium';
    const platform = screenshotPlatform(
      { platform: process.platform, release: release(), architecture: process.arch },
      process.env['PROTOFORM_SCREENSHOT_PLATFORM']
    );
    const reference =
      process.env['PROTOFORM_SCREENSHOT_STYLE'] === 'consumer'
        ? join(dirname(testPath), '__screenshots__', basename(testPath), project, platform, name)
        : join(`${testPath}-snapshots`, `${name.slice(0, -4)}-${project}-${platform}.png`);
    await matchScreenshot(target, reference, {
      update: process.env['PROTOFORM_UPDATE_SCREENSHOTS'] === 'true',
      timeout: rstest.getConfig().expect.poll.timeout,
    });
    return { pass: true, message: () => `Screenshot matches ${reference}` };
  },
  async toHaveAccessibleDescription(this: { isNot: boolean }, target: Locator, expected: string | RegExp) {
    const bundle = await readFile('.tmp/e2e/accessibility.js', 'utf8');
    await target.page().addScriptTag({ content: bundle });
    const description = () =>
      target.evaluate((element) => {
        const compute = window.__protoformAccessibleDescription;
        if (typeof compute !== 'function') {
          throw new TypeError('Accessible description helper was not loaded');
        }
        const value: unknown = compute(element);
        return String(value);
      });
    const assertion = expect.poll(description, { timeout: rstest.getConfig().expect.poll.timeout });
    const selected = this.isNot ? assertion.not : assertion;
    await (typeof expected === 'string' ? selected.toBe(expected) : selected.toMatch(expected));
    return { pass: !this.isNot, message: () => `Accessible description does not match ${String(expected)}` };
  },
});
