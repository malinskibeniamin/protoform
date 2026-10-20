import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module '@rstest/core' {
  interface Assertion<T> extends TestingLibraryMatchers<unknown, T> {
    toHaveScreenshot: (name: string) => Promise<void>;
  }
}

declare global {
  interface Window {
    __protoformAccessibleDescription?: (element: Element) => string;
  }
}
