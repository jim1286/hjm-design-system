import { gzipSync } from "node:zlib";
import {
  mkdtemp,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const require = createRequire(import.meta.url);
const { runBuild } = require("metro");
const metroConfig = require("../metro.config.cjs");

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const entryFile = path.join(packageRoot, "test/metro-entry/index.js");

// This is minified production JavaScript before Hermes bytecode compilation.
// Budgets include React Native itself so the fixture catches resolver/runtime drift,
// while retaining deliberate headroom for patch-level React Native changes.
const budget = Object.freeze({
  rawBytes: 1_500_000,
  gzipBytes: 350_000,
});

const requiredRendererSources = [
  "packages/react-native/dist/actions.js",
  "packages/react-native/dist/data-display.js",
  "packages/react-native/dist/evidence.js",
  "packages/react-native/dist/feedback.js",
  "packages/react-native/dist/forms.js",
  "packages/react-native/dist/inputs.js",
  "packages/react-native/dist/number-field.js",
  "packages/react-native/dist/slider.js",
  "packages/react-native/dist/navigation.js",
  "packages/react-native/dist/overlays.js",
  "packages/react-native/dist/primitives.js",
  "packages/react-native/dist/provider.js",
];

const forbiddenSourcePatterns = [
  { label: "Expo", pattern: /(?:^|\/)node_modules\/expo(?:\/|$)/u },
  { label: "react-dom", pattern: /(?:^|\/)node_modules\/react-dom(?:\/|$)/u },
  {
    label: "@hjm/react",
    pattern: /(?:^|\/)(?:packages\/react|node_modules\/@hjm\/react)(?:\/|$)/u,
  },
];

function normalizeSource(source) {
  return source.replaceAll("\\", "/");
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function fail(message) {
  throw new Error(`Metro bundle check failed: ${message}`);
}

const outputDirectory = await mkdtemp(path.join(tmpdir(), "hjm-rn-metro-"));
const bundleFile = path.join(outputDirectory, "index.android.bundle");
const sourceMapFile = `${bundleFile}.map`;
const startedAt = performance.now();

try {
  await runBuild(metroConfig, {
    assets: false,
    bundleOut: bundleFile,
    dev: false,
    entry: entryFile,
    minify: true,
    platform: "android",
    sourceMap: true,
    sourceMapOut: sourceMapFile,
    sourceMapUrl: path.basename(sourceMapFile),
  });

  const [bundle, mapText, bundleStats] = await Promise.all([
    readFile(bundleFile),
    readFile(sourceMapFile, "utf8"),
    stat(bundleFile),
  ]);
  const sourceMap = JSON.parse(mapText);
  if (!Array.isArray(sourceMap.sources)) fail("source map does not expose its module graph");
  const sources = sourceMap.sources.map(normalizeSource);

  for (const requiredSource of requiredRendererSources) {
    if (!sources.some((source) => source.endsWith(requiredSource))) {
      fail(`granular renderer source was not bundled: ${requiredSource}`);
    }
  }
  if (sources.some((source) => source.endsWith("packages/react-native/dist/index.js"))) {
    fail("the root renderer barrel entered a granular-import fixture");
  }
  for (const { label, pattern } of forbiddenSourcePatterns) {
    const contaminatedSource = sources.find((source) => pattern.test(source));
    if (contaminatedSource) fail(`${label} contamination: ${contaminatedSource}`);
  }

  const rawBytes = bundleStats.size;
  const gzipBytes = gzipSync(bundle, { level: 9 }).byteLength;
  if (rawBytes > budget.rawBytes) {
    fail(`raw pre-Hermes bundle ${formatBytes(rawBytes)} exceeds ${formatBytes(budget.rawBytes)}`);
  }
  if (gzipBytes > budget.gzipBytes) {
    fail(`gzip pre-Hermes bundle ${formatBytes(gzipBytes)} exceeds ${formatBytes(budget.gzipBytes)}`);
  }

  const elapsedSeconds = (performance.now() - startedAt) / 1000;
  console.log(
    [
      "Metro Android production bundle OK",
      `modules=${sources.length}`,
      `raw=${formatBytes(rawBytes)}/${formatBytes(budget.rawBytes)}`,
      `gzip=${formatBytes(gzipBytes)}/${formatBytes(budget.gzipBytes)}`,
      `preHermes=true`,
      `time=${elapsedSeconds.toFixed(2)}s`,
    ].join(" | "),
  );
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
