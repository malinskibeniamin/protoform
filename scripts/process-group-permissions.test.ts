import { resolveDeniedGroupSignal } from './process-group-permissions';

declare const { expect, test }: typeof import('bun:test');

test('only tolerates a denied process-group signal if the group has exited or can still be retried', () => {
  const denied = new Error('kill EPERM');
  const live = ['451 453 451 501 S node'];
  expect(resolveDeniedGroupSignal(denied, 451, [], 10, 10)).toBe('exited');
  expect(resolveDeniedGroupSignal(denied, 451, live, 9, 10)).toBe('retry');
  expect(() => resolveDeniedGroupSignal(denied, 451, live, 10, 10)).toThrow(
    'kill EPERM; live test-server group 451: 451 453 451 501 S node'
  );
});
