import test from 'node:test';
import assert from 'node:assert/strict';
import { affectedSurfaces, developmentCommands } from './dev-check.mjs';

test('renderer changes select dependents while contracts and unknown build inputs cover both surfaces', () => {
  assert.deepEqual(affectedSurfaces(['packages/react/src/Button.tsx']), ['web']);
  assert.deepEqual(affectedSurfaces(['packages/react-native/src/Button.tsx']), ['native']);
  assert.deepEqual(affectedSurfaces(['packages/design-contracts/src/index.ts']), ['native', 'web']);
  assert.deepEqual(affectedSurfaces(['pnpm-lock.yaml']), ['native', 'web']);
  assert.deepEqual(affectedSurfaces(['docs/README.md']), ['docs']);
  assert.deepEqual(affectedSurfaces(['packages/react-native/README.md']), ['docs']);
  const docs = developmentCommands(['docs']);
  assert.deepEqual(docs.filter(args => args.at(-1) === 'build').map(args => args[1]), ['@hjmds/design-contracts']);
  assert.ok(docs.some(args => args[0] === 'contracts:check') && docs.some(args => args[0] === 'docs:check'));
  assert.ok(developmentCommands(['native']).some(args => args.includes('@hjmds/react-native') && args.at(-1) === 'bundle:check:built'));
  assert.equal(developmentCommands(['web']).some(args => args.at(-1) === 'bundle:check:built'), false);
  const commands = developmentCommands(['web']);
  assert.equal(commands.filter(args => args.at(-1) === 'build').length, 2);
  assert.equal(commands.some(args => args.includes('@hjmds/react-native')), false);
  assert.ok(commands.some(args => args.includes('@hjm/showcase-web') && args.at(-1) === 'check'));
});

test('renames report both paths so a move out of a shared package still selects both renderers', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const root = await mkdtemp(join(tmpdir(), 'dev-check-rename-'));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  try {
    git(['init', '-q']);
    await mkdir(join(root, 'packages/design-contracts/src'), { recursive: true });
    await mkdir(join(root, 'packages/react/src'), { recursive: true });
    await writeFile(join(root, 'packages/design-contracts/src/token.ts'), 'export const token = 1;\n'.repeat(20));
    git(['add', '.']); git(['-c', 'user.name=T', '-c', 'user.email=t@example.invalid', 'commit', '-qm', 'base']);
    git(['mv', 'packages/design-contracts/src/token.ts', 'packages/react/src/token.ts']);
    const paths = git(['diff', '--cached', '--name-only', '--no-renames', '--diff-filter=ACMRD', '-z']).split('\0').filter(Boolean);
    assert.deepEqual(affectedSurfaces(paths), ['native', 'web']);
  } finally { await rm(root, { recursive: true, force: true }); }
});
