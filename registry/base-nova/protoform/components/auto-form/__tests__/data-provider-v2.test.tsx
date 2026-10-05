import { describe, expect, rs } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { DataProviderProps, DataProviderRequest } from '../data-providers';
import { AutoForm } from '../index';
import { createMockProvider } from './test-utils';

const strictModeSignals: AbortSignal[] = [];
function useReplayRegions({ signal }: DataProviderRequest) {
  React.useEffect(
    function loadRegions() {
      if (signal) {
        strictModeSignals.push(signal);
      }
    },
    [signal]
  );
  return { options: [{ label: 'Europe', value: 'eu' }] };
}
const pagedRequests: DataProviderRequest[] = [];
function pagedMethodsProvider(request: DataProviderRequest) {
  pagedRequests.push(request);
  return request.cursor !== undefined && request.cursor !== ''
    ? { options: [{ label: 'POST', value: 'post' }] }
    : { options: [{ label: 'GET', value: 'get' }], nextCursor: 'page-2' };
}

const componentProviderRequests: DataProviderRequest[] = [];

function RegionsProvider({ children, request }: DataProviderProps) {
  componentProviderRequests.push(request);
  return children({ options: [{ label: 'Europe', value: 'eu' }] });
}

function useStatefulRegions() {
  React.useId();
  return { options: [{ label: 'Europe', value: 'eu' }] };
}

function useStaticRegions() {
  return { options: [{ label: 'Asia', value: 'asia' }] };
}

function useMethods() {
  React.useId();
  return { options: [{ label: 'GET', value: 'get' }] };
}

function useFailingMethods() {
  return { error: new Error('Service unavailable'), options: [] };
}

function EmptyRegionsProvider({ children }: DataProviderProps) {
  return children({ emptyState: <a href="/regions/new">Create a region</a>, options: [] });
}

