import { z } from 'zod';

const auditSchema = z.record(
  z.string(),
  z.array(
    z.object({
      url: z.url(),
      severity: z.enum(['low', 'moderate', 'high', 'critical']),
      title: z.string(),
    })
  )
);

export interface AuditException {
  expires: string;
  package: string;
  reason: string;
  url: string;
}

export const auditExceptions: AuditException[] = [
  {
    package: 'braces',
    url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
    expires: '2026-11-04',
    reason: 'Maintainer-approved temporary exception for transitive registry/lint tooling; no published upstream fix.',
  },
  {
    package: 'sprintf-js',
    url: 'https://github.com/advisories/GHSA-hp3w-g68c-fv3c',
    expires: '2026-11-04',
    reason:
      'Maintainer-approved temporary exception for transitive Blume frontmatter tooling; no published upstream fix.',
  },
];

export function classifyAudit(response: unknown, exceptions: readonly AuditException[], now: Date) {
  const findings = Object.entries(auditSchema.parse(response)).flatMap(([name, advisories]) =>
    advisories.map((advisory) => ({ ...advisory, package: name }))
  );
  const excepted = findings.filter((finding) =>
    exceptions.some(
      (exception) =>
        exception.package === finding.package && exception.url === finding.url && now < new Date(exception.expires)
    )
  );
  return { blocking: findings.filter((finding) => !excepted.includes(finding)), excepted };
}
