import '../tooltip/browser-fixture.css';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { afterEach, expect, rs, test } from '@rstest/core';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MultiSelect, MultiSelectTrigger, MultiSelectValue } from '.';

afterEach(() => {
  rs.useRealTimers();
});

test('shares host tooltip warm-up for truncated selected values', async () => {
  const options = [{ label: 'Extended selection', value: 'extended' }];
  await render(
    <TooltipProvider delay={1000} timeout={400}>
      <div data-tooltip-provider-fixture>
        <Tooltip>
          <TooltipTrigger>Host control</TooltipTrigger>
          <TooltipContent role="tooltip">Host guidance</TooltipContent>
        </Tooltip>
        <MultiSelect defaultValue={['extended']} items={options}>
          <MultiSelectTrigger aria-label="Values">
            <MultiSelectValue maxItemLength={4} options={options} />
          </MultiSelectTrigger>
        </MultiSelect>
      </div>
    </TooltipProvider>
  );
  rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  await page.getByRole('button', { name: 'Host control' }).hover();
  await rs.advanceTimersByTimeAsync(1000);
  await expect.element(page.getByRole('tooltip', { name: 'Host guidance' })).toBeVisible();

  await page.getByText('Exte...', { exact: true }).hover();
  await rs.advanceTimersByTimeAsync(1);
  await expect.element(page.getByText('Extended selection', { exact: true })).toBeVisible();
});
