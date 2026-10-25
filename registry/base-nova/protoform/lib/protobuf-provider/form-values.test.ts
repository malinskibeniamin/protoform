import type { DescMessage, MessageValidType } from '@bufbuild/protobuf';
import { expectTypeOf } from 'expect-type';
import type { Control, Path, Resolver } from 'react-hook-form';
import type { Control as ControlV8 } from 'react-hook-form-v8';
import {
  createProtoResolver,
  type ProtoResolverOptions,
  type UseProtoFormReturn,
} from '../../hooks/use-proto-form/index.js';
import type { UseProtoFormReturn as UseProtoFormV8Return } from '../../hooks/use-proto-form-v8/index.js';
import type { ProtoFormShape, ProtoFormValues } from './form-values.js';
import { AutoFormExampleSchema } from './gen/auto-form-example_pb.js';
import type { protoToFormValues } from './hook-runtime.js';

declare const { describe, test }: typeof import('bun:test');

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

describe('protoFormValues: deeply nested oneof paths resolve without casts', () => {
  test('resolves a field through the delivery oneof', () => {
    expectTypeOf<'delivery.value.endpoint'>().toExtend<Path<NotificationForm>>();
  });

  test('resolves the discriminator for a nested credentials oneof', () => {
    expectTypeOf<'delivery.value.credentials.case'>().toExtend<Path<NotificationForm>>();
  });

  test('resolves a field through two oneof levels', () => {
    expectTypeOf<'delivery.value.credentials.value.secretRef'>().toExtend<Path<NotificationForm>>();
  });

  test('resolves a field unique to another nested branch', () => {
    expectTypeOf<'delivery.value.credentials.value.clientId'>().toExtend<Path<NotificationForm>>();
  });

  test('resolves fields unique to sibling delivery branches', () => {
    expectTypeOf<'delivery.value.topic'>().toExtend<Path<NotificationForm>>();
    expectTypeOf<'delivery.value.region'>().toExtend<Path<NotificationForm>>();
  });

  test('resolves nested branch fields without a containing message', () => {
    expectTypeOf<'credentials.value.secretRef'>().toExtend<Path<WebhookDeliveryForm>>();
    expectTypeOf<'credentials.value.tokenUrl'>().toExtend<Path<WebhookDeliveryForm>>();
  });
});

describe('protoFormShape: the values a protobuf form holds', () => {
  test('omits protobuf message internals from form paths', () => {
    expectTypeOf<'$typeName'>().not.toExtend<Path<ExampleForm>>();
    expectTypeOf<'$unknown'>().not.toExtend<Path<ExampleForm>>();
    expectTypeOf<'shippingAddress.$typeName'>().not.toExtend<Path<ExampleForm>>();
    expectTypeOf<'shippingAddress.city'>().toExtend<Path<ExampleForm>>();
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

  test('infers form-value output only when the resolver explicitly selects raw values', () => {
    const resolver = createProtoResolver(AutoFormExampleSchema, {}, undefined, { raw: true });
    expectTypeOf(resolver).toEqualTypeOf<Resolver<Record<string, unknown>, unknown, Record<string, unknown>>>();
  });

  test('keeps protobuf output for existing typed resolver options', () => {
    const options: ProtoResolverOptions<typeof AutoFormExampleSchema> = {};
    const resolver = createProtoResolver(AutoFormExampleSchema, {}, undefined, options);
    expectTypeOf(resolver).toEqualTypeOf<
      Resolver<Record<string, unknown>, unknown, MessageValidType<typeof AutoFormExampleSchema>>
    >();
  });
});
