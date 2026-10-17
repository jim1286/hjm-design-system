import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { expect, it } from "vitest";
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "../src/auth-screen.js";
import { authScreenRecipe } from "@hjmds/design-contracts/components/auth-screen";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { TextField } from "../src/inputs.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { HjmNativeProvider } from "../src/provider.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("preserves mounted actions while hiding them from touch and accessibility and restores them after cancellation", () => {
  let tree!: ReactTestRenderer;
  const screen = (pending: boolean) => <HjmNativeProvider><AuthScreenLayout mainCard
    {...(pending ? { pendingLabel: "로그인 중" } : {})} hero={null}
    main={<Pressable accessibilityLabel="Google" />} footer={null} /></HjmNativeProvider>;
  act(() => { tree = create(screen(false)); });
  try {
    const button = tree.root.findByType(Pressable);
    act(() => tree.update(screen(true)));
    expect(tree.root.findByType(Pressable)).toBe(button);
    const hidden = tree.root.findAllByType(View).find(node => node.props.importantForAccessibility === "no-hide-descendants")!;
    expect(hidden.props).toMatchObject({ pointerEvents: "none", accessibilityElementsHidden: true, style: { opacity: 0 } });
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
    const loading = tree.root.findAllByType(View).find(node => node.props.accessibilityRole === "progressbar")!;
    expect(loading.props).toMatchObject({ accessibilityLabel: "로그인 중", accessibilityState: { busy: true },
      style: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" } });
    act(() => tree.update(screen(false)));
    expect(tree.root.findByType(Pressable)).toBe(button);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(tree.root.findAllByType(View).some(node => node.props.importantForAccessibility === "no-hide-descendants")).toBe(false);
  } finally { act(() => tree.unmount()); }
});

const flattenStyle = (style: unknown): Record<string, unknown> => typeof style === "function" ? flattenStyle(style({ pressed: false }))
  : Array.isArray(style) ? Object.assign({}, ...style.map(flattenStyle)) : (style ?? {}) as Record<string, unknown>;

it("inherits product login-card corners without replacing drafts or pending actions", () => {
  let tree!: ReactTestRenderer;
  const product = defineHjmDesignProfile({ id: "product-auth", tokens: { radius: { lg: 39 } } });
  const screen = (profile: HjmDesignProfile | undefined, theme: "light" | "dark", pending: boolean) => <HjmNativeProvider
    textScale={1} theme={theme} {...(profile ? { designProfile: profile } : {})}><HjmNativeProvider><AuthScreenLayout mainCard
      {...(pending ? { pendingLabel: "로그인 중" } : {})} hero={null}
      main={<View><TextField label="검토 초안" defaultValue="기록" /><AuthProviderButton descriptor={{ provider: "google", label: "Google" }} logo={<View />} onPress={() => {}} /></View>}
      footer={null} /></HjmNativeProvider></HjmNativeProvider>;
  try {
    act(() => { tree = create(screen(undefined, "light", false)); });
    const input = tree.root.findByType(TextInput); const button = tree.root.findByType(Pressable);
    act(() => input.props.onChangeText("보존할 초안"));
    const providerShape = flattenStyle(button.props.style);
    for (const theme of ["light", "dark"] as const) for (const profile of [...Object.values(hjmDesignPresets), product, undefined]) {
      for (const pending of [false, true]) {
        act(() => tree.update(screen(profile, theme, pending)));
        expect(tree.root.findByType(TextInput)).toBe(input); expect(input.props.value).toBe("보존할 초안");
        expect(tree.root.findByType(Pressable)).toBe(button);
        const card = tree.root.findAllByType(View).find(node => {
          const style = flattenStyle(node.props.style); return style?.padding === 16 && style?.width === "100%" && style?.borderRadius !== undefined;
        })!;
        expect(flattenStyle(card.props.style).borderRadius).toBe(profile?.tokens.radius.lg ?? authScreenRecipe.mainCard.radius);
        // Google owns its light/dark branding; the surrounding product profile must not replace it.
        expect(flattenStyle(button.props.style)).toMatchObject({ backgroundColor: theme === "dark" ? "#131314" : "#FFFFFF", borderRadius: providerShape.borderRadius });
        expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(pending ? 1 : 0);
        if (pending) expect(tree.root.findAllByType(View).some(node => node.props.pointerEvents === "none" && node.props.accessibilityElementsHidden === true)).toBe(true);
      }
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("draws the hero tagline on the recipe title step and separates policy links by one gap and a dot", () => {
  let tree!: ReactTestRenderer;
  const screen = (density: "regular" | "compact") => <HjmNativeProvider><AuthScreenLayout density={density}
    hero={<AuthScreenHero eyebrow="이야기" title="당신의 일상을 이야기로 남겨요" description="설명" />} main={null}
    footer={<AuthScreenFooter links={[{ label: "이용약관", onPress: () => undefined }, { label: "개인정보처리방침", onPress: () => undefined }]} />} /></HjmNativeProvider>;
  act(() => { tree = create(screen("regular")); });
  try {
    const title = () => flattenStyle(tree.root.findAllByType(Text).find(node => node.props.accessibilityRole === "header")!.props.style);
    // 2026-10-17 "굵기랑 크기 줄여": a title step (24/32, 500), not the display heading (32/40).
    expect(title()).toMatchObject({ fontSize: 24, lineHeight: 32, fontWeight: "500" });
    const links = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "link");
    expect(links).toHaveLength(2);
    for (const link of links) {
      // The touch target is invisible: background-less height plus inline hitSlop, no visible padding.
      expect(flattenStyle(link.props.style)).toEqual({ minHeight: authScreenRecipe.footerMinTouchTarget, justifyContent: "center" });
      expect(link.props.hitSlop).toEqual({ left: authScreenRecipe.footer.linkGap, right: authScreenRecipe.footer.linkGap });
    }
    const row = tree.root.findAllByType(View).find(node => flattenStyle(node.props.style).columnGap !== undefined)!;
    expect(flattenStyle(row.props.style).columnGap).toBe(authScreenRecipe.footer.linkGap);
    expect(tree.root.findAllByType(Text).some(node => node.props.children === authScreenRecipe.footer.separator)).toBe(true);
    act(() => tree.update(screen("compact")));
    expect(title()).toMatchObject({ fontSize: 20, lineHeight: 28 });
  } finally { act(() => tree.unmount()); }
});

// 2026-10-17 1.28 adoption: products wrapped AuthScreenLayout in their own bottom inset and lost the policy link hint.
it("pads max(paddingBlock, safeAreaBottom) once and passes per-link accessibility hints", () => {
  let tree!: ReactTestRenderer;
  const screen = (safeAreaBottom?: number) => <HjmNativeProvider><AuthScreenLayout density="compact" hero={null} main={<View />}
    {...(safeAreaBottom === undefined ? {} : { safeAreaBottom })}
    footer={<AuthScreenFooter links={[{ label: "개인정보 처리방침", accessibilityHint: "브라우저에서 열림", onPress: () => {} }, { label: "이용약관", onPress: () => {} }]} />} /></HjmNativeProvider>;
  act(() => { tree = create(screen()); });
  try {
    const scroll = () => tree.root.find(node => node.props.contentContainerStyle?.flexGrow === 1);
    const block = authScreenRecipe.densities.compact.paddingBlock;
    expect(scroll().props.contentContainerStyle).toMatchObject({ paddingTop: block, paddingBottom: block });
    expect(scroll().props.contentInsetAdjustmentBehavior).toBeUndefined();
    act(() => tree.update(screen(34)));
    expect(scroll().props.contentContainerStyle.paddingBottom).toBe(Math.max(block, 34));
    const links = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityRole === "link");
    expect(links.map(node => [node.props.accessibilityLabel, node.props.accessibilityHint])).toEqual([["개인정보 처리방침", "브라우저에서 열림"], ["이용약관", undefined]]);
    expect(() => act(() => tree.update(screen(-1)))).toThrow(/safeAreaBottom must be non-negative/u);
  } finally { act(() => tree.unmount()); }
});
