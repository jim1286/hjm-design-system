#!/usr/bin/env node
// Actions timestamps are observations, not a claim that a run deployed successfully.
import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function seconds(start, end) {
  const a = Date.parse(start), b = Date.parse(end);
  return Number.isFinite(a) && Number.isFinite(b) && b >= a ? (b - a) / 1000 : null;
}
export function category(name) {
  if (/^Typecheck\b/i.test(name)) return 'check';
  // Self-hosted admission runs inside these hook steps, after Actions marks
  // the job started. It is not represented by preStartSeconds (Unairplane Oct 14).
  if (/^(?:Set up runner|Complete runner)$/i.test(name)) return 'runnerHooks';
  if (/checkout|check out|fetch source/i.test(name)) return 'source';
  if (/install.*depend|frozen|npm ci|pnpm install|setup-|set up node|enable.*package|corepack/i.test(name)) return 'setup';
  if (/upload.*artifact|download.*artifact|receipt|evidence|cache|revocation/i.test(name)) return 'evidence';
  if (/submit|deploy|publish|store.*process|eas.*wait/i.test(name)) return 'external';
  if (/build|compile|archive|prebuild/i.test(name)) return 'build';
  if (/test|check|lint|validate|verify|regression/i.test(name)) return 'check';
  return 'other';
}
export function summarize(run, jobs) {
  return {
    schemaVersion: 1, classificationVersion: 3, repository: run.repository?.full_name ?? null,
    runId: run.id, attempt: run.run_attempt, sha: run.head_sha,
    workflow: run.name, event: run.event, conclusion: run.conclusion,
    // updated_at can include later metadata edits; do not call it completion time.
    observedAt: new Date().toISOString(), createdAt: run.created_at,
    jobs: jobs.map(job => {
      const steps = (job.steps ?? []).map(step => ({ name: step.name, category: category(step.name),
        conclusion: step.conclusion, seconds: seconds(step.started_at, step.completed_at) }));
      const categories = {};
      for (const step of steps) if (step.seconds !== null) categories[step.category] = (categories[step.category] ?? 0) + step.seconds;
      const elapsed = job.status === 'queued' || job.conclusion === 'skipped' ? null : seconds(job.started_at, job.completed_at);
      const knownSteps = steps.filter(step => step.conclusion !== 'skipped');
      const recorded = steps.reduce((total, step) => total + (step.seconds ?? 0), 0);
      return { id: job.id, name: job.name, status: job.status, conclusion: job.conclusion,
        runner: job.runner_name, labels: job.labels, createdAt: job.created_at,
        startedAt: job.started_at, completedAt: job.completed_at,
        // Includes dependency/concurrency/runner delay. API alone cannot separate them.
        preStartSeconds: job.status === 'queued' || job.conclusion === 'skipped' ? null : seconds(job.created_at, job.started_at),
        // Preserve API gaps instead of attributing them to tests or the host scheduler.
        // A completed run can temporarily omit every step (Diairy 38465210017).
        // With no observed steps, the entire job is not a measured timing gap.
        unattributedSeconds: elapsed !== null && knownSteps.length > 0 && knownSteps.every(step => step.seconds !== null) && recorded <= elapsed ? elapsed - recorded : null,
        elapsedSeconds: elapsed, categories, steps };
    }),
  };
}
// A delayed API response must not leave the local observer waiting indefinitely.
export function collect(repository, runId, api = path => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', timeout: 30000 }))) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^\d+$/.test(String(runId))) throw new Error('Expected owner/repository and numeric run ID');
  const run = api(`repos/${repository}/actions/runs/${runId}`);
  const jobs = [];
  for (let page = 1; ; page++) {
    const batch = api(`repos/${repository}/actions/runs/${runId}/attempts/${run.run_attempt}/jobs?per_page=100&page=${page}`);
    jobs.push(...batch.jobs);
    if (batch.jobs.length < 100) break;
  }
  return summarize({ ...run, repository: { full_name: repository } }, jobs);
}
export async function collectWithToken(repository, runId, token, request = fetch) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^\d+$/.test(String(runId))) throw new Error('Expected owner/repository and numeric run ID');
  const api = async path => {
    const response = await request(`https://api.github.com/${path}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Actions metrics unavailable: HTTP ${response.status}`);
    return response.json();
  };
  const run = await api(`repos/${repository}/actions/runs/${runId}`), jobs = [];
  for (let page = 1; ; page++) {
    const batch = await api(`repos/${repository}/actions/runs/${runId}/attempts/${run.run_attempt}/jobs?per_page=100&page=${page}`);
    jobs.push(...batch.jobs);
    if (batch.jobs.length < 100) break;
  }
  return summarize({ ...run, repository: { full_name: repository } }, jobs);
}
export function markdown(report) {
  const escape = text => String(text ?? '').replace(/[|\r\n]/g, ' ').replace(/[<>]/g, '');
  const value = number => number === null || number === undefined ? 'unknown' : number.toFixed(1);
  return `\nActions timing, run ${report.runId}, attempt ${report.attempt}, SHA ${report.sha}.\n\n`
    + 'Pre-start includes dependency/concurrency/runner delay. Runner hooks may include admission waits; unattributed gaps remain unexplained. Active job completion is still unknown.\n\n'
    + '| Job | Result | Pre-start s | Job s | Source s | Setup s | Check s | Build s | External s | Evidence s | Runner hooks s | Unattributed s |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n'
    + report.jobs.map(job => `| ${escape(job.name)} | ${escape(job.conclusion || job.status)} | ${value(job.preStartSeconds)} | ${value(job.elapsedSeconds)} | `
      + ['source', 'setup', 'check', 'build', 'external', 'evidence', 'runnerHooks'].map(key => value(job.categories[key])).join(' | ') + ` | ${value(job.unattributedSeconds)} |`).join('\n') + '\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [repository, runId, output] = process.argv.slice(2);
  const report = process.env.GITHUB_TOKEN ? await collectWithToken(repository, runId, process.env.GITHUB_TOKEN) : collect(repository, runId);
  const value = JSON.stringify(report, null, 2) + '\n';
  if (output) writeFileSync(output, value); else process.stdout.write(value);
  const summaryPath = process.env.CI_METRICS_SUMMARY === '1' ? process.env.GITHUB_STEP_SUMMARY : process.env.CI_METRICS_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, markdown(report));
}
