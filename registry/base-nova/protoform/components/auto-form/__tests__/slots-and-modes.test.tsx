import { afterEach, describe, expect, rs } from '@rstest/core';
import { cleanup, render, screen, within } from '@testing-library/react';
import { AutoForm, AutoFormSlot } from '..';
import { createMockProvider } from './test-utils';

const JSON_TAB = /json/iu;
const ADVANCED_TAB = /advanced/iu;

afterEach(() => {
  cleanup();
  rs.restoreAllMocks();
});

const schema = createMockProvider([
  { key: 'name', required: true, type: 'string' },
  { key: 'email', required: true, type: 'string' },
]);

describe('AutoForm slots', () => {
  test('places slot content around fields without empty rows or key warnings', () => {
    const consoleError = rs.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(
      <AutoForm schema={schema}>
        <AutoFormSlot>
          <p>Top slot</p>
        </AutoFormSlot>
        {false}
        <p>Plain child</p>
        <AutoFormSlot after="name">
          <p>After name</p>
        </AutoFormSlot>
        <AutoFormSlot before="email">
          <p>Before email</p>
        </AutoFormSlot>
      </AutoForm>
    );

    const fieldsRoot = container.querySelector('[data-slot="auto-form-fields"]');
    expect(fieldsRoot).not.toBeNull();
    const rows = Array.from(fieldsRoot?.children ?? []);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('Top slot');
    expect(rows[1]).toHaveTextContent('Plain child');
    expect(within(rows[2] as HTMLElement).getByText('After name')).toBeInTheDocument();
    expect(within(rows[3] as HTMLElement).getByText('Before email')).toBeInTheDocument();
    expect(rows[2]?.textContent?.indexOf('After name')).toBeGreaterThan(0);
    expect(rows[3]?.textContent?.indexOf('Before email')).toBe(0);
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('AutoForm modes', () => {
  test('follows a changed defaultMode and falls back when the current mode is removed', () => {
    const { rerender } = render(<AutoForm defaultMode="advanced" modes={['advanced', 'json']} schema={schema} />);
    expect(screen.getByRole('tab', { name: ADVANCED_TAB })).toHaveAttribute('aria-selected', 'true');

    rerender(<AutoForm defaultMode="json" modes={['advanced', 'json']} schema={schema} />);
    expect(screen.getByRole('tab', { name: JSON_TAB })).toHaveAttribute('aria-selected', 'true');

    rerender(<AutoForm defaultMode="json" modes={['simple', 'advanced']} schema={schema} />);
    expect(screen.getByRole('tab', { name: ADVANCED_TAB })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: JSON_TAB })).not.toBeInTheDocument();
  });
});
