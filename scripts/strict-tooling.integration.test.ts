import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect } from '@rstest/core';

import blumeConfig from '../blume.config';
import doctorConfig from '../doctor.config';
import packageJson from '../package.json' with { type: 'json' };
import tsconfig from '../tsconfig.json' with { type: 'json' };

const biomeRuleGroups = {
  a11y: 'A11y',
  complexity: 'Complexity',
  correctness: 'Correctness',
  nursery: 'Nursery',
  performance: 'Performance',
  security: 'Security',
  style: 'Style',
  suspicious: 'Suspicious',
} as const;

const GLOB_SYNTAX = /[*?[\]{}]/u;

type JsonObject = Record<string, unknown>;

function getJsonObject(value: unknown, label: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }

  return value as JsonObject;
}

function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Expected ${label} to contain valid JSON.`, { cause: error });
  }
}

function parseJsonc(value: string, label: string): unknown {
  return parseJson(value.replaceAll(/^\s*\/\/.*$/gmu, ''), label);
}

describe('strict React tooling', () => {
  test('pins the latest analysis toolchain and exposes strict entrypoints', () => {
    expect(packageJson.devDependencies).toMatchObject({
      '@biomejs/biome': '2.6.2',
      '@shadcn/lint': '0.2.3',
      oxlint: '1.89.0',
      '@rsbuild/plugin-react': '2.1.1',
      'react-doctor': '0.9.18',
      'react-scan': '0.5.7',
      ultracite: '8.0.2',
    });
    expect('babel-plugin-react-compiler' in packageJson.devDependencies).toBe(false);
    expect(packageJson.scripts).toMatchObject({
      lint: expect.stringContaining('lint:oxlint') as unknown,
      'lint:exceptions': 'bun run scripts/check-lint-exceptions.ts',
      'lint:shadcn':
        'oxlint --config shadcn-lint.jsonc --deny-warnings --report-unused-disable-directives-severity=error',
      'ci:gate': expect.stringContaining('bun run lint') as unknown,
      'quality:gate': expect.stringContaining('bun run lint') as unknown,
      doctor: expect.stringContaining('react-doctor') as unknown,
      'doctor:strict': 'bun run doctor',
      'scan:react': 'PROTOFORM_REACT_SCAN=1 blume dev --port 55011',
    });
  });

  test('rejects unsafe and redundant patterns with the configured Biome 2.6 rules', () => {
    mkdirSync('.tmp', { recursive: true });
    const directory = mkdtempSync(resolve('.tmp/biome-rule-probe-'));
    const fixture = resolve(directory, 'probe.ts');
    try {
      writeFileSync(
        fixture,
        `
export function isPositive(value: number) {
  if (value > 0) {
    return true;
  }
  return false;
}
export function copyDate(value: Date) {
  return new Date(value.getTime());
}
export function invert(value: number) {
  return value * -1;
}
export function callDirectly() {
  return isPositive.call(null, 1);
}
`
      );
      const result = spawnSync(
        resolve('node_modules/.bin/biome'),
        ['lint', fixture, '--colors=off', '--vcs-enabled=false'],
        {
          encoding: 'utf8',
        }
      );

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      const diagnostics = result.stdout + result.stderr;
      for (const rule of ['useSimplifiedBooleanReturn', 'noUselessDateGetTime', 'useUnaryMinus', 'noUselessCall']) {
        expect(diagnostics).toContain(`lint/nursery/${rule}`);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test('enforces Ultracite label associations for shadcn controls', () => {
    mkdirSync('.tmp', { recursive: true });
    const directory = mkdtempSync(resolve('.tmp/ultracite-label-probe-'));
    const fixture = resolve(directory, 'probe.tsx');
    const imports = `
import { Input } from '@/registry/base-nova/protoform/components/input';
import { Label } from '@/registry/base-nova/protoform/components/label';
`;
    const args = ['lint', fixture, '--colors=off', '--vcs-enabled=false'];
    try {
      writeFileSync(
        fixture,
        `${imports}
export function Field() {
  return <><Label>Name</Label><Input aria-label="Name" /></>;
}
`
      );
      const invalid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(invalid.error).toBeUndefined();
      expect(invalid.status).toBe(1);
      expect(invalid.stdout + invalid.stderr).toContain('lint/a11y/noLabelWithoutControl');

      writeFileSync(
        fixture,
        `${imports}
