import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

const REQUIRED_NAME_LABEL = /required name/i;
const OPTIONAL_NOTE_LABEL = /optional note/i;
const ADVANCED_TAB = /advanced/i;
const JSON_TAB = /json/i;
const PAYLOAD_SUMMARY_TEXT = /payload preview/i;
const PAYLOAD_JSON_TEXT = /payload json/i;
const COPY_JSON_BUTTON = /copy json/i;
const FORMAT_JSON_BUTTON = /format json/i;

describe('AutoForm – modes and payload', () => {
  it('supports simple, advanced, and JSON modes with an opt-in summary panel', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'requiredName', type: 'string', required: true },
      { key: 'optionalNote', type: 'string', required: false },
      {
        key: 'rollout',
        type: 'object',
        required: true,
        schema: [{ key: 'clusterId', type: 'string', required: true }],
      },
    ]);

    render(
      <AutoForm
        defaultMode="simple"
        defaultValues={{
          requiredName: 'registry',
          optionalNote: 'Optional context',
          rollout: { clusterId: 'prod-a' },
        }}
        modes={['simple', 'advanced', 'json']}
        schema={schema}
        showSummary
        withSubmit
      />
    );

    expect(screen.getByText(PAYLOAD_SUMMARY_TEXT)).toBeInTheDocument();
    expect(screen.getByLabelText(REQUIRED_NAME_LABEL)).toBeInTheDocument();
    expect(screen.queryByLabelText(OPTIONAL_NOTE_LABEL)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: ADVANCED_TAB }));

    await waitFor(() => {
      expect(screen.getByLabelText(OPTIONAL_NOTE_LABEL)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: JSON_TAB }));

    await waitFor(() => {
      expect(screen.getByText(PAYLOAD_JSON_TEXT)).toBeInTheDocument();
    });
  });

  it('supports payloadBuilder and custom summary rendering', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'teamName', type: 'string', required: true },
      { key: 'ownerEmail', type: 'string', required: true },
      { key: 'enableDryRun', type: 'boolean', required: false },
    ]);

    render(
      <AutoForm
        defaultValues={{
          teamName: 'registry-ui',
          ownerEmail: 'forms@protoform.com',
          enableDryRun: true,
        }}
        modes={['advanced', 'json']}
        payloadBuilder={(values) => ({
          request: {
            owner: values.ownerEmail,
            mode: values.enableDryRun ? 'dry-run' : 'live',
            team: values.teamName,
          },
        })}
        renderSummary={(payload) => {
          const request = payload as { request?: { mode?: string; team?: string } };
          return <div>{`Custom summary: ${request.request?.team} (${request.request?.mode})`}</div>;
        }}
        schema={schema}
        showSummary
        withSubmit
      />
    );

    expect(screen.getByText('Custom summary: registry-ui (dry-run)')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: JSON_TAB }));

    expect(screen.getByText(PAYLOAD_JSON_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY_JSON_BUTTON })).toBeInTheDocument();
  });

  it('updates summary after editing in JSON mode and switching back to advanced', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'monthlyBudget', type: 'number', required: true },
      { key: 'teamName', type: 'string', required: true },
    ]);

    render(
      <AutoForm
        defaultValues={{
          monthlyBudget: 12_500,
          teamName: 'registry-ui',
        }}
        modes={['advanced', 'json']}
        schema={schema}
        showSummary
        withSubmit
      />
    );

    // Summary should show initial value
    const summaryEl = screen.getByTestId('autoform-summary');
    expect(summaryEl.textContent).toContain('12500');

    // Switch to JSON, change a value
    await user.click(screen.getByRole('tab', { name: JSON_TAB }));
    const jsonEditor = screen.getByRole('textbox');
    await user.clear(jsonEditor);
    await user.paste('{"monthlyBudget":99999,"teamName":"ops-team"}');

    // Switch back to Advanced
    await user.click(screen.getByRole('tab', { name: ADVANCED_TAB }));

    // Form field should update
    await waitFor(() => {
      expect(screen.getByDisplayValue('ops-team')).toBeInTheDocument();
    });

    // Summary should also reflect the new value
    const updatedSummaryEl = screen.getByTestId('autoform-summary');
    expect(updatedSummaryEl.textContent).toContain('99999');
  });

  it('supports editable JSON mode via payloadParser', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { key: 'teamName', type: 'string', required: true },
      { key: 'ownerEmail', type: 'string', required: true },
      { key: 'enableDryRun', type: 'boolean', required: false },
    ]);

    render(
      <AutoForm
        defaultValues={{
          teamName: 'registry-ui',
          ownerEmail: 'forms@protoform.com',
          enableDryRun: true,
        }}
        modes={['advanced', 'json']}
        payloadBuilder={(values) => ({
          request: {
            owner: {
              email: values.ownerEmail,
            },
            rollout: {
              mode: values.enableDryRun ? 'dry-run' : 'live',
            },
            team: values.teamName,
          },
        })}
        payloadParser={(payload) => {
          const request = (
            payload as { request?: { owner?: { email?: string }; rollout?: { mode?: string }; team?: string } }
          ).request;

          return {
            teamName: request?.team ?? '',
            ownerEmail: request?.owner?.email ?? '',
            enableDryRun: request?.rollout?.mode === 'dry-run',
          };
        }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('tab', { name: JSON_TAB }));

    const jsonEditor = screen.getByRole('textbox');

    await user.clear(jsonEditor);
    await user.paste(
      '{"request":{"owner":{"email":"ops@protoform.com"},"rollout":{"mode":"live"},"team":"ops-console"}}'
    );
    await user.click(screen.getByRole('button', { name: FORMAT_JSON_BUTTON }));
    await user.click(screen.getByRole('tab', { name: ADVANCED_TAB }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('ops-console')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('ops@protoform.com')).toBeInTheDocument();
  });
});
