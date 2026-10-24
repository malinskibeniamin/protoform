import { createRoot } from 'react-dom/client';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';

const schema: SchemaProvider = {
  getDefaultValues: () => ({
    imageGeneration: { model: '' },
    delivery: { case: 'webhook', value: { endpoint: '' } },
  }),
  parseSchema: () => ({
    fields: [
      {
        key: 'imageGeneration',
        type: 'object',
        required: false,
        fieldConfig: { label: 'Image generation' },
        schema: [{ key: 'model', type: 'string', required: false, fieldConfig: { label: 'Model' } }],
      },
      {
        key: 'delivery',
        type: 'oneof',
        required: false,
        fieldConfig: { label: 'Delivery' },
        schema: [
          {
            key: 'webhook',
            type: 'object',
            required: false,
            fieldConfig: { label: 'Webhook' },
            schema: [{ key: 'endpoint', type: 'string', required: false, fieldConfig: { label: 'Endpoint' } }],
          },
        ],
      },
    ],
  }),
  validateSchema: (values) => ({ success: true, data: values }),
};

function App() {
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Indented sections</h1>
      <AutoForm
        appearance={{ arrayItems: 'separated', layout: 'stacked', sections: 'indented' }}
        schema={schema}
        showSummary={false}
      />
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) {
  throw new Error('Missing fixture root');
}
createRoot(root).render(<App />);
