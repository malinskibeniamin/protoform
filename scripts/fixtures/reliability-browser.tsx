import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AutoForm } from '@/registry/base-nova/protoform/components/auto-form';
import type { SchemaProvider } from '@/registry/base-nova/protoform/components/auto-form/core-types';
import type { DataProviderRequest } from '@/registry/base-nova/protoform/components/auto-form/data-providers';

const schema: SchemaProvider = {
  getDefaultValues: () => ({ title: '', methods: ['post'] }),
  parseSchema: () => ({
    fields: [
      { key: 'title', type: 'string', required: true },
      {
        key: 'choice',
        type: 'select',
        required: true,
        options: [
          ['one', 'One'],
          ['two', 'Two'],
          ['three', 'Three'],
          ['four', 'Four'],
        ],
      },
      {
        key: 'methods',
        type: 'array',
        required: false,
        schema: [
          { key: 'value', type: 'string', required: false, fieldConfig: { customData: { dataProvider: 'methods' } } },
        ],
      },
    ],
  }),
  validateSchema: (values) =>
    values['title']
      ? { success: true, data: values }
      : {
          success: false,
          errors: [
            { path: ['title'], message: 'Enter a title' },
            { path: ['title'], message: 'Use at least three characters' },
            { path: ['choice'], message: 'Choose an option' },
            { path: ['methods'], message: 'Choose at least one method' },
          ],
        },
};

function methodsProvider(request: DataProviderRequest) {
  return request.cursor !== undefined && request.cursor !== ''
    ? { options: [{ label: 'POST', value: 'post' }] }
    : { options: [{ label: 'GET', value: 'get' }], nextCursor: 'page-2' };
}

function App() {
  const [submitted, setSubmitted] = useState('');
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="font-semibold text-2xl">Form reliability</h1>
      <p>Keep selections. See every validation error.</p>
      <AutoForm
        dataProviders={{ methods: { useProvider: methodsProvider, staleSelection: 'clear' } }}
        modes={['advanced']}
        onSubmit={(values) => setSubmitted(JSON.stringify(values))}
        schema={schema}
        showSummary={false}
        withSubmit
      />
      <output aria-label="Submitted values">{submitted}</output>
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) {
  throw new Error('Missing fixture root');
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
