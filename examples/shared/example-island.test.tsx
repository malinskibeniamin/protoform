import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { expect, it } from "vitest";

import AipResourceFormExampleIsland from "../../islands/AipResourceFormExample.js";
import BareBonesFormExampleIsland from "../../islands/BareBonesFormExample.js";
import CelRe2FormExampleIsland from "../../islands/CelRe2FormExample.js";
import ComplexFormExampleIsland from "../../islands/ComplexFormExample.js";
import DeeplyNestedFormExampleIsland from "../../islands/DeeplyNestedFormExample.js";
import FinalFormExampleIsland from "../../islands/FinalFormExample.js";
import FinalFormInteropDemoIsland from "../../islands/FinalFormInteropDemo.js";
import FormikExampleIsland from "../../islands/FormikExample.js";
import FormikInteropDemoIsland from "../../islands/FormikInteropDemo.js";
import KitchenSinkExampleIsland from "../../islands/KitchenSinkExample.js";
import OneofFormExampleIsland from "../../islands/OneofFormExample.js";
import ReadinessDashboardIsland from "../../islands/ReadinessDashboard.js";
import ServerErrorFormExampleIsland from "../../islands/ServerErrorFormExample.js";
import TanStackFormExampleIsland from "../../islands/TanStackFormExample.js";
import TanStackInteropDemoIsland from "../../islands/TanStackInteropDemo.js";
import TwoStepFormExampleIsland from "../../islands/TwoStepFormExample.js";

const islandCases: ReadonlyArray<{
  Island: ComponentType;
  label: string;
}> = [
  {
    Island: BareBonesFormExampleIsland,
    label: "Loading bare-bones example",
  },
  { Island: TwoStepFormExampleIsland, label: "Loading two-step example" },
  { Island: CelRe2FormExampleIsland, label: "Loading CEL and RE2 example" },
  { Island: OneofFormExampleIsland, label: "Loading oneof example" },
  {
    Island: ServerErrorFormExampleIsland,
    label: "Loading server-error example",
  },
  {
    Island: AipResourceFormExampleIsland,
    label: "Loading AIP resource example",
  },
  { Island: ComplexFormExampleIsland, label: "Loading complex example" },
  {
    Island: KitchenSinkExampleIsland,
    label: "Loading kitchen sink example",
  },
  {
    Island: DeeplyNestedFormExampleIsland,
    label: "Loading deeply nested example",
  },
  {
    Island: TanStackFormExampleIsland,
    label: "Loading TanStack Form example",
  },
  { Island: FormikExampleIsland, label: "Loading Formik example" },
  { Island: FinalFormExampleIsland, label: "Loading Final Form example" },
  {
    Island: TanStackInteropDemoIsland,
    label: "Loading TanStack Form interop demo",
  },
  {
    Island: FormikInteropDemoIsland,
    label: "Loading Formik interop demo",
  },
  {
    Island: FinalFormInteropDemoIsland,
    label: "Loading Final Form interop demo",
  },
  {
    Island: ReadinessDashboardIsland,
    label: "Loading readiness dashboard",
  },
];

it.each(islandCases)(
  "shows the $label status while its chunk loads",
  ({ Island, label }) => {
    render(<Island />);

    expect(screen.getByRole("status", { name: label })).toBeInTheDocument();
  }
);
