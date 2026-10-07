import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { radius as foundationRadius } from "@hjmds/design-contracts/foundations";
import { HjmNativeProvider } from "../src/provider.js";
import { OverviewScreen } from "../src/design-profile.js";
import { Surface, Text } from "../src/primitives.js";
import { Collapsible } from "../src/collapsible.js";
import { Card } from "../src/data-display.js";

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
