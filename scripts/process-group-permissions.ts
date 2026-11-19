export function resolveDeniedGroupSignal(
  error: Error,
  group: number,
  liveMembers: readonly string[],
  now: number,
  deadline: number
) {
  if (liveMembers.length === 0) {
    return 'exited';
  }
  if (now >= deadline) {
    throw new Error(`${error.message}; live test-server group ${group}: ${liveMembers.join('; ')}`, { cause: error });
  }
  return 'retry';
}
