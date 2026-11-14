import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { stageChanges } from '@ui-sdk/react/history';
import { type ObservedChange, observe } from '@ui-sdk/react/observe';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rating, RatingStar } from '@/components/ui/rating';
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
    expect(snapshot.find((entry) => entry.label === 'Session rating')?.actions).toEqual(['setValue']);
    expect(JSON.stringify(snapshot)).not.toContain('private-note');
    expect(snapshot.find((entry) => entry.label === 'Hidden session note')).toBeUndefined();
    expect(snapshot.find((entry) => entry.label === 'Session secret')?.['value']).toBe('[redacted]');
    const change = () => session.agent.act({ steps: [{ ref: 'Session name', action: 'setValue', args: ['Atlas'] }] });
    expect((await change()).ok).toBe(false);
    permit = true;
    await act(async () => {
      expect((await change()).ok).toBe(true);
    });
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    await act(async () => {
      await session.agent.act({ steps: [{ ref: 'Session name', action: 'setValue', args: ['Blocked'] }] });
    });
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    const confirm = () => session.agent.act({ steps: [{ ref: 'Apply local record', action: 'press' }] });
    expect((await confirm()).ok).toBe(false);
    await expect.element(page.getByLabel('Local save count')).toHaveText('0');
    approve = true;
    expect((await confirm()).ok).toBe(true);
    await expect.element(page.getByLabel('Local save count')).toHaveText('1');
    await act(async () => {
      await session.agent.act({ steps: [{ ref: 'Session secret', action: 'setValue', args: ['replacement-secret'] }] });
    });
    expect(JSON.stringify(observed)).not.toContain('replacement-secret');
    expect(JSON.stringify(session.history.entries())).not.toContain('replacement-secret');
    expect(observed.some((changeEvent) => changeEvent.source === 'agent')).toBe(true);
    const count = observed.length;
    session.dispose();
    expect((await change()).ok).toBe(false);
    await page.getByRole('textbox', { name: 'Session name' }).fill('Human after disposal');
    expect(observed).toHaveLength(count);
  } finally {
    session.dispose();
  }
});

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
    expect(await session.history.seek(0)).toEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Apollo');
    expect(await session.history.seek(session.history.entries().length)).toEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    const staged = await stageChanges(session.agent, [{ ref: 'Session name', value: 'Preview' }]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Preview');
    expect(await staged.revert()).toEqual([]);
    await expect.element(page.getByRole('textbox', { name: 'Session name' })).toHaveValue('Atlas');
    await page.getByRole('textbox', { name: 'Session name' }).fill('Human choice');
    expect(await session.history.undoSource('agent')).toEqual([]);
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
    expect((await pending).ok).toBe(false);
    expect(confirmations).toBe(0);
    expect(session.signal.aborted).toBe(true);
    await expect.element(page.getByLabel('Local save count')).toHaveText('0');
  } finally {
    granted.resolve(false);
    session.dispose();
  }
});
