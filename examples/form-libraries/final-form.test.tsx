import { describe, expect, test } from '@rstest/core';
import { FinalFormExample } from './final-form.js';
import { exerciseProfileForm } from './profile-form.test-utils';

describe('final Form example', () => {
  test('validates with Final Form and submits a typed protobuf message', async () => {
    expect(await exerciseProfileForm(FinalFormExample)).toHaveTextContent('profiles/ada-lovelace');
  });
});
