import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories: string[] = [];

function git(directory: string, ...args: string[]) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();
}

async function writePackage(directory: string, packageDirectory: string, version: string) {
  await mkdir(join(directory, "packages", packageDirectory), { recursive: true });
  await writeFile(
    join(directory, "packages", packageDirectory, "package.json"),
    `${JSON.stringify({ name: `@hjm/${packageDirectory}`, version }, null, 2)}\n`,
  );
}

async function writeSynchronizedVersions(directory: string, version: string) {
  await mkdir(join(directory, "packages/design-contracts/src"), { recursive: true });
  await mkdir(join(directory, "packages/react/src"), { recursive: true });
  await mkdir(join(directory, "packages/react-native/src"), { recursive: true });
  await writeFile(
    join(directory, "packages/design-contracts/src/version.ts"),
    `export const designSystemVersion = "${version}" as const;\n`,
  );
  for (const renderer of ["react", "react-native"]) {
    await writeFile(
      join(directory, `packages/${renderer}/src/evidence.ts`),
      `export const evidence = { packageVersion: "${version}" };\n`,
    );
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("generated Changesets version PR gate", () => {
  it("accepts the authored fixed minor bump and rejects an escalated major", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hjm-version-pr-test-"));
    temporaryDirectories.push(directory);
    await mkdir(join(directory, "scripts"), { recursive: true });
    await mkdir(join(directory, ".changeset"), { recursive: true });
    const checker = await readFile(
      new URL("../../../scripts/check-version-pr.mjs", import.meta.url),
      "utf8",
    );
    await writeFile(join(directory, "scripts/check-version-pr.mjs"), checker);
    for (const packageDirectory of ["design-contracts", "react", "react-native"]) {
      await writePackage(directory, packageDirectory, "0.5.2");
    }
    await writeSynchronizedVersions(directory, "0.5.2");
    await writeFile(
      join(directory, ".changeset/release.md"),
      [
        "---",
        '"@hjm/design-contracts": minor',
        '"@hjm/react": minor',
        '"@hjm/react-native": minor',
        "---",
        "",
        "Release the fixed train.",
        "",
      ].join("\n"),
    );
    git(directory, "init", "-b", "main");
    git(directory, "config", "user.name", "HJM Test");
    git(directory, "config", "user.email", "hjm-test@example.com");
    git(directory, "add", ".");
    git(directory, "commit", "-m", "base");
    const baseRevision = git(directory, "rev-parse", "HEAD");

    await rm(join(directory, ".changeset/release.md"));
    for (const packageDirectory of ["design-contracts", "react", "react-native"]) {
      await writePackage(directory, packageDirectory, "0.6.0");
    }
    await writeSynchronizedVersions(directory, "0.6.0");
    git(directory, "add", "-A");
    git(directory, "commit", "-m", "version 0.6.0");

    expect(() =>
      execFileSync(process.execPath, ["scripts/check-version-pr.mjs", baseRevision], {
        cwd: directory,
        stdio: "pipe",
      }),
    ).not.toThrow();

    for (const packageDirectory of ["design-contracts", "react", "react-native"]) {
      await writePackage(directory, packageDirectory, "1.0.0");
    }
    await writeSynchronizedVersions(directory, "1.0.0");
    git(directory, "add", "-A");
    git(directory, "commit", "-m", "unexpected major escalation");

    expect(() =>
      execFileSync(process.execPath, ["scripts/check-version-pr.mjs", baseRevision], {
        cwd: directory,
        stdio: "pipe",
      }),
    ).toThrow(/Command failed/);
  });
});

describe("private consumer release evidence gate", () => {
  const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));

  it("accepts fully joined consumer evidence and rejects a mismatched release SHA", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/check-consumer-release.mjs", "--self-test"], {
        cwd: workspaceRoot,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });

  it("fails closed when the canonical consumer dispatch token is absent", async () => {
    const manifest = JSON.parse(
      await readFile(join(workspaceRoot, "packages/design-contracts/package.json"), "utf8"),
    );
    expect(() =>
      execFileSync(
        process.execPath,
        [
          "scripts/check-consumer-release.mjs",
          "--repository",
          "jim1286/hjm-design-system",
          "--release-sha",
          "a".repeat(40),
          "--version",
          manifest.version,
        ],
        {
          cwd: workspaceRoot,
          env: { ...process.env, HJM_CONSUMER_SYNC_TOKEN: "" },
          stdio: "pipe",
        },
      ),
    ).toThrow(/Command failed/);
  });
});

describe("repository install guidance", () => {
  const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));

  it("binds the React Native package name to the React Native package path", async () => {
    const [readme, migration] = await Promise.all([
      readFile(join(workspaceRoot, "README.md"), "utf8"),
      readFile(
        join(workspaceRoot, "packages/design-contracts/docs/migration-0.6.md"),
        "utf8",
      ),
    ]);

    expect(readme).toMatch(
      /"@hjm\/react-native":\s*"git\+[^"\n]+path:\/packages\/react-native"/,
    );
    expect(migration).toMatch(
      /'@hjm\/react-native@git\+[^'\n]+path:\/packages\/react-native'/,
    );
    expect(`${readme}\n${migration}`).not.toMatch(
      /@hjm\/react(?:@|"\s*:)\s*[^\n]*path:\/packages\/react-native/,
    );
  });
});
