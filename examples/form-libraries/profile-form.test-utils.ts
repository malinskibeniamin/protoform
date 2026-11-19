import { afterEach, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentType, createElement } from 'react';
import { buildExampleServer } from '../server/server.js';

const displayNamePattern = /display name/iu;
const emailPattern = /email/iu;

let closeServer: (() => Promise<void>) | undefined;

afterEach(async () => {
  await closeServer?.();
  closeServer = undefined;
});

async function startServer() {
  const server = buildExampleServer();
  const address = await server.listen({ host: '127.0.0.1', port: 0 });
  closeServer = () => server.close();
  return address;
}

export async function exerciseProfileForm(ProfileForm: ComponentType<{ baseUrl?: string }>) {
  const address = await startServer();
  const user = userEvent.setup();
  render(createElement(ProfileForm, { baseUrl: address }));
  const createProfile = screen.getByRole('button', { name: 'Create profile' });
  const displayName = screen.getByLabelText(displayNamePattern);
  const email = screen.getByLabelText(emailPattern);

  expect(screen.queryByText('Enter a value.')).not.toBeInTheDocument();
  await user.click(createProfile);
  expect(await screen.findAllByText('Enter a value.')).toHaveLength(2);
  expect(displayName).toHaveAttribute('aria-invalid', 'true');
  expect(email).toHaveAttribute('aria-invalid', 'true');

  await user.type(displayName, 'Ada Lovelace');
  await user.type(email, 'ada@blocked.example');
  await user.click(createProfile);
  expect(await screen.findByText('Use an email address from an approved domain.')).toBeVisible();
  expect(email).toHaveAttribute('aria-invalid', 'true');

  await user.clear(email);
  await user.type(email, 'ada@example.com');
  await user.click(createProfile);
  const status = await screen.findByRole('status');
  expect(email).not.toHaveAttribute('aria-invalid', 'true');
  return status;
}
