import { type ReactNode, type Ref, Suspense } from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export function ClipboardFeedback({ children, error }: { children: ReactNode; error: string | undefined }) {
  return (
    <>
      {children}
      {error !== undefined && error !== '' ? (
        <span aria-live="assertive" className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </>
  );
}
export function ChartTooltipLayout({
  className,
  label,
  children,
}: {
  className: string | undefined;
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
    >
      {label}
      <div className="grid gap-1.5">{children}</div>
    </div>
  );
}
export function ChartTooltipValueLayout({
  nested,
  label,
  name,
  value,
}: {
  nested: boolean;
  label: ReactNode;
  name: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className={cn('flex flex-1 justify-between leading-none', nested ? 'items-end' : 'items-center')}>
      <div className="grid gap-1.5">
        {label}
        <span className="text-muted-foreground">{name}</span>
      </div>
      {value}
    </div>
  );
}
export function JSONPropertiesLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-2 p-3">{children}</div>;
}
export function JSONPropertyLayout({
  caption,
  children,
  arrayItem = false,
}: {
  caption: ReactNode;
  children: ReactNode;
  arrayItem?: boolean;
}) {
  return (
    <div className={arrayItem === true ? 'space-y-1' : undefined}>
      <div className={arrayItem === true ? 'flex items-center gap-2' : 'mb-1 flex items-center gap-2'}>{caption}</div>
      {children}
    </div>
  );
}
export function JSONArrayLayout({
  description,
  children,
  action,
}: {
  description: ReactNode;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {description}
      <div className="space-y-4">
        {children}
        {action}
      </div>
    </div>
  );
}
export function JSONArrayCardLayout({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        {title}
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
export function JSONEditorLayout({
  containerRef,
  editorId,
  label,
  error,
  input,
  editor,
  loading,
  feedback,
}: {
  containerRef: Ref<HTMLDivElement>;
  editorId: string;
  label: string;
  error: string | undefined;
  input: ReactNode;
  editor: ReactNode;
  loading: ReactNode;
  feedback: ReactNode;
}) {
  return (
    <div className="relative" ref={containerRef}>
      <label className="sr-only" htmlFor={editorId}>
        {label}
      </label>
      <div
        className={cn(
          'rounded-md border',
          error !== undefined && error !== '' ? 'border-destructive' : 'border-border'
        )}
      >
        {input}
        <Suspense fallback={loading}>{editor}</Suspense>
      </div>
      {feedback}
    </div>
  );
}
export function KeyValueRowLayout({
  keyControl,
  keyError,
  valueControl,
  valueError,
  removeAction,
  addAction,
}: {
  keyControl: ReactNode;
  keyError: ReactNode;
  valueControl: ReactNode;
  valueError: ReactNode;
  removeAction: ReactNode;
  addAction: ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] items-start gap-2 @min-[28rem]/key-value:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      data-row
    >
      <div className="col-start-1 row-start-1 min-w-0 space-y-1">
        {keyControl}
        {keyError}
      </div>
      <div className="col-start-1 row-start-2 min-w-0 space-y-1 @min-[28rem]/key-value:col-start-2 @min-[28rem]/key-value:row-start-1">
        {valueControl}
        {valueError}
      </div>
      {removeAction}
      {addAction}
    </div>
  );
}
export function KeyValueLayout({
  containerRef,
  label,
  description,
  labelId,
  descriptionId,
  testId,
  children,
}: {
  containerRef: Ref<HTMLFieldSetElement>;
  label: ReactNode;
  description: ReactNode;
  labelId: string;
  descriptionId: string;
  testId: string | undefined;
  children: ReactNode;
}) {
  return (
    <fieldset
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={label ? labelId : undefined}
      className="@container/key-value flex min-w-0 flex-col gap-2"
      data-slot="key-value-field"
      data-testid={testId}
      ref={containerRef}
    >
      {label || description ? (
        <div className="flex flex-col gap-0.5">
          {label ? (
            <span className="text-sm leading-none font-medium select-none" id={labelId}>
              {label}
            </span>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </fieldset>
  );
}
