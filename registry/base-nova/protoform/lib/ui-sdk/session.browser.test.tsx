import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { Button } from '@ui-sdk/react/button';
import { stageChanges } from '@ui-sdk/react/history';
import { Input } from '@ui-sdk/react/input';
import { type ObservedChange, observe } from '@ui-sdk/react/observe';
import { Textarea } from '@ui-sdk/react/textarea';
import { useState } from 'react';
import { Rating, RatingStar } from '@/components/ui/sdk/rating';
import { createAgentSession } from './session';

function Controls() {
  const [name, setName] = useState('Apollo');
  const [saves, setSaves] = useState(0);
  return (
    <>
      <Input
        aria-label="Session name"
        onValueChange={(value, details) => {
          if (details.source === 'agent' && value === 'Blocked') {
            details.cancel();
          } else {
            setName(value);
          }
        }}
        value={name}
      />
      <Rating aria-label="Session rating">
        <RatingStar value="1">One</RatingStar>
        <RatingStar value="2">Two</RatingStar>
      </Rating>
      <Input aria-label="Session secret" data-agent-secret defaultValue="initial-secret" />
      <section data-agent-hidden>
        <Input aria-label="Hidden session note" defaultValue="private-note" />
      </section>
      <Button data-agent-confirm="Applies the local record" onClick={() => setSaves((count) => count + 1)}>
        Apply local record
      </Button>
      <output aria-label="Local save count">{saves}</output>
    </>
  );
}

test('requires authorization and separate confirmation, exposes only declared actions and disposes safely', async () => {
  let permit = false;
  let approve = false;
  const observed: ObservedChange[] = [];
  const session = createAgentSession({
    allow: () => permit,
    confirm: () => approve,
    onChange: (change) => {
      observed.push(change);
    },
  });
  try {
    await render(<Controls />);
    const snapshot = session.agent.snapshot();
    expect(snapshot.find((entry) => entry.label === 'Session rating')?.actions).toStrictEqual(['setValue']);
    expect(JSON.stringify(snapshot)).not.toContain('private-note');
    expect(snapshot.find((entry) => entry.label === 'Hidden session note')).toBeUndefined();
    expect(snapshot.find((entry) => entry.label === 'Session secret')?.['value']).toBe('[redacted]');
    const change = () => session.agent.act({ steps: [{ ref: 'Session name', action: 'setValue', args: ['Atlas'] }] });
    const unauthorizedChange = await change();
    expect(unauthorizedChange.ok).toBe(false);
    permit = true;
    await act(async () => {
      const authorizedChange = await change();
      expect(authorizedChange.ok).toBe(true);
    });
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    await act(async () => {
      await session.agent.act({ steps: [{ ref: 'Session name', action: 'setValue', args: ['Blocked'] }] });
    });
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    const confirm = () => session.agent.act({ steps: [{ ref: 'Apply local record', action: 'press' }] });
    const unconfirmedSave = await confirm();
    expect(unconfirmedSave.ok).toBe(false);
    await expect.element(page.getByLabel('Local save count')).toHaveText('0');
    approve = true;
    const confirmedSave = await session.agent.act({
      steps: [{ ref: 'Apply local record', action: 'press', args: ['Apply local record'] }],
    });
    expect(confirmedSave.ok).toBe(true);
    await expect.element(page.getByLabel('Local save count')).toHaveText('1');
    await act(async () => {
      await session.agent.act({ steps: [{ ref: 'Session secret', action: 'setValue', args: ['replacement-secret'] }] });
    });
    expect(JSON.stringify(observed)).not.toContain('replacement-secret');
    expect(JSON.stringify(session.history.entries())).not.toContain('replacement-secret');
    expect(observed.some((changeEvent) => changeEvent.source === 'agent')).toBe(true);
    const count = observed.length;
    session.dispose();
    const disposedChange = await change();
    expect(disposedChange.ok).toBe(false);
    await page.getByRole('textbox', { name: 'Session name' }).fill('Human after disposal');
    expect(observed).toHaveLength(count);
  } finally {
    session.dispose();
  }
});

for (const { Control, label, value } of [
  { Control: Input, label: 'Read-only title', value: 'Apollo' },
  { Control: Textarea, label: 'Read-only notes', value: 'Local notes' },
]) {
  test(`${label} rejects agent writes and exposes required state without actions`, async () => {
    const session = createAgentSession({ allow: () => true });
    try {
      await render(<Control aria-label={label} defaultValue={value} readOnly required />);
      const readOnlyChange = await session.agent.act({
        steps: [{ ref: label, action: 'setValue', args: ['Agent edit'] }],
      });
      expect(readOnlyChange.ok).toBe(false);
      await expect.element(page.getByRole('textbox', { name: label })).toHaveValue(value);
      const entry = session.agent.snapshot().find((control) => control.label === label);
      expect(entry?.['disabled']).toBe(true);
      expect(entry?.actions).toStrictEqual([]);
      expect(entry?.['required']).toBe(true);
    } finally {
      session.dispose();
    }
  });
}

test('observe, seek, staging and source undo preserve later human edits', async () => {
  const session = createAgentSession({ allow: () => true });
  const observed: ObservedChange[] = [];
  const stop = observe((change) => {
    observed.push(change);
  });
  try {
    await render(<Controls />);
    await act(async () => {
      await session.agent.act({ steps: [{ ref: 'Session name', action: 'setValue', args: ['Atlas'] }] });
    });
    expect(await session.history.seek(0)).toStrictEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Apollo');
    expect(await session.history.seek(session.history.entries().length)).toStrictEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    const staged = await stageChanges(session.agent, [{ ref: 'Session name', value: 'Preview' }]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Preview');
    expect(await staged.revert()).toStrictEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    await page.getByRole('textbox', { name: 'Session name' }).fill('Human choice');
    expect(await session.history.undoSource('agent')).toStrictEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Human choice');
    expect(observed.some((change) => change.source === 'agent')).toBe(true);
    expect(
      observed.some(
        (change) => change.label === 'Session name' && change.value === 'Human choice' && change.source !== 'agent'
      )
    ).toBe(true);
  } finally {
    stop();
    session.dispose();
  }
});

test('disposal aborts pending permission without opening a later confirmation', async () => {
  const requested = Promise.withResolvers<boolean>();
  const granted = Promise.withResolvers<boolean>();
  let confirmations = 0;
  const session = createAgentSession({
    allow: () => {
      requested.resolve(true);
      return granted.promise;
    },
    confirm: () => {
      confirmations += 1;
      return true;
    },
  });
  try {
    await render(<Controls />);
    const pending = session.agent.act({ steps: [{ ref: 'Apply local record', action: 'press' }] });
    await requested.promise;
    session.dispose();
    granted.resolve(true);
    const pendingResult = await pending;
    expect(pendingResult.ok).toBe(false);
    expect(confirmations).toBe(0);
    expect(session.signal.aborted).toBe(true);
    await expect.element(page.getByLabel('Local save count')).toHaveText('0');
  } finally {
    granted.resolve(false);
    session.dispose();
  }
});
