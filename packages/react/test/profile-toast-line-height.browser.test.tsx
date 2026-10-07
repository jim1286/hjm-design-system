import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Toast } from "../src/toast.js";
import { Text } from "../src/layout.js";
import { Heading } from "../src/heading.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const product = defineHjmDesignProfile({ id: "toast-product", tokens: { typography: { body: { fontSize: 17, lineHeight: 31 } }, fontFamily: { ui: ["Arial"], display: ["Georgia"], reading: ["Times New Roman"] } } });
const nearest = defineHjmDesignProfile({ id: "toast-nearest", tokens: { typography: { body: { fontSize: 18, lineHeight: 39 } } } });

it("inherits profile body line height while keeping focused Toast actions, body reading and legacy ratios", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host); const action = vi.fn(); const dismiss = vi.fn();
  const content = <><Toast descriptor={{ id: "notice", title: "Saved title", description: "Saved description", closeLabel: "Close", durationMs: null, action: { label: "Undo", onAction: action, dismissOnAction: false } }} onDismissRequest={dismiss} /><Text as="p">Reading sentinel</Text><Heading level="level3">Display sentinel</Heading></>;
  let focused: HTMLButtonElement | undefined;
  try {
    for (const theme of ["light", "dark"] as const) for (const profile of [product, nearest, hjmDesignPresets.neutral, undefined]) {
      await act(async () => root.render(<HjmProvider theme={theme} textScale={1} reducedMotion {...(profile ? { designProfile: product } : {})}><HjmProvider {...(profile ? { designProfile: profile } : {})}><HjmProvider>{content}</HjmProvider></HjmProvider></HjmProvider>));
      const button = host.querySelector<HTMLButtonElement>(".hjm-toast__action")!;
      if (!focused) { focused = button; button.focus(); }
      expect(button).toBe(focused); expect(document.activeElement).toBe(focused);
      for (const [selector, ratio] of [[".hjm-toast__title", 1.35], [".hjm-toast__description", 1.45]] as const) {
        const computed = getComputedStyle(host.querySelector(selector)!);
        expect(parseFloat(computed.lineHeight)).toBeCloseTo(profile?.tokens.typography.body.lineHeight ?? parseFloat(computed.fontSize) * ratio, 2);
      }
      if (profile === product) {
        expect(getComputedStyle(host.querySelector(".hjm-text")!).fontFamily).toContain("Times New Roman");
        expect(getComputedStyle(host.querySelector(".hjm-heading")!).fontFamily).toContain("Georgia");
        expect(getComputedStyle(button).fontFamily).toContain("Arial");
      }
      expect(dismiss).not.toHaveBeenCalled();
    }
    await act(async () => focused!.click()); expect(action).toHaveBeenCalledOnce(); expect(dismiss).not.toHaveBeenCalled();
    await act(async () => host.querySelector<HTMLButtonElement>(".hjm-toast__close")!.click()); expect(dismiss).toHaveBeenCalledWith("close-action");
    await act(async () => root.render(content));
    for (const [selector, ratio] of [[".hjm-toast__title", 1.35], [".hjm-toast__description", 1.45]] as const) {
      const computed = getComputedStyle(host.querySelector(selector)!);
      expect(parseFloat(computed.lineHeight)).toBeCloseTo(parseFloat(computed.fontSize) * ratio, 2);
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});
