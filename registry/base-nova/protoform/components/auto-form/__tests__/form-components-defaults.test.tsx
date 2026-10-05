import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { AutoForm, type AutoFormFieldProps, type AutoFormProps } from '..';
import { createMockProvider } from './test-utils';

function StepperNumber({ id }: AutoFormFieldProps) {
  return <output id={id}>Stepper number</output>;
}

function AppAutoForm<TCustomFieldType extends string = never>({
  formComponents,
  ...props
}: AutoFormProps<Record<string, unknown>, TCustomFieldType>) {
  return (
    <AutoForm<Record<string, unknown>, TCustomFieldType>
      {...props}
      formComponents={{ number: StepperNumber, ...formComponents }}
    />
  );
}

describe('formComponents defaults', () => {
  test('a generic wrapper can add default field components and still accept caller overrides', () => {
    const schema = createMockProvider([{ key: 'retries', required: false, type: 'number' }]);

    const view = render(<AppAutoForm schema={schema} />);
    expect(screen.getByText('Stepper number')).toBeVisible();

    view.rerender(<AppAutoForm formComponents={{ number: () => <output>Caller number</output> }} schema={schema} />);
    expect(screen.getByText('Caller number')).toBeVisible();
  });
});
