'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AnimatePresence,
  type HTMLMotionProps,
  MotionConfigContext,
  motion,
  type Transition,
  useReducedMotion,
} from 'motion/react';
import React from 'react';

import { splitMotionProps } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const DEFAULT_TRANSITION = {
  damping: 25,
  stiffness: 200,
  type: 'spring',
} satisfies Transition;

const DEFAULT_PANEL_TRANSITION = {
  duration: 0.5,
  ease: 'easeInOut',
} satisfies Transition;

interface HighlightBounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

function boundsEqual(a: HighlightBounds | null, b: HighlightBounds | null): boolean {
  if (a === b) {
    return true;
  }
  if (!(a && b)) {
    return false;
  }
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

type TabsRenderProp = React.ComponentProps<typeof TabsPrimitive.Tab>['render'];
type TabsRenderFn = Extract<NonNullable<TabsRenderProp>, (...args: never[]) => React.ReactElement>;

function dataStateFromBaseUi(state: { active?: boolean; hidden?: boolean }): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  if (typeof state.active === 'boolean') {
    attrs['data-state'] = state.active === true ? 'active' : 'inactive';
  } else if (typeof state.hidden === 'boolean') {
    attrs['data-state'] = state.hidden === true ? 'inactive' : 'active';
  }
  return attrs;
}

function renderTabWithActiveState(Element: 'button' | 'div', userRender?: TabsRenderProp): TabsRenderFn {
  const render: TabsRenderFn = (props, state) => {
    const mergedProps = { ...props, ...dataStateFromBaseUi(state) };
    if (userRender === null) {
      return React.createElement(Element as string, mergedProps);
    }
    if (React.isValidElement(userRender)) {
      return React.cloneElement(userRender, mergedProps);
    }
    if (typeof userRender === 'function') {
      return userRender(mergedProps, state);
    }
    return React.createElement(Element as string, mergedProps);
  };
  return render;
}

const tabsVariants = cva('flex flex-col', {
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
  variants: {
    size: {
      full: 'w-full gap-2',
      lg: 'gap-3',
      md: 'gap-2',
      sm: 'gap-1',
      xl: 'gap-4',
    },
    variant: {
      card: 'rounded-xl border bg-card',
      contained: 'rounded-lg bg-muted',
      default: '',
    },
  },
});

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & VariantProps<typeof tabsVariants> & SharedProps;

function Tabs({ className, size, variant, testId, onValueChange, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={(state) =>
        cn(tabsVariants({ size, variant }), typeof className === 'function' ? className(state) : className)
      }
      data-slot="tabs"
      data-testid={testId}
      onValueChange={onValueChange}
      {...props}
    />
  );
}

const tabsListVariants = cva('inline-flex h-10 items-center justify-center text-muted-foreground', {
  defaultVariants: {
    gap: 'none',
    layout: 'auto',
    variant: 'default',
  },
  variants: {
    gap: {
      lg: 'gap-3',
      md: 'gap-2',
      none: '',
      sm: 'gap-1',
    },
    layout: {
      auto: '',
      equal: 'grid',
      full: 'w-full',
    },
    variant: {
      default: 'w-fit gap-1 rounded-lg bg-muted p-1',
      line: 'gap-1 bg-transparent',
      underline: 'relative w-full justify-start rounded-t-xl border-b !border-border bg-background py-0 text-current',
    },
  },
});

