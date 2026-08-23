import { isFieldSet } from "@bufbuild/protobuf";
import {
  Edition,
  FeatureSet_FieldPresence,
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility,
  SymbolVisibility,
} from "@bufbuild/protobuf/wkt";
import { describe, expect } from "@rstest/core";

import {
  createProtoFormSchema,
  protoToFormValues,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { Editions2024LocalSchema, Editions2024MatrixSchema } from "./gen/protoform/conformance/v1/editions_2024_pb.js";
import { EditionStateSchema, EditionsMatrixSchema } from "./gen/protoform/conformance/v1/editions_pb.js";

describe("Protobuf Editions conformance", () => {
  test("supports Edition 2024 visibility and option-only imports", async () => {
    expect(Editions2024MatrixSchema.file.edition).toBe(Edition.EDITION_2024);
    expect(Editions2024MatrixSchema.file.proto.options?.features?.defaultSymbolVisibility).toBe(
      FeatureSet_VisibilityFeature_DefaultSymbolVisibility.STRICT
    );
    expect(Editions2024MatrixSchema.proto.visibility).toBe(SymbolVisibility.VISIBILITY_EXPORT);
    expect(Editions2024LocalSchema.proto.visibility).toBe(SymbolVisibility.VISIBILITY_LOCAL);

    const result = await createProtoFormSchema(Editions2024MatrixSchema)["~standard"].validate({ displayName: "" });
    expect(result.issues).toMatchObject([{ path: ["displayName"] }]);
  });

  test("accepts Editions descriptors and honors field presence controls", async () => {
    expect(EditionsMatrixSchema.file.edition).toBe(Edition.EDITION_2023);
    expect(EditionsMatrixSchema.field.explicitName.presence).toBe(FeatureSet_FieldPresence.EXPLICIT);
    expect(EditionsMatrixSchema.field.implicitLabel.presence).toBe(FeatureSet_FieldPresence.IMPLICIT);
    expect(EditionStateSchema.open).toBe(false);
    const { delimitedChild, expandedValues } = EditionsMatrixSchema.field;
    if (!("delimitedEncoding" in delimitedChild && "packed" in expandedValues)) {
      throw new Error("Expected Editions fields with delimited and packed encoding controls.");
    }
    expect(delimitedChild.delimitedEncoding).toBe(true);
    expect(expandedValues.packed).toBe(false);

    const result = await createProtoFormSchema(EditionsMatrixSchema)["~standard"].validate({
      explicitName: "",
      implicitLabel: "",
    });

    expect(result.issues).toBeUndefined();
    if (!("value" in result)) {
      throw new Error("Expected Editions form values to validate.");
    }
    expect(isFieldSet(result.value, EditionsMatrixSchema.field.explicitName)).toBe(true);
    expect(isFieldSet(result.value, EditionsMatrixSchema.field.implicitLabel)).toBe(false);
    expect(protoToFormValues(EditionsMatrixSchema, result.value)).toMatchObject({
      explicitName: "",
      implicitLabel: "",
    });
  });
});
