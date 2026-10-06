import { execFile } from 'node:child_process';
import { auditExceptions, classifyAudit } from './security-audit-policy';

const { stdout, stderr, exitCode } = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
  (resolve, reject) => {
    execFile('bun', ['audit', '--json'], { encoding: 'utf8' }, (error, auditStdout, auditStderr) => {
      const auditExitCode = error === null ? 0 : error.code;
      if (typeof auditExitCode !== 'number') {
        reject(error);
        return;
      }
      resolve({ stdout: auditStdout, stderr: auditStderr, exitCode: auditExitCode });
    });
  }
);
if (stderr) {
  console.error(stderr.trim());
}
if (exitCode > 1) {
  throw new Error(`Dependency audit failed (${exitCode}).`);
}
const { blocking, excepted } = classifyAudit(JSON.parse(stdout), auditExceptions, new Date());
if (exitCode !== 0 && blocking.length + excepted.length === 0) {
  throw new Error('Audit failed without advisory results.');
}
for (const finding of excepted) {
  const exception = auditExceptions.find((item) => item.package === finding.package && item.url === finding.url);
  console.warn(
    `Temporary audit exception: ${finding.package} ${finding.url}; review before ${exception?.expires}: ${exception?.reason}`
  );
}
for (const finding of blocking) {
  console.error(`${finding.severity}: ${finding.package}: ${finding.title}\n${finding.url}`);
}
if (blocking.length > 0) {
  throw new Error(`${blocking.length} dependency advisories require remediation.`);
}
console.log(
  `Dependency audit passed (${excepted.length} explicit exceptions). Private registries may not support auditing; see warnings above.`
);
