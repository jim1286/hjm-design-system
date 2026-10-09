// Development-only adapter. Keep published exports/lockfiles untouched so each
// consumer can adopt a release independently (STANDARD_OPERATIONS: HJM development).
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const packageNames = ['design-contracts', 'react', 'react-native'];
const inside = (root, file) => file === root || file.startsWith(root + path.sep);

function localSource(projectRoot, env = process.env) {
  if (env.HJM_DESIGN_SYSTEM_LOCAL === '1') throw new Error('Use HJM_LOCAL_SOURCE=1 instead of legacy package links');
  if (env.HJM_LOCAL_SOURCE !== '1') return null;
  if (env.NODE_ENV === 'production' || (env.CI && env.CI !== 'false') || env.EAS_BUILD === 'true')
    throw new Error('HJM local source is development-only; unset HJM_LOCAL_SOURCE for published-package verification');
  projectRoot = fs.realpathSync(projectRoot);
  let root = env.HJM_SOURCE_ROOT && path.resolve(projectRoot, env.HJM_SOURCE_ROOT);
  for (let directory = projectRoot; !root;) {
    if (fs.existsSync(path.join(directory, 'packages/design-contracts/package.json'))) root = directory;
    else if (fs.existsSync(path.join(directory, 'packages/hjm-design-system/packages/design-contracts/package.json')))
      root = path.join(directory, 'packages/hjm-design-system');
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  if (!root) throw new Error('Cannot find local HJM checkout; set HJM_SOURCE_ROOT');
  root = fs.realpathSync(root);
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
  const state = localSource(projectRoot, env);
  if (!state) return config;
  const previous = config.resolver?.resolveRequest;
  return { ...config,
    watchFolders: [...new Set([...(config.watchFolders ?? []), state.root])],
    resolver: { ...config.resolver, resolveRequest(context, request, platform) {
      // expo export can run with a development NODE_ENV. The bundle request's
      // dev flag is authoritative, so an inherited shell flag cannot leak source.
      if (context.dev !== true && (request.startsWith('@hjmds/') || inside(path.join(state.root, 'packages'), context.originModulePath)))
        throw new Error('HJM local source requires a development Metro bundle');
      const source = state.aliases[request] ?? relativeSource(state, context.originModulePath, request);
      if (source) return { type: 'sourceFile', filePath: source };
      if (request.startsWith('@hjmds/')) throw new Error(`HJM source export is not public: ${request}`);
      // Context providers/native peers must belong to the host, not the HJM
      // fixture installation (React duplication and navigation-context failures).
      const peer = state.peers.some(name => request === name || request.startsWith(name + '/'));
      const next = peer ? { ...context, originModulePath: path.join(state.projectRoot, 'package.json') } : context;
      return previous ? previous(next, request, platform) : context.resolveRequest(next, request, platform);
    } },
  };
}

function vitePlugin(projectRoot, env = process.env) {
  let state;
  return {
    name: 'hjm-local-source', enforce: 'pre',
    config(_config, { command }) {
      state = localSource(projectRoot ?? _config.root ?? process.cwd(), env);
      if (!state) return;
      if (command !== 'serve') throw new Error('Unset HJM_LOCAL_SOURCE before a Vite build');
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
  const state = localSource(projectRoot, env);
  if (!state) return config;
  if (phase !== 'phase-development-server') throw new Error('Unset HJM_LOCAL_SOURCE before a Next production build/start');
  let commonRoot = state.projectRoot;
  while (!inside(commonRoot, state.root)) commonRoot = path.dirname(commonRoot);
  // Missing optional peers must fail only when imported, never fall back to the
  // design-system fixture's installation and hide a host dependency requirement.
  const peers = Object.fromEntries(state.peers.map(name => [name, peerDirectory(projectRoot, name) ?? path.join(state.projectRoot, 'node_modules', name)]));
  // Turbopack aliases are project-root relative; webpack uses absolute paths.
  const aliases = { ...peers, ...state.aliases };
  const turboAliases = Object.fromEntries(Object.entries(aliases).map(([name, file]) => [name, './' + path.relative(commonRoot, file).split(path.sep).join('/')]));
  const previous = config.webpack;
  return { ...config,
    transpilePackages: [...new Set([...(config.transpilePackages ?? []), '@hjmds/react', '@hjmds/design-contracts'])],
    // Next gives tracingRoot precedence when roots differ; align both in source
    // development so existing standalone configs cannot rebase the HJM aliases.
    outputFileTracingRoot: commonRoot,
    turbopack: { ...config.turbopack, root: commonRoot, resolveAlias: { ...config.turbopack?.resolveAlias, ...turboAliases } },
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
