import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/ui/button/index';
import { PortalContainerProvider } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '.';

afterEach(cleanup);

test('keeps menu output inside the configured Protoform portal container', async () => {
  const user = userEvent.setup();
  const portalContainer = document.createElement('div');
  document.body.append(portalContainer);
  try {
    render(
      <PortalContainerProvider value={portalContainer}>
        <Menu>
          <MenuTrigger render={<Button type="button">Record actions</Button>} />
          <MenuContent>
            <MenuItem>Duplicate record</MenuItem>
          </MenuContent>
        </Menu>
      </PortalContainerProvider>,
      { container: portalContainer }
    );
    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    expect(portalContainer).toContainElement(await screen.findByRole('menuitem', { name: 'Duplicate record' }));
  } finally {
    cleanup();
    portalContainer.remove();
  }
});
