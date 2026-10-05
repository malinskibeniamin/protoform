import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { createPerformanceDescriptor } from '@/conformance/performance-descriptor';
import { ProtoProvider } from '@/registry/base-nova/protoform/lib/protobuf-provider/provider';
import { AutoForm } from '..';

const budgets = [
  { fields: 50, render: 1000, change: 500, step: 1000 },
  { fields: 200, render: 2500, change: 1000, step: 2000 },
  { fields: 500, render: 5000, change: 2000, step: 3500 },
];

class PerformanceProvider extends ProtoProvider {
  private readonly stepped: boolean;

  constructor(fields: number, stepped: boolean) {
    super(createPerformanceDescriptor(fields));
    this.stepped = stepped;
  }
  override parseSchema() {
    const parsed = super.parseSchema();
    return {
      ...parsed,
      fields: parsed.fields.map((field, index) => ({
        ...field,
        fieldConfig: { ...field.fieldConfig, label: `Field ${index + 1}` },
        hints: {
          ...field.hints,
          ...(this.stepped ? { step: index < parsed.fields.length / 2 ? 'first' : 'second' } : {}),
        },
      })),
    };
  }
}

function Fixture({ fields, stepped = false }: { fields: number; stepped?: boolean }) {
  const [submitted, setSubmitted] = useState<Record<string, unknown>>({});
  const provider = new PerformanceProvider(fields, stepped);
  return (
    <main>
      <AutoForm
        schema={provider}
        {...(stepped === true
          ? {
              stepper: {
                steps: [
                  { id: 'first', title: 'First' },
                  { id: 'second', title: 'Second' },
                ],
              },
            }
          : {})}
        onSubmit={setSubmitted}
        withSubmit
      />
      <output aria-label="Submitted first field">{String(submitted['field1'] ?? '')}</output>
    </main>
  );
}

test.each(budgets)('renders, types, validates, and steps through a real $fields-field AutoForm', async (budget) => {
  const start = performance.now();
  const view = await render(<Fixture fields={budget.fields} />);
  await expect.element(page.getByRole('textbox', { name: `Field ${budget.fields}`, exact: true })).toBeVisible();
  expect(document.querySelectorAll('input[type="text"]')).toHaveLength(budget.fields);
  const renderMs = performance.now() - start;
  expect(renderMs).toBeLessThan(budget.render);
  const changeStart = performance.now();
  await page.getByRole('textbox', { name: 'Field 1', exact: true }).fill('updated');
  await expect.element(page.getByRole('textbox', { name: 'Field 1', exact: true })).toHaveValue('updated');
  const changeMs = performance.now() - changeStart;
  expect(changeMs).toBeLessThan(budget.change);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByLabel('Submitted first field')).toHaveText('updated');
  await view.unmount();
  await render(<Fixture fields={budget.fields} stepped />);
  expect(document.querySelectorAll('input[type="text"]')).toHaveLength(budget.fields / 2);
  const stepStart = performance.now();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.element(page.getByRole('textbox', { name: `Field ${budget.fields}`, exact: true })).toBeVisible();
  expect(document.querySelectorAll('input[type="text"]')).toHaveLength(budget.fields / 2);
  const stepMs = performance.now() - stepStart;
  expect(stepMs).toBeLessThan(budget.step);
  performance.measure(`protoform-${budget.fields}-fields`, { start, detail: { renderMs, changeMs, stepMs } });
});
