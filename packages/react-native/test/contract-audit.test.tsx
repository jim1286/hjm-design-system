import { useEffect, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  Switch as NativeSwitch,
  TextInput,
  View,
} from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  BottomCTA,
  BottomNavigation,
  Chip,
  CounterBadge,
  Grid,
  HjmNativeProvider,
  Icon,
  List,
  ListRow,
  RadioGroup,
  SearchField,
  Section,
  SegmentedControl,
  Sheet,
  Statistic,
  Switch,
  Tabs,
  Text,
  ToastRegion,
  TopBar,
  useToastRegion,
  type ToastRegionController,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function tree(
  node: ReactNode,
  textScale: 1 | 1.6 = 1,
  direction: "ltr" | "rtl" = "ltr",
) {
  return (
    <HjmNativeProvider
      direction={direction}
      reducedMotion
      textScale={textScale}
      theme="light"
    >
      {node}
    </HjmNativeProvider>
  );
}

function render(
  node: ReactNode,
  textScale: 1 | 1.6 = 1,
  direction: "ltr" | "rtl" = "ltr",
): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(tree(node, textScale, direction), { createNodeMock: () => ({}) });
  });
  return renderer!;
}

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("selection contract alignment", () => {
  it("uses the first enabled tab and exposes activation, layout, and panel policies", () => {
    const renderer = render(
      <Tabs
        activationMode="automatic"
        direction="rtl"
        label="계정"
        loop={false}
        mountPolicy="always"
        orientation="vertical"
        panelMode="keyed"
        options={[
          { value: "disabled", label: "비활성", disabled: true, panel: <Text>비활성 패널</Text> },
          { value: "profile", label: "프로필", panel: <Text>프로필 패널</Text> },
          {
            value: "security",
            label: "보안",
            panel: <Text>보안 패널</Text>,
            panelAccessibilityLabel: "보안 콘텐츠",
          },
        ]}
      />,
    );
    expect(byLabel(renderer, "프로필").props.accessibilityState.selected).toBe(true);
    act(() => byLabel(renderer, "보안").props.onFocus());
    expect(byLabel(renderer, "보안").props.accessibilityState.selected).toBe(true);
    const panels = renderer.root.findAllByType(View).filter((node) => node.props.role === "tabpanel");
    expect(panels).toHaveLength(3);
    expect(flattenStyle(panels.find((panel) => panel.props.accessibilityLabel === "보안 콘텐츠")!.props.style))
      .toMatchObject({ display: "flex" });
    const tabList = renderer.root.findAllByType(View)
      .find((node) => node.props.accessibilityRole === "tablist")!;
    expect(flattenStyle(tabList.props.style)).toMatchObject({
      direction: "rtl",
      flexDirection: "column",
    });
    const tabsLayout = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return node.props.accessibilityLabel === "계정" && style.flexDirection === "row";
    });
    expect(flattenStyle(tabsLayout?.props.style).direction).toBe("rtl");
  });

  it("rejects duplicate or invalid Tabs selection and reconciles removed uncontrolled values", () => {
    expect(() => render(
      <Tabs
        label="중복"
        options={[{ value: "same", label: "하나" }, { value: "same", label: "둘" }]}
      />,
    )).toThrow(/Duplicate tab id/u);
    expect(() => render(
      <Tabs
        defaultValue="disabled"
        label="비활성"
        options={[{ value: "disabled", label: "비활성", disabled: true }, { value: "ready", label: "사용" }]}
      />,
    )).toThrow(/enabled/u);
    expect(() => render(
      <Tabs
        label="패널"
        mountPolicy="always"
        panelMode="dynamic"
        options={[{ value: "one", label: "하나" }]}
      />,
    )).toThrow(/dynamic panelMode/u);

    const onValueChange = vi.fn();
    const renderer = render(
      <Tabs
        defaultValue="a"
        label="동적 탭"
        onValueChange={onValueChange}
        options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
      />,
    );
    act(() => {
      renderer.update(tree(
        <Tabs
          defaultValue="a"
          label="동적 탭"
          onValueChange={onValueChange}
          options={[{ value: "b", label: "B" }, { value: "c", label: "C" }]}
        />,
      ));
    });
    expect(byLabel(renderer, "B").props.accessibilityState.selected).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("supports nullable/required Radio state, linked errors, read-only, and collection validation", () => {
    const renderer = render(
      <RadioGroup
        error="하나를 선택하세요"
        label="배송"
        options={[{ value: "none", label: "불가", disabled: true }, { value: "fast", label: "빠른 배송" }]}
        readOnly
        readOnlyLabel="읽기 전용"
        required
        requiredLabel="필수"
      />,
    );
    const group = renderer.root.find((node) => node.props.accessibilityRole === "radiogroup");
    expect(group.props.accessibilityLabel).toContain("필수");
    expect(group.props.accessibilityValue).toEqual({ text: "하나를 선택하세요" });
    expect(byLabel(renderer, "빠른 배송").props.accessibilityState).toMatchObject({
      checked: true,
      disabled: true,
    });
    expect(renderer.root.findAll((node) => node.children.includes("하나를 선택하세요")))
      .not.toHaveLength(0);
    expect(() => render(
      <RadioGroup
        label="중복"
        options={[{ value: "same", label: "하나" }, { value: "same", label: "둘" }]}
      />,
    )).toThrow(/Duplicate selection item id/u);
    expect(() => render(
      <RadioGroup
        label="알 수 없음"
        options={[{ value: "known", label: "알려짐" }]}
        value="missing"
      />,
    )).toThrow(/must exist/u);
  });

  it("reconciles removed SegmentedControl values to the first enabled option", () => {
    const onValueChange = vi.fn();
    const renderer = render(
      <SegmentedControl
        defaultValue="a"
        label="보기"
        onValueChange={onValueChange}
        options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
      />,
    );
    act(() => {
      renderer.update(tree(
        <SegmentedControl
          defaultValue="a"
          label="보기"
          onValueChange={onValueChange}
          options={[{ value: "disabled", label: "불가", disabled: true }, { value: "b", label: "B" }]}
        />,
      ));
    });
    expect(byLabel(renderer, "B").props.accessibilityState.checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(() => render(
      <SegmentedControl
        label="중복"
        options={[{ value: "same", label: "하나" }, { value: "same", label: "둘" }]}
      />,
    )).toThrow(/Duplicate tab id/u);
  });
});

describe("Native input and navigation intent", () => {
  it("preserves a busy SearchField query and invokes the explicit clear callback", () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    const renderer = render(
      <SearchField
        busy
        busyLabel="검색 중"
        clearLabel="검색어 지우기"
        label="검색"
        onClear={onClear}
        onValueChange={onValueChange}
        value="유지"
      />,
    );
    const input = renderer.root.findByType(TextInput);
    expect(input.props.editable).toBe(false);
    act(() => input.props.onChangeText("변경"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(renderer.root.findByType(TextInput).props.value).toBe("유지");
    act(() => {
      renderer.update(tree(
        <SearchField
          busyLabel="검색 중"
          clearLabel="검색어 지우기"
          label="검색"
          onClear={onClear}
          onValueChange={onValueChange}
          value="유지"
        />,
      ));
    });
    act(() => byLabel(renderer, "검색어 지우기").props.onPress());
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("makes the Switch row the only press and accessibility target", () => {
    const onValueChange = vi.fn();
    const renderer = render(<Switch label="알림" onValueChange={onValueChange} />, 1, "rtl");
    const switches = renderer.root.findAllByType(Pressable)
      .filter((node) => node.props.accessibilityRole === "switch");
    expect(switches).toHaveLength(1);
    expect(flattenStyle(switches[0]!.props.style({ pressed: false }))).toMatchObject({
      direction: "rtl",
      flexDirection: "row",
    });
    const visual = renderer.root.findByType(NativeSwitch);
    expect(visual.props).toMatchObject({ accessible: false, pointerEvents: "none" });
    expect(visual.props.onValueChange).toBeUndefined();
    act(() => switches[0]!.props.onPress());
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it("keeps BottomNavigation router-owned and rejects more than five destinations", () => {
    const onActivate = vi.fn();
    const descriptor = {
      accessibilityLabel: "주요 메뉴",
      items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "profile", label: "프로필", icon: { name: "user" } },
      ],
      selectedKey: "home",
    } as const;
    const renderer = render(
      <BottomNavigation
        descriptor={descriptor}
        onActivate={onActivate}
        renderIcon={({ name }) => <Text>{name}</Text>}
      />,
    );
    act(() => byLabel(renderer, "프로필").props.onPress());
    expect(onActivate).toHaveBeenCalledWith({ key: "profile", reason: "navigate" });
    expect(byLabel(renderer, "홈").props.accessibilityState.selected).toBe(true);
    expect(() => render(
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "너무 많음",
          items: Array.from({ length: 6 }, (_, index) => ({
            id: `item-${index}`,
            label: `항목 ${index}`,
            icon: { name: "home" },
          })),
          selectedKey: "item-0",
        }}
        onActivate={vi.fn()}
        renderIcon={({ name }) => <Text>{name}</Text>}
      />,
    )).toThrow(/at most 5/u);
  });

  it("keeps TopBar logical slots in source order and lets Yoga place them in RTL", () => {
    const renderer = render(
      <TopBar
        leading={<View testID="leading" />}
        title="설정"
        trailing={<View testID="trailing" />}
      />,
      1,
      "rtl",
    );
    const toolbar = renderer.root.find(
      (node) => node.props.accessibilityRole === "toolbar",
    );
    expect(flattenStyle(toolbar.props.style)).toMatchObject({
      direction: "rtl",
      flexDirection: "row",
    });
    const slotOrder = toolbar
      .findAll((node) => node.props.testID === "leading" || node.props.testID === "trailing")
      .map((node) => node.props.testID);
    expect(slotOrder.indexOf("leading")).toBeLessThan(slotOrder.indexOf("trailing"));
  });
});

describe("identity and new first-party slices", () => {
  it("preserves keyed Grid child identity through reorder and insertion", () => {
    const mounts: string[] = [];
    const unmounts: string[] = [];
    function Probe({ id }: Readonly<{ id: string }>) {
      useEffect(() => {
        mounts.push(id);
        return () => { unmounts.push(id); };
      }, [id]);
      return <Text>{id}</Text>;
    }
    const columns = { compact: 2 } as const;
    const gap = { compact: "xs" } as const;
    const renderer = render(
      <Grid availableWidth={320} columns={columns} gap={gap}>
        <Probe key="a" id="a" />
        <Probe key="b" id="b" />
      </Grid>,
    );
    act(() => {
      renderer.update(tree(
        <Grid availableWidth={320} columns={columns} gap={gap}>
          <Probe key="c" id="c" />
          <Probe key="b" id="b" />
          <Probe key="a" id="a" />
        </Grid>,
      ));
    });
    expect(mounts).toEqual(["a", "b", "c"]);
    expect(unmounts).toEqual([]);
  });

  it("renders the evidence-backed added families with explicit Native semantics", () => {
    const renderer = render(
      <>
        <Icon
          descriptor={{ name: "back", decorative: false, accessibilityLabel: "뒤로" }}
          renderGlyph={({ name }) => <Text>{name}</Text>}
        />
        <Section action={<Text>더 보기</Text>} title="개요"><Text>내용</Text></Section>
        <BottomCTA primaryAction={{ label: "계속", onPress: vi.fn() }} safeAreaBottom={12} />
        <Chip label="필터" onPress={vi.fn()} />
        <TopBar leading={<Text>이전</Text>} title="설정" trailing={<Text>완료</Text>} />
        <CounterBadge accessibilityLabel="알림 100개 이상" count={128} max={99} />
        <List label="항목"><ListRow title="첫 행" /></List>
        <Statistic descriptor={{ id: "orders", label: "주문", value: "12", trend: { direction: "up", tone: "success", label: "전주 대비 2 증가" } }} />
      </>,
      1.6,
      "rtl",
    );
    expect(byLabel(renderer, "뒤로").props.accessibilityRole).toBe("image");
    expect(renderer.root.findAllByType(View)
      .filter((node) => node.props.accessibilityRole === "toolbar").length).toBeGreaterThanOrEqual(2);
    expect(byLabel(renderer, "필터").props.accessibilityRole).toBe("button");
    expect(flattenStyle(byLabel(renderer, "필터").props.style({ pressed: false })))
      .toMatchObject({ direction: "rtl", flexDirection: "row" });
    expect(byLabel(renderer, "알림 100개 이상").children).toBeTruthy();
    expect(renderer.root.find((node) => node.props.accessibilityRole === "list")).toBeTruthy();
    expect(byLabel(renderer, "주문, 12, 전주 대비 2 증가").props.accessible).toBe(true);
    expect(flattenStyle(byLabel(renderer, "계속").props.style({ pressed: false })))
      .toMatchObject({ minHeight: 44, minWidth: 44 });
    const layoutStyles = renderer.root.findAllByType(View)
      .map((node) => flattenStyle(node.props.style));
    expect(layoutStyles).toEqual(expect.arrayContaining([
      expect.objectContaining({ direction: "rtl", flexDirection: "column" }),
      expect.objectContaining({ direction: "rtl", flexDirection: "column-reverse" }),
    ]));
    expect(layoutStyles.some((style) => style.flexDirection === "row-reverse")).toBe(false);
  });
});

describe("modal lifecycle contracts", () => {
  it("passes RTL overlay action groups to Yoga as canonical rows", () => {
    const renderer = render(
      <AlertDialog
        defaultOpen
        request={{
          mode: "confirm",
          tone: "danger",
          title: "삭제",
          description: "되돌릴 수 없습니다.",
          confirmLabel: "삭제하기",
          cancelLabel: "취소",
          fallbackErrorMessage: "삭제하지 못했습니다.",
          onConfirm: vi.fn(),
        }}
      />,
      1,
      "rtl",
    );
    const styles = renderer.root.findAllByType(View)
      .map((node) => flattenStyle(node.props.style));
    expect(styles).toEqual(expect.arrayContaining([
      expect.objectContaining({ direction: "rtl", flexDirection: "row" }),
    ]));
    expect(styles.some((style) => style.flexDirection === "row-reverse")).toBe(false);
  });

  it("runs AlertDialog confirm once, blocks busy dismiss, announces failure, and settles after onDismiss", async () => {
    let rejectConfirm!: (reason: unknown) => void;
    const onConfirm = vi.fn(() => new Promise<void>((_resolve, reject) => { rejectConfirm = reject; }));
    const onOpenChange = vi.fn();
    const onResult = vi.fn();
    const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const renderer = render(
      <AlertDialog
        defaultOpen
        onOpenChange={onOpenChange}
        onResult={onResult}
        returnFocusRef={{ current: {} as View }}
        request={{
          mode: "confirm",
          tone: "danger",
          title: "삭제",
          description: "되돌릴 수 없습니다.",
          confirmLabel: "삭제하기",
          cancelLabel: "취소",
          onConfirm,
          fallbackErrorMessage: "삭제하지 못했습니다.",
        }}
      />,
    );
    const modal = renderer.root.findByType(Modal);
    act(() => modal.props.onShow({}));
    expect(focus).toHaveBeenCalledWith(1);
    const confirm = byLabel(renderer, "삭제하기");
    act(() => {
      confirm.props.onPress();
      confirm.props.onPress();
      modal.props.onRequestClose();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => {
      rejectConfirm(new Error("offline"));
      await Promise.resolve();
    });
    expect(renderer.root.findAll((node) => node.children.includes("삭제하지 못했습니다.")))
      .not.toHaveLength(0);
    expect(renderer.root.findByType(Modal).props.visible).toBe(true);

    const visibleModal = renderer.root.findByType(Modal);
    act(() => byLabel(renderer, "취소").props.onPress());
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: "cancel-action" });
    expect(onResult).not.toHaveBeenCalled();
    await act(async () => {
      visibleModal.props.onDismiss();
      await Promise.resolve();
    });
    expect(onResult).toHaveBeenCalledWith({ outcome: "cancelled", reason: "cancel-action" });
    expect(focus).toHaveBeenCalledTimes(2);
  });

  it("re-arms controlled AlertDialog and Sheet attempts when an owner keeps them open", async () => {
    vi.useFakeTimers();
    const alertChange = vi.fn();
    const alert = render(
      <AlertDialog
        open
        onOpenChange={alertChange}
        request={{
          mode: "alert",
          title: "알림",
          description: "계속 열어 둡니다.",
          confirmLabel: "확인",
        }}
      />,
    );
    await act(async () => {
      byLabel(alert, "확인").props.onPress();
      await Promise.resolve();
      vi.runOnlyPendingTimers();
    });
    await act(async () => {
      byLabel(alert, "확인").props.onPress();
      await Promise.resolve();
    });
    expect(alertChange).toHaveBeenCalledTimes(2);

    const sheetChange = vi.fn();
    const sheet = render(<Sheet closeLabel="닫기" onOpenChange={sheetChange} open title="필터" />);
    act(() => {
      sheet.root.findByType(Modal).props.onRequestClose();
      sheet.root.findByType(Modal).props.onRequestClose();
    });
    expect(sheetChange).toHaveBeenCalledOnce();
    act(() => { vi.runOnlyPendingTimers(); });
    act(() => sheet.root.findByType(Modal).props.onRequestClose());
    expect(sheetChange).toHaveBeenCalledTimes(2);
  });

  it("applies Sheet busy/policy/safe-area and reports completion only after Native dismiss", () => {
    const onOpenChange = vi.fn();
    const onDismissComplete = vi.fn();
    const focus = vi.spyOn(AccessibilityInfo, "setAccessibilityFocus");
    const renderer = render(
      <Sheet
        closeLabel="닫기"
        busy
        defaultOpen
        onDismissComplete={onDismissComplete}
        onOpenChange={onOpenChange}
        returnFocusRef={{ current: {} as View }}
        safeAreaInsets={{ bottom: 20 }}
        title="필터"
      />,
    );
    const modal = renderer.root.findByType(Modal);
    act(() => modal.props.onRequestClose());
    expect(onOpenChange).not.toHaveBeenCalled();
    const boundary = renderer.root.find((node) => node.props.role === "dialog");
    expect(flattenStyle(boundary.props.style)).toMatchObject({ paddingBottom: 40 });
    act(() => {
      renderer.update(tree(
        <Sheet
          closeLabel="닫기"
          defaultOpen
          onDismissComplete={onDismissComplete}
          onOpenChange={onOpenChange}
          returnFocusRef={{ current: {} as View }}
          safeAreaInsets={{ bottom: 20 }}
          title="필터"
        />,
      ));
    });
    const activeModal = renderer.root.findByType(Modal);
    act(() => activeModal.props.onRequestClose());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "back" });
    expect(onDismissComplete).not.toHaveBeenCalled();
    act(() => activeModal.props.onDismiss());
    expect(onDismissComplete).toHaveBeenCalledWith({ reason: "back" });
    expect(focus).toHaveBeenCalledWith(1);
  });
});

