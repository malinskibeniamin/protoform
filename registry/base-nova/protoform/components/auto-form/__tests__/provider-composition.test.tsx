import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { Input, ProtoformUIProvider } from '../ui-components';
import type { ProtoformUIProps } from '../ui-props';

function NativeInput({ onValueChange, onChange, ...props }: ProtoformUIProps['Input']) {
  return (
    <input
      {...props}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) {
          onValueChange?.(event.currentTarget.value);
        }
      }}
    />
  );
}
function Composition({ children }: React.PropsWithChildren) {
  return <section aria-label="Host composition">{children}</section>;
}
test('host-owned provider composition preserves input identity and edits when the map changes', async () => {
  const components = { Input: NativeInput, Provider: Composition };
  const view = render(
    <ProtoformUIProvider components={components}>
      <Input aria-label="Value" defaultValue="Initial" />
    </ProtoformUIProvider>
  );
  const input = screen.getByRole('textbox', { name: 'Value' });
  expect(screen.getByRole('region', { name: 'Host composition' })).toContainElement(input);
  await userEvent.setup().type(input, ' edited');
  view.rerender(
    <ProtoformUIProvider components={{ ...components }}>
      <Input aria-label="Value" defaultValue="Initial" />
    </ProtoformUIProvider>
  );
  expect(screen.getByRole('textbox', { name: 'Value' })).toBe(input);
  expect(input).toHaveValue('Initial edited');
});
