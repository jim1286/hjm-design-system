import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, Animated, Pressable, TextInput, Text as NativeText, View } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignPreset } from "@hjmds/design-contracts/design-profile";
import { heading, shadow as foundationShadow, radius as foundationRadius } from "@hjmds/design-contracts/foundations";
import { HjmNativeProvider } from "../src/provider.js";
import { OverviewScreen } from "../src/design-profile.js";
import { Surface, Text } from "../src/primitives.js";
import { Collapsible } from "../src/collapsible.js";
import { Card } from "../src/data-display.js";
import { Heading } from "../src/heading.js";
import { Dialog, AlertDialog, Sheet } from "../src/overlays.js";
import { Select, Combobox } from "../src/forms.js";
import { Notice, Skeleton, Toast } from "../src/feedback.js";
const floatingShadow = foundationShadow.floating;

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

// This exercises the actual overlay and adaptive-field consumers, not just the
// provider record: theme changes must update chrome without replacing feature state.
it("themes open native overlays while keeping their draft subtree and modal semantics", () => {
  const custom = defineHjmDesignProfile({ extends: "clay", tokens: { radius: { md: 29, lg: 37 }, shadow: { floating: { color: "#123456", radius: 19, offsetY: 7, opacity: 0.21 } } } });
  const profiles = [undefined, ...Object.values(hjmDesignPresets), custom];
  const flatten = (style: unknown): Record<string, unknown> => typeof style === "function" ? flatten(style({ pressed: false })) : Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
  for (const kind of ["dialog", "sheet", "alertdialog"] as const) {
    let tree!: ReactTestRenderer; let mounts = 0;
    function Draft() {
      const [value, setValue] = useState("initial"); useEffect(() => { mounts++; }, []);
      return <TextInput accessibilityLabel="열린 초안" value={value} onChangeText={setValue} />;
    }
    try {
      for (const profile of profiles) {
        const render = <HjmNativeProvider theme="dark" textScale={2} direction="rtl" reducedMotion {...(profile ? { designProfile: profile } : {})}>
          {kind === "dialog" ? <Dialog open onOpenChange={() => {}} title="기록" closeLabel="닫기"><Draft /></Dialog> : kind === "sheet" ? <Sheet open onOpenChange={() => {}} title="기록" closeLabel="닫기"><Draft /></Sheet> : <AlertDialog open onOpenChange={() => {}} request={{ mode: "confirm", title: "저장할까요?", description: "기록을 저장해요.", confirmLabel: "저장", cancelLabel: "취소" }} />}
        </HjmNativeProvider>;
        act(() => { if (tree) tree.update(render); else tree = create(render); });
        const host = tree.root.find(node => node.props.role === (kind === "sheet" ? "dialog" : kind));
        const style = flatten(host.props.style);
        const corners = profile?.tokens.radius ?? foundationRadius;
        const shadow = profile?.tokens.shadow.floating ?? floatingShadow;
        expect(host.props.accessibilityViewIsModal).toBe(true);
        expect(style.borderRadius).toBe(corners[kind === "sheet" ? "xl" : "lg"]);
        expect(style.shadowColor).toBe(shadow.color); expect(style.shadowRadius).toBe(shadow.radius);
        expect(style.shadowOpacity).toBe(shadow.opacity); expect(style.shadowOffset).toEqual({ width: 0, height: shadow.offsetY });
        expect(style.elevation).toBe(profile ? shadow.opacity === 0 ? 0 : Math.max(shadow.radius, Math.abs(shadow.offsetY)) : 8);
        if (kind !== "alertdialog") {
          const draft = tree.root.findByType(TextInput);
          if (mounts === 1 && draft.props.value === "initial") act(() => draft.props.onChangeText("kept draft"));
          expect(tree.root.findByType(TextInput).props.value).toBe("kept draft"); expect(mounts).toBe(1);
        } else {
          const confirm = tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "저장")!;
          expect(flatten(confirm.props.style).borderRadius).toBe(corners.md);
        }
      }
    } finally { if (tree) act(() => tree.unmount()); }
  }
});

