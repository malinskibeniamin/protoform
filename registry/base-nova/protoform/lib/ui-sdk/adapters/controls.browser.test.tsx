import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { createDialogController } from '@ui-sdk/core/dialog';
import { renderToString } from 'react-dom/server';
import { Button } from '@/components/ui/sdk/button';
import {
  Calendar,
  CalendarGrid,
  CalendarHeading,
  CalendarMonthSelect,
  CalendarWeekdays,
  CalendarWeeks,
  CalendarYearSelect,
} from '@/components/ui/sdk/calendar';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/sdk/dialog';
import { Input } from '@/components/ui/sdk/input';
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/sdk/popover';
import { Switch } from '@/components/ui/sdk/switch';
import { Textarea } from '@/components/ui/sdk/textarea';

test('owned text adapters preserve server values and native form edits and resets', async () => {
  const html = renderToString(
    <form>
      <Input defaultValue="Server title" name="title" />
      <Textarea defaultValue="Server notes" name="notes" />
    </form>
  );
  expect(html).toContain('value="Server title"');
  expect(html).toContain('Server notes');
  const changes: string[] = [];
  await render(
    <form aria-label="Core text form">
      <Input
        aria-label="Core title"
        defaultValue="Title"
        name="title"
        onChange={(event) => {
          changes.push(event.currentTarget.value);
        }}
      />
      <Textarea aria-label="Core notes" defaultValue="Notes" name="notes" />
      <Button type="reset">Reset core text</Button>
    </form>
  );
  await page.getByRole('textbox', { name: 'Core title' }).fill('Edited title');
  await page.getByRole('textbox', { name: 'Core notes' }).fill('Edited notes');
  const form = document.querySelector<HTMLFormElement>('[aria-label="Core text form"]');
  if (!form) {
    throw new Error('Missing native form');
  }
  expect(new FormData(form).get('title')).toBe('Edited title');
  expect(new FormData(form).get('notes')).toBe('Edited notes');
  expect(changes.at(-1)).toBe('Edited title');
  await page.getByRole('button', { name: 'Reset core text' }).click();
  await expect.element(page.getByRole('textbox', { name: 'Core title' })).toHaveValue('Title');
  await expect.element(page.getByRole('textbox', { name: 'Core notes' })).toHaveValue('Notes');
});

test('owned switch keeps a sibling native input, form participation and fieldset disabling', async () => {
  await render(
    <form aria-label="Core switch form">
      <Switch aria-label="Core digest" defaultChecked name="digest" value="weekly" />
      <fieldset disabled>
        <Switch aria-label="Locked digest" defaultChecked name="locked" />
      </fieldset>
      <Button type="reset">Reset core switch</Button>
    </form>
  );
  const form = document.querySelector<HTMLFormElement>('[aria-label="Core switch form"]');
  if (!form) {
    throw new Error('Missing native form');
  }
  expect(form.querySelector('button input')).toBeNull();
  expect(new FormData(form).get('digest')).toBe('weekly');
  expect(new FormData(form).has('locked')).toBe(false);
  await page.getByRole('switch', { name: 'Core digest' }).click();
  await expect.element(page.getByRole('switch', { name: 'Core digest' })).toHaveAttribute('aria-checked', 'false');
  expect(new FormData(form).has('digest')).toBe(false);
  await page.getByRole('button', { name: 'Reset core switch' }).click();
  await expect.element(page.getByRole('switch', { name: 'Core digest' })).toHaveAttribute('aria-checked', 'true');
});

test('owned button preserves React events and pending state without duplicate actions', async () => {
  const pending = Promise.withResolvers<boolean>();
  let presses = 0;
  let eventTarget: EventTarget | null = null;
  const sources: string[] = [];
  await render(
    <Button
      onClick={(event, details) => {
        eventTarget = event.currentTarget;
        sources.push(details.source);
        presses += 1;
        return pending.promise;
      }}
    >
      Save core record
    </Button>
  );
  const button = page.getByRole('button', { name: 'Save core record' });
  await button.click();
  await expect.element(button).toHaveAttribute('aria-busy', 'true');
  expect(presses).toBe(1);
  expect(eventTarget).toBeInstanceOf(HTMLButtonElement);
  expect(sources).toEqual(['mouse']);
  document.querySelector<HTMLButtonElement>('[aria-busy="true"]')?.click();
  expect(presses).toBe(1);
  await act(async () => {
    pending.resolve(true);
    await pending.promise;
  });
  await expect.element(button).not.toHaveAttribute('aria-busy', 'true');
});

