import { readFileSync } from 'node:fs';
import { describe, expect } from '@rstest/core';

import e2eConfig from '../rstest.e2e.config';

const browserInstall = /playwright install chromium/u;

describe('browser production matrix', () => {
  test('runs the end-to-end form suite in Chromium through Rstest', () => {
    expect(e2eConfig.name).toBe('chromium');
    expect(e2eConfig.pool).toEqual({ maxWorkers: 4 });
    expect(readFileSync('.github/workflows/quality.yml', 'utf8')).toMatch(browserInstall);
    expect(readFileSync('scripts/run-tests.ts', 'utf8')).toContain('http://127.0.0.1:55012/health');
  });
});
