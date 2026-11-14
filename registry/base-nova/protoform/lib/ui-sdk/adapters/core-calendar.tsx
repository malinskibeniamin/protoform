'use client';

import { type CalendarGridCell, type CalendarGridState, calendar } from '@ui-sdk/core/calendar';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createContext, createElement, Fragment, type ReactNode, useContext } from 'react';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(calendar), {
  root: 'div',
  heading: 'h2',
  previous: 'button',
  next: 'button',
  'month-select': 'select',
  'year-select': 'select',
  grid: 'table',
  weekdays: 'thead',
  weekday: 'th',
  week: 'tr',
  day: 'td',
});
const GridContext = createContext<CalendarGridState | null>(null);
function useGrid() {
  const grid = useContext(GridContext);
  if (grid === null) {
    throw new Error('Calendar weeks and weekdays need CalendarGrid.');
  }
  return grid;
}
export const Calendar = parts.Root;
export function CalendarPrevious({ children, ...props }: ComponentProps<typeof parts.Previous>) {
  const renderedProps: ComponentProps<typeof parts.Previous> = {
    ...props,
    children: children ?? '‹',
  };
  return createElement(parts.Previous, renderedProps);
}
export function CalendarNext({ children, ...props }: ComponentProps<typeof parts.Next>) {
  const renderedProps: ComponentProps<typeof parts.Next> = {
    ...props,
    children: children ?? '›',
  };
  return createElement(parts.Next, renderedProps);
}
export function CalendarHeading({ children, ...props }: ComponentProps<typeof parts.Heading>) {
  const renderedProps: ComponentProps<typeof parts.Heading> = {
    ...props,
    children: children ?? ((state) => state.label),
  };
  return createElement(parts.Heading, renderedProps);
}
export function CalendarGrid({ children, ...props }: ComponentProps<typeof parts.Grid>) {
  const renderedProps: ComponentProps<typeof parts.Grid> = {
    ...props,
    children: (state) => {
      const content =
        typeof children === 'function'
          ? children(state)
          : (children ?? (
              <>
                <CalendarWeekdays />
                <CalendarWeeks />
              </>
            ));
      return <GridContext value={state}>{content}</GridContext>;
    },
  };
  return createElement(parts.Grid, renderedProps);
}
export function CalendarWeekdays({
  children,
  ...props
}: Omit<ComponentProps<typeof parts.Weekdays>, 'children'> & { children?: (index: number) => ReactNode }) {
  const grid = useGrid();
  return createElement(
    parts.Weekdays,
    props,
    <parts.Week>
      {grid.weekdays.map((index) => (
        <Fragment key={index}>{children === undefined ? <CalendarWeekday index={index} /> : children(index)}</Fragment>
      ))}
    </parts.Week>
  );
}
export function CalendarWeekday({ children, ...props }: ComponentProps<typeof parts.Weekday>) {
  const renderedProps: ComponentProps<typeof parts.Weekday> = {
    ...props,
    children: children ?? ((state) => state.label),
  };
  return createElement(parts.Weekday, renderedProps);
}
export function CalendarWeeks({
  children,
  ...props
}: Omit<ComponentProps<'tbody'>, 'children'> & { children?: (cell: CalendarGridCell) => ReactNode }) {
  const grid = useGrid();
  return createElement(
    'tbody',
    props,
    grid.weeks.map((week) => (
      <parts.Week key={week.map((cell) => cell.date).join(':')}>
        {week.map((cell) =>
          cell.hidden ? <td key={cell.date} /> : <CalendarCell cell={cell} key={cell.date} renderCell={children} />
        )}
      </parts.Week>
    ))
  );
}
function CalendarCell({
  cell,
  renderCell,
}: {
  cell: CalendarGridCell;
  renderCell?: ((cell: CalendarGridCell) => ReactNode) | undefined;
}) {
  return renderCell === undefined ? <CalendarDay value={cell.date} /> : renderCell(cell);
}
export function CalendarDay({ children, ...props }: ComponentProps<typeof parts.Day>) {
  const renderedProps: ComponentProps<typeof parts.Day> = {
    ...props,
    children: children ?? ((state) => state.label),
  };
  return createElement(parts.Day, renderedProps);
}
export function CalendarMonthSelect({ children, ...props }: ComponentProps<typeof parts.MonthSelect>) {
  const renderedProps: ComponentProps<typeof parts.MonthSelect> = {
    ...props,
    onChange: props.onChange ?? (() => undefined),
    children:
      children ??
      ((state) =>
        state.options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))),
  };
  return createElement(parts.MonthSelect, renderedProps);
}
export function CalendarYearSelect({ children, ...props }: ComponentProps<typeof parts.YearSelect>) {
  const renderedProps: ComponentProps<typeof parts.YearSelect> = {
    ...props,
    onChange: props.onChange ?? (() => undefined),
    children:
      children ??
      ((state) =>
        state.options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))),
  };
  return createElement(parts.YearSelect, renderedProps);
}
export type * from '@ui-sdk/core/calendar';
