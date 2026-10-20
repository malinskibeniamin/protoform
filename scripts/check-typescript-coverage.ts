import { spawnSync } from 'node:child_process';
import { isAbsolute, relative, resolve } from 'node:path';
import { authoredFiles } from './source-files';

const typescriptPathPattern = /\.[cm]?[jt]sx?$/u;
const projectRoot = process.cwd();

function run(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stderr.trim()}`);
  }
  return result.stdout;
}

function normalizePath(path: string): string {
  const absolutePath = isAbsolute(path) ? path : resolve(projectRoot, path);
  return relative(projectRoot, absolutePath).replaceAll('\\', '/');
}

const sources = authoredFiles().filter((path) => typescriptPathPattern.test(path));

const compilerFiles = new Set(
  ['tsconfig.json', 'tsconfig.tests.json'].flatMap((config) =>
    run('tsc', ['--project', config, '--listFilesOnly', '--pretty', 'false'])
      .split('\n')
      .filter(Boolean)
      .map(normalizePath)
  )
);

const missingFiles = sources
  .filter((path) => !compilerFiles.has(path))
  .toSorted((left, right) => left.localeCompare(right));

if (missingFiles.length > 0) {
  console.error('Authored TypeScript files missing from the compiler programs:');
  console.error(missingFiles.join('\n'));
  process.exitCode = 1;
} else {
  console.info(`Every authored TypeScript file is covered (${sources.length} files).`);
}
