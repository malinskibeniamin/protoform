import { isGeneratedSource } from './source-files';

declare const { describe, expect, test }: typeof import('bun:test');

describe('quality source ownership', () => {
  test('does not trust generated-looking names or directories', () => {
    for (const file of ['new/gen/escape.ts', 'components/escape.gen.ts', 'examples/not_generated_pb.ts']) {
      expect(isGeneratedSource(file)).toBe(false);
    }
  });

  test('recognizes checked-in generator outputs by exact path', () => {
    expect(isGeneratedSource('examples/gen/protoform/examples/v1/forms_pb.ts')).toBe(true);
    expect(isGeneratedSource('registry/base-nova/protoform/components/input/index.tsx')).toBe(false);
  });
});
