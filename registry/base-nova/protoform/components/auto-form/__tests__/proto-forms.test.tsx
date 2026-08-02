import { create } from '@bufbuild/protobuf';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import '@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations';

import { AutoFormExampleSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb';

import { AutoForm } from '../index';

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    value: () => false,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    value: () => undefined,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    value: () => undefined,
  });
}

const TAGS_ADD_BUTTON = /add tags/i;
const REMOVE_ITEM_BUTTON = /remove item/i;
const PREFERRED_CONTACT_LABEL = /preferred contact/i;
const PREFERRED_PHONE_LABEL = /preferred phone/i;
const SUBMIT_BUTTON = /submit/i;
// The proto resolver humanizes generic protovalidate messages — `min_len: 3`
// surfaces as "Must be at least 3 characters." rather than the raw text.
const FIELD_ERROR_TEXT = /must be at least 3 characters/i;
const MESSAGE_ERROR_TEXT = /minimum threshold must be less than or equal to maximum threshold/i;

const buildValidProtoDefaults = () => ({
  username: 'protoform_admin',
  primaryEmail: 'forms@protoform.com',
  homepageUrl: 'https://protoform.com',
  resourceId: '123e4567-e89b-12d3-a456-426614174000',
  bio: 'A protobuf-backed form with Buf reflection and Protovalidate.',
  age: 34,
  employeeNumber: '4001',
  storageQuotaBytes: '4096',
  accessTier: 3,
  shippingAddress: {
    lineOne: '500 Harbor Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 1,
  },
  // accessTier=3 makes the conditionally-visible billingAddress sub-form render,
  // and its proto-required children (lineOne, city, state, postalCode) validate
  // even when the user hasn't touched them — supply valid defaults so submit fires.
  billingAddress: {
    lineOne: '500 Harbor Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 1,
  },
  tags: ['forms'],
  labels: [{ key: 'team', value: 'frontend' }],
  officeLocations: [
    {
      key: 'hq',
      value: {
        lineOne: '500 Harbor Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 1,
      },
    },
  ],
  preferredContact: {
    case: 'preferredEmail',
    value: 'forms@protoform.com',
  },
  createdAt: '2026-03-17T09:00',
  reminderInterval: '300s',
  writablePaths: ['profile'],
  avatarBytes: 'AQIDBA==',
  minimumThreshold: 5,
  maximumThreshold: 10,
});

