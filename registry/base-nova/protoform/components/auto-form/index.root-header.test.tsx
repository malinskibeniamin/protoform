import { create, setExtension } from '@bufbuild/protobuf';
import { MessageOptionsSchema } from '@bufbuild/protobuf/wkt';
import { afterEach, beforeEach, describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { AutoFormExampleSchema } from '../../lib/protobuf-provider/gen/auto-form-example_pb';
import { MessageUiOptionsSchema, message_ui } from '../../lib/protobuf-provider/gen/protoform/v1/auto_form_ui_pb';

import { AutoForm } from '.';
import type { AutoFormRootHeaderMetadata } from './types';

const originalOptions = AutoFormExampleSchema.proto.options;

describe('autoForm root header', () => {
  beforeEach(() => {
    const options = create(MessageOptionsSchema);
    setExtension(
      options,
      message_ui,
      create(MessageUiOptionsSchema, {
        description: 'Configure the request.',
        title: 'Request settings',
      })
    );
    AutoFormExampleSchema.proto.options = options;
  });

  afterEach(() => {
    AutoFormExampleSchema.proto.options = originalOptions;
  });

  test('shows schema metadata by default and accepts a replacement or hidden header', () => {
    const { rerender } = render(<AutoForm schema={AutoFormExampleSchema} />);
    expect(screen.getByRole('heading', { name: 'Request settings' })).toBeVisible();
    expect(screen.getByText('Configure the request.')).toBeVisible();

    function renderRootHeader({ title, description }: AutoFormRootHeaderMetadata) {
      return (
        <aside aria-label="Form introduction">
          {title ?? 'Untitled'}: {description ?? 'No description'}
        </aside>
      );
    }
    rerender(<AutoForm renderRootHeader={renderRootHeader} schema={AutoFormExampleSchema} />);
    expect(screen.getByRole('complementary', { name: 'Form introduction' })).toHaveTextContent(
      'Request settings: Configure the request.'
    );

    rerender(<AutoForm renderRootHeader={renderRootHeader} rootHeader="hidden" schema={AutoFormExampleSchema} />);
    expect(screen.queryByRole('complementary', { name: 'Form introduction' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/iu })).toBeVisible();
  });
});
