import { StrictMode, act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  Combobox,
  Dialog,
  HjmProvider,
  Menu,
  Select,
  Sheet,
  Tooltip,
} from "../src/index.js";
import "../src/styles.css";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

async function flush(delay = 20) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
  });
}

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  };
}

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
});

describe("anchored portal popups", () => {
  it("escapes clipping, flips, follows viewport movement, and mirrors start alignment in RTL", async () => {
    await render(
      <div data-clip style={{ inlineSize: 120, blockSize: 40, overflow: "hidden" }}>
        <HjmProvider
          systemTheme="dark"
          direction="rtl"
          textScale={1.5}
          style={{
            display: "contents",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            overflow: "hidden",
            transform: "translateX(12px)",
          }}
        >
          <Menu
            defaultOpen
            align="start"
            trigger={<button type="button">작업</button>}
            label="작업 메뉴"
            sections={[
              { id: "primary", label: "기본", items: [{ id: "edit", label: "수정" }] },
              {
                id: "danger",
                accessibilityLabel: "위험 작업",
                items: [{ id: "delete", label: "삭제", tone: "danger" }],
              },
            ]}
          />
        </HjmProvider>
      </div>,
    );
    await flush();

    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    let triggerRect = rect(window.innerWidth - 80, window.innerHeight - 48, 48, 24);
    Object.defineProperty(trigger, "getBoundingClientRect", {
      configurable: true,
      value: () => triggerRect,
    });
    Object.defineProperty(menu, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0, 0, 180, 200),
    });
    Object.defineProperty(menu, "scrollHeight", { configurable: true, value: 200 });
    Object.defineProperty(menu, "scrollWidth", { configurable: true, value: 180 });
    await act(async () => window.dispatchEvent(new Event("resize")));
    await flush();

    const portal = menu.closest<HTMLElement>(".hjm-portal")!;
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(portal.parentElement).toBe(document.body);
    expect(portal.getAttribute("dir")).toBe("rtl");
    expect(portal.getAttribute("data-theme")).toBe("dark");
    expect(portal.getAttribute("data-text-scale")).toBe("1.5");
    expect(portal.style.display).toBe("");
    expect(portal.style.fontFamily).toBe("inherit");
    expect(portal.style.fontSize).toBe("inherit");
    expect(portal.style.lineHeight).toBe("inherit");
    expect(portal.style.overflow).toBe("");
    expect(portal.style.transform).toBe("");
    expect(portal.style.getPropertyValue("--hjm-text-scale")).toBe("1.5");
    expect(menu.dataset.placement).toBe("top");
    expect(menu.dataset.align).toBe("start");
    expect(menu.style.left).toBe(`${Math.round(triggerRect.right - 180)}px`);
    expect(menu.querySelectorAll('[role="group"]')).toHaveLength(2);
    expect(menu.querySelectorAll('[role="separator"]')).toHaveLength(1);

    const previousTop = menu.style.top;
    triggerRect = rect(window.innerWidth - 80, 120, 48, 24);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
      window.visualViewport?.dispatchEvent(new Event("resize"));
    });
    await flush();
    expect(menu.dataset.placement).toBe("bottom");
    expect(menu.style.top).not.toBe(previousTop);

    await act(async () => menu.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await flush();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    await act(async () => container.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await flush();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it("portals Select without losing field styling or inside/outside detection", async () => {
    await render(
      <div style={{ overflow: "hidden", inlineSize: 100 }}>
        <HjmProvider systemTheme="light">
          <Select
            defaultOpen
            align="end"
            fieldClassName="product-field"
            label="구단"
            placeholder="구단 선택"
            emptySelectionLabel="선택 안 함"
            items={[{ id: "lg", label: "LG", textValue: "LG" }]}
          />
        </HjmProvider>
      </div>,
    );
    await flush();
    const field = container.querySelector<HTMLElement>(".hjm-select")!;
    const trigger = field.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    const listbox = document.body.querySelector<HTMLElement>('[role="listbox"]')!;
    const option = listbox.querySelector<HTMLElement>('[role="option"]')!;
    expect(field.classList.contains("product-field")).toBe(true);
    expect(field.contains(listbox)).toBe(false);
    expect(listbox.closest(".hjm-portal")?.parentElement).toBe(document.body);
    expect(listbox.dataset.density).toBe("comfortable");
    expect(getComputedStyle(option).minBlockSize).toBe("56px");

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    Object.defineProperty(trigger, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(-120, 80, viewportWidth * 2, 44),
    });
    Object.defineProperty(listbox, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0, 0, viewportWidth * 2, 120),
    });
    Object.defineProperty(listbox, "scrollWidth", {
      configurable: true,
      value: viewportWidth * 2,
    });
    await act(async () => window.dispatchEvent(new Event("resize")));
    await flush();
    expect(Number.parseFloat(listbox.style.minWidth))
      .toBeLessThanOrEqual(viewportWidth - 32);
    expect(Number.parseFloat(listbox.style.minWidth))
      .toBeLessThanOrEqual(Number.parseFloat(listbox.style.maxWidth));

    await act(async () => listbox.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await flush();
    expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();
    await act(async () => container.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await flush();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
  });

  it("portals Combobox and preserves option selection and input focus", async () => {
    const onValueChange = vi.fn();
    await render(
      <div style={{ overflow: "hidden", blockSize: 40 }}>
        <HjmProvider systemTheme="light">
          <Combobox
            defaultOpen
            label="선수"
            items={[{ value: "one", label: "홍길동" }]}
            emptyMessage="결과 없음"
            loadingMessage="검색 중"
            selectionRequiredMessage="선수를 선택하세요"
            onValueChange={onValueChange}
          />
        </HjmProvider>
      </div>,
    );
    await flush();
    const input = container.querySelector<HTMLInputElement>('[role="combobox"]')!;
    const listbox = document.body.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(listbox.closest(".hjm-portal")?.parentElement).toBe(document.body);
    expect(listbox.dataset.density).toBe("comfortable");
    expect(getComputedStyle(listbox.querySelector<HTMLElement>('[role="option"]')!).minBlockSize)
      .toBe("56px");
    Object.defineProperty(input, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(24, window.innerHeight - 44, 160, 24),
    });
    Object.defineProperty(listbox, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0, 0, 200, 180),
    });
    Object.defineProperty(listbox, "scrollHeight", { configurable: true, value: 180 });
    Object.defineProperty(listbox, "scrollWidth", { configurable: true, value: 200 });
    await act(async () => window.dispatchEvent(new Event("resize")));
    await flush();
    expect(listbox.dataset.placement).toBe("top");

    await act(async () => listbox.querySelector<HTMLElement>('[role="option"]')!.click());
    await flush();
    expect(onValueChange).toHaveBeenCalledWith("one");
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it("treats a modal-owned Menu portal as part of the active focus and isolation scope", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Dialog open onOpenChange={() => undefined} closeLabel="닫기" title="설정">
          <Menu
            defaultOpen
            trigger={<button type="button">작업</button>}
            label="설정 작업"
            items={[{ id: "edit", label: "수정" }, { id: "delete", label: "삭제" }]}
          />
        </Dialog>
      </HjmProvider>,
    );
    await flush();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    const overlay = dialog.parentElement!;
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    const popupHost = menu.closest<HTMLElement>(".hjm-portal")!;
    const firstItem = menu.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
    expect(popupHost.getAttribute("data-hjm-popup-owner")).toBe(dialog.id);
    expect(popupHost.inert).toBe(false);
    expect(popupHost.hasAttribute("aria-hidden")).toBe(false);
    expect(document.head.inert).toBe(false);
    expect(document.head.hasAttribute("aria-hidden")).toBe(false);
    expect(getComputedStyle(popupHost).visibility).not.toBe("hidden");
    expect(Number(menu.style.zIndex)).toBeGreaterThan(Number(overlay.style.zIndex));
    firstItem.focus();
    await flush();
    expect(document.activeElement).toBe(firstItem);

    await act(async () => menu.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await flush();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    await act(async () => {
      dialog.querySelector<HTMLElement>(".hjm-dialog__title")!
        .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    });
    await flush();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
  });

  it("applies the same popup ownership scope inside Sheet", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Sheet open onOpenChange={() => undefined} closeLabel="닫기" title="필터">
          <Menu
            defaultOpen
            trigger={<button type="button">정렬</button>}
            label="정렬"
            items={[{ id: "recent", label: "최신순" }]}
          />
        </Sheet>
      </HjmProvider>,
    );
    await flush();
    const sheet = document.body.querySelector<HTMLElement>(
      '[data-kind="sheet"] [role="dialog"]',
    )!;
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    const host = menu.closest<HTMLElement>(".hjm-portal")!;
    expect(host.getAttribute("data-hjm-popup-owner")).toBe(sheet.id);
    expect(host.inert).toBe(false);
    expect(host.hasAttribute("aria-hidden")).toBe(false);
    expect(Number(menu.style.zIndex)).toBe(Number(sheet.parentElement!.style.zIndex) + 1);
    const item = menu.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
    item.focus();
    await flush();
    expect(document.activeElement).toBe(item);
  });

  it("keeps modal-owned Select, Combobox, and Tooltip portals visible and interactive", async () => {
    const onSelect = vi.fn();
    const onCombobox = vi.fn();
    await render(
      <HjmProvider systemTheme="dark" direction="rtl" textScale={1.5}>
        <Dialog open onOpenChange={() => undefined} modalPriority={4} closeLabel="닫기" title="편집">
          <Select
            defaultOpen
            label="구단"
            placeholder="구단 선택"
            emptySelectionLabel="선택 안 함"
            items={[{ id: "lg", label: "LG", textValue: "LG" }]}
            onSelectionChange={onSelect}
          />
          <Combobox
            defaultOpen
            label="선수"
            items={[{ value: "one", label: "홍길동" }]}
            emptyMessage="결과 없음"
            loadingMessage="검색 중"
            selectionRequiredMessage="선수를 선택하세요"
            onValueChange={onCombobox}
          />
          <Tooltip
            defaultOpen
            trigger={<button type="button">도움말</button>}
            content="상세 설명"
          />
        </Dialog>
      </HjmProvider>,
    );
    await flush();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    const overlayLayer = Number(dialog.parentElement!.style.zIndex);
    const popupHosts = [...document.body.querySelectorAll<HTMLElement>(
      `.hjm-portal[data-hjm-popup-owner="${dialog.id}"]`,
    )];
    expect(popupHosts).toHaveLength(3);
    for (const host of popupHosts) {
      expect(host.inert).toBe(false);
      expect(host.hasAttribute("aria-hidden")).toBe(false);
      expect(host.getAttribute("dir")).toBe("rtl");
      expect(host.getAttribute("data-theme")).toBe("dark");
    }
    const selectListbox = document.body.querySelector<HTMLElement>(".hjm-select__listbox")!;
    const comboboxListbox = document.body.querySelector<HTMLElement>(".hjm-combobox__listbox")!;
    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]')!;
    for (const popup of [selectListbox, comboboxListbox, tooltip]) {
      expect(Number(popup.style.zIndex)).toBe(overlayLayer + 1);
      expect(popup.style.visibility).toBe("visible");
    }

    await act(async () => selectListbox.querySelector<HTMLElement>('[role="option"]')!.click());
    await flush();
    expect(onSelect).toHaveBeenCalledWith("lg");
    const selectTrigger = dialog.querySelector<HTMLButtonElement>(".hjm-select__trigger")!;
    expect(document.activeElement).toBe(selectTrigger);
    expect(dialog.contains(document.activeElement)).toBe(true);

    await act(async () => comboboxListbox.querySelector<HTMLElement>('[role="option"]')!.click());
    await flush();
    expect(onCombobox).toHaveBeenCalledWith("one");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.body.querySelector('[role="dialog"]')).toBe(dialog);
  });

  it("portals Tooltip, flips a horizontal placement, and keeps pointer transit open", async () => {
    await render(
      <div style={{ overflow: "hidden", inlineSize: 80 }}>
        <HjmProvider systemTheme="dark" direction="ltr">
          <Tooltip
            defaultOpen
            placement="end"
            align="center"
            trigger={<button type="button">도움말</button>}
            content="상세 설명"
          />
        </HjmProvider>
      </div>,
    );
    await flush();
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]')!;
    Object.defineProperty(trigger, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(window.innerWidth - 52, 120, 36, 24),
    });
    Object.defineProperty(tooltip, "getBoundingClientRect", {
      configurable: true,
      value: () => rect(0, 0, 160, 48),
    });
    Object.defineProperty(tooltip, "scrollHeight", { configurable: true, value: 48 });
    Object.defineProperty(tooltip, "scrollWidth", { configurable: true, value: 160 });
    await act(async () => window.dispatchEvent(new Event("resize")));
    await flush();
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    expect(tooltip.dataset.placement).toBe("start");
    expect(tooltip.closest(".hjm-portal")?.getAttribute("data-theme")).toBe("dark");

    await act(async () => {
      trigger.dispatchEvent(new PointerEvent("pointerout", {
        bubbles: true,
        pointerType: "mouse",
      }));
      tooltip.dispatchEvent(new PointerEvent("pointerover", {
        bubbles: true,
        pointerType: "mouse",
      }));
    });
    await flush(100);
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});

