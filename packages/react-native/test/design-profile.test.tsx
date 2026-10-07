import { useEffect, useState } from "react";
import { TextInput, Text as NativeText, View } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { heading, radius as foundationRadius } from "@hjmds/design-contracts/foundations";
import { HjmNativeProvider } from "../src/provider.js";
import { OverviewScreen } from "../src/design-profile.js";
import { Surface, Text } from "../src/primitives.js";
import { Collapsible } from "../src/collapsible.js";
import { Card } from "../src/data-display.js";
import { Heading } from "../src/heading.js";

// Substitute only the native drawing host. Real profile/grid/screen/state code
// runs here; device rendering and optional SVG availability need separate QA.
vi.mock("react-native-svg", async () => {
  const { View } = await import("react-native");
  return { default: View, Circle: View, Defs: View, Ellipse: View, RadialGradient: View, Stop: View, Pattern: View, Rect: View, Mask: View, Image: View };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("retains native collection and tool drafts across every profile and closed/inline tools", () => {
  let mounts = 0;
  function Draft({ label }: { label: string }) {
    const [value, setValue] = useState("initial");
    useEffect(() => { mounts++; }, []);
    return <TextInput accessibilityLabel={label} value={value} onChangeText={setValue} />;
  }
  const render = (preset: HjmDesignPreset) => <HjmNativeProvider theme="dark" textScale={2} direction="rtl" reducedMotion designProfile={hjmDesignPresets[preset]}>
    <OverviewScreen title="기록" toolbarLabel="도구" toolbar={<Draft label="도구 초안" />}
      items={[{ id: "record", children: <Draft label="기록 초안" /> }]} />
  </HjmNativeProvider>;
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(render("retro")); });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: "도구 초안" }).props.onChangeText("tool draft");
      tree.root.findByProps({ accessibilityLabel: "기록 초안" }).props.onChangeText("record draft");
    });
    for (const preset of Object.keys(hjmDesignPresets) as HjmDesignPreset[]) {
      act(() => tree.update(render(preset)));
      expect(tree.root.findByProps({ accessibilityLabel: "도구 초안" }).props.value).toBe("tool draft");
      expect(tree.root.findByProps({ accessibilityLabel: "기록 초안" }).props.value).toBe("record draft");
      expect(mounts).toBe(2);
      const surface = tree.root.findByType(Surface).findAllByType(View)[0]!;
      expect(surface.props.style[0].borderRadius).toBe(hjmDesignPresets[preset].tokens.radius.lg);
    }
    act(() => tree.update(render("paper")));
    act(() => tree.root.findByType(Collapsible).props.onOpenChange(false));
    expect(tree.root.findByProps({ accessibilityLabel: "도구 초안" }).props.value).toBe("tool draft");
    expect(tree.root.findAllByType(View).some(node => node.props.importantForAccessibility === "no-hide-descendants" && node.props.style?.display === "none")).toBe(true);
    act(() => tree.update(render("minimal")));
    expect(mounts).toBe(2);
    expect(tree.root.findByType(Collapsible).props.presentation).toBe("inline");
    expect(tree.root.findByProps({ accessibilityLabel: "도구 초안" }).props.value).toBe("tool draft");
  } finally { act(() => tree.unmount()); }
});

it("centers landscape headings and removes platform elevation when a profile requests no shadow", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.forest}>
      <OverviewScreen title="기록" toolbarLabel="도구" items={[{ id: "a", children: <Text>내용</Text> }]} />
    </HjmNativeProvider>); });
    const title = tree.root.findAllByType(Text).find(node => node.props.accessibilityRole === "header")!;
    expect(title.props.variant).toBe("heading");
    expect(title.props.align).toBe("center");
    act(() => tree.update(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.terminal}>
      <Surface tone="raised"><Text>내용</Text></Surface>
    </HjmNativeProvider>));
    expect(tree.root.findByType(Surface).findAllByType(View)[0]!.props.style[1].elevation).toBe(0);
  } finally { act(() => tree.unmount()); }
});

it("keeps card media clipping aligned with the themed surface across profiles, modes and explicit radius roles", () => {
  let tree!: ReactTestRenderer;
  try {
    for (const preset of [undefined, ...Object.keys(hjmDesignPresets) as HjmDesignPreset[]]) {
      for (const theme of ["light", "dark"] as const) {
        for (const cornerRadius of ["sm", "lg"] as const) {
          const render = <HjmNativeProvider theme={theme} reducedMotion {...(preset === undefined ? {} : { designProfile: hjmDesignPresets[preset] })}>
            <Card title="사진이 있는 카드" tone="raised" radius={cornerRadius} media={<Text>대표 이미지 host</Text>} />
          </HjmNativeProvider>;
          act(() => { if (tree) tree.update(render); else tree = create(render); });
          const expected = (preset === undefined ? foundationRadius : hjmDesignPresets[preset].tokens.radius)[cornerRadius];
          const frame = tree.root.findByType(Surface).findAllByType(View)[0]!;
          const mediaClip = tree.root.findByType(Card).findAllByType(View).find(node => node.props.style?.overflow === "hidden")!;
          expect(frame.props.style[0].borderRadius).toBe(expected);
          expect(mediaClip.props.style.borderRadius).toBe(expected);
          expect(frame.props.style[0].overflow).toBe("visible");
        }
      }
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("sends all five themed heading metrics to the native text host without changing document level or double scaling", () => {
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { heading: {
    level1: { fontSize: 56, lineHeight: 68 }, level2: { fontSize: 36, lineHeight: 46 },
    level3: { fontSize: 27, lineHeight: 36 }, level4: { fontSize: 22, lineHeight: 30 },
    level5: { fontSize: 19, lineHeight: 28, fontWeight: "500" },
  } } });
  const levels = Object.keys(heading) as (keyof typeof heading)[];
  const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style)
    ? Object.assign({}, ...style.map(flatten)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
  let tree!: ReactTestRenderer;
  try {
    for (const profile of [undefined, ...Object.values(hjmDesignPresets), custom]) {
      for (const theme of ["light", "dark"] as const) {
        const render = <HjmNativeProvider theme={theme} textScale={2} direction="rtl" reducedMotion {...(profile ? { designProfile: profile } : {})}>
          <HjmNativeProvider>{levels.map(level => <Heading key={level} level={level} semanticLevel={4}>긴 제목 {level}</Heading>)}</HjmNativeProvider>
        </HjmNativeProvider>;
        act(() => { if (tree) tree.update(render); else tree = create(render); });
        const hosts = tree.root.findAllByType(NativeText);
        levels.forEach((level, index) => {
          const expected = (profile?.tokens.heading ?? heading)[level]; const host = hosts[index]!;
          const style = flatten(host.props.style);
          expect(host.props.accessibilityRole).toBe("header"); expect(host.props["aria-level"]).toBe(4);
          expect(host.props.allowFontScaling).toBe(false);
          expect(style.fontSize).toBe(expected.fontSize * 2); expect(style.lineHeight).toBe(expected.lineHeight * 2);
          expect(style.fontWeight).toBe(expected.fontWeight);
        });
      }
    }
  } finally { if (tree) act(() => tree.unmount()); }
});
