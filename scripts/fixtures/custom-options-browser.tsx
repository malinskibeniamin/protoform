import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { JSONField, type JSONValue } from '@/components/ui/json-field';

let attempts = 0;

function App() {
  const [value, setValue] = useState<JSONValue>({ region: '' });
  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Region options</h1>
      <p>Create a region. First attempt fails; retry succeeds.</p>
      <JSONField
        customFields={[
          {
            fieldName: 'region',
            onCreateOption: (next, path, update) => {
              attempts += 1;
              if (attempts === 1) {
                return Promise.reject(new Error('Creation failed. Try again.'));
              }
              update(path, next);
              return Promise.resolve();
            },
            options: [],
          },
        ]}
        onChange={setValue}
        schema={{ type: 'object', properties: { region: { type: 'string' } } }}
        value={value}
      />
      <output aria-label="Selected region">{JSON.stringify(value)}</output>
    </main>
  );
}

const root = document.querySelector('#root');
if (!root) {
  throw new Error('Missing fixture root');
}
createRoot(root).render(<App />);
