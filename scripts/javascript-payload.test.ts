import { gzipSync } from 'node:zlib';
import { measureJavaScriptPayload } from './javascript-payload';

declare const { expect, test }: typeof import('bun:test');

test('budgets static, shared and deferred modules once across cycles', async () => {
  const sources = new Map([
    ['https://docs.test/entry.js', 'import "./shared.js"; import("./lazy.js");'],
    ['https://docs.test/shared.js', 'export { value } from "./entry.js";'],
    ['https://docs.test/lazy.js', 'import "./shared.js"; export const value = 1;'],
  ]);
  const reads: string[] = [];
  const result = await measureJavaScriptPayload(
    { deferred: ['https://docs.test/shared.js'], initial: ['https://docs.test/entry.js'] },
    (url) => {
      reads.push(url);
      const source = sources.get(url);
      if (source === undefined) {
        throw new Error(`Unexpected module ${url}`);
      }
      return source;
    }
  );
  expect(reads.toSorted((left, right) => left.localeCompare(right))).toEqual(
    [...sources.keys()].toSorted((left, right) => left.localeCompare(right))
  );
  expect(result.initialModules.toSorted((left, right) => left.localeCompare(right))).toEqual([
    'https://docs.test/entry.js',
    'https://docs.test/shared.js',
  ]);
  expect(result.deferredModules).toEqual(['https://docs.test/lazy.js']);
  expect(result.initialGzipBytes).toBe(
    gzipSync('import "./shared.js"; import("./lazy.js");').byteLength +
      gzipSync('export { value } from "./entry.js";').byteLength
  );
  expect(result.deferredGzipBytes).toBe(gzipSync('import "./shared.js"; export const value = 1;').byteLength);
});

test('does not silently exclude missing deferred modules from the budget', async () => {
  await Promise.resolve(
    expect(
      measureJavaScriptPayload({ deferred: [], initial: ['https://docs.test/entry.js'] }, (url) => {
        if (url.endsWith('/entry.js')) {
          return 'import("./missing.js")';
        }
        throw new Error(`Missing module ${url}`);
      })
    ).rejects.toThrow('Missing module https://docs.test/missing.js')
  );
});

test('bounds outstanding module reads for large route graphs', async () => {
  let outstanding = 0;
  let peak = 0;
  const initial = Array.from({ length: 24 }, (_, index) => `https://docs.test/${index}.js`);
  const result = await measureJavaScriptPayload(
    { deferred: [], initial },
    () =>
      new Promise<string>((resolve) => {
        outstanding += 1;
        peak = Math.max(peak, outstanding);
        queueMicrotask(() => {
          outstanding -= 1;
          resolve('export {};');
        });
      })
  );
  expect(result.initialModules).toHaveLength(24);
  expect(peak).toBeLessThanOrEqual(8);
  expect(outstanding).toBe(0);
});

test('includes inline modules and workers while reporting unresolved runtime references', async () => {
  const inline = { text: 'import "./shared.js"; import(runtimeUrl);', url: 'https://docs.test/index.html?inline=0' };
  const sources = new Map([
    ['https://docs.test/shared.js', 'new Worker(workerUrl);'],
    ['https://docs.test/runtime.js', 'new Worker("./worker.js");'],
    ['https://docs.test/worker.js', 'self.onmessage = () => {};'],
  ]);
  const result = await measureJavaScriptPayload(
    { deferred: ['https://docs.test/runtime.js'], initial: [], inline: [inline] },
    (url) => {
      const source = sources.get(url);
      if (source === undefined) {
        throw new Error(`Missing module ${url}`);
      }
      return source;
    }
  );
  expect(result.initialModules.toSorted((left, right) => left.localeCompare(right))).toEqual([
    inline.url,
    'https://docs.test/shared.js',
  ]);
  expect(result.deferredModules.toSorted((left, right) => left.localeCompare(right))).toEqual([
    'https://docs.test/runtime.js',
    'https://docs.test/worker.js',
  ]);
  expect(result.computedImports).toEqual([{ count: 1, module: inline.url }]);
  expect(result.computedWorkers).toEqual([{ count: 1, module: 'https://docs.test/shared.js' }]);
});
