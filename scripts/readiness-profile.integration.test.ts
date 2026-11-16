import { describe, expect } from '@rstest/core';
import {
  getReadinessSummary,
  type ReadinessRequirement,
  readinessCategories,
  readinessRequirements,
} from '../readiness/profile.js';
import { formatReadinessReport } from '../readiness/report.js';

describe('readiness scoring', () => {
  test('counts only applicable requirements in the percentage', () => {
    const requirements: ReadinessRequirement[] = [
      {
        category: 'protobuf',
        evidence: {
          file: 'conformance/example.test.ts',
          testName: 'supports strings',
        },
        id: 'protobuf.string',
        level: 'required',
        status: 'verified',
        title: 'String fields',
      },
      {
        category: 'protobuf',
        id: 'protobuf.fixed32',
        level: 'required',
        nextTest: 'Round-trip fixed32 boundary values.',
        status: 'missing',
        title: 'Fixed-width integers',
      },
      {
        category: 'aip',
        id: 'aip.server-pagination',
        level: 'required',
        rationale: 'Server token behavior is outside a form library.',
        status: 'external',
        title: 'Server pagination tokens',
      },
      {
        category: 'protobuf',
        id: 'protobuf.services',
        level: 'required',
        nextTest: 'Generate a form workflow from an RPC descriptor.',
        rationale: 'Service workflows are useful, but not part of the current release.',
        status: 'deferred',
        title: 'Service workflows',
      },
      {
        category: 'protobuf',
        id: 'protobuf.extensions',
        level: 'required',
        nextTest: 'Add extension-aware field discovery.',
        rationale: 'The canonical provider does not discover proto2 extensions.',
        status: 'unsupported',
        title: 'Proto2 extensions',
      },
      {
        category: 'protovalidate',
        id: 'protovalidate.removed-option',
        level: 'required',
        rationale: 'The installed schema removed this option.',
        status: 'superseded',
        title: 'Removed option',
      },
    ];

    expect(getReadinessSummary(requirements)).toMatchObject({
      applicable: 4,
      deferred: 1,
      external: 1,
      missing: 1,
      percentage: 25,
      profileComplete: false,
      superseded: 1,
      unsupported: 1,
      verified: 1,
    });
  });

  test('rejects a profile gate with a recommended gap', () => {
    const requirements: ReadinessRequirement[] = [
      {
        category: 'production',
        id: 'production.recommended-gap',
        level: 'recommended',
        nextTest: 'Add the missing recommended evidence.',
        status: 'missing',
        title: 'Recommended evidence',
      },
    ];

    expect(getReadinessSummary(requirements).profileComplete).toBe(false);
  });

  test('formats a report with the score and next tests', () => {
    const report = formatReadinessReport(readinessRequirements, readinessCategories);
    const summary = getReadinessSummary(readinessRequirements);

    expect(report).toContain(`Overall: ${summary.percentage}% (${summary.verified}/${summary.applicable})`);
    expect(report).toContain(`Profile complete: ${summary.profileComplete ? 'yes' : 'no'}`);
    expect(report).toContain('Release verification: not run (use `bun run release:gate`)');
    expect(report).toContain(
      `Excluded: ${summary.external} external, ${summary.optional} optional, ${summary.outOfTarget} out of target, ${summary.superseded} superseded`
    );
    expect(report).toContain('Open work:');
    expect(report).toContain('Open work:\n- none');
    expect(report).not.toContain('aip.151:');
    expect(report).not.toContain('protobuf.services:');
    expect(report).toContain('Protobuf:');
  });
});
