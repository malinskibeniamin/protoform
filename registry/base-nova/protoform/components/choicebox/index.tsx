import { RadioIndicator, Radio as RadioPrimitive } from '@ui-sdk/react/radio';
import { Circle } from 'lucide-react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { type ComponentProps, forwardRef, type HTMLAttributes } from 'react';

import { Card, CardContent, CardDescription, CardHeader, type CardProps, CardTitle } from '@/components/ui/card/index';
import { RadioGroup } from '@/components/ui/radio-group/index';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const DEFAULT_TRANSITION = { damping: 16, stiffness: 200, type: 'spring' } satisfies Transition;

export type ChoiceboxProps = ComponentProps<typeof RadioGroup> & SharedProps;

export const Choicebox = ({ className, testId, ...props }: ChoiceboxProps) => (
  <RadioGroup className={cn('w-full', className)} data-testid={testId ?? props['data-testid']} {...props} />
);

export type ChoiceboxItemProps = ComponentProps<typeof RadioPrimitive> & SharedProps & Partial<Pick<CardProps, 'size'>>;

export const ChoiceboxItem = forwardRef<HTMLButtonElement, ChoiceboxItemProps>(
  ({ className, children, testId, size, ...props }, ref) => (
    <RadioPrimitive {...props} className="group" ref={ref}>
      {(state) => (
        <Card
          className={cn('flex cursor-pointer flex-row items-start justify-between text-left', className)}
          data-testid={testId ?? props['data-testid']}
          size={size}
          variant="choice"
        >
          {[children].map((content) => (typeof content === 'function' ? content(state) : content))}
        </Card>
      )}
    </RadioPrimitive>
  )
);

ChoiceboxItem.displayName = 'ChoiceboxItem';

export type ChoiceboxItemHeaderProps = ComponentProps<typeof CardHeader>;

export const ChoiceboxItemHeader = ({ className, ...props }: ComponentProps<typeof CardHeader>) => (
  <CardHeader className={cn('flex-1', className)} {...props} />
);

export type ChoiceboxItemTitleProps = ComponentProps<typeof CardTitle>;

export const ChoiceboxItemTitle = ({ className, ...props }: ChoiceboxItemTitleProps) => (
  <CardTitle className={cn('flex items-center', className)} spacing="loose" {...props} />
);

export type ChoiceboxItemSubtitleProps = HTMLAttributes<HTMLSpanElement>;

export const ChoiceboxItemSubtitle = ({ className, ...props }: ChoiceboxItemSubtitleProps) => (
  <span className={cn('text-xs font-normal text-muted-foreground', className)} {...props} />
);

export type ChoiceboxItemDescriptionProps = ComponentProps<typeof CardDescription>;

export const ChoiceboxItemDescription = ({ className, ...props }: ChoiceboxItemDescriptionProps) => (
  <CardDescription className={className} {...props} />
);

export type ChoiceboxItemContentProps = ComponentProps<typeof CardContent>;

export const ChoiceboxItemContent = ({ className, ...props }: ChoiceboxItemContentProps) => (
  <CardContent className={className} variant="selection-indicator" {...props} />
);

export type ChoiceboxItemIndicatorProps = ComponentProps<typeof RadioIndicator> & {
  transition?: Transition;
};

export const ChoiceboxItemIndicator = ({
  className,
  transition = DEFAULT_TRANSITION,
  ...props
}: ChoiceboxItemIndicatorProps) => (
  <RadioIndicator
    className={cn('flex items-center justify-center data-[unchecked]:hidden', className)}
    data-slot="radio-group-indicator"
    {...props}
  >
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        data-slot="radio-group-indicator-circle"
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.95 }}
        key="radio-group-indicator-circle"
        transition={transition}
      >
        <Circle className="size-2.5 fill-current text-current" />
      </motion.div>
    </AnimatePresence>
  </RadioIndicator>
);
