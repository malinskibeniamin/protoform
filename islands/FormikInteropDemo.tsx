import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const FormikInteropDemo = lazy(async () => {
  const module = await import(
    "../registry/base-nova/protoform/demo/catalog/formik"
  );
  return { default: module.FormikDemo };
});

export default function FormikInteropDemoIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading Formik interop demo" />}>
      <FormikInteropDemo />
    </Suspense>
  );
}
