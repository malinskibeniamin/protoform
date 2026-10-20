import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import generatedSources from './generated-sources.json' with { type: 'json' };

const generated = new Set(generatedSources);

export function isGeneratedSource(path: string): boolean {
  return generated.has(path);
}

export function authoredFiles(): string[] {
  return [
    ...new Set(
      execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
        encoding: 'utf8',
      }).split('\0')
    ),
  ].filter((path) => path.length > 0 && existsSync(path) && !isGeneratedSource(path));
}
