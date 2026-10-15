import { resolve } from 'node:path';
import { afterEach, expect, rs } from '@rstest/core';

import { rsdoctorConfig } from './rsdoctor-config';

afterEach(() => {
  rs.unstubAllEnvs();
});

test('leaves normal test builds unchanged', async () => {
  rs.stubEnv('PROTOFORM_RSDOCTOR', undefined);
  expect(await rsdoctorConfig('unit')({})).toEqual({});
});

test('preserves server-disabled report settings inside Rstest', async () => {
  rs.stubEnv('PROTOFORM_RSDOCTOR', 'true');
  rs.stubEnv('RSTEST', 'true');

  expect(await rsdoctorConfig('integration')({})).toMatchObject({
    performance: { buildCache: false },
    tools: {
      rspack: {
        plugins: [
          {
            isRsdoctorPlugin: true,
            options: {
              disableClientServer: true,
              output: {
                mode: 'brief',
                options: { type: ['html', 'json'] },
                reportDir: resolve('artifacts/rsdoctor/integration'),
              },
            },
          },
        ],
      },
    },
  });
});
