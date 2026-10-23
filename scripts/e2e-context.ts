import { devices } from 'playwright';

export const docsBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_DOCS_PORT'] ?? '55013'}`;
export const hostBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_HOST_PORT'] ?? '55117'}`;
export const reliabilityBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_RELIABILITY_PORT'] ?? '55120'}`;
export const tanstackBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_CHARTS_PORT'] ?? '55121'}`;

const desktop = devices['Desktop Chrome'];
if (desktop === undefined) {
  throw new Error('Playwright Desktop Chrome device descriptor is unavailable');
}
export const docsContextOptions = {
  baseURL: docsBaseURL,
  viewport: desktop.viewport,
  userAgent: desktop.userAgent,
  deviceScaleFactor: desktop.deviceScaleFactor,
  hasTouch: desktop.hasTouch,
  isMobile: desktop.isMobile,
};
