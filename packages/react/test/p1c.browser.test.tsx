import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { SkipNav } from "../src/skip-nav.js";
import { BottomInfo } from "../src/bottom-info.js";
import { Sidebar } from "../src/sidebar.js";
import { Sheet } from "../src/overlays.js";
import { Button } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("keeps the skip link out of the way until it is focused, then shows it", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <SkipNav targetId="main" label="본문 바로가기" />
      <nav><a href="#a">첫 링크</a></nav>
      <main id="main"><p>본문</p></main>
    </HjmProvider>,
  ));
  const link = document.querySelector<HTMLAnchorElement>(".hjm-skip-nav")!;
  // Off-canvas but still in the tab order — that is the whole point.
  expect(link.getBoundingClientRect().bottom).toBeLessThanOrEqual(0);
  await act(async () => link.focus());
  expect(link.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  expect(Math.round(link.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});

it("moves focus into the target, not only the scroll position", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <SkipNav targetId="main" label="본문 바로가기" />
      <main id="main"><p>본문</p></main>
    </HjmProvider>,
  ));
  await act(async () => document.querySelector<HTMLAnchorElement>(".hjm-skip-nav")!.click());
  const main = document.getElementById("main")!;
  expect(document.activeElement).toBe(main);
  expect(main.getAttribute("tabindex")).toBe("-1");
});

it("renders standing conditions without an alarm tone, as a sentence or a list", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <BottomInfo items={["가입하면 약관에 동의하는 것으로 봅니다"]} />
    </HjmProvider>,
  ));
  expect(document.querySelector("ul.hjm-bottom-info__list")).toBeNull();
  // No status role: this is not a state change, so it must not be announced as one.
  expect(document.querySelector(".hjm-bottom-info")!.getAttribute("role")).toBeNull();

  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <BottomInfo tone="emphasis" items={["수수료는 결제 시 확정됩니다", "환불은 7일 이내에 가능합니다"]} />
    </HjmProvider>,
  ));
  expect(document.querySelectorAll(".hjm-bottom-info__item")).toHaveLength(2);
  expect(document.querySelector("ul.hjm-bottom-info__list")).not.toBeNull();
});

it("announces the current sidebar item and keeps every item when collapsed", async () => {
  const onNavigate = vi.fn();
  function Fixture() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <HjmProvider reducedMotion>
        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          collapseLabels={{ collapse: "메뉴 접기", expand: "메뉴 펼치기" }}
          onNavigate={onNavigate}
          renderIcon={() => <span>■</span>}
          descriptor={{
            accessibilityLabel: "주요 메뉴",
            currentId: "records",
            groups: [
              { id: "main", label: "기록", items: [{ id: "records", label: "내 기록" }, { id: "archive", label: "보관함", badgeCount: 3 }] },
              { id: "account", items: [{ id: "profile", label: "프로필" }, { id: "billing", label: "결제", disabled: true }] },
            ],
          }}
        />
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Fixture />));
  const items = () => [...document.querySelectorAll<HTMLAnchorElement>(".hjm-sidebar__item")];
  expect(items()).toHaveLength(4);
  expect(items()[0]!.getAttribute("aria-current")).toBe("page");
  expect(document.querySelector('[role="group"]')!.getAttribute("aria-label")).toBe("기록");

  await act(async () => items()[1]!.click());
  expect(onNavigate.mock.calls).toEqual([["archive"]]);
  await act(async () => items()[3]!.click());
  // A disabled item never navigates.
  expect(onNavigate.mock.calls).toEqual([["archive"]]);

  await act(async () => document.querySelector<HTMLButtonElement>(".hjm-sidebar__toggle")!.click());
  // Collapsing is density: labels hide, items and their names stay.
  expect(items()).toHaveLength(4);
  expect(getComputedStyle(document.querySelector(".hjm-sidebar__label")!).display).toBe("none");
  expect(items()[0]!.getAttribute("aria-label")).toBe("내 기록");
  expect(document.querySelector(".hjm-sidebar__badge")!.textContent).toBe("3");
  expect(Math.round(document.querySelector(".hjm-sidebar")!.getBoundingClientRect().width)).toBe(72);
});

it("lets a keyboard user step the sheet between detents", async () => {
  function SheetFixture() {
    const [detent, setDetent] = useState<"medium" | "large" | "full">("medium");
    return (
      <HjmProvider reducedMotion>
        <Sheet
          defaultOpen
          title="지도 위 목록"
          closeLabel="닫기"
          detents={["medium", "large", "full"]}
          activeDetent={detent}
          onDetentChange={setDetent}
          detentLabels={{ expand: "더 크게 보기", collapse: "작게 보기" }}
          trigger={<Button>열기</Button>}
        >
          <p>목록 본문</p>
        </Sheet>
      </HjmProvider>
    );
  }
  await act(async () => root.render(<SheetFixture />));
  const sheet = () => document.querySelector<HTMLElement>(".hjm-sheet")!;
  const handle = () => document.querySelector<HTMLButtonElement>(".hjm-sheet__handle")!;
  expect(sheet().dataset.detent).toBe("medium");
  // The handle is a real control: it has a name and works without a gesture.
  expect(handle().getAttribute("aria-label")).toBe("더 크게 보기");
  await act(async () => handle().click());
  expect(sheet().dataset.detent).toBe("large");
  await act(async () => handle().click());
  expect(sheet().dataset.detent).toBe("full");
  // At the top the control turns around instead of becoming a dead end.
  expect(handle().getAttribute("aria-label")).toBe("작게 보기");
  await act(async () => handle().click());
  expect(sheet().dataset.detent).toBe("large");
});