describe('AutoForm – protobuf forms', () => {
  it('submits protobuf descriptors with protobuf-shaped output', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AutoForm
        defaultValues={buildValidProtoDefaults()}
        formOptions={{ mode: 'all' }}
        onSubmit={onSubmit}
        schema={AutoFormExampleSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedValue = onSubmit.mock.calls[0][0];
    expect(submittedValue.$typeName).toBe('protoform.v1.AutoFormExample');
    expect(submittedValue.employeeNumber).toBe(4001n);
    expect(submittedValue.storageQuotaBytes).toBe(4096n);
    expect(Array.from(submittedValue.avatarBytes)).toEqual([1, 2, 3, 4]);
    expect(submittedValue.labels).toEqual({ team: 'frontend' });
    expect(submittedValue.officeLocations.hq.city).toBe('San Francisco');
    expect(submittedValue.preferredContact).toEqual({
      case: 'preferredEmail',
      value: 'forms@protoform.com',
    });
    expect(submittedValue.createdAt.$typeName).toBe('google.protobuf.Timestamp');
    expect(submittedValue.reminderInterval.$typeName).toBe('google.protobuf.Duration');
    expect(submittedValue.writablePaths.paths).toEqual(['profile']);
  }, 10_000);

  it('shows protobuf field-level validation feedback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AutoForm
        defaultValues={{
          ...buildValidProtoDefaults(),
          username: 'rp',
          minimumThreshold: 5,
          maximumThreshold: 10,
          preferredContact: { case: 'preferredEmail', value: 'forms@protoform.com' },
        }}
        formOptions={{ mode: 'all' }}
        onSubmit={onSubmit}
        schema={AutoFormExampleSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    expect(screen.getByText(FIELD_ERROR_TEXT)).toBeInTheDocument();
  });

  it('renders registered proto field descriptions', () => {
    render(<AutoForm defaultValues={buildValidProtoDefaults()} schema={AutoFormExampleSchema} withSubmit />);

    expect(screen.getByText('Public handle shown in mentions and admin lists.')).toBeInTheDocument();
    expect(screen.getByText('Exactly one preferred contact route can be selected at a time.')).toBeInTheDocument();
  });

  it('switches protobuf oneof cases and submits the latest selection', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AutoForm
        defaultValues={buildValidProtoDefaults()}
        formOptions={{ mode: 'all' }}
        onSubmit={onSubmit}
        schema={AutoFormExampleSchema}
        withSubmit
      />
    );

    // Base UI's Select.Trigger binds its open handler to React's click event.
    // The simulated pointerdown+mousedown sequence is flaky in DOM emulators.
    // (the option must be "highlighted" for onClick to commit the selection).
    // fireEvent.click opens deterministically; we then simulate pointerEnter to
    // highlight the phone option before clicking it so Base UI commits.
    fireEvent.click(screen.getByRole('combobox', { name: PREFERRED_CONTACT_LABEL }));

    const phoneOption = await screen.findByRole('option', { name: PREFERRED_PHONE_LABEL });
    // Base UI's Select.Item onClick bails if the item is not highlighted AND the
    // pointer type is not 'touch'. Setting pointerType='touch' via pointerEnter
    // bypasses the highlight guard so fireEvent.click commits selection.
    fireEvent.pointerEnter(phoneOption, { pointerType: 'touch' });
    fireEvent.pointerDown(phoneOption, { pointerType: 'touch' });
    fireEvent.click(phoneOption);

    const phoneInput = await screen.findByLabelText(PREFERRED_PHONE_LABEL);
    fireEvent.change(phoneInput, { target: { value: '+14155550123' } });

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0].preferredContact).toEqual({
      case: 'preferredPhone',
      value: '+14155550123',
    });
  });

  it('updates protobuf collection values when rows are added and removed', async () => {
    const user = userEvent.setup();

    render(
      <AutoForm
        defaultValues={{
          ...buildValidProtoDefaults(),
          labels: [],
          officeLocations: [],
          tags: ['forms'],
        }}
        onSubmit={vi.fn()}
        schema={AutoFormExampleSchema}
        testId="tags-form"
        withSubmit
      />
    );

    expect(screen.getByDisplayValue('forms')).toBeInTheDocument();
    const removeButtonsBefore = screen.getAllByRole('button', { name: REMOVE_ITEM_BUTTON });
    const initialRemoveCount = removeButtonsBefore.length;

    await user.click(screen.getByRole('button', { name: TAGS_ADD_BUTTON }));

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: REMOVE_ITEM_BUTTON })).toHaveLength(initialRemoveCount + 1);
    });

    await user.click(screen.getAllByRole('button', { name: REMOVE_ITEM_BUTTON })[initialRemoveCount]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: REMOVE_ITEM_BUTTON })).toHaveLength(initialRemoveCount);
    });
  });

  it('surfaces protobuf message-level validation feedback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AutoForm
        defaultValues={{
          ...buildValidProtoDefaults(),
          minimumThreshold: 12,
          maximumThreshold: 4,
        }}
        formOptions={{ mode: 'all' }}
        onSubmit={onSubmit}
        schema={AutoFormExampleSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    expect(screen.getByText(MESSAGE_ERROR_TEXT)).toBeInTheDocument();
  });

  it('populates form from a proto message instance passed as defaultValues', () => {
    const message = create(AutoFormExampleSchema, {
      username: 'proto_user',
      primaryEmail: 'proto@protoform.com',
      homepageUrl: 'https://protoform.com',
      resourceId: '123e4567-e89b-12d3-a456-426614174000',
      bio: 'Created from a proto message instance.',
      age: 28,
      employeeNumber: 5001n,
      storageQuotaBytes: 8192n,
      accessTier: 3,
      minimumThreshold: 1,
      maximumThreshold: 10,
      preferredContact: { case: 'preferredEmail', value: 'proto@protoform.com' },
    });

    render(<AutoForm defaultValues={message as never} onSubmit={vi.fn()} schema={AutoFormExampleSchema} withSubmit />);

    // Proto message ($typeName present) should be normalised into form-friendly values
    expect(screen.getByDisplayValue('proto_user')).toBeInTheDocument();
    // bigint fields are converted to string for form inputs
    expect(screen.getByDisplayValue('5001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8192')).toBeInTheDocument();
  });
});
