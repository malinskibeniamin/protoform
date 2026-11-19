import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SchemaProvider } from '../registry/base-nova/protoform/components/auto-form/core-types.js';
import { AutoForm } from '../registry/base-nova/protoform/components/auto-form/index.js';
import { AutoForm as FormischAutoForm } from '../registry/base-nova/protoform/components/auto-form-formisch/index.js';
import { AutoForm as RHFV8AutoForm } from '../registry/base-nova/protoform/components/auto-form-react-hook-form-v8/index.js';
import { AutoForm as TanstackAutoForm } from '../registry/base-nova/protoform/components/auto-form-tanstack/index.js';
import { AutoForm as TanstackV2AutoForm } from '../registry/base-nova/protoform/components/auto-form-tanstack-v2/index.js';
import { protoPathToFormPath } from '../registry/base-nova/protoform/hooks/use-proto-form/index.js';
import { AutoFormExampleSchema } from '../registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb.js';
import {
  createProtoFormSchema,
  isProtoMessageDescriptor,
} from '../registry/base-nova/protoform/lib/protobuf-provider/index.js';

describe('untrusted input hardening', () => {
  for (const [engine, Form] of [
    ['rhf', AutoForm],
    ['rhf-v8', RHFV8AutoForm],
    ['tanstack', TanstackAutoForm],
    ['tanstack-v2', TanstackV2AutoForm],
    ['formisch', FormischAutoForm],
  ] as const) {
    const invalidValues = engine === 'rhf' ? [null, 42, 'not-form-values', []] : [[]];
    for (const invalidData of invalidValues) {
      test(`rejects ${engine} invalid provider output ${JSON.stringify(invalidData)} and recovers`, async () => {
        const user = userEvent.setup();
        let output: unknown = invalidData;
        const submission = Promise.withResolvers<unknown>();
        const receivedValues: unknown[] = [];
        const provider: SchemaProvider = {
          getDefaultValues: () => ({ value: 'safe' }),
          parseSchema: () => ({ fields: [{ key: 'value', required: true, type: 'string' }] }),
          validateSchema: () => ({ data: output, success: true }),
        };
        render(
          <Form
            onSubmit={(value) => {
              receivedValues.push(value);
              submission.resolve(value);
            }}
            schema={provider}
            withSubmit
          />
        );
        const submit = screen.getByRole('button', { name: 'Submit' });
        await user.click(submit);
        expect(await screen.findByText('Validation returned invalid form values.')).toBeVisible();
        expect(receivedValues).toEqual([]);

        output = { value: 'safe' };
        await user.click(submit);
        await expect(submission.promise).resolves.toEqual({ value: 'safe' });
        expect(receivedValues).toHaveLength(1);
      });
    }
  }

  test('rejects malformed descriptors, conversion values, and server paths without throwing', async () => {
    for (const candidate of [null, [], {}, { fields: null }, { kind: 'message' }, Object.create(null)]) {
      expect(isProtoMessageDescriptor(candidate)).toBe(false);
    }

    const schema = createProtoFormSchema(AutoFormExampleSchema);
    await Promise.all(
      [
        null,
        [],
        'not-an-object',
        { avatarBytes: '%%%' },
        { createdAt: 'not-a-date' },
        { labels: { key: 'wrong-shape' } },
        { reminderInterval: 'forever' },
        { writablePaths: ['', '__proto__', '[999999999]'] },
      ].map((value) => expect(Promise.resolve(schema['~standard'].validate(value))).resolves.toHaveProperty('issues'))
    );

    for (const path of [
      '',
      '__proto__.polluted',
      'constructor.prototype.polluted',
      'shipping_address[-1]',
      'shipping_address[999999999999999999999]',
      'shipping_address.<script>',
    ]) {
      expect(protoPathToFormPath(AutoFormExampleSchema, path)).toBeNull();
    }
    expect({}).not.toHaveProperty('polluted');
  });

  test('renders user-controlled error text as text rather than executable HTML', async () => {
    const hostileText = '<img src=x onerror="globalThis.polluted=true"> submission failed';
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ value: 'safe' }),
      parseSchema: () => ({
        fields: [{ fieldConfig: { label: 'Value' }, key: 'value', required: true, type: 'string' }],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };
    const submitHostileText = () => {
      throw new Error(hostileText);
    };
    const user = userEvent.setup();
    const view = render(<AutoForm onSubmit={submitHostileText} schema={provider} withSubmit />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText(hostileText)).toBeVisible();
    expect(view.container.querySelector('img')).toBeNull();
    expect(globalThis).not.toHaveProperty('polluted');
  });
});
