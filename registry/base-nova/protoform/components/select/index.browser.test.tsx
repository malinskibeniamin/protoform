import type { Select as SelectPrimitive } from '@base-ui/react/select';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '.';

function RetainedSelect() {
  const actionsRef = useRef<SelectPrimitive.Root.Actions | null>(null);
  const [closed, setClosed] = useState(false);
  return (
    <>
      <Select
        actionsRef={actionsRef}
        items={[{ label: 'Active', value: 'active' }]}
        onOpenChange={(open, details) => {
          if (!open) {
            details.preventUnmountOnClose();
          }
        }}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setClosed(true);
          }
        }}
      >
        <SelectTrigger aria-label="Status">
          <SelectValue placeholder="Choose a status" />
        </SelectTrigger>
        <SelectContent testId="status-popup">
          <SelectItem value="active">Active</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={() => {
          if (!actionsRef.current) {
            throw new Error('Select actions were not attached');
          }
          actionsRef.current.unmount();
        }}
        type="button"
      >
        Finish closing
      </Button>
      <output aria-label="Closing state">{String(closed)}</output>
    </>
  );
}

test('forwards close-retention events and completes closing only after the manual unmount', async () => {
  await render(<RetainedSelect />);
  const trigger = page.getByRole('combobox', { name: 'Status' });
  await trigger.click();
  await expect.element(page.getByRole('option', { name: 'Active' })).toBeVisible();
  await trigger.press('Escape');
  await expect.element(page.getByTestId('status-popup')).toHaveAttribute('data-state', 'closed');
  await expect.element(page.getByRole('status', { name: 'Closing state' })).toHaveText('false');
  await page.getByRole('button', { name: 'Finish closing' }).click();
  await expect.element(page.getByRole('status', { name: 'Closing state' })).toHaveText('true');
  await expect.element(page.getByTestId('status-popup')).toBeHidden();
});
