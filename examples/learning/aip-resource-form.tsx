"use client";

import { create } from "@bufbuild/protobuf";
import { useState } from "react";

import { Alert, AlertDescription } from "@/registry/base-nova/protoform/components/alert";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";

import { type MaskableProfile, MaskableProfileSchema } from "../gen/protoform/examples/v1/forms_pb.js";

const profile = create(MaskableProfileSchema, {
  displayName: "Ada Lovelace",
  homeRegion: "europe-west1",
  lifecycleState: "ACTIVE",
  name: "profiles/ada",
});

export function AipResourceFormExample() {
  const [updateMask, setUpdateMask] = useState<string>();

  return (
    <div className="space-y-6">
      <AutoForm<MaskableProfile>
        defaultValues={profile}
        onFieldChange={() => setUpdateMask(undefined)}
        onSubmit={(_values, _form, context) => setUpdateMask(context.updateMask?.paths.join(", ") ?? "")}
        schema={MaskableProfileSchema}
        withSubmit
      />
      {updateMask ? (
        <Alert role="status">
          <AlertDescription>Update mask: {updateMask}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
