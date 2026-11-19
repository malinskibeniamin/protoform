import { afterEach, describe, expect } from '@rstest/core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FinalFormDemo } from './final-form.js';
import { FormikDemo } from './formik.js';
import { TanstackFormDemo } from './tanstack-form.js';

afterEach(cleanup);

describe.each([
  ['TanStack Form', TanstackFormDemo],
  ['Formik', FormikDemo],
  ['Final Form', FinalFormDemo],
] as const)('%s registry demo', (engine, Demo) => {
  test('routes labels, edits, and submission to the correct mounted instance', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Demo />
        <Demo />
      </>
    );
    const [first, second] = screen.getAllByRole('textbox', { name: 'Email' });
    const [, secondLabel] = screen.getAllByText('Email', { selector: 'label' });
    if (!(first && second && secondLabel)) {
      throw new Error('Expected two labeled email controls.');
    }
    expect(first.id).not.toBe(second.id);
    await user.click(secondLabel);
    expect(second).toHaveFocus();
    await user.type(second, 'second@example.com');
    expect(first).toHaveValue('');
    expect(second).toHaveValue('second@example.com');
    const buttons = screen.getAllByRole('button', { name: new RegExp(`Validate with ${engine}`, 'iu') });
    const [firstButton, secondButton] = buttons;
    const firstDemo = firstButton?.closest('form')?.parentElement;
    const secondDemo = secondButton?.closest('form')?.parentElement;
    if (!(firstDemo && secondDemo && secondButton)) {
      throw new Error('Expected a submit action for each mounted form.');
    }
    await user.click(secondButton);
    const output = await screen.findByRole('status');
    expect(output).toHaveTextContent('second@example.com');
    expect(within(firstDemo).queryByRole('status')).not.toBeInTheDocument();
  });
});
