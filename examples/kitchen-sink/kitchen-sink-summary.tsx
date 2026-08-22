import { isMessage } from "@bufbuild/protobuf";
import { Heading, Text } from "@/registry/base-nova/protoform/components/typography";
import { SubmitKitchenSinkFormRequestSchema } from "../gen/protoform/examples/v1/forms_pb.js";

export function KitchenSinkSummary({ payload }: { payload: unknown }) {
  if (!isMessage(payload, SubmitKitchenSinkFormRequestSchema)) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-5 shadow-xs">
      <Heading level={3}>Policy summary</Heading>
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <Text className="text-muted-foreground" variant="small">
            Regions
          </Text>
          <p className="font-medium">{payload.regions.length}</p>
        </div>
        <div>
          <Text className="text-muted-foreground" variant="small">
            Services
          </Text>
          <p className="font-medium">{payload.services.length}</p>
        </div>
        <div>
          <Text className="text-muted-foreground" variant="small">
            Rollout stages
          </Text>
          <p className="font-medium">{payload.rolloutPercentages.join(" → ")}%</p>
        </div>
      </div>
    </div>
  );
}
