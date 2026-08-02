import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm, FieldTypeRegistry } from '../index';

describe('AutoForm – fieldRegistry prop wiring', () => {
  it('uses a custom fieldRegistry to resolve field components', () => {
    const CustomComponent = () => <div data-testid="custom-rendered">Custom!</div>;

    const customRegistry = new FieldTypeRegistry().register({
      name: 'custom-text',
      priority: 9999,
      match: (field) => field.type === 'string',
      component: CustomComponent,
    });

    const schema = createMockProvider([{ key: 'greeting', type: 'string', required: true }]);

    render(
      <AutoForm fieldRegistry={customRegistry} formComponents={{ 'custom-text': CustomComponent }} schema={schema} />
    );

    expect(screen.getByTestId('custom-rendered')).toBeInTheDocument();
  });
});
