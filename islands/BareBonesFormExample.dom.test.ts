import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import BareBonesFormExample from './BareBonesFormExample';

test('announces the loading lesson before showing the real form', async () => {
  render(createElement(BareBonesFormExample));

  expect(screen.getByRole('status', { name: 'Loading bare-bones example' })).toBeVisible();
  expect(await screen.findByRole('textbox', { name: 'Name' })).toBeVisible();
  expect(screen.queryByRole('status', { name: 'Loading bare-bones example' })).not.toBeInTheDocument();
});