describe("modal arbitration and teardown", () => {
  it("keeps a late lower-priority modal inert until the blocking modal closes", async () => {
    function Fixture() {
      const [blockingOpen, setBlockingOpen] = useState(true);
      const [normalOpen, setNormalOpen] = useState(false);
      return (
        <HjmProvider systemTheme="light">
          <Dialog
            open={blockingOpen}
            onOpenChange={setBlockingOpen}
            modalPriority={100}
            closeLabel="차단 닫기"
            title="차단 모달"
          >
            <button type="button" onClick={() => setNormalOpen(true)}>일반 모달 열기</button>
          </Dialog>
          <Dialog
            open={normalOpen}
            onOpenChange={setNormalOpen}
            modalPriority={0}
            closeLabel="일반 닫기"
            title="일반 모달"
          >
            <button type="button">일반 동작</button>
            <Menu
              defaultOpen
              trigger={<button type="button">일반 메뉴</button>}
              label="일반 메뉴"
              items={[{ id: "one", label: "첫 동작" }]}
            />
          </Dialog>
        </HjmProvider>
      );
    }
    await render(<Fixture />);
    await flush();
    const blocking = [...document.body.querySelectorAll<HTMLElement>('[role="dialog"]')]
      .find((dialog) => dialog.querySelector(".hjm-dialog__title")?.textContent === "차단 모달")!;
    const openNormal = [...blocking.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "일반 모달 열기")!;
    await act(async () => openNormal.click());
    await flush();
    const normal = [...document.body.querySelectorAll<HTMLElement>('[role="dialog"]')]
      .find((dialog) => dialog.querySelector(".hjm-dialog__title")?.textContent === "일반 모달")!;
    expect(blocking.closest<HTMLElement>(".hjm-portal")!.inert).toBe(false);
    expect(normal.closest<HTMLElement>(".hjm-portal")!.inert).toBe(true);
    const normalPopup = document.body.querySelector<HTMLElement>(
      `.hjm-portal[data-hjm-popup-owner="${normal.id}"]`,
    )!;
    expect(normalPopup.inert).toBe(true);
    expect(normalPopup.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(normalPopup).visibility).toBe("hidden");
    expect(Number(blocking.parentElement?.style.zIndex))
      .toBeGreaterThan(Number(normal.parentElement?.style.zIndex));
    expect(blocking.contains(document.activeElement)).toBe(true);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();
    expect(document.body.textContent).not.toContain("차단 모달");
    expect(normal.closest<HTMLElement>(".hjm-portal")!.inert).toBe(false);
    expect(normalPopup.inert).toBe(false);
    expect(normalPopup.hasAttribute("aria-hidden")).toBe(false);
    expect(getComputedStyle(normalPopup).visibility).not.toBe("hidden");
    expect(normal.contains(document.activeElement)).toBe(true);
  });

  it("fires Sheet onDismissComplete once after uncontrolled and controlled teardown", async () => {
    const uncontrolled = vi.fn(() => {
      expect(document.body.querySelector('[data-kind="sheet"]')).toBeNull();
    });
    await render(
      <StrictMode>
        <HjmProvider systemTheme="light">
          <Sheet
            defaultOpen
            trigger={<button type="button">필터 열기</button>}
            closeLabel="닫기"
            title="필터"
            onDismissComplete={uncontrolled}
          >
            <div>긴 목록</div>
          </Sheet>
        </HjmProvider>
      </StrictMode>,
    );
    await flush();
    const sheet = document.body.querySelector<HTMLElement>('[data-kind="sheet"] [role="dialog"]')!;
    const body = sheet.querySelector<HTMLElement>(".hjm-sheet__body")!;
    expect(getComputedStyle(sheet).display).toBe("flex");
    expect(getComputedStyle(body).minHeight).toBe("0px");
    await act(async () => sheet.querySelector<HTMLButtonElement>('[aria-label="닫기"]')!.click());
    await flush();
    expect(uncontrolled).toHaveBeenCalledTimes(1);
    expect(uncontrolled).toHaveBeenCalledWith({ reason: "close-action" });

    const controlled = vi.fn(() => {
      expect(document.body.querySelector('[data-kind="sheet"]')).toBeNull();
    });
    function ControlledFixture() {
      const [open, setOpen] = useState(true);
      return (
        <HjmProvider systemTheme="light">
          {open ? (
            <Sheet
              open
              onOpenChange={setOpen}
              closeLabel="제어 닫기"
              title="제어 필터"
              onDismissComplete={controlled}
            />
          ) : null}
        </HjmProvider>
      );
    }
    await render(<ControlledFixture />);
    await flush();
    await act(async () => {
      document.body.querySelector<HTMLButtonElement>('[aria-label="제어 닫기"]')!.click();
    });
    await flush();
    expect(controlled).toHaveBeenCalledTimes(1);
    expect(controlled).toHaveBeenCalledWith({ reason: "close-action" });
  });

  it("applies the shared Dialog size scale to AlertDialog", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <AlertDialog
          defaultOpen
          trigger={<button type="button">알림 열기</button>}
          size="large"
          request={{
            mode: "alert",
            title: "완료",
            description: "저장했습니다.",
            confirmLabel: "확인",
          }}
        />
      </HjmProvider>,
    );
    await flush();
    expect(document.body.querySelector<HTMLElement>('[role="alertdialog"]')?.dataset.size)
      .toBe("large");
  });
});
