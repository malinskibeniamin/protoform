'use client';

import { ScrollArea } from '@base-ui/react/scroll-area';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const TRAILING_NEWLINE = /\n$/u;

const codeBlockVariants = cva(
  'group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg text-sm data-[size=sm]:text-xs [&:has([data-slot=code-block-content]:focus-visible)]:ring-3 [&:has([data-slot=code-block-content]:focus-visible)]:ring-ring/50',
  {
    variants: {
      variant: {
        default:
          'border border-input text-foreground dark:bg-input/30 [&:has([data-slot=code-block-content]:focus-visible)]:border-ring',
        destructive: 'border border-destructive/30 text-destructive dark:border-destructive/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function CodeBlock({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof codeBlockVariants> & { size?: 'default' | 'sm' }) {
  return (
    <div
      className={cn(codeBlockVariants({ variant }), className)}
      data-size={size}
      data-slot="code-block"
      data-variant={variant}
      {...props}
    />
  );
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-w-0 shrink-0 flex-wrap items-center gap-2 px-3 pt-3 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pt-2.5 group-data-[variant=destructive]/code-block:text-destructive *:has-[>[data-slot=code-block-title]]:min-w-0',
        className
      )}
      data-slot="code-block-header"
      {...props}
    />
  );
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        "max-w-full min-w-0 truncate font-sans text-sm font-medium text-foreground group-data-[size=sm]/code-block:text-xs group-data-[variant=destructive]/code-block:text-destructive [&_svg]:pointer-events-none [&_svg]:me-1.5 [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot="code-block-title"
      {...props}
    />
  );
}

function CodeBlockActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-my-1 ms-auto -me-1.5 flex max-w-full shrink-0 flex-wrap items-center gap-1 [&:is([data-slot=code-block]>*)]:absolute [&:is([data-slot=code-block]>*)]:inset-e-2 [&:is([data-slot=code-block]>*)]:top-2 [&:is([data-slot=code-block]>*)]:z-10 [&:is([data-slot=code-block]>*)]:m-0 [&:is([data-slot=code-block]>*)]:opacity-0 [&:is([data-slot=code-block]>*)]:transition-opacity [&:is([data-slot=code-block]>*)]:group-focus-within/code-block:opacity-100 [&:is([data-slot=code-block]>*)]:group-hover/code-block:opacity-100 group-data-[size=sm]/code-block:[&:is([data-slot=code-block]>*)]:inset-e-1.5 group-data-[size=sm]/code-block:[&:is([data-slot=code-block]>*)]:top-1.5 [&:is([data-slot=code-block]>*)]:pointer-coarse:opacity-100 [&:is([data-slot=code-block]>*)]:*:[button]:bg-background [&:is([data-slot=code-block]>*)]:*:[button]:ring-1 [&:is([data-slot=code-block]>*)]:*:[button]:ring-foreground/10',
        className
      )}
      data-slot="code-block-actions"
      {...props}
    />
  );
}

function CodeBlockCopyButton(props: React.ComponentProps<typeof Button> & { value: string }) {
  return <CodeBlockCopyControl key={props.value} {...props} />;
}

function CodeBlockCopyControl({
  value,
  variant = 'ghost',
  size = 'icon-xs',
  className,
  onClick,
  type = 'button',
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);

  React.useEffect(
    function resetCopyFeedback() {
      if (copied !== true) {
        return;
      }

      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    },
    [copied]
  );

  return (
    <>
      <Button
        aria-label={copied === true ? 'Copied' : 'Copy'}
        className={className}
        data-copied={copied === true || undefined}
        data-slot="code-block-copy-button"
        onClick={async (event) => {
          onClick?.(event);
          if (event.defaultPrevented) {
            return;
          }
          setCopyError(false);
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
          } catch {
            setCopyError(true);
            setCopied(false);
          }
        }}
        size={size}
        type={type}
        variant={variant}
        {...props}
      >
        {copied === true ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied === true ? 'Copied' : ''}
      </span>
      {copyError === true ? (
        <span className="text-xs text-destructive" role="alert">
          Could not copy code. Try again.
        </span>
      ) : null}
    </>
  );
}

