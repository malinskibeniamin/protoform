import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const PresetLab = lazy(async () => {
  const module = await import("../examples/presets/preset-lab");
  return { default: module.PresetLab };
});

export default function PresetLabIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading preset lab" />}>
      <PresetLab />
    </Suspense>
  );
}
