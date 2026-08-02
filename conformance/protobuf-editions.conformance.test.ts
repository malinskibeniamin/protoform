import { isFieldSet } from "@bufbuild/protobuf";
import { Edition, FeatureSet_FieldPresence } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import {
  createProtoFormSchema,
  protoToFormValues,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import {
  EditionStateSchema,
  EditionsMatrixSchema,
} from "./gen/protoform/conformance/v1/editions_pb.js";

describe("Protobuf Editions conformance", () => {
  it("accepts Editions descriptors and honors field presence controls", async () => {
    expect(EditionsMatrixSchema.file.edition).toBe(Edition.EDITION_2023);
    expect(EditionsMatrixSchema.field.explicitName.presence).toBe(
      FeatureSet_FieldPresence.EXPLICIT
    );
    expect(EditionsMatrixSchema.field.implicitLabel.presence).toBe(
      FeatureSet_FieldPresence.IMPLICIT
    );
    expect(EditionStateSchema.open).toBe(false);
    expect(EditionsMatrixSchema.field.delimitedChild.delimitedEncoding).toBe(
      true
    );
    expect(EditionsMatrixSchema.field.expandedValues.packed).toBe(false);

    const result = await createProtoFormSchema(EditionsMatrixSchema)[
      "~standard"
    ].validate({
      explicitName: "",
      implicitLabel: "",
    });

    expect(result.issues).toBeUndefined();
    if (!("value" in result)) {
      throw new Error("Expected Editions form values to validate.");
    }
    expect(
      isFieldSet(result.value, EditionsMatrixSchema.field.explicitName)
    ).toBe(true);
    expect(
      isFieldSet(result.value, EditionsMatrixSchema.field.implicitLabel)
    ).toBe(false);
    expect(protoToFormValues(EditionsMatrixSchema, result.value)).toMatchObject(
      {
        explicitName: "",
        implicitLabel: "",
      }
    );
  });
});
