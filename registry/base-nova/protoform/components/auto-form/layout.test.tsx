import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode, SubmitEvent } from 'react';

import { FormField, FormLayout, FormSection, FormSubmit } from './layout';
import { shadcnUIComponents } from './shadcn-ui-components';
import { ProtoformUIProvider } from './ui-components';

function Provider({ children }: { children: ReactNode }) {
  return <ProtoformUIProvider components={shadcnUIComponents}>{children}</ProtoformUIProvider>;
}

test('gives nested sections semantic headings and submits through the form', async () => {
  const user = userEvent.setup();
  const submitted = Promise.withResolvers<FormData>();
  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    submitted.resolve(new FormData(event.currentTarget));
  }
  render(
    <FormLayout aria-label="Account settings" onSubmit={onSubmit}>
      <FormSection description="Choose where we contact you." required title="Profile">
        <FormSection title="Contact">
          <FormSection title="Notifications">
            <FormField htmlFor="email" label="Email">
              <input id="email" name="email" />
            </FormField>
          </FormSection>
        </FormSection>
      </FormSection>
      <FormSubmit />
    </FormLayout>,
    { wrapper: Provider }
  );
  expect(screen.getByRole('form', { name: 'Account settings' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Profile/u, level: 2 })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Contact', level: 3 })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Notifications', level: 4 })).toBeVisible();
  expect(screen.getByText('Choose where we contact you.')).toBeVisible();

  await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  const entry = await submitted.promise;
  expect(entry.get('email')).toBe('ada@example.com');
});

test('shows help until the form field has an error', () => {
  const field = (error?: string) => (
    <FormField error={error} helpText="Your full name" htmlFor="name" label="Name">
      <input id="name" />
    </FormField>
  );
  const { rerender } = render(field(), { wrapper: Provider });
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible();
  expect(screen.getByText('Your full name')).toBeVisible();

  rerender(field('Required'));
  expect(screen.getByText('Required')).toBeVisible();
  expect(screen.queryByText('Your full name')).not.toBeInTheDocument();
});
