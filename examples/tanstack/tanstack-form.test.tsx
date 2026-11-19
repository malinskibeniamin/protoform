import { describe, expect, test } from '@rstest/core';
import { exerciseProfileForm } from '../form-libraries/profile-form.test-utils';
import { TanStackFormExample } from './tanstack-form.js';

describe('tanStack Form example', () => {
  test('submits the Standard Schema output as a typed protobuf message', async () => {
    expect(await exerciseProfileForm(TanStackFormExample)).toHaveTextContent('profiles/ada-lovelace');
  });
});
