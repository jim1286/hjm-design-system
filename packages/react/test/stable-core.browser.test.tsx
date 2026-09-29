import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProviderButton, Checkbox, CheckboxGroup, Chip, Combobox, DatePicker, Field, FloatingActionButton, HjmProvider, Layout, Link, NumberField, OtpField, PasswordField, RadioGroup, SearchField, Select, SegmentedControl, Slider, Switch, TagsInput, ToggleGroup, Toast } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

let container: HTMLDivElement;
let root: Root;

/** Literal case ids are consumed by the renderer evidence gate. */
export const stableCoreKeyboardCases = [
  { componentId: "field" },
  { componentId: "link" },
  { componentId: "auth-provider-button" },
  { componentId: "password-field" },
  { componentId: "checkbox-group" },
  { componentId: "radio-group" },
  { componentId: "chip" },
  { componentId: "segmented-control" },
  { componentId: "toast" },
  { componentId: "search-field" },
  { componentId: "number-field" },
  { componentId: "floating-action-button" },
  { componentId: "checkbox" },
  { componentId: "switch" },
  { componentId: "toggle-group" },
  { componentId: "slider" },
  { componentId: "otp-field" },
  { componentId: "tags-input" },
  { componentId: "select" },
  { componentId: "combobox" },
  { componentId: "layout" },
  { componentId: "date-picker" },
] as const;

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

