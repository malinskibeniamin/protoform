import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import shadcn from '@shadcn/lint';
import ts from 'typescript';
import { z } from 'zod';
import doctorConfig from '../doctor.config';
import { authoredFiles } from './source-files';

const objectSchema = z.record(z.string(), z.unknown());
const groups = ['A11y', 'Complexity', 'Correctness', 'Nursery', 'Performance', 'Security', 'Style', 'Suspicious'];

function object(value: unknown): Record<string, unknown> {
  return objectSchema.parse(value);
}

function readConfig(file: string): Record<string, unknown> {
  const value: unknown = ts.parseConfigFileTextToJson(file, readFileSync(file, 'utf8')).config;
  return object(value);
}

function checkCatalog(tool: string, available: string[], configured: Record<string, unknown>): void {
  const expected = new Set(available);
  const actual = Object.keys(configured);
  const missing = available.filter((rule) => !Object.hasOwn(configured, rule));
  const obsolete = actual.filter((rule) => !expected.has(rule));
  if (missing.length > 0 || obsolete.length > 0) {
    throw new Error(
      `${tool}: review new/removed rules individually. Missing: ${missing.join(', ')}. Removed: ${obsolete.join(', ')}.`
    );
  }
  for (const [rule, config] of Object.entries(configured)) {
    let severity: unknown = config;
    if (Array.isArray(config)) {
      const values: unknown[] = config;
      [severity] = values;
    } else if (typeof config === 'object' && config !== null) {
      severity = object(config)['level'];
    }
    if (severity !== 'error' && severity !== 'off') {
      throw new Error(`${tool}/${rule}: use an error or an explicitly reviewed off decision, never advisory warnings.`);
    }
  }
}

const qualityConfigPattern =
  /(?:^|\/)(?:biome\.jsonc?|\.(?:eslint|prettier|oxlint|biome)ignore|\.oxlintrc(?:\.jsonc?)?|(?:oxlint\.config|doctor\.config|\.oxfmtrc|oxfmt\.config)\.(?:jsonc?|[cm]?[jt]s))$/u;
const canonicalConfigs = new Set(['biome.jsonc', '.oxlintrc.jsonc', 'doctor.config.ts', '.oxfmtrc.json']);
const shadowConfigs = authoredFiles().filter((file) => qualityConfigPattern.test(file) && !canonicalConfigs.has(file));
if (shadowConfigs.length > 0) {
  throw new Error(`Nested/alternate quality configs are forbidden: ${shadowConfigs.join(', ')}`);
}
const biome = readConfig('biome.jsonc');
if (object(biome['linter'])['enabled'] !== true || object(biome['formatter'])['enabled'] !== true) {
  throw new Error('Biome linting and formatting must both remain enabled.');
}
const definitions = object(readConfig('node_modules/@biomejs/biome/configuration_schema.json')['$defs']);
const biomeRules = object(object(biome['linter'])['rules']);
for (const group of groups) {
  const names = Object.keys(object(object(definitions[group])['properties'])).filter(
    (name) => name !== 'preset' && name !== 'recommended'
  );
  checkCatalog(`Biome ${group}`, names, object(biomeRules[group.toLowerCase()]));
}

const availableOxlint = z
  .array(z.object({ scope: z.string(), value: z.string() }))
  .parse(JSON.parse(execFileSync('oxlint', ['--rules', '--format', 'json'], { encoding: 'utf8' })));
checkCatalog(
  'Oxlint',
  availableOxlint.map(({ scope, value }) => (scope === 'eslint' ? value : `${scope.replaceAll('_', '-')}/${value}`)),
  object(readConfig('.oxlintrc.jsonc')['rules'])
);

checkCatalog(
  'shadcn',
  Object.keys(shadcn.rules).map((rule) => `shadcn/${rule}`),
  Object.fromEntries(
    Object.entries(object(readConfig('shadcn-lint.jsonc')['rules'])).filter(([rule]) => rule.startsWith('shadcn/'))
  )
);

const availableDoctor = z
  .array(z.object({ key: z.string() }))
  .parse(JSON.parse(execFileSync('react-doctor', ['rules', 'list', '--json'], { encoding: 'utf8' })));
checkCatalog(
  'React Doctor',
  availableDoctor.map(({ key }) => key),
  object(doctorConfig.rules)
);
console.info('Every installed Biome, Oxlint, shadcn and React Doctor rule has an explicit error/off decision.');
