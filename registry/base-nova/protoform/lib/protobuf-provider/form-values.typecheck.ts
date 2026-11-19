import type { DescMessage, MessageValidType } from '@bufbuild/protobuf';
import { expectTypeOf } from 'expect-type';
import type { Control, Path, Resolver } from 'react-hook-form';
import type { Control as ControlV8 } from 'react-hook-form-v8';
import type {
  createProtoResolver,
  ProtoResolverOptions,
  UseProtoFormReturn,
} from '../../hooks/use-proto-form/index.js';
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

expectTypeOf<'delivery.value.endpoint'>().toExtend<Path<NotificationForm>>();

expectTypeOf<'delivery.value.credentials.case'>().toExtend<Path<NotificationForm>>();

expectTypeOf<'delivery.value.credentials.value.secretRef'>().toExtend<Path<NotificationForm>>();

expectTypeOf<'delivery.value.credentials.value.clientId'>().toExtend<Path<NotificationForm>>();

expectTypeOf<'delivery.value.topic'>().toExtend<Path<NotificationForm>>();
expectTypeOf<'delivery.value.region'>().toExtend<Path<NotificationForm>>();

expectTypeOf<'credentials.value.secretRef'>().toExtend<Path<WebhookDeliveryForm>>();
expectTypeOf<'credentials.value.tokenUrl'>().toExtend<Path<WebhookDeliveryForm>>();

expectTypeOf<'$typeName'>().not.toExtend<Path<ExampleForm>>();
expectTypeOf<'$unknown'>().not.toExtend<Path<ExampleForm>>();
expectTypeOf<'shippingAddress.$typeName'>().not.toExtend<Path<ExampleForm>>();
expectTypeOf<'shippingAddress.city'>().toExtend<Path<ExampleForm>>();

expectTypeOf<ExampleForm['createdAt']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ExampleForm['writablePaths']>().toEqualTypeOf<string[] | undefined>();
expectTypeOf<ExampleForm['employeeNumber']>().toEqualTypeOf<string>();
expectTypeOf<ExampleForm['avatarBytes']>().toEqualTypeOf<string>();

expectTypeOf<ProtoFormShape<DescMessage>>().toEqualTypeOf<Record<string, unknown>>();

expectTypeOf<ReturnType<typeof protoToFormValues<typeof AutoFormExampleSchema>>>().toEqualTypeOf<ExampleForm>();
expectTypeOf<UseProtoFormReturn<typeof AutoFormExampleSchema>['control']>().toEqualTypeOf<Control<ExampleForm>>();
expectTypeOf<UseProtoFormV8Return<typeof AutoFormExampleSchema>['control']>().toEqualTypeOf<ControlV8<ExampleForm>>();

declare const resolverFactory: typeof createProtoResolver;
declare const descriptor: typeof AutoFormExampleSchema;

const resolver = resolverFactory(descriptor, {}, undefined, { raw: true });
expectTypeOf(resolver).toEqualTypeOf<Resolver<Record<string, unknown>, unknown, Record<string, unknown>>>();

const options: ProtoResolverOptions<typeof AutoFormExampleSchema> = {};
const typedResolver = resolverFactory(descriptor, {}, undefined, options);
expectTypeOf(typedResolver).toEqualTypeOf<
  Resolver<Record<string, unknown>, unknown, MessageValidType<typeof AutoFormExampleSchema>>
>();
