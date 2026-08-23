import { create } from "@bufbuild/protobuf";
import { describe, expect } from "@rstest/core";
import { renderHook } from "@testing-library/react";
import { act } from "react";

import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";

import { useProtoForm } from "./index.js";

const emptyDefaults = create(AutoFormExampleSchema) as Record<string, unknown>;

describe("useProtoForm map fields", () => {
  test("keeps protobuf-native map values when creating an update", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: emptyDefaults,
      })
    );

    act(() => {
      result.current.setValue("labels", { region: "eu" }, { shouldDirty: true });
    });

    const instance = result.current.createMessage();
    const updateMask = result.current.createUpdateMask();

    expect(instance.labels).toEqual({ region: "eu" });
    expect(updateMask.paths).toEqual(["labels"]);
  });
});
