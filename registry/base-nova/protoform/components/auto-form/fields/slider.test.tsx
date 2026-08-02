import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AutoForm } from '../index';
import type { SchemaProvider } from '../core-types';

describe('SliderFieldComponent', () => {
  it('labels the range input independently from its number input', () => {
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ replicas: 2 }),
      parseSchema: () => ({
        fields: [
          {
            fieldConfig: { customData: { control: 'slider' } },
            key: 'replicas',
            label: 'Replicas',
            type: 'number',
          },
        ],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };
    render(
      <AutoForm
        fieldConfig={{ replicas: { inputProps: { max: 10, min: 1, onValueChange: vi.fn() } } }}
        schema={provider}
      />
    );

    expect(screen.getByRole('slider', { name: 'Replicas slider' })).toBeVisible();
  });
});
