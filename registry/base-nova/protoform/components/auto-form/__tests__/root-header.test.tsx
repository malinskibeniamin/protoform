import { create, setExtension } from '@bufbuild/protobuf';
import { MessageOptionsSchema } from '@bufbuild/protobuf/wkt';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoFormExampleSchema } from '../../../lib/protobuf-provider/gen/auto-form-example_pb';
import {
  message_ui,
  MessageUiOptionsSchema,
} from '../../../lib/protobuf-provider/gen/protoform/v1/auto_form_ui_pb';

import { AutoForm } from '../index';

const originalOptions = AutoFormExampleSchema.proto.options;

describe('AutoForm root header', () => {
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

  it('renders schema metadata by default', () => {
    render(<AutoForm schema={AutoFormExampleSchema} />);

    expect(screen.getByRole('heading', { name: 'Request settings' })).toBeInTheDocument();
    expect(screen.getByText('Configure the request.')).toBeInTheDocument();
  });

  it('uses a host renderer with the resolved root metadata', () => {
    const renderRootHeader = vi.fn(({ title, description }) => (
      <aside aria-label="Form introduction">
        {title ?? 'Untitled'}: {description ?? 'No description'}
      </aside>
    ));

    render(<AutoForm renderRootHeader={renderRootHeader} schema={AutoFormExampleSchema} />);

    expect(renderRootHeader).toHaveBeenCalledWith({
      description: 'Configure the request.',
      title: 'Request settings',
    });
    expect(screen.getByRole('complementary', { name: 'Form introduction' })).toHaveTextContent(
      'Request settings: Configure the request.'
    );
  });

  it('can hide the root header without invoking a host renderer', () => {
    const renderRootHeader = vi.fn(() => <div>Hidden introduction</div>);

    render(
      <AutoForm
        renderRootHeader={renderRootHeader}
        rootHeader="hidden"
        schema={AutoFormExampleSchema}
      />
    );

    expect(renderRootHeader).not.toHaveBeenCalled();
    expect(screen.queryByText('Hidden introduction')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
  });
});
