import { lazy, Suspense } from "react";

import { ExampleLoading } from "../examples/shared/example-loading";

export const client = "only";

const FormikExample = lazy(async () => {
  const module = await import("../examples/form-libraries/formik-form");
  return { default: module.FormikExample };
});

export default function FormikExampleIsland() {
  return (
    <Suspense fallback={<ExampleLoading label="Loading Formik example" />}>
      <FormikExample />
    </Suspense>
  );
}
