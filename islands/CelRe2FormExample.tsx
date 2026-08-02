import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const CelRe2FormExample = lazy(async () => {
  const module = await import("../examples/learning/cel-re2-form");
  return { default: module.default };
});

export default function CelRe2FormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading CEL and RE2 example" />}>
      <CelRe2FormExample />
    </Suspense>
  );
}
