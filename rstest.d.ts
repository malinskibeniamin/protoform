import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Locator, Page } from 'playwright';

type MatcherResult<T> = ReturnType<T extends Locator | Page ? () => Promise<void> : () => void>;

declare module '@rstest/core' {
  interface Assertion<T> extends TestingLibraryMatchers<unknown, MatcherResult<T>> {
    toHaveScreenshot: (name: string) => Promise<void>;
  }
}

declare global {
  interface Window {
    __protoformAccessibleDescription?: (element: Element) => string;
  }
}
