'use client';

import { Link as TanStackLink } from '@tanstack/react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const headingVariants = cva('font-display font-medium leading-none tracking-tight', {
  defaultVariants: {
    align: 'left',
    level: 1,
  },
  variants: {
    align: {
      center: 'text-center',
      left: 'text-left',
      right: 'text-right',
    },
    level: {
      1: 'text-2xl',
      2: 'text-xl',
      3: 'text-lg',
      4: 'text-base',
      5: 'text-sm',
    },
  },
});

export const textVariants = cva('font-sans', {
  defaultVariants: {
    align: 'left',
    variant: 'body',
  },
  variants: {
    align: {
      center: 'text-center',
      left: 'text-left',
      right: 'text-right',
    },
    variant: {
      body: 'font-normal text-sm leading-6 tracking-tight',
      bodyLarge: 'font-normal text-base leading-6 tracking-tight',
      bodyMedium: 'font-normal text-sm leading-5 tracking-normal',
      bodySmall: 'font-normal text-xs leading-4 tracking-normal',
      bodyStrongLarge: 'font-medium text-base leading-6 tracking-tight',
      bodyStrongMedium: 'font-medium text-sm leading-5 tracking-normal',
      bodyStrongSmall: 'font-medium text-xs leading-4 tracking-normal',

      bodyStrongXLarge: 'font-medium text-lg leading-7 tracking-tight',

      bodyXLarge: 'font-normal text-lg leading-7 tracking-tight',

      buttonLarge: 'font-semibold text-lg leading-none tracking-tight',
      buttonMedium: 'font-semibold text-base leading-none tracking-normal',
      buttonSmall: 'font-semibold text-sm leading-none tracking-normal',
      buttonXSmall: 'font-semibold text-xs leading-none tracking-tight',

      captionMedium: 'font-normal text-xs leading-4 tracking-normal',
      captionSmall: 'font-normal text-xs leading-4 tracking-normal',

      captionStrongMedium: 'font-medium text-xs leading-4 tracking-normal',
      captionStrongSmall: 'font-medium text-xs leading-4 tracking-normal',
      label: 'font-semibold text-sm leading-5 tracking-normal',

      labelLarge: 'font-normal text-lg leading-6 tracking-normal',
      labelMedium: 'font-normal text-base leading-6 tracking-tight',
      labelSmall: 'font-normal text-sm leading-5 tracking-normal',

      labelStrongLarge: 'font-semibold text-lg leading-6 tracking-tight',
      labelStrongMedium: 'font-semibold text-base leading-6 tracking-tight',
      labelStrongSmall: 'font-semibold text-sm leading-5 tracking-normal',
      labelStrongXSmall: 'font-semibold text-xs leading-4 tracking-normal',
      labelXSmall: 'font-normal text-xs leading-4 tracking-normal',
      large: 'font-normal text-base leading-7 tracking-tight',
      lead: 'font-normal text-lg text-muted-foreground leading-7 tracking-tight',
      muted: 'font-normal text-muted-foreground text-sm leading-5 tracking-normal',

      numberLarge: 'font-normal text-lg tabular-nums leading-6 tracking-normal',
      numberMedium: 'font-normal text-base tabular-nums leading-6 tracking-normal',
      numberSmall: 'font-normal text-sm tabular-nums leading-5 tracking-normal',

      numberStrongLarge: 'font-medium text-lg tabular-nums leading-6 tracking-normal',
      numberStrongMedium: 'font-medium text-base tabular-nums leading-6 tracking-normal',
      numberStrongSmall: 'font-medium text-sm tabular-nums leading-5 tracking-normal',
      numberStrongXSmall: 'font-medium text-xs tabular-nums leading-4 tracking-normal',
      numberXSmall: 'font-normal text-xs tabular-nums leading-4 tracking-normal',
      small: 'font-normal text-xs leading-5 tracking-normal',

      titleLarge: 'font-display font-medium text-4xl leading-10 tracking-tight',
      titleMedium: 'font-display font-medium text-2xl leading-8 tracking-tight',
      titleMediumSemibold: 'font-display font-semibold text-2xl leading-8 tracking-tight',
      titleSmall: 'font-display font-medium text-xl leading-7 tracking-tight',
      titleXSmall: 'font-display font-medium text-lg leading-6 tracking-tight',
      xLarge: 'font-display font-medium text-lg leading-6 tracking-tight',
    },
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants>,
    SharedProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  children: React.ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>((componentProps, ref) => {
  const { align, className, children, testId, as, level: levelProp, ...props } = componentProps;
  const headingLevel = levelProp ?? 1;
  const HeadingTag = as ?? (`h${headingLevel}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(
    HeadingTag,
    {
      className: cn(headingVariants({ align, level: headingLevel }), className),
      'data-testid': testId,
      ref,
      ...props,
    },
    children
  );
});
Heading.displayName = 'Heading';

interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants>, SharedProps {
  as?: 'p' | 'div' | 'span' | 'small';
  children: React.ReactNode;
}

export function Text({ variant, align, as = 'div', className, children, testId, ...props }: TextProps) {
  const Component = as;

  return (
    <Component className={cn(textVariants({ align, variant }), className)} data-testid={testId} {...props}>
      {children}
    </Component>
  );
}

interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement>, SharedProps {
  children: React.ReactNode;
}

export function Blockquote({ className, children, testId, ...props }: BlockquoteProps) {
  return (
    <blockquote className={cn('border-l-2 pl-6 italic', className)} data-testid={testId} {...props}>
      {children}
    </blockquote>
  );
}

interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement>, SharedProps {
  children: React.ReactNode;
  ordered?: boolean;
}

export function List({ ordered = false, className, children, testId, ...props }: ListProps) {
  const ListTag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'mt-1 mb-3 ml-6 list-decimal [&>li]:mt-1' : 'mt-1 mb-3 ml-6 list-disc [&>li]:mt-0.5';

  return (
    <ListTag className={cn(listClass, className)} data-testid={testId} {...props}>
      {children}
    </ListTag>
  );
}

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement>, SharedProps {
  children: React.ReactNode;
}

export function ListItem({ className, children, testId, ...props }: ListItemProps) {
  return (
    <li className={className} data-testid={testId} {...props}>
      {children}
    </li>
  );
}

interface ListItemTextProps extends React.HTMLAttributes<HTMLParagraphElement>, SharedProps {
  children: React.ReactNode;
}

export function ListItemText({ className, children, testId, ...props }: ListItemTextProps) {
  return (
    <p className={cn('my-0 inline', className)} data-testid={testId} {...props}>
      {children}
    </p>
  );
}

interface InlineCodeProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function InlineCode({ className, children, testId, ...props }: InlineCodeProps) {
  return (
    <code
      className={cn('relative rounded bg-muted px-1 py-0.5 font-mono font-semibold text-sm', className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </code>
  );
}

type BaseLinkProps = SharedProps & {
  children: React.ReactNode;
  className?: string;
};

type LinkProps =
  | (BaseLinkProps &
      React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        as?: never;
        href: string;
      })
  | (BaseLinkProps & {
      as: typeof TanStackLink;
      to: string;
      params?: Record<string, string>;
      search?: Record<string, unknown>;
      hash?: string;
      replace?: boolean;
      preload?: false | 'intent' | 'render' | 'viewport';
      [key: string]: unknown;
    });

const linkStyles =
  'font-medium text-primary decoration-dotted underline underline-offset-3 hover:text-primary/80 transition-colors';

export function Link({ className, children, testId, ...props }: LinkProps) {
  if ('as' in props && props.as === TanStackLink) {
    const { as: _, ...routerProps } = props;
    return (
      <TanStackLink className={cn(linkStyles, className)} data-testid={testId} {...routerProps}>
        {children}
      </TanStackLink>
    );
  }

  return (
    <a className={cn(linkStyles, className)} data-testid={testId} {...props}>
      {children}
    </a>
  );
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement>, SharedProps {
  children: React.ReactNode;
}

export function Pre({ className, children, testId, ...props }: PreProps) {
  return (
    <pre
      className={cn('my-6 overflow-y-auto rounded-md bg-muted p-4 text-sm', className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </pre>
  );
}

interface HrProps extends React.HTMLAttributes<HTMLHRElement>, SharedProps {}

export function Hr({ className, testId, ...props }: HrProps) {
  return <hr className={cn('my-10', className)} data-testid={testId} {...props} />;
}

interface DlProps extends React.HTMLAttributes<HTMLDListElement>, SharedProps {
  children: React.ReactNode;
}

export function Dl({ className, children, testId, ...props }: DlProps) {
  return (
    <dl className={cn('my-6', className)} data-testid={testId} {...props}>
      {children}
    </dl>
  );
}

interface DtProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function Dt({ className, children, testId, ...props }: DtProps) {
  return (
    <dt className={cn('font-semibold tracking-tight', className)} data-testid={testId} {...props}>
      {children}
    </dt>
  );
}

interface DdProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function Dd({ className, children, testId, ...props }: DdProps) {
  return (
    <dd className={className} data-testid={testId} {...props}>
      {children}
    </dd>
  );
}

interface DetailsProps extends React.DetailsHTMLAttributes<HTMLDetailsElement>, SharedProps {
  children: React.ReactNode;
}

export function Details({ className, children, testId, ...props }: DetailsProps) {
  return (
    <details className={className} data-testid={testId} {...props}>
      {children}
    </details>
  );
}

interface SummaryProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function Summary({ className, children, testId, ...props }: SummaryProps) {
  return (
    <summary className={cn('cursor-pointer font-semibold tracking-tight', className)} data-testid={testId} {...props}>
      {children}
    </summary>
  );
}

interface MarkProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function Mark({ className, children, testId, ...props }: MarkProps) {
  return (
    <mark className={cn('bg-accent', className)} data-testid={testId} {...props}>
      {children}
    </mark>
  );
}

interface SmallProps extends React.HTMLAttributes<HTMLElement>, SharedProps {
  children: React.ReactNode;
}

export function Small({ className, children, testId, ...props }: SmallProps) {
  return (
    <small className={cn('text-xs leading-none', className)} data-testid={testId} {...props}>
      {children}
    </small>
  );
}
