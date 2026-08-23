import { Heading, Text } from "@/registry/base-nova/protoform/components/typography";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactCredentials(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }

  const redacted = structuredClone(payload);
  if (isRecord(redacted["apiKey"])) {
    redacted["apiKey"]["apiKey"] = "[redacted]";
  }
  return redacted;
}

export function ComplexReviewSummary({ payload }: { payload: unknown }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-background p-5 shadow-xs">
      <div className="space-y-1">
        <Heading level={3}>Review summary</Heading>
        <Text className="text-muted-foreground" variant="small">
          Credentials are always redacted from this preview.
        </Text>
      </div>
      <pre className="max-h-[min(60vh,38rem)] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted/35 p-4 font-mono text-xs leading-5">
        {JSON.stringify(redactCredentials(payload), null, 2)}
      </pre>
    </div>
  );
}
