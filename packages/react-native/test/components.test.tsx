import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo, Modal, Pressable, TextInput, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Button,
  Checkbox,
  Dialog,
  Grid,
  HjmNativeProvider,
  Progress,
  SegmentedControl,
  Switch,
  Tabs,
  Text,
  TextField,
  useHjmNativeTheme,
  type HjmNativeTheme,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderWithProvider(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider reducedMotion theme="light">
        {node}
      </HjmNativeProvider>,
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("@hjm/react-native vertical slice", () => {
  it("resolves native environment signals through the contracts Provider", () => {
    let captured: HjmNativeTheme | undefined;
    function Consumer() {
      captured = useHjmNativeTheme();
      return <Text>환경</Text>;
    }
    renderWithProvider(<Consumer />);
    expect(captured?.environment).toMatchObject({
      theme: "light",
      direction: "ltr",
      reducedMotion: true,
    });
    expect(captured?.colors.text).toMatch(/^#/);
  });

  it("keeps Button a named, busy-aware 44pt Native target", () => {
    const onPress = vi.fn();
    const renderer = renderWithProvider(<Button onPress={onPress}>저장</Button>);
    const button = renderer.root.findByType(Pressable);
    expect(button.props.accessibilityRole).toBe("button");
    expect(button.props.accessibilityLabel).toBe("저장");
    expect(button.props.accessibilityState).toEqual({ disabled: false, busy: false });
    expect(
      flattenStyle(button.props.style({ pressed: false, focused: false, hovered: false })),
    ).toMatchObject({ height: 44, minHeight: 44, minWidth: 44 });
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("supports uncontrolled checkbox and field state without losing semantics", () => {
    const renderer = renderWithProvider(
      <>
        <Checkbox label="동의" />
        <TextField label="이름" defaultValue="김" />
      </>,
    );
    const checkbox = renderer.root.findAllByType(Pressable)[0]!;
    expect(checkbox.props.accessibilityState.checked).toBe(false);
    act(() => checkbox.props.onPress());
    expect(renderer.root.findAllByType(Pressable)[0]!.props.accessibilityState.checked).toBe(true);

    const input = renderer.root.findByType(TextInput);
    expect(input.props.accessibilityLabel).toBe("이름");
    act(() => input.props.onChangeText("민"));
    expect(renderer.root.findByType(TextInput).props.value).toBe("민");
  });

  it("uses the shared window class and Grid resolver", () => {
    const onLayoutResolved = vi.fn();
    renderWithProvider(
      <Grid
        availableWidth={600}
        columns={{ compact: 1, medium: 2 }}
        gap={{ compact: "md" }}
        onLayoutResolved={onLayoutResolved}
      >
        <Text>하나</Text>
        <Text>둘</Text>
      </Grid>,
    );
    expect(onLayoutResolved).toHaveBeenCalledWith(
      expect.objectContaining({ windowClass: "medium", columns: 2, columnWidth: 292 }),
    );
  });

  it("preserves Native switch, radio, and tab state semantics", () => {
    const renderer = renderWithProvider(
      <>
        <Switch label="알림" />
        <SegmentedControl
          label="보기 방식"
          options={[{ value: "list", label: "목록" }, { value: "grid", label: "격자" }]}
        />
        <Tabs
          label="프로필 탭"
          options={[{ value: "info", label: "정보" }, { value: "record", label: "기록" }]}
        />
      </>,
    );
    const nativeSwitch = renderer.root.find(
      (node) => node.props.accessibilityRole === "switch",
    );
    expect(nativeSwitch.props.accessibilityState.checked).toBe(false);
    act(() => nativeSwitch.props.onPress());
    expect(
      renderer.root.find((node) => node.props.accessibilityRole === "switch").props
        .accessibilityState.checked,
    ).toBe(true);

    const gridSegment = renderer.root.find(
      (node) => node.props.accessibilityRole === "radio" && node.props.accessibilityLabel === "격자",
    );
    act(() => gridSegment.props.onPress());
    expect(
      renderer.root.find(
        (node) => node.props.accessibilityRole === "radio" && node.props.accessibilityLabel === "격자",
      ).props.accessibilityState.checked,
    ).toBe(true);

    const recordTab = renderer.root.find(
      (node) => node.props.accessibilityRole === "tab" && node.props.accessibilityLabel === "기록",
    );
    act(() => recordTab.props.onPress());
    expect(
      renderer.root.find(
        (node) => node.props.accessibilityRole === "tab" && node.props.accessibilityLabel === "기록",
      ).props.accessibilityState.selected,
    ).toBe(true);
  });

  it("announces determinate progress and rejects invalid values", () => {
    const renderer = renderWithProvider(<Progress label="업로드" value={0.42} />);
    const progress = renderer.root.find((node) => node.props.accessibilityRole === "progressbar");
    expect(progress.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 42, text: "42%" });
    expect(() => renderWithProvider(<Progress label="오류" value={1.1} />)).toThrow(RangeError);
  });

  it("maps Dialog to a modal accessibility boundary and closes uncontrolled state", () => {
    vi.useFakeTimers();
    const focusSpy = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const returnFocusRef = { current: {} as View };
    const renderer = renderWithProvider(
      <Dialog
        closeLabel="닫기"
        defaultOpen
        primaryAction={{ label: "삭제", onPress: vi.fn() }}
        returnFocusRef={returnFocusRef}
        title="삭제할까요?"
      >
        <Text>이 작업은 되돌릴 수 없습니다.</Text>
      </Dialog>,
    );
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(renderer.root.findByType(Modal).props.animationType).toBe("none");
    const boundary = renderer.root.findAllByType(View).find(
      (node: ReactTestInstance) => node.props.accessibilityViewIsModal === true,
    );
    expect(boundary?.props.accessibilityLabel).toContain("삭제할까요?");
    const action = renderer.root.findAllByType(Pressable).find(
      (node: ReactTestInstance) => node.props.accessibilityLabel === "삭제",
    );
    act(() => action?.props.onPress());
    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    expect(focusSpy).not.toHaveBeenCalled();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(focusSpy).toHaveBeenCalledWith(1);
  });
});