describe("Toast store adapter", () => {
  function Publisher({ expose }: Readonly<{ expose: (controller: ToastRegionController) => void }>) {
    expose(useToastRegion());
    return null;
  }

  it("bounds overflow, pauses/resumes the clock, and promotes FIFO entries", () => {
    vi.useFakeTimers();
    let controller: ToastRegionController | undefined;
    const overflowDismiss = vi.fn();
    const timeoutDismiss = vi.fn();
    const renderer = render(
      <ToastRegion maxQueued={1} maxVisible={1}>
        <Publisher expose={(next) => { controller = next; }} />
      </ToastRegion>,
      1,
      "rtl",
    );
    act(() => {
      controller!.show({ id: "visible", description: "첫째", durationMs: null, closeLabel: "첫째 닫기" });
      controller!.show({ id: "oldest", description: "둘째", durationMs: null, closeLabel: "둘째 닫기", onDismiss: overflowDismiss });
      controller!.show({ id: "next", description: "셋째", durationMs: 5_000, closeLabel: "셋째 닫기", onDismiss: timeoutDismiss });
    });
    expect(overflowDismiss).toHaveBeenCalledOnce();
    expect(overflowDismiss).toHaveBeenCalledWith("queue-overflow");
    act(() => { controller!.dismiss("visible", "close-action"); });
    expect(byLabel(renderer, "셋째").props.accessibilityLiveRegion).toBe("polite");
    const toastRow = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return style.direction === "rtl" && style.flexDirection === "row";
    });
    expect(toastRow).toBeDefined();
    act(() => { controller!.pause("next"); });
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(timeoutDismiss).not.toHaveBeenCalled();
    act(() => { controller!.resume("next"); });
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(timeoutDismiss).toHaveBeenCalledOnce();
    expect(timeoutDismiss).toHaveBeenCalledWith("timeout");
  });

  it("invokes Toast action/dismiss exactly once and interrupts every item on teardown", () => {
    let controller: ToastRegionController | undefined;
    const action = vi.fn();
    const actionDismiss = vi.fn();
    const queuedDismiss = vi.fn();
    const renderer = render(
      <ToastRegion maxQueued={2} maxVisible={1}>
        <Publisher expose={(next) => { controller = next; }} />
      </ToastRegion>,
    );
    act(() => {
      controller!.show({
        id: "action",
        description: "실행 가능",
        closeLabel: "실행 닫기",
        action: { label: "되돌리기", onAction: action },
        onDismiss: actionDismiss,
      });
      controller!.show({
        id: "queued",
        description: "대기",
        durationMs: null,
        closeLabel: "대기 닫기",
        onDismiss: queuedDismiss,
      });
    });
    const actionButton = byLabel(renderer, "되돌리기");
    act(() => {
      actionButton.props.onPress();
      actionButton.props.onPress();
    });
    expect(action).toHaveBeenCalledOnce();
    expect(actionDismiss).toHaveBeenCalledOnce();
    expect(actionDismiss).toHaveBeenCalledWith("action");
    act(() => renderer.unmount());
    expect(queuedDismiss).toHaveBeenCalledOnce();
    expect(queuedDismiss).toHaveBeenCalledWith("interrupted");
  });
});
