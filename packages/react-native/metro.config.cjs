const path = require("node:path");
const {
  getDefaultConfig,
  mergeConfig,
} = require("@react-native/metro-config");

const packageRoot = __dirname;
const workspaceRoot = path.resolve(packageRoot, "../..");

module.exports = mergeConfig(getDefaultConfig(packageRoot), {
  projectRoot: packageRoot,
  // Shared workstation: a bundle check must not spawn one worker per host core.
  maxWorkers: 2,
  reporter: { update() {} },
  watchFolders: [workspaceRoot],
  resolver: {
    disableHierarchicalLookup: false,
    resolveRequest(context, moduleName, platform) {
      // Simulate absent optional peers even on a developer checkout that has them installed.
      if (["@shopify/react-native-skia", "react-native-reanimated", "react-native-worklets", "react-native-gesture-handler", "react-native-zoom-toolkit", "react-native-keyboard-controller", "@gorhom/bottom-sheet", "zeego", "@react-native-menu/menu", "react-native-ios-utilities", "react-native-ios-context-menu"].some(name => moduleName === name || moduleName.startsWith(`${name}/`))) {
        throw new Error(`Default HJM entry reached optional effect dependency: ${moduleName}`);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    // Metro does not implement Node's package self-reference lookup. This maps
    // the fixture's consumer-style imports back to this package while still
    // resolving every granular subpath through package.json exports.
    extraNodeModules: {
      "@hjmds/react-native": packageRoot,
    },
    nodeModulesPaths: [
      path.join(packageRoot, "node_modules"),
      path.join(workspaceRoot, "node_modules"),
    ],
    unstable_enablePackageExports: true,
  },
});
