import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, rs, test } from '@rstest/core';
import { createMenuController } from '@ui-sdk/core/menu';
import { createNavigationMenuController } from '@ui-sdk/core/navigation-menu';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemText,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxValue,
  OptionCombobox,
} from '@/components/ui/combobox';
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menubar } from '@/components/ui/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import {
  Select,
  SelectClear,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectList,
  SelectSelectAll,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createToaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
} from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';

function formData() {
  const form = document.querySelector('form');
  if (form === null) {
    throw new Error('Missing form');
  }
  return new FormData(form);
}

test('owned select parts retain composed server labels and native form selection/reset', async () => {
  const view = (
    <form>
      <Select
        defaultValue="a"
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Blocked', disabled: true },
          { value: 'c', label: 'Gamma' },
        ]}
        name="delivery"
      >
        <SelectLabel>Delivery</SelectLabel>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList />
        </SelectContent>
      </Select>
      <Button type="reset">Reset delivery</Button>
    </form>
  );
  expect(
    renderToString(
      <Select defaultValue="b" name="ssr">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            <SelectItem value="b">Rich Beta label</SelectItem>
          </SelectList>
        </SelectContent>
      </Select>
    )
  ).toContain('Rich Beta label');
  await render(view);
  expect(formData().get('delivery')).toBe('a');
  const trigger = page.getByRole('combobox', { name: 'Delivery' });
  await trigger.click();
  const alpha = page.getByRole('option', { name: 'Alpha', exact: true });
  const gamma = page.getByRole('option', { name: 'Gamma', exact: true });
  await expect.element(alpha).toBeFocused();
  await alpha.press('ArrowDown');
  await expect.element(gamma).toBeFocused();
  await gamma.press('Enter');
  await expect.element(trigger).toHaveText('Gamma');
  expect(formData().get('delivery')).toBe('c');
  await page.getByRole('button', { name: 'Reset delivery' }).click();
  await expect.element(trigger).toHaveText('Alpha');
  expect(formData().get('delivery')).toBe('a');
});

