import { expect, test } from '@rstest/core';
import { auditExceptions, classifyAudit } from './security-audit-policy';

const advisory = {
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  severity: 'high',
  title: 'Nested-pattern denial of service',
};
const sprintfAdvisory = {
  url: 'https://github.com/advisories/GHSA-hp3w-g68c-fv3c',
  severity: 'moderate',
  title: 'sprintf-js vulnerable to denial of service through unbounded precision specifiers',
};
test.each([
  { package: 'braces', advisory },
  { package: 'sprintf-js', advisory: sprintfAdvisory },
])('temporarily permits the approved $package advisory, but blocks it at and after expiry', (finding) => {
  const response = { [finding.package]: [finding.advisory] };
  const expectedFinding = { ...finding.advisory, package: finding.package };
  expect(classifyAudit(response, auditExceptions, new Date('2026-11-03T23:59:59.999Z'))).toEqual({
    blocking: [],
    excepted: [expectedFinding],
  });
  for (const deadline of ['2026-11-04T00:00:00.000Z', '2026-11-05T00:00:00.000Z']) {
    expect(classifyAudit(response, auditExceptions, new Date(deadline))).toEqual({
      blocking: [expectedFinding],
      excepted: [],
    });
  }
});
test('does not extend approved exceptions to another package or advisory', () => {
  expect(
    classifyAudit(
      { 'sprintf-js': [sprintfAdvisory, advisory], braces: [sprintfAdvisory] },
      auditExceptions,
      new Date('2026-10-06')
    )
  ).toEqual({
    blocking: [
      { ...advisory, package: 'sprintf-js' },
      { ...sprintfAdvisory, package: 'braces' },
    ],
    excepted: [{ ...sprintfAdvisory, package: 'sprintf-js' }],
  });
});
test('fails unexcepted advisories and rejects malformed audit responses', () => {
  expect(classifyAudit({ braces: [advisory] }, [], new Date('2026-10-05'))).toMatchObject({
    blocking: [{ package: 'braces' }],
    excepted: [],
  });
  expect(() => classifyAudit({ error: 'Registry unavailable' }, [], new Date())).toThrow();
});
test('accepts only an exact, unexpired advisory exception', () => {
  const exception = {
    package: 'braces',
    url: advisory.url,
    expires: '2026-11-04',
    reason: 'No published fix; build-only trusted patterns',
  };
  expect(classifyAudit({ braces: [advisory] }, [exception], new Date('2026-10-05'))).toMatchObject({
    blocking: [],
    excepted: [{ package: 'braces' }],
  });
  expect(classifyAudit({ braces: [advisory] }, [exception], new Date('2026-11-04'))).toMatchObject({
    blocking: [{ package: 'braces' }],
    excepted: [],
  });
  expect(classifyAudit({ other: [advisory] }, [exception], new Date('2026-10-05'))).toMatchObject({
    blocking: [{ package: 'other' }],
  });
});
