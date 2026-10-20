import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SubmitEvent } from 'react';

import { AttachmentAction } from '.';

test('does not submit the surrounding form when an attachment action runs', async () => {
  const user = userEvent.setup();
  const onAction = rs.fn();
  const onSubmit = rs.fn((event: SubmitEvent<HTMLFormElement>) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <AttachmentAction onClick={onAction}>Retry upload</AttachmentAction>
    </form>
  );
  await user.click(screen.getByRole('button', { name: 'Retry upload' }));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});
