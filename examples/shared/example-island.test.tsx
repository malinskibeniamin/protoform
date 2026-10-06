import { expect } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';

import AipResourceFormExampleIsland from '../../islands/AipResourceFormExample.js';
import BareBonesFormExampleIsland from '../../islands/BareBonesFormExample.js';
import CelRe2FormExampleIsland from '../../islands/CelRe2FormExample.js';
import ComplexFormExampleIsland from '../../islands/ComplexFormExample.js';
import DeeplyNestedFormExampleIsland from '../../islands/DeeplyNestedFormExample.js';
import FinalFormExampleIsland from '../../islands/FinalFormExample.js';
import FinalFormInteropDemoIsland from '../../islands/FinalFormInteropDemo.js';
import FormikExampleIsland from '../../islands/FormikExample.js';
import FormikInteropDemoIsland from '../../islands/FormikInteropDemo.js';
import KitchenSinkExampleIsland from '../../islands/KitchenSinkExample.js';
import OneofFormExampleIsland from '../../islands/OneofFormExample.js';
import ReadinessDashboardIsland from '../../islands/ReadinessDashboard.js';
import ServerErrorFormExampleIsland from '../../islands/ServerErrorFormExample.js';
import TanStackFormExampleIsland from '../../islands/TanStackFormExample.js';
import TanStackInteropDemoIsland from '../../islands/TanStackInteropDemo.js';
import TwoStepFormExampleIsland from '../../islands/TwoStepFormExample.js';

const islandCases: ReadonlyArray<{
  Island: ComponentType;
  label: string;
  loadChunk: () => Promise<unknown>;
}> = [
  {
    Island: BareBonesFormExampleIsland,
    label: 'Loading bare-bones example',
    loadChunk: () => import('../learning/bare-bones-form'),
  },
  {
    Island: TwoStepFormExampleIsland,
    label: 'Loading two-step example',
    loadChunk: () => import('../learning/two-step-form'),
  },
  {
    Island: CelRe2FormExampleIsland,
    label: 'Loading CEL and RE2 example',
    loadChunk: () => import('../learning/cel-re2-form'),
  },
  { Island: OneofFormExampleIsland, label: 'Loading oneof example', loadChunk: () => import('../learning/oneof-form') },
  {
    Island: ServerErrorFormExampleIsland,
    label: 'Loading server-error example',
    loadChunk: () => import('../basic/basic-form'),
  },
  {
    Island: AipResourceFormExampleIsland,
    label: 'Loading AIP resource example',
    loadChunk: () => import('../learning/aip-resource-form'),
  },
  {
    Island: ComplexFormExampleIsland,
    label: 'Loading complex example',
    loadChunk: () => import('../complex/complex-form'),
  },
  {
    Island: KitchenSinkExampleIsland,
    label: 'Loading kitchen sink example',
    loadChunk: () => import('../kitchen-sink/kitchen-sink-form'),
  },
  {
    Island: DeeplyNestedFormExampleIsland,
    label: 'Loading deeply nested example',
    loadChunk: () => import('../nested/deeply-nested-form'),
  },
  {
    Island: TanStackFormExampleIsland,
    label: 'Loading TanStack Form example',
    loadChunk: () => import('../tanstack/tanstack-form'),
  },
  {
    Island: FormikExampleIsland,
    label: 'Loading Formik example',
    loadChunk: () => import('../form-libraries/formik-form'),
  },
  {
    Island: FinalFormExampleIsland,
    label: 'Loading Final Form example',
    loadChunk: () => import('../form-libraries/final-form'),
  },
  {
    Island: TanStackInteropDemoIsland,
    label: 'Loading TanStack Form interop demo',
    loadChunk: () => import('../../registry/base-nova/protoform/demo/catalog/tanstack-form'),
  },
  {
    Island: FormikInteropDemoIsland,
    label: 'Loading Formik interop demo',
    loadChunk: () => import('../../registry/base-nova/protoform/demo/catalog/formik'),
  },
  {
    Island: FinalFormInteropDemoIsland,
    label: 'Loading Final Form interop demo',
    loadChunk: () => import('../../registry/base-nova/protoform/demo/catalog/final-form'),
  },
  {
    Island: ReadinessDashboardIsland,
    label: 'Loading readiness dashboard',
    loadChunk: () => import('../readiness/readiness-dashboard'),
  },
];

test.each(islandCases)('shows the $label status until its chunk loads', async ({ Island, label, loadChunk }) => {
  render(<Island />);

  expect(screen.getByRole('status', { name: label })).toBeVisible();
  await Promise.resolve(
    act(async () => {
      await loadChunk();
    })
  );
  expect(screen.queryByRole('status', { name: label })).not.toBeInTheDocument();
});
