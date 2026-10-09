#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
// Unknown/root configuration changes expand to both renderers. Renderer-only
// edits do not need the other platform's build, while contracts affect both.
// Markdown is not inert here: contracts tests read root/package READMEs and
// package docs, so documentation edits still run the contracts surface instead
// of passing with zero commands (2026-10-09 review).
export function affectedSurfaces(paths) {
  const selected = new Set();
  for (const path of paths) {
    if (/^(docs\/|\.changeset\/)|\.md$/.test(path)) selected.add('docs');
    else if (/^(packages\/react\/|showcase\/web\/)/.test(path)) selected.add('web');
    else if (/^(packages\/react-native\/|showcase\/native\/)/.test(path)) selected.add('native');
    else { selected.add('web'); selected.add('native'); }
  }
  return [...selected].sort();
}
export function developmentCommands(surfaces) {
  if (!surfaces.length) return [];
  const renderers = surfaces.filter(s => s !== 'docs');
  const packages = ['@hjmds/design-contracts', ...renderers.map(s => s === 'web' ? '@hjmds/react' : '@hjmds/react-native')];
  return [
    ...packages.map(name => ['--filter', name, 'build']),
    ...packages.flatMap(name => [['--filter', name, 'typecheck'], ['--filter', name, 'test']]),
    ...renderers.map(s => ['--filter', `@hjm/showcase-${s}`, 'check']),
    // Cheap source/artifact consistency checks that the release gate would
    // otherwise surface first. Metro catches optional native peer subpaths that
    // tsc and tests accept; renderer budgets read the React build.
    ...(renderers.includes('native') ? [['--filter', '@hjmds/react-native', 'bundle:check:built']] : []),
    ...(renderers.includes('web') ? [['bundle:renderer:check']] : []),
    ...(renderers.length === 2 ? [['evidence:check']] : []),
    ['contracts:check'], ['docs:check'], ['usage:check'], ['api-map:check'], ['workspace:check'],
  ];
}
export function main(args) {
  let base;
  let all = false;
  let plan = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base') {
      base = args[++i];
      if (!base || base.startsWith('-')) throw new Error('--base requires a Git ref');
    } else if (args[i] === '--all') all = true;
    else if (args[i] === '--plan') plan = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  const git = argv => execFileSync('git', argv, { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const paths = [...new Set([
    ...git(['diff', '--name-only', '--no-renames', '--diff-filter=ACMRD', '-z', ...(base ? [base] : [])]),
    ...git(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRD', '-z']),
    ...git(['ls-files', '--others', '--exclude-standard', '-z']),
  ])];
  const surfaces = all ? ['native', 'web'] : affectedSurfaces(paths);
  const commands = developmentCommands(surfaces);
  console.log(JSON.stringify({ paths, surfaces, commands, scope: 'development; release uses ci:check' }, null, 2));
  if (!plan) for (const argv of commands) {
    const result = spawnSync('pnpm', argv, { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`pnpm ${argv.join(' ')} failed (${result.status ?? result.signal})`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
