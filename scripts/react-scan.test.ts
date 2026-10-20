import { describe, expect, rs } from '@rstest/core';
import { configureReactScan } from './react-scan';

describe('React Scan instrumentation', () => {
  test('loads the installed profiler before React hydration only when opted in', () => {
    const injectScript = rs.fn();
    configureReactScan('dev', true, injectScript);
    expect(injectScript).toHaveBeenCalledExactlyOnceWith(
      'before-hydration',
      'import { scan } from "react-scan"; scan({ enabled: true });'
    );
  });

  test.each(['build', 'preview', 'sync'] as const)('never profiles %s output', (command) => {
    const injectScript = rs.fn();
    configureReactScan(command, true, injectScript);
    expect(injectScript).not.toHaveBeenCalled();
  });

  test('keeps the normal development server uninstrumented', () => {
    const injectScript = rs.fn();
    configureReactScan('dev', false, injectScript);
    expect(injectScript).not.toHaveBeenCalled();
  });
});
