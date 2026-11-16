import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { SimpleMultiSelect as BaseMultiSelect } from '@/components/ui/multi-select';
import { AutoForm as SDKForm } from '@/components/ui/sdk/auto-form';
import { SimpleMultiSelect as SDKMultiSelect } from '@/components/ui/sdk/multi-select';
import { AutoForm } from '..';
import type { SchemaProvider } from '../core-types';

const schema: SchemaProvider = {
  getDefaultValues: () => ({ regions: [] }),
  parseSchema: () => ({
    fields: [
      {
        key: 'regions',
        type: 'array',
        required: false,
        schema: [
          { key: 'value', type: 'string', required: false, fieldConfig: { customData: { dataProvider: 'regions' } } },
        ],
      },
    ],
  }),
  validateSchema: (values) => ({ success: true, data: values }),
};
function rankedRegions() {
  return { options: [{ value: 'eu', label: 'Europe' }] };
}
function ProviderForm({ Form }: { Form: typeof AutoForm }) {
  const [submitted, setSubmitted] = useState('');
  return (
    <>
      <Form
        dataProviders={{ regions: { useProvider: rankedRegions } }}
        modes={['advanced']}
        onSubmit={(values) => setSubmitted(JSON.stringify(values))}
        schema={schema}
        showSummary={false}
        withSubmit
      />
      <output aria-label="Submitted regions">{submitted}</output>
    </>
  );
}

for (const { name, Form, SimpleMultiSelect, triggerRole } of [
  { name: 'Base UI', Form: AutoForm, SimpleMultiSelect: BaseMultiSelect, triggerRole: 'button' },
  { name: 'UI SDK', Form: SDKForm, SimpleMultiSelect: SDKMultiSelect, triggerRole: 'combobox' },
] as const) {
  test(`${name} keeps provider-ranked results visible and submits their IDs`, async () => {
    await render(<ProviderForm Form={Form} />);
    await page.getByRole(triggerRole, { name: 'Multi-select trigger' }).click();
    await page.getByRole('combobox', { name: 'Search options' }).fill('server-ranked');
    await expect.element(page.getByRole('option', { name: 'Europe', exact: true })).toBeVisible();
    await page.getByRole('option', { name: 'Europe', exact: true }).click();
    await page.getByRole('combobox', { name: 'Search options' }).press('Escape');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect.element(page.getByLabel('Submitted regions')).toContainText('"regions":["eu"]');
  });

  test(`${name} retains local filtering when no provider search callback is supplied`, async () => {
    await render(
      <SimpleMultiSelect
        options={[
          { value: 'eu', label: 'Europe' },
          { value: 'apac', label: 'Asia Pacific' },
        ]}
      />
    );
    await page.getByRole(triggerRole, { name: 'Multi-select trigger' }).click();
    await page.getByRole('combobox', { name: 'Search options' }).fill('eur');
    await expect.element(page.getByRole('option', { name: 'Europe', exact: true })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'Asia Pacific', exact: true })).not.toBeVisible();
  });
}
