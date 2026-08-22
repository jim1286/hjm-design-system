import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AlertDialog,
  Combobox,
  Dialog,
  Form,
  HjmProvider,
  Menu,
  Pagination,
  Select,
  Sheet,
  Table,
  Tooltip,
} from "../src/index.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
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
});

describe("modal overlay behavior", () => {
  it("supports triggerless controlled dialogs and isolates nested or late background DOM", async () => {
    const preserved = document.createElement("div");
    preserved.setAttribute("aria-hidden", "false");
    preserved.inert = true;
    document.body.append(preserved);

    function Fixture() {
      const [outerOpen, setOuterOpen] = useState(true);
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <HjmProvider systemTheme="light">
          <Dialog
            closeLabel="바깥 닫기"
            open={outerOpen}
            onOpenChange={setOuterOpen}
            title="바깥 모달"
          >
            <button type="button" onClick={() => setInnerOpen(true)}>안쪽 열기</button>
          </Dialog>
          <Dialog
            closeLabel="안쪽 닫기"
            open={innerOpen}
            onOpenChange={setInnerOpen}
            title="안쪽 모달"
          />
        </HjmProvider>
      );
    }

    await render(<Fixture />);
    await flush();
    expect(container.inert).toBe(true);
    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(preserved.inert).toBe(true);
    expect(preserved.getAttribute("aria-hidden")).toBe("true");

    const latePortal = document.createElement("div");
    document.body.append(latePortal);
    await flush();
    expect(latePortal.inert).toBe(true);
    expect(latePortal.getAttribute("aria-hidden")).toBe("true");

    const outer = document.body.querySelector<HTMLElement>('[aria-labelledby$="-title"]')!;
    const outerPortal = outer.closest<HTMLElement>(".hjm-portal")!;
    const openInner = [...outer.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "안쪽 열기")!;
    await act(async () => openInner.click());
    await flush();
    expect(document.body.querySelectorAll('[role="dialog"]')).toHaveLength(2);
    expect(outerPortal.inert).toBe(true);
    expect(outerPortal.getAttribute("aria-hidden")).toBe("true");

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();
    expect(document.body.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(outerPortal.inert).toBe(false);
    expect(outerPortal.hasAttribute("aria-hidden")).toBe(false);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(container.inert).toBe(false);
    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(preserved.inert).toBe(true);
    expect(preserved.getAttribute("aria-hidden")).toBe("false");
    expect(latePortal.inert).toBe(false);
    expect(latePortal.hasAttribute("aria-hidden")).toBe(false);

    latePortal.remove();
    preserved.remove();
  });

  it("runs triggerless controlled AlertDialog and Sheet lifecycles", async () => {
    const alertChanges = vi.fn();
    const sheetChanges = vi.fn();

    function Fixture() {
      const [active, setActive] = useState<"alert" | "sheet" | "closed">("alert");
      return (
        <HjmProvider systemTheme="light">
          <AlertDialog
            open={active === "alert"}
            onOpenChange={(open, detail) => {
              alertChanges(open, detail);
              if (!open) setActive("sheet");
            }}
            request={{
              mode: "alert",
              title: "저장 완료",
              description: "변경 사항을 저장했습니다.",
              confirmLabel: "확인",
            }}
          />
          <Sheet
            closeLabel="패널 닫기"
            open={active === "sheet"}
            onOpenChange={(open, detail) => {
              sheetChanges(open, detail);
              if (!open) setActive("closed");
            }}
            title="필터"
          >
            <button type="button">필터 적용</button>
          </Sheet>
        </HjmProvider>
      );
    }

    await render(<Fixture />);
    await flush();
    const alert = document.body.querySelector<HTMLElement>('[role="alertdialog"]')!;
    expect(alert).not.toBeNull();
    expect(container.inert).toBe(true);

    const confirm = [...alert.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "확인")!;
    await act(async () => confirm.click());
    await flush();

    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
    expect(document.body.querySelector('[data-kind="sheet"] [role="dialog"]')).not.toBeNull();
    expect(alertChanges).toHaveBeenLastCalledWith(false, { reason: "confirm" });
    expect(container.inert).toBe(true);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();

    expect(document.body.querySelector('[data-kind="sheet"]')).toBeNull();
    expect(sheetChanges).toHaveBeenLastCalledWith(false, { reason: "escape" });
    expect(container.inert).toBe(false);
    expect(container.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("enters, traps, and restores focus while Escape closes Dialog", async () => {
    function Fixture() {
      const initialRef = useRef<HTMLButtonElement>(null);
      return (
        <HjmProvider systemTheme="dark" direction="rtl" textScale={2}>
          <Dialog
            closeLabel="닫기"
            trigger={<button type="button">설정 열기</button>}
            title="설정"
            initialFocusRef={initialRef}
          >
            <button ref={initialRef} type="button">첫 동작</button>
            <button type="button">마지막 동작</button>
          </Dialog>
        </HjmProvider>
      );
    }
    await render(<Fixture />);
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    trigger.focus();
    await act(async () => trigger.click());
    await flush();

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    const initial = [...dialog.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "첫 동작")!;
    const last = [...dialog.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "마지막 동작")!;
    const close = dialog.querySelector<HTMLButtonElement>('[aria-label="닫기"]')!;
    expect(document.activeElement).toBe(initial);
    expect(document.body.querySelector(".hjm-portal")?.getAttribute("dir")).toBe("rtl");
    expect(document.body.querySelector(".hjm-portal")?.getAttribute("data-theme")).toBe("dark");
    expect(document.body.style.overflow).toBe("hidden");

    last.focus();
    await act(async () => {
      last.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    });
    expect(document.activeElement).toBe(close);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("focuses the least-destructive AlertDialog action and surfaces async failure", async () => {
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <AlertDialog
          trigger={<button type="button">삭제</button>}
          onOpenChange={onOpenChange}
          request={{
            mode: "confirm",
            tone: "danger",
            title: "기록 삭제",
            description: "되돌릴 수 없습니다.",
            confirmLabel: "삭제",
            cancelLabel: "취소",
            onConfirm: async () => { throw new Error("offline"); },
            fallbackErrorMessage: "삭제하지 못했습니다.",
          }}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    await flush();
    const alert = document.body.querySelector<HTMLElement>('[role="alertdialog"]')!;
    const [cancel, confirm] = [...alert.querySelectorAll<HTMLButtonElement>("button")];
    expect(document.activeElement).toBe(cancel);
    await act(async () => confirm!.click());
    await flush();
    expect(alert.dataset.state).toBe("error");
    expect(alert.querySelector('[role="alert"]')?.textContent).toBe("삭제하지 못했습니다.");
    expect(document.body.querySelector('[role="alertdialog"]')).not.toBeNull();

    await act(async () => cancel!.click());
    await flush();
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "cancel-action" });
  });

  it("applies Sheet outside-dismiss policy and still handles Escape", async () => {
    const onOpenChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Sheet
          closeLabel="닫기"
          defaultOpen
          trigger={<button type="button">필터</button>}
          title="필터"
          dismissPolicy={{ outsideDismiss: false }}
          onOpenChange={onOpenChange}
        >
          <button type="button">적용</button>
        </Sheet>
      </HjmProvider>,
    );
    await flush();
    const overlay = document.body.querySelector<HTMLElement>('[data-kind="sheet"]')!;
    await act(async () => {
      overlay.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(document.body.querySelector('[data-kind="sheet"]')).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    await flush();
    expect(document.body.querySelector('[data-kind="sheet"]')).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "escape" });
  });
});

describe("non-modal popup behavior", () => {
  it("adds Tooltip description only while focus keeps it open", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Tooltip trigger={<button type="button">도움말</button>} content="상세 설명" />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.focus());
    await flush();
    const tooltip = container.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tooltip.textContent).toBe("상세 설명");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);

    await act(async () => trigger.blur());
    await flush();
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("supports Menu roving keys, disabled skipping, selection, and focus return", async () => {
    const selectFirst = vi.fn();
    const selectLast = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Menu
          trigger={<button type="button">작업</button>}
          label="선수 작업"
          items={[
            { id: "edit", label: "수정", onSelect: selectFirst },
            { id: "archive", label: "보관", disabled: true, onSelect: vi.fn() },
            { id: "delete", label: "삭제", tone: "danger", onSelect: selectLast },
          ]}
        />
      </HjmProvider>,
    );
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    await act(async () => trigger.click());
    await flush();
    const menu = container.querySelector<HTMLElement>('[role="menu"]')!;
    const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
    expect(document.activeElement).toBe(items[0]);

    await act(async () => {
      items[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(items[2]);
    await act(async () => {
      items[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    });
    expect(document.activeElement).toBe(items[0]);
    await act(async () => items[0]!.click());
    await flush();
    expect(selectFirst).toHaveBeenCalledOnce();
    expect(selectLast).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });
});

describe("advanced form and collection interactions", () => {
  it("updates Select and selects a filtered Combobox option with the keyboard", async () => {
    const onSelect = vi.fn();
    const onCombo = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Select
          emptySelectionLabel="선택 안 함"
          label="구단"
          placeholder="구단 선택"
          defaultSelectedKey="lg"
          onSelectionChange={onSelect}
          items={[
            { id: "lg", label: "LG", textValue: "LG" },
            { id: "kt", label: "KT", textValue: "KT" },
          ]}
        />
        <Combobox
          emptyMessage="검색 결과가 없습니다"
          label="선수"
          loadingMessage="검색 중"
          required
          selectionRequiredMessage="선수를 선택하세요"
          onValueChange={onCombo}
          items={[{ value: "one", label: "홍길동" }, { value: "two", label: "김철수" }]}
        />
      </HjmProvider>,
    );
    const select = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    await act(async () => select.click());
    const selectOptions = [...container.querySelectorAll<HTMLElement>('.hjm-select [role="option"]')];
    await act(async () => selectOptions.find((option) => option.textContent?.includes("KT"))!.click());
    expect(select.textContent).toContain("KT");
    expect(onSelect).toHaveBeenLastCalledWith("kt");

    const input = container.querySelector<HTMLInputElement>('.hjm-combobox [role="combobox"]')!;
    expect(input.validationMessage).toBe("선수를 선택하세요");
    await act(async () => input.focus());
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(input.value).toBe("홍길동");
    expect(onCombo).toHaveBeenLastCalledWith("one");
    await flush();
    expect(input.validationMessage).toBe("");
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it("blocks concurrent async Form submits and settles busy state", async () => {
    let resolveSubmit!: () => void;
    const pending = new Promise<void>((resolve) => { resolveSubmit = resolve; });
    const onSubmit = vi.fn(() => pending);
    await render(
      <HjmProvider systemTheme="light">
        <Form onSubmit={onSubmit} actions={<button type="submit">저장</button>}>
          <input name="name" defaultValue="홍길동" />
        </Form>
      </HjmProvider>,
    );
    const form = container.querySelector<HTMLFormElement>("form")!;
    await act(async () => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(form.dataset.state).toBe("busy");
    expect(form.getAttribute("aria-busy")).toBe("true");

    resolveSubmit();
    await flush();
    expect(form.dataset.state).toBe("idle");
    expect(form.hasAttribute("aria-busy")).toBe(false);
  });

  it("handles Accordion roving focus and controlled expansion callbacks", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Accordion
          value={["a"]}
          onValueChange={onValueChange}
          items={[
            { id: "a", title: "A", panel: "A panel" },
            { id: "b", title: "B", panel: "B panel", disabled: true },
            { id: "c", title: "C", panel: "C panel" },
          ]}
        />
      </HjmProvider>,
    );
    const triggers = [...container.querySelectorAll<HTMLButtonElement>(".hjm-accordion__trigger")];
    triggers[0]!.focus();
    await act(async () => {
      triggers[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(document.activeElement).toBe(triggers[2]);
    await act(async () => triggers[2]!.click());
    expect(onValueChange).toHaveBeenLastCalledWith(["c"]);
    expect(triggers[2]!.getAttribute("aria-expanded")).toBe("false");
  });

  it("dispatches Pagination and sortable Table actions", async () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Pagination
          label="페이지"
          descriptor={{ currentPage: 2, totalPages: 3 }}
          labels={{ previous: "이전", next: "다음" }}
          composeAccessibleName={({ page }) => `${page}페이지`}
          onPageChange={onPageChange}
        />
        <Table
          emptyState="기록이 없습니다"
          rows={[{ id: "one", name: "홍길동" }]}
          getRowKey={(row) => row.id}
          columns={[{ id: "name", header: "이름", cell: (row) => row.name, sortable: true }]}
          onSortChange={onSortChange}
        />
      </HjmProvider>,
    );
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="다음"]')!.click());
    expect(onPageChange).toHaveBeenLastCalledWith(3, "next");
    await act(async () => container.querySelector<HTMLButtonElement>(".hjm-table__sort")!.click());
    expect(onSortChange).toHaveBeenLastCalledWith("name", "ascending");
  });
});
