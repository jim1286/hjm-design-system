import type { ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Modal, Pressable, TextInput } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Checkbox,
  CheckboxGroup,
  Combobox,
  HjmNativeProvider,
  Menu,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Text,
  TextArea,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Native field and choice product adapters", () => {
  it("accepts an accessibility-only TextArea and renders SearchField affordance adapters", () => {
    const textArea = render(<TextArea accessibilityLabel="메모 입력" />);
    expect(textArea.root.findByType(TextInput).props.accessibilityLabel).toBe("메모 입력");

    const renderLeading = vi.fn(() => <Text>검색 아이콘</Text>);
    const renderClearIcon = vi.fn(() => <Text>지우기 아이콘</Text>);
    const renderBusyIndicator = vi.fn(() => <Text>대기 아이콘</Text>);
    const onClear = vi.fn();
    const search = render(
      <SearchField
        accessibilityLabel="선수 검색"
        busyLabel="검색 중"
        clearLabel="검색어 지우기"
        defaultValue="손흥민"
        onClear={onClear}
        renderBusyIndicator={renderBusyIndicator}
        renderClearIcon={renderClearIcon}
        renderLeading={renderLeading}
        trailing={<Text>후행</Text>}
      />,
    );
    expect(renderLeading).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    expect(renderClearIcon).toHaveBeenCalledWith(expect.objectContaining({ size: expect.any(Number) }));
    expect(search.root.findAll((node) => node.children.includes("후행"))).toHaveLength(0);
    act(() => byLabel(search, "검색어 지우기").props.onPress());
    expect(onClear).toHaveBeenCalledOnce();
    act(() => {
      search.update(
        <HjmNativeProvider reducedMotion theme="light">
          <SearchField
            accessibilityLabel="선수 검색"
            busy
            busyLabel="검색 중"
            clearLabel="검색어 지우기"
            renderBusyIndicator={renderBusyIndicator}
          />
        </HjmNativeProvider>,
      );
    });
    expect(renderBusyIndicator).toHaveBeenCalled();
  });

  it("supports mixed/read-only Checkbox slots and immutable CheckboxGroup control", () => {
    const onCheckedChange = vi.fn();
    const mixed = render(
      <Checkbox
        checked="mixed"
        label="전체 선택"
        onCheckedChange={onCheckedChange}
        renderIndicator={({ checked }) => <Text>{String(checked)}</Text>}
      />,
    );
    expect(byLabel(mixed, "전체 선택").props.accessibilityState.checked).toBe("mixed");
    act(() => byLabel(mixed, "전체 선택").props.onPress());
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    const readOnlyChange = vi.fn();
    const readOnly = render(
      <Checkbox checked label="약관" onCheckedChange={readOnlyChange} readOnly readOnlyLabel="읽기 전용" />,
    );
    act(() => byLabel(readOnly, "약관").props.onPress());
    expect(readOnlyChange).not.toHaveBeenCalled();
    expect(byLabel(readOnly, "약관").props.accessibilityHint).toContain("읽기 전용");

    const initial = new Set(["sports"]);
    const onValueChange = vi.fn();
    const group = render(
      <CheckboxGroup
        accessibilityLabel="관심사"
        items={[{ id: "sports", label: "스포츠" }, { id: "music", label: "음악" }]}
        onValueChange={onValueChange}
        value={initial}
      />,
    );
    act(() => byLabel(group, "음악").props.onPress());
    expect(initial).toEqual(new Set(["sports"]));
    expect(onValueChange).toHaveBeenCalledWith(new Set(["sports", "music"]));
    expect(() => render(
      <CheckboxGroup
        accessibilityLabel="오류"
        items={[{ id: "known", label: "알려짐" }]}
        onValueChange={() => undefined}
        value={new Set(["missing"])}
      />,
    )).toThrow(/must exist/u);
  });

  it("renders Radio and Segmented leading slots with recipe appearances", () => {
    const radioLeading = vi.fn(() => <Text>라디오 선행</Text>);
    const radio = render(
      <RadioGroup
        accessibilityLabel="배송"
        indicator="none"
        options={[{ value: "fast", label: "빠름", description: "내일 도착" }]}
        orientation="horizontal"
        presentation="card"
        renderLeading={radioLeading}
        size="small"
      />,
    );
    expect(radioLeading).toHaveBeenCalledWith(
      expect.objectContaining({ value: "fast" }),
      expect.objectContaining({ selected: false, size: expect.any(Number) }),
    );
    expect(byLabel(radio, "빠름").props.accessibilityState.checked).toBe(false);

    const segmentLeading = vi.fn(() => <Text>세그먼트 선행</Text>);
    render(
      <SegmentedControl
        label="보기"
        options={[{ value: "list", label: "목록", renderLeading: segmentLeading }]}
      />,
    );
    expect(segmentLeading).toHaveBeenCalledWith(
      expect.objectContaining({ selected: true, color: expect.any(String) }),
    );
  });
});

