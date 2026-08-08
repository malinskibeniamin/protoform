import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm, defaultRegistry } from '../index';

describe('AutoForm – fieldRegistry prop wiring', () => {
  it('uses a custom fieldRegistry to resolve field components', () => {
    const CustomComponent = () => <div data-testid="custom-rendered">Custom!</div>;

    const customRegistry = defaultRegistry.clone().register({
      name: 'code',
      priority: 9999,
      match: (field) => field.key === 'greeting',
      component: CustomComponent,
    });

    const schema = createMockProvider([{ key: 'greeting', type: 'string', required: true }]);

    render(
      <AutoForm
        fieldConfig={{ greeting: { fieldType: 'code' } }}
        fieldRegistry={customRegistry}
        formComponents={{ code: CustomComponent }}
        schema={schema}
      />
    );

    expect(screen.getByTestId('custom-rendered')).toBeInTheDocument();
  });

  it('renders custom field types inside nested messages', () => {
    const CustomComponent = () => <div data-testid="nested-custom-rendered">Nested custom</div>;
    const registry = defaultRegistry.clone().register({
      component: CustomComponent,
      match: (field) => field.key === 'source',
      name: 'code',
      priority: 9999,
    });
    const schema = createMockProvider([
      {
        key: 'settings',
        required: true,
        schema: [{ key: 'source', required: true, type: 'string' }],
        type: 'object',
      },
    ]);

    render(
      <AutoForm
        fieldConfig={{ 'settings.source': { fieldType: 'code' } }}
        fieldRegistry={registry}
        formComponents={{ code: CustomComponent }}
        schema={schema}
      />
    );

    expect(screen.getByTestId('nested-custom-rendered')).toBeInTheDocument();
  });

  it('shows a configuration error when a renderer has no component', () => {
    const schema = createMockProvider([{ key: 'greeting', type: 'string', required: true }]);

    render(<AutoForm fieldConfig={{ greeting: { fieldType: 'missing-renderer' } }} schema={schema} />);

    expect(screen.getByRole('alert')).toHaveTextContent('No component found for type "missing-renderer".');
  });
});
