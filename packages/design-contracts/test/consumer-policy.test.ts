import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const policyUrl = new URL("../docs/consumer-policy.md", import.meta.url);

describe("consumer adoption policy", () => {
  it("is versioned, normative, and covers every catalog maturity", async () => {
    const policy = await readFile(policyUrl, "utf8");

    expect(policy).toContain("상태: **Normative**");
    expect(policy).toMatch(/정책 버전: \*\*\d+\.\d+\.\d+\*\*/);
    for (const maturity of ["stable", "beta", "planned", "deprecated"]) {
      expect(policy).toContain(`\`${maturity}\``);
    }

  });

  it("is reachable from both public package entry documents", async () => {
    const [workspaceReadme, packageReadme, packageJsonSource] = await Promise.all([
      readFile(new URL("../../../README.md", import.meta.url), "utf8"),
      readFile(new URL("../README.md", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
      access(policyUrl),
    ]);
    const packageJson = JSON.parse(packageJsonSource) as {
      exports?: Record<string, { default?: string }>;
      files?: string[];
    };

    expect(workspaceReadme).toContain("packages/design-contracts/docs/consumer-policy.md");
    expect(packageReadme).toContain("./docs/consumer-policy.md");
    expect(packageJson.files).toContain("docs");
    expect(packageJson.exports?.["./consumer-policy.md"]?.default).toBe(
      "./docs/consumer-policy.md",
    );
  });

  // The 1.5 foundation bridge and 1.11 removal timetable are historical migrations.
  // Do not require current policy prose to duplicate them.
  it("connects the RN guide and public composition type to the normative boundary", async () => {
    const [nativeReadme, nativePackageSource, compositionSource, ...coreSources] =
      await Promise.all([
        readFile(new URL("../../react-native/README.md", import.meta.url), "utf8"),
        readFile(new URL("../../react-native/package.json", import.meta.url), "utf8"),
        readFile(new URL("../../react-native/src/composition-style.ts", import.meta.url), "utf8"),
        ...["actions.tsx", "primitives.tsx", "forms.tsx", "inputs.tsx"].map((file) =>
          readFile(new URL(`../../react-native/src/${file}`, import.meta.url), "utf8")
        ),
      ]);
    const nativePackage = JSON.parse(nativePackageSource) as {
      exports?: Record<string, { types?: string }>;
    };

    expect(nativeReadme).toContain(
      "../design-contracts/docs/consumer-policy.md#31-배치와-시각-값",
    );
    expect(nativeReadme).toContain("type HjmCompositionStyle");
    expect(nativePackage.exports?.["./composition-style"]?.types)
      .toBe("./dist/composition-style.d.ts");
    expect(compositionSource).toContain("export type HjmCompositionStyle");
    for (const controlledKey of [
      "backgroundColor",
      "borderRadius",
      "color",
      "fontSize",
      "height",
      "opacity",
      "padding",
      "transform",
    ]) {
      expect(compositionSource).not.toContain(`"${controlledKey}",`);
    }
    for (const source of coreSources) {
      expect(source).toContain("layoutStyle");
      expect(source).not.toContain("@deprecated Legacy compatibility only");
    }
  });
});
