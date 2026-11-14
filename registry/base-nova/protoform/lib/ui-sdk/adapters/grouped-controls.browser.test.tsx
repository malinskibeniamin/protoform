import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { createDrawerController } from '@ui-sdk/core/drawer';
import { createElement, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '@/components/ui/button';
import { Checkbox, CheckboxGroup } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
  CommandPage,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerOutlet,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { OTPInput, OTPInputGroup, OTPInputSlot } from '@/components/ui/input-otp';
import { Radio, RadioGroup } from '@/components/ui/radio-group';
import { Toggle, ToggleGroup } from '@/components/ui/toggle';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';

function nativeForm(label: string) {
  const form = document.querySelector<HTMLFormElement>(`form[aria-label="${label}"]`);
  if (form === null) {
    throw new Error('Missing native form');
  }
  return form;
}

test('owned radios preserve selection, disabled skipping, sibling inputs and native reset', async () => {
  await render(
    <form aria-label="Owned radio form">
      <RadioGroup aria-label="Delivery speed" defaultValue="standard" name="speed">
        <Radio aria-label="Standard delivery" value="standard" />
        <Radio aria-label="Unavailable delivery" disabled value="unavailable" />
        <Radio aria-label="Express delivery" value="express" />
      </RadioGroup>
      <Button type="reset">Reset delivery</Button>
    </form>
  );
  const form = nativeForm('Owned radio form');
  expect(form.querySelector('button input')).toBeNull();
  expect(new FormData(form).get('speed')).toBe('standard');
  await page.getByRole('radio', { name: 'Standard delivery' }).press('ArrowRight');
  await expect.element(page.getByRole('radio', { name: 'Express delivery' })).toBeFocused();
  await expect.element(page.getByRole('radio', { name: 'Express delivery' })).toHaveAttribute('aria-checked', 'true');
  expect(new FormData(form).get('speed')).toBe('express');
  await page.getByRole('button', { name: 'Reset delivery' }).click();
  await expect.element(page.getByRole('radio', { name: 'Standard delivery' })).toHaveAttribute('aria-checked', 'true');
  expect(new FormData(form).get('speed')).toBe('standard');
});

test('owned radio cancellation and fieldset disabling remain core-owned', async () => {
  const sources: string[] = [];
  await render(
    <form aria-label="Restricted radios">
      <RadioGroup
        aria-label="Approved speed"
        defaultValue="standard"
        name="speed"
        onValueChange={(_value, details) => {
          sources.push(details.source);
          details.cancel();
        }}
      >
        <Radio aria-label="Approved standard" value="standard" />
        <Radio aria-label="Refused express" value="express" />
      </RadioGroup>
      <fieldset disabled>
        <RadioGroup aria-label="Locked speed" defaultValue="locked" name="locked">
          <Radio aria-label="Locked delivery" value="locked" />
        </RadioGroup>
      </fieldset>
    </form>
  );
  await page.getByRole('radio', { name: 'Refused express' }).click();
  await expect.element(page.getByRole('radio', { name: 'Approved standard' })).toHaveAttribute('aria-checked', 'true');
  expect(sources).toEqual(['mouse']);
  expect(new FormData(nativeForm('Restricted radios')).has('locked')).toBe(false);
});

test('owned OTP keeps native naming, server values, validated editing, slot text and reset', async () => {
  const html = renderToString(
    <OTPInput aria-label="Server code" defaultValue="123456" name="code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
      </OTPInputGroup>
    </OTPInput>
  );
  expect(html).toContain('value="123456"');
  expect(html).toContain('aria-label="Server code"');
  const commits: string[] = [];
  await render(
    <form aria-label="Owned OTP form">
      <OTPInput
        aria-label="Verification code"
        defaultValue="12"
        maxLength={6}
        name="code"
        onValueCommit={(value) => {
          commits.push(value);
        }}
        required
      >
        <OTPInputGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <OTPInputSlot data-testid={`code-slot-${index}`} index={index} key={index} />
          ))}
        </OTPInputGroup>
      </OTPInput>
      <Button type="reset">Reset code</Button>
    </form>
  );
  const form = nativeForm('Owned OTP form');
  expect(form.checkValidity()).toBe(false);
  const input = page.getByRole('textbox', { name: 'Verification code' });
  await input.fill('123456');
  await expect.element(input).toHaveValue('123456');
  await expect.element(page.getByTestId('code-slot-5')).toHaveText('6');
  expect(new FormData(form).get('code')).toBe('123456');
  expect(form.checkValidity()).toBe(true);
  expect(commits).toEqual(['123456']);
  await input.fill('abcdef');
  await expect.element(input).toHaveValue('123456');
  await act(() => {
    form.reset();
  });
  await expect.element(input).toHaveValue('12');
  expect(new FormData(form).get('code')).toBe('12');
});

