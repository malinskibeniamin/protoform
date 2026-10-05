import { expect, test } from '@rstest/core';
import { auditExceptions, classifyAudit } from './security-audit-policy';

const advisory = {
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  severity: 'high',
  title: 'Nested-pattern denial of service',
};
test('temporarily permits the approved braces advisory, but blocks it at the review deadline', () => {
  expect(classifyAudit({ braces: [advisory] }, auditExceptions, new Date('2026-10-05'))).toMatchObject({
    blocking: [],
    excepted: [{ package: 'braces', url: advisory.url }],
  });
  expect(classifyAudit({ braces: [advisory] }, auditExceptions, new Date('2026-11-04'))).toMatchObject({
    blocking: [{ package: 'braces' }],
    excepted: [],
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