const tabsListActiveVariants = cva('rounded-sm bg-background shadow-sm', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: '',
      line: 'gap-1 bg-transparent',
      underline:
        "rounded-none bg-transparent shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-full after:bg-selected after:content-['']",
    },
  },
});

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> &
  SharedProps & {
    activeClassName?: string;
    transition?: Transition;
    columns?: number;
  };

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      children,
      className,
      activeClassName,
      variant,
      layout,
      gap,
      columns,
      testId,
      style,
      transition = DEFAULT_TRANSITION,
      ...props
    },
    ref
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current ?? document.createElement('div'));

    const [bounds, setBounds] = React.useState<HighlightBounds | null>(null);
    const [orientation, setOrientation] = React.useState<'horizontal' | 'vertical'>('horizontal');

    const syncHighlight = React.useCallback(() => {
      const list = localRef.current;
      if (!list) {
        return;
      }
      const activeTab = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]');
      const nextOrientation = (list.dataset['orientation'] as 'horizontal' | 'vertical' | null) ?? 'horizontal';
      setOrientation((prev) => (prev === nextOrientation ? prev : nextOrientation));

      if (!activeTab) {
        setBounds((prev) => (prev === null ? prev : null));
        return;
      }

      const nextBounds: HighlightBounds = {
        height: activeTab.offsetHeight,
        left: activeTab.offsetLeft,
        top: activeTab.offsetTop,
        width: activeTab.offsetWidth,
      };
      setBounds((prev) => (boundsEqual(prev, nextBounds) ? prev : nextBounds));
    }, []);

    React.useLayoutEffect(() => {
      const list = localRef.current;
      if (!list) {
        return;
      }

      syncHighlight();

      let rafId = 0;
      const scheduleSync = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(syncHighlight);
      };

      const mutationObserver = new MutationObserver(scheduleSync);
      mutationObserver.observe(list, {
        attributeFilter: ['data-state', 'data-orientation', 'data-value'],
        attributes: true,
        childList: true,
        subtree: true,
      });

      const resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(list);
      for (const tab of list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')) {
        resizeObserver.observe(tab);
      }

      return () => {
        cancelAnimationFrame(rafId);
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      };
    }, [syncHighlight]);

    const isHorizontal = orientation !== 'vertical';
    const axisLockedTransition: Transition = React.useMemo(() => {
      const snap = { duration: 0 } as const;
      return isHorizontal ? { ...transition, height: snap, top: snap } : { ...transition, left: snap, width: snap };
    }, [transition, isHorizontal]);

    const showHighlight = bounds !== null;
    React.useLayoutEffect(
      function synchronizeColumnCount() {
        const list = localRef.current;
        if (typeof style === 'object' && Reflect.has(style, '--tabs-columns')) {
          return;
        }
        if (list !== null && (list.dataset['orientation'] ?? 'horizontal') !== orientation) {
          return;
        }
        if (list === null || columns === undefined || list.style.getPropertyValue('--tabs-columns') !== '') {
          return;
        }
        const value = String(columns);
        list.style.setProperty('--tabs-columns', value);
        return () => {
          if (list.style.getPropertyValue('--tabs-columns') === value) {
            list.style.removeProperty('--tabs-columns');
          }
        };
      },
      [columns, style, orientation]
    );

    return (
      <TabsPrimitive.List
        className={(state) =>
          cn(
            'relative',
            tabsListVariants({ gap, layout, variant }),
            layout === 'equal' &&
              columns !== undefined &&
              columns !== 0 &&
              'grid-cols-[repeat(var(--tabs-columns),minmax(0,1fr))]',
            typeof className === 'function' ? className(state) : className
          )
        }
        data-slot="tabs-list"
        data-testid={testId}
        ref={localRef}
        style={style}
        {...props}
      >
        <AnimatePresence initial={false}>
          {showHighlight ? (
            <motion.div
              animate={{
                height: bounds.height,
                left: bounds.left,
                opacity: 1,
                top: bounds.top,
                width: bounds.width,
              }}
              aria-hidden
              className={cn('pointer-events-none absolute z-0', tabsListActiveVariants({ variant }), activeClassName)}
              data-slot="tabs-list-highlight"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              initial={false}
              transition={axisLockedTransition}
            />
          ) : null}
        </AnimatePresence>
        {children}
      </TabsPrimitive.List>
    );
  }
);

TabsList.displayName = 'TabsList';

const tabsTriggerVariants = cva(
  'z-[1] inline-flex size-full cursor-pointer items-center justify-center rounded-sm text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'px-3 py-1.5',
        line: 'gap-1 bg-transparent',
        underline: 'px-4 py-2 text-muted-foreground data-[state=active]:text-selected',
      },
    },
  }
);

type TabsTriggerProps = Omit<React.ComponentProps<typeof TabsPrimitive.Tab>, 'render'> &
  SharedProps & {
    variant?: VariantProps<typeof tabsTriggerVariants>['variant'];
    render?: TabsRenderProp;
  };

