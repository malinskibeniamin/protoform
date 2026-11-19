import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import ReadinessDashboard from './ReadinessDashboard';

test('announces the pending dashboard before showing the readiness ledger', async () => {
  render(createElement(ReadinessDashboard));

  expect(screen.getByRole('status', { name: 'Loading readiness dashboard' })).toBeVisible();
  expect(await screen.findByRole('region', { name: 'Capability ledger' })).toBeVisible();
  expect(screen.queryByRole('status', { name: 'Loading readiness dashboard' })).not.toBeInTheDocument();
});