test('owned standalone checkbox keeps native form state, mixed state and cancellation', async () => {
  await render(
    <form aria-label="Owned checkbox form">
      <Checkbox aria-label="Weekly checkbox" defaultChecked name="weekly" value="yes" />
      <Checkbox aria-label="Mixed checkbox" defaultChecked="indeterminate" name="mixed" />
      <Checkbox aria-label="Refused checkbox" onCheckedChange={(_value, details) => details.cancel()} />
      <Button type="reset">Reset checks</Button>
    </form>
  );
  const form = nativeForm('Owned checkbox form');
  expect(form.querySelector('button input')).toBeNull();
  expect(new FormData(form).get('weekly')).toBe('yes');
  expect(new FormData(form).has('mixed')).toBe(false);
  await expect.element(page.getByRole('checkbox', { name: 'Mixed checkbox' })).toHaveAttribute('aria-checked', 'mixed');
  await page.getByRole('checkbox', { name: 'Mixed checkbox' }).click();
  await expect.element(page.getByRole('checkbox', { name: 'Mixed checkbox' })).toHaveAttribute('aria-checked', 'true');
  expect(new FormData(form).get('mixed')).toBe('on');
  await page.getByRole('checkbox', { name: 'Refused checkbox' }).click();
  await expect
    .element(page.getByRole('checkbox', { name: 'Refused checkbox' }))
    .toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Reset checks' }).click();
  await expect.element(page.getByRole('checkbox', { name: 'Mixed checkbox' })).toHaveAttribute('aria-checked', 'mixed');
});

test('retained checkbox group coordination preserves parent selection, form values and cancellation', async () => {
  await render(
    <form aria-label="Grouped checks">
      <CheckboxGroup
        allValues={['a', 'b']}
        aria-label="Notifications"
        defaultValue={['a']}
        name="notice"
        onValueChange={(value, details) => {
          if (value.length === 0) {
            details.cancel();
          }
        }}
      >
        <Checkbox aria-label="All notifications" parent />
        <Checkbox aria-label="Notice A" value="a" />
        <Checkbox aria-label="Notice B" value="b" />
      </CheckboxGroup>
    </form>
  );
  await expect
    .element(page.getByRole('checkbox', { name: 'All notifications' }))
    .toHaveAttribute('aria-checked', 'mixed');
  await page.getByRole('checkbox', { name: 'All notifications' }).click();
  await expect.element(page.getByRole('checkbox', { name: 'Notice B' })).toHaveAttribute('aria-checked', 'true');
  expect(new FormData(nativeForm('Grouped checks')).getAll('notice')).toEqual(['a', 'b']);
  await page.getByRole('checkbox', { name: 'All notifications' }).click();
  await expect
    .element(page.getByRole('checkbox', { name: 'All notifications' }))
    .toHaveAttribute('aria-checked', 'true');
});

