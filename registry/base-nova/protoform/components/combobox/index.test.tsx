import { afterEach, expect, rstest, test } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '.';

afterEach(cleanup);

test('highlights and selects an option arriving after the search was typed', async () => {
  const user = userEvent.setup();
  const onChange = rstest.fn();
  const { rerender } = render(<Combobox aria-label="Country" loading onChange={onChange} options={[]} />);

  const input = screen.getByRole('combobox', { name: 'Country' });
  await user.click(input);
  await user.paste('pol');
  expect(await screen.findByText('Loading…')).toBeVisible();

  rerender(<Combobox aria-label="Country" onChange={onChange} options={[{ label: 'Poland', value: 'PL' }]} />);
  await screen.findByRole('option', { name: 'Poland' });
  await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', expect.any(String)));
  await user.keyboard('{Enter}');

  expect(onChange).toHaveBeenCalledWith('PL');
});

test('skips disabled matches and distinguishes options with the same label by value', async () => {
  const user = userEvent.setup();
  const onChange = rstest.fn();
  render(
    <Combobox
      aria-label="Region"
      onChange={onChange}
      options={[
        { disabled: true, label: 'Region', value: 'disabled' },
        { label: 'Region', value: 'east' },
        { label: 'Region', value: 'west' },
      ]}
    />
  );
  await user.click(screen.getByRole('combobox', { name: 'Region' }));
  await user.paste('region');
  const options = await screen.findAllByRole('option', { name: 'Region' });
  const [disabledOption] = options;
  if (!disabledOption) {
    throw new Error('Disabled option is missing');
  }
  await user.click(disabledOption);
  expect(onChange).not.toHaveBeenCalled();
  await user.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Region' })).toHaveAttribute('aria-activedescendant', options[1]?.id)
  );
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenCalledWith('west');
});

test('creates a typed option through the same keyboard selection contract', async () => {
  const user = userEvent.setup();
  const onChange = rstest.fn();
  const onCreateOption = rstest.fn();
  render(<Combobox aria-label="Tag" creatable onChange={onChange} onCreateOption={onCreateOption} options={[]} />);
  await user.click(screen.getByRole('combobox', { name: 'Tag' }));
  await user.paste('New tag');
  await screen.findByRole('option', { name: 'Create "New tag"' });
  await user.keyboard('{Enter}');
  expect(onChange).toHaveBeenCalledWith('New tag');
  expect(onCreateOption).toHaveBeenCalledWith('New tag');
});

test('accepts the shadcn compositional API with typed values and change details', async () => {
  const user = userEvent.setup();
  const onValueChange = rstest.fn();
  render(
    <Combobox items={['Apricot', 'Pear']} onValueChange={onValueChange}>
      <ComboboxInput aria-label="Fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found</ComboboxEmpty>
        <ComboboxList>
          {(fruit: string) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
  const input = screen.getByRole('combobox', { name: 'Fruit' });
  await user.type(input, 'Apr');
  await user.click(await screen.findByRole('option', { name: 'Apricot' }));
  expect(onValueChange).toHaveBeenCalledWith('Apricot', expect.objectContaining({ reason: 'item-press' }));
  expect(input).toHaveValue('Apricot');
});
