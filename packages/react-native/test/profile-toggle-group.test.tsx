import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets, type HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { toggleGroupRecipe } from "@hjmds/design-contracts/components/toggle-group";
import { HjmNativeProvider } from "../src/provider.js";
import { ToggleGroup } from "../src/toggle-group.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const descriptor = { accessibilityLabel: "글자 꾸미기", items: [
  { id: "bold", label: "굵게" }, { id: "italic", label: "기울임" }, { id: "locked", label: "잠김", disabled: true },
] } as const;

it("inherits every preset corner while retaining multiple selection and disabled host actions", () => {
  let tree!: ReactTestRenderer; const change = vi.fn();
  const render = (profile: HjmDesignProfile | undefined, theme: "light" | "dark") => <HjmNativeProvider theme={theme} textScale={1} reducedMotion
    {...(profile ? { designProfile: profile } : {})}><HjmNativeProvider><ToggleGroup descriptor={descriptor}
      defaultPressedIds={new Set(["bold"])} onPressedIdsChange={change} /></HjmNativeProvider></HjmNativeProvider>;
  try {
    act(() => { tree = create(render(undefined, "light")); });
    const buttons = tree.root.findAllByType(Pressable); act(() => buttons[1]!.props.onPress());
    expect([...change.mock.calls.at(-1)![0]]).toEqual(["bold", "italic"]);
    const product = defineHjmDesignProfile({ id: "product", tokens: { radius: { md: 29 } } });
    for (const theme of ["light", "dark"] as const) for (const profile of [...Object.values(hjmDesignPresets), product, undefined]) {
      act(() => tree.update(render(profile, theme)));
      expect(tree.root.findAllByType(Pressable)).toEqual(buttons);
      expect(buttons[0]!.props.accessibilityState.selected).toBe(true); expect(buttons[1]!.props.accessibilityState.selected).toBe(true);
      expect(buttons[2]!.props.accessibilityState).toEqual({ selected: false, disabled: true }); expect(buttons[2]!.props.disabled).toBe(true);
      expect(StyleSheet.flatten(buttons[0]!.props.style).borderRadius).toBe(profile?.tokens.radius.md ?? toggleGroupRecipe.radius);
      expect(StyleSheet.flatten(buttons[0]!.props.style).minHeight).toBeGreaterThanOrEqual(44);
    }
    act(() => buttons[2]!.props.onPress()); expect([...change.mock.calls.at(-1)![0]]).toEqual(["bold", "italic"]);
    act(() => buttons[1]!.props.onPress()); expect([...change.mock.calls.at(-1)![0]]).toEqual(["bold"]);
  } finally { if (tree) act(() => tree.unmount()); }
});

it("uses the closest explicit profile and resets to the neutral corner", () => {
  let tree!: ReactTestRenderer;
  try {
    for (const profile of [hjmDesignPresets.retro, undefined]) {
      const ui = <HjmNativeProvider designProfile={hjmDesignPresets.forest} textScale={1}>
        <HjmNativeProvider designProfile={profile ?? hjmDesignPresets.neutral}><ToggleGroup descriptor={descriptor} /></HjmNativeProvider>
      </HjmNativeProvider>;
      act(() => { if (tree) tree.update(ui); else tree = create(ui); });
      expect(StyleSheet.flatten(tree.root.findAllByType(Pressable)[0]!.props.style).borderRadius).toBe(profile?.tokens.radius.md ?? toggleGroupRecipe.radius);
    }
  } finally { if (tree) act(() => tree.unmount()); }
});
