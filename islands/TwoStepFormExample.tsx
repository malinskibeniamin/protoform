import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const TwoStepFormExample = lazy(async () => {
  const module = await import("../examples/learning/two-step-form");
  return { default: module.default };
});

export default function TwoStepFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading two-step example" />}>
      <TwoStepFormExample />
    </Suspense>
  );
}
