import { describe, expect } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AutoForm as TanStackAutoForm } from '../auto-form-tanstack';
import { type AutoFormSubmitContext, AutoForm as ReactHookAutoForm } from '.';
import { createMockProvider } from './index.test-utils';

const schema = createMockProvider([{ key: 'name', required: true, type: 'string' }], { name: '' });

const structuredSchema = createMockProvider(
  [
    {
      fieldConfig: { label: 'Profile' },
      key: 'profile',
      required: false,
      schema: [{ key: 'city', required: false, type: 'string' }],
      type: 'object',
    },
    {
      fieldConfig: { label: 'Tags' },
      key: 'tags',
      required: false,
      schema: [{ key: 'item', required: false, type: 'string' }],
      type: 'array',
    },
    {
      fieldConfig: { label: 'Labels' },
      key: 'labels',
      required: false,
      schema: [
        { key: 'key', required: false, type: 'string' },
        { key: 'value', required: false, type: 'string' },
      ],
      type: 'map',
    },
    {
      fieldConfig: { label: 'Contact' },
      key: 'contact',
      required: false,
      schema: [{ fieldConfig: { label: 'Email' }, key: 'email', required: false, type: 'string' }],
      type: 'oneof',
    },
  ],
  { contact: { case: undefined, value: undefined }, labels: [], profile: { city: '' }, tags: [] }
);

function observeDirtyChanges() {
  const values: boolean[] = [];
  const pending = new Map<number, PromiseWithResolvers<boolean>>();
  function handleDirtyChange(dirty: boolean) {
    values.push(dirty);
    pending.get(values.length)?.resolve(dirty);
    pending.delete(values.length);
  }
  function after(count: number) {
    const observed = values[count - 1];
    if (observed !== undefined) {
      return Promise.resolve(observed);
    }
    const reached = pending.get(count) ?? Promise.withResolvers<boolean>();
    pending.set(count, reached);
    return reached.promise;
  }
  return { after, handleDirtyChange, values };
}

describe.each([
  ['React Hook Form', ReactHookAutoForm],
  ['TanStack Form', TanStackAutoForm],
] as const)('%s dirty-state lifecycle', (_name, FormComponent) => {
  test('reports clean initially, emits distinct changes, marks saved values clean synchronously, and adopts reset values as the baseline', async () => {
    const user = userEvent.setup();
    const changes = observeDirtyChanges();
    const saved = Promise.withResolvers<boolean>();
    function handleSave(_values: unknown, _nativeForm: unknown, context: AutoFormSubmitContext) {
      context.form.markClean();
      saved.resolve(changes.values.at(-1) === false);
    }

    render(
      <FormComponent onDirtyChange={changes.handleDirtyChange} onSubmit={handleSave} schema={schema} withSubmit />
    );
    expect(await changes.after(1)).toBe(false);
    const name = screen.getByRole('textbox', { name: /name/iu });
    await user.type(name, 'Ada');
    expect(await changes.after(2)).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await saved.promise).toBe(true);
    expect(changes.values).toEqual([false, true, false]);

    await user.clear(name);
    expect(await changes.after(4)).toBe(true);
    await user.type(name, 'Ada');
    expect(await changes.after(5)).toBe(false);

    cleanup();
    const reset = observeDirtyChanges();
    function handleReset(_values: unknown, _nativeForm: unknown, context: AutoFormSubmitContext) {
      context.form.reset({ name: 'Saved on the server' });
    }

    render(<FormComponent onDirtyChange={reset.handleDirtyChange} onSubmit={handleReset} schema={schema} withSubmit />);

    const input = screen.getByRole('textbox', { name: /name/iu });
    await user.type(input, 'Draft');
    expect(await reset.after(2)).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await reset.after(3)).toBe(false);
    expect(input).toHaveValue('Saved on the server');

    await user.type(input, '!');
    expect(await reset.after(4)).toBe(true);
  });

  test('tracks nested, array, map, and oneof changes', async () => {
    const user = userEvent.setup();
    const changes = observeDirtyChanges();
    function handleSave(_values: unknown, _nativeForm: unknown, context: AutoFormSubmitContext) {
      context.form.markClean();
    }
    render(
      <FormComponent
        onDirtyChange={changes.handleDirtyChange}
        onSubmit={handleSave}
        schema={structuredSchema}
        withSubmit
      />
    );

    async function expectEditThenClean(label: string, edit: () => void | Promise<void>) {
      const previousCount = changes.values.length;
      await edit();
      expect(await changes.after(previousCount + 1), `${label} should become dirty`).toBe(true);
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(await changes.after(previousCount + 2)).toBe(false);
    }

    expect(await changes.after(1)).toBe(false);
    await expectEditThenClean('nested field', () => user.type(screen.getByRole('textbox', { name: 'City' }), 'Warsaw'));
    await expectEditThenClean('array field', () => user.click(screen.getByRole('button', { name: 'Add Tags' })));
    await expectEditThenClean('map field', () => user.click(screen.getByRole('button', { name: 'Add pair' })));
    await expectEditThenClean('oneof field', () => user.click(screen.getByRole('switch', { name: 'Contact' })));

    expect(changes.values).toEqual([false, true, false, true, false, true, false, true, false]);
  });
});
