const path = require("node:path");
const {
  getDefaultConfig,
  mergeConfig,
} = require("@react-native/metro-config");

const packageRoot = __dirname;
const workspaceRoot = path.resolve(packageRoot, "../..");

module.exports = mergeConfig(getDefaultConfig(packageRoot), {
  projectRoot: packageRoot,
  reporter: { update() {} },
  watchFolders: [workspaceRoot],
  resolver: {
    disableHierarchicalLookup: false,
    // Metro does not implement Node's package self-reference lookup. This maps
    // the fixture's consumer-style imports back to this package while still
    // resolving every granular subpath through package.json exports.
    extraNodeModules: {
      "@hjm/react-native": packageRoot,
    },
    nodeModulesPaths: [
      path.join(packageRoot, "node_modules"),
      path.join(workspaceRoot, "node_modules"),
    ],
    unstable_enablePackageExports: true,
  },
});
