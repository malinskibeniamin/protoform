import { create } from '@bufbuild/protobuf';
import { FieldOptionsSchema } from '@bufbuild/protobuf/wkt';
import { describe, expect, it } from 'vitest';

import './auto-form-example-annotations';

import {
  type AutoFormExample,
  AutoFormExampleSchema,
  AutoFormUiMetadataExampleSchema,
} from './gen/auto-form-example_pb';
import {
  getProtoFieldCustomData,
  getProtoMessageUiConfig,
  PROTO_FORM_ROOT_ERROR_KEY,
  ProtoProvider,
  parseProtoSchema,
  protoToFormValues,
} from './index';
import { createProtoResolver } from '../../hooks/use-proto-form';

const MESSAGE_LEVEL_ERROR = /minimum threshold must be less than or equal to maximum threshold/i;
const DATETIME_LOCAL_VALUE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const REQUIRED_FIELD_ERROR = /enter a value/i;

function buildValidProtoFormValues() {
  return {
    username: 'protoform_admin',
    primaryEmail: 'forms@protoform.com',
    homepageUrl: 'https://protoform.com',
    resourceId: '123e4567-e89b-12d3-a456-426614174000',
    bio: 'A protobuf-backed form with Buf reflection and Protovalidate.',
    age: 34,
    employeeNumber: '4001',
    storageQuotaBytes: '4096',
    accessTier: 3,
    shippingAddress: {
      lineOne: '500 Harbor Way',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 1,
    },
    tags: ['forms'],
    labels: [{ key: 'team', value: 'frontend' }],
    officeLocations: [
      {
        key: 'hq',
        value: {
          lineOne: '500 Harbor Way',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 1,
        },
      },
    ],
    preferredContact: {
      case: 'preferredEmail',
      value: 'forms@protoform.com',
    },
    createdAt: '2026-03-17T09:00',
    reminderInterval: '300s',
    writablePaths: ['profile'],
    avatarBytes: 'AQIDBA==',
    minimumThreshold: 5,
    maximumThreshold: 10,
  };
}

