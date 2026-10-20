import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { authoredFiles } from './source-files';

const sourceExtensionPattern = /\.(?:astro|[cm]?[jt]sx?|css|html|jsonc?|mdx?|svelte|vue|ya?ml)$/u;
const eslintConfigurationPattern = /\beslint\s+\S/u;

const forbiddenDirectives = [
  ['biome', 'ignore'].join('-'),
  ['eslint', 'disable'].join('-'),
  ['oxlint', 'disable'].join('-'),
  ['prettier', 'ignore'].join('-'),
  ['oxfmt', 'ignore'].join('-'),
  ['react-doctor', 'disable'].join('-'),
  ['@ts', 'expect-error'].join('-'),
  ['@ts', 'ignore'].join('-'),
  ['@ts', 'nocheck'].join('-'),
];

export function findForbiddenDirectives(source: string): string[] {
  const comments: string[] = [];
  const file = ts.createSourceFile('source.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node: ts.Node): void {
    const ranges = [
      ...(ts.getLeadingCommentRanges(source, node.getFullStart()) ?? []),
      ...(ts.getTrailingCommentRanges(source, node.end) ?? []),
    ];
    for (const range of ranges) {
      comments.push(source.slice(range.pos, range.end));
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  for (const match of source.matchAll(/<!--[\s\S]*?-->|^\s*#[^\n]*/gmu)) {
    comments.push(match[0]);
  }
  const text = comments.join('\n').toLowerCase();
  const matches = forbiddenDirectives.filter((directive) => text.includes(directive));
  if (eslintConfigurationPattern.test(text)) {
    matches.push('eslint configuration');
  }
  return matches;
}

function checkNoSuppressions(): void {
  const sourceFiles = authoredFiles().filter((path) => sourceExtensionPattern.test(path));

  const violations: string[] = [];

  for (const path of sourceFiles) {
    for (const directive of findForbiddenDirectives(readFileSync(path, 'utf8'))) {
      violations.push(`${path}: ${directive}`);
    }
  }

  if (violations.length > 0) {
    console.error('Inline quality-rule suppressions are forbidden. Fix the issue; do not bypass the quality gates.');
    console.error(violations.join('\n'));
    process.exitCode = 1;
  } else {
    console.info(`No inline quality-rule suppressions found in ${sourceFiles.length} authored source files.`);
  }
}

if (import.meta.main) {
  checkNoSuppressions();
}
