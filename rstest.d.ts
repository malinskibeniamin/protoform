import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Locator, Page } from 'playwright';

declare module '@rstest/core' {
  interface Assertion<T> extends TestingLibraryMatchers<unknown, T extends Locator | Page ? Promise<void> : void> {
    toHaveScreenshot: (name: string) => Promise<void>;
  }
}

declare global {
  interface Window {
    __protoformAccessibleDescription?: (element: Element) => string;
  }
}
