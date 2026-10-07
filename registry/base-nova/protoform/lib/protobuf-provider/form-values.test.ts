import type { DescMessage } from '@bufbuild/protobuf';
import { describe } from '@rstest/core';
import { expectTypeOf } from 'expect-type';
import type { Control, Path } from 'react-hook-form';
import type { Control as ControlV8 } from 'react-hook-form-v8';
import type { UseProtoFormReturn } from '../../hooks/use-proto-form/index.js';
import type { UseProtoFormReturn as UseProtoFormV8Return } from '../../hooks/use-proto-form-v8/index.js';
import type { ProtoFormShape, ProtoFormValues } from './form-values.js';
import type { AutoFormExampleSchema } from './gen/auto-form-example_pb.js';
import type { protoToFormValues } from './hook-runtime.js';

type DeliveryCredentials =
  | { case: 'sharedSecret'; value: { secretRef: string } }
  | {
      case: 'oauth';
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
    | { case: 'webhook'; value: WebhookDelivery }
    | { case: 'queue'; value: QueueDelivery }
    | { case: undefined; value?: undefined };
}

type NotificationForm = ProtoFormValues<Notification>;
type WebhookDeliveryForm = ProtoFormValues<WebhookDelivery>;
type ExampleForm = ProtoFormShape<typeof AutoFormExampleSchema>;

describe('ProtoFormValues: deeply nested oneof paths resolve without casts', () => {
  test('resolves a field through the delivery oneof', () => {
    expectTypeOf<'delivery.value.endpoint'>().toMatchTypeOf<Path<NotificationForm>>();
  });

  test('resolves the discriminator for a nested credentials oneof', () => {
    expectTypeOf<'delivery.value.credentials.case'>().toMatchTypeOf<Path<NotificationForm>>();
  });

  test('resolves a field through two oneof levels', () => {
    expectTypeOf<'delivery.value.credentials.value.secretRef'>().toMatchTypeOf<Path<NotificationForm>>();
  });

  test('resolves a field unique to another nested branch', () => {
    expectTypeOf<'delivery.value.credentials.value.clientId'>().toMatchTypeOf<Path<NotificationForm>>();
  });

  test('resolves fields unique to sibling delivery branches', () => {
    expectTypeOf<'delivery.value.topic'>().toMatchTypeOf<Path<NotificationForm>>();
    expectTypeOf<'delivery.value.region'>().toMatchTypeOf<Path<NotificationForm>>();
  });

  test('resolves nested branch fields without a containing message', () => {
    expectTypeOf<'credentials.value.secretRef'>().toMatchTypeOf<Path<WebhookDeliveryForm>>();
    expectTypeOf<'credentials.value.tokenUrl'>().toMatchTypeOf<Path<WebhookDeliveryForm>>();
  });
});

describe('ProtoFormShape: the values a protobuf form holds', () => {
  test('omits protobuf message internals from form paths', () => {
    expectTypeOf<'$typeName'>().not.toMatchTypeOf<Path<ExampleForm>>();
    expectTypeOf<'$unknown'>().not.toMatchTypeOf<Path<ExampleForm>>();
    expectTypeOf<'shippingAddress.$typeName'>().not.toMatchTypeOf<Path<ExampleForm>>();
    expectTypeOf<'shippingAddress.city'>().toMatchTypeOf<Path<ExampleForm>>();
  });

  test('represents well-known types, 64-bit integers, and bytes as their form values', () => {
    expectTypeOf<ExampleForm['createdAt']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ExampleForm['writablePaths']>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<ExampleForm['employeeNumber']>().toEqualTypeOf<string>();
    expectTypeOf<ExampleForm['avatarBytes']>().toEqualTypeOf<string>();
  });

  test('falls back to a string-keyed record for descriptors only known at runtime', () => {
    expectTypeOf<ProtoFormShape<DescMessage>>().toEqualTypeOf<Record<string, unknown>>();
  });

  test('is the value type of protoToFormValues and of both React Hook Form hooks', () => {
    expectTypeOf<ReturnType<typeof protoToFormValues<typeof AutoFormExampleSchema>>>().toEqualTypeOf<ExampleForm>();
    expectTypeOf<UseProtoFormReturn<typeof AutoFormExampleSchema>['control']>().toEqualTypeOf<Control<ExampleForm>>();
    expectTypeOf<UseProtoFormV8Return<typeof AutoFormExampleSchema>['control']>().toEqualTypeOf<
      ControlV8<ExampleForm>
    >();
  });
});