describe('protobuf-provider', () => {
  it('exposes descriptor deprecation through provider data and render hints', () => {
    const username = AutoFormExampleSchema.fields.find(
      (field) => field.localName === 'username'
    );
    expect(username).toBeDefined();
    if (!username) {
      return;
    }
    const originalOptions = username.proto.options;
    username.proto.options = create(FieldOptionsSchema, { deprecated: true });

    try {
      const parsed = parseProtoSchema(AutoFormExampleSchema);
      const field = parsed.fields.find((candidate) => candidate.key === 'username');
      expect(field?.hints?.deprecated).toBe(true);
      expect(getProtoFieldCustomData(field)?.deprecated).toBe(true);
    } finally {
      username.proto.options = originalOptions;
    }
  });
  it('parses enums and oneofs into autoform-friendly fields', () => {
    const parsedSchema = parseProtoSchema(AutoFormExampleSchema);
    const accessTierField = parsedSchema.fields.find((field) => field.key === 'accessTier');
    const preferredContactField = parsedSchema.fields.find((field) => field.key === 'preferredContact');

    expect(accessTierField?.type).toBe('select');
    expect(accessTierField?.options?.some(([value]) => value === '0')).toBe(false);
    expect(accessTierField?.options?.some(([value]) => value === '1')).toBe(true);

    expect(preferredContactField?.type).toBe('oneof');
    expect(preferredContactField?.schema?.map((field) => field.key)).toEqual([
      'preferredEmail',
      'preferredPhone',
      'doNotContact',
    ]);
  });

  it('hydrates field descriptions from registered proto annotations', () => {
    const parsedSchema = parseProtoSchema(AutoFormExampleSchema);
    const usernameField = parsedSchema.fields.find((field) => field.key === 'username');
    const preferredContactField = parsedSchema.fields.find((field) => field.key === 'preferredContact');
    const preferredPhoneField = preferredContactField?.schema?.find((field) => field.key === 'preferredPhone');

    expect(usernameField?.fieldConfig?.description).toBe('Public handle shown in mentions and admin lists.');
    expect(preferredContactField?.fieldConfig?.description).toBe(
      'Exactly one preferred contact route can be selected at a time.'
    );
    expect(preferredPhoneField?.fieldConfig?.description).toBe('Route urgent notices to an E.164 phone number.');
  });

  it('converts protobuf messages into form-friendly values', () => {
    const message = create(AutoFormExampleSchema, {
      username: 'protoform_admin',
      primaryEmail: 'forms@protoform.com',
      homepageUrl: 'https://protoform.com',
      resourceId: '123e4567-e89b-12d3-a456-426614174000',
      bio: 'A protobuf-backed form with Buf reflection and Protovalidate.',
      employeeNumber: 4001n,
      storageQuotaBytes: 4096n,
      accessTier: 3,
      shippingAddress: {
        lineOne: '500 Harbor Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 1,
      },
      labels: {
        team: 'frontend',
      },
      officeLocations: {
        hq: {
          lineOne: '500 Harbor Way',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 1,
        },
      },
      preferredContact: {
        case: 'preferredEmail',
        value: 'forms@protoform.com',
      },
      createdAt: {
        seconds: 1710666000n,
        nanos: 0,
      },
      reminderInterval: {
        seconds: 300n,
        nanos: 0,
      },
      writablePaths: {
        paths: ['profile'],
      },
      avatarBytes: new Uint8Array([1, 2, 3, 4]),
      minimumThreshold: 5,
      maximumThreshold: 10,
    });

    const formValues = protoToFormValues(AutoFormExampleSchema, message);

    expect(formValues.employeeNumber).toBe('4001');
    expect(formValues.storageQuotaBytes).toBe('4096');
    expect(formValues.avatarBytes).toBe('AQIDBA==');
    expect(formValues.labels).toEqual([{ key: 'team', value: 'frontend' }]);
    expect(formValues.officeLocations).toEqual([
      {
        key: 'hq',
        value: expect.objectContaining({
          city: 'San Francisco',
          lineOne: '500 Harbor Way',
        }),
      },
    ]);
    expect(formValues.preferredContact).toEqual({
      case: 'preferredEmail',
      value: 'forms@protoform.com',
    });
    expect(formValues.createdAt).toMatch(DATETIME_LOCAL_VALUE);
    expect(formValues.reminderInterval).toBe('300s');
    expect(formValues.writablePaths).toEqual(['profile']);
  });

  it('maps nested field and root validation errors through the resolver', async () => {
    const resolver = createProtoResolver(AutoFormExampleSchema);
    const result = await resolver(
      {
        ...buildValidProtoFormValues(),
        minimumThreshold: 12,
        maximumThreshold: 4,
        officeLocations: [
          {
            key: 'hq',
            value: {
              lineOne: '500 Harbor Way',
              city: '',
              state: 'CA',
              postalCode: '94107',
              country: 1,
            },
          },
        ],
      },
      undefined,
      {
        criteriaMode: 'firstError',
        fields: {},
        names: [],
        shouldUseNativeValidation: false,
      } as never
    );

    const officeLocationsErrors = result.errors.officeLocations as
      | Array<{ value?: { city?: { message?: string } } }>
      | undefined;
    const rootError = result.errors.root as { message?: string } | undefined;
    const formRootError = result.errors[PROTO_FORM_ROOT_ERROR_KEY] as { message?: string } | undefined;

    expect(result.values).toEqual({});
    expect(rootError?.message).toMatch(MESSAGE_LEVEL_ERROR);
    expect(formRootError?.message).toMatch(MESSAGE_LEVEL_ERROR);
    expect(officeLocationsErrors?.[0]?.value?.city?.message).toMatch(REQUIRED_FIELD_ERROR);
  });

  it('supports provider-style defaults and synchronous validation', () => {
    const provider = new ProtoProvider(AutoFormExampleSchema);
    const defaultValues = provider.getDefaultValues();
    const validationResult = provider.validateSchema(buildValidProtoFormValues());

    expect(defaultValues.tags).toEqual([]);
    expect(defaultValues.labels).toEqual([]);
    expect(defaultValues.preferredContact).toEqual({
      case: undefined,
      value: undefined,
    });
    expect(validationResult.success).toBe(true);

    if (!validationResult.success) {
      throw new Error('Expected synchronous protobuf validation to succeed.');
    }

    const data = validationResult.data as Record<string, unknown>;
    expect(data.$typeName).toBe('protoform.v1.AutoFormExample');
    expect(data.employeeNumber).toBe(4001n);
    expect(data.labels).toEqual({ team: 'frontend' });
    expect(data.preferredContact).toEqual({
      case: 'preferredEmail',
      value: 'forms@protoform.com',
    });
  });

  it('round-trips optional, wrapper, and JSON-backed protobuf fields', () => {
    const provider = new ProtoProvider(AutoFormExampleSchema);
    const validationResult = provider.validateSchema({
      ...buildValidProtoFormValues(),
      nickname: 'Harbor',
      middleName: 'UI',
      bonusPoints: 42,
      betaTester: true,
      preferences: {
        theme: 'dark',
        density: 'comfortable',
      },
      featuredValue: 'feature-rollout',
      dashboardBlocks: ['overview', 'alerts'],
    });

    expect(validationResult.success).toBe(true);

    if (!validationResult.success) {
      throw new Error('Expected optional and JSON-backed protobuf fields to validate.');
    }

    const roundTrippedValues = protoToFormValues(
      AutoFormExampleSchema,
      validationResult.data as AutoFormExample | undefined
    );

    expect(roundTrippedValues).toEqual(
      expect.objectContaining({
        nickname: 'Harbor',
        middleName: 'UI',
        bonusPoints: 42,
        betaTester: true,
        preferences: {
          theme: 'dark',
          density: 'comfortable',
        },
        featuredValue: 'feature-rollout',
        dashboardBlocks: ['overview', 'alerts'],
      })
    );
  });

  it('strips enum type prefix from option labels', () => {
    const parsedSchema = parseProtoSchema(AutoFormExampleSchema);
    const accessTierField = parsedSchema.fields.find((field) => field.key === 'accessTier');

    expect(accessTierField?.options).toBeDefined();

    const labels = accessTierField!.options!.map(([, label]) => label);

    // Labels should be humanized without the "AccessTier" type prefix
    expect(labels).toContain('Viewer');
    expect(labels).toContain('Editor');
    expect(labels).toContain('Admin');

    // No label should start with "Access Tier"
    for (const label of labels) {
      expect(label.startsWith('Access Tier')).toBe(false);
    }
  });

  it('normalizes proto field and oneof UI metadata for focused UI demos', () => {
    const parsedSchema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
    const providerField = parsedSchema.fields.find((field) => field.key === 'provider');
    const regionField = parsedSchema.fields.find((field) => field.key === 'region');
    const escalationReasonField = parsedSchema.fields.find((field) => field.key === 'escalationReason');
    const supportContactField = parsedSchema.fields.find((field) => field.key === 'supportContact');

    expect(getProtoFieldCustomData(providerField!)?.ui).toEqual(
      expect.objectContaining({
        control: 'radio',
        help: 'Radio buttons make small enums easier to scan in generated forms.',
      })
    );

    expect(getProtoFieldCustomData(regionField!)?.ui?.disabledWhen).toEqual([
      expect.objectContaining({ expression: 'form.provider == 0' }),
    ]);

    expect(getProtoFieldCustomData(escalationReasonField!)?.ui).toEqual(
      expect.objectContaining({
        control: 'textarea',
        sensitive: true,
        visibleWhen: [expect.objectContaining({ expression: 'form.supportTier == 3' })],
      })
    );

    expect(getProtoFieldCustomData(supportContactField!)?.ui).toEqual(
      expect.objectContaining({
        help: 'This oneof is also driven by UI metadata, so it only appears after a support tier is chosen.',
        visibleWhen: [expect.objectContaining({ expression: 'form.enableSupportMode && form.supportTier != 0' })],
      })
    );
  });

  it('derives sensitive from CONTROL_TYPE_PASSWORD when not explicitly annotated', () => {
    const parsedSchema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
    const apiTokenField = parsedSchema.fields.find((field) => field.key === 'apiToken');

    expect(getProtoFieldCustomData(apiTokenField!)?.ui).toEqual(
      expect.objectContaining({
        control: 'password',
        sensitive: true,
      })
    );
  });
});
