import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const KitchenSinkFormExample = lazy(async () => {
  const module = await import("../examples/kitchen-sink/kitchen-sink-form");
  return { default: module.default };
});

export default function KitchenSinkExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading kitchen sink example" />}>
      <KitchenSinkFormExample />
    </Suspense>
  );
}
