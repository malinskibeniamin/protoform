'use client';

import type { ChartValue } from '@tanstack/charts';
import type { ChartProps } from '@tanstack/charts/react';
import type { CSSProperties } from 'react';
import { lazy, Suspense } from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const ChartModule = lazy(() => import('./chart-module').then((module) => ({ default: module.ChartModule })));

export type TanStackChartProps<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = ChartProps<TDatum, TXValue, TYValue>;

export function TanStackChart<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({ className, ...props }: TanStackChartProps<TDatum, TXValue, TYValue>) {
  const defaultHeight = props.aspectRatio === undefined ? 320 : undefined;
  const loadingHeight = props.height ?? defaultHeight;
  const loadingStyle: CSSProperties & Record<`--${string}`, string | number | undefined> = {
    '--chart-loading-width': props.width === undefined ? '100%' : `${props.width}px`,
    '--chart-loading-height': loadingHeight === undefined ? undefined : `${loadingHeight}px`,
    '--chart-loading-aspect-ratio': props.aspectRatio,
    ...props.style,
  };
  return (
    <Suspense
      fallback={
        <div
          aria-label={props.ariaLabel}
          className={cn(
            'grid aspect-(--chart-loading-aspect-ratio) h-(--chart-loading-height) w-(--chart-loading-width) place-items-center text-sm text-muted-foreground',
            className
          )}
          role="status"
          style={loadingStyle}
        >
          Loading chart…
        </div>
      }
    >
      <ChartModule>
        {(Chart) => (
          <Chart
            {...props}
            className={cn(
              'min-w-0 text-foreground [--ts-chart-1:var(--chart-1)] [--ts-chart-2:var(--chart-2)] [--ts-chart-3:var(--chart-3)] [--ts-chart-4:var(--chart-4)] [--ts-chart-5:var(--chart-5)] [--ts-chart-6:var(--chart-6)] [&_.ts-chart]:focus-visible:ring-2 [&_.ts-chart]:focus-visible:ring-ring/50',
              className
            )}
          />
        )}
      </ChartModule>
    </Suspense>
  );
}
