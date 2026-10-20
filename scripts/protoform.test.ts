import { parseProtoformCliArguments } from './protoform';

declare const { describe, expect, test }: typeof import('bun:test');

describe('protoform CLI', () => {
  test('parses audit targets and the requested output format', () => {
    expect(parseProtoformCliArguments(['audit', 'forms/audit.ts', '--format', 'sarif'])).toEqual({
      command: 'audit',
      configPaths: ['forms/audit.ts'],
      format: 'sarif',
    });
  });

  test('rejects unsupported commands and formats', () => {
    expect(() => parseProtoformCliArguments(['check'])).toThrow('Unknown command');
    expect(() => parseProtoformCliArguments(['audit', '--format', 'yaml'])).toThrow('Unsupported format');
  });
});
