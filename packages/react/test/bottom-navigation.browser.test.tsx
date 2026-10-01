import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BottomNavigationDescriptor } from "@hjmds/design-contracts/components/bottom-navigation";
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

it("keeps capsule links named and route state controlled at 200% text", async () => {
  const activate = vi.fn();
  await act(async () => root.render(<HjmProvider systemTheme="light" textScale={2}>
    <BottomNavigation descriptor={descriptor} configuration={{ presentation: "capsule", direction: "rtl" }} getHref={item => `#${item.id}`} onActivate={activate} renderIcon={() => null} primaryAction={<button type="button">추가</button>}/>
  </HjmProvider>));
  expect(container.querySelector('nav')?.getAttribute('data-expanded-labels')).toBe('true');
  const search = container.querySelector<HTMLAnchorElement>('a[href="#search"]')!;
  expect(search.getAttribute('aria-label')).toBe('검색');
  await act(async () => search.click());
  expect(activate).toHaveBeenCalledWith({ key: 'search', reason: 'navigate' });
  expect(container.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('#home');
  expect(container.querySelectorAll('li')).toHaveLength(2);
});
