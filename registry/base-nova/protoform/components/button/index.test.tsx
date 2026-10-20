import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Button } from '.';

test('supports the shadcn render API and state callbacks without submitting a form', async () => {
  const user = userEvent.setup();
  const onClick = rs.fn();
  const onSubmit = rs.fn((event: React.SubmitEvent<HTMLFormElement>) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      {React.createElement(
        Button,
        {
          className: (state) => (state.disabled ? 'disabled-button' : 'ready-button'),
          onClick,
          render: (props, state) =>
            React.createElement('button', { ...props, type: 'button', 'data-ready': !state.disabled }),
          size: 'default',
          style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
          variant: 'default',
        },
        'Run action'
      )}
    </form>
  );
  const button = screen.getByRole('button', { name: 'Run action' });
  expect(button).toHaveAttribute('data-ready', 'true');
  expect(button).toHaveClass('ready-button');
  expect(button).toHaveStyle({ opacity: '1' });
  await user.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});

test('keeps the Protoform loading, icon and asChild extensions', async () => {
  const onClick = rs.fn();
  const user = userEvent.setup();
  const { rerender } = render(
    <Button icon={<span>Icon</span>} isLoading onClick={onClick} size="md" variant="accent">
      Save
    </Button>
  );
  expect(screen.getByRole('button', { name: /save/iu })).toBeDisabled();
  expect(screen.getByRole('button', { name: /save/iu })).toHaveAttribute('aria-busy', 'true');
  rerender(
    <Button asChild onClick={onClick} variant="accent">
      {React.createElement('button', { type: 'button' }, 'Legacy action')}
    </Button>
  );
  expect(screen.getAllByRole('button')).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Legacy action' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('preserves caller data attributes for specialized buttons', () => {
  render(
    <Button data-slot="help-trigger" data-testid="caller-button" onClick={() => undefined}>
      Help
    </Button>
  );
  expect(screen.getByRole('button', { name: 'Help' })).toHaveAttribute('data-slot', 'help-trigger');
  expect(screen.getByTestId('caller-button')).toBeVisible();
});
