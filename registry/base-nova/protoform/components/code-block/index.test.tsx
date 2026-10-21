import { afterEach, expect, rs, test } from '@rstest/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockLine } from '.';

afterEach(() => {
  cleanup();
  rs.restoreAllMocks();
});

test('renders code as text, preserving blank lines and never executing HTML', async () => {
  const code = '<script>alert("no")</script>\n\nconst count = 1;';
  const { container } = render(
    <CodeBlock>
      <CodeBlockContent aria-label="Source">{code}</CodeBlockContent>
    </CodeBlock>
  );
  await Promise.resolve(
    act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    })
  );
  expect(screen.getByLabelText('Source')).toHaveTextContent('<script>alert("no")</script>');
  expect(screen.getByLabelText('Source').textContent).toBe(code);
  expect(container.querySelector('script')).toBeNull();
});

test('retains blank numbered lines and exposes line variants without changing the code', async () => {
  const { container } = render(
    <CodeBlock>
      <CodeBlockContent aria-label="Diff" lineNumbers startLine={12}>
        <CodeBlockLine variant="removed">old()</CodeBlockLine>
        <CodeBlockLine variant="added">new()</CodeBlockLine>
        <CodeBlockLine />
      </CodeBlockContent>
    </CodeBlock>
  );
  await Promise.resolve(
    act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    })
  );
  expect(container.querySelector('[data-variant="removed"]')).toHaveTextContent('old()');
  expect(container.querySelector('[data-variant="added"]')).toHaveTextContent('new()');
  expect(container.querySelectorAll('[data-slot="code-block-line"]')[2]?.textContent).toBe('\n');
  expect(screen.getByLabelText('Diff')).toHaveStyle({ '--code-line-start': '11' });
});

test('numbers string lines without losing a blank line', async () => {
  const code = 'one\n\nthree\n';
  const { container } = render(
    <CodeBlock>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  );
  await Promise.resolve(
    act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    })
  );
  const lines = container.querySelectorAll('[data-slot="code-block-line-content"]');
  expect(Array.from(lines, (line) => line.textContent)).toEqual(['one', '\n', 'three']);
});

test('copies the original source without line-number or diff decoration', async () => {
  const user = userEvent.setup();
  const copy = rs.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  const value = 'one\n\nthree\n';
  render(
    <CodeBlock>
      <CodeBlockCopyButton value={value} />
      <CodeBlockContent lineNumbers>{value}</CodeBlockContent>
    </CodeBlock>
  );
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  await waitFor(() => expect(copy).toHaveBeenCalledWith(value));
  expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
});

test('shows clipboard failure and allows retry rather than reporting false success', async () => {
  const user = userEvent.setup();
  const copy = rs
    .spyOn(navigator.clipboard, 'writeText')
    .mockRejectedValueOnce(new Error('Clipboard denied'))
    .mockResolvedValueOnce(undefined);
  render(<CodeBlockCopyButton value="code" />);
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not copy code. Try again.');
  expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  await waitFor(() => expect(copy).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('copying inside a form does not submit the form', async () => {
  const user = userEvent.setup();
  const submit = rs.fn((event: React.SubmitEvent<HTMLFormElement>) => event.preventDefault());
  rs.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  render(
    <form onSubmit={submit}>
      <CodeBlockCopyButton value="code" />
    </form>
  );
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  expect(submit).not.toHaveBeenCalled();
});

test('respects a caller-cancelled copy action', async () => {
  const user = userEvent.setup();
  const copy = rs.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  render(<CodeBlockCopyButton onClick={(event) => event.preventDefault()} value="code" />);
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  expect(copy).not.toHaveBeenCalled();
});

test('does not show copied feedback for a different value', async () => {
  const user = userEvent.setup();
  rs.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  const { rerender } = render(<CodeBlockCopyButton value="first" />);
  await user.click(screen.getByRole('button', { name: 'Copy' }));
  expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
  rerender(<CodeBlockCopyButton value="second" />);
  expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
});
