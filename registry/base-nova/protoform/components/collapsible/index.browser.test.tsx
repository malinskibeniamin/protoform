import { afterEach, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '.';

afterEach(cleanup);

test('keeps the primitive and animated content closed when an open change is cancelled', async () => {
  const user = userEvent.setup();
  const changes: Array<{ open: boolean; reason: string }> = [];
  function onOpenChange(open: boolean, details: { cancel: () => void; reason: string }) {
    changes.push({ open, reason: details.reason });
    details.cancel();
  }
  render(
    <Collapsible onOpenChange={onOpenChange}>
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent>Private output</CollapsibleContent>
    </Collapsible>
  );
  await user.click(screen.getByRole('button', { name: 'Details' }));
  expect(changes).toEqual([{ open: true, reason: 'trigger-press' }]);
  expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Private output')).not.toBeInTheDocument();
});

test('forwards native animation events rather than Motion animation definitions', () => {
  const eventTypes: string[] = [];
  render(
    <Collapsible defaultOpen>
      <CollapsibleContent
        aria-label="Animated disclosure"
        onAnimationStart={(event) => {
          eventTypes.push(event.type);
        }}
        role="region"
      >
        Animated output
      </CollapsibleContent>
    </Collapsible>
  );

  const panel = screen.getByRole('region', { name: 'Animated disclosure' });
  fireEvent(panel, new AnimationEvent('animationstart', { animationName: 'disclosure-probe', bubbles: true }));
  expect(eventTypes).toEqual(['animationstart']);
});
