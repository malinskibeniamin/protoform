import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, rs, test } from '@rstest/core';
import { createLocalStorage, createPreference } from '@ui-sdk/core';
import { field } from '@ui-sdk/core/field';
import { useFieldControl } from '@ui-sdk/react/field';
import { createParts } from '@ui-sdk/react/primitive';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { AsyncOptionCombobox, type AsyncOptionComboboxProps } from '@/components/ui/async-option-combobox';
import { Button } from '@/components/ui/button';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PreferenceSelect } from '@/components/ui/preferences';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { withOptionSchema } from './adapters/primitive-schema';
import { createAgentSession } from './session';

const rawField = createParts(withOptionSchema(field), { root: 'div' });
function FieldConnection() {
  const context = useFieldControl();
  return <output>{context === null ? 'No field connection' : 'Field connected'}</output>;
}
test('beta.2 public Field root cannot supply the renderer context required by useFieldControl', async () => {
  await render(
    <rawField.Root>
      <FieldConnection />
    </rawField.Root>
  );
  await expect.element(page.getByText('No field connection', { exact: true })).toBeVisible();
});
function FieldExample() {
  const [invalid, setInvalid] = useState(true);
  return (
    <form>
      <Field invalid={invalid} name="title" validation="native">
        <FieldLabel>Title</FieldLabel>
        <FieldDescription>Public description</FieldDescription>
        <Input data-agent-secret defaultValue="Atlas" />
        <FieldError>{invalid === true ? 'Needs a longer title' : null}</FieldError>
        <FieldConnection />
      </Field>
      <Field disabled name="notes" validation="native">
        <FieldLabel>Notes</FieldLabel>
        <Textarea />
      </Field>
      <Button onClick={() => setInvalid(false)} type="button">
        Clear error
      </Button>
    </form>
  );
}
test('field joins owned inputs with labels, descriptions, errors, names and disabled state', async () => {
  expect(renderToString(<FieldExample />)).toContain('name="title"');
  await act(async () => {
    await render(<FieldExample />);
  });
  const input = page.getByRole('textbox', { name: 'Title', exact: true });
  await expect.element(input).toHaveValue('Atlas');
  await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  await expect.element(page.getByRole('textbox', { name: 'Notes', exact: true })).toBeDisabled();
  await expect.element(page.getByText('Field connected', { exact: true })).toBeVisible();
  const node = document.querySelector('input');
  const ids = node?.getAttribute('aria-describedby')?.split(/\s+/u) ?? [];
  expect(ids.map((id) => document.querySelector(`[id="${CSS.escape(id)}"]`)?.textContent).join(' ')).toContain(
    'Public description'
  );
  expect(ids.map((id) => document.querySelector(`[id="${CSS.escape(id)}"]`)?.textContent).join(' ')).toContain(
    'Needs a longer title'
  );
  expect(node?.dataset['agentSecret']).toBeDefined();
  const form = document.querySelector('form');
  if (form === null) {
    throw new Error('Missing form');
  }
  expect(new FormData(form).get('title')).toBe('Atlas');
  expect(new FormData(form).has('notes')).toBe(false);
  await act(async () => {
    await input.fill('Edited Atlas');
    await page.getByRole('button', { name: 'Clear error' }).click();
  });
  await expect.element(page.getByText('Needs a longer title')).not.toBeVisible();
  await expect.element(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect.element(input).toHaveValue('Edited Atlas');
});
function SidebarState() {
  const sidebar = useSidebar();
  return <output aria-label="Sidebar state">{sidebar.open === true ? 'open' : 'closed'}</output>;
}
function ShortcutExample() {
  return (
    <SidebarProvider>
      <SidebarTrigger />
      <SidebarState />
      <Input aria-label="Editor" />
      <Dialog>
        <DialogTrigger>Open modal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal editor</DialogTitle>
          <Input aria-label="Modal input" />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
test('sidebar shortcuts use SDK hints, update the current state and pause behind a modal', async () => {
  await render(<ShortcutExample />);
  const trigger = page.getByRole('button', { name: 'Toggle Sidebar' });
  await expect.element(trigger).toHaveAttribute('aria-keyshortcuts');
  await trigger.press('ControlOrMeta+b');
  await expect.element(page.getByLabel('Sidebar state')).toHaveText('closed');
  await trigger.press('ControlOrMeta+b');
  await expect.element(page.getByLabel('Sidebar state')).toHaveText('open');
  await page.getByRole('button', { name: 'Open modal' }).click();
  const editor = page.getByRole('textbox', { name: 'Modal input' });
  await editor.press('ControlOrMeta+b');
  await editor.press('Escape');
  await expect.element(page.getByLabel('Sidebar state')).toHaveText('open');
});
function AsyncExample({ load }: { load: AsyncOptionComboboxProps['load'] }) {
  const [value, setValue] = useState('');
  return <AsyncOptionCombobox aria-label="Remote project" debounce={0} load={load} onChange={setValue} value={value} />;
}
test('async options cancel stale loads, recover from errors and keep real selection usable', async () => {
  const stale = Promise.withResolvers<ComboboxOption[]>();
  const latest = Promise.withResolvers<ComboboxOption[]>();
  const signals: AbortSignal[] = [];
  const load = rs.fn((query: string, context: { signal: AbortSignal; page: number }) => {
    signals.push(context.signal);
    return query === 'old' ? stale.promise : latest.promise;
  });
  await render(<AsyncExample load={load} />);
  const input = page.getByRole('combobox', { name: 'Remote project' });
  await input.fill('old');
  await expect.poll(() => load.mock.calls.length).toBe(1);
  await input.fill('new');
  await expect.poll(() => load.mock.calls.length).toBe(2);
  expect(signals[0]?.aborted).toBe(true);
  await act(async () => {
    latest.resolve([{ value: 'new', label: 'New project' }]);
    await latest.promise;
  });
  await expect.element(page.getByRole('option', { name: 'New project' })).toBeVisible();
  await act(async () => {
    stale.resolve([{ value: 'old', label: 'Old project' }]);
    await stale.promise;
  });
  await expect.element(page.getByRole('option', { name: 'Old project' })).not.toBeVisible();
  await page.getByRole('option', { name: 'New project' }).click();
  await expect.element(input).toHaveValue('New project');
});
test('async options expose a real failed-load retry', async () => {
  const load = rs
    .fn<() => Promise<ComboboxOption[]>>()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue([{ value: 'ok', label: 'Recovered project' }]);
  await render(<AsyncExample load={load} />);
  await page.getByRole('combobox', { name: 'Remote project' }).fill('recovery');
  await expect.element(page.getByRole('alert')).toHaveText('Could not load options.');
  await page.getByRole('button', { name: 'Retry options' }).click();
  await expect.poll(() => load.mock.calls.length).toBe(2);
  await page.getByRole('combobox', { name: 'Remote project' }).press('ArrowDown');
  await expect.element(page.getByRole('option', { name: 'Recovered project' })).toBeVisible();
  expect(load.mock.calls).toHaveLength(2);
});
test('preference selection restores only explicitly supplied storage and honors cancellation', async () => {
  const key = 'protoform-hooks-test';
  localStorage.setItem(key, 'compact');
  const allow = rs.fn<() => boolean>().mockReturnValue(false);
  const preference = createPreference({
    values: ['comfortable', 'compact'],
    defaultValue: 'comfortable',
    attribute: 'data-density',
    storage: createLocalStorage(key),
    onValueChange: (_value, details) => {
      if (details.reason !== 'restore' && !allow()) {
        details.cancel();
      }
    },
  });
  try {
    await render(<PreferenceSelect label="Density" preference={preference} />);
    const trigger = page.getByRole('combobox', { name: 'Density' });
    await expect.element(trigger).toHaveText('compact');
    await trigger.click();
    await page.getByRole('option', { name: 'comfortable', exact: true }).click();
    expect(preference.get().value).toBe('compact');
    expect(localStorage.getItem(key)).toBe('compact');
    allow.mockReturnValue(true);
    await trigger.click();
    await page.getByRole('option', { name: 'comfortable', exact: true }).click();
    await expect.element(trigger).toHaveText('comfortable');
    expect(localStorage.getItem(key)).toBe('comfortable');
  } finally {
    localStorage.removeItem(key);
  }
});

test('async option pagination appends results and unmount aborts an active load', async () => {
  const pending = Promise.withResolvers<ComboboxOption[]>();
  const signals: AbortSignal[] = [];
  const load = rs.fn((query: string, context: { signal: AbortSignal; page: number }) => {
    signals.push(context.signal);
    return query === 'pending'
      ? pending.promise
      : Promise.resolve({
          items: [{ value: String(context.page), label: `Project ${context.page}` }],
          hasMore: context.page === 0,
        });
  });
  const view = await render(<AsyncExample load={load} />);
  const input = page.getByRole('combobox', { name: 'Remote project' });
  await input.fill('pages');
  await expect.element(page.getByRole('option', { name: 'Project 0' })).toBeVisible();
  await input.press('ArrowDown');
  await expect.poll(() => load.mock.calls.length).toBe(2);
  await input.press('ArrowDown');
  await expect.element(page.getByRole('option', { name: 'Project 0' })).toBeVisible();
  await expect.element(page.getByRole('option', { name: 'Project 1' })).toBeVisible();
  await input.fill('pending');
  await expect.poll(() => load.mock.calls.length).toBe(3);
  await act(async () => {
    await view.unmount();
  });
  expect(signals[2]?.aborted).toBe(true);
  pending.resolve([]);
});

test('preferences preserve agent source, confirmation, cancellation, read-back, history and disposal', async () => {
  const allowed = rs.fn<() => boolean>().mockReturnValue(false);
  const confirmed = rs.fn<() => boolean>().mockReturnValue(false);
  const sources: string[] = [];
  const preference = createPreference({
    values: ['comfortable', 'compact'],
    defaultValue: 'comfortable',
    attribute: 'data-test-density',
    onValueChange: (_value, details) => {
      sources.push(details.source);
      if (!allowed()) {
        details.cancel();
      }
    },
  });
  const session = createAgentSession({ allow: () => true, confirm: () => confirmed() });
  try {
    await render(
      <>
        <PreferenceSelect data-agent-confirm="Confirm density" label="Agent density" preference={preference} />
        <Input aria-label="Private value" data-agent-secret defaultValue="not-for-agent" />
        <Input aria-label="Hidden field" data-agent-hidden defaultValue="invisible-value" />
      </>
    );
    const change = { steps: [{ ref: 'Agent density', action: 'setValue', args: ['compact'] }] };
    expect((await session.agent.act(change)).ok).toBe(false);
    expect(preference.get().value).toBe('comfortable');
    confirmed.mockReturnValue(true);
    await session.agent.act(change);
    expect(preference.get().value).toBe('comfortable');
    expect(sources).toContain('agent');
    allowed.mockReturnValue(true);
    await session.agent.act(change);
    await expect.element(page.getByRole('combobox', { name: 'Agent density' })).toHaveText('compact');
    const snapshot = JSON.stringify(session.agent.snapshot());
    expect(snapshot).toContain('compact');
    expect(snapshot).not.toContain('not-for-agent');
    expect(snapshot).not.toContain('invisible-value');
    await act(async () => {
      await session.history.undoSource('agent');
    });
    await expect.element(page.getByRole('combobox', { name: 'Agent density' })).toHaveText('comfortable');
  } finally {
    session.dispose();
  }
  expect(
    (await session.agent.act({ steps: [{ ref: 'Agent density', action: 'setValue', args: ['compact'] }] })).ok
  ).toBe(false);
});

test('explicit label targets preserve caller accessible names instead of replacing them', async () => {
  await act(async () => {
    await render(
      <Field>
        <FieldLabel htmlFor="explicit-name" required>
          Visible title
        </FieldLabel>
        <Input aria-label="Caller name" id="explicit-name" />
      </Field>
    );
  });
  await expect.element(page.getByRole('textbox', { name: 'Caller name', exact: true })).toBeVisible();
  await page.getByText('Visible title', { exact: false }).click();
  await expect.element(page.getByRole('textbox', { name: 'Caller name', exact: true })).toBeFocused();
});