test('owned select value/empty/group parts preserve placeholders, filtering, select-all and clear', async () => {
  await render(
    <form>
      <Select multiple name="channels" placeholder="Pick channels">
        <SelectTrigger aria-label="Channels">
          <SelectValue />
        </SelectTrigger>
        <SelectClear aria-label="Clear channels" />
        <SelectContent>
          <SelectInput aria-label="Search channels" />
          <SelectEmpty>No channels match</SelectEmpty>
          <SelectList>
            <SelectGroup>
              <SelectGroupLabel>Communication</SelectGroupLabel>
              <SelectSelectAll>All channels</SelectSelectAll>
              <SelectItem value="email">
                <SelectItemText>Email</SelectItemText>
              </SelectItem>
              <SelectItem value="sms">
                <SelectItemText>SMS</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectList>
        </SelectContent>
      </Select>
    </form>
  );
  const trigger = page.getByRole('combobox', { name: 'Channels', exact: true });
  await expect.element(trigger).toHaveText('Pick channels');
  await trigger.click();
  await expect.element(page.getByText('No channels match', { exact: true })).not.toBeVisible();
  await page.getByRole('option', { name: 'All channels' }).click();
  expect(formData().getAll('channels')).toEqual(['email', 'sms']);
  await expect.element(trigger).toHaveText('Email, SMS');
  const input = page.getByRole('combobox', { name: 'Search channels' });
  await input.fill('not-a-channel');
  await expect.element(page.getByText('No channels match', { exact: true })).toBeVisible();
  await input.fill('');
  await expect.element(page.getByText('No channels match', { exact: true })).not.toBeVisible();
  await input.press('Escape');
  await expect.element(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Clear channels' }).click();
  expect(formData().getAll('channels')).toEqual([]);
  await expect.element(trigger).toHaveText('Pick channels');
});

test('owned combobox input/items preserve object values, initial text, keyboard selection, clearing and reset', async () => {
  const a = { id: 'a', name: 'Alpha' };
  const b = { id: 'b', name: 'Beta' };
  const view = (
    <form>
      <Combobox
        defaultValue={a}
        items={[
          { value: a, label: 'Alpha' },
          { value: b, label: 'Beta' },
        ]}
        itemToLabel={(item) => item.name}
        itemToValue={(item) => item.id}
        name="project"
      >
        <ComboboxInput aria-label="Project" />
        <ComboboxClear aria-label="Clear project" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem label="Alpha" value={a}>
              <ComboboxItemText>Alpha</ComboboxItemText>
            </ComboboxItem>
            <ComboboxItem label="Beta" value={b}>
              <ComboboxItemText>Beta</ComboboxItemText>
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Button type="reset">Reset project</Button>
    </form>
  );
  expect(renderToString(view)).toContain('value="Alpha"');
  await render(view);
  const input = page.getByRole('combobox', { name: 'Project' });
  await expect.element(input).toHaveValue('Alpha');
  await input.fill('Beta');
  await input.press('ArrowDown');
  await input.press('Enter');
  expect(formData().get('project')).toBe('b');
  await expect.element(input).toHaveValue('Beta');
  await page.getByRole('button', { name: 'Clear project' }).click();
  await expect.element(input).toHaveValue('');
  await expect.element(input).toBeFocused();
  await page.getByRole('button', { name: 'Reset project' }).click();
  await expect.element(input).toHaveValue('Alpha');
  expect(formData().get('project')).toBe('a');
});

test('owned combobox value projection interoperates with retained chips and select-all', async () => {
  await render(
    <form>
      <Combobox defaultValue={['Alpha']} items={['Alpha', 'Beta']} multiple name="teams">
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              state.labels.map((label) => (
                <ComboboxChip key={label} value={label}>
                  {label}
                  <ComboboxChipRemove aria-label={`Remove ${label}`} />
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput aria-label="Teams" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxSelectAll>Every team</ComboboxSelectAll>
            <ComboboxItem value="Alpha">Alpha</ComboboxItem>
            <ComboboxItem value="Beta">Beta</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </form>
  );
  const input = page.getByRole('combobox', { name: 'Teams' });
  await input.press('ArrowDown');
  await page.getByRole('option', { name: 'Every team' }).click();
  expect(formData().getAll('teams')).toEqual(['Alpha', 'Beta']);
  await page.getByRole('button', { name: 'Remove Alpha' }).click();
  expect(formData().getAll('teams')).toEqual(['Beta']);
  await input.press('Backspace');
  expect(formData().getAll('teams')).toEqual([]);
});

test('owned menu groups/items retain accessible labels and checkable/submenu coordination', async () => {
  const actions: string[] = [];
  await render(
    <Menu
      onAction={(value) => {
        actions.push(value);
      }}
    >
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Visibility</MenuGroupLabel>
          <MenuCheckboxItem closeOnSelect={false} value="metadata">
            Show metadata
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuGroup>
          <MenuGroupLabel>Density</MenuGroupLabel>
          <MenuRadioGroup defaultValue="compact">
            <MenuRadioItem closeOnSelect={false} value="compact">
              Compact
            </MenuRadioItem>
            <MenuRadioItem closeOnSelect={false} value="comfortable">
              Comfortable
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuSub>
          <MenuSubTrigger>Advanced</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem value="export">Export schema</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
  await page.getByRole('button', { name: 'Actions' }).click();
  await expect.element(page.getByRole('group', { name: 'Visibility' })).toBeVisible();
  await expect.element(page.getByRole('group', { name: 'Density', exact: true })).toBeVisible();
  const checkbox = page.getByRole('menuitemcheckbox', { name: 'Show metadata' });
  await checkbox.click();
  await expect.element(checkbox).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitemradio', { name: 'Comfortable' }).click();
  await expect
    .element(page.getByRole('menuitemradio', { name: 'Comfortable' }))
    .toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitem', { name: 'Advanced' }).press('ArrowRight');
  await page.getByRole('menuitem', { name: 'Export schema' }).click();
  expect(actions).toContain('export');
  await expect.element(page.getByRole('button', { name: 'Actions' })).toBeFocused();
});

test('owned menu actions keep cancellation and native pending behavior', async () => {
  const pending = Promise.withResolvers<boolean>();
  let calls = 0;
  const actions: string[] = [];
  await render(
    <Menu
      onAction={(value) => {
        actions.push(value);
      }}
    >
      <MenuTrigger>Save actions</MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={(event) => event.preventDefault()} value="cancel">
          Cancel selection
        </MenuItem>
        <MenuItem
          onSelect={() => {
            calls += 1;
            return pending.promise;
          }}
          value="save"
        >
          Save changes
        </MenuItem>
      </MenuContent>
    </Menu>
  );
  await page.getByRole('button', { name: 'Save actions' }).click();
  await page.getByRole('menuitem', { name: 'Cancel selection' }).click();
  expect(actions).toEqual([]);
  const save = page.getByRole('menuitem', { name: 'Save changes' });
  await save.click();
  await expect.element(save).toHaveAttribute('data-pending', '');
  await save.press('Enter');
  expect(calls).toBe(1);
  await act(async () => {
    pending.resolve(true);
    await pending.promise;
  });
  expect(actions).toEqual(['save']);
  await expect.element(page.getByRole('button', { name: 'Save actions' })).toBeFocused();
});

test('retained external menu and in-root context triggers interoperate with owned actions', async () => {
  const controller = createMenuController();
  let actions = 0;
  await render(
    <>
      <MenuTrigger controller={controller}>External actions</MenuTrigger>
      <Menu
        controller={controller}
        onAction={() => {
          actions += 1;
        }}
      >
        <MenuContent>
          <MenuItem value="inspect">Inspect workspace</MenuItem>
        </MenuContent>
      </Menu>
      <Menu
        onAction={() => {
          actions += 1;
        }}
      >
        <MenuContextTrigger tabIndex={0}>Workspace context</MenuContextTrigger>
        <MenuContent>
          <MenuItem value="context-inspect">Inspect context</MenuItem>
        </MenuContent>
      </Menu>
    </>
  );
  await page.getByRole('button', { name: 'External actions' }).click();
  await page.getByRole('menuitem', { name: 'Inspect workspace' }).click();
  expect(actions).toBe(1);
  await expect.element(page.getByRole('button', { name: 'External actions' })).toBeFocused();
  await expect.element(page.getByRole('menuitem', { name: 'Inspect workspace' })).not.toBeAttached();
  const context = page.getByText('Workspace context', { exact: true });
  await context.focus();
  await expect.element(context).toBeFocused();
  await context.press('Shift+F10');
  await page.getByRole('menuitem', { name: 'Inspect context' }).click();
  expect(actions).toBe(2);
});

test('retained menubar connection preserves one tab stop and RTL open-menu arrows with owned parts', async () => {
  await render(
    <div dir="rtl">
      <Menubar aria-label="Editor">
        <Menu>
          <MenuTrigger>File</MenuTrigger>
          <MenuContent>
            <MenuItem>New file</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger>Edit</MenuTrigger>
          <MenuContent>
            <MenuItem>Copy text</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    </div>
  );
  const file = page.getByRole('menuitem', { name: 'File', exact: true });
  const edit = page.getByRole('menuitem', { name: 'Edit', exact: true });
  await expect.element(file).toHaveAttribute('tabindex', '0');
  await expect.element(edit).toHaveAttribute('tabindex', '-1');
  await file.press('ArrowLeft');
  await expect.element(edit).toBeFocused();
  await edit.press('ArrowDown');
  await expect.element(page.getByRole('menuitem', { name: 'Copy text' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Copy text' }).press('Escape');
  await expect.element(edit).toBeFocused();
});

test('owned navigation parts preserve native viewport placement, Escape and nested landmarks', async () => {
  const controller = createNavigationMenuController();
  await render(
    <NavigationMenu aria-label="Documentation" controller={controller} openOnHover={false}>
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenu aria-label="Nested guides">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#guide">Read guide</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  );
  await page.getByRole('button', { name: 'Guides', exact: true }).click();
  const link = page.getByRole('link', { name: 'Read guide' });
  await expect.element(link).toBeVisible();
  expect(document.querySelectorAll('nav')).toHaveLength(1);
  const content = document.querySelector('[data-slot="navigation-menu-content"]');
  expect(content).not.toBeNull();
  expect(content?.closest('[data-slot="navigation-menu-viewport"]')).toBeInstanceOf(HTMLElement);
  expect(controller.getValue()).toBe('guides');
  await link.press('Escape');
  expect(controller.getValue()).toBeNull();
  await expect.element(page.getByRole('button', { name: 'Guides', exact: true })).toBeFocused();
});

test('owned toast text keeps rich content, labeling, queue updates and retained async actions', async () => {
  const toaster = createToaster({ duration: Number.POSITIVE_INFINITY });
  const pending = Promise.withResolvers<boolean>();
  let calls = 0;
  try {
    await render(
      <ToastRegion aria-label="Local notifications" toaster={toaster}>
        {() => (
          <Toast>
            <ToastTitle />
            <ToastDescription />
            <ToastAction />
            <ToastClose aria-label="Dismiss toast">Close</ToastClose>
          </Toast>
        )}
      </ToastRegion>
    );
    let id = '';
    await act(() => {
      id = toaster(<strong>Saved project</strong>, {
        description: <em>Version one</em>,
        action: {
          label: 'Undo save',
          onAction: () => {
            calls += 1;
            return pending.promise;
          },
        },
      });
    });
    await expect.element(page.getByText('Saved project', { exact: true })).toBeVisible();
    expect(document.querySelector('[data-slot="toast-title"] strong')?.textContent).toBe('Saved project');
    expect(document.querySelector('[data-slot="toast-description"] em')?.textContent).toBe('Version one');
    const toast = document.querySelector('[data-slot="toast"]');
    expect(toast?.getAttribute('aria-labelledby')).toBe(document.querySelector('[data-slot="toast-title"]')?.id);
    const action = page.getByRole('button', { name: 'Undo save' });
    await action.click();
    await expect.element(action).toHaveAttribute('data-pending', '');
    expect(calls).toBe(1);
    await act(() => {
      toaster.update(id, { description: 'Version two' });
    });
    await expect.element(page.getByText('Version two', { exact: true })).toBeVisible();
    await act(async () => {
      pending.resolve(true);
      await pending.promise;
    });
    await expect.element(page.getByText('Saved project', { exact: true })).not.toBeVisible();
  } finally {
    toaster.dismiss();
  }
});

test('retained tooltip renderer preserves focus descriptions and Escape', async () => {
  await render(
    <>
      <Button>Before tooltip</Button>
      <Tooltip delay={0}>
        <TooltipTrigger>Explain</TooltipTrigger>
        <TooltipContent>Schema details</TooltipContent>
      </Tooltip>
    </>
  );
  const trigger = page.getByRole('button', { name: 'Explain' });
  await page.getByRole('button', { name: 'Before tooltip' }).press('Tab');
  await expect.element(page.getByRole('tooltip')).toBeVisible();
  await expect.element(trigger).toHaveAccessibleDescription('Schema details');
  await trigger.press('Escape');
  await expect.element(page.getByRole('tooltip')).not.toBeVisible();
  await expect.element(trigger).toBeFocused();
});

test('owned select/combobox parts preserve opt-in agent confirmation, read-back, cancellation and history', async () => {
  let approved = false;
  const sources: string[] = [];
  const session = createAgentSession({ allow: () => true, confirm: () => approved });
  try {
    await render(
      <>
        <Select
          defaultValue="Alpha"
          items={['Alpha', 'Beta']}
          onValueChange={(_value, details) => {
            sources.push(details.source);
            if (details.source === 'agent') {
              details.cancel();
            }
          }}
        >
          <SelectTrigger aria-label="Agent select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectList />
          </SelectContent>
        </Select>
        <Combobox defaultValue="Alpha" items={['Alpha', 'Beta']}>
          <ComboboxInput aria-label="Agent project" data-agent-confirm="Changes the local project" />
          <ComboboxContent>
            <ComboboxList />
          </ComboboxContent>
        </Combobox>
      </>
    );
    await act(async () => {
      expect(
        (await session.agent.act({ steps: [{ ref: 'Agent select', action: 'setValue', args: ['Beta'] }] })).ok
      ).toBe(true);
    });
    await expect.element(page.getByRole('combobox', { name: 'Agent select' })).toHaveText('Alpha');
    expect(sources).toContain('agent');
    expect(
      (await session.agent.act({ steps: [{ ref: 'Agent project', action: 'setValue', args: ['Beta'] }] })).ok
    ).toBe(false);
    await expect.element(page.getByRole('combobox', { name: 'Agent project' })).toHaveValue('Alpha');
    approved = true;
    await act(async () => {
      expect(
        (await session.agent.act({ steps: [{ ref: 'Agent project', action: 'setValue', args: ['Beta'] }] })).ok
      ).toBe(true);
    });
    await expect.element(page.getByRole('combobox', { name: 'Agent project' })).toHaveValue('Beta');
    await session.history.undoSource('agent');
    await expect.element(page.getByRole('combobox', { name: 'Agent project' })).toHaveValue('Alpha');
    session.dispose();
    expect(
      (await session.agent.act({ steps: [{ ref: 'Agent project', action: 'setValue', args: ['Beta'] }] })).ok
    ).toBe(false);
  } finally {
    session.dispose();
  }
});

test('owned toast text preserves explicit children when the queued title is absent', async () => {
  const toaster = createToaster({ duration: Number.POSITIVE_INFINITY });
  try {
    await render(
      <ToastRegion toaster={toaster}>
        {() => (
          <Toast>
            <ToastTitle>
              <strong>Local status</strong>
            </ToastTitle>
            <ToastDescription />
            <ToastClose aria-label="Close status">Close</ToastClose>
          </Toast>
        )}
      </ToastRegion>
    );
    await act(() => {
      toaster({ description: 'Details only' });
    });
    await expect.element(page.getByText('Local status', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Details only', { exact: true })).toBeVisible();
    expect(document.querySelector('[data-slot="toast"]')?.getAttribute('aria-labelledby')).toBe(
      document.querySelector('[data-slot="toast-title"]')?.id
    );
    await page.getByRole('button', { name: 'Close status' }).click();
    await expect.element(page.getByText('Local status', { exact: true })).not.toBeVisible();
  } finally {
    toaster.dismiss();
  }
});

test('public context-key bridge preserves cancellation, external payload and focus recovery', async () => {
  const controller = createMenuController<{ project: string }>();
  const cancelOpen = rs.fn<() => boolean>().mockReturnValue(true);
  const cancelKey = rs.fn<() => boolean>().mockReturnValue(false);
  const sources: string[] = [];
  await render(
    <>
      <MenuContextTrigger controller={controller} disabled tabIndex={0}>
        Disabled context
      </MenuContextTrigger>
      <MenuContextTrigger
        controller={controller}
        onKeyDown={(event) => {
          if (cancelKey()) {
            event.preventDefault();
          }
        }}
        payload={{ project: 'Atlas' }}
        tabIndex={0}
      >
        Project context
      </MenuContextTrigger>
      <Menu
        controller={controller}
        onOpenChange={(open, details) => {
          if (open) {
            sources.push(details.source);
            if (cancelOpen()) {
              details.cancel();
            }
          }
        }}
        presentation="sheet"
      >
        <MenuContent>
          {(state) => (
            <MenuItem value="inspect">Inspect {state.payload === undefined ? 'unknown' : 'project'}</MenuItem>
          )}
        </MenuContent>
      </Menu>
    </>
  );
  const disabled = page.getByText('Disabled context', { exact: true });
  await disabled.focus();
  await disabled.press('Shift+F10');
  expect(controller.isOpen()).toBe(false);
  expect(sources).toEqual([]);
  const context = page.getByText('Project context', { exact: true });
  await context.focus();
  await context.press('Shift+F10');
  expect(controller.isOpen()).toBe(false);
  expect(sources).toEqual(['keyboard']);
  cancelOpen.mockReturnValue(false);
  cancelKey.mockReturnValue(true);
  await context.press('ContextMenu');
  expect(controller.isOpen()).toBe(false);
  expect(sources).toEqual(['keyboard']);
  cancelKey.mockReturnValue(false);
  await context.press('ContextMenu');
  const item = page.getByRole('menuitem', { name: 'Inspect project' });
  await expect.element(item).toBeVisible();
  await expect.element(item).toBeFocused();
  expect(document.querySelector<HTMLElement>('[data-slot="menu-content"]')?.dataset['presentation']).toBe('popover');
  expect(controller.getPayload()).toEqual({ project: 'Atlas' });
  expect(sources).toEqual(['keyboard', 'keyboard']);
  await item.press('Escape');
  await expect.element(context).toBeFocused();
});

test('retained implicit data menu placement interoperates with the owned trigger', async () => {
  const actions: string[] = [];
  await render(
    <Menu
      items={[{ value: 'new', label: 'New file' }]}
      onAction={(value) => {
        actions.push(value);
      }}
    >
      <MenuTrigger>Data actions</MenuTrigger>
    </Menu>
  );
  await page.getByRole('button', { name: 'Data actions' }).press('ArrowDown');
  const item = page.getByRole('menuitem', { name: 'New file', exact: true });
  await expect.element(item).toBeFocused();
  expect(document.querySelectorAll('[data-slot="menu-item"]')).toHaveLength(1);
  await item.press('Enter');
  expect(actions).toEqual(['new']);
  await expect.element(page.getByRole('button', { name: 'Data actions' })).toBeFocused();
});

test('owned navigation viewport preserves explicit portals, custom rendering and retained content', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const controller = createNavigationMenuController();
  try {
    await render(
      <NavigationMenu aria-label="Portal navigation" container={container} controller={controller} openOnHover={false}>
        <NavigationMenuList>
          <NavigationMenuItem value="portal">
            <NavigationMenuTrigger>Portal guides</NavigationMenuTrigger>
            <NavigationMenuContent keepMounted render={<section />}>
              <NavigationMenuLink href="#portal-guide">Portal guide link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport render={<section />} />
      </NavigationMenu>
    );
    const trigger = page.getByRole('button', { name: 'Portal guides', exact: true });
    await trigger.click();
    await expect.element(page.getByRole('link', { name: 'Portal guide link' })).toBeVisible();
    const viewport = container.querySelector('[data-slot="navigation-menu-viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport?.tagName).toBe('SECTION');
    expect(viewport?.querySelector('[data-slot="navigation-menu-content"]')?.tagName).toBe('SECTION');
    await act(() => {
      controller.close();
    });
    await expect.element(page.getByRole('link', { name: 'Portal guide link' })).not.toBeVisible();
    expect(document.querySelector('[data-slot="navigation-menu-content"]')).not.toBeNull();
    await trigger.click();
    await expect.element(page.getByRole('link', { name: 'Portal guide link' })).toBeVisible();
  } finally {
    container.remove();
  }
});

const projectOptions = [
  { value: 'a', label: 'Alpha project', group: 'First team' },
  { value: 'b', label: 'Beta project', group: 'Second team' },
];
function ProjectComboboxes() {
  const [value, setValue] = useState('a');
  return (
    <>
      <OptionCombobox
        aria-label="Local project"
        onChange={setValue}
        options={projectOptions}
        renderOption={(option) => <strong>{option.label}</strong>}
        value={value}
      />
      <OptionCombobox
        aria-label="Provider project"
        filter={false}
        onChange={setValue}
        options={projectOptions}
        value={value}
      />
    </>
  );
}

test('convenience combobox hides nonmatches and empty groups without losing rich labels or provider results', async () => {
  expect(
    renderToString(<OptionCombobox aria-label="Server project" onChange={rs.fn()} options={projectOptions} value="a" />)
  ).toContain('value="Alpha project"');
  await render(<ProjectComboboxes />);
  const local = page.getByRole('combobox', { name: 'Local project' });
  await expect.element(local).toHaveValue('Alpha project');
  await local.click();
  await expect.element(page.getByRole('group', { name: 'First team', exact: true })).toBeVisible();
  await expect.element(page.getByRole('group', { name: 'Second team', exact: true })).toBeVisible();
  await local.fill('Bet');
  await expect.element(page.getByRole('option', { name: 'Beta project' })).toBeVisible();
  await expect.element(page.getByRole('option', { name: 'Alpha project' })).not.toBeVisible();
  await expect.element(page.getByText('First team', { exact: true })).not.toBeVisible();
  expect(document.querySelector('[data-slot="combobox-item"] strong')).not.toBeNull();
  await page.getByRole('option', { name: 'Beta project' }).click();
  await expect.element(local).toHaveValue('Beta project');
  const provider = page.getByRole('combobox', { name: 'Provider project' });
  await provider.fill('Bet');
  await expect.element(page.getByRole('option', { name: 'Alpha project' })).toBeVisible();
  await expect.element(page.getByRole('option', { name: 'Beta project' })).toBeVisible();
});
