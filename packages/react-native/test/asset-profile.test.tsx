import { useEffect, useState } from "react";
import { View, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it } from "vitest";
import { Asset } from "../src/asset.js";
import { HjmNativeProvider } from "../src/provider.js";
import { assetRecipe } from "@hjmds/design-contracts/components/asset";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("inherits rounded asset corners while preserving explicit shapes and native media state", () => {
  let tree!: ReactTestRenderer; let mounts = 0;
  function Media() {
    const [value, onChangeText] = useState("draft");
    useEffect(() => { mounts++; }, []);
    return <TextInput accessibilityLabel="media" value={value} onChangeText={onChangeText} />;
  }
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { radius: { md: 23 } } });
  try {
    for (const profile of [undefined, ...Object.values(hjmDesignPresets), custom]) {
      for (const theme of ["light", "dark"] as const) {
        const next = <HjmNativeProvider theme={theme} textScale={2} direction="rtl" reducedMotion {...(profile ? { designProfile: profile } : {})}>
          <HjmNativeProvider>{(["rounded", "square", "circle"] as const).map(shape => <Asset key={shape} descriptor={{ kind: "image", size: "xlarge", shape, accessibilityLabel: shape }}><Media /></Asset>)}</HjmNativeProvider>
        </HjmNativeProvider>;
        act(() => { if (tree) tree.update(next); else tree = create(next); });
        const assets = tree.root.findAllByType(Asset);
        [profile?.tokens.radius.md ?? assetRecipe.shapes.rounded, 0, assetRecipe.shapes.circle].forEach((value, index) => {
          const frame = assets[index]!.findAllByType(View).find(node => node.props.style?.width === assetRecipe.sizes.xlarge)!;
          expect(frame.props.style.borderRadius).toBe(value);
          expect(frame.props.style.height).toBe(assetRecipe.sizes.xlarge);
        });
        const input = tree.root.findAllByType(TextInput)[0]!;
        if (input.props.value === "draft") act(() => input.props.onChangeText("retained"));
        expect(tree.root.findAllByType(TextInput)[0]!.props.value).toBe("retained"); expect(mounts).toBe(3);
      }
    }
  } finally { if (tree) act(() => tree.unmount()); }
});
