import type { Path } from "react-hook-form";
import { describe, expectTypeOf, test } from "vitest";
import type { FlattenProtoOneofs } from "./proto-paths.js";

type DeliveryCredentials =
  | { case: "sharedSecret"; value: { secretRef: string } }
  | {
      case: "oauth";
      value: { clientId: string; tokenUrl: string };
    }
  | { case: undefined; value?: undefined };

interface WebhookDelivery {
  credentials: DeliveryCredentials;
  endpoint: string;
  signingSecretRef: string;
}

interface QueueDelivery {
  region: string;
  topic: string;
}

interface Notification {
  delivery:
    | { case: "webhook"; value: WebhookDelivery }
    | { case: "queue"; value: QueueDelivery }
    | { case: undefined; value?: undefined };
}

type NotificationForm = FlattenProtoOneofs<Notification>;
type WebhookDeliveryForm = FlattenProtoOneofs<WebhookDelivery>;

describe("FlattenProtoOneofs — deeply nested oneof paths resolve without casts", () => {
  test("resolves a field through the delivery oneof", () => {
    expectTypeOf<"delivery.value.endpoint">().toMatchTypeOf<Path<NotificationForm>>();
  });

  test("resolves the discriminator for a nested credentials oneof", () => {
    expectTypeOf<"delivery.value.credentials.case">().toMatchTypeOf<Path<NotificationForm>>();
  });

  test("resolves a field through two oneof levels", () => {
    expectTypeOf<"delivery.value.credentials.value.secretRef">().toMatchTypeOf<Path<NotificationForm>>();
  });

  test("resolves a field unique to another nested branch", () => {
    expectTypeOf<"delivery.value.credentials.value.clientId">().toMatchTypeOf<Path<NotificationForm>>();
  });

  test("resolves fields unique to sibling delivery branches", () => {
    expectTypeOf<"delivery.value.topic">().toMatchTypeOf<Path<NotificationForm>>();
    expectTypeOf<"delivery.value.region">().toMatchTypeOf<Path<NotificationForm>>();
  });

  test("resolves nested branch fields without a containing message", () => {
    expectTypeOf<"credentials.value.secretRef">().toMatchTypeOf<Path<WebhookDeliveryForm>>();
    expectTypeOf<"credentials.value.tokenUrl">().toMatchTypeOf<Path<WebhookDeliveryForm>>();
  });
});
