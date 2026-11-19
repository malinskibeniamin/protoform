import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CapabilityDemo } from './capability-demo.js';

const FOCUSED_REQUEST_TEXT = /Edit the focused request/u;

describe('capabilityDemo', () => {
  test('renders a focused React Hook Form AIP demo and submits its protobuf value', async () => {
    const user = userEvent.setup();

    render(<CapabilityDemo demoId="aip.131" />);

    expect(screen.getByText('React Hook Form', { exact: true })).toBeInTheDocument();
    expect(screen.getByText(FOCUSED_REQUEST_TEXT)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByRole('status')).toHaveTextContent('publishers/acme/books/protoform-guide');
  });

  test('renders an explicit not-found state for an unknown demo', () => {
    render(<CapabilityDemo demoId="missing" />);

    expect(screen.getByRole('alert')).toHaveTextContent('This demo is unavailable.');
  });

  test('redacts sensitive values from submitted previews', async () => {
    const user = userEvent.setup();
    render(<CapabilityDemo demoId="aip.147" />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const result = await screen.findByRole('status');
    expect(result).toHaveTextContent('[redacted]');
    expect(result).not.toHaveTextContent('draft-token');
  });

  test('normalizes well-known type defaults for form controls', () => {
    render(<CapabilityDemo demoId="aip.133" />);

    expect(screen.getByRole('textbox', { name: 'Ttl' })).toHaveValue('86400s');
  });
});
