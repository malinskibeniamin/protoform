import { describe, expect, it } from 'vitest';

import {
  inspectAutoFormConfiguration,
  type AutoFormConfigurationDiagnostic,
} from '../configuration';
import { defaultRegistry } from '../fields';
import { createMockProvider } from './test-utils';

const schema = createMockProvider([
  {
    key: 'settings',
    required: true,
    schema: [
      { key: 'source', required: true, type: 'string' },
      { key: 'count', required: false, type: 'number' },
      {
        key: 'tags',
        required: false,
        schema: [{ key: 'value', required: true, type: 'string' }],
        type: 'array',
      },
      {
        key: 'payload',
        required: false,
        schema: [{ key: 'name', required: true, type: 'string' }],
        type: 'object',
      },
    ],
    type: 'object',
  },
]);

describe('inspectAutoFormConfiguration', () => {
  it('returns deterministic diagnostics for every nested configuration defect', () => {
    const diagnostics = inspectAutoFormConfiguration({
      dataProviders: {},
      fieldConfig: {
        'settings.count': { emptyRepeatedStringPolicy: 'preserve' },
        'settings.missing': {},
        'settings.payload': { customData: { dataProvider: 'payloads' } },
        'settings.source': {
          customData: { dataProvider: 'sources' },
          fieldType: 'missing-renderer',
        },
      },
      fieldRegistry: defaultRegistry,
      schema,
    });

    expect(diagnostics).toEqual<AutoFormConfigurationDiagnostic[]>([
      {
        code: 'unsupported-configuration',
        message: 'emptyRepeatedStringPolicy is supported only on repeated string fields.',
        path: 'settings.count',
        severity: 'error',
      },
      {
        code: 'invalid-configuration-path',
        message: 'Field configuration path "settings.missing" does not exist in the schema.',
        path: 'settings.missing',
        severity: 'error',
      },
      {
        code: 'missing-data-provider',
        message: 'Data provider "payloads" is not registered.',
        path: 'settings.payload',
        severity: 'error',
      },
      {
        code: 'unsupported-configuration',
        message: 'Data providers are supported only on scalar string or number fields.',
        path: 'settings.payload',
        severity: 'error',
      },
      {
        code: 'missing-data-provider',
        message: 'Data provider "sources" is not registered.',
        path: 'settings.source',
        severity: 'error',
      },
      {
        code: 'missing-renderer',
        message: 'Renderer "missing-renderer" is not registered.',
        path: 'settings.source',
        severity: 'error',
      },
    ]);
  });

  it('accepts registered renderers, providers, and supported nested configuration', () => {
    const CustomRenderer = () => null;
    const fieldRegistry = defaultRegistry.clone().register({
      component: CustomRenderer,
      match: (field) => field.key === 'source',
      name: 'code',
      priority: 1000,
    });

    expect(
      inspectAutoFormConfiguration({
        dataProviders: { sources: () => ({ options: [] }) },
        fieldConfig: {
          'settings.source': {
            customData: { dataProvider: 'sources' },
            fieldType: 'code',
          },
          'settings.tags': { emptyRepeatedStringPolicy: 'preserve' },
        },
        fieldRegistry,
        schema,
      })
    ).toEqual([]);
  });
});
