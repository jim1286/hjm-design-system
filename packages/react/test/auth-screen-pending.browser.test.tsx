import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { AuthScreenLayout } from "../src/auth-screen.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("hides all actions, preserves the card bounds and centres one loader until authentication ends", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  function Login() {
    const [pending, setPending] = useState(false);
    return <HjmProvider><button onClick={() => setPending(false)}>Cancel authentication</button>
      <AuthScreenLayout mainCard {...(pending ? { pendingLabel: "로그인 중" } : {})}
        hero={<h1>로그인</h1>} footer={<a href="#privacy">Privacy</a>}
        main={<div style={{ display: "grid", gap: 8 }}>{(["kakao", "google", "apple"] as const).map(provider =>
          <AuthProviderButton key={provider} descriptor={{ provider, label: provider }} logo={<span>Logo</span>}
            onClick={() => setPending(true)} />)}</div>} />
    </HjmProvider>;
  }
  try {
    await act(() => root.render(<Login />));
    const card = host.querySelector<HTMLElement>(".hjm-auth-screen__main")!;
    const before = card.getBoundingClientRect();
    const background = getComputedStyle(card).backgroundColor;
    await act(() => host.querySelector<HTMLButtonElement>('[data-provider="kakao"]')!.click());
    const after = card.getBoundingClientRect();
    expect(after.toJSON()).toEqual(before.toJSON());
    expect(getComputedStyle(card).backgroundColor).toBe(background);
    const actions = card.querySelector<HTMLElement>(".hjm-auth-screen__actions")!;
    expect(actions.inert).toBe(true);
    expect(actions.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(actions).visibility).toBe("hidden");
    const hiddenButton = actions.querySelector<HTMLButtonElement>("button")!;
    hiddenButton.focus();
    expect(document.activeElement).not.toBe(hiddenButton);
    const loader = card.querySelector<HTMLElement>('[role="status"]')!;
    expect(loader.getAttribute("aria-label")).toBe("로그인 중");
    expect(card.querySelectorAll(".hjm-auth-provider-button__spinner")).toHaveLength(1);
    const spinner = loader.firstElementChild!.getBoundingClientRect();
    expect(Math.abs(spinner.x + spinner.width / 2 - (after.x + after.width / 2))).toBeLessThan(1);
    expect(Math.abs(spinner.y + spinner.height / 2 - (after.y + after.height / 2))).toBeLessThan(1);
    expect(host.querySelector("footer, .hjm-auth-screen__footer")?.textContent).toContain("Privacy");
    await act(() => host.querySelector<HTMLButtonElement>("button")!.click());
    expect(card.querySelector('[role="status"]')).toBeNull();
    expect(actions.inert).toBe(false);
    expect(getComputedStyle(actions).visibility).toBe("visible");
    expect(card.getBoundingClientRect().toJSON()).toEqual(before.toJSON());
  } finally { await act(() => root.unmount()); host.remove(); }
});