test('owned calendar renders default grids and keeps date keyboard behavior upstream-owned', async () => {
  await render(
    <Calendar defaultMonth="2026-11" defaultValue="2026-11-14" locale="en-US">
      <CalendarHeading />
      <CalendarGrid />
    </Calendar>
  );
  await expect.element(page.getByRole('heading', { name: 'November 2026' })).toBeVisible();
  const day = page.getByRole('gridcell', { name: /November 14, 2026/u });
  await expect.element(day).toHaveAttribute('aria-selected', 'true');
  await day.press('ArrowRight');
  await page.getByRole('gridcell', { name: /November 15, 2026/u }).press('Enter');
  await expect
    .element(page.getByRole('gridcell', { name: /November 15, 2026/u }))
    .toHaveAttribute('aria-selected', 'true');
});

test('owned popup rendering supports portal containers and retained external controller triggers', async () => {
  const controller = createDialogController();
  const container = document.createElement('div');
  document.body.append(container);
  try {
    await render(
      <>
        <DialogTrigger controller={controller}>External owned dialog</DialogTrigger>
        <Dialog controller={controller}>
          <DialogContent container={container}>
            <DialogTitle>Owned portal dialog</DialogTitle>
            <DialogClose>Close owned dialog</DialogClose>
          </DialogContent>
        </Dialog>
      </>
    );
    const trigger = page.getByRole('button', { name: 'External owned dialog' });
    await trigger.click();
    await expect.element(page.getByRole('dialog', { name: 'Owned portal dialog' })).toBeVisible();
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    await page.getByRole('button', { name: 'Close owned dialog' }).click();
    await expect.element(trigger).toBeFocused();
  } finally {
    container.remove();
  }
});

test('owned popup contents retain sheet viewports and custom rendering', async () => {
  await render(
    <>
      <Dialog presentation="sheet">
        <DialogTrigger>Open core sheet</DialogTrigger>
        <DialogContent render={<section data-rendered-sheet="dialog" />}>
          <DialogTitle>Core sheet dialog</DialogTitle>
          <DialogClose>Close core sheet</DialogClose>
        </DialogContent>
      </Dialog>
      <Popover presentation="sheet">
        <PopoverTrigger>Open core popover sheet</PopoverTrigger>
        <PopoverContent render={<section data-rendered-sheet="popover" />}>
          <PopoverTitle>Core sheet popover</PopoverTitle>
          <PopoverClose>Close core popover sheet</PopoverClose>
        </PopoverContent>
      </Popover>
    </>
  );
  await page.getByRole('button', { name: 'Open core sheet', exact: true }).click();
  await expect.element(page.getByRole('dialog', { name: 'Core sheet dialog' })).toBeVisible();
  expect(
    document.querySelector('[data-slot="dialog-viewport"] > section[data-rendered-sheet="dialog"]')
  ).not.toBeNull();
  await page.getByRole('button', { name: 'Close core sheet', exact: true }).click();
  await expect.element(page.getByRole('button', { name: 'Open core sheet', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Open core popover sheet', exact: true }).click();
  await expect.element(page.getByRole('dialog', { name: 'Core sheet popover' })).toBeVisible();
  expect(
    document.querySelector('[data-slot="popover-viewport"] > section[data-rendered-sheet="popover"]')
  ).not.toBeNull();
  await page.getByRole('button', { name: 'Close core popover sheet', exact: true }).click();
  await expect.element(page.getByRole('button', { name: 'Open core popover sheet', exact: true })).toBeFocused();
});

test('owned calendar month and year controls retain native selection and React handlers', async () => {
  const changes: string[] = [];
  await render(
    <Calendar defaultMonth="2026-11" locale="en-US">
      <CalendarHeading />
      <CalendarMonthSelect
        onChange={(event) => {
          changes.push(event.currentTarget.value);
        }}
      />
      <CalendarYearSelect />
      <CalendarGrid />
    </Calendar>
  );
  await expect.element(page.getByRole('combobox', { name: 'Month' })).toHaveValue('11');
  await expect.element(page.getByRole('combobox', { name: 'Year' })).toHaveValue('2026');
  await act(async () => {
    await page.getByRole('combobox', { name: 'Month' }).selectOption('12');
  });
  await expect.element(page.getByRole('heading', { name: 'December 2026' })).toBeVisible();
  expect(changes).toEqual(['12']);
  await act(async () => {
    await page.getByRole('combobox', { name: 'Year' }).selectOption('2027');
  });
  await expect.element(page.getByRole('heading', { name: 'December 2027' })).toBeVisible();
});

test('owned calendar preserves explicit empty cell and weekday render results', async () => {
  await render(
    <Calendar defaultMonth="2026-11" locale="en-US">
      <CalendarGrid>
        <CalendarWeekdays>{() => null}</CalendarWeekdays>
        <CalendarWeeks>{() => null}</CalendarWeeks>
      </CalendarGrid>
    </Calendar>
  );
  expect(document.querySelector('[data-slot="calendar-grid"] th')).toBeNull();
  expect(document.querySelector('[data-slot="calendar-grid"] [role="gridcell"]')).toBeNull();
});
