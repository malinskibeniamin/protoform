import { devices } from 'playwright';

export const hostBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_HOST_PORT'] ?? '55117'}`;
export const reliabilityBaseURL = `http://127.0.0.1:${process.env['PROTOFORM_RELIABILITY_PORT'] ?? '55120'}`;

const desktop = devices['Desktop Chrome'];
if (desktop === undefined) {
  throw new Error('Playwright Desktop Chrome device descriptor is unavailable');
}
export const docsContextOptions = {
  baseURL: 'http://127.0.0.1:55013',
  viewport: desktop.viewport,
  userAgent: desktop.userAgent,
  deviceScaleFactor: desktop.deviceScaleFactor,
  hasTouch: desktop.hasTouch,
  isMobile: desktop.isMobile,
};
