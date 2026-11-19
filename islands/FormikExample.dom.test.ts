import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import FormikExample from './FormikExample';

test('announces the lazy example and renders the Formik submit action', async () => {
  render(createElement(FormikExample));

  expect(screen.getByRole('status', { name: 'Loading Formik example' })).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Create profile' })).toBeVisible();
  expect(screen.queryByRole('status', { name: 'Loading Formik example' })).not.toBeInTheDocument();
});
