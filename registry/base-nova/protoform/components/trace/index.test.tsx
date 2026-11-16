import { afterEach, expect, rs, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { CodeBlock, CodeBlockContent } from '@/components/ui/code-block';
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceLine,
  TraceTitle,
} from '.';

afterEach(cleanup);

test('opens output by keyboard without making output a nested button', async () => {
  const user = userEvent.setup();
  render(
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Inspect request</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <CodeBlock size="sm">
            <CodeBlockContent>request validated</CodeBlockContent>
          </CodeBlock>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
  const trigger = screen.getByRole('button', { name: 'Inspect request' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('request validated')).not.toBeInTheDocument();
  trigger.focus();
  await user.keyboard('{Enter}');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(await screen.findByText('request validated')).toBeVisible();
  expect(screen.getAllByRole('button')).toHaveLength(1);
});

test('exposes readable pending, running, and failed steps with supplemental descriptions', () => {
  const { container } = render(
    <Trace>
      {(['pending', 'running', 'error'] as const).map((status) => (
        <TraceLine key={status} status={status}>
          <TraceTitle>{status}</TraceTitle>
          <TraceDescription>Details</TraceDescription>
        </TraceLine>
      ))}
    </Trace>
  );
  for (const status of ['pending', 'running', 'error']) {
    expect(screen.getByText(status)).toBeVisible();
    expect(container.querySelector(`[data-status="${status}"]`)).toHaveTextContent('Details');
  }
});

function ControlledTrace({ onChange }: { onChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Trace>
      <TraceCollapsible
        onOpenChange={(next) => {
          setOpen(next);
          onChange(next);
        }}
        open={open}
      >
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Inspect response</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>Response details</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

test('supports a controlled trace and forwards native trigger props', async () => {
  const user = userEvent.setup();
  const onChange = rs.fn();
  render(<ControlledTrace onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: 'Inspect response' }));
  expect(onChange).toHaveBeenLastCalledWith(true);
  expect(await screen.findByText('Response details')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Inspect response' }));
  expect(onChange).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('button', { name: 'Inspect response' })).toHaveAttribute('aria-expanded', 'false');
});