test('owned standalone toggles and retained group coordination preserve pressed values and roving focus', async () => {
  await render(
    <>
      <Toggle aria-label="Standalone bold" defaultPressed />
      <Toggle aria-label="Refused italic" onPressedChange={(_value, details) => details.cancel()} />
      <ToggleGroup aria-label="View mode" defaultValue={['grid']} deselectable={false}>
        <Toggle value="grid">Grid view</Toggle>
        <Toggle value="list">List view</Toggle>
      </ToggleGroup>
    </>
  );
  await page.getByRole('button', { name: 'Standalone bold' }).press('Space');
  await expect.element(page.getByRole('button', { name: 'Standalone bold' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Refused italic' }).click();
  await expect.element(page.getByRole('button', { name: 'Refused italic' })).toHaveAttribute('aria-pressed', 'false');
  await expect.element(page.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Grid view' }).press('ArrowRight');
  await expect.element(page.getByRole('button', { name: 'List view' })).toBeFocused();
  await page.getByRole('button', { name: 'List view' }).press('Space');
  await expect.element(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');
  await expect.element(page.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'List view' }).click();
  await expect.element(page.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');
});

test('owned command data renders ranked labels and navigates nested pages', async () => {
  const actions: string[] = [];
  await render(
    <Command
      items={[
        {
          type: 'group',
          label: 'Workspace',
          items: [
            { value: 'settings', label: 'Settings', items: [{ value: 'account', label: 'Account settings' }] },
            { value: 'status', label: 'Service status' },
          ],
        },
      ]}
      onAction={(value) => {
        actions.push(value);
      }}
    >
      <CommandInput aria-label="Data commands" />
      <CommandList />
    </Command>
  );
  const input = page.getByRole('combobox', { name: 'Data commands' });
  await expect.element(page.getByRole('option', { name: 'Settings', exact: true })).toBeVisible();
  await input.fill('Service');
  await expect.element(page.getByRole('option', { name: 'Service status' })).toBeVisible();
  await input.press('Enter');
  expect(actions).toEqual(['status']);
  await input.fill('');
  await page.getByRole('option', { name: 'Settings', exact: true }).click();
  await expect.element(page.getByRole('option', { name: 'Account settings' })).toBeVisible();
  await input.press('Backspace');
  await expect.element(page.getByRole('option', { name: 'Settings', exact: true })).toBeVisible();
});

test('owned command page scopes and marked text preserve cancellation and pending actions', async () => {
  const pending = Promise.withResolvers<boolean>();
  let actions = 0;
  await render(
    <Command
      onAction={() => {
        actions += 1;
      }}
    >
      <CommandInput aria-label="Composed commands" />
      <CommandList>
        <CommandPage>
          <CommandItem page="settings" value="settings">
            <CommandItemText>Settings</CommandItemText>
          </CommandItem>
          <CommandItem onSelect={(event) => event.preventDefault()} value="cancel">
            Cancel command
          </CommandItem>
        </CommandPage>
        <CommandPage value="settings">
          <CommandItem onSelect={() => pending.promise} value="save">
            Save settings
          </CommandItem>
        </CommandPage>
      </CommandList>
    </Command>
  );
  await page.getByRole('option', { name: 'Cancel command' }).click();
  expect(actions).toBe(0);
  const input = page.getByRole('combobox', { name: 'Composed commands' });
  await input.fill('Set');
  expect(document.querySelector('[data-slot="command-item-text"] mark')?.textContent).toBe('Set');
  await input.press('Enter');
  const save = page.getByRole('option', { name: 'Save settings' });
  await expect.element(save).toBeVisible();
  await save.click();
  await expect.element(save).toHaveAttribute('data-pending', '');
  await act(async () => {
    pending.resolve(true);
    await pending.promise;
  });
  await expect.element(save).not.toHaveAttribute('data-pending');
  expect(actions).toBe(1);
});

test('owned drawer viewport and handle preserve snap keys, dismissal and focus', async () => {
  const snaps: unknown[] = [];
  await render(
    <Drawer
      driver="pointer"
      onSnapPointChange={(value) => {
        snaps.push(value);
      }}
      snapPoints={[0.25, 0.5, 1]}
    >
      <DrawerTrigger>Open owned drawer</DrawerTrigger>
      <DrawerContent className="h-96" render={<section data-owned-drawer="" />}>
        <DrawerTitle>Owned drawer</DrawerTitle>
        <DrawerHandle aria-label="Resize owned drawer" />
        <DrawerClose>Close owned drawer</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
  const trigger = page.getByRole('button', { name: 'Open owned drawer' });
  await trigger.click();
  await expect.element(page.getByRole('dialog', { name: 'Owned drawer' })).toBeVisible();
  expect(document.querySelector('[data-slot="drawer-viewport"] > section[data-owned-drawer]')).not.toBeNull();
  await page.getByLabel('Resize owned drawer').press('End');
  expect(snaps.at(-1)).toBe(1);
  await page.getByRole('button', { name: 'Close owned drawer' }).click();
  await expect.element(trigger).toBeFocused();
});

test('retained external drawer connections interoperate with owned content and restore focus', async () => {
  const controller = createDrawerController();
  await render(
    <>
      <DrawerOutlet controller={controller}>Outside owned drawer</DrawerOutlet>
      <DrawerTrigger controller={controller}>External owned drawer</DrawerTrigger>
      <Drawer controller={controller} driver="pointer">
        <DrawerContent>
          <DrawerTitle>Controlled owned drawer</DrawerTitle>
          <DrawerClose>Close external drawer</DrawerClose>
        </DrawerContent>
      </Drawer>
    </>
  );
  const trigger = page.getByRole('button', { name: 'External owned drawer' });
  await trigger.click();
  await expect.element(page.getByRole('dialog', { name: 'Controlled owned drawer' })).toBeVisible();
  expect(controller.isOpen()).toBe(true);
  await page.getByRole('button', { name: 'Close external drawer' }).click();
  await expect.element(trigger).toBeFocused();
  expect(controller.isOpen()).toBe(false);
});

test('owned controls preserve opt-in agent read-back, cancellation, confirmation and secret marks', async () => {
  let approved = false;
  const sources: string[] = [];
  const session = createAgentSession({ allow: () => true, confirm: () => approved });
  try {
    await render(
      <>
        <RadioGroup
          aria-label="Agent delivery"
          defaultValue="standard"
          onValueChange={(_value, details) => {
            sources.push(details.source);
            if (details.source === 'agent') {
              details.cancel();
            }
          }}
        >
          <Radio aria-label="Agent standard" value="standard" />
          <Radio aria-label="Agent express" value="express" />
        </RadioGroup>
        <Checkbox
          aria-label="Agent approval"
          data-agent-confirm="Changes the local approval"
          onCheckedChange={(_value, details) => {
            sources.push(details.source);
          }}
        />
        <Toggle aria-label="Agent bold" />
        <OTPInput aria-label="Agent code" data-agent-secret defaultValue="483920">
          <OTPInputGroup>
            <OTPInputSlot index={0} />
          </OTPInputGroup>
        </OTPInput>
        <Toggle aria-label="Private toggle" data-agent-hidden />
      </>
    );
    const snapshot = session.agent.snapshot();
    expect(snapshot.find((entry) => entry.label === 'Agent code')?.['value']).toBe('[redacted]');
    expect(snapshot.some((entry) => entry.label === 'Private toggle')).toBe(false);
    expect(JSON.stringify(snapshot)).not.toContain('483920');
    await act(async () => {
      expect(
        (await session.agent.act({ steps: [{ ref: 'Agent delivery', action: 'setValue', args: ['express'] }] })).ok
      ).toBe(true);
    });
    await expect.element(page.getByRole('radio', { name: 'Agent standard' })).toHaveAttribute('aria-checked', 'true');
    expect(
      (await session.agent.act({ steps: [{ ref: 'Agent approval', action: 'setChecked', args: [true] }] })).ok
    ).toBe(false);
    await expect
      .element(page.getByRole('checkbox', { name: 'Agent approval' }))
      .toHaveAttribute('aria-checked', 'false');
    approved = true;
    await act(async () => {
      expect(
        (
          await session.agent.act({
            steps: [
              { ref: 'Agent approval', action: 'setChecked', args: [true] },
              { ref: 'Agent bold', action: 'setPressed', args: [true] },
              { ref: 'Agent code', action: 'setValue', args: ['483921'] },
            ],
          })
        ).ok
      ).toBe(true);
    });
    await expect
      .element(page.getByRole('checkbox', { name: 'Agent approval' }))
      .toHaveAttribute('aria-checked', 'true');
    await expect.element(page.getByRole('button', { name: 'Agent bold' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('textbox', { name: 'Agent code' })).toHaveValue('483921');
    expect(sources).toEqual(['agent', 'agent']);
    expect(JSON.stringify(session.agent.snapshot())).not.toContain('483921');
    expect(JSON.stringify(session.history.entries())).not.toContain('483921');
    await session.history.undoSource('agent');
    await expect
      .element(page.getByRole('checkbox', { name: 'Agent approval' }))
      .toHaveAttribute('aria-checked', 'false');
    await expect.element(page.getByRole('button', { name: 'Agent bold' })).toHaveAttribute('aria-pressed', 'false');
    await expect.element(page.getByRole('textbox', { name: 'Agent code' })).toHaveValue('483921');
    session.dispose();
    expect((await session.agent.act({ steps: [{ ref: 'Agent bold', action: 'setPressed', args: [true] }] })).ok).toBe(
      false
    );
  } finally {
    session.dispose();
  }
});

test('owned command static empty content is absent while results exist and recovers after filtering', async () => {
  await render(
    <Command items={['Alpha', 'Beta']}>
      <CommandInput aria-label="Empty state search" />
      <CommandEmpty>No commands match</CommandEmpty>
      <CommandList />
    </Command>
  );
  await expect.element(page.getByText('No commands match', { exact: true })).not.toBeVisible();
  const input = page.getByRole('combobox', { name: 'Empty state search' });
  await input.fill('not-a-command');
  await expect.element(page.getByText('No commands match', { exact: true })).toBeVisible();
  await input.fill('Alpha');
  await expect.element(page.getByText('No commands match', { exact: true })).not.toBeVisible();
  await expect.element(page.getByRole('option', { name: 'Alpha' })).toBeVisible();
});

function ArrivingCommands() {
  const [items, setItems] = useState<string[]>();
  return (
    <>
      <Button onClick={() => setItems(['Alpha', 'Beta'])}>Load commands</Button>
      {createElement(
        Command,
        definedProps({ items }),
        <CommandInput aria-label="Arriving commands" />,
        <CommandList />
      )}
    </>
  );
}
test('command data arrival preserves the existing query instead of replacing its primitive', async () => {
  await render(<ArrivingCommands />);
  const input = page.getByRole('combobox', { name: 'Arriving commands' });
  await input.fill('Beta');
  await page.getByRole('button', { name: 'Load commands' }).click();
  await expect.element(input).toHaveValue('Beta');
  await expect.element(page.getByRole('option', { name: 'Beta' })).toBeVisible();
});

test('command default data placement renders one usable list', async () => {
  await render(
    <Command items={['Alpha', 'Beta']}>
      <CommandInput aria-label="Implicit data list" />
    </Command>
  );
  await expect.element(page.getByRole('option', { name: 'Alpha' })).toBeVisible();
  expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(1);
});

test('owned command empty render functions keep access to the full empty state', async () => {
  await render(
    <Command items={['Alpha']}>
      <CommandInput aria-label="Callback empty state" />
      <CommandEmpty>{(state) => (state.empty ? 'Callback no results' : 'Callback results available')}</CommandEmpty>
      <CommandList />
    </Command>
  );
  await expect.element(page.getByText('Callback results available', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Callback empty state' }).fill('missing');
  await expect.element(page.getByText('Callback no results', { exact: true })).toBeVisible();
});

test('owned command keeps distinct stable identities when item values are omitted', async () => {
  const actions: string[] = [];
  await render(
    <Command
      onAction={(value) => {
        actions.push(value);
      }}
    >
      <CommandInput aria-label="Generated command identities" />
      <CommandList>
        <CommandItem>Alpha command</CommandItem>
        <CommandItem>Beta command</CommandItem>
      </CommandList>
    </Command>
  );
  const alpha = page.getByRole('option', { name: 'Alpha command' });
  const beta = page.getByRole('option', { name: 'Beta command' });
  await expect.element(alpha).toBeVisible();
  await expect.element(beta).toBeVisible();
  const options = document.querySelectorAll<HTMLElement>('[data-slot="command-item"]');
  expect(options).toHaveLength(2);
  const firstId = options.item(0).id;
  const secondId = options.item(1).id;
  expect(firstId).not.toBe(secondId);
  expect(firstId).not.toContain('undefined');
  await alpha.click();
  await beta.click();
  expect(actions).toHaveLength(2);
  expect(actions[0]).not.toBe(actions[1]);
  const input = page.getByRole('combobox', { name: 'Generated command identities' });
  await input.fill('Alpha');
  await expect.element(alpha).toBeVisible();
  await expect.element(alpha).toHaveAttribute('id', firstId);
  await input.fill('');
  await expect.element(beta).toBeVisible();
  await expect.element(beta).toHaveAttribute('id', secondId);
});
