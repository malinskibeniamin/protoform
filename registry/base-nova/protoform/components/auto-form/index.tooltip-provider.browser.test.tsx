import '../tooltip/browser-fixture.css';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AutoForm } from '.';
import { createMockProvider } from './index.test-utils';

test('inherits the host tooltip delay and shares warm-up with adjacent controls', async () => {
  const schema = createMockProvider([
    {
      fieldConfig: { customData: { help: 'Choose a title.' }, label: 'Title' },
      key: 'title',
      required: true,
      type: 'string',
    },
  ]);

  await render(
    <TooltipProvider delay={1000} timeout={400}>
      <div data-tooltip-provider-fixture>
        <Tooltip>
          <TooltipTrigger>Host control</TooltipTrigger>
          <TooltipContent role="tooltip">Host guidance</TooltipContent>
        </Tooltip>
        <AutoForm modes={['simple']} schema={schema} showSummary={false} />
      </div>
    </TooltipProvider>
  );

  const help = page.getByRole('button', { name: 'Help for Title' });
  const host = page.getByRole('button', { name: 'Host control' });
  const start = performance.now();
  await help.hover();
  await expect.element(page.getByRole('tooltip', { name: 'Choose a title.' })).toBeVisible();
  expect(performance.now() - start).toBeGreaterThanOrEqual(900);

  const next = performance.now();
  await host.hover();
  await expect.element(page.getByRole('tooltip', { name: 'Host guidance' })).toBeVisible();
  expect(performance.now() - next).toBeLessThan(850);

  const again = performance.now();
  await help.hover();
  await expect.element(page.getByRole('tooltip', { name: 'Choose a title.' })).toBeVisible();
  expect(performance.now() - again).toBeLessThan(850);
});
