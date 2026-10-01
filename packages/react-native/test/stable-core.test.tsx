import { act, create } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { AuthProviderButton, Checkbox, CheckboxGroup, Chip, Combobox, DatePicker, Field, FloatingActionButton, HjmNativeProvider, Link, NumberField, OtpField, PasswordField, RadioGroup, SearchField, Select, SegmentedControl, Slider, Switch, TagsInput, ToggleGroup, ToastRegion } from "../src/index.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

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
  { componentId: "date-picker" },
] as const;

describe("Native stable core input-action evidence", () => {
  it("selects a DatePicker date through its named native host action", () => {
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2027-02-0${index + 1}` })), weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], todayDate: "2027-02-05" } as const;
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><DatePicker clearLabel="Clear date" closeLabel="Close calendar" composeAccessibleName={({ date }) => date} descriptor={{ grid, displayValue: null, placeholder: "Choose a date", label: "Date", defaultOpen: true, onSelectionChange, onOpenChange }} monthLabel="February 2027" /></HjmNativeProvider>); });
    const date = renderer!.root.find((node) => node.props.accessibilityLabel === "2027-02-03");
    act(() => date.props.onPress());
    expect(onSelectionChange).toHaveBeenLastCalledWith("2027-02-03", "activate");
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "selection");
  });

  it("commits a Combobox candidate through its named host action", () => {
    vi.useFakeTimers();
    const onCommitAfterDismiss = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Combobox clearLabel="지우기" defaultOpen dismissLabel="닫기" emptyMessage="결과 없음" items={[{ id: "seoul", label: "서울", textValue: "서울" }]} label="도시" loadingMessage="검색 중" onCommitAfterDismiss={onCommitAfterDismiss} />
        </HjmNativeProvider>,
      );
    });
    const option = renderer!.root.find((node) => node.props.accessibilityLabel === "서울");
    act(() => option.props.onPress());
    expect(onCommitAfterDismiss).not.toHaveBeenCalled();
    act(() => { vi.runOnlyPendingTimers(); });
    expect(onCommitAfterDismiss).toHaveBeenLastCalledWith("seoul", "selection");
    vi.useRealTimers();
  });

  it("selects a Select option through its named host action", () => {
    const onSelectionChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Select defaultOpen dismissLabel="닫기" label="언어" onSelectionChange={onSelectionChange} items={[{ id: "ko", label: "한국어" , textValue: "한국어"}, { id: "en", label: "영어" , textValue: "영어"}]} placeholder="선택" />
        </HjmNativeProvider>,
      );
    });
    const option = renderer!.root.find((node) => node.props.accessibilityLabel === "영어");
    act(() => option.props.onPress());
    expect(onSelectionChange).toHaveBeenLastCalledWith("en");
  });

  it("commits TagsInput on return and removes a tag through its named host action", () => {
    const onTagsChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <TagsInput composeRemoveLabel={(tag) => `${tag} 지우기`} defaultTags={["저녁"]} label="태그" onTagsChange={onTagsChange} />
        </HjmNativeProvider>,
      );
    });
    const input = renderer!.root.findByType(TextInput);
    act(() => input.props.onChangeText("초안"));
    act(() => input.props.onBlur?.({}));
    expect(onTagsChange).not.toHaveBeenCalled();
    act(() => input.props.onChangeText("산책"));
    act(() => input.props.onSubmitEditing());
    expect(onTagsChange).toHaveBeenLastCalledWith(["저녁", "산책"]);
    const remove = renderer!.root.find((node) => node.props.accessibilityLabel === "저녁 지우기");
    act(() => remove.props.onPress());
    expect(onTagsChange).toHaveBeenLastCalledWith(["산책"]);
  });

  it("enters and sanitizes OtpField through its host TextInput", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><OtpField accessibilityLabel="인증번호" length={6} onValueChange={onValueChange} /></HjmNativeProvider>); });
    const input = renderer!.root.findByType(TextInput);
    act(() => input.props.onChangeText("12-3a4567"));
    expect(renderer!.root.findByType(TextInput).props.value).toBe("123456");
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
  });

  it("routes Slider increment through the adjustable host action", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><Slider decrementLabel="감소" incrementLabel="증가" label="점수" min={0} max={10} defaultValue={0} onValueChange={onValueChange} /></HjmNativeProvider>); });
    const slider = renderer!.root.find((node) => node.props.accessibilityRole === "adjustable");
    act(() => slider.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it("routes ToggleGroup activation through its host action", () => {
    const onPressedIdsChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><ToggleGroup descriptor={{ accessibilityLabel: "편집", items: [{ id: "bold", label: "굵게" }] }} onPressedIdsChange={onPressedIdsChange} /></HjmNativeProvider>); });
    const control = renderer!.root.find((node) => node.props.accessibilityRole === "button");
    act(() => control.props.onPress());
    expect([...onPressedIdsChange.mock.calls.at(-1)![0]]).toEqual(["bold"]);
  });

  it("routes Switch activation through its host control", () => {
    const onCheckedChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><Switch label="알림" onCheckedChange={onCheckedChange} /></HjmNativeProvider>); });
    const control = renderer!.root.find((node) => node.props.accessibilityRole === "switch");
    act(() => control.props.onPress());
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("routes Checkbox activation through its host control", () => {
    const onCheckedChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><Checkbox label="동의" onCheckedChange={onCheckedChange} /></HjmNativeProvider>); });
    const control = renderer!.root.find((node) => node.props.accessibilityLabel === "동의");
    act(() => control.props.onPress());
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("routes FloatingActionButton activation through its host button", () => {
    const onPress = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => { renderer = create(<HjmNativeProvider><FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" } }} renderIcon={() => <Text>＋</Text>} onPress={onPress} onContentClearanceChange={() => {}} /></HjmNativeProvider>); });
    const button = renderer!.root.find((node) => node.props.accessibilityLabel === "새 기록");
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("routes NumberField increment through its host accessibility action", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <NumberField decrementLabel="감소" incrementLabel="증가" label="수량" max={10} min={0} defaultValue={0} onValueChange={onValueChange} />
        </HjmNativeProvider>,
      );
    });
    const input = renderer!.root.findByType(TextInput);
    act(() => input.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it("routes SearchField text and clear actions through its host controls", () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <SearchField
            accessibilityLabel="검색"
            busyLabel="검색 중"
            clearLabel="검색어 지우기"
            onClear={onClear}
            onValueChange={onValueChange}
          />
        </HjmNativeProvider>,
      );
    });
    const input = renderer!.root.findByType(TextInput);
    act(() => input.props.onChangeText("hjm"));
    expect(onValueChange).toHaveBeenLastCalledWith("hjm");
    const clear = renderer!.root.find((node) => node.props.accessibilityLabel === "검색어 지우기");
    act(() => clear.props.onPress());
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("routes Toast close through its accessible host action", () => {
    const onDismiss = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <ToastRegion defaultToasts={[{
            id: "keyboard-toast",
            description: "완료되었습니다",
            closeLabel: "알림 닫기",
            durationMs: null,
            onDismiss,
          }]} />
        </HjmNativeProvider>,
      );
    });
    const close = renderer!.root.find((node) => node.props.accessibilityLabel === "알림 닫기");
    act(() => close.props.onPress());
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledWith("close-action");
  });

  it("routes SegmentedControl option selection through its host action", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <SegmentedControl
            items={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
            label="보기"
            onValueChange={onValueChange}
          />
        </HjmNativeProvider>,
      );
    });
    const option = renderer!.root.find((node) => node.props.accessibilityLabel === "격자");
    act(() => option.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("grid");
  });

  it("routes selectable Chip activation through its host action", () => {
    const onPress = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Chip label="즐겨찾기" onPress={onPress} selected={false} selectionMode="multiple" />
        </HjmNativeProvider>,
      );
    });
    const chip = renderer!.root.find((node) => node.props.accessibilityRole === "checkbox");
    act(() => chip.props.onPress({}));
    expect(onPress).toHaveBeenCalledOnce();
    expect(onPress.mock.calls[0]![0]).toBe(true);
  });

  it("routes RadioGroup selection through its host action", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <RadioGroup
            accessibilityLabel="배송 방법"
            items={[{ value: "standard", label: "일반 배송" }, { value: "express", label: "빠른 배송" }]}
            onValueChange={onValueChange}
          />
        </HjmNativeProvider>,
      );
    });
    const option = renderer!.root.find((node) => node.props.accessibilityLabel === "일반 배송");
    act(() => option.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("standard");
  });

  it("routes CheckboxGroup choice activation through its host action", () => {
    const onValueChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <CheckboxGroup
            accessibilityLabel="알림"
            items={[{ id: "email", label: "이메일 소식" }, { id: "news", label: "새 소식" }]}
            onValueChange={onValueChange}
          />
        </HjmNativeProvider>,
      );
    });
    const choice = renderer!.root.find((node) => node.props.accessibilityLabel === "이메일 소식");
    act(() => choice.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith(new Set(["email"]));
  });

  it("routes PasswordField reveal through its host action", () => {
    const onRevealedChange = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <PasswordField
            autofillHint="current"
            concealLabel="비밀번호 숨기기"
            label="비밀번호"
            onRevealedChange={onRevealedChange}
            revealLabel="비밀번호 보기"
          />
        </HjmNativeProvider>,
      );
    });
    const reveal = renderer!.root.find((node) => node.props.accessibilityLabel === "비밀번호 보기");
    act(() => reveal.props.onPress());
    expect(renderer!.root.findByType(TextInput).props.secureTextEntry).toBe(false);
    expect(onRevealedChange).toHaveBeenCalledWith(true);
  });

  it("routes AuthProviderButton host activation", () => {
    const onPress = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<Text>G</Text>} onPress={onPress} />
        </HjmNativeProvider>,
      );
    });
    const button = renderer!.root.find((node) => node.props.accessibilityRole === "button");
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("routes Link activation through the host press action", () => {
    const onNavigate = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Link descriptor={{ label: "내 기록", destination: { kind: "internal", href: "/records" } }} onNavigate={onNavigate} />
        </HjmNativeProvider>,
      );
    });
    const link = renderer!.root.find((node) => node.props.accessibilityRole === "link");
    act(() => link.props.onPress());
    expect(onNavigate).toHaveBeenCalledWith({ kind: "internal", href: "/records" });
  });

  it("exposes Field focus/setText actions through its named host control", () => {
    expect(
      executedScenarioRegistry.executions.some(({ scenarios }) =>
        scenarios.some(({ id }) => id === "native-actions"),
      ),
    ).toBe(true);
    const onFocus = vi.fn();
    const onChangeText = vi.fn();
    let renderer: ReturnType<typeof create>;
    act(() => {
      renderer = create(
        <HjmNativeProvider>
          <Field label="이메일" description="업무용 주소" required>
            {(controlProps) => (
              <TextInput
                {...controlProps}
                onFocus={onFocus}
                onChangeText={onChangeText}
              />
            )}
          </Field>
        </HjmNativeProvider>,
      );
    });
    const input = renderer!.root.findByType(TextInput);
    expect(input.props.accessibilityLabel).toBe("이메일 *");
    expect(input.props.accessibilityHint).toBe("업무용 주소");
    act(() => input.props.onFocus());
    act(() => input.props.onChangeText("team@example.com"));
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onChangeText).toHaveBeenCalledWith("team@example.com");
  });
});
