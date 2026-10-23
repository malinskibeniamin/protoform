'use client';

import { useRender } from '@base-ui/react/use-render';
import React from 'react';
import type {
  ResponsiveContainer as RechartsContainerType,
  DefaultLegendContentProps as RechartsPrimitiveDefaultLegendContentProps,
  DefaultTooltipContentProps as RechartsPrimitiveDefaultTooltipContentProps,
  TooltipValueType,
} from 'recharts';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

type ChartTheme = 'light' | 'dark';
const RechartsPrimitiveLegend = React.lazy(() => import('recharts').then((module) => ({ default: module.Legend })));
const RechartsPrimitiveTooltip = React.lazy(() => import('recharts').then((module) => ({ default: module.Tooltip })));
const RechartsPrimitiveResponsiveContainer = React.lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);

const INITIAL_DIMENSION = {
  width: 320,
  height: 200,
} as const;
type TooltipNameType = number | string;
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | {
        color?: string;
        theme?: never;
      }
    | {
        color?: never;
        theme: Record<ChartTheme, string>;
      }
  )
>;
const ChartContext = React.createContext<ChartConfig | null>(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (context === null) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  ref,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsContainerType>['children'];
  initialDimension?: {
    width: number;
    height: number;
  };
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replaceAll(':', '')}`;
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chart = useRender({
    defaultTagName: 'div',
    ref: [chartRef, ref ?? null],
    props: {
      ...props,
      className: cn(
        "flex aspect-video justify-center text-xs scheme-light dark:scheme-dark [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      'data-chart': chartId,
      'data-slot': 'chart',
      children: (
        <React.Suspense fallback={<p role="status">Loading chart…</p>}>
          <RechartsPrimitiveResponsiveContainer initialDimension={initialDimension}>
            {children}
          </RechartsPrimitiveResponsiveContainer>
        </React.Suspense>
      ),
    },
  });
  return (
    <ChartContext.Provider value={config}>
      {chart}
      <ChartStyle config={config} id={chartId} />
    </ChartContext.Provider>
  );
}
interface ChartColorRestoration {
  addedClasses: string[];
  applied: Map<string, string>;
}

function updateChartColors(element: HTMLElement, config: ChartConfig, applied: Map<string, string>) {
  for (const [key, value] of Object.entries(config)) {
    const property = `--color-${key}`;
    const current = element.style.getPropertyValue(property);
    if (applied.has(property) && current !== applied.get(property)) {
      applied.delete(property);
    }
    const color = value.theme === undefined ? value.color : `light-dark(${value.theme.light}, ${value.theme.dark})`;
    if (color !== undefined && current.length === 0) {
      element.style.setProperty(property, color);
      applied.set(property, element.style.getPropertyValue(property));
    }
  }
}

function applyChartColors(element: HTMLElement, config: ChartConfig): ChartColorRestoration {
  const applied = new Map<string, string>();
  updateChartColors(element, config, applied);
  const addedClasses =
    applied.size === 0 ? [] : ['scheme-light', 'dark:scheme-dark'].filter((name) => !element.classList.contains(name));
  element.classList.add(...addedClasses);
  return { applied, addedClasses };
}

function restoreChartColors(element: HTMLElement, { applied, addedClasses }: ChartColorRestoration) {
  for (const [property, value] of applied) {
    if (
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property).length === 0
    ) {
      element.style.removeProperty(property);
    }
  }
  element.classList.remove(...addedClasses);
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  React.useLayoutEffect(
    function synchronizeChartColors() {
      const selector = `[data-chart="${CSS.escape(id)}"]`;
      const restored = new Map<HTMLElement, ChartColorRestoration>();
      const styles = new MutationObserver((records) => {
        for (const { target } of records) {
          if (target instanceof HTMLElement) {
            const restoration = restored.get(target);
            if (restoration !== undefined) {
              updateChartColors(target, config, restoration.applied);
            }
          }
        }
      });
      function synchronizeTargets() {
        const targets = new Set(document.querySelectorAll<HTMLElement>(selector));
        for (const [element, restoration] of restored) {
          if (!targets.has(element)) {
            restoreChartColors(element, restoration);
            restored.delete(element);
          }
        }
        styles.disconnect();
        for (const element of targets) {
          const restoration = restored.get(element);
          if (restoration === undefined) {
            restored.set(element, applyChartColors(element, config));
          } else {
            updateChartColors(element, config, restoration.applied);
          }
          styles.observe(element, { attributes: true, attributeFilter: ['style'] });
        }
      }
      synchronizeTargets();
      const observer = new MutationObserver(synchronizeTargets);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-chart'],
      });
      return () => {
        observer.disconnect();
        styles.disconnect();
        for (const [element, restoration] of restored) {
          restoreChartColors(element, restoration);
        }
      };
    },
    [config, id]
  );
  return null;
}
const ChartTooltip = RechartsPrimitiveTooltip;
function ChartIndicator({
  icon: Icon,
  hidden,
  color,
  indicator,
  nested,
}: {
  icon: React.ComponentType | undefined;
  hidden: boolean;
  color: string | undefined;
  indicator: 'line' | 'dot' | 'dashed';
  nested: boolean;
}) {
  if (Icon !== undefined) {
    return <Icon />;
  }
  if (hidden === true) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      className={cn('shrink-0 rounded-xs border-(--color-border) bg-(--color-bg)', {
        'size-2.5': indicator === 'dot',
        'w-1': indicator === 'line',
        'w-0 border-2 border-dashed bg-transparent': indicator === 'dashed',
        'my-0.5': nested && indicator === 'dashed',
      })}
      style={
        {
          '--color-bg': color,
          '--color-border': color,
        } as React.CSSProperties
      }
    />
  );
}
function ChartValue({ value }: { value: TooltipValueType | undefined }) {
  if (value === undefined || value === null) {
    return null;
  }
  return (
    <span className="font-mono font-medium text-foreground tabular-nums">
      {typeof value === 'number' ? value.toLocaleString() : String(value)}
    </span>
  );
}
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitiveTooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  } & Omit<RechartsPrimitiveDefaultTooltipContentProps<TooltipValueType, TooltipNameType>, 'accessibilityLayer'>) {
  const config = useChart();
  const tooltipLabel = (() => {
    if (hideLabel === true || payload === undefined || payload.length === 0) {
      return null;
    }
    const [item] = payload;
    const key = String(labelKey ?? item?.dataKey ?? item?.name ?? 'value');
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      (labelKey === undefined || labelKey.length === 0) && typeof label === 'string'
        ? (config[label]?.label ?? label)
        : itemConfig?.label;
    if (labelFormatter) {
      return <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>;
    }
    if (value === undefined || value === null || value === false || value === '') {
      return null;
    }
    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  })();
  if (active !== true || payload === undefined || payload.length === 0) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== 'dot';
  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
    >
      {nestLabel === false && tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          if (item.type === 'none') {
            return null;
          }
          const key = String(nameKey ?? item.name ?? item.dataKey ?? 'value');
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? getPayloadFill(item.payload) ?? item.color;
          return (
            <div
              className={cn(
                'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center'
              )}
              key={item.graphicalItemId}
            >
              {typeof formatter === 'function' &&
              item.value !== undefined &&
              item.name !== undefined &&
              item.name !== null ? (
                formatter(item.value, item.name, item, index, payload)
              ) : (
                <>
                  <ChartIndicator
                    color={indicatorColor}
                    hidden={hideIndicator}
                    icon={itemConfig?.icon}
                    indicator={indicator}
                    nested={nestLabel}
                  />
                  <div
                    className={cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                    </div>
                    <ChartValue value={item.value} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const ChartLegend = RechartsPrimitiveLegend;
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> & {
  hideIcon?: boolean;
  nameKey?: string;
} & RechartsPrimitiveDefaultLegendContentProps) {
  const config = useChart();
  if (payload === undefined || payload.length === 0) {
    return null;
  }
  return (
    <div className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
      {payload.map((item) => {
        if (item.type === 'none') {
          return null;
        }
        const key = String(nameKey ?? item.dataKey ?? 'value');
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return (
          <div
            className={cn('flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground')}
            key={String(item.dataKey ?? item.value ?? item.color)}
          >
            {itemConfig?.icon && hideIcon !== true ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2 shrink-0 rounded-xs bg-(--legend-color)"
                style={
                  {
                    '--legend-color': item.color,
                  } as React.CSSProperties
                }
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}
function getPayloadFill(payload: unknown): string | undefined {
  if (typeof payload === 'object' && payload !== null && 'fill' in payload && typeof payload.fill === 'string') {
    return payload.fill;
  }
  return undefined;
}
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return;
  }
  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
      ? payload.payload
      : undefined;
  let configLabelKey: string = key;
  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent };
