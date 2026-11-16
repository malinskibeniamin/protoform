'use client';

import { Chart } from '@tanstack/charts/react';
import type { ReactNode } from 'react';

export function ChartModule({ children }: { children: (Component: typeof Chart) => ReactNode }) {
  return children(Chart);
}
