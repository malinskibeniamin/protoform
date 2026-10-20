'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from 'motion/react';
import React from 'react';

import type { GroupContextValue, GroupPosition } from '@/components/ui/group';
import { splitMotionProps } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const DEFAULT_TRANSITION = { bounce: 0, damping: 25, stiffness: 200, type: 'spring' } satisfies Transition;

type Orientation = 'horizontal' | 'vertical';

interface HighlightBounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition hover:bg-muted hover:text-muted-foreground focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-primary/15 data-[state=on]:text-primary dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        sm: 'h-8 min-w-8 px-1.5',
      },
      type: {
        multiple: 'data-[state=on]:bg-primary/15',
        single: '',
      },
      variant: {
        default: 'bg-transparent',
        outline: 'bg-transparent hover:bg-muted hover:text-muted-foreground',
      },
    },
  }
);

function getPositionClasses(attached: boolean, position: GroupPosition | undefined, orientation: Orientation) {
  if (!(attached && position)) {
    return 'rounded-md';
  }
  if (orientation === 'vertical') {
    if (position === 'first') {
      return 'rounded-t-md rounded-b-none';
    }
    if (position === 'last') {
      return 'rounded-b-md rounded-t-none';
    }
    return 'rounded-none';
  }
  if (position === 'first') {
    return 'rounded-r-none rounded-l-md';
  }
  if (position === 'last') {
    return 'rounded-r-md rounded-l-none';
  }
  return 'rounded-none';
}

type RegisterItem = (value: string, el: HTMLButtonElement | null) => void;

type ToggleGroupContextProps = VariantProps<typeof toggleVariants> &
  GroupContextValue & {
    type?: 'single' | 'multiple' | undefined;
    orientation: Orientation;
    registerItem: RegisterItem;
  };

const registerUnattachedItem: RegisterItem = () => undefined;
const ToggleGroupContext = React.createContext<ToggleGroupContextProps>({
  attached: false,
  orientation: 'horizontal',
  registerItem: registerUnattachedItem,
  size: 'default',
  variant: 'default',
});
const useToggleGroup = () => React.useContext(ToggleGroupContext);

function ToggleGroupItemContext({
  attached,
  children,
  orientation,
  position,
  registerItem,
  size,
  type,
  variant,
}: ToggleGroupContextProps & { children: React.ReactNode }) {
  const value = React.useMemo<ToggleGroupContextProps>(
    () => ({ attached, orientation, position, registerItem, size, type, variant }),
    [attached, orientation, position, registerItem, size, type, variant]
  );
  return <ToggleGroupContext.Provider value={value}>{children}</ToggleGroupContext.Provider>;
}

type ToggleGroupBaseProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  'value' | 'defaultValue' | 'onValueChange' | 'multiple'
> &
  Omit<VariantProps<typeof toggleVariants>, 'type'> &
  SharedProps & {
    transition?: Transition;
    activeClassName?: string;
    attached?: boolean;
  };

type ToggleGroupSingleProps = ToggleGroupBaseProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
} & ({ type: 'single' } | { type?: 'single'; value: string } | { type?: 'single'; defaultValue: string });

