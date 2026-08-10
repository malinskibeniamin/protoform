import { lazy, Suspense } from "react";

import type { DemoHubCategory } from "../examples/catalog/demo-docs";
import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const DemoHub = lazy(async () => {
  const module = await import("../examples/catalog/demo-hub");
  return { default: module.DemoHub };
});

export default function DemoHubIsland({
  category,
}: {
  category: DemoHubCategory;
}) {
  return (
    <Suspense fallback={<ExampleLoading label="Loading demo catalog" />}>
      <DemoHub category={category} />
    </Suspense>
  );
}
