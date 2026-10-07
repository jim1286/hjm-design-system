import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Asset } from "../src/asset.js";
import { HjmProvider } from "../src/provider.js";
import { assetRecipe } from "@hjmds/design-contracts/components/asset";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("inherits rounded asset corners without changing explicit geometry or remounting media", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { radius: { md: 23 } } });
  let original: HTMLInputElement | undefined;
  try {
    for (const profile of [undefined, ...Object.values(hjmDesignPresets), custom]) {
      for (const theme of ["light", "dark"] as const) {
        await act(() => root.render(<HjmProvider theme={theme} textScale={2} direction="rtl" reducedMotion {...(profile ? { designProfile: profile } : {})}>
          <HjmProvider>{(["rounded", "square", "circle"] as const).map(shape => <Asset key={shape} descriptor={{ kind: "image", size: "xlarge", shape, accessibilityLabel: shape }}>
            <input aria-label={`media-${shape}`} defaultValue="draft" />
          </Asset>)}</HjmProvider>
        </HjmProvider>));
        const frames = host.querySelectorAll<HTMLElement>(".hjm-asset__frame");
        [profile?.tokens.radius.md ?? assetRecipe.shapes.rounded, 0, assetRecipe.shapes.circle].forEach((value, index) => {
          expect(getComputedStyle(frames[index]!).borderTopLeftRadius).toBe(`${value}px`);
          expect(frames[index]!.getBoundingClientRect().width).toBe(assetRecipe.sizes.xlarge);
        });
        const input = host.querySelector<HTMLInputElement>('[aria-label="media-rounded"]')!;
        if (!original) { original = input; original.value = "retained"; original.focus(); }
        expect(input).toBe(original); expect(input.value).toBe("retained"); expect(document.activeElement).toBe(input);
        expect(host.querySelector('[role="img"][aria-label="rounded"]')).not.toBeNull();
      }
    }
  } finally { await act(() => root.unmount()); host.remove(); }
});
