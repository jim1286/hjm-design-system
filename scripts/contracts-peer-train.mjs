/**
 * The contracts peer range rule from docs/RELEASE_GOVERNANCE.md, kept in its own
 * module so tests can exercise it directly. Importing check-workspace-sync.mjs
 * runs the entire workspace check at module load, which would make a unit test
 * of this rule depend on the whole workspace being in sync.
 */

function parseStableVersion(version, label) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`${label} is not a stable semver: ${version}`);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function assertContractsPeerTrain(rendererName, peerRange, fixedVersion) {
  const match = /^>=(\d+)\.(\d+)\.0 <(\d+)\.(\d+)\.0$/.exec(peerRange ?? "");
  if (!match) {
    throw new Error(
      `${rendererName} contracts peer must be one explicit minor train, for example >=0.6.0 <0.7.0; received ${String(peerRange)}`,
    );
  }
  const minimum = { major: Number(match[1]), minor: Number(match[2]) };
  const upper = { major: Number(match[3]), minor: Number(match[4]) };
  if (minimum.major !== upper.major || upper.minor !== minimum.minor + 1) {
    throw new Error(`${rendererName} contracts peer ${peerRange} spans more than one minor train`);
  }

  const current = parseStableVersion(fixedVersion, "fixed package version");
  const isCurrentTrain = minimum.major === current.major && minimum.minor === current.minor;
  // Before the version PR, renderer code targets the authored next release while
  // package.json still carries the previous Git tag. That next train is the next
  // minor within the same major...
  const isAuthoredNextMinor = minimum.major === current.major
    && minimum.minor === current.minor + 1;
  // ...or, for a release that bumps the major, the `.0` train of the next major.
  // Only 0.x was expressible before, so a major bump failed this check even when
  // the range was authored exactly as the governance doc requires — the rule is
  // "one explicit minor train, authored ahead of the version PR", and which
  // component increments is the release's decision, not this checker's
  // (2026-09-14, first major train).
  const isAuthoredNextMajor = minimum.major === current.major + 1 && minimum.minor === 0;
  if (!isCurrentTrain && !isAuthoredNextMinor && !isAuthoredNextMajor) {
    throw new Error(
      `${rendererName} contracts peer ${peerRange} is not aligned with ${fixedVersion} or its authored next train`,
    );
  }
}
