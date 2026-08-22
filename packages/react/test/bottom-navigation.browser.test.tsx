import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BottomNavigationDescriptor } from "@hjm/design-contracts/components/bottom-navigation";
import { BottomNavigation, HjmProvider } from "../src/index.js";

const descriptor: BottomNavigationDescriptor<"home" | "search", "home" | "search"> = {
  accessibilityLabel: "주요 탐색",
  selectedKey: "home",
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    { id: "search", label: "검색", icon: { name: "search" } },
  ],
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  history.replaceState(null, "", location.pathname);
});

describe("Web BottomNavigation activation", () => {
  it("emits router intent only for an unmodified primary click", async () => {
    const onActivate = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <BottomNavigation
          descriptor={descriptor}
          getHref={(item) => `#${item.id}`}
          onActivate={onActivate}
          renderIcon={({ name }) => <span>{name}</span>}
        />
      </HjmProvider>,
    ));
    const search = container.querySelector<HTMLAnchorElement>('a[href="#search"]')!;

    await act(async () => search.click());
    expect(onActivate).toHaveBeenLastCalledWith({ key: "search", reason: "navigate" });

    await act(async () => {
      search.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }));
    });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});
