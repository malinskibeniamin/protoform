import { expect, test } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';

import { KeyValueField } from './index';

test('names and describes each key-value collection', () => {
  render(
    <>
      <KeyValueField
        description="Request metadata"
        keyFieldProps={{ 'aria-label': 'Key' }}
        label={<strong>Headers</strong>}
        value={[{ key: 'Accept', value: 'application/json' }]}
        valueFieldProps={{ 'aria-label': 'Value' }}
      />
      <KeyValueField
        description="Routing metadata"
        keyFieldProps={{ 'aria-label': 'Key' }}
        label="Parameters"
        value={[{ key: 'page', value: '1' }]}
        valueFieldProps={{ 'aria-label': 'Value' }}
      />
    </>
  );

  const headers = screen.getByRole('group', { name: 'Headers' });
  expect(headers).toHaveAccessibleDescription('Request metadata');
  expect(within(headers).getByRole('textbox', { name: 'Key' })).toHaveValue('Accept');
  expect(within(headers).getByRole('textbox', { name: 'Value' })).toHaveValue('application/json');

  const parameters = screen.getByRole('group', { name: 'Parameters' });
  expect(parameters).toHaveAccessibleDescription('Routing metadata');
  expect(within(parameters).getByRole('textbox', { name: 'Key' })).toHaveValue('page');
});
