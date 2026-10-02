import React from 'react';

type HTMLPropsCompat<T = Element> = React.HTMLAttributes<T> & {
  ref?: React.Ref<T> | undefined;
};

type ComponentRenderFnCompat<Props, State> = (props: Props, state: State) => React.ReactElement<unknown>;

interface AsChildInput {
  asChild?: boolean | undefined;
  children?: React.ReactNode | undefined;
}

export function asChildToRender<P extends AsChildInput>(props: P): Omit<P, 'asChild'> {
  const { asChild, children, ...rest } = props;
  if (asChild && React.isValidElement(children)) {
    return { ...rest, render: children } as unknown as Omit<P, 'asChild'>;
  }
  return { ...rest, children } as Omit<P, 'asChild'>;
}

function compatStateAttrs(state: CompatState | undefined): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (state && typeof state.open === 'boolean') {
    attrs['data-state'] = state.open ? 'open' : 'closed';
  }
  if (state && state.checked !== undefined) {
    if (state.checked === 'indeterminate') {
      attrs['data-state'] = 'indeterminate';
    } else if (typeof state.checked === 'boolean') {
      attrs['data-state'] = state.checked ? 'checked' : 'unchecked';
    }
  }
  if (state?.disabled) {
    attrs['data-disabled'] = '';
  }
  return attrs;
}

export function asChildTrigger<P extends AsChildInput>(props: P): Omit<P, 'asChild'> & { nativeButton?: boolean } {
  const base = asChildToRender(props);
  if (!props.asChild) {
    return base;
  }
  const child = props.children;
  if (!React.isValidElement(child)) {
    return base;
  }
  if (rendersNonButton(child)) {
    return { ...base, nativeButton: false };
  }
  return base;
}

function rendersNonButton(element: React.ReactElement): boolean {
  if (typeof element.type === 'string') {
    return element.type !== 'button';
  }
  const props = (element.props ?? {}) as { asChild?: boolean; children?: React.ReactNode };
  if (!props.asChild) {
    return false;
  }
  const inner = React.Children.count(props.children) === 1 ? React.Children.only(props.children) : null;
  return React.isValidElement(inner) ? rendersNonButton(inner) : false;
}

export interface CompatState {
  checked?: boolean | 'indeterminate';
  disabled?: boolean;
  open?: boolean;
}

export function renderWithDataState<S extends CompatState = CompatState>(
  Element: keyof React.JSX.IntrinsicElements = 'div'
): ComponentRenderFnCompat<HTMLPropsCompat, S> {
  return function renderDataState(props, state) {
    return React.createElement(Element, { ...props, ...compatStateAttrs(state) });
  };
}

export function narrowOpenChange<Details>(
  handler: ((open: boolean) => void) | undefined
): ((open: boolean, details: Details) => void) | undefined {
  if (!handler) {
    return;
  }
  return (open: boolean) => {
    handler(open);
  };
}

export function narrowCallback<Value, Details>(
  handler: ((value: Value) => void) | undefined
): ((value: Value, details: Details) => void) | undefined {
  if (!handler) {
    return;
  }
  return (value: Value) => {
    handler(value);
  };
}

export type BaseUIMouseEvent<T = HTMLElement> = React.MouseEvent<T> & {
  preventBaseUIHandler: () => void;
  readonly baseUIHandlerPrevented?: boolean | undefined;
};

export function useMirroredOpen(
  controlledOpen: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined
): { isOpen: boolean; handleOpenChange: (open: boolean) => void } {
  const [isOpen, setIsOpen] = React.useState<boolean>(controlledOpen ?? defaultOpen ?? false);

  React.useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  return { handleOpenChange, isOpen };
}

interface DescriptionRenderProps {
  asChild?: boolean | undefined;
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  dataSlot?: string | undefined;
  fallbackClassName?: string | undefined;
}

export function renderDescription({
  asChild,
  children,
  className,
  fallbackClassName = 'text-muted-foreground text-sm',
  dataSlot,
}: DescriptionRenderProps): React.ReactElement {
  if (asChild && React.isValidElement<{ 'data-slot'?: string }>(children)) {
    if (!dataSlot) {
      return children;
    }
    if (children.props['data-slot']) {
      return children;
    }
    return React.cloneElement(children, { 'data-slot': dataSlot });
  }
  const mergedClassName = [fallbackClassName, className].filter(Boolean).join(' ');
  return <div className={mergedClassName}>{children}</div>;
}

const warnedKeys = new Set<string>();

function isProductionRuntime(): boolean {
  const processValue = Reflect.get(globalThis, 'process');
  if (!(typeof processValue === 'object' && processValue !== null)) {
    return false;
  }
  const environment = Reflect.get(processValue, 'env');
  return (
    typeof environment === 'object' && environment !== null && Reflect.get(environment, 'NODE_ENV') === 'production'
  );
}

export function devWarnOnce(key: string, _message: string): void {
  if (isProductionRuntime()) {
    return;
  }
  if (warnedKeys.has(key)) {
    return;
  }
  warnedKeys.add(key);
}

export function resetDevWarnings(): void {
  warnedKeys.clear();
}