function TabsTrigger({ className, value, variant, testId, disabled, render, ...props }: TabsTriggerProps) {
  const attributeValue: unknown = value;
  const nativeButton =
    React.isValidElement(render) && typeof render.type === 'string' && render.type !== 'button' ? false : undefined;

  return (
    <TabsPrimitive.Tab
      className={(state) =>
        cn(tabsTriggerVariants({ variant }), typeof className === 'function' ? className(state) : className)
      }
      data-slot="tabs-trigger"
      data-testid={testId}
      data-value={attributeValue}
      disabled={disabled}
      nativeButton={nativeButton}
      render={renderTabWithActiveState('button', render)}
      value={value}
      {...props}
    />
  );
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Panel> &
  Omit<HTMLMotionProps<'div'>, keyof React.ComponentProps<typeof TabsPrimitive.Panel>> &
  SharedProps & {
    transition?: Transition;
  };

function TabsContent({
  className,
  children,
  transition = DEFAULT_PANEL_TRANSITION,
  testId,
  render,
  ...props
}: TabsContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotionConfig = React.useContext(MotionConfigContext).reducedMotion;
  const separated = splitMotionProps(props);
  const shouldReduceMotion = reducedMotionConfig === 'always' || prefersReducedMotion;

  return (
    <TabsPrimitive.Panel
      className={(state) =>
        cn('flex-1 space-y-6 outline-none', typeof className === 'function' ? className(state) : className)
      }
      data-slot="tabs-content"
      data-testid={testId}
      render={render}
      {...separated.native}
    >
      <motion.div
        {...(shouldReduceMotion === true
          ? { initial: false, layout: false }
          : {
              animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
              exit: { filter: 'blur(4px)', opacity: 0, y: 10 },
              initial: { filter: 'blur(4px)', opacity: 0, y: -10 },
              layout: true,
              transition,
            })}
        {...separated.motion}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Panel>
  );
}

type TabsContentsProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  className?: string;
  transition?: Transition;
};

function TabsContents({ children, className, transition = DEFAULT_TRANSITION, ...props }: TabsContentsProps) {
  return (
    <motion.div
      className={cn('h-auto overflow-visible', className)}
      data-slot="tabs-contents"
      layout
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const tabsContentWrapperVariants = cva('', {
  defaultVariants: {
    spacing: 'md',
    variant: 'default',
  },
  variants: {
    spacing: {
      lg: 'space-y-6',
      md: 'space-y-4',
      none: '',
      sm: 'space-y-3',
    },
    variant: {
      card: 'p-6',
      contained: 'mx-1 -mt-2 mb-1 h-full rounded-sm bg-background p-6',
      default: '',
    },
  },
});

interface TabsContentWrapperProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof tabsContentWrapperVariants> {}

function TabsContentWrapper({ className, variant, spacing, ...props }: TabsContentWrapperProps) {
  return <div className={cn(tabsContentWrapperVariants({ spacing, variant }), className)} {...props} />;
}

const tabsFieldVariants = cva('flex flex-col', {
  defaultVariants: {
    spacing: 'normal',
  },
  variants: {
    spacing: {
      loose: 'space-y-2',
      normal: 'space-y-1.5',
      tight: 'space-y-1',
    },
  },
});

interface TabsFieldProps extends React.ComponentProps<'div'>, VariantProps<typeof tabsFieldVariants> {}

function TabsField({ className, spacing, ...props }: TabsFieldProps) {
  return <div className={cn(tabsFieldVariants({ spacing }), className)} {...props} />;
}

const tabsSectionVariants = cva('space-y-4', {
  defaultVariants: {
    spacing: 'lg',
  },
  variants: {
    spacing: {
      lg: 'space-y-4',
      md: 'space-y-3',
      none: 'space-y-0',
      sm: 'space-y-2',
      xl: 'space-y-6',
    },
  },
});

interface TabsSectionProps extends React.ComponentProps<'div'>, VariantProps<typeof tabsSectionVariants> {}

function TabsSection({ className, spacing, ...props }: TabsSectionProps) {
  return <div className={cn(tabsSectionVariants({ spacing }), className)} {...props} />;
}

export {
  Tabs,
  TabsContent,
  type TabsContentProps,
  TabsContents,
  type TabsContentsProps,
  TabsContentWrapper,
  TabsField,
  TabsList,
  type TabsListProps,
  type TabsProps,
  TabsSection,
  TabsTrigger,
  type TabsTriggerProps,
  tabsListVariants,
};
