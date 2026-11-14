'use client';
import {
  CalendarDay as CalendarDayPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarHeading as CalendarHeadingPrimitive,
  CalendarNext as CalendarNextPrimitive,
  CalendarPrevious as CalendarPreviousPrimitive,
  CalendarWeekday as CalendarWeekdayPrimitive,
  CalendarWeekdays as CalendarWeekdayPrimitives,
  CalendarWeeks as CalendarWeeksPrimitive,
  Calendar as SDKCalendar,
} from '@ui-sdk/react/calendar';
import type React from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarMonthSelect,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  CalendarYearSelect,
  createCalendarController,
} from '@ui-sdk/react/calendar';
export function Calendar({ className, children, ...props }: React.ComponentProps<typeof SDKCalendar>) {
  return (
    <SDKCalendar
      {...props}
      className={(state) =>
        cn(
          'w-fit rounded-lg border border-border bg-background p-3 text-sm',
          typeof className === 'function' ? className(state) : className
        )
      }
    >
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-2">
            <CalendarPreviousPrimitive aria-label="Previous month" className="size-8 rounded-md hover:bg-muted">
              ‹
            </CalendarPreviousPrimitive>
            <CalendarHeadingPrimitive className="font-medium" />
            <CalendarNextPrimitive aria-label="Next month" className="size-8 rounded-md hover:bg-muted">
              ›
            </CalendarNextPrimitive>
          </div>
          <CalendarGridPrimitive className="w-full border-collapse">
            <CalendarWeekdayPrimitives>
              {(index) => (
                <CalendarWeekdayPrimitive className="size-8 text-xs font-normal text-muted-foreground" index={index} />
              )}
            </CalendarWeekdayPrimitives>
            <CalendarWeeksPrimitive>
              {(cell) => (
                <CalendarDayPrimitive
                  className="size-8 cursor-pointer rounded-md text-center outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-outside:opacity-50 data-selected:bg-primary data-selected:text-primary-foreground data-unavailable:opacity-50"
                  value={cell.date}
                />
              )}
            </CalendarWeeksPrimitive>
          </CalendarGridPrimitive>
        </>
      )}
    </SDKCalendar>
  );
}
