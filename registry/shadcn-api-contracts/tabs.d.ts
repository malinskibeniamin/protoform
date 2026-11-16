import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import type { VariantProps } from 'class-variance-authority';

declare function Tabs({ className, orientation, ...props }: TabsPrimitive.Root.Props): import('react').JSX.Element;
declare const tabsListVariants: (
  props?: {
    variant?: 'line' | 'default' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function TabsList({
  className,
  variant,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>): import('react').JSX.Element;
declare function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props): import('react').JSX.Element;
declare function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props): import('react').JSX.Element;

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
