import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, View } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { bottomCtaRecipe, bottomNavigationRecipe } from "@hjmds/design-contracts/recipes";
import { HjmNativeProvider } from "../src/provider.js";
import { BottomCTA } from "../src/actions.js";
import { BottomNavigation } from "../src/navigation.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style && typeof style === "object" ? { ...style } : {};
it("uses profile floating strength for navigation and upward footer shadows while retaining route/action ownership", () => {
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { shadow: { floating: { color: "#123456", opacity: 0.21, radius: 19, offsetY: 7 } } } });
  const onPress = vi.fn(), onActivate = vi.fn(); let tree!: ReactTestRenderer;
  const descriptor = { accessibilityLabel: "메뉴", selectedKey: "home", items: [{ id: "home", label: "홈", icon: { name: "home" } }, { id: "saved", label: "보관함", icon: { name: "saved" } }] };
  try {
    for (const profile of [undefined, ...Object.values(hjmDesignPresets), custom]) {
      for (const presentation of ["bar", "floating", "capsule"] as const) {
        const content = <HjmNativeProvider theme="dark" direction="rtl" textScale={2} reducedMotion {...(profile ? { designProfile: profile } : {})}>
          <BottomCTA accessibilityLabel="저장 행동" safeAreaBottom={24} primaryAction={{ label: "저장", onPress }} />
          <BottomNavigation descriptor={descriptor} configuration={{ presentation }} renderIcon={() => <View />} getItemTestID={item => `route-${item.id}`} onActivate={onActivate} />
        </HjmNativeProvider>;
        act(() => { if (tree) tree.update(content); else tree = create(content); });
        const footer = tree.root.findByType(BottomCTA).findAllByType(View)[0]!;
        const footerStyle = flatten(footer.props.style);
        const footerToken = profile?.tokens.shadow.floating ?? bottomCtaRecipe.shadow;
        expect(footerStyle).toMatchObject({ shadowColor: footerToken.color, shadowRadius: footerToken.radius, shadowOpacity: footerToken.opacity, shadowOffset: { width: 0, height: profile ? -Math.abs(footerToken.offsetY) : footerToken.offsetY }, paddingBottom: 24 });
        expect(footerStyle.elevation).toBe(profile ? footerToken.opacity === 0 ? 0 : Math.max(footerToken.radius, Math.abs(footerToken.offsetY)) : bottomCtaRecipe.shadow.elevation);
        const navigation = tree.root.findByType(BottomNavigation);
        const surface = navigation.findAllByType(View)[1]!;
        const surfaceStyle = flatten(surface.props.style);
        const navToken = profile?.tokens.shadow.floating ?? bottomNavigationRecipe.presentations.floating.shadow;
        if (presentation !== "bar") {
          expect(surfaceStyle).toMatchObject({ shadowColor: navToken.color, shadowOpacity: navToken.opacity, shadowRadius: navToken.radius, shadowOffset: { width: 0, height: navToken.offsetY } });
          expect(surfaceStyle.elevation).toBe(profile ? navToken.opacity === 0 ? 0 : Math.max(navToken.radius, Math.abs(navToken.offsetY)) : 8);
        } else { expect(surfaceStyle.elevation).toBe(0); expect(surfaceStyle.shadowOpacity).toBeUndefined(); }
      }
    }
    expect(onActivate).not.toHaveBeenCalled(); expect(onPress).not.toHaveBeenCalled();
    act(() => tree.root.findByProps({ testID: "route-saved" }).props.onPress());
    expect(onActivate).toHaveBeenCalledOnce();
    expect(tree.root.findByType(BottomNavigation).props.descriptor.selectedKey).toBe("home");
    const save = tree.root.findByType(BottomCTA).findAllByType(Pressable)[0]!;
    act(() => save.props.onPress()); expect(onPress).toHaveBeenCalledOnce();
  } finally { act(() => tree.unmount()); }
});
