import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  CheckboxGroup,
  HjmProvider,
  LoadMore,
  Menu,
  Radio,
  Select,
  Sheet,
  Tabs,
  ToastProvider,
  Tooltip,
  useToast,
} from "../src/index.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

async function flush(delay = 10) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
  });
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
  vi.unstubAllGlobals();
});

describe("Menu core behavior alignment", () => {
  it("supports typeahead and single/multiple selection roles", async () => {
    const onSingleChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Menu
          key="single"
          defaultOpen
          trigger={<button type="button">정렬</button>}
          label="정렬 방식"
          selectionMode="single"
          defaultValue="alpha"
          onValueChange={onSingleChange}
          items={[
            { id: "alpha", label: "Alpha" },
            { id: "beta", label: "Beta", disabled: true },
            { id: "gamma", label: "Gamma" },
          ]}
        />
      </HjmProvider>,
    );
    await flush();
    const radios = [...container.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
    expect(radios.map((item) => item.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    await act(async () => {
      radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "g", bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(radios[2]);
    await act(async () => radios[2]!.click());
    await flush();
    expect(onSingleChange).toHaveBeenLastCalledWith("gamma");
    expect(container.querySelector('[role="menu"]')).toBeNull();

    const onMultipleChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Menu
          key="multiple"
          defaultOpen
          trigger={<button type="button">열 표시</button>}
          label="열 표시"
          selectionMode="multiple"
          defaultValue={new Set(["name"])}
          onValueChange={onMultipleChange}
          items={[
            { id: "name", label: "이름" },
            { id: "team", label: "구단" },
          ]}
        />
      </HjmProvider>,
    );
    await flush();
    const checks = [...container.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]')];
    await act(async () => checks[1]!.click());
    expect(onMultipleChange).toHaveBeenCalledOnce();
    expect([...onMultipleChange.mock.calls[0]![0] as ReadonlySet<string>]).toEqual([
      "name",
      "team",
    ]);
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("announces async state and blocks actions while loading", async () => {
    const onAction = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Menu
          defaultOpen
          trigger={<button type="button">작업</button>}
          label="비동기 작업"
          asyncState={{ status: "loading", message: "불러오는 중" }}
          onAction={onAction}
          items={[{ id: "edit", label: "수정" }]}
        />
      </HjmProvider>,
    );
    const menu = container.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu.getAttribute("aria-busy")).toBe("true");
    expect(menu.querySelector('[role="status"]')?.textContent).toBe("불러오는 중");
    const item = menu.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
    expect(item.disabled).toBe(true);
    await act(async () => item.click());
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe("Select core behavior alignment", () => {
  const items = [
    { id: "alpha", label: "Alpha", textValue: "alpha" },
    { id: "beta", label: "Beta", textValue: "beta", disabled: true },
    { id: "gamma", label: "Gamma", textValue: "gamma" },
  ] as const;

  it("keeps highlight separate, skips disabled options, and commits before close", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="선수"
          placeholder="선수 선택"
          items={items}
          defaultSelectedKey="alpha"
          defaultOpen
          onSelectionChange={onSelectionChange}
          onOpenChange={onOpenChange}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    expect(trigger.textContent).toContain("Alpha");
    const firstActive = trigger.getAttribute("aria-activedescendant");
    expect(firstActive).toBeTruthy();
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    const activeId = trigger.getAttribute("aria-activedescendant")!;
    expect(activeId).not.toBe(firstActive);
    expect(document.getElementById(activeId)?.textContent).toContain("Gamma");
    expect(trigger.textContent).toContain("Alpha");
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith("gamma");
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "selection");
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("deduplicates a controlled deferred close and preserves transient committed copy", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="선수"
          placeholder="선수 선택"
          items={items}
          selectedKey="alpha"
          onSelectionChange={onSelectionChange}
          open
          onOpenChange={onOpenChange}
        />
      </HjmProvider>,
    );
    const options = [...container.querySelectorAll<HTMLElement>('.hjm-select [role="option"]')];
    const gamma = options.find((option) => option.textContent?.includes("Gamma"))!;
    await act(async () => {
      gamma.click();
      gamma.click();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();

    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          key="async"
          label="원격 선수"
          placeholder="선수 선택"
          items={[]}
          selectedKey="remote"
          onSelectionChange={vi.fn()}
          selectedItem={{ id: "remote", label: "원격 선수", textValue: "원격 선수" }}
          asyncState={{ status: "loading", message: "검색 중" }}
          defaultOpen
        />
      </HjmProvider>,
    );
    const asyncTrigger = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    expect(asyncTrigger.textContent).toContain("원격 선수");
    expect(asyncTrigger.hasAttribute("aria-activedescendant")).toBe(false);
    expect(container.querySelector('[role="status"]')?.textContent).toBe("검색 중");
  });

  it("reconciles an uncontrolled selection when its item is removed", async () => {
    const onSelectionChange = vi.fn();
    const renderItems = (nextItems: typeof items | readonly [typeof items[0]]) => (
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="선수"
          placeholder="선수 선택"
          items={nextItems}
          defaultSelectedKey="gamma"
          disallowEmptySelection
          onSelectionChange={onSelectionChange}
        />
      </HjmProvider>
    );
    await render(renderItems(items));
    await render(renderItems([items[0]]));
    await flush();
    expect(onSelectionChange).toHaveBeenLastCalledWith("alpha");
    expect(container.querySelector('.hjm-select__value')?.textContent).toBe("Alpha");
  });

  it("re-arms a controlled open request when the owner rejects it", async () => {
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="선수"
          placeholder="선수 선택"
          items={items}
          open={false}
          onOpenChange={onOpenChange}
          onSelectionChange={vi.fn()}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    await act(async () => trigger.click());
    await flush();
    await act(async () => trigger.click());
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true, "keyboard");
    expect(onOpenChange).toHaveBeenNthCalledWith(2, true, "keyboard");
  });

  it("includes the nullable selection in active-descendant keyboard navigation", async () => {
    const onSelectionChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="선수"
          placeholder="선수 선택"
          items={items}
          defaultSelectedKey="alpha"
          defaultOpen
          onSelectionChange={onSelectionChange}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    });
    const activeId = trigger.getAttribute("aria-activedescendant")!;
    expect(document.getElementById(activeId)?.textContent).toContain("선택 안 함");
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it("exposes Select icon appearances and keeps a busy trigger focusable but inert", async () => {
    const onSelectionChange = vi.fn();
    const renderLeading = vi.fn((_item, appearance) => (
      <span data-select-leading data-size={appearance.glyphSize} data-color={appearance.color} />
    ));
    const renderOptionLeading = vi.fn((item, appearance) => (
      <span
        data-option-leading={item.id}
        data-highlighted={String(appearance.highlighted)}
        data-selected={String(appearance.selected)}
      />
    ));
    await render(
      <HjmProvider systemTheme="light">
        <Select
          key="slots"
          accessibilityLabel="언어"
          placeholder="언어 선택"
          emptySelectionLabel="선택 안 함"
          items={items}
          defaultSelectedKey="alpha"
          defaultOpen
          locale="ko"
          renderLeading={renderLeading}
          renderOptionLeading={renderOptionLeading}
          onSelectionChange={onSelectionChange}
        />
      </HjmProvider>,
    );
    expect(container.querySelector('[data-select-leading]')?.getAttribute("data-color"))
      .toBe("currentColor");
    expect(container.querySelector('[data-option-leading="alpha"]')?.getAttribute("data-selected"))
      .toBe("true");

    await render(
      <HjmProvider systemTheme="light">
        <Select
          key="busy"
          accessibilityLabel="언어"
          placeholder="언어 선택"
          emptySelectionLabel="선택 안 함"
          items={items}
          defaultSelectedKey="alpha"
          busy
          onSelectionChange={onSelectionChange}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    trigger.focus();
    await act(async () => trigger.click());
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });
});

describe("Tabs state and mount policies", () => {
  const items = [
    { id: "a", label: "A", panel: <span>A panel</span> },
    { id: "b", label: "B", panel: <button type="button">B action</button> },
  ] as const;

  it("defaults to manual activation and active-only mounting", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Tabs label="정보" items={items} />
      </HjmProvider>,
    );
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabs[0]!.focus();
    await act(async () => {
      tabs[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
    expect(container.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
    await act(async () => {
      tabs[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    expect(panel.textContent).toContain("B action");
    await flush();
    expect(panel.hasAttribute("tabindex")).toBe(false);
  });

  it("preserves visited panels and reconciles an uncontrolled removed tab", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Tabs label="정보" items={items} mountPolicy="visited" />
      </HjmProvider>,
    );
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    await act(async () => tabs[1]!.click());
    await flush();
    const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(panels).toHaveLength(2);
    expect(panels[0]!.hidden).toBe(true);
    expect(panels[0]!.hasAttribute("inert")).toBe(true);

    await render(
      <HjmProvider systemTheme="light">
        <Tabs
          key="reconcile"
          label="정보"
          defaultValue="b"
          items={items}
        />
      </HjmProvider>,
    );
    await render(
      <HjmProvider systemTheme="light">
        <Tabs
          key="reconcile"
          label="정보"
          defaultValue="b"
          items={[items[0]]}
        />
      </HjmProvider>,
    );
    await flush();
    expect(container.querySelector('[role="tab"]')?.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toContain("A panel");
  });
});

describe("provider coordination and modal exactly-once lifecycles", () => {
  it("coordinates sibling Tooltips and preserves existing descriptions", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <span id="existing-help">기존 도움말</span>
        <Tooltip
          trigger={<button type="button" aria-describedby="existing-help">첫째</button>}
          content="첫 설명"
        />
        <Tooltip trigger={<button type="button">둘째</button>} content="둘 설명" />
      </HjmProvider>,
    );
    const [first, second] = [...container.querySelectorAll<HTMLButtonElement>("button")];
    await act(async () => first!.focus());
    await flush();
    expect(first!.getAttribute("aria-describedby")?.split(" ")).toContain("existing-help");
    expect(container.querySelectorAll('[role="tooltip"]')).toHaveLength(1);

    await act(async () => {
      second!.dispatchEvent(new PointerEvent("pointerover", {
        bubbles: true,
        pointerType: "mouse",
      }));
    });
    await flush(20);
    const visible = [...container.querySelectorAll<HTMLElement>('[role="tooltip"]')];
    expect(visible).toHaveLength(1);
    expect(visible[0]!.textContent).toBe("둘 설명");
    expect(first!.getAttribute("aria-describedby")).toBe("existing-help");

    await act(async () => {
      second!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      second!.focus();
    });
    await flush();
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("deduplicates controlled Sheet dismiss requests", async () => {
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Sheet
          closeLabel="닫기"
          open
          onOpenChange={onOpenChange}
          trigger={<button type="button">열기</button>}
          title="필터"
        />
      </HjmProvider>,
    );
    await flush();
    const overlay = document.body.querySelector<HTMLElement>('[data-kind="sheet"]')!;
    await act(async () => {
      overlay.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "outside" });
    expect(document.body.querySelector('[data-kind="sheet"]')).not.toBeNull();
  });

  it("runs an async AlertDialog confirm exactly once", async () => {
    let resolveConfirm!: () => void;
    const pending = new Promise<void>((resolve) => { resolveConfirm = resolve; });
    const onConfirm = vi.fn(() => pending);
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <AlertDialog
          open
          onOpenChange={onOpenChange}
          trigger={<button type="button">삭제</button>}
          request={{
            mode: "confirm",
            title: "삭제",
            description: "삭제하시겠습니까?",
            confirmLabel: "확인",
            cancelLabel: "취소",
            onConfirm,
            fallbackErrorMessage: "실패",
          }}
        />
      </HjmProvider>,
    );
    await flush();
    const confirm = [...document.body.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')]
      .find((button) => button.textContent?.includes("확인"))!;
    await act(async () => {
      confirm.click();
      confirm.click();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    resolveConfirm();
    await flush();
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "confirm" });
  });
});

describe("supplemental active renderers", () => {
  it("uses native Radio and CheckboxGroup control semantics", async () => {
    const onRadio = vi.fn();
    const onGroup = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Radio label="단일" name="single" onCheckedChange={onRadio} />
        <CheckboxGroup
          label="선택"
          items={[
            { id: "a", label: "A" },
            { id: "b", label: "B", disabled: true },
          ]}
          onValueChange={onGroup}
        />
      </HjmProvider>,
    );
    const radio = container.querySelector<HTMLInputElement>('input[type="radio"]')!;
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await act(async () => {
      radio.click();
      checkbox.click();
    });
    expect(onRadio).toHaveBeenCalledWith(true);
    expect([...onGroup.mock.calls[0]![0] as ReadonlySet<string>]).toEqual(["a"]);
    expect(container.querySelectorAll('input[type="checkbox"]')[1]?.hasAttribute("disabled")).toBe(true);
  });

  it("gates duplicate LoadMore requests and exposes a manual fallback", async () => {
    let resolveRequest!: () => void;
    const pending = new Promise<void>((resolve) => { resolveRequest = resolve; });
    const onLoadMore = vi.fn(() => pending);
    const onRequestOutcome = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <LoadMore
          descriptor={{
            state: { status: "ready", requestKey: "page-2" },
            labels: {
              loadMore: "더 보기",
              loading: "불러오는 중",
              retry: "다시 시도",
              complete: "모두 불러옴",
            },
          }}
          onLoadMore={onLoadMore}
          onRequestOutcome={onRequestOutcome}
        />
      </HjmProvider>,
    );
    const button = container.querySelector<HTMLButtonElement>('.hjm-load-more__trigger')!;
    await act(async () => {
      button.click();
      button.click();
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledOnce();
    expect(onRequestOutcome).toHaveBeenCalledWith("already-requesting", "manual");
    resolveRequest();
    await flush();
    expect(onRequestOutcome).toHaveBeenCalledWith("started", "manual");
  });

  it("keeps the first LoadMore request alive through StrictMode effect replay", async () => {
    const onLoadMore = vi.fn(async () => undefined);
    await render(
      <StrictMode>
        <HjmProvider systemTheme="light">
          <LoadMore
            descriptor={{
              state: { status: "ready", requestKey: "strict-page" },
              labels: {
                loadMore: "더 보기",
                loading: "불러오는 중",
                retry: "다시 시도",
                complete: "모두 불러옴",
              },
            }}
            mode="manual"
            onLoadMore={onLoadMore}
          />
        </HjmProvider>
      </StrictMode>,
    );
    await act(async () => {
      container.querySelector<HTMLButtonElement>(".hjm-load-more__trigger")?.click();
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledOnce();
    expect(onLoadMore).toHaveBeenCalledWith({
      requestKey: "strict-page",
      reason: "manual",
    });
  });

  it("retires a settled cursor and rejects queued callbacks from a disconnected observer", async () => {
    const callbacks: IntersectionObserverCallback[] = [];
    class ObserverMock {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] { return []; }
    }
    vi.stubGlobal("IntersectionObserver", ObserverMock);
    const onLoadMore = vi.fn(async () => undefined);
    const labels = {
      loadMore: "더 보기",
      loading: "불러오는 중",
      retry: "다시 시도",
      complete: "모두 불러옴",
    } as const;
    const view = (requestKey: string) => (
      <HjmProvider systemTheme="light">
        <LoadMore
          descriptor={{ state: { status: "ready", requestKey }, labels }}
          onLoadMore={onLoadMore}
        />
      </HjmProvider>
    );

    await render(view("page-a"));
    const pageAObserver = callbacks[0]!;
    const entries = [{ isIntersecting: true } as IntersectionObserverEntry];
    await act(async () => {
      pageAObserver(entries, {} as IntersectionObserver);
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      pageAObserver(entries, {} as IntersectionObserver);
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await render(view("page-b"));
    const pageBObserver = callbacks.at(-1)!;
    await act(async () => {
      pageBObserver(entries, {} as IntersectionObserver);
      pageAObserver(entries, {} as IntersectionObserver);
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledTimes(2);
    expect(onLoadMore).toHaveBeenLastCalledWith({
      requestKey: "page-b",
      reason: "viewport",
    });
  });

  it("publishes, acts, and dismisses Toasts through the provider store", async () => {
    const action = vi.fn();
    const onDismiss = vi.fn();
    function Publisher() {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => toast.publish({
            id: "saved",
            title: "저장됨",
            description: "변경 사항을 저장했습니다.",
            closeLabel: "알림 닫기",
            action: { label: "실행 취소", onAction: action },
            onDismiss,
          })}
        >
          알림
        </button>
      );
    }
    await render(
      <HjmProvider systemTheme="dark" direction="rtl" textScale={2} reducedMotion>
        <ToastProvider label="알림 목록">
          <Publisher />
        </ToastProvider>
      </HjmProvider>,
    );
    await act(async () => container.querySelector<HTMLButtonElement>("button")!.click());
    await flush();
    const portal = document.body.querySelector<HTMLElement>('[data-hjm-portal="toast"]')!;
    expect(portal.getAttribute("dir")).toBe("rtl");
    expect(portal.getAttribute("data-text-scale")).toBe("2");
    const toast = portal.querySelector<HTMLElement>('.hjm-toast')!;
    const actionButton = [...toast.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.includes("실행 취소"))!;
    await act(async () => {
      actionButton.click();
      actionButton.click();
    });
    expect(action).toHaveBeenCalledOnce();
    await flush();
    expect(onDismiss).toHaveBeenCalledWith("action");
    expect(document.body.querySelector('.hjm-toast')).toBeNull();
  });

  it("keeps an owned Toast store live through StrictMode and captures locale and viewport adapters", async () => {
    function Publisher() {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => toast.publish({
            id: "localized",
            description: "저장했습니다.",
            closeLabel: "닫기",
          })}
        >
          게시
        </button>
      );
    }
    const view = (locale: string) => (
      <StrictMode>
        <HjmProvider systemTheme="light">
          <ToastProvider
            label="알림 목록"
            locale={locale}
            bottomOffset={92}
            hotkey="F8"
            hotkeyHelp="F8 키를 눌러 알림으로 이동"
          >
            <Publisher />
          </ToastProvider>
        </HjmProvider>
      </StrictMode>
    );

    await render(view("ko"));
    const publisher = container.querySelector<HTMLButtonElement>("button")!;
    publisher.focus();
    await act(async () => publisher.click());
    await flush();
    const viewport = document.body.querySelector<HTMLElement>(".hjm-toast-viewport")!;
    const toast = viewport.querySelector<HTMLElement>(".hjm-toast")!;
    expect(toast.lang).toBe("ko");
    expect(viewport.style.getPropertyValue("--hjm-toast-bottom-offset")).toBe("92px");
    expect(viewport.getAttribute("aria-keyshortcuts")).toBe("F8");
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "F8", bubbles: true }));
    });
    expect(document.activeElement).toBe(viewport);

    await render(view("en"));
    expect(document.body.querySelector<HTMLElement>(".hjm-toast")?.lang).toBe("ko");
  });
});
