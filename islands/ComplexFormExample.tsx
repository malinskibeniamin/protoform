import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const ComplexFormExample = lazy(async () => {
  const module = await import("../examples/complex/complex-form");
  return { default: module.default };
});

export default function ComplexFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading complex example" />}>
      <ComplexFormExample />
    </Suspense>
  );
}
