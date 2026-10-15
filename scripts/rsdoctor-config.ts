import { resolve } from 'node:path';
import type { ExtendConfigFn } from '@rstest/core';

export function rsdoctorConfig(suite: string): ExtendConfigFn {
  return async function configureRsdoctor() {
    if (process.env['PROTOFORM_RSDOCTOR'] !== 'true') {
      return {};
    }

    const { RsdoctorRspackPlugin } = await import('@rsdoctor/core');
    const plugin = new RsdoctorRspackPlugin({
      disableClientServer: true,
      features: { treeShaking: true },
      output: {
        mode: 'brief',
        options: { type: ['html', 'json'] },
        reportDir: resolve('artifacts/rsdoctor', suite),
      },
      supports: { brotli: true },
    });
    plugin.options.disableClientServer = true;

    return {
      performance: { buildCache: false },
      tools: { rspack: { plugins: [plugin] } },
    };
  };
}
