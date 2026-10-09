const path = require("node:path");
const { withMetro } = require("../../scripts/hjm-local-source.cjs");
const { getDefaultConfig } = require("expo/metro-config");
const { withStorybook } = require("@storybook/react-native/withStorybook");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
// Shared workstation: match the renderer bundle fixture cap instead of spawning one worker per core.
config.maxWorkers = 2;

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// The renderer's RN 0.81 fixture and Expo's RN 0.86 host create distinct pnpm
// peer instances. Navigation contexts must come from the host, otherwise the
// transition navigator cannot see NavigationContainer's LinkingContext.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // The transition engine also owns a context/store shared by its subpath exports.
  const singleton = ["@react-navigation/native", "react-native-screen-transitions"]
    .some(name => moduleName === name || moduleName.startsWith(`${name}/`));
  const hostContext = singleton
    ? { ...context, originModulePath: path.join(projectRoot, "package.json") }
    : context;
  return context.resolveRequest(hostContext, moduleName, platform);
};

module.exports = withMetro(withStorybook(config, {
  configPath: path.resolve(projectRoot, ".rnstorybook"),
  enabled: true,
}), projectRoot);