describe("Native collection surfaces", () => {
  it("exposes read-only collection triggers as disabled without opening them", () => {
    const selectOpen = vi.fn();
    const select = render(
      <Select
        accessibilityLabel="언어"
        dismissLabel="닫기"
        items={[{ id: "ko", label: "한국어", textValue: "한국어" }]}
        onOpenChange={selectOpen}
        placeholder="선택"
        readOnly
      />,
    );
    const selectTrigger = select.root.find((node) => node.props.accessibilityRole === "combobox");
    expect(selectTrigger.props.accessibilityState.disabled).toBe(true);
    act(() => selectTrigger.props.onPress());
    expect(selectOpen).not.toHaveBeenCalled();

    const combobox = render(
      <Combobox
        accessibilityLabel="도시"
        clearLabel="지우기"
        dismissLabel="닫기"
        emptyMessage="없음"
        items={[{ id: "seoul", label: "서울", textValue: "서울" }]}
        loadingMessage="검색 중"
        readOnly
      />,
    );
    expect(combobox.root.findByType(TextInput).props).toMatchObject({
      editable: false,
      accessibilityState: expect.objectContaining({ disabled: true }),
    });

    const menuOpen = vi.fn();
    const menu = render(
      <Menu
        dismissLabel="닫기"
        items={[{ value: "profile", label: "프로필" }]}
        onOpenChange={menuOpen}
        readOnly
        triggerLabel="계정 메뉴"
      />,
    );
    const menuTrigger = menu.root.findAllByType(Pressable).find(
      (node) => node.props.accessibilityLabel === "계정 메뉴",
    );
    expect(menuTrigger).toBeDefined();
    expect(menuTrigger?.props.accessibilityState.disabled).toBe(true);
    act(() => menuTrigger?.props.onPress());
    expect(menuOpen).not.toHaveBeenCalled();
  });

  it("supports Select sections, reasoned close, leading adapters, and after-dismiss selection", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const onSelectionChange = vi.fn();
    const onAfterDismiss = vi.fn();
    const renderOptionLeading = vi.fn(() => <Text>국기</Text>);
    const renderer = render(
      <Select
        defaultOpen
        dismissLabel="닫기"
        accessibilityLabel="언어"
        onOpenChange={onOpenChange}
        onSelectionAfterDismiss={onAfterDismiss}
        onSelectionChange={onSelectionChange}
        placeholder="선택"
        renderOptionLeading={renderOptionLeading}
        sections={[{
          id: "asia",
          label: "아시아",
          items: [{ id: "ko", label: "한국어", textValue: "한국어" }],
        }]}
      />,
    );
    expect(renderer.root.findAllByType(Modal)).toHaveLength(1);
    act(() => byLabel(renderer, "한국어").props.onPress());
    expect(onSelectionChange).toHaveBeenCalledWith("ko");
    expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
    expect(onAfterDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onAfterDismiss).toHaveBeenCalledWith("ko");
    expect(renderOptionLeading).toHaveBeenCalledWith(
      expect.objectContaining({ id: "ko" }),
      expect.objectContaining({ placement: "option" }),
    );
  });

  it("supports Combobox section states, retry, leading adapters, and after-dismiss commit", () => {
    vi.useFakeTimers();
    const onCommitAfterDismiss = vi.fn();
    const onOpenChange = vi.fn();
    const renderer = render(
      <Combobox
        defaultOpen
        accessibilityLabel="도시"
        clearLabel="지우기"
        dismissLabel="닫기"
        emptyMessage="없음"
        loadingMessage="검색 중"
        onCommitAfterDismiss={onCommitAfterDismiss}
        onOpenChange={onOpenChange}
        renderLeading={() => <Text>도시 아이콘</Text>}
        sections={[{
          id: "kr",
          label: "대한민국",
          items: [{ id: "seoul", label: "서울", textValue: "서울" }],
        }]}
      />,
    );
    act(() => byLabel(renderer, "서울").props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
    expect(onCommitAfterDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onCommitAfterDismiss).toHaveBeenCalledWith("seoul", "selection");

    const onRetry = vi.fn();
    const error = render(
      <Combobox
        accessibilityLabel="도시"
        asyncState={{ status: "error", message: "실패" }}
        clearLabel="지우기"
        defaultOpen
        dismissLabel="닫기"
        emptyMessage="없음"
        items={[]}
        loadingMessage="검색 중"
        onRetry={onRetry}
        retryLabel="다시 시도"
      />,
    );
    const retry = error.root.findAllByType(Pressable).find((node) =>
      node.findAll((candidate) => candidate.children.includes("다시 시도")).length > 0,
    );
    expect(retry).toBeDefined();
    act(() => retry?.props.onPress());
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("supports sectioned Menu actions and executes navigation only after teardown", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    const onActionAfterDismiss = vi.fn();
    const onOpenChange = vi.fn();
    const renderer = render(
      <Menu
        defaultOpen
        dismissLabel="닫기"
        onAction={onAction}
        onActionAfterDismiss={onActionAfterDismiss}
        onOpenChange={onOpenChange}
        sections={[{
          id: "account",
          label: "계정",
          items: [{ id: "logout", label: "로그아웃", textValue: "로그아웃", tone: "danger" }],
        }]}
        triggerLabel="계정 메뉴"
      />,
    );
    act(() => byLabel(renderer, "로그아웃").props.onPress());
    expect(onAction).toHaveBeenCalledWith("logout");
    expect(onOpenChange).toHaveBeenCalledWith(false, "selection");
    expect(onActionAfterDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(onActionAfterDismiss).toHaveBeenCalledWith("logout");
  });

  it("renders busy collection messages without exposing unavailable options", () => {
    const select = render(
      <Select
        asyncState={{ status: "loading", message: "불러오는 중" }}
        dismissLabel="닫기"
        label="팀"
        items={[]}
        placeholder="선택"
        defaultOpen
      />,
    );
    expect(select.root.findAllByType(ActivityIndicator)).not.toHaveLength(0);
    expect(select.root.findAll((node) => node.children.includes("불러오는 중"))).not.toHaveLength(0);

    const menu = render(
      <Menu
        asyncState={{ status: "loading", message: "메뉴 불러오는 중" }}
        defaultOpen
        dismissLabel="닫기"
        items={[]}
        triggerLabel="메뉴"
      />,
    );
    expect(menu.root.findAll((node) => node.children.includes("메뉴 불러오는 중"))).not.toHaveLength(0);
  });
});
