import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { expect, it } from "vitest";
import { AuthScreenLayout } from "../src/auth-screen.js";
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
