import { describe, expect, test } from '@rstest/core';
import { FormikExample } from './formik-form.js';
import { exerciseProfileForm } from './profile-form.test-utils';

describe('formik example', () => {
  test('validates with Formik and submits a typed protobuf message', async () => {
    expect(await exerciseProfileForm(FormikExample)).toHaveTextContent('profiles/ada-lovelace');
  });
});
