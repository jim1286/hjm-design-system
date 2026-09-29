import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { BottomNavigationDescriptor } from "@hjmds/design-contracts/components/bottom-navigation";
import { BottomNavigation, HjmProvider } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

export const bottomNavigationKeyboardCases = [{ componentId: "bottom-navigation" }] as const;

const descriptor: BottomNavigationDescriptor<"home" | "search", "home" | "search"> = {
  accessibilityLabel: "주요 탐색",
  selectedKey: "home",
  items: [
    { id: "home", label: "홈", icon: { name: "home" } },
    { id: "search", label: "주변의 새로운 소식과 업데이트", icon: { name: "search" } },
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

it("navigates by Tab and Enter while keeping the full visible route label", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/bottom-navigation.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
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

  const nav = container.querySelector<HTMLElement>('nav[aria-label="주요 탐색"]')!;
  const [home, search] = [...nav.querySelectorAll<HTMLAnchorElement>("a")];
  expect(home!.getAttribute("aria-current")).toBe("page");
  expect(search!.getAttribute("aria-label")).toBe("주변의 새로운 소식과 업데이트");
  expect(search!.querySelector(".hjm-bottom-navigation__label")?.textContent)
    .toBe("주변의 새로운 소식과 업데이트");

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(home);
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(search);
  await act(async () => userEvent.keyboard("{Enter}"));

  expect(onActivate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });
  // The renderer emits route intent; selectedKey remains router-owned.
  expect(home!.getAttribute("aria-current")).toBe("page");
  expect(search!.hasAttribute("aria-current")).toBe(false);
});
