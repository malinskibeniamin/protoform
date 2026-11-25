import { expect } from '@rstest/core';

const { default: defaultMatchers, ...namedMatchers } = await import('@testing-library/jest-dom/matchers');
expect.extend(defaultMatchers ?? namedMatchers);
