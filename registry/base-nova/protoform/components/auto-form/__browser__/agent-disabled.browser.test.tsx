import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { createAgentSession } from '@/registry/base-nova/protoform/lib/ui-sdk/session';
import { AutoForm } from '..';
import type { SchemaProvider } from '../core-types';

const schema: SchemaProvider = {
  getDefaultValues: () => ({ lockedChoice: 'a', enabledChoice: 'a' }),
  parseSchema: () => ({
    fields: ['lockedChoice', 'enabledChoice'].map((key) => ({
      key,
      type: 'select',
      required: true,
      fieldConfig: { label: key === 'lockedChoice' ? 'Locked choice' : 'Enabled choice' },
      options: [
        ['a', 'Alpha'],
        ['b', 'Beta'],
        ['c', 'Gamma'],
        ['d', 'Delta'],
      ],
    })),
  }),
  validateSchema: (values) => ({ success: true, data: values }),
};
function Example() {
  const [submitted, setSubmitted] = useState('');
  return (
    <>
      <AutoForm
        fieldConfig={{ lockedChoice: { inputProps: { disabled: true } } }}
        modes={['advanced']}
        onSubmit={(values) => setSubmitted(JSON.stringify(values))}
        schema={schema}
        showSummary={false}
        withSubmit
      />
      <output aria-label="Submitted choices">{submitted}</output>
    </>
  );
}

test('disabled AutoForm selects refuse agent changes while enabled selects still submit changes', async () => {
  const session = createAgentSession({ allow: () => true });
  try {
    await render(<Example />);
    const query = await session.agent.query({ within: 'Enabled choice' });
    if (!Array.isArray(query)) {
      throw new TypeError(query.error);
    }
    const beta = query.flatMap((entry) => entry.items ?? []).find((entry) => entry.label === 'Beta');
    if (!beta) {
      throw new Error('Missing Beta choice');
    }
    const denied = await session.agent.act({
      steps: [{ ref: 'Locked choice', action: 'setValue', args: [beta.value] }],
    });
    expect(denied.ok).toBe(false);
    await expect.element(page.getByRole('combobox', { name: 'Locked choice' })).toContainText('Alpha');
    const accepted = await session.agent.act({
      steps: [{ ref: 'Enabled choice', action: 'setValue', args: [beta.value] }],
    });
    expect(accepted.ok, accepted.error?.message).toBe(true);
    await expect.element(page.getByRole('combobox', { name: 'Enabled choice' })).toContainText('Beta');
    await page.getByRole('combobox', { name: 'Enabled choice' }).press('Escape');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect.element(page.getByLabel('Submitted choices')).toContainText('"enabledChoice":"b"');
    await expect.element(page.getByLabel('Submitted choices')).not.toContainText('"lockedChoice":"b"');
  } finally {
    session.dispose();
  }
});