it("themes native adaptive choices, loading and feedback while retaining selections and explicit skeleton geometry", () => {
  const flatten = (style: unknown): Record<string, unknown> => typeof style === "function" ? flatten(style({ pressed: false })) : Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style && typeof style === "object" ? style as Record<string, unknown> : {};
  let tree!: ReactTestRenderer;
  try {
    for (const profile of [hjmDesignPresets.clay, hjmDesignPresets.brutalist, hjmDesignPresets.terminal]) {
      const render = <HjmNativeProvider theme="dark" reducedMotion designProfile={profile}>
        <Select label="기간" placeholder="선택" items={[{ id: "a", label: "오늘", textValue: "오늘" }, { id: "b", label: "이번 주", textValue: "이번 주" }]} defaultSelectedKey="b" open dismissLabel="닫기" optionsAccessibilityLabel="기간 선택" />
        <Combobox label="검색" source={{ items: [{ id: "a", label: "가나다", textValue: "가나다" }] }} defaultSelectedKey="a" open dismissLabel="닫기" resultsAccessibilityLabel="검색 선택" clearLabel="지우기" emptyMessage="없음" loadingMessage="불러오는 중" />
        <Notice title="안내" /><Skeleton animated={false} /><Skeleton animated={false} radius={13} />
        <Toast descriptor={{ id: "saved", description: "저장했어요", closeLabel: "닫기", durationMs: null }} />
      </HjmNativeProvider>;
      act(() => { if (tree) tree.update(render); else tree = create(render); });
      for (const field of [Select, Combobox]) {
        const choices = tree.root.findByType(field).findAllByType(Pressable).filter(node => node.props.accessibilityRole === "radio");
        expect(choices.some(node => node.props.accessibilityState.checked)).toBe(true);
        expect(choices.every(node => flatten(node.props.style).borderRadius === profile.tokens.radius.md)).toBe(true);
      }
      const notice = tree.root.findByType(Notice).findAllByType(View)[0]!;
      expect(flatten(notice.props.style).borderRadius).toBe(profile.tokens.radius.md);
      const placeholders = tree.root.findAllByType(Skeleton);
      expect(flatten(placeholders[0]!.findByType(Animated.View).props.style).borderRadius).toBe(profile.tokens.radius.md);
      expect(flatten(placeholders[1]!.findByType(Animated.View).props.style).borderRadius).toBe(13);
      const toast = tree.root.findByType(Toast).findByType(Animated.View);
      expect(flatten(toast.props.style)).toMatchObject({ borderRadius: profile.tokens.radius.lg, shadowRadius: profile.tokens.shadow.floating.radius, shadowOpacity: profile.tokens.shadow.floating.opacity });
    }
  } finally { if (tree) act(() => tree.unmount()); }
});


it("keeps a surface draft mounted through glass, clay, unsupported and failed decoration hosts", () => {
  let mounts = 0;
  function Draft() { const [value, setValue] = useState("initial"); useEffect(() => { mounts++; }, []); return <TextInput accessibilityLabel="질감 초안" value={value} onChangeText={setValue} />; }
  const working = vi.fn(() => <View testID="real-backdrop-host" />);
  const empty = () => null;
  const broken = () => { throw new Error("host unavailable"); };
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  let tree!: ReactTestRenderer;
  const render = (profile: typeof hjmDesignPresets.glass, renderBackdrop?: typeof working | typeof empty | typeof broken, insetShadows = false) => <HjmNativeProvider theme="dark" reducedMotion designProfile={profile} surfaceEffects={{ ...(renderBackdrop ? { renderBackdrop } : {}), insetShadows }}>
    <HjmNativeProvider><Surface tone="raised"><Draft /></Surface></HjmNativeProvider>
  </HjmNativeProvider>;
  try {
    act(() => { tree = create(render(hjmDesignPresets.glass)); });
    act(() => tree.root.findByProps({ accessibilityLabel: "질감 초안" }).props.onChangeText("retained"));
    expect(tree.root.findByType(Surface).findAllByType(View)[0]!.props.style[0].backgroundColor).toBe(hjmDesignPresets.glass.palette.dark.bg);
    act(() => tree.update(render(hjmDesignPresets.glass, working)));
    expect(working).toHaveBeenCalledWith({ strength: hjmDesignPresets.glass.material.surface!.blurStrength, theme: "dark" });
    const decoration = tree.root.findByProps({ testID: "real-backdrop-host" }).parent!.parent!;
    expect(tree.root.findAllByType(View).some(node => node.props.pointerEvents === "none" && node.props.accessibilityElementsHidden && node.props.importantForAccessibility === "no-hide-descendants")).toBe(true);
    expect(decoration).toBeTruthy();
    for (const host of [empty, broken]) {
      act(() => tree.update(render(hjmDesignPresets.glass, host)));
      expect(tree.root.findAllByType(View).some(node => !Array.isArray(node.props.style) && node.props.style?.backgroundColor === hjmDesignPresets.glass.palette.dark.bg)).toBe(true);
      expect(tree.root.findByProps({ accessibilityLabel: "질감 초안" }).props.value).toBe("retained");
    }
    act(() => tree.update(render(hjmDesignPresets.glass, working)));
    expect(tree.root.findAllByType(View).some(node => node.props.testID === "real-backdrop-host")).toBe(true);
    act(() => tree.update(render(hjmDesignPresets.clay, working)));
    const frame = () => Object.assign({}, ...tree.root.findByType(Surface).findAllByType(View)[0]!.props.style);
    expect(frame().boxShadow).toBeUndefined();
    act(() => tree.update(render(hjmDesignPresets.clay, working, true)));
    expect(frame().boxShadow).toHaveLength(2);
    expect(frame().boxShadow.every((item: { inset: boolean }) => item.inset)).toBe(true);
    act(() => tree.update(render(hjmDesignPresets.neutral, working, true)));
    expect(frame().boxShadow).toBeUndefined();
    expect(mounts).toBe(1);
    expect(tree.root.findByProps({ accessibilityLabel: "질감 초안" }).props.value).toBe("retained");
  } finally { act(() => tree.unmount()); error.mockRestore(); }
});

