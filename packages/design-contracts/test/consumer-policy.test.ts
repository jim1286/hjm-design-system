import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { componentCatalog } from "../src/catalog.js";

const policyUrl = new URL("../docs/consumer-policy.md", import.meta.url);

describe("consumer adoption policy", () => {
  it("is versioned, normative, and covers every catalog maturity", async () => {
    const policy = await readFile(policyUrl, "utf8");

    expect(policy).toContain("상태: **Normative**");
    expect(policy).toMatch(/정책 버전: \*\*\d+\.\d+\.\d+\*\*/);
    for (const maturity of ["stable", "beta", "planned", "deprecated"]) {
      expect(policy).toContain(`\`${maturity}\``);
    }
    expect(policy).toContain("제품 정체성 경계");
    expect(policy).toContain("신규 앱 완료 조건");
    expect(policy).toContain("Stable Core와 필수 foundation bridge");
    expect(policy).toContain("`requiredFoundations`");
    expect(policy).toContain("`draft` /\n  `incubating`");
    expect(policy).toContain("timestamp가 있는 `verified` evidence");
    expect(policy).toContain("optional adoption");
    expect(policy).toContain("정책 버전: **1.2.0**");
    expect(policy).toContain("React Native legacy style compatibility boundary");
    expect(policy).toContain("`HjmCompositionStyle` / `layoutStyle`");
    expect(policy).toContain("첫 `1.0.0` train");
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

  it("names every beta foundation that the current app-standard bridge must expose", async () => {
    const policy = await readFile(policyUrl, "utf8");
    const requiredFoundationNames = [
      "Text",
      "Icon",
      "Stack",
      "Container",
      "DesignSystemProvider",
    ];

    for (const name of requiredFoundationNames) {
      const entry = componentCatalog.find((candidate) => candidate.name === name);
      expect(entry, `${name} must remain a catalog entry`).toBeDefined();
      expect(entry?.status, `${name} policy text must be revised when it leaves beta`).toBe("beta");
      expect(policy).toContain(`\`${name}\``);
    }
  });

  it("connects the RN guide and public composition type to the normative boundary", async () => {
    const [policy, nativeReadme, nativePackageSource, compositionSource, ...coreSources] =
      await Promise.all([
        readFile(policyUrl, "utf8"),
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

    expect(policy).toContain("신규 앱과 기존 앱의 새 화면은 legacy raw style prop을");
    expect(nativeReadme).toContain(
      "../design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary",
    );
    expect(nativeReadme).toContain("type HjmCompositionStyle");
    expect(nativeReadme).toContain("no later than the first\n`1.0.0` release gate");
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
      expect(source).toContain("@deprecated Legacy compatibility only");
      expect(source).toContain("consumer-policy.md#31-react-native-legacy-style-compatibility-boundary");
    }
  });
});
