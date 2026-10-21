import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import pixelmatch from 'pixelmatch';
import type { Locator, Page } from 'playwright';
import { PNG } from 'pngjs';

type ScreenshotTarget = Locator | Page;

export function screenshotPlatform(
  host: { platform: NodeJS.Platform; release: string; architecture: string },
  requested?: string
) {
  if (requested === undefined) {
    return host.platform;
  }
  const native = `${host.platform}-${host.release.split('.')[0]}-${host.architecture}`;
  if (requested !== native) {
    throw new Error(`Screenshot platform must match host ${native}; received ${JSON.stringify(requested)}`);
  }
  return requested;
}

export function compareScreenshotBuffers(expectedBuffer: Buffer, actualBuffer: Buffer) {
  const expected = PNG.sync.read(expectedBuffer);
  const actual = PNG.sync.read(actualBuffer);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    throw new Error(
      `Screenshot dimensions differ: ${expected.width}x${expected.height} versus ${actual.width}x${actual.height}`
    );
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const differentPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0.2,
    includeAA: false,
  });
  return { differentPixels, diff: PNG.sync.write(diff) };
}

async function readReference(referencePath: string, update: boolean) {
  let reference: Buffer | undefined;
  try {
    reference = await readFile(referencePath);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error;
    }
    if (!update) {
      throw new Error(`Missing screenshot reference: ${referencePath}. Use the explicit screenshot update command.`, {
        cause: error,
      });
    }
  }
  return reference;
}

async function capture(target: ScreenshotTarget, deadline: number, hasPrevious: boolean) {
  try {
    return await target.screenshot({
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      timeout: Math.max(1, deadline - Date.now()),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError' && hasPrevious) {
      return;
    }
    throw error;
  }
}

function compare(expected: Buffer, actual: Buffer) {
  try {
    const { differentPixels, diff } = compareScreenshotBuffers(expected, actual);
    return { differentPixels, diff, failure: `${differentPixels} pixels differ (allowed: 0)` };
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return { differentPixels: 1, failure: error.message };
  }
}

async function reportMismatch(
  referencePath: string,
  actual: Buffer | undefined,
  diff: Buffer | undefined,
  failure: string
): Promise<never> {
  const key = createHash('sha256').update(referencePath).digest('hex').slice(0, 12);
  const artifact = join('.rstest', 'screenshots', key, basename(referencePath));
  await mkdir(dirname(artifact), { recursive: true });
  if (actual !== undefined) {
    await writeFile(`${artifact}-actual.png`, actual);
  }
  if (diff !== undefined) {
    await writeFile(`${artifact}-diff.png`, diff);
  }
  throw new Error(`${failure}. Reference: ${referencePath}. Actual: ${artifact}-actual.png`);
}

export async function matchScreenshot(
  target: ScreenshotTarget,
  referencePath: string,
  { update = false, timeout = 10_000 }: { update?: boolean; timeout?: number } = {}
): Promise<void> {
  const expected = await readReference(referencePath, update);
  const deadline = Date.now() + timeout;
  let previous: Buffer | undefined;
  let actual: Buffer | undefined;
  let failure = 'Screenshot did not become pixel-stable';
  let diff: Buffer | undefined;
  async function poll(): Promise<void> {
    if (Date.now() >= deadline) {
      return reportMismatch(referencePath, actual, diff, failure);
    }
    const next = await capture(target, deadline, actual !== undefined);
    if (next === undefined) {
      return reportMismatch(referencePath, actual, diff, failure);
    }
    actual = next;
    if (previous?.equals(actual)) {
      if (update === true) {
        await mkdir(dirname(referencePath), { recursive: true });
        await writeFile(referencePath, actual);
        return;
      }
      if (expected === undefined) {
        throw new Error(`Missing screenshot reference: ${referencePath}`);
      }
      const result = compare(expected, actual);
      if (result.differentPixels === 0) {
        return;
      }
      ({ failure, diff } = result);
    }
    previous = actual;
    await delay(50);
    return poll();
  }
  await poll();
}
