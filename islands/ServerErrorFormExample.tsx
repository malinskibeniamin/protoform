import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const ServerErrorFormExample = lazy(async () => {
  const module = await import("../examples/basic/basic-form");
  return { default: module.default };
});

export default function ServerErrorFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading server-error example" />}>
      <ServerErrorFormExample />
    </Suspense>
  );
}
