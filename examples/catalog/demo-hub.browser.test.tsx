import { page } from '@rstest/browser';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';

import { DemoHub } from './demo-hub';

afterEach(cleanup);

describe('demoHub', () => {
  beforeEach(() => {
    globalThis.window.history.replaceState(null, '', '/docs/protobuf-examples');
  });

  test('opens a directly linked demo and keeps selection in the URL', async () => {
    globalThis.window.history.replaceState(null, '', '/docs/protobuf-examples#protobuf-oneof');

    render(<DemoHub category="protobuf" />);

    expect(screen.getByRole('heading', { name: 'Oneof branch selection' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading selected demo' })).toBeInTheDocument();

    await page.getByRole('combobox', { name: 'Choose a demo' }).click();
    await page.getByRole('option', { name: 'Protobuf maps' }).click();

    expect(globalThis.window.location.hash).toBe('#protobuf-maps');
    expect(screen.getByRole('heading', { name: 'Protobuf maps' })).toBeInTheDocument();
    await expect.element(page.getByRole('group', { name: 'Bool Keys' })).toBeVisible();
    expect(screen.queryByRole('status', { name: 'Loading selected demo' })).not.toBeInTheDocument();
  });
});