export function Field() {
  return <Label>Name<Input aria-label="Name" /></Label>;
}
`
      );
      const valid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(valid.error).toBeUndefined();
      expect(valid.stdout + valid.stderr).not.toContain('lint/a11y/noLabelWithoutControl');
      expect(valid.status).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test('explicitly configures every stable and nursery Biome rule', async () => {
    const [biomeConfigSource, biomeSchemaSource] = await Promise.all([
      readFile('biome.jsonc', 'utf8'),
      readFile('node_modules/@biomejs/biome/configuration_schema.json', 'utf8'),
    ]);
    const biomeConfig = getJsonObject(parseJsonc(biomeConfigSource, 'biome.jsonc'), 'biome.jsonc');
    const biomeSchema = getJsonObject(parseJson(biomeSchemaSource, "Biome's schema"), "Biome's schema");
    const linter = getJsonObject(biomeConfig['linter'], 'biome.jsonc linter');
    const configuredRuleGroups = getJsonObject(linter['rules'], 'biome.jsonc linter rules');
    const schemaDefinitions = getJsonObject(biomeSchema['$defs'], "Biome's schema definitions");

    expect(biomeConfig).toMatchObject({ formatter: { enabled: true }, linter: { enabled: true } });
    expect(configuredRuleGroups['preset']).toBeUndefined();
    expect(configuredRuleGroups['recommended']).toBeUndefined();

    for (const [configGroupName, schemaGroupName] of Object.entries(biomeRuleGroups)) {
      const configuredRules = getJsonObject(
        configuredRuleGroups[configGroupName],
        `biome.jsonc ${configGroupName} rules`
      );
      const schemaGroup = getJsonObject(schemaDefinitions[schemaGroupName], `Biome's ${schemaGroupName} schema`);
      const schemaProperties = getJsonObject(schemaGroup['properties'], `Biome's ${schemaGroupName} rule properties`);
      const expectedRuleNames = Object.keys(schemaProperties)
        .filter((ruleName) => ruleName !== 'preset' && ruleName !== 'recommended')
        .toSorted((left, right) => left.localeCompare(right));

      expect(Object.keys(configuredRules).toSorted((left, right) => left.localeCompare(right))).toEqual(
        expectedRuleNames
      );
      expect(configuredRules['preset']).toBeUndefined();
      expect(configuredRules['recommended']).toBeUndefined();
      for (const [ruleName, ruleConfig] of Object.entries(configuredRules)) {
        const severity =
          typeof ruleConfig === 'string'
            ? ruleConfig
            : getJsonObject(ruleConfig, `biome.jsonc ${configGroupName}/${ruleName}`)['level'];
        expect(['error', 'off']).toContain(severity);
      }
    }

    const configuredSeverities = Object.values(configuredRuleGroups).flatMap((rules, groupIndex) =>
      Object.entries(getJsonObject(rules, `Biome rule group ${groupIndex}`))
        .filter(([ruleName]) => ruleName !== 'preset' && ruleName !== 'recommended')
        .map(([, ruleConfig]) =>
          typeof ruleConfig === 'string'
            ? ruleConfig
            : getJsonObject(ruleConfig, `Biome rule configuration in group ${groupIndex}`)['level']
        )
    );
    expect(configuredSeverities.filter((severity) => severity === 'error')).toHaveLength(550);
    expect(configuredSeverities.filter((severity) => severity === 'off')).toHaveLength(57);

    expect(configuredRuleGroups).toMatchObject({
      a11y: {
        noAutofocus: 'error',
      },
      complexity: {
        noExcessiveCognitiveComplexity: {
          level: 'error',
          options: { maxAllowedComplexity: 15 },
        },
        noExcessiveLinesPerFunction: {
          level: 'error',
          options: { maxLines: 120, skipBlankLines: true, skipIifes: true },
        },
        noImplicitCoercions: 'error',
        noUselessUndefined: 'error',
        noPlaywrightUselessAwait: 'error',
      },
      correctness: {
        noNodejsModules: 'error',
        noProcessGlobal: 'error',
        noRestrictedElements: {
          level: 'error',
          options: {
            elements: {
              button: expect.stringContaining('Button') as unknown,
              input: expect.stringContaining('Input') as unknown,
              select: expect.stringContaining('Select') as unknown,
              textarea: expect.stringContaining('Textarea') as unknown,
            },
          },
        },
        noUndeclaredDependencies: 'error',
        noComponentHookFactories: 'error',
        noJsxNamespace: 'error',
        noPlaywrightMissingAwait: 'error',
        useReactAsyncServerFunction: 'error',
      },
      nursery: {
        noAstroConflictingSetDirectives: 'error',
        noBaseToString: 'error',
        noFloatingPromises: 'error',
        noJsonUnsafeValues: 'error',
        noMeaninglessVoidOperator: 'error',
        noMisplacedListElements: 'error',
        noMisleadingReturnType: 'error',
        noMisusedPromises: 'error',
        noObsoleteTags: 'error',
        noReactObjectTypeAsDefaultProp: 'error',
        noReturnInFinally: 'error',
        noSelfImport: 'error',
        noSvelteAtDebugTags: 'error',
        noSvelteExportLet: 'error',
        noTailwindRawColors: 'error',
        noUnsafePlusOperands: 'error',
        noUselessTypeConversion: 'error',
        noVueUndeclaredDirectives: 'error',
        useAwaitThenable: 'error',
        useConsistentFunctionStyle: {
          level: 'error',
          options: { style: 'declaration', allowArrowFunctions: true },
        },
        useConsistentObjectKeys: 'error',
        useDisposables: 'error',
        useExhaustiveSwitchCases: 'error',
        useIncludes: 'error',
        useLogicalProperties: 'error',
        usePromiseRejectErrors: 'error',
        useReactCompiler: 'error',
        useRegexpExec: 'error',
        useStringStartsEndsWith: 'error',
        useStrictBooleanExpressions: 'error',
        useSvelteKitRuneImports: 'error',
        useValidTestTitle: 'error',
      },
      performance: {
        noReExportAll: 'error',
      },
      security: {
        noSecrets: {
          level: 'error',
          options: { entropyThreshold: 80 },
        },
      },
      style: {
        noPlaywrightElementHandle: 'error',
        noPlaywrightEval: 'error',
        noPlaywrightWaitForSelector: 'error',
        useConsistentTestIt: {
          level: 'error',
          options: { function: 'test', withinDescribe: 'test' },
        },
        useTestHooksInOrder: 'error',
        useTestHooksOnTop: 'error',
        useUnicodeRegex: 'error',
        noCommonJs: 'error',
        noDefaultExport: 'error',
        noExcessiveClassesPerFile: 'error',
        noExcessiveLinesPerFile: {
          level: 'error',
          options: { maxLines: 700, skipBlankLines: true },
        },
        noHexColors: 'error',
        noProcessEnv: 'error',
        noRestrictedImports: {
          level: 'error',
          options: {
            paths: {
              classnames: expect.stringContaining('clsx') as unknown,
              lodash: expect.stringContaining('lodash-es') as unknown,
              mobx: expect.stringContaining('zustand') as unknown,
              'mobx-react': expect.stringContaining('zustand') as unknown,
              'mobx-react-lite': expect.stringContaining('zustand') as unknown,
              moment: expect.stringContaining('date-fns') as unknown,
              yup: expect.stringContaining('zod') as unknown,
            },
          },
        },
        useConsistentCurlyBraces: 'error',
        useExplicitLengthCheck: 'error',
        useSingleVarDeclarator: 'error',
      },
      suspicious: {
        noIdenticalTestTitle: 'error',
        noJsxLeakedDollar: 'error',
        noPlaywrightForceOption: 'error',
        noPlaywrightNetworkidle: 'error',
        noPlaywrightPagePause: 'error',
        noPlaywrightWaitForNavigation: 'error',
        noPlaywrightWaitForTimeout: 'error',
        noReactStringRefs: 'error',
        noUntrustedLicenses: 'error',
        noForIn: 'error',
        noReactForwardRef: 'error',
        noUndeclaredEnvVars: 'error',
        useDeprecatedDate: 'error',
      },
    });

    const { overrides } = biomeConfig;
    if (!Array.isArray(overrides)) {
      throw new TypeError('Expected biome.jsonc overrides to be an array.');
    }
    const catchAllOverride: unknown = overrides.find((override) => {
      const overrideObject = getJsonObject(override, 'Biome override');
      const includes: unknown = overrideObject['includes'];
      return Array.isArray(includes) && includes.join(',') === '**';
    });
    expect(catchAllOverride).toBeUndefined();
  });

  test('explicitly promotes every applicable React Doctor rule and design surface', () => {
    const doctorConfigObject = getJsonObject(doctorConfig, 'doctor.config.ts');
    const configuredRules = getJsonObject(doctorConfigObject['rules'], 'React Doctor rules');
    const ruleCatalog = parseJson(
      execFileSync(
        process.execPath,
        [resolve('node_modules/react-doctor/bin/react-doctor.js'), 'rules', 'list', '--json', '--cwd', '.'],
        { encoding: 'utf8' }
      ),
      "React Doctor's rule catalog"
    );
    if (!Array.isArray(ruleCatalog)) {
      throw new TypeError("Expected React Doctor's rule catalog to be an array.");
    }
    const availableRuleNames = ruleCatalog.map((rule, index) => {
      const ruleObject = getJsonObject(rule, `React Doctor rule ${index}`);
      if (typeof ruleObject['key'] !== 'string') {
        throw new TypeError(`Expected React Doctor rule ${index} to have a key.`);
      }
      return ruleObject['key'];
    });

    expect(doctorConfigObject['categories']).toBeUndefined();
    expect(doctorConfigObject['buckets']).toBeUndefined();
    expect(Object.keys(configuredRules).toSorted((left, right) => left.localeCompare(right))).toEqual(
      availableRuleNames.toSorted((left, right) => left.localeCompare(right))
    );
    expect(doctorConfig.surfaces).toMatchObject({
      ciFailure: { includeTags: ['design'] },
      cli: { includeTags: ['design'] },
      prComment: { includeTags: ['design'] },
      score: { includeTags: ['design'] },
    });

    const configuredRuleEntries = Object.entries(configuredRules);
    expect(configuredRuleEntries.filter(([, severity]) => severity === 'error')).toHaveLength(
      availableRuleNames.length - 1
    );
    expect(configuredRuleEntries.filter(([, severity]) => severity === 'off')).toEqual([
      ['react-doctor/react-in-jsx-scope', 'off'],
    ]);
  });

  test('limits React Doctor exemptions to generated output and installable components', () => {
    const ignoredFiles = doctorConfig.ignore?.files ?? [];
    const authoredIgnoredFiles = ignoredFiles.filter((file) => file.startsWith('registry/base-nova/protoform/'));
    expect(authoredIgnoredFiles).toEqual([]);

    const nonComponentOverrides = (doctorConfig.ignore?.overrides ?? []).flatMap((override) =>
      override.files
        .filter((file) => !file.startsWith('registry/base-nova/protoform/components/'))
        .map((file) => ({ file, rules: override.rules }))
    );
    expect(nonComponentOverrides.every(({ file }) => !GLOB_SYNTAX.test(file))).toBe(true);
    expect(
      [...new Set(nonComponentOverrides.map(({ file }) => file))].toSorted((left, right) =>
        left < right ? -1 : Number(left > right)
      )
    ).toEqual([
      'examples/basic/basic-form.tsx',
      'examples/catalog/demo-hub.tsx',
      'examples/presets/preset-lab.tsx',
      'registry/base-nova/protoform/demo/bookstore/bookstore-demo.tsx',
      'registry/base-nova/protoform/lib/base-ui-compat/index.tsx',
      'registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations.ts',
    ]);
  });

  test('enables fail-fast React Compiler coverage for docs and every React test suite', async () => {
    expect(blumeConfig).toMatchObject({ react: { compiler: true } });

    const configPaths = [
      'rstest.browser.config.ts',
      'rstest.conformance.config.ts',
      'rstest.dom.config.ts',
      'rstest.node.config.ts',
    ];
    const configSources = await Promise.all(configPaths.map((configPath) => readFile(configPath, 'utf8')));
    for (const source of configSources) {
      expect(source).toContain('reactCompiler:');
      expect(source).toContain("panicThreshold: 'all_errors'");
    }
  });

  test('keeps TypeScript stricter than the requested baseline', () => {
    expect(tsconfig.compilerOptions).toMatchObject({
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      exactOptionalPropertyTypes: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      strict: true,
      strictNullChecks: true,
      useDefineForClassFields: true,
      verbatimModuleSyntax: true,
    });
  });
});