export function warnDeprecatedProp(component: string, prop: string, value: unknown, guidance: string): void {
  if (value === undefined) {
    return;
  }
  devWarnOnce(
    `${component}:${prop}`,
    `<${component}> \`${prop}\` is a Radix-compat shim scheduled for removal. ${guidance}`
  );
}

export function resolveKeepMounted(
  component: string,
  forceMount: boolean | undefined,
  keepMounted: boolean | undefined
): boolean | undefined {
  if (forceMount) {
    warnDeprecatedProp(
      component,
      'forceMount',
      forceMount,
      'Use `keepMounted` on the underlying Portal instead (already forwarded by this component).'
    );
    return true;
  }
  return keepMounted;
}

type SlotProps = {
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

type SlotElement = React.ReactElement & { ref?: React.Ref<HTMLElement> };

type EventHandler = (...args: unknown[]) => unknown;
const EVENT_HANDLER_KEY_PATTERN = /^on[A-Z]/u;

function isEventHandlerKey(key: string): boolean {
  return EVENT_HANDLER_KEY_PATTERN.test(key);
}

function readHandler(source: object, key: string): EventHandler | undefined {
  const value = Reflect.get(source, key);
  return typeof value === 'function' ? (value as EventHandler) : undefined;
}

function readString(source: object, key: string): string | undefined {
  const value = Reflect.get(source, key);
  return typeof value === 'string' ? value : undefined;
}

function readStyle(source: object): React.CSSProperties | undefined {
  const value = Reflect.get(source, 'style');
  return value && typeof value === 'object' ? (value as React.CSSProperties) : undefined;
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        ref(value);
      } else {
        (ref as React.RefObject<T>).current = value;
      }
    }
  };
}

function getElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  const refFromProps = Reflect.get(element.props as object, 'ref');
  if (refFromProps !== undefined) {
    return refFromProps as React.Ref<unknown>;
  }
  return (element as SlotElement).ref;
}

function mergeSlotProps(slotProps: object, childProps: object): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps };

  const slotClass = readString(slotProps, 'className');
  const childClass = readString(childProps, 'className');
  if (slotClass || childClass) {
    merged['className'] = [slotClass, childClass].filter(Boolean).join(' ');
  }

  const slotStyle = readStyle(slotProps);
  const childStyle = readStyle(childProps);
  if (slotStyle || childStyle) {
    merged['style'] = { ...(slotStyle ?? {}), ...(childStyle ?? {}) };
  }

  for (const key of Object.keys(slotProps)) {
    if (!isEventHandlerKey(key)) {
      continue;
    }
    const slotHandler = readHandler(slotProps, key);
    const childHandler = readHandler(childProps, key);
    if (slotHandler && childHandler) {
      merged[key] = (...args: unknown[]) => {
        const result = childHandler(...args);
        slotHandler(...args);
        return result;
      };
    } else if (slotHandler) {
      merged[key] = slotHandler;
    }
  }

  return merged;
}

type SlotCloneProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

const SlotClone = React.forwardRef<HTMLElement, SlotCloneProps>(function renderSlotClone(props, forwardedRef) {
  const { children, ...slotProps } = props;

  if (!React.isValidElement(children)) {
    if (React.Children.count(children) > 1) {
      return React.Children.only(null);
    }
    return null;
  }

  const element = children as SlotElement;
  const childProps = element.props as object;
  const merged = mergeSlotProps(slotProps, childProps);
  const childRef = getElementRef(element) as React.Ref<HTMLElement> | undefined;
  merged['ref'] = forwardedRef ? composeRefs(forwardedRef, childRef) : childRef;
  return React.cloneElement(element, merged);
});

const SLOTTABLE_IDENTIFIER = Symbol.for('protoform.slottable');

type SlottableComponent = React.FC<{ children: React.ReactNode }> & { __slottableId: symbol };

export const Slottable: SlottableComponent = Object.assign(
  function renderSlottable({ children }: { children: React.ReactNode }) {
    return children;
  },
  { __slottableId: SLOTTABLE_IDENTIFIER }
);
Slottable.displayName = 'Slottable';

function isSlottable(child: React.ReactNode): child is React.ReactElement<{ children: React.ReactNode }> {
  if (!React.isValidElement(child)) {
    return false;
  }
  const type = child.type as { __slottableId?: symbol } | string;
  return typeof type !== 'string' && type.__slottableId === SLOTTABLE_IDENTIFIER;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(function renderSlot(props, forwardedRef) {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    const target = slottable.props.children;
    const siblings = childrenArray.map((child) => {
      if (child !== slottable) {
        return child;
      }
      if (React.Children.count(target) > 1) {
        return React.Children.only(null);
      }
      return React.isValidElement<{ children?: React.ReactNode }>(target) ? target.props.children : null;
    });

    return (
      <SlotClone {...slotProps} ref={forwardedRef}>
        {React.isValidElement(target) ? React.cloneElement(target, undefined, siblings) : null}
      </SlotClone>
    );
  }

  return (
    <SlotClone {...slotProps} ref={forwardedRef}>
      {children}
    </SlotClone>
  );
});
Slot.displayName = 'Slot';
