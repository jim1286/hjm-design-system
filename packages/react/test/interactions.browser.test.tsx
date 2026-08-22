import { act, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Button,
  Checkbox,
  Grid,
  HjmProvider,
  IconButton,
  SearchField,
  Switch,
  Tabs,
} from "../src/index.js";

let container: HTMLDivElement;
let root: Root;

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
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

describe("controlled and uncontrolled selection", () => {
  it("updates uncontrolled Checkbox and Switch state with callbacks", async () => {
    const onCheckbox = vi.fn();
    const onSwitch = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Checkbox label="동의" onCheckedChange={onCheckbox} />
        <Switch label="알림" onCheckedChange={onSwitch} />
      </HjmProvider>,
    );

    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const checkboxLabel = checkbox.closest("label")!;
    const switchButton = container.querySelector<HTMLButtonElement>('[role="switch"]')!;
    expect(checkboxLabel.dataset.state).toBe("unchecked");
    expect(switchButton.dataset.state).toBe("unchecked");

    await act(async () => checkbox.click());
    await act(async () => switchButton.click());

    expect(checkboxLabel.dataset.state).toBe("checked");
    expect(switchButton.dataset.state).toBe("checked");
    expect(onCheckbox).toHaveBeenLastCalledWith(true);
    expect(onSwitch).toHaveBeenLastCalledWith(true);
  });

  it("reports a controlled change without mutating the rendered value", async () => {
    const onChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <Switch label="잠금" checked={false} onCheckedChange={onChange} />
      </HjmProvider>,
    );
    const button = container.querySelector<HTMLButtonElement>('[role="switch"]')!;
    await act(async () => button.click());
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-checked")).toBe("false");
    expect(button.dataset.state).toBe("unchecked");
  });
});

describe("form and keyboard interactions", () => {
  it("keeps a pending Button focusable while blocking click and submit activation", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    await render(
      <HjmProvider systemTheme="light">
        <form onSubmit={onSubmit}>
          <Button loading type="submit" onClick={onClick}>저장</Button>
        </form>
      </HjmProvider>,
    );
    const button = container.querySelector<HTMLButtonElement>(".hjm-button")!;
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await act(async () => button.click());
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
  });

  it("applies the same pending contract to IconButton", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    await render(
      <HjmProvider systemTheme="light">
        <form onSubmit={onSubmit}>
          <IconButton label="새로고침" loading type="submit" onClick={onClick}>
            ↻
          </IconButton>
        </form>
      </HjmProvider>,
    );
    const button = container.querySelector<HTMLButtonElement>(".hjm-icon-button")!;
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await act(async () => button.click());
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
  });

  it("clears an uncontrolled SearchField, reports the value, and restores focus", async () => {
    const onValueChange = vi.fn();
    await render(
      <HjmProvider systemTheme="light">
        <SearchField
          clearLabel="검색어 지우기"
          label="검색"
          defaultValue="야구"
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    const clear = container.querySelector<HTMLButtonElement>('[aria-label="검색어 지우기"]')!;
    await act(async () => clear.click());
    expect(input.value).toBe("");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(document.activeElement).toBe(input);
  });

  it("implements roving Tabs focus, disabled skipping, and RTL arrow reversal", async () => {
    await render(
      <HjmProvider systemTheme="light" direction="rtl">
        <Tabs
          label="선수 정보"
          activationMode="automatic"
          items={[
            { id: "a", label: "A", panel: "A panel" },
            { id: "b", label: "B", panel: "B panel", disabled: true },
            { id: "c", label: "C", panel: "C panel" },
          ]}
        />
      </HjmProvider>,
    );
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabs[0]!.focus();
    await act(async () => {
      tabs[0]!.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      }));
      await Promise.resolve();
    });
    expect(tabs[2]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[2]!.tabIndex).toBe(0);
    expect(document.activeElement).toBe(tabs[2]);
    expect(container.querySelector('[role="tabpanel"]:not([hidden])')?.textContent).toBe(
      "C panel",
    );
  });
});

describe("responsive contract consumption", () => {
  it("exposes the resolved window class and collapsed columns", async () => {
    await render(
      <HjmProvider systemTheme="light">
        <Grid
          columns={{ compact: 1, expanded: 4 }}
          minColumnWidth={{ compact: 220 }}
          windowWidth={1_000}
          availableWidth={500}
        >
          <div>1</div><div>2</div><div>3</div><div>4</div>
        </Grid>
      </HjmProvider>,
    );
    const grid = container.querySelector<HTMLElement>(".hjm-grid")!;
    expect(grid.dataset.windowClass).toBe("expanded");
    expect(grid.dataset.requestedColumns).toBe("4");
    expect(grid.dataset.columns).toBe("2");
    expect(grid.dataset.state).toBe("collapsed");
  });
});
