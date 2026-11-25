import { consumerDependencyVersion } from './registry-dependencies';

declare const { describe, expect, test }: typeof import('bun:test');

describe('installed consumer version matrix', () => {
  test('tests exact advertised floors and resolves current versions only inside supported ranges', () => {
    expect(consumerDependencyVersion('^1.9.0', 'floor')).toBe('1.9.0');
    expect(consumerDependencyVersion('~6.0.2', 'floor')).toBe('6.0.2');
    expect(consumerDependencyVersion('^1.9.0', 'current')).toBe('^1.9.0');
    expect(consumerDependencyVersion('9.3.1', 'current')).toBe('9.3.1');
    expect(consumerDependencyVersion('npm:@typescript/typescript6@^6.0.2', 'floor')).toBe(
      'npm:@typescript/typescript6@6.0.2'
    );
    expect(consumerDependencyVersion('npm:react-hook-form@8.0.0-beta.5', 'floor')).toBe(
      'npm:react-hook-form@8.0.0-beta.5'
    );
    expect(consumerDependencyVersion('npm:@tanstack/react-form@2.0.0-alpha.3', 'current')).toBe(
      'npm:@tanstack/react-form@2.0.0-alpha.3'
    );
    expect(() => consumerDependencyVersion('latest', 'floor')).toThrow('Unsupported consumer dependency range');
  });
});
