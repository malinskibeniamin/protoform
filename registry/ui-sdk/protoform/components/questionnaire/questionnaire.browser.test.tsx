import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, rs, test } from '@rstest/core';
import { Questionnaire } from '.';

test('retains the answer and failed-save message through native form reset until retry succeeds', async () => {
  const save = rs
    .fn<(values: Record<string, string>) => Promise<void>>()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue(undefined);
  await render(
    <Questionnaire
      items={[{ name: 'format', prompt: 'Sample format', required: true, choices: [{ value: 'json', label: 'JSON' }] }]}
      onSubmit={save}
      submitLabel="Save answers"
    />
  );
  await page.getByRole('radio', { name: 'JSON' }).click();
  await page.getByRole('button', { name: 'Save answers' }).click();
  await expect.element(page.getByRole('alert')).toHaveText('Could not save answers. Try again.');
  const form = document.querySelector('form');
  if (form === null) {
    throw new Error('Questionnaire form was not mounted');
  }
  await act(() => form.reset());
  await expect.element(page.getByRole('alert')).toHaveText('Could not save answers. Try again.');
  await expect.element(page.getByRole('radio', { name: 'JSON' })).toHaveAttribute('aria-checked', 'true');
  expect(save).toHaveBeenCalledTimes(1);
  await page.getByRole('button', { name: 'Save answers' }).click();
  await expect.element(page.getByRole('alert')).toHaveCount(0);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save).toHaveBeenLastCalledWith({ format: 'json' });
});
