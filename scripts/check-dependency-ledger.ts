import { readFileSync } from 'node:fs';
import { z } from 'zod';

const manifest = z
  .looseObject({
    dependencies: z.record(z.string(), z.string()),
    devDependencies: z.record(z.string(), z.string()),
  })
  .parse(JSON.parse(readFileSync('package.json', 'utf8')));
const ledger = readFileSync('docs/dependencies.md', 'utf8');

function ledgerRows(heading: string): string[] {
  const start = ledger.indexOf(`\n## ${heading}\n`);
  if (start === -1) {
    throw new Error(`docs/dependencies.md: missing "## ${heading}" section.`);
  }
  const end = ledger.indexOf('\n## ', start + 1);
  return [...ledger.slice(start, end === -1 ? undefined : end).matchAll(/^\|\s*`([^`]+)`\s*\|/gmu)].map(
    (match) => match[1] ?? ''
  );
}

function compare(heading: string, packageNames: string[]): string[] {
  const rows = ledgerRows(heading);
  const documented = new Set(rows);
  const expected = new Set(packageNames);
  const problems = [
    ...packageNames.filter((name) => !documented.has(name)).map((name) => `${name} has no row`),
    ...rows.filter((name) => !expected.has(name)).map((name) => `${name} is not installed here`),
    ...rows.filter((name, index) => rows.indexOf(name) !== index).map((name) => `${name} is listed twice`),
  ];
  return problems.map((problem) => `${heading}: ${problem}`);
}

const installed = new Set([...Object.keys(manifest.dependencies), ...Object.keys(manifest.devDependencies)]);
const problems = [
  ...compare('Runtime dependencies', Object.keys(manifest.dependencies)),
  ...compare('Development dependencies', Object.keys(manifest.devDependencies)),
  ...ledgerRows('Removed')
    .filter((name) => installed.has(name))
    .map((name) => `Removed: ${name} is still installed`),
];
if (problems.length > 0) {
  throw new Error(`docs/dependencies.md is out of date with package.json:\n- ${problems.join('\n- ')}`);
}
console.info(`Every one of ${installed.size} direct packages has a justification in docs/dependencies.md.`);
