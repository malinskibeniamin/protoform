import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditLintExceptions } from './lint-exceptions';

const LINT_CONFIGS = ['biome.jsonc', 'shadcn-lint.jsonc', 'doctor.config.ts'];

const cwd = resolve(import.meta.dirname, '..');
const paths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
  cwd,
  encoding: 'utf8',
})
  .split('\0')
  .filter((file) => file.length > 0 && existsSync(resolve(cwd, file)));
const diagnostics = LINT_CONFIGS.flatMap((file) =>
  auditLintExceptions(file, readFileSync(resolve(cwd, file), 'utf8'), paths)
);
for (const diagnostic of diagnostics) {
  process.stderr.write(`${diagnostic.file}:${diagnostic.line}: ${diagnostic.message}\n`);
}
if (diagnostics.length > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write('Lint exceptions have bounded, live selectors.\n');
}
