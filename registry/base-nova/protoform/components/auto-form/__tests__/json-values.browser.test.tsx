import { afterEach, expect, rs, test } from '@rstest/core';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getDemoSchema } from '@/registry/base-nova/protoform/demo/runtime/demo-schemas';
import { AutoForm } from '..';

afterEach(cleanup);

test.each([
  { label: 'false', value: false, kind: { case: 'boolValue', value: false } },
  { label: 'zero', value: 0, kind: { case: 'numberValue', value: 0 } },
  { label: 'null', value: null, kind: { case: 'nullValue', value: 0 } },
])('preserves JSON $label in display, editing, and protobuf submission', async ({ value, kind }) => {
  const user = userEvent.setup();
  const onSubmit = rs.fn();
  const demo = getDemoSchema('dynamic-json');
  render(
    <AutoForm
      defaultValues={{ ...demo.defaultValues, scalarOrNestedValue: value }}
      onSubmit={onSubmit}
      schema={demo.schema}
      withSubmit
    />
  );
  const editor = await within(screen.getByTestId('autoform-field-scalar-or-nested-value-control')).findByRole(
    'textbox'
  );
  expect(editor).toHaveTextContent(JSON.stringify(value));
  await user.clear(editor);
  await user.paste('{"nested":false}');
  await user.clear(editor);
  await user.paste(JSON.stringify(value));
  expect(editor).toHaveTextContent(JSON.stringify(value));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ scalarOrNestedValue: { kind } });
});
