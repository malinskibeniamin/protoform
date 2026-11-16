import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '.';

test('keeps the primitive and animated content closed when an open change is cancelled', async () => {
  const user = userEvent.setup();
  const onOpenChange = rs.fn((open: boolean, details: { cancel: () => void; reason: string }) => {
    expect(open).toBe(true);
    expect(details.reason).toBe('trigger-press');
    details.cancel();
  });
  render(
    <Collapsible onOpenChange={onOpenChange}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent>Private output</CollapsibleContent>
    </Collapsible>
  );
  await user.click(screen.getByRole('button', { name: 'Details' }));
  expect(onOpenChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Private output')).not.toBeInTheDocument();
});

test('forwards native animation events rather than Motion animation definitions', () => {
  const events: string[] = [];
  render(
    <Collapsible defaultOpen>
      <CollapsibleContent
        onAnimationStart={(event) => {
          events.push(event.type);
        }}
      >
        Animated output
      </CollapsibleContent>
    </Collapsible>
  );
  fireEvent.animationStart(screen.getByText('Animated output'));
  expect(events.at(-1)).toBe('animationstart');
});
