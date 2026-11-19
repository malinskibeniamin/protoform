import './scrollable-code-blocks.fixture.css';

import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { syncScrollableCodeBlocks } from './scrollable-code-blocks';

test('manages the tab stop only for code blocks that actually overflow', async () => {
  const { container } = await render(
    <div className="prose">
      <pre>
        <code data-code-width="narrow">This line is too wide for the first container.</code>
      </pre>
      <pre>
        <code data-code-width="wide">An author-defined tab stop</code>
      </pre>
    </div>
  );

  const [overflowing, authorDefined] = container.querySelectorAll<HTMLElement>('code');
  if (!(overflowing && authorDefined)) {
    throw new Error('Expected both code examples.');
  }
  authorDefined.tabIndex = 0;
  syncScrollableCodeBlocks(container);
  expect(overflowing).toHaveAttribute('tabindex', '0');
  expect(authorDefined).toHaveAttribute('tabindex', '0');

  const codeWidthKey = 'codeWidth';
  overflowing.dataset[codeWidthKey] = 'wide';

  syncScrollableCodeBlocks(container);
  expect(overflowing).not.toHaveAttribute('tabindex');
  expect(authorDefined).toHaveAttribute('tabindex', '0');
});
