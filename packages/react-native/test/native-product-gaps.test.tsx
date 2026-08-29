import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  Animated,
  Keyboard,
  Pressable,
  Text as NativeText,
  View,
} from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import { radius, spacing, typography } from "@hjmds/design-contracts/foundations";
import {
  badgeRecipe,
  bottomCtaRecipe,
  listRecipe,
  toastRecipe,
} from "@hjmds/design-contracts/recipes";
import {
  Badge,
  BottomCTA,
  DescriptionList,
  EmptyState,
  Grid,
  HjmNativeProvider,
  List,
  ListRow,
  Notice,
  Section,
  Statistic,
  Text,
  ToastRegion,
  useHjmNativeTheme,
  useToastRegion,
  type ToastRegionController,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function render(
  node: React.ReactNode,
  options: Readonly<{
    direction?: "ltr" | "rtl";
    reducedMotion?: boolean;
    textScale?: number;
  }> = {},
): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider
        direction={options.direction ?? "ltr"}
        reducedMotion={options.reducedMotion ?? true}
        theme="light"
        {...(options.textScale === undefined ? {} : { textScale: options.textScale })}
      >
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

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

afterEach(() => {
  vi.restoreAllMocks();
  const keyboard = Keyboard as unknown as {
    __emit(event: "keyboardDidShow" | "keyboardDidHide", height?: number): void;
  };
  act(() => keyboard.__emit("keyboardDidHide"));
});

describe("Native product renderer gaps", () => {
  it("renders Badge outline treatment without losing tone copy", () => {
    let border = "";
    function Capture() {
      border = useHjmNativeTheme().colors.border;
      return <Badge label={7} tone="neutral" variant="outline" />;
    }
    const renderer = render(<Capture />);
    const badge = byLabel(renderer, "7");
    expect(flattenStyle(badge.props.style)).toMatchObject({
      backgroundColor: "transparent",
      borderColor: border,
      borderRadius: radius[badgeRecipe.radius],
      borderWidth: badgeRecipe.borderWidth,
    });
  });

  it("keeps ListRow metadata decorative to its command and trailingAction separately interactive", () => {
    const renderer = render(
      <ListRow
        metadataLabel="라이브"
        title="경기"
        titleMetadata={<Badge label="LIVE" tone="danger" />}
        trailingAction={<Pressable accessibilityLabel="알림 설정" accessibilityRole="button" />}
        trailingText="3회"
      />,
    );
    expect(renderer.root.findAllByType(Pressable)).toHaveLength(1);
    expect(byLabel(renderer, "알림 설정").props.accessibilityRole).toBe("button");
    const title = renderer.root.findAllByType(NativeText).find((node) => node.props.children === "경기");
    expect(title).toBeDefined();

    const command = render(
      <ListRow
        metadataLabel="라이브"
        onPress={vi.fn()}
        title="경기"
        titleMetadata={<Badge label="LIVE" tone="danger" />}
        trailingAction={<Pressable accessibilityLabel="알림 설정" />}
        trailingText="3회"
      />,
    );
    expect(byLabel(command, "경기, 라이브, 3회").props.accessibilityRole).toBe("button");
    expect(command.root.findAllByType(Pressable)).toHaveLength(2);
  });

  it("supports BottomCTA loading copy and arbitrary secondary content", () => {
    const renderer = render(
      <BottomCTA
        primaryAction={{
          accessibilityLabel: "저장",
          label: "저장하기",
          loading: true,
          loadingLabel: "저장 중",
          onPress: vi.fn(),
          size: "large",
        }}
        secondaryAction={<Pressable accessibilityLabel="도움말" />}
        testID="save-actions"
      />,
    );
    expect(renderer.root.findAllByType(View).find(
      (node) => node.props.testID === "save-actions",
    )?.props.accessibilityRole).toBe("toolbar");
    const primary = renderer.root.findAllByType(Pressable).find(
      (node) => node.props.accessibilityLabel === "저장",
    );
    expect(primary?.props.accessibilityState).toMatchObject({ busy: true });
    expect(byLabel(renderer, "도움말")).toBeTruthy();
    expect(renderer.root.findAllByType(NativeText).some((node) => node.props.children === "저장 중"))
      .toBe(true);
    expect(flattenStyle(primary?.props.style({ pressed: false })).minHeight)
      .toBe(52);
    expect(bottomCtaRecipe.minHeight).toBeGreaterThanOrEqual(64);
  });

  it("makes Notice and EmptyState announcements explicit while retaining icon and upper slots", () => {
    const renderIcon = vi.fn(({ color, size }: Readonly<{ color: string; size: number }>) => (
      <View accessibilityLabel={`${color}:${size}`} testID="notice-icon" />
    ));
    const notice = render(
      <Notice
        announcement="assertive"
        description="확인해 주세요"
        renderIcon={renderIcon}
        title="주의"
        tone="attention"
      />,
    );
    const root = notice.root.findByProps({ accessibilityLiveRegion: "assertive" });
    expect(root.props.accessibilityRole).toBe("alert");
    expect(renderIcon).toHaveBeenCalledWith(expect.objectContaining({ tone: "attention" }));
    expect(notice.root.findByProps({ testID: "notice-icon" }).parent?.props)
      .toMatchObject({ importantForAccessibility: "no-hide-descendants" });

    const empty = render(
      <EmptyState
        align="upper"
        announcement="polite"
        description="필터를 바꿔보세요"
        title="결과 없음"
      />,
    );
    const emptyRoot = byLabel(empty, "결과 없음, 필터를 바꿔보세요");
    expect(flattenStyle(emptyRoot.props.style)).toMatchObject({ flexGrow: 1, justifyContent: "flex-start" });
    expect(empty.root.findAllByType(View).map((node) => flattenStyle(node.props.style)))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ flexGrow: 1 }),
        expect.objectContaining({ flexGrow: 3 }),
      ]));
  });

  it("owns grouped/plain List appearance and requires its localized name", () => {
    let surface = "";
    function Capture() {
      surface = useHjmNativeTheme().colors.surface;
      return (
        <List appearance="grouped" label="선수 목록">
          <ListRow title="홍길동" />
          <ListRow title="김민수" />
        </List>
      );
    }
    const renderer = render(<Capture />, { direction: "rtl" });
    const list = byLabel(renderer, "선수 목록");
    expect(flattenStyle(list.props.style)).toMatchObject({
      backgroundColor: surface,
      borderRadius: radius.lg,
      direction: "rtl",
      overflow: "hidden",
    });
    const divider = renderer.root.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).height === 1,
    );
    expect(flattenStyle(divider?.props.style)).toMatchObject({
      marginEnd: listRecipe.separators.indented!.insetEnd,
      marginStart: listRecipe.separators.indented!.insetStart,
    });
    expect(() => render(<List label="   "><ListRow title="행" /></List>))
      .toThrow(/label must not be empty/u);
  });

  it("composes Statistic names with product context", () => {
    const composeAccessibilityLabel = vi.fn(
      ({ contextLabel, valueText }: Readonly<{ contextLabel?: string; valueText: string }>) =>
        `${contextLabel}: ${valueText}`,
    );
    const renderer = render(
      <Statistic
        composeAccessibilityLabel={composeAccessibilityLabel}
        contextLabel="이번 시즌"
        descriptor={{ id: "average", label: "타율", value: ".328" }}
      />,
    );
    expect(byLabel(renderer, "이번 시즌: .328").props.accessible).toBe(true);
    expect(composeAccessibilityLabel).toHaveBeenCalledWith(expect.objectContaining({
      contextLabel: "이번 시즌",
      valueText: ".328",
    }));
  });

  it("measures nested Grid and DescriptionList width while explicit width stays authoritative", () => {
    const onLayoutResolved = vi.fn();
    const grid = render(
      <Grid
        columns={{ compact: 1, medium: 2 }}
        minColumnWidth={{ compact: 200 }}
        onLayoutResolved={onLayoutResolved}
        testID="grid"
      >
        <Text>하나</Text>
        <Text>둘</Text>
      </Grid>,
    );
    const gridRoot = grid.root.findAllByType(View).find(
      (node) => node.props.testID === "grid" && typeof node.props.onLayout === "function",
    );
    act(() => gridRoot?.props.onLayout({
      nativeEvent: { layout: { width: 320 } },
    }));
    expect(onLayoutResolved).toHaveBeenLastCalledWith(expect.objectContaining({
      columns: 1,
      columnWidth: 320,
      windowClass: "medium",
    }));

    const descriptor = {
      columns: 2 as const,
      items: [
        { id: "first", label: "첫째", value: "1" },
        { id: "second", label: "둘째", value: "2" },
      ],
    };
    const description = render(
      <DescriptionList descriptor={descriptor} label="상세" testID="description" />,
    );
    const descriptionRoot = description.root.findAllByType(View).find(
      (node) => node.props.testID === "description" && typeof node.props.onLayout === "function",
    );
    act(() => descriptionRoot?.props.onLayout({
      nativeEvent: { layout: { width: 320 } },
    }));
    expect(flattenStyle(byLabel(description, "첫째, 1").props.style).width).toBe(320);

    const explicit = render(
      <DescriptionList availableWidth={600} descriptor={descriptor} label="명시 폭" testID="explicit" />,
    );
    const explicitRoot = explicit.root.findAllByType(View).find(
      (node) => node.props.testID === "explicit" && typeof node.props.onLayout === "function",
    );
    act(() => explicitRoot?.props.onLayout({
      nativeEvent: { layout: { width: 240 } },
    }));
    expect(flattenStyle(byLabel(explicit, "첫째, 1").props.style).width)
      .toBe((600 - spacing.sm) / 2);
  });

  it("applies a controlled text scale once and leaves system scaling uncapped", () => {
    const controlled = render(<Text>확대 본문</Text>, { textScale: 1.5 });
    const controlledText = controlled.root.findByType(NativeText);
    expect(controlledText.props.allowFontScaling).toBe(false);
    expect(controlledText.props.maxFontSizeMultiplier).toBeUndefined();
    expect(flattenStyle(controlledText.props.style)).toMatchObject({
      fontSize: typography.body.fontSize * 1.5,
      lineHeight: typography.body.lineHeight * 1.5,
    });

    let system!: ReactTestRenderer;
    act(() => {
      system = create(
        <HjmNativeProvider reducedMotion theme="light">
          <Text>시스템 본문</Text>
        </HjmNativeProvider>,
      );
    });
    const systemText = system.root.findByType(NativeText);
    expect(systemText.props.allowFontScaling).toBe(true);
    expect(systemText.props.maxFontSizeMultiplier).toBeUndefined();
    expect(flattenStyle(systemText.props.style).fontSize).toBe(typography.body.fontSize);
  });

  it("places ToastRegion around safe areas and keyboard and animates with tone-icon adapters", () => {
    let controller: ToastRegionController | undefined;
    function Publisher() {
      controller = useToastRegion();
      return null;
    }
    const renderToneIcon = vi.fn(({ mark }: Readonly<{ mark: string }>) => (
      <View testID={`toast-icon-${mark}`} />
    ));
    const timing = vi.spyOn(Animated, "timing");
    const renderer = render(
      <ToastRegion
        avoidKeyboard
        keyboardOffset={12}
        placement="bottom-end"
        renderToneIcon={renderToneIcon}
        safeAreaInsets={{ bottom: 8, end: 6, start: 4 }}
      >
        <View testID="content" />
        <Publisher />
      </ToastRegion>,
      { reducedMotion: false },
    );
    act(() => {
      controller?.show({
        closeLabel: "알림 닫기",
        description: "저장했습니다",
        durationMs: null,
        id: "saved",
        tone: "success",
      });
    });
    expect(renderToneIcon).toHaveBeenCalledWith(expect.objectContaining({
      mark: toastRecipe.tones.success.mark,
      tone: "success",
    }));
    expect(timing.mock.calls.some(([, configuration]) =>
      configuration.duration === toastRecipe.transition.native.enter.duration,
    )).toBe(true);

    const keyboard = Keyboard as unknown as {
      __emit(event: "keyboardDidShow" | "keyboardDidHide", height?: number): void;
    };
    act(() => keyboard.__emit("keyboardDidShow", 120));
    const viewport = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return node.props.pointerEvents === "box-none" && style.position === "absolute";
    });
    expect(flattenStyle(viewport?.props.style)).toMatchObject({
      alignItems: "flex-end",
      bottom: toastRecipe.viewport.inset + 8 + 120 + 12,
      end: toastRecipe.viewport.inset + 6,
      flexDirection: "column-reverse",
      start: toastRecipe.viewport.inset + 4,
    });
    act(() => {
      controller?.dismiss("saved", "programmatic");
    });
    expect(timing.mock.calls.some(([, configuration]) =>
      configuration.duration === toastRecipe.transition.native.exit.duration,
    )).toBe(true);
  });

  it("removes Toast motion and maps physical safe areas to logical RTL edges", () => {
    let controller: ToastRegionController | undefined;
    function Publisher() {
      controller = useToastRegion();
      return null;
    }
    const timing = vi.spyOn(Animated, "timing");
    const renderer = render(
      <ToastRegion
        placement="top-start"
        safeAreaInsets={{ left: 5, right: 9, top: 7 }}
      >
        <Publisher />
      </ToastRegion>,
      { direction: "rtl", reducedMotion: true },
    );
    act(() => {
      controller?.show({
        closeLabel: "알림 닫기",
        description: "완료",
        durationMs: null,
        id: "reduced",
      });
    });
    expect(timing).not.toHaveBeenCalled();
    const viewport = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return node.props.pointerEvents === "box-none" && style.position === "absolute";
    });
    expect(flattenStyle(viewport?.props.style)).toMatchObject({
      alignItems: "flex-start",
      end: toastRecipe.viewport.inset + 5,
      start: toastRecipe.viewport.inset + 9,
      top: toastRecipe.viewport.inset + 7,
    });
  });

  it("renders Section content without forcing an empty header", () => {
    const renderer = render(<Section><View testID="section-content" /></Section>);
    expect(renderer.root.findByProps({ testID: "section-content" })).toBeTruthy();
    expect(renderer.root.findAll((node) => node.props.accessibilityRole === "header"))
      .toHaveLength(0);
  });
});
