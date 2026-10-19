import { execFileSync } from 'node:child_process';
import { z } from 'zod';

import manifest from '../package.json' with { type: 'json' };

declare const { expect, test }: typeof import('bun:test');

const runStep = z.object({ run: z.string() });
const workflowSchema = z.object({
  jobs: z.object({
    verify: z.object({
      steps: z.array(
        z.object({
          parallel: z.array(runStep).optional(),
          run: z.string().optional(),
        })
      ),
    }),
  }),
});
const workflow = workflowSchema.parse(
  JSON.parse(
    execFileSync(
      'bun',
      ['--eval', "console.log(JSON.stringify(Bun.YAML.parse(await Bun.file('.github/workflows/ci.yml').text())))"],
      { encoding: 'utf8' }
    )
  )
);
const { steps } = workflow.jobs.verify;
const commandSeparator = /\s*(?:\n|&&)\s*/u;

test('runs every local quality gate check exactly once in the workflow', () => {
  const expected = manifest.scripts['quality:gate'].split(commandSeparator);
  const gateCommands = new Set(expected);
  const actual = steps.flatMap((step) =>
    (step.parallel ?? [step]).flatMap((child) =>
      (child.run ?? '').split(commandSeparator).filter((command) => gateCommands.has(command))
    )
  );

  expect(actual.toSorted()).toEqual(expected.toSorted());
});

test.each(['bun run lint', 'bun run typecheck', 'bun run doctor:strict'])(
  'finishes unit and integration lint fixtures before parallel %s',
  (command) => {
    const unitPhase = steps.findIndex((step) => step.run === 'bun run test:unit');
    const integrationPhase = steps.findIndex((step) => step.run === 'bun run test:integration');
    const analysisPhase = steps.findIndex((step) =>
      step.parallel?.some((child) => child.run.split(commandSeparator).includes(command))
    );

    expect(unitPhase).toBeGreaterThanOrEqual(0);
    expect(integrationPhase).toBeGreaterThanOrEqual(0);
    expect(analysisPhase).toBeGreaterThan(unitPhase);
    expect(analysisPhase).toBeGreaterThan(integrationPhase);
  }
);
