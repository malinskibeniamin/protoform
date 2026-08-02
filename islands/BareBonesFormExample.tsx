import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const BareBonesFormExample = lazy(async () => {
  const module = await import("../examples/learning/bare-bones-form");
  return { default: module.BareBonesFormExample };
});

export default function BareBonesFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading bare-bones example" />}>
      <BareBonesFormExample />
    </Suspense>
  );
}
