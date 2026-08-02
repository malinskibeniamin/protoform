export function unexpectedChildExitCode(
  stopping: boolean,
  code: number | null,
  signal: string | null
): number | null {
  if (stopping) {
    return null;
  }
  if (signal || code === null || code === 0) {
    return 1;
  }
  return code;
}
