import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';

import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockLine } from '.';

test('renders suspicious source as inert text and retains blank numbered lines', () => {
  const code = '<script>alert("no")</script>\n\nconst count = 1;';
  const { container } = render(
    <CodeBlock>
      <CodeBlockContent aria-label="Source" lineNumbers>
        {code}
      </CodeBlockContent>
    </CodeBlock>
  );
  expect(screen.getByLabelText('Source')).toHaveTextContent('<script>alert("no")</script>');
  expect(container.querySelector('script')).toBeNull();
  const lines = container.querySelectorAll('[data-slot="code-block-line-content"]');
  expect(Array.from(lines, (line) => line.textContent)).toEqual([
    '<script>alert("no")</script>',
    '\n',
    'const count = 1;',
  ]);
});

test('keeps line variants distinct without adding markers to the contents', () => {
  const { container } = render(
    <CodeBlock>
      <CodeBlockContent aria-label="Diff" lineNumbers startLine={12}>
        <CodeBlockLine variant="removed">old()</CodeBlockLine>
        <CodeBlockLine variant="added">new()</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  );
  expect(container.querySelector('[data-variant="removed"]')?.textContent).toBe('old()');
  expect(container.querySelector('[data-variant="added"]')?.textContent).toBe('new()');
  expect(screen.getByLabelText('Diff')).toHaveStyle({ '--code-line-start': '11' });
});

test('copies the original source without submitting the parent form and clears stale feedback', async () => {
  const value = 'one\n\nthree\n';
  const submissions: FormData[] = [];
  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submissions.push(new FormData(event.currentTarget));
  };
  const { rerender } = render(
    <form onSubmit={onSubmit}>
      <CodeBlock>
        <CodeBlockCopyButton value={value} />
        <CodeBlockContent lineNumbers>{value}</CodeBlockContent>
      </CodeBlock>
    </form>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

  expect(await screen.findByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await navigator.clipboard.readText()).toBe(value);
  expect(submissions).toHaveLength(0);

  rerender(
    <form onSubmit={onSubmit}>
      <CodeBlock>
        <CodeBlockCopyButton value="Updated source" />
        <CodeBlockContent lineNumbers>Updated source</CodeBlockContent>
      </CodeBlock>
    </form>
  );
  expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
});

test('leaves the clipboard intact when the caller cancels the copy action', async () => {
  await navigator.clipboard.writeText('Existing contents');
  render(<CodeBlockCopyButton onClick={(event) => event.preventDefault()} value="Rejected source" />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
  expect(await navigator.clipboard.readText()).toBe('Existing contents');
  expect(screen.getByRole('button', { name: 'Copy' })).toBeVisible();
});

test('shows a clipboard denial and allows retry once permission is granted', async () => {
  const queryPermission = navigator.permissions.query.bind(navigator.permissions);
  const permission: unknown = await Reflect.apply(queryPermission, undefined, [{ name: 'clipboard-write' }]);
  if (!(permission instanceof PermissionStatus)) {
    throw new TypeError('Expected a clipboard permission status.');
  }
  expect(Reflect.set(permission, 'state', 'denied')).toBe(true);
  try {
    render(<CodeBlockCopyButton value="const copied = true;" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not copy code. Try again.');
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();

    expect(Reflect.set(permission, 'state', 'granted')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  } finally {
    Reflect.set(permission, 'state', 'granted');
  }
});
