import { configureReactScan } from './react-scan';

declare const { describe, expect, jest, test }: typeof import('bun:test');

describe('React Scan instrumentation', () => {
  test('loads the installed profiler before React hydration only when opted in', () => {
    const injectScript = jest.fn();
    configureReactScan('dev', true, injectScript);
    expect(injectScript).toHaveBeenCalledTimes(1);
    expect(injectScript).toHaveBeenCalledWith(
      'before-hydration',
      'import { scan } from "react-scan"; scan({ enabled: true });'
    );
  });

  test.each(['build', 'preview', 'sync'] as const)('never profiles %s output', (command) => {
    const injectScript = jest.fn();
    configureReactScan(command, true, injectScript);
    expect(injectScript).not.toHaveBeenCalled();
  });

  test('keeps the normal development server uninstrumented', () => {
    const injectScript = jest.fn();
    configureReactScan('dev', false, injectScript);
    expect(injectScript).not.toHaveBeenCalled();
  });
});
