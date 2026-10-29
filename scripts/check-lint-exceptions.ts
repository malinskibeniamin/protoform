import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditLintExceptions, newLintExceptions } from './lint-exceptions';

const LINT_CONFIGS = ['biome.jsonc', 'shadcn-lint.jsonc', 'doctor.config.ts', '.oxlintrc.jsonc'];

const cwd = resolve(import.meta.dirname, '..');
const paths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
  cwd,
  encoding: 'utf8',
})
  .split('\0')
  .filter((file) => file.length > 0 && existsSync(resolve(cwd, file)));
const diagnostics = LINT_CONFIGS.flatMap((file) => {
  const source = readFileSync(resolve(cwd, file), 'utf8');
  const baseline = execFileSync('git', ['show', `origin/main:${file}`], { cwd, encoding: 'utf8' });
  return [
    ...auditLintExceptions(file, source, paths),
    ...newLintExceptions(file, source, baseline).map(() => ({
      file,
      line: 1,
      message: 'An enforced rule gained or broadened an exemption. Fix the source instead.',
    })),
  ];
});
for (const diagnostic of diagnostics) {
  process.stderr.write(`${diagnostic.file}:${diagnostic.line}: ${diagnostic.message}\n`);
}
if (diagnostics.length > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write('Lint exceptions have bounded, live selectors.\n');
}
