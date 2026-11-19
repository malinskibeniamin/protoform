import { afterEach, expect, test } from '@rstest/core';
import { barY, type ChartRenderContext, defineChart } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'expect-type';
import { TanStackChart } from '.';

afterEach(cleanup);

const rows = [
  { day: 'Mon', total: 12 },
  { day: 'Tue', total: 18 },
  { day: 'Wed', total: 9 },
];
const definition = defineChart({
  marks: [barY(rows, { x: 'day', y: 'total' })],
  scales: { x: { scale: scaleBand }, y: { scale: scaleLinear, zero: true } },
  tooltip,
});

test('renders native definitions and preserves keyboard selection callbacks', async () => {
  const user = userEvent.setup();
  const selected = Promise.withResolvers<unknown>();
  render(
    <TanStackChart
      ariaLabel="Requests by day"
      definition={definition}
      height={200}
      onSelect={(point) => {
        expectTypeOf(point?.datum).toEqualTypeOf<(typeof rows)[number] | undefined>();
        expectTypeOf(point?.xValue).toEqualTypeOf<string | undefined>();
        expectTypeOf(point?.yValue).toEqualTypeOf<number | undefined>();
        selected.resolve(point);
      }}
      width={320}
    />
  );
  const chart = await screen.findByRole('img', { name: 'Requests by day' });
  expect(chart).toHaveTextContent('Mon');
  await user.tab();
  await user.keyboard('{Home}{ArrowRight}{Enter}');
  expect(await selected.promise).toMatchObject({ datum: rows[1] });
  expect(await screen.findByRole('status', { name: /Tue/u })).toHaveTextContent('18');
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('status', { name: /Tue/u })).toBeNull());
});

test('updates native scenes and clears removed data without stale marks', async () => {
  let rendered = Promise.withResolvers<number[]>();
  const handleRender = (context: ChartRenderContext<(typeof rows)[number], string, number>) => {
    rendered.resolve(context.scene.points.map((point) => point.datum.total));
  };
  const { rerender } = render(
    <TanStackChart
      ariaLabel="Requests by day"
      definition={definition}
      height={200}
      onRender={handleRender}
      width={320}
    />
  );
  expect(await rendered.promise).toEqual([12, 18, 9]);
  rendered = Promise.withResolvers<number[]>();
  const updated = defineChart({
    marks: [barY([{ day: 'Thu', total: 24 }], { x: 'day', y: 'total' })],
    scales: { x: { scale: scaleBand }, y: { scale: scaleLinear } },
  });
  rerender(
    <TanStackChart ariaLabel="Requests by day" definition={updated} height={200} onRender={handleRender} width={320} />
  );
  expect(await rendered.promise).toEqual([24]);
  rendered = Promise.withResolvers<number[]>();
  expect(screen.queryByText('Mon')).toBeNull();
  const noRows: typeof rows = [];
  const empty = defineChart({
    marks: [barY(noRows, { x: 'day', y: 'total' })],
    scales: { x: { scale: scaleBand }, y: { scale: scaleLinear } },
  });
  rerender(
    <TanStackChart ariaLabel="Requests by day" definition={empty} height={200} onRender={handleRender} width={320} />
  );
  expect(await rendered.promise).toEqual([]);
  expect(screen.queryByText('Thu')).toBeNull();
});
