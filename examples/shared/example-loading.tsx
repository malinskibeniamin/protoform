import { Spinner } from "@/registry/base-nova/protoform/components/spinner";

export function ExampleLoading({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 text-muted-foreground text-sm"
      role="status"
    >
      <Spinner
        aria-hidden="true"
        className="size-5 motion-reduce:animate-none"
        role="presentation"
      />
      <span>{label}…</span>
    </div>
  );
}
