import { spawnSync } from 'node:child_process';
import { stripVTControlCharacters } from 'node:util';
import { authoredFiles } from './source-files';

const biomeExtension = /\.(?:[cm]?[jt]sx?|astro|s?css|graphql|html|jsonc?|md|ya?ml)$/u;
const oxlintExtension = /\.(?:[cm]?[jt]sx?|astro)$/u;
const processedFilePattern = /^\s*- (.+)$/gmu;

const result = spawnSync(
  'biome',
  ['check', '.', '--verbose', '--formatter-enabled=false', '--assist-enabled=false', '--max-diagnostics=none'],
  { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
);
if (result.error) {
  throw result.error;
}
const output = stripVTControlCharacters(`${result.stdout}\n${result.stderr}`);
const processed = output.split('Files processed:')[1]?.split('Files fixed:')[0] ?? '';
const biomeFiles = new Set([...processed.matchAll(processedFilePattern)].map((match) => match[1]));
const oxlint = spawnSync('oxlint', ['--config', '.oxlintrc.jsonc', '--debug', 'files'], {
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});
if (oxlint.error || oxlint.status !== 0) {
  throw oxlint.error ?? new Error(oxlint.stderr);
}
const oxlintFiles = new Set(oxlint.stdout.trim().split('\n'));
const missing = authoredFiles().flatMap((path) => [
  ...(biomeExtension.test(path) && !biomeFiles.has(path) ? [`Biome: ${path}`] : []),
  ...(oxlintExtension.test(path) && !oxlintFiles.has(path) ? [`Oxlint: ${path}`] : []),
]);
if (missing.length > 0) {
  throw new Error(`Authored files escaped lint coverage:\n${missing.join('\n')}`);
}
console.info(`Lint coverage verified: ${biomeFiles.size} Biome files; ${oxlintFiles.size} Oxlint files.`);
