import type { ReactNode } from 'react';

export function ParitySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 space-y-4 rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-base">{title}</h3>
      {children}
    </section>
  );
}
