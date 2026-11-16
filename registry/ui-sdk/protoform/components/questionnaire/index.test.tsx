import { expect, rs, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from '.';

const items = [
  {
    name: 'format',
    prompt: 'Sample format',
    required: true,
    choices: [
      { value: 'json', label: 'JSON' },
      { value: 'proto', label: 'Protobuf' },
    ],
  },
  { name: 'validation', prompt: 'Validation', choices: [{ value: 'yes', label: 'Include validation' }] },
];
test('requires an answer, preserves it across Back, and retries a failed save', async () => {
  const user = userEvent.setup();
  const onSubmit = rs
    .fn<(values: Record<string, string>) => Promise<void>>()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue(undefined);
  render(<Questionnaire items={items} onSubmit={onSubmit} submitLabel="Save answers" />);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Choose an option');
  await user.click(screen.getByRole('radio', { name: 'JSON' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(await screen.findByRole('button', { name: 'Previous' }));
  expect(await screen.findByRole('radio', { name: 'JSON' })).toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(await screen.findByRole('radio', { name: 'Include validation' }));
  await user.click(screen.getByRole('button', { name: 'Save answers' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not save answers'));
  await user.click(screen.getByRole('button', { name: 'Save answers' }));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  expect(onSubmit).toHaveBeenCalledTimes(2);
  expect(onSubmit).toHaveBeenLastCalledWith({ format: 'json', validation: 'yes' });
});