describe("stable core keyboard evidence", () => {
  it("opens DatePicker and selects a date with keyboard navigation", async () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const grid = {
      cells: [...Array.from({ length: 3 }, () => ({})), ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })), ...Array.from({ length: 4 }, () => ({}))],
      weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      todayDate: "2027-02-19",
    } as const;
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <DatePicker clearLabel="Clear date" closeLabel="Close calendar" composeAccessibleName={({ date }) => date}
          descriptor={{ grid, displayValue: null, placeholder: "Choose a date", label: "Date", selectedDate: null, onSelectionChange, onOpenChange }}
          monthLabel="February 2027" />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const trigger = container.querySelector<HTMLButtonElement>(".hjm-date-picker__trigger")!;
    expect(document.activeElement).toBe(trigger);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "trigger");
    const initial = container.querySelector<HTMLButtonElement>('[data-date="2027-02-19"]')!;
    expect(document.activeElement).toBe(initial);
    await act(async () => userEvent.keyboard("{ArrowRight}"));
    expect(document.activeElement).toBe(container.querySelector('[data-date="2027-02-20"]'));
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onSelectionChange).toHaveBeenLastCalledWith("2027-02-20", "activate");
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "selection");
    expect(document.activeElement).toBe(trigger);
  });

  it("exposes the Layout bypass link first and moves focus to main on Enter", async () => {
    window.history.replaceState(null, "", "/");
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Layout mainId="main-content" skipLinkLabel="본문으로 건너뛰기" header={<button type="button">메뉴</button>}>
          본문
        </Layout>
      </HjmProvider>,
    ));
    const skipLink = container.querySelector<HTMLAnchorElement>(".hjm-layout__skip-link")!;
    const main = container.querySelector<HTMLElement>("main")!;
    await act(async () => userEvent.tab());
    expect(document.activeElement).toBe(skipLink);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(document.activeElement).toBe(main);
    expect(window.location.hash).toBe("#main-content");
  });

  it("filters and commits a Combobox option with keyboard input", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Combobox emptyMessage="결과 없음" items={[{ value: "seoul", label: "서울" }]} label="도시" loadingMessage="검색 중" onValueChange={onValueChange} selectionRequiredMessage="도시를 선택하세요" />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>('.hjm-combobox [role="combobox"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.type(input, "서"));
    await act(async () => userEvent.keyboard("{ArrowDown}"));
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onValueChange).toHaveBeenLastCalledWith("seoul");
    expect(input.value).toBe("서울");
  });

  it("moves and commits a Select option with arrow and Enter keys", async () => {
    const onSelectionChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Select defaultOpen defaultSelectedKey="one" emptySelectionLabel="선택 안 함" label="언어" onSelectionChange={onSelectionChange} placeholder="선택" items={[{ id: "one", label: "한국어", textValue: "한국어" }, { id: "two", label: "영어", textValue: "영어" }]} />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const trigger = container.querySelector<HTMLButtonElement>('.hjm-select [role="combobox"]')!;
    expect(document.activeElement).toBe(trigger);
    await act(async () => userEvent.keyboard("{ArrowDown}"));
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onSelectionChange).toHaveBeenLastCalledWith("two");
  });

  it("commits TagsInput values with Enter", async () => {
    const onTagsChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <TagsInput composeRemoveLabel={(tag) => `${tag} 지우기`} label="태그" onTagsChange={onTagsChange} />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>(".hjm-tags-input__input")!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.type(input, "저녁{Enter}"));
    expect(onTagsChange).toHaveBeenLastCalledWith(["저녁"]);
    expect(container.querySelector(".hjm-tags-input__tag")?.textContent).toContain("저녁");
    expect(input.value).toBe("");
  });

  it("enters and sanitizes OtpField through its single text input", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><OtpField label="인증번호" length={6} onValueChange={onValueChange} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>(".hjm-otp-field__input")!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.type(input, "12-3a4567"));
    expect(input.value).toBe("123456");
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
  });

  it("increments Slider with ArrowRight", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><Slider label="점수" min={0} max={10} defaultValue={0} onValueChange={onValueChange} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.keyboard("{ArrowRight}"));
    expect(input.value).toBe("1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it("toggles ToggleGroup from Space", async () => {
    const onPressedIdsChange = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><ToggleGroup descriptor={{ accessibilityLabel: "편집", items: [{ id: "bold", label: "굵게" }] }} onPressedIdsChange={onPressedIdsChange} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const button = container.querySelector<HTMLButtonElement>(".hjm-toggle-group__item")!;
    expect(document.activeElement).toBe(button);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect([...onPressedIdsChange.mock.calls.at(-1)![0]]).toEqual(["bold"]);
  });

  it("toggles Switch from Space", async () => {
    const onCheckedChange = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><Switch label="알림" onCheckedChange={onCheckedChange} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const control = container.querySelector<HTMLButtonElement>('[role="switch"]')!;
    expect(document.activeElement).toBe(control);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("toggles Checkbox from Space", async () => {
    const onCheckedChange = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><Checkbox label="동의" onCheckedChange={onCheckedChange} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(input.checked).toBe(true);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("activates FloatingActionButton from the keyboard", async () => {
    const onClick = vi.fn();
    await act(async () => root.render(<HjmProvider systemTheme="light"><FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }} renderIcon={() => <span>＋</span>} onClick={onClick} onContentClearanceChange={() => {}} /></HjmProvider>));
    await act(async () => userEvent.tab());
    const button = container.querySelector<HTMLButtonElement>(".hjm-fab")!;
    expect(document.activeElement).toBe(button);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("increments NumberField from the keyboard", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <NumberField decrementLabel="감소" incrementLabel="증가" label="수량" max={10} min={0} defaultValue={0} onValueChange={onValueChange} />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>('[role="spinbutton"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(input.value).toBe("1");
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it("types and clears SearchField using keyboard actions", async () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <SearchField clearLabel="검색어 지우기" label="검색" onClear={onClear} onValueChange={onValueChange} />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const input = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () => userEvent.type(input, "hjm"));
    expect(onValueChange).toHaveBeenLastCalledWith("hjm");
    await act(async () => userEvent.tab());
    const clear = container.querySelector<HTMLButtonElement>(".hjm-search-field__clear")!;
    expect(document.activeElement).toBe(clear);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("activates Toast close and Escape actions from the keyboard", async () => {
    const onDismissRequest = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Toast
          descriptor={{ id: "keyboard-toast", description: "완료되었습니다", closeLabel: "알림 닫기", durationMs: null }}
          onDismissRequest={onDismissRequest}
        />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const close = container.querySelector<HTMLButtonElement>(".hjm-toast__close")!;
    expect(document.activeElement).toBe(close);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onDismissRequest).toHaveBeenLastCalledWith("close-action");
    await act(async () => userEvent.keyboard("{Escape}"));
    expect(onDismissRequest).toHaveBeenLastCalledWith("escape");
  });

  it("moves SegmentedControl selection with arrow keys", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <SegmentedControl
          items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
          label="보기"
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(document.activeElement).toBe(radios[0]);
    await act(async () => userEvent.keyboard("{ArrowRight}"));
    expect(document.activeElement).toBe(radios[1]);
    expect(radios[1]!.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("grid");
  });

  it("toggles a selectable Chip with Space", async () => {
    const onSelectedChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Chip label="즐겨찾기" onSelectedChange={onSelectedChange} selected={false} selectionMode="multiple" />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const chip = container.querySelector<HTMLButtonElement>('button[role="checkbox"]')!;
    expect(document.activeElement).toBe(chip);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(onSelectedChange).toHaveBeenCalledOnce();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it("selects RadioGroup options with Space", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <RadioGroup
          items={[{ value: "standard", label: "일반 배송" }, { value: "express", label: "빠른 배송" }]}
          label="배송 방법"
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const radio = container.querySelector<HTMLInputElement>('input[type="radio"]')!;
    expect(document.activeElement).toBe(radio);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(radio.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("standard");
  });

  it("toggles CheckboxGroup choices with Space", async () => {
    const onValueChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <CheckboxGroup
          items={[{ id: "email", label: "이메일 소식" }, { id: "news", label: "새 소식" }]}
          label="알림"
          onValueChange={onValueChange}
        />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(document.activeElement).toBe(checkbox);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(checkbox.checked).toBe(true);
    expect([...onValueChange.mock.calls[0]![0] as ReadonlySet<string>]).toEqual(["email"]);
  });

  it("reveals PasswordField from its keyboard-accessible toggle", async () => {
    const onRevealedChange = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <PasswordField
          autofillHint="current"
          concealLabel="비밀번호 숨기기"
          label="비밀번호"
          onRevealedChange={onRevealedChange}
          revealLabel="비밀번호 보기"
        />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    await act(async () => userEvent.tab());
    const toggle = container.querySelector<HTMLButtonElement>(".hjm-password-field__toggle")!;
    const input = container.querySelector<HTMLInputElement>(".hjm-password-field__input")!;
    expect(document.activeElement).toBe(toggle);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(input.type).toBe("text");
    expect(onRevealedChange).toHaveBeenLastCalledWith(true);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(input.type).toBe("password");
    expect(onRevealedChange).toHaveBeenLastCalledWith(false);
  });

  it("activates AuthProviderButton with Enter and Space", async () => {
    const onActivate = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<span>G</span>} onClick={onActivate} />
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    const button = container.querySelector<HTMLButtonElement>('button[data-provider="google"]')!;
    expect(document.activeElement).toBe(button);
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onActivate).toHaveBeenCalledTimes(1);
    await act(async () => userEvent.keyboard("{Space}"));
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("activates Link with Enter through the native anchor contract", async () => {
    const onNavigate = vi.fn();
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Link href="/records" onClick={(event) => { event.preventDefault(); onNavigate(); }}>내 기록</Link>
      </HjmProvider>,
    ));
    await act(async () => userEvent.tab());
    expect(document.activeElement).toBe(container.querySelector("a"));
    await act(async () => userEvent.keyboard("{Enter}"));
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("connects Field label activation, Tab focus, and invalid relationships", async () => {
    expect(
      executedScenarioRegistry.executions.some(({ scenarios }) =>
        scenarios.some(({ id }) => id === "keyboard"),
      ),
    ).toBe(true);
    await act(async () => root.render(
      <HjmProvider systemTheme="light">
        <Field
          controlId="stable-email"
          error="이메일을 확인하세요"
          label="이메일"
          required
        >
          {(controlProps) => <input {...controlProps} />}
        </Field>
      </HjmProvider>,
    ));

    const input = container.querySelector<HTMLInputElement>("#stable-email")!;
    const label = container.querySelector<HTMLLabelElement>('label[for="stable-email"]')!;
    expect(input.tabIndex).toBe(0);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("stable-email-error");

    label.click();
    expect(document.activeElement).toBe(input);
  });
});
