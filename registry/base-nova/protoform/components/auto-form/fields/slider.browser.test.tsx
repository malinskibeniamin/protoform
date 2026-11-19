import { afterEach, describe, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import { SubmitComplexFormRequestSchema } from '@/examples/gen/protoform/examples/v1/forms_pb.js';
import { AutoForm } from '..';
import type { ParsedField, SchemaProvider } from '../core-types';
import { buildFieldMatchContext } from '../registry';
import { sliderFieldDefinition } from './slider';

afterEach(cleanup);

describe('sliderFieldComponent', () => {
  test('labels the range input independently from its number input', () => {
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ replicas: 2 }),
      parseSchema: () => ({
        fields: [
          {
            fieldConfig: { customData: { control: 'slider' }, label: 'Replicas' },
            key: 'replicas',
            required: true,
            type: 'number',
          },
        ],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };
    render(<AutoForm fieldConfig={{ replicas: { inputProps: { max: 10, min: 1 } } }} schema={provider} />);

    expect(screen.getByRole('slider', { name: 'Replicas slider' })).toBeVisible();
  });
});

test('uses the slider adapter for real protobuf control annotations', () => {
  render(<AutoForm schema={SubmitComplexFormRequestSchema} showSummary={false} />);

  expect(screen.getByRole('slider', { name: /replicas slider/iu })).toBeVisible();
  const replicas = screen.getByRole('spinbutton', { name: /replicas/iu });
  expect(replicas).toHaveAttribute('min', '1');
  expect(replicas).toHaveAttribute('max', '12');
});

test('keeps bounded ordinary numbers and nonnumeric annotations outside the slider definition', () => {
  const bounded: ParsedField = {
    fieldConfig: { inputProps: { max: 10, min: 0 } },
    key: 'count',
    required: false,
    type: 'number',
  };
  const text: ParsedField = {
    fieldConfig: { customData: { control: 'slider' } },
    key: 'subject',
    required: false,
    type: 'string',
  };
  expect(sliderFieldDefinition.match(bounded, buildFieldMatchContext(bounded))).toBe(false);
  expect(sliderFieldDefinition.match(text, buildFieldMatchContext(text))).toBe(false);
});
