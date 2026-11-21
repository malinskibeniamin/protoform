import { execFileSync, spawnSync } from 'node:child_process';
import { createHash, type Hash } from 'node:crypto';
import {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { delimiter, join } from 'node:path';

const receiptPath = '.tmp/docs-build.json';
const envFilePattern = /^\.env(?:\.|$)/u;
const started = performance.now();
const commandLabels = new Set(['npm_lifecycle_event', 'npm_lifecycle_script', '_', 'SHLVL']);
const environment = Object.fromEntries(Object.entries(process.env).filter(([name]) => !commandLabels.has(name)));
if (environment['PATH'] !== undefined) {
  environment['PATH'] = [...new Set(environment['PATH'].split(delimiter))].join(delimiter);
}
const toolchain = [
  process.platform,
  process.arch,
  process.execPath,
  process.version,
  execFileSync('bun', ['--version'], { encoding: 'utf8' }).trim(),
];

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}

function hashPath(hash: Hash, path: string, allowLinks: boolean): void {
  const entry = lstatSync(path, { throwIfNoEntry: false });
  if (!entry) {
    if (!allowLinks) {
      throw new Error(`Docs output disappeared while sealing: ${path}`);
    }
    hash.update(JSON.stringify([path, 'missing']));
    return;
  }
  hash.update(JSON.stringify([path, entry.mode]));
  if (entry.isSymbolicLink()) {
    if (!(allowLinks && statSync(path).isFile())) {
      throw new Error(`Cannot seal docs build with symbolic link: ${path}`);
    }
    hash.update(JSON.stringify(readlinkSync(path)));
  } else if (entry.isDirectory()) {
    const names = readdirSync(path).sort((left, right) => left.localeCompare(right));
    for (const name of names) {
      hashPath(hash, join(path, name), allowLinks);
    }
    return;
  } else if (!entry.isFile()) {
    throw new Error(`Cannot seal docs build with special file: ${path}`);
  }
  hash.update(createHash('sha256').update(readFileSync(path)).digest());
}

function inputsDigest(): string {
  const hash = createHash('sha256');
  hash.update(
    JSON.stringify([
      toolchain,
      Object.entries(environment).sort(([left], [right]) => left.localeCompare(right)),
      git(['log', '--format=%H']),
    ])
  );
  hash.update(readFileSync(import.meta.filename));
  const sources = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  const envFiles = readdirSync('.').filter((name) => envFilePattern.test(name));
  const inputPaths = [...new Set([...sources, ...envFiles])].sort((left, right) => left.localeCompare(right));
  for (const path of inputPaths) {
    hashPath(hash, path, true);
  }
  return hash.digest('hex');
}

function outputDigest(): string {
  for (const path of ['dist/index.html', 'dist/llms.txt']) {
    const output = statSync(path);
    if (!output.isFile() || output.size === 0) {
      throw new Error(`Docs build is missing required output: ${path}`);
    }
  }
  const hash = createHash('sha256');
  hashPath(hash, 'dist', false);
  return hash.digest('hex');
}

function canReuse(expectedInputs: string): boolean {
  try {
    const receipt: unknown = JSON.parse(readFileSync(receiptPath, 'utf8'));
    return (
      typeof receipt === 'object' &&
      receipt !== null &&
      'inputs' in receipt &&
      receipt.inputs === expectedInputs &&
      'output' in receipt &&
      receipt.output === outputDigest()
    );
  } catch {
    return false;
  }
}

const inputs = inputsDigest();
if (canReuse(inputs) && inputsDigest() === inputs) {
  console.info(
    `Reused sealed strict docs build (${Math.round(performance.now() - started)}ms; ${inputs.slice(0, 12)}).`
  );
} else {
  rmSync(receiptPath, { force: true });
  rmSync('dist', { force: true, recursive: true });
  const build = spawnSync('bun', ['run', 'docs:blume:compile'], { stdio: 'inherit', env: environment });
  if (build.error) {
    throw build.error;
  }
  if (build.status === 0) {
    const output = outputDigest();
    if (inputsDigest() !== inputs) {
      throw new Error('Docs inputs changed during build; rerun against a stable source tree.');
    }
    mkdirSync('.tmp', { recursive: true });
    const temporaryReceipt = `.tmp/docs-build-${process.pid}.json`;
    writeFileSync(temporaryReceipt, JSON.stringify({ inputs, output }));
    renameSync(temporaryReceipt, receiptPath);
    console.info(`Sealed strict docs build (${Math.round(performance.now() - started)}ms; ${inputs.slice(0, 12)}).`);
  } else {
    process.exitCode = build.status ?? 1;
    if (build.signal === 'SIGINT') {
      process.exitCode = 130;
    }
    if (build.signal === 'SIGTERM') {
      process.exitCode = 143;
    }
  }
}
