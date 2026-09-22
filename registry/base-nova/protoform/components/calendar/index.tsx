"use client";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { type DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

function CalendarRoot({
  className,
  rootRef,
  ...props
}: React.ComponentProps<"div"> & { rootRef?: React.Ref<HTMLDivElement> }) {
  return <div className={cn(className)} data-slot="calendar" ref={rootRef} {...props} />;
}

function CalendarChevron({
  className,
  orientation,
  ...props
}: {
  className?: string;
  orientation?: "left" | "right" | "down" | "up";
}) {
  if (orientation === "left") {
    return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
  }

  if (orientation === "right") {
    return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
  }

  return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
}

function CalendarWeekNumber({ children, ...props }: React.ComponentProps<"td">) {
  return (
    <td {...props}>
      <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
    </td>
  );
}

const CalendarRootWithTestId = React.memo(
  ({ testId, ...props }: React.ComponentProps<typeof CalendarRoot> & { testId?: string | undefined }) => (
    <CalendarRoot {...props} data-testid={testId} />
  )
);

CalendarRootWithTestId.displayName = "CalendarRootWithTestId";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  testId,
  ...props
}: React.ComponentProps<typeof DayPicker> &
  SharedProps & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  }) {
  "use no memo";

  const defaultClassNames = getDefaultClassNames();

  const rootComponent = React.useMemo(
    () =>
      Object.assign(
        ({ ref, ...rootProps }: React.ComponentProps<typeof CalendarRoot> & { ref?: React.Ref<HTMLDivElement> }) => (
          <CalendarRootWithTestId {...rootProps} rootRef={ref ?? null} testId={testId} />
        ),
        { displayName: "CalendarRootComponent" }
      ),
    [testId]
  );

  return (
    <DayPicker
      captionLayout={captionLayout}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      classNames={{
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        day: cn(
          "group/day relative aspect-square size-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        dropdown_root: cn(
          "!border-input relative rounded-md border shadow-xs has-focus:border-ring has-focus:ring-3 has-focus:ring-ring/50",
          defaultClassNames.dropdown_root
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 font-medium text-sm",
          defaultClassNames.dropdowns
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        root: cn("w-fit", defaultClassNames.root),
        today: cn(
          "rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number: cn("select-none text-muted-foreground text-xs", defaultClassNames.week_number),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        weekday: cn(
          "flex-1 select-none rounded-md font-normal text-muted-foreground text-xs",
          defaultClassNames.weekday
        ),
        weekdays: cn("flex", defaultClassNames.weekdays),
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        Root: rootComponent,
        WeekNumber: CalendarWeekNumber,
        ...components,
      }}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const isFocused = modifiers["focused"];

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(
    function focusActiveDay() {
      if (isFocused) {
        ref.current?.focus();
      }
    },
    [isFocused]
  );

  return (
    <Button
      className={cn(className)}
      data-day={day.date.toLocaleDateString()}
      data-range-end={modifiers["range_end"]}
      data-range-middle={modifiers["range_middle"]}
      data-range-start={modifiers["range_start"]}
      data-selected-single={
        modifiers["selected"] && !modifiers["range_start"] && !modifiers["range_end"] && !modifiers["range_middle"]
      }
      ref={ref}
      size="icon"
      variant="calendar"
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