it("keeps iOS unknown and reduced transparency opaque and shares live OS changes with nested providers", async () => {
  const os = Platform.OS; Platform.OS = "ios";
  let finishQuery!: (value: boolean) => void;
  const query = vi.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockImplementation(() => new Promise(resolve => { finishQuery = resolve; }));
  let changed!: (value: boolean) => void;
  const remove = vi.fn();
  // The mocked native emitter implements only remove(); the runtime callback
  // below covers the boolean preference event, not SDK announcement metadata.
  const events = vi.spyOn(AccessibilityInfo, "addEventListener").mockImplementation(((name: string, listener: (value: boolean) => void) => { if (name === "reduceTransparencyChanged") changed = listener; return { remove }; }) as unknown as typeof AccessibilityInfo.addEventListener);
  const host = vi.fn(() => <View testID="blur" />);
  let tree!: ReactTestRenderer;
  try {
    await act(async () => { tree = create(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.glass} surfaceEffects={{ renderBackdrop: host }}><HjmNativeProvider><Surface><TextInput accessibilityLabel="초안" /></Surface></HjmNativeProvider></HjmNativeProvider>); });
    expect(query).toHaveBeenCalledTimes(1); expect(host).not.toHaveBeenCalled();
    await act(async () => changed(true));
    await act(async () => finishQuery(false));
    expect(host).not.toHaveBeenCalled();
    await act(async () => changed(false));
    expect(tree.root.findAllByType(View).filter(node => node.props.testID === "blur")).toHaveLength(1);
    await act(async () => changed(true));
    expect(tree.root.findAllByType(View).filter(node => node.props.testID === "blur")).toHaveLength(0);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(1);
    await act(async () => tree.unmount()); expect(remove).toHaveBeenCalled();
  } finally { query.mockRestore(); events.mockRestore(); Platform.OS = os; }
});


it("keeps a rejected iOS transparency query opaque instead of enabling a backdrop", async () => {
  const os = Platform.OS; Platform.OS = "ios";
  const query = vi.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockRejectedValue(new Error("preference unavailable"));
  const host = vi.fn(() => <View testID="unavailable-preference-blur" />);
  let tree!: ReactTestRenderer;
  try {
    await act(async () => { tree = create(<HjmNativeProvider reducedMotion designProfile={hjmDesignPresets.glass} surfaceEffects={{ renderBackdrop: host }}><Surface><TextInput accessibilityLabel="실패 후 초안" /></Surface></HjmNativeProvider>); });
    expect(host).not.toHaveBeenCalled();
    expect(tree.root.findByType(Surface).findAllByType(View)[0]!.props.style[0].backgroundColor).toBe(hjmDesignPresets.glass.palette.light.bg);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(1);
  } finally { if (tree) await act(async () => tree.unmount()); query.mockRestore(); Platform.OS = os; }
});
