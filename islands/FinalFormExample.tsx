import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const FinalFormExample = lazy(async () => {
  const module = await import("../examples/form-libraries/final-form");
  return { default: module.FinalFormExample };
});

export default function FinalFormExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading Final Form example" />}>
      <FinalFormExample />
    </Suspense>
  );
}