describe('AutoForm data providers v2', () => {
  test('provides a live signal after StrictMode effect replay and cancels it on unmount', async () => {
    strictModeSignals.length = 0;
    const schema = createMockProvider([
      { key: 'region', type: 'string', required: false, fieldConfig: { customData: { dataProvider: 'regions' } } },
    ]);
    const view = render(
      <React.StrictMode>
        <AutoForm dataProviders={{ regions: useReplayRegions }} schema={schema} />
      </React.StrictMode>
    );
    await waitFor(() => expect(strictModeSignals.at(-1)?.aborted).toBe(false));
    const liveSignal = strictModeSignals.at(-1);
    view.unmount();
    expect(liveSignal?.aborted).toBe(true);
  });

  test('supplies search, cursor, dependencies, selected values, cancellation, and stale-selection policy', async () => {
    const user = userEvent.setup();
    const requests: DataProviderRequest[] = [];
    const schema = createMockProvider(
      [
        { key: 'project', required: true, type: 'string' },
        {
          fieldConfig: { customData: { dataProvider: 'regions' } },
          key: 'region',
          required: true,
          type: 'string',
        },
      ],
      { project: 'project-a', region: 'retired-region' }
    );

    const view = render(
      <AutoForm
        dataProviders={{
          regions: {
            dependencies: ['project'],
            staleSelection: 'error',
            useProvider: (request) => {
              requests.push(request);
              if (request.cursor) {
                return {
                  options: [{ label: 'Eurasia', value: 'eurasia' }],
                };
              }
              return {
                nextCursor: 'page-2',
                options: [{ label: 'Europe', value: 'eu' }],
              };
            },
          },
        }}
        formatMessage={(code, _params, fallback) =>
          code === 'auto_form.select.stale' ? 'Selection unavailable' : fallback
        }
        schema={schema}
      />
    );

    expect(requests.at(-1)).toMatchObject({
      cursor: undefined,
      dependencyValues: { project: 'project-a' },
      fieldPath: 'region',
      query: '',
      selectedValues: ['retired-region'],
    });
    const initialSignal = requests.at(-1)?.signal;
    expect(screen.queryByRole('alert')).toBeNull();

    await user.clear(screen.getByRole('textbox', { name: /Project/u }));
    await user.paste('project-b');
    await waitFor(() => expect(requests.at(-1)?.dependencyValues).toEqual({ project: 'project-b' }));
    expect(initialSignal?.aborted).toBe(true);

    await user.clear(screen.getByRole('combobox', { name: /Region/u }));
    await user.paste('eur');
    expect(requests.at(-1)).toMatchObject({ query: 'eur' });

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(requests.at(-1)).toMatchObject({ cursor: 'page-2', query: 'eur' });
    await user.click(screen.getByRole('combobox', { name: /Region/u }));
    expect(screen.getByText('Europe')).toBeVisible();
    expect(screen.getByText('Eurasia')).toBeVisible();

    const activeSignal = requests.at(-1)?.signal;
    expect(activeSignal?.aborted).toBe(false);
    view.unmount();
    expect(activeSignal?.aborted).toBe(true);
  });

  test('keeps a selected value present in the first page and clears optional numeric values without coercing them to zero', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema = createMockProvider(
      [
        {
          fieldConfig: { customData: { dataProvider: 'regions' } },
          key: 'regionId',
          required: false,
          type: 'number',
        },
      ],
      { regionId: 7 }
    );

    render(
      <AutoForm
        dataProviders={{ regions: () => ({ options: [{ label: 'Europe', value: '7' }] }) }}
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ regionId: undefined });

    cleanup();
    const onSubmitKept = rs.fn();
    const schemaKept = createMockProvider(
      [
        {
          fieldConfig: { customData: { dataProvider: 'regions' } },
          key: 'region',
          required: true,
          type: 'string',
        },
      ],
      { region: 'eu' }
    );

    render(
      <AutoForm
        dataProviders={{
          regions: {
            staleSelection: 'clear',
            useProvider: () => ({ options: [{ label: 'Europe', value: 'eu' }] }),
          },
        }}
        onSubmit={onSubmitKept}
        schema={schemaKept}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmitKept).toHaveBeenCalledTimes(1));
    expect(onSubmitKept.mock.calls[0]?.[0]).toMatchObject({ region: 'eu' });
  });

  test('aborts a repeated-field provider when a dependency changes', async () => {
    const user = userEvent.setup();
    const requests: DataProviderRequest[] = [];
    const schema = createMockProvider(
      [
        { key: 'project', required: true, type: 'string' },
        {
          key: 'methods',
          required: false,
          schema: [
            {
              fieldConfig: { customData: { dataProvider: 'methods' } },
              key: 'value',
              required: true,
              type: 'string',
            },
          ],
          type: 'array',
        },
      ],
      { methods: ['get'], project: 'project-a' }
    );

    render(
      <AutoForm
        dataProviders={{
          methods: {
            dependencies: ['project'],
            useProvider: (request) => {
              requests.push(request);
              return { options: [{ label: 'GET', value: 'get' }] };
            },
          },
        }}
        schema={schema}
      />
    );

    const initialSignal = requests.at(-1)?.signal;
    await user.clear(screen.getByRole('textbox', { name: /Project/u }));
    await user.paste('project-b');
    await waitFor(() => expect(requests.at(-1)?.dependencyValues).toEqual({ project: 'project-b' }));
    expect(initialSignal?.aborted).toBe(true);
  });

  test('renders options from a component provider', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [{ fieldConfig: { customData: { dataProvider: 'regions' } }, key: 'region', required: true, type: 'string' }],
      {}
    );

    render(<AutoForm dataProviders={{ regions: { component: RegionsProvider } }} schema={schema} />);

    expect(componentProviderRequests.at(-1)).toMatchObject({ fieldPath: 'region', query: '' });
    await user.click(screen.getByRole('combobox', { name: /Region/u }));
    expect(screen.getByText('Europe')).toBeVisible();
  });

  test('replaces a select provider with one that calls different hooks', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [{ fieldConfig: { customData: { dataProvider: 'regions' } }, key: 'region', required: true, type: 'string' }],
      {}
    );
    const view = render(<AutoForm dataProviders={{ regions: useStatefulRegions }} schema={schema} />);
    view.rerender(<AutoForm dataProviders={{ regions: useStaticRegions }} schema={schema} />);

    await user.click(screen.getByRole('combobox', { name: /Region/u }));
    expect(screen.getByText('Asia')).toBeVisible();
  });

  test('renders a multi-select provider registered after the first render', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        {
          key: 'methods',
          required: false,
          schema: [
            { fieldConfig: { customData: { dataProvider: 'methods' } }, key: 'value', required: true, type: 'string' },
          ],
          type: 'array',
        },
      ],
      { methods: [] }
    );
    const view = render(<AutoForm dataProviders={{}} schema={schema} />);
    view.rerender(<AutoForm dataProviders={{ methods: useMethods }} schema={schema} />);

    await user.click(screen.getByRole('button', { name: 'Multi-select trigger' }));
    expect(screen.getByText('GET')).toBeVisible();
  });

  test('keeps multi-select values and reports the failure when the provider errors', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema = createMockProvider(
      [
        {
          key: 'methods',
          required: false,
          schema: [
            { fieldConfig: { customData: { dataProvider: 'methods' } }, key: 'value', required: true, type: 'string' },
          ],
          type: 'array',
        },
      ],
      { methods: ['get'] }
    );

    render(
      <AutoForm
        dataProviders={{
          methods: { staleSelection: 'clear', useProvider: useFailingMethods },
        }}
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ methods: ['get'] });
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load options');
    expect(screen.getByRole('button', { name: 'Multi-select trigger' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('get')).toBeVisible();
  });

  test("renders the provider's empty state when it returns no options", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [{ fieldConfig: { customData: { dataProvider: 'regions' } }, key: 'region', required: true, type: 'string' }],
      {}
    );

    render(<AutoForm dataProviders={{ regions: { component: EmptyRegionsProvider } }} schema={schema} />);

    await user.click(screen.getByRole('combobox', { name: /Region/u }));
    expect(screen.getByRole('link', { name: 'Create a region' })).toBeVisible();
    expect(screen.queryByText('No options found.')).toBeNull();
  });

  test("puts the control test id on the provider select's input", () => {
    const schema = createMockProvider(
      [{ fieldConfig: { customData: { dataProvider: 'regions' } }, key: 'region', required: true, type: 'string' }],
      {}
    );

    render(<AutoForm dataProviders={{ regions: { component: RegionsProvider } }} schema={schema} testId="deploy" />);

    expect(screen.getByTestId('deploy-field-region-control')).toBe(screen.getByRole('combobox', { name: /Region/u }));
  });

  test("renders the provider's empty state in a multi-select with no options", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        {
          key: 'methods',
          required: false,
          schema: [
            { fieldConfig: { customData: { dataProvider: 'methods' } }, key: 'value', required: true, type: 'string' },
          ],
          type: 'array',
        },
      ],
      { methods: [] }
    );

    render(<AutoForm dataProviders={{ methods: { component: EmptyRegionsProvider } }} schema={schema} />);

    await user.click(screen.getByRole('button', { name: 'Multi-select trigger' }));
    expect(screen.getByRole('link', { name: 'Create a region' })).toBeVisible();
    expect(screen.queryByText('No items found')).toBeNull();
  });
});

test('multi-select paginates and preserves selections absent from an incomplete or searched page', async () => {
  const user = userEvent.setup();
  pagedRequests.length = 0;
  const onSubmit = rs.fn();
  render(
    <AutoForm
      dataProviders={{ methods: { useProvider: pagedMethodsProvider, staleSelection: 'clear' } }}
      onSubmit={onSubmit}
      schema={createMockProvider(
        [
          {
            key: 'methods',
            type: 'array',
            required: false,
            schema: [
              {
                key: 'value',
                type: 'string',
                required: false,
                fieldConfig: { customData: { dataProvider: 'methods' } },
              },
            ],
          },
        ],
        { methods: ['post'] }
      )}
      withSubmit
    />
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ methods: ['post'] });
  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect(pagedRequests.at(-1)?.cursor).toBe('page-2');
  await user.click(screen.getByRole('button', { name: 'Multi-select trigger' }));
  expect(screen.getByRole('option', { name: 'GET' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'POST' })).toBeVisible();
  await user.type(screen.getByPlaceholderText('Search…'), 'post');
  expect(pagedRequests.at(-1)).toMatchObject({ query: 'post', cursor: undefined, selectedValues: ['post'] });
});
