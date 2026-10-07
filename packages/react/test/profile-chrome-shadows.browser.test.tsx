import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Popover } from "../src/popover.js";
import { BottomCTA } from "../src/bottom-cta.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("updates open popover and footer elevation across profiles without replacing an editable session", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const custom = defineHjmDesignProfile({ extends: "paper", tokens: { shadow: { floating: { color: "#123456", opacity: 0.21, radius: 19, offsetY: 7 } } } });
  let draft: HTMLInputElement | undefined;
  try {
    for (const profile of [...Object.values(hjmDesignPresets), custom]) {
      await act(() => root.render(<HjmProvider theme="dark" direction="rtl" textScale={2} reducedMotion designProfile={profile}>
        <HjmProvider><Popover defaultOpen title="기록 편집" closeLabel="닫기" trigger={<button>열기</button>}><input aria-label="열린 초안" defaultValue="initial" /></Popover>
          <BottomCTA accessibilityLabel="저장 행동" safeAreaBottom={24} primaryAction={{ label: "저장", onClick: () => {} }} />
        </HjmProvider>
      </HjmProvider>));
      const input = document.querySelector<HTMLInputElement>('[aria-label="열린 초안"]')!;
      if (!draft) { draft = input; input.value = "kept draft"; input.focus(); }
      expect(input).toBe(draft); expect(input.value).toBe("kept draft"); expect(document.activeElement).toBe(input);
      const token = profile.tokens.shadow.floating;
      const surface = document.querySelector<HTMLElement>(".hjm-popover")!;
      const footer = host.querySelector<HTMLElement>(".hjm-bottom-cta")!;
      expect(getComputedStyle(surface).boxShadow).toContain(`0px ${token.offsetY}px ${token.radius}px`);
      expect(getComputedStyle(footer).boxShadow).toContain(`0px ${-Math.abs(token.offsetY)}px ${token.radius}px`);
      if (profile === custom) {
        expect(getComputedStyle(surface).boxShadow).toContain("rgba(18, 52, 86, 0.21)");
        expect(getComputedStyle(footer).boxShadow).toContain("rgba(18, 52, 86, 0.21)");
      }
      expect(surface.getAttribute("aria-modal")).toBeNull();
      expect(getComputedStyle(footer).paddingBottom).toBe("24px");
    }
    await act(() => root.render(<HjmProvider><BottomCTA primaryAction={{ label: "저장", onClick: () => {} }} /></HjmProvider>));
    expect(getComputedStyle(host.querySelector(".hjm-bottom-cta")!).boxShadow).toBe("none");
  } finally { await act(() => root.unmount()); host.remove(); }
});
