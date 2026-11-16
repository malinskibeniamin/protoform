'use client';

import { ScrollArea } from '@base-ui/react/scroll-area';
import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import { CheckIcon, CopyIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CodeBlockLine } from '@/components/ui/shared/code-block';
import { codeBlockVariants } from '@/components/ui/shared/code-block-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const TRAILING_NEWLINE = /\n$/u;

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

export {
  CodeBlockActions,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/shared/code-block';
export { CodeBlock, CodeBlockContent, CodeBlockCopyButton };
