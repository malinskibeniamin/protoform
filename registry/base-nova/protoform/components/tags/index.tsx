'use client';

import { XIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button/index';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command/index';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/index';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

interface TagsContextType {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setValue?: ((value: string) => void) | undefined;
  setWidth?: ((width: number) => void) | undefined;
  value?: string | undefined;
  width?: number | undefined;
}
const TagsContext = createContext<TagsContextType>({
  onOpenChange: () => undefined,
  open: false,
  setValue: undefined,
  setWidth: undefined,
  value: undefined,
  width: undefined,
});

const useTagsContext = () => {
  const context = useContext(TagsContext);
  if (context === null) {
    throw new Error('useTagsContext must be used within a TagsProvider');
  }
  return context;
};

export type TagsProps = {
  value?: string | undefined;
  setValue?: ((value: string) => void) | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  children?: ReactNode;
  className?: string | undefined;
} & SharedProps;

export const Tags = ({
  value,
  setValue,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  className,
  testId,
}: TagsProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [width, setWidth] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);
  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;
  const contextValue = useMemo(
    () => ({ onOpenChange, open, setValue, setWidth, value, width }),
    [onOpenChange, open, setValue, value, width]
  );
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      const [firstEntry] = entries;
      if (firstEntry) {
        setWidth(firstEntry.contentRect.width);
      }
    });
    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  return (
    <TagsContext.Provider value={contextValue}>
      <Popover onOpenChange={onOpenChange} open={open}>
        <div className={cn('relative w-full', className)} data-testid={testId} ref={ref}>
          {children}
        </div>
      </Popover>
    </TagsContext.Provider>
  );
};
export type TagsTriggerProps = Omit<ComponentProps<typeof Button>, 'children'> & { children?: React.ReactNode } & {
  testId?: string | undefined;
};
export const TagsTrigger = ({ className, children, testId, ...props }: TagsTriggerProps) => (
  <PopoverTrigger
    render={
      <Button
        className={cn('h-auto w-full justify-between', className)}
        data-testid={testId}
        role="combobox"
        variant="outline"
        {...props}
      />
    }
  >
    <div className="flex flex-wrap items-center gap-1">
      {children}
      <span className="px-2 py-px text-muted-foreground">Select a tag…</span>
    </div>
  </PopoverTrigger>
);
export type TagsValueProps = ComponentProps<'span'> & { testId?: string | undefined };
export const TagsValue = ({
  className,
  children,
  onRemove,
  testId,
  ...props
}: TagsValueProps & { onRemove?: () => void }) => (
  <span
    className={cn(
      'm-0.5 inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted',
      className
    )}
    data-testid={testId}
    {...props}
  >
    <span className="leading-tight">{children}</span>
    {onRemove ? (
      <Button
        aria-label="Remove tag"
        className="cursor-pointer"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove?.();
        }}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <XIcon className="text-muted-foreground" size={12} />
      </Button>
    ) : null}
  </span>
);

export type TagsContentProps = Omit<ComponentProps<typeof PopoverContent>, 'children'> & { children?: React.ReactNode };
export const TagsContent = ({ className, children, ...props }: TagsContentProps) => {
  const { width } = useTagsContext();
  const widthStyle: NonNullable<TagsContentProps['style']> & { '--tags-width': string | undefined } = {
    '--tags-width': width === undefined ? undefined : `${width}px`,
  };
  return (
    <PopoverContent className={cn('w-(--tags-width) p-0', className)} style={widthStyle} {...props}>
      <Command>{children}</Command>
    </PopoverContent>
  );
};

export type TagsInputProps = ComponentProps<typeof CommandInput>;
export const TagsInput = ({ className, ...props }: TagsInputProps) => (
  <CommandInput className={cn('h-9', className)} {...props} />
);
export type TagsListProps = ComponentProps<typeof CommandList>;
export const TagsList = ({ className, ...props }: TagsListProps) => (
  <CommandList className={cn('max-h-[200px]', className)} {...props} />
);

export type TagsEmptyProps = ComponentProps<typeof CommandEmpty>;
export const TagsEmpty = ({ children, ...props }: TagsEmptyProps) => (
  <CommandEmpty {...props}>{children ?? 'No tags found.'}</CommandEmpty>
);

export type TagsGroupProps = ComponentProps<typeof CommandGroup>;
export const TagsGroup = CommandGroup;

export type TagsItemProps = ComponentProps<typeof CommandItem>;
export const TagsItem = ({ className, ...props }: TagsItemProps) => (
  <CommandItem className={cn('cursor-pointer items-center justify-between', className)} {...props} />
);
