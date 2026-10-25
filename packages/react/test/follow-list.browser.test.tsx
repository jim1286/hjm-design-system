import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { FollowListScreen } from "../src/follow-list.js";
import "../src/styles.css";
const labels = { followers: "팔로워 12", following: "팔로잉 3", tabs: "관계", search: "검색", clearSearch: "지우기", searching: "검색 중", empty: "결과 없음", follow: "팔로우", followed: "팔로잉", pending: "변경 중", failed: "실패" };
it("keeps profile navigation separate, locks an in-flight mutation and preserves the confirmed relationship after failure", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); host.style.cssText = "width:390px;height:844px"; document.body.append(host);
  const root = createRoot(host); const open = vi.fn(); let reject!: (error: Error) => void;
  const change = vi.fn(() => new Promise<void>((_, no) => { reject = no; }));
  function Example() {
    const [tab, setTab] = useState<"followers" | "following">("followers");
    return <HjmProvider><FollowListScreen title="jimin.archive" labels={labels} tab={tab} onTabChange={setTab}
      query="" onQueryChange={() => {}} people={[{id:"one",username:"minji.archive",name:"김민지",following:false}]}
      onOpenProfile={open} onFollowChange={change} /></HjmProvider>;
  }
  try {
    await act(async () => root.render(<Example />));
    expect(document.activeElement?.tagName).not.toBe("INPUT");
    const button = host.querySelector<HTMLButtonElement>('button[aria-label="minji.archive: 팔로우"]')!;
    expect(button).toBeTruthy();
    const avatar = host.querySelector<HTMLElement>(".hjm-avatar")!;
    expect(avatar.getBoundingClientRect().width).toBe(48);
    expect(avatar.getBoundingClientRect().height).toBe(48);
    expect(getComputedStyle(avatar).borderRadius).toBe("50%");
    expect(button.parentElement?.closest('button')).toBeNull();
    await act(async () => { button.click(); button.click(); });
    expect(change).toHaveBeenCalledTimes(1); expect(open).not.toHaveBeenCalled(); expect(button.getAttribute("aria-disabled")).toBe("true");
    await act(async () => reject(new Error("offline")));
    expect([...host.querySelectorAll('[role="alert"]')].some(node => node.textContent === "실패")).toBe(true);
    expect(button.textContent).toContain("팔로우"); expect(button.disabled).toBe(false);
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(async () => tabs[1]!.click());
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
    expect(host.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby')).toBe(tabs[1]!.id);
    expect(host.scrollWidth).toBeLessThanOrEqual(390);
    await act(async () => root.unmount());
  } finally { host.remove(); }
});
