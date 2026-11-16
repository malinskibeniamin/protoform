import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsPanel, TabsTab } from '.';

test('navigates native SDK tabs and links their panels', async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="one">
      <TabsList aria-label="Sections">
        <TabsTab value="one">One</TabsTab>
        <TabsTab value="two">Two</TabsTab>
      </TabsList>
      <TabsPanel value="one">First panel</TabsPanel>
      <TabsPanel value="two">Second panel</TabsPanel>
    </Tabs>
  );
  await user.click(screen.getByRole('tab', { name: 'One' }));
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel', { name: 'Two' })).toHaveTextContent('Second panel');
});
