// Development-only adapter. Keep published exports/lockfiles untouched so each
// consumer can adopt a release independently (STANDARD_OPERATIONS: HJM development).
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const packageNames = ['design-contracts', 'react', 'react-native'];
const nextOwnedPeers = new Set(['react', 'react-dom']);
const inside = (root, file) => file === root || file.startsWith(root + path.sep);

function usesLocalSource(env) {
  // Development uses the shared checkout by default (2026-10-12 user decision).
  // Release/CI always resolve installed packages, even with an inherited opt-in.
  // The phone development launcher uses CI=0; treating that string as truthy
  // silently selected published packages and left obsolete dist watchers running.
  const isCI = Boolean(env.CI && env.CI !== 'false' && env.CI !== '0');
  if (env.NODE_ENV === 'production' || isCI || env.EAS_BUILD === 'true') return false;
  if (env.HJM_DESIGN_SYSTEM_LOCAL === '1') throw new Error('Use HJM_LOCAL_SOURCE=1 instead of legacy package links');
  return env.HJM_LOCAL_SOURCE !== '0';
}

function findSourceRoot(projectRoot, env) {
  let root = env.HJM_SOURCE_ROOT && path.resolve(projectRoot, env.HJM_SOURCE_ROOT);
  for (let directory = projectRoot; !root;) {
    if (fs.existsSync(path.join(directory, 'packages/design-contracts/package.json'))) root = directory;
    else if (fs.existsSync(path.join(directory, 'packages/hjm-design-system/packages/design-contracts/package.json')))
      root = path.join(directory, 'packages/hjm-design-system');
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return root;
}

function localSource(projectRoot, env = process.env) {
  if (!usesLocalSource(env)) return null;
  projectRoot = fs.realpathSync(projectRoot);
  const found = findSourceRoot(projectRoot, env);
  if (!found) throw new Error('Cannot find local HJM checkout; set HJM_SOURCE_ROOT or use HJM_LOCAL_SOURCE=0 for published-package verification');
  const root = fs.realpathSync(found);
  const aliases = {};
  const peers = new Set();
  for (const name of packageNames) {
    const directory = path.join(root, 'packages', name);
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    if (manifest.name !== `@hjmds/${name}`) throw new Error(`Unexpected HJM package at ${directory}`);
    for (const peer of Object.keys(manifest.peerDependencies ?? {})) if (!peer.startsWith('@hjmds/')) peers.add(peer);
    for (const [subpath, entry] of Object.entries(manifest.exports)) {
      const target = typeof entry === 'string' ? entry : entry.import ?? entry.default;
      if (typeof target !== 'string') continue;
      const source = path.resolve(directory, target.replace(/^\.\/dist\//, './src/'));
      const candidates = source.endsWith('.js') ? [source.slice(0, -3) + '.ts', source.slice(0, -3) + '.tsx', source] : [source];
      const file = candidates.find(candidate => fs.existsSync(candidate));
      if (!file || !inside(directory, file)) throw new Error(`Missing source for ${manifest.name}${subpath.slice(1)}`);
      aliases[manifest.name + (subpath === '.' ? '' : subpath.slice(1))] = file;
    }
  }
  return { root, projectRoot, aliases, peers: [...peers] };
}

function relativeSource(state, importer, request) {
  if (!inside(state.root, importer) || !request.startsWith('.') || !request.endsWith('.js')) return null;
  const base = path.resolve(path.dirname(importer), request.slice(0, -3));
  return ['.ts', '.tsx'].map(ext => base + ext).find(file => inside(state.root, file) && fs.existsSync(file)) ?? null;
}

function withMetro(config, projectRoot, env = process.env) {
  if (!usesLocalSource(env)) return config;
  projectRoot = fs.realpathSync(projectRoot);
  const found = findSourceRoot(projectRoot, env);
  const root = found && fs.existsSync(found) ? fs.realpathSync(found) : null;
  // Metro loads config before it knows dev/export mode. Defer source validation
  // until a development request so release bundles work without this checkout.
  let state;
  const previous = config.resolver?.resolveRequest;
  const delegate = (context, request, platform) => previous ? previous(context, request, platform) : context.resolveRequest(context, request, platform);
  return { ...config,
    watchFolders: [...new Set([...(config.watchFolders ?? []), ...(root ? [root] : [])])],
    resolver: { ...config.resolver, resolveRequest(context, request, platform) {
      const fromSource = root && packageNames.some(name => inside(path.join(root, 'packages', name, 'src'), context.originModulePath));
      // The request, not NODE_ENV, selects release resolution. Never allow a
      // direct source import to create a mixed source/published release bundle.
      if (context.dev !== true) {
        if (fromSource) throw new Error('HJM local source requires a development Metro bundle');
        return delegate(context, request, platform);
      }
      if (!request.startsWith('@hjmds/') && !fromSource) return delegate(context, request, platform);
      state ??= localSource(projectRoot, env);
      const source = state.aliases[request] ?? relativeSource(state, context.originModulePath, request);
      if (source) return { type: 'sourceFile', filePath: source };
      if (request.startsWith('@hjmds/')) throw new Error(`HJM source export is not public: ${request}`);
      // Context providers/native peers must belong to the host, not the HJM
      // fixture installation (React duplication and navigation-context failures).
      const peer = state.peers.some(name => request === name || request.startsWith(name + '/'));
      const next = peer ? { ...context, originModulePath: path.join(state.projectRoot, 'package.json') } : context;
      return delegate(next, request, platform);
    } },
  };
}

function vitePlugin(projectRoot, env = process.env) {
  let state;
  return {
    name: 'hjm-local-source', enforce: 'pre',
    config(_config, { command }) {
      state = undefined;
      if (command !== 'serve') return;
      state = localSource(projectRoot ?? _config.root ?? process.cwd(), env);
      if (!state) return;
      let workspaceRoot = state.projectRoot;
      for (let directory = workspaceRoot; path.dirname(directory) !== directory; directory = path.dirname(directory)) {
        if (fs.existsSync(path.join(directory, 'pnpm-workspace.yaml'))) { workspaceRoot = directory; break; }
      }
      return {
        resolve: { dedupe: state.peers },
        optimizeDeps: { exclude: packageNames.map(name => `@hjmds/${name}`) },
        // Add only the source checkout, not a broad parent containing other apps.
        server: { fs: { allow: [...new Set([...(_config.server?.fs?.allow ?? []), workspaceRoot, state.root])] } },
      };
    },
    resolveId(request, importer) {
      if (!state) return null;
      if (state.aliases[request]) return state.aliases[request];
      if (request.startsWith('@hjmds/')) throw new Error(`HJM source export is not public: ${request}`);
      return importer ? relativeSource(state, importer.split('?')[0], request) : null;
    },
  };
}

function peerDirectory(projectRoot, name) {
  const requireFromHost = createRequire(path.join(projectRoot, 'package.json'));
  try {
    let directory = path.dirname(requireFromHost.resolve(name));
    while (path.dirname(directory) !== directory) {
      const manifest = path.join(directory, 'package.json');
      if (fs.existsSync(manifest) && JSON.parse(fs.readFileSync(manifest, 'utf8')).name === name) return directory;
      directory = path.dirname(directory);
    }
  } catch { /* Optional peers remain optional; importing a missing peer still fails in the host. */ }
  return null;
}

function withNext(config, projectRoot, phase, env = process.env) {
  if (phase !== 'phase-development-server') return config;
  const state = localSource(projectRoot, env);
  if (!state) return config;
  // Next picks the bundler before loading this config and exports it as TURBOPACK
  // (`auto` for the default). Turbopack has no extensionAlias for HJM's `./x.js`
  // -> `x.ts` imports and resolves relative aliases from the app, so the source
  // aliases were silently skipped and the published package rendered instead
  // (2026-10-10 BurnTok: missing ActivityChip export). Fail before that happens.
  if (env.TURBOPACK) throw new Error('HJM local source in Next needs webpack: run `next dev --webpack` (Turbopack would silently use the published @hjmds package)');
  // Missing optional peers must fail only when imported, never fall back to the
  // design-system fixture's installation and hide a host dependency requirement.
  // Next vendors React per layer (RSC/SSR/browser) with exact `react$` aliases. A
  // prefix `react` alias here outranks them and loads a second React, failing every
  // page with useContext null (2026-10-10 BurnTok /login 500). Next's aliases match by
  // request name, so HJM source outside the project already gets Next's React.
  const peers = Object.fromEntries(state.peers.filter(name => !nextOwnedPeers.has(name))
    .map(name => [name, peerDirectory(projectRoot, name) ?? path.join(state.projectRoot, 'node_modules', name)]));
  const previous = config.webpack;
  return { ...config,
    transpilePackages: [...new Set([...(config.transpilePackages ?? []), '@hjmds/react', '@hjmds/design-contracts'])],
    webpack(webpackConfig, options) {
      const result = previous ? previous(webpackConfig, options) : webpackConfig;
      result.resolve ??= {};
      result.resolve.alias = { ...peers, ...result.resolve.alias, ...Object.fromEntries(Object.entries(state.aliases).map(([key, value]) => [key + '$', value])) };
      result.resolve.extensionAlias = { ...result.resolve.extensionAlias, '.js': ['.ts', '.tsx', '.js'] };
      return result;
    },
  };
}
module.exports = { localSource, relativeSource, withMetro, vitePlugin, withNext };