type ToggleGroupMultipleProps = ToggleGroupBaseProps & {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type LegacyToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;
type ShadcnToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive> &
  Omit<VariantProps<typeof toggleVariants>, 'type'> &
  SharedProps & { type?: never; spacing?: number; orientation?: Orientation };
type ToggleGroupProps = LegacyToggleGroupProps | ShadcnToggleGroupProps;

function OfficialToggleGroup({
  className,
  children,
  size,
  variant,
  spacing = 2,
  orientation = 'horizontal',
  testId,
  style,
  render,
  ...props
}: ShadcnToggleGroupProps) {
  const context: ToggleGroupContextProps = {
    attached: spacing === 0,
    orientation,
    position: undefined,
    registerItem: registerUnattachedItem,
    size,
    variant,
  };
  return (
    <ToggleGroupPrimitive
      {...props}
      className={(state) =>
        cn(
          'group/toggle-group flex w-fit items-center gap-(--toggle-gap)',
          orientation === 'vertical' && 'flex-col',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="toggle-group"
      data-spacing={spacing}
      data-testid={testId}
      orientation={orientation}
      render={render ?? <div style={{ '--toggle-gap': `${spacing * 0.25}rem` } as React.CSSProperties} />}
      style={style}
    >
      <ToggleGroupItemContext {...context}>{children}</ToggleGroupItemContext>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroup(props: ToggleGroupProps) {
  if (props.type !== undefined || typeof props.value === 'string' || typeof props.defaultValue === 'string') {
    return <LegacyToggleGroup {...(props as LegacyToggleGroupProps)} />;
  }
  return <OfficialToggleGroup {...(props as ShadcnToggleGroupProps)} />;
}

function toValueArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) {
    return;
  }
  return Array.isArray(v) ? v : [v];
}

function LegacyToggleGroup({
  className,
  variant,
  size,
  children,
  transition = DEFAULT_TRANSITION,
  activeClassName,
  testId,
  attached = true,
  type,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  ...props
}: LegacyToggleGroupProps) {
  'use no memo';

  const isMultiple = type === 'multiple';
  const isHorizontal = orientation !== 'vertical';

  const [internalActive, setInternalActive] = React.useState<string | undefined>(
    typeof defaultValue === 'string' ? defaultValue : undefined
  );
  const activeValue = isMultiple ? undefined : (value ?? internalActive);
  const hasActiveValue = Boolean(activeValue);

  const handleValueChange = React.useCallback(
    (groupValue: unknown[]) => {
      if (isMultiple) {
        onValueChange?.(groupValue as string[]);
        return;
      }
      const next = (groupValue[0] as string | undefined) ?? '';
      setInternalActive(next || undefined);
      onValueChange?.(next);
    },
    [isMultiple, onValueChange]
  );

  const childrenArray = React.Children.toArray(children).filter((child) => React.isValidElement(child));
  const childCount = childrenArray.length;

  const groupRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerItem = React.useCallback<RegisterItem>((itemValue, el) => {
    const map = itemsRef.current;
    if (el) {
      map.set(itemValue, el);
    } else {
      map.delete(itemValue);
    }
  }, []);

  const [bounds, setBounds] = React.useState<HighlightBounds | null>(null);

  React.useLayoutEffect(() => {
    if (isMultiple || !hasActiveValue) {
      setBounds(null);
      return;
    }

    const measure = () => {
      const el = itemsRef.current.get(activeValue ?? '');
      if (!el) {
        setBounds(null);
        return;
      }
      setBounds((prev) => {
        const next = { height: el.offsetHeight, left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth };
        if (
          prev &&
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.height === next.height
        ) {
          return prev;
        }
        return next;
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (groupRef.current) {
      ro.observe(groupRef.current);
    }
    const activeEl = itemsRef.current.get(activeValue ?? '');
    if (activeEl) {
      ro.observe(activeEl);
    }
    return () => ro.disconnect();
  }, [activeValue, hasActiveValue, isMultiple]);

  const axisLockedTransition: Transition = React.useMemo(() => {
    const snap = { duration: 0 } as const;
    return isHorizontal ? { ...transition, height: snap, top: snap } : { ...transition, left: snap, width: snap };
  }, [transition, isHorizontal]);

  const getPosition = (index: number): GroupPosition | undefined => {
    if (attached !== true || childCount === 1) {
      return;
    }
    if (index === 0) {
      return 'first';
    }
    if (index === childCount - 1) {
      return 'last';
    }
    return 'middle';
  };

  const activeIndex = hasActiveValue
    ? childrenArray.findIndex(
        (child) => React.isValidElement(child) && (child.props as { value?: unknown }).value === activeValue
      )
    : -1;
  const highlightPositionClasses = getPositionClasses(
    attached,
    activeIndex >= 0 ? getPosition(activeIndex) : undefined,
    orientation
  );

  return (
    <ToggleGroupPrimitive
      className={(state) =>
        cn(
          'relative flex items-center justify-center',
          !isHorizontal && 'flex-col',
          !isHorizontal && attached === true && 'items-stretch',
          variant === 'outline' && '!border-primary-foreground rounded-md border p-0.5',
          attached !== true && 'gap-1',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-attached={attached === true ? true : undefined}
      data-slot="toggle-group"
      data-testid={testId}
      data-variant={variant}
      defaultValue={toValueArray(defaultValue)}
      multiple={isMultiple}
      onValueChange={handleValueChange}
      orientation={orientation}
      ref={groupRef}
      role={isMultiple ? undefined : 'radiogroup'}
      value={toValueArray(value)}
      {...props}
    >
      <AnimatePresence initial={false}>
        {!isMultiple && bounds ? (
          <motion.div
            animate={{ height: bounds.height, left: bounds.left, opacity: 1, top: bounds.top, width: bounds.width }}
            aria-hidden
            className={cn('pointer-events-none absolute z-0 bg-accent', highlightPositionClasses, activeClassName)}
            data-slot="toggle-group-highlight"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            initial={false}
            transition={axisLockedTransition}
          />
        ) : null}
      </AnimatePresence>
      {childrenArray.map((child, index) => {
        const element = child as React.ReactElement;
        return (
          <ToggleGroupItemContext
            attached={attached}
            key={element.key === null || element.key === '' ? `toggle-group-item-${index}` : element.key}
            orientation={orientation}
            position={getPosition(index)}
            registerItem={registerItem}
            size={size}
            type={type}
            variant={variant}
          >
            {child}
          </ToggleGroupItemContext>
        );
      })}
    </ToggleGroupPrimitive>
  );
}

type ToggleGroupItemProps = React.ComponentProps<typeof TogglePrimitive> &
  Omit<VariantProps<typeof toggleVariants>, 'type'> &
  SharedProps & {
    value?: string | undefined;
    children?: React.ReactNode;
    buttonProps?: HTMLMotionProps<'button'>;
    spanProps?: React.ComponentProps<'span'>;
  };

function ToggleGroupNativeButton({
  ref,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & { 'data-state'?: 'on' | 'off' }) {
  return useRender({ defaultTagName: 'button', ref, props: { ...props, type } });
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  (
    {
      className,
      children,
      variant,
      size,
      buttonProps,
      spanProps,
      testId,
      disabled,
      value: suppliedValue,
      render,
      nativeButton,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const value = suppliedValue ?? id;
    const {
      type,
      variant: contextVariant,
      size: contextSize,
      attached,
      position,
      orientation,
      registerItem,
    } = useToggleGroup();

    const positionClasses = getPositionClasses(attached, position, orientation);
    const isVerticalAttached = orientation === 'vertical' && attached;
    const isSingle = type === 'single';

    const setRef = React.useCallback(
      (el: HTMLButtonElement | null) => {
        registerItem(value, el);
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      },
      [registerItem, value, ref]
    );

    const { className: buttonClassName, style: buttonStyle, value: _buttonValue, ...buttonOptions } = buttonProps ?? {};
    const separated = splitMotionProps(buttonOptions, false);
    const renderRoot: NonNullable<React.ComponentProps<typeof TogglePrimitive>['render']> = (rootProps, state) => {
      const requestedType: unknown = Reflect.get(rootProps, 'type');
      const buttonType = requestedType === 'submit' || requestedType === 'reset' ? requestedType : 'button';
      return React.createElement(ToggleGroupNativeButton, {
        ...rootProps,
        type: buttonType,
        'aria-checked': isSingle ? state.pressed : undefined,
        'aria-pressed': isSingle ? undefined : state.pressed,
        'data-state': state.pressed ? 'on' : 'off',
      });
    };
    return (
      <TogglePrimitive
        {...mergeProps<typeof TogglePrimitive>(separated.native, props)}
        className={(state) =>
          cn(
            'relative',
            buttonClassName,
            toggleVariants({ size: size || contextSize, type, variant: variant || contextVariant }),
            positionClasses,
            isVerticalAttached && 'w-full',
            typeof className === 'function' ? className(state) : className
          )
        }
        data-slot="toggle-group-item"
        data-testid={testId}
        disabled={disabled ?? buttonOptions.disabled}
        nativeButton={nativeButton ?? render === undefined}
        ref={setRef}
        render={render ?? renderRoot}
        role={isSingle ? 'radio' : undefined}
        value={value}
      >
        <motion.span
          initial={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          {...separated.motion}
          {...(buttonStyle === undefined ? {} : { style: buttonStyle })}
          className={cn('relative z-[1]', isVerticalAttached && 'w-full')}
        >
          <span {...spanProps} className={cn(isVerticalAttached && 'w-full', spanProps?.className)}>
            {children}
          </span>
        </motion.span>
      </TogglePrimitive>
    );
  }
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem, type ToggleGroupItemProps, type ToggleGroupProps };