function CodeBlockContent({
  className,
  children,
  style,
  wrap = false,
  lineNumbers = false,
  startLine = 1,
  onKeyDown,
  ref,
  ...props
}: React.ComponentProps<'pre'> & { wrap?: boolean; lineNumbers?: boolean; startLine?: number }) {
  const numberedLines =
    lineNumbers === true && typeof children === 'string'
      ? children
          .replace(TRAILING_NEWLINE, '')
          .split('\n')
          .map((text, index) => ({ text, number: startLine + index }))
      : undefined;
  const content = useRender({
    defaultTagName: 'pre',
    ref,
    props: {
      ...props,
      onKeyDown,
      className: cn(
        'm-0 min-h-0 min-w-0 p-3 text-start font-mono leading-relaxed whitespace-pre outline-none [counter-reset:line_var(--code-line-start)] group-has-data-[slot=code-block-footer]/code-block:pb-2 group-has-data-[slot=code-block-header]/code-block:pt-2 group-data-[size=sm]/code-block:p-2.5 group-data-[size=sm]/code-block:group-has-data-[slot=code-block-header]/code-block:pt-1.5 data-wrap:wrap-break-word data-wrap:whitespace-pre-wrap',
        className
      ),
      'data-numbered': lineNumbers === true || undefined,
      'data-slot': 'code-block-content',
      'data-wrap': wrap === true || undefined,
      dir: 'ltr',
      style: { '--code-line-start': startLine - 1, ...style },
      children: (
        <code
          className="grid min-h-lh min-w-max content-start in-data-numbered:grid-cols-[auto_1fr] in-data-wrap:min-w-0"
          data-slot="code-block-code"
        >
          {numberedLines === undefined
            ? children
            : numberedLines.map((line) => <CodeBlockLine key={line.number}>{line.text}</CodeBlockLine>)}
        </code>
      ),
    },
  });
  return (
    <ScrollArea.Root className="relative min-h-0 w-full min-w-0">
      <ScrollArea.Viewport
        aria-label={props['aria-label'] ?? 'Code'}
        className="min-h-0 min-w-0 overflow-auto outline-none"
        onKeyDown={(event) => {
          if (
            event.defaultPrevented ||
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          ) {
            return;
          }
          if (
            event.currentTarget.scrollWidth > event.currentTarget.clientWidth &&
            (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
          ) {
            event.preventDefault();
            event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 40 : -40 });
          }
        }}
        render={content}
        role="region"
      />
      <ScrollArea.Scrollbar className="flex h-2 touch-none p-0.5 select-none" orientation="horizontal">
        <ScrollArea.Thumb className="rounded-full bg-border" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar className="absolute inset-y-0 right-0 flex w-2 touch-none p-0.5 select-none">
        <ScrollArea.Thumb className="rounded-full bg-border" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}

const codeBlockLineVariants = cva(
  "relative -mx-3 block min-h-lh px-3 group-data-[size=sm]/code-block:-mx-2.5 group-data-[size=sm]/code-block:px-2.5 before:min-w-6 before:text-end before:text-muted-foreground after:absolute after:inset-s-1 after:top-0 after:text-muted-foreground after:select-none in-data-numbered:col-span-2 in-data-numbered:grid in-data-numbered:grid-cols-subgrid in-data-numbered:gap-x-3 in-data-numbered:[counter-increment:line] in-data-numbered:before:content-[counter(line)] in-data-numbered:before:select-none in-data-numbered:supports-[content:counter(line)_/_'']:before:content-[counter(line)_/_'']",
  {
    variants: {
      variant: {
        default: '',
        added: "bg-muted after:content-['+']",
        removed: "bg-destructive/10 after:text-destructive after:content-['−']",
        highlighted: 'bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function CodeBlockLine({
  className,
  variant = 'default',
  children,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof codeBlockLineVariants>) {
  const empty =
    children === undefined ||
    children === null ||
    children === '' ||
    (Array.isArray(children) && children.length === 0);

  return (
    <span
      className={cn(codeBlockLineVariants({ variant }), className)}
      data-slot="code-block-line"
      data-variant={variant}
      {...props}
    >
      <span className="min-w-0" data-slot="code-block-line-content">
        {empty === true ? '\n' : null}
        {children}
      </span>
    </span>
  );
}

function CodeBlockFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-w-0 shrink-0 items-center gap-2 px-3 pb-3 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pb-2.5',
        className
      )}
      data-slot="code-block-footer"
      {...props}
    />
  );
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
};
