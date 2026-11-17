import '../../tooltip/browser-fixture.css';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { afterEach, expect, rs, test } from '@rstest/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AutoForm } from '..';
import { createMockProvider } from '../__tests__/test-utils';

afterEach(() => {
  rs.useRealTimers();
});

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
  rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  await page.getByRole('button', { name: 'Help for Title' }).hover();
  await rs.advanceTimersByTimeAsync(999);
  await expect.element(page.getByRole('tooltip', { name: 'Choose a title.' })).toHaveCount(0);
  await rs.advanceTimersByTimeAsync(1);
  await expect.element(page.getByRole('tooltip', { name: 'Choose a title.' })).toBeVisible();

  await page.getByRole('button', { name: 'Host control' }).hover();
  await rs.advanceTimersByTimeAsync(1);
  await expect.element(page.getByRole('tooltip', { name: 'Host guidance' })).toBeVisible();

  await page.getByRole('button', { name: 'Help for Title' }).hover();
  await rs.advanceTimersByTimeAsync(1);
  await expect.element(page.getByRole('tooltip', { name: 'Choose a title.' })).toBeVisible();
});
