import { createRef } from "react";
import { resolveDesignSystemProviderValue } from "@hjm/design-contracts/components/design-system-provider";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Pressable, Text as NativeText, View } from "react-native";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  Card,
  Grid,
  HjmNativeProvider,
  IconButton,
  Stack,
  Surface,
  Tag,
  Text,
  useHjmNativeTheme,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderWithProvider(
  node: React.ReactNode,
  direction: "ltr" | "rtl" = "ltr",
): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider direction={direction} reducedMotion theme="light">
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

describe("Native core normalization", () => {
  it("accepts a pre-resolved product palette without re-resolving environment axes", () => {
    const canonical = resolveDesignSystemProviderValue(
      { direction: "rtl", reducedMotion: true, textScale: 1.25, theme: "light" },
      { systemTheme: "dark" },
    );
    const productValue = {
      ...canonical,
      palette: {
        ...canonical.palette,
        theme: { ...canonical.palette.theme, primary: "#123456" },
      },
    };
    function Probe() {
      const theme = useHjmNativeTheme();
      return (
        <View
          testID="provider-value"
          accessibilityLabel={`${theme.colors.primary}:${theme.environment.direction}:${theme.environment.textScale}`}
        />
      );
    }
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider value={productValue}>
          <Probe />
        </HjmNativeProvider>,
      );
    });
    expect(renderer!.root.findByProps({ testID: "provider-value" }).props.accessibilityLabel)
      .toBe("#123456:rtl:1.25");
  });

  it("delegates inline RTL reversal to Yoga while preserving block and caller styles", () => {
    const ltr = renderWithProvider(<Stack axis="inline" testID="ltr" />, "ltr");
    const rtl = renderWithProvider(
      <View style={{ direction: "ltr" }}>
        <Stack axis="inline" testID="rtl" />
        <Stack axis="block" testID="block" />
        <Stack
          axis="inline"
          style={{ direction: "ltr", flexDirection: "row-reverse", gap: 99 }}
          testID="caller-final"
        />
      </View>,
      "rtl",
    );
    const styleFor = (renderer: ReactTestRenderer, testID: string) =>
      flattenStyle(
        renderer.root.findAllByType(View).find((node) => node.props.testID === testID)?.props.style,
      );

    expect(styleFor(ltr, "ltr")).toMatchObject({ direction: "ltr", flexDirection: "row" });
    expect(styleFor(rtl, "rtl")).toMatchObject({ direction: "rtl", flexDirection: "row" });
    expect(styleFor(rtl, "block")).toMatchObject({ direction: "rtl", flexDirection: "column" });
    expect(styleFor(rtl, "caller-final")).toMatchObject({
      direction: "ltr",
      flexDirection: "row-reverse",
      gap: 99,
    });
  });

  it("forwards the Native Text instance and keeps product props and style final", () => {
    const nativeTextInstance = { measure: vi.fn() } as unknown as NativeText;
    const ref = createRef<NativeText>();
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider direction="rtl" reducedMotion theme="light">
          <Text
            accessibilityLabel="상품명"
            allowFontScaling={false}
            maxFontSizeMultiplier={3}
            ref={ref}
            style={{
              color: "#123456",
              fontFamily: "Product Sans",
              fontSize: 31,
              textAlign: "center",
            }}
          >
            상품명
          </Text>
        </HjmNativeProvider>,
        {
          createNodeMock: (element) =>
            element.type === "Text" ? nativeTextInstance : {},
        },
      );
    });

    expect(ref.current).toBe(nativeTextInstance);
    const text = renderer!.root.findByType(NativeText);
    expect(text.props).toMatchObject({
      accessibilityLabel: "상품명",
      allowFontScaling: false,
      maxFontSizeMultiplier: 3,
    });
    expect(flattenStyle(text.props.style)).toMatchObject({
      color: "#123456",
      fontFamily: "Product Sans",
      fontSize: 31,
      textAlign: "center",
    });
  });

  it("keeps accessible Text scaling defaults", () => {
    const renderer = renderWithProvider(<Text>기본 텍스트</Text>);
    expect(renderer.root.findByType(NativeText).props).toMatchObject({
      allowFontScaling: true,
    });
    expect(renderer.root.findByType(NativeText).props.maxFontSizeMultiplier).toBeUndefined();
  });

  it("uses canonical Text and Stack axes while retaining direction as an alias", () => {
    const renderer = renderWithProvider(
      <>
        <Text emphasis="strong" tone="subtle">본문</Text>
        <Stack axis="inline" align="end" justify="between"><Text>축</Text></Stack>
        <Stack direction="row"><Text>호환</Text></Stack>
      </>,
    );
    const nativeTexts = renderer.root.findAllByType(NativeText);
    expect(flattenStyle(nativeTexts[0]!.props.style)).toMatchObject({
      color: "#6b7684",
      fontWeight: "700",
    });
    const stacks = renderer.root.findAllByType(View).filter((node) => {
      const style = flattenStyle(node.props.style);
      return style.gap === 16 && style.flexWrap === "nowrap";
    });
    expect(flattenStyle(stacks[0]!.props.style)).toMatchObject({
      alignItems: "flex-end",
      flexDirection: "row",
      justifyContent: "space-between",
    });
    expect(flattenStyle(stacks[1]!.props.style).flexDirection).toBe("row");
  });

  it("matches Surface optional-border and geometry semantics", () => {
    const renderer = renderWithProvider(
      <>
        <Surface tone="accent"><Text>무테</Text></Surface>
        <Surface tone="accent" bordered padding="md" radius="sm"><Text>테두리</Text></Surface>
      </>,
    );
    const surfaces = renderer.root.findAllByType(View).filter(
      (node) => flattenStyle(node.props.style).backgroundColor === "#c9e2ff",
    );
    expect(flattenStyle(surfaces[0]!.props.style)).toMatchObject({
      borderColor: "transparent",
      borderRadius: 16,
      padding: 0,
    });
    expect(flattenStyle(surfaces[1]!.props.style)).toMatchObject({
      borderColor: "rgba(3, 105, 161, 0.3)",
      borderRadius: 8,
      padding: 16,
    });
  });

  it("keeps pending Button focusable to accessibility while removing activation", () => {
    const onPress = vi.fn();
    const onLongPress = vi.fn();
    const renderer = renderWithProvider(
      <Button loading onLongPress={onLongPress} onPress={onPress}>저장</Button>,
    );
    const button = renderer.root.findByType(Pressable);
    expect(button.props.disabled).toBe(false);
    expect(button.props.accessibilityState).toEqual({ disabled: false, busy: true });
    expect(button.props.onPress).toBeTypeOf("function");
    act(() => button.props.onPress());
    act(() => button.props.onLongPress());
    expect(onPress).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    expect(renderer.root.findByType(ActivityIndicator)).toBeDefined();
    expect(button.props.accessibilityLabel).toBe("저장");
  });

  it("forwards action host refs, preserves caller state, and leaves rich Button content unwrapped", () => {
    const buttonNode = { focus: vi.fn() } as unknown as View;
    const iconButtonNode = { focus: vi.fn() } as unknown as View;
    const buttonRef = createRef<View>();
    const iconButtonRef = createRef<View>();
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <HjmNativeProvider reducedMotion theme="light">
          <Button
            accessibilityLabel="복합 버튼"
            accessibilityState={{ expanded: true }}
            ref={buttonRef}
          >
            <View testID="rich-content" />
          </Button>
          <IconButton
            accessibilityState={{ selected: true }}
            label="아이콘 버튼"
            ref={iconButtonRef}
          >
            <View testID="icon-content" />
          </IconButton>
        </HjmNativeProvider>,
        {
          createNodeMock: (element) => {
            const props = element.props as { accessibilityLabel?: string };
            return props.accessibilityLabel === "복합 버튼"
              ? buttonNode
              : props.accessibilityLabel === "아이콘 버튼"
                ? iconButtonNode
                : {};
          },
        },
      );
    });
    expect(buttonRef.current).toBe(buttonNode);
    expect(iconButtonRef.current).toBe(iconButtonNode);
    const actions = renderer!.root.findAllByType(Pressable);
    expect(actions[0]!.props.accessibilityState).toEqual({
      expanded: true,
      disabled: false,
      busy: false,
    });
    expect(actions[1]!.props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
      busy: false,
    });
    expect(actions[0]!.findAllByType(NativeText)).toHaveLength(0);
    act(() => renderer?.unmount());
  });

  it("uses the shared IconButton axes and keeps pending activation separate from disabled", () => {
    const onPress = vi.fn();
    const onLongPress = vi.fn();
    const renderer = renderWithProvider(
      <IconButton
        label="새로고침"
        loading
        onLongPress={onLongPress}
        onPress={onPress}
        shape="circle"
        size="small"
        tone="ghost"
      >
        <Text>↻</Text>
      </IconButton>,
    );
    const button = renderer.root.findByType(Pressable);
    expect(button.props.disabled).toBe(false);
    expect(button.props.accessibilityLabel).toBe("새로고침");
    expect(button.props.accessibilityState).toEqual({ disabled: false, busy: true });
    expect(button.props.hitSlop).toBe(4);
    expect(flattenStyle(button.props.style({ pressed: false }))).toMatchObject({
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderRadius: 999,
      height: 36,
      opacity: 1,
      width: 36,
    });
    act(() => button.props.onPress());
    act(() => button.props.onLongPress());
    expect(onPress).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    expect(renderer.root.findByType(ActivityIndicator).props.color).toBe("#4e5968");
  });

  it("accepts renderer-neutral Grid props while retaining descriptor compatibility", () => {
    const onLayoutResolved = vi.fn();
    const renderer = renderWithProvider(
      <Grid
        availableWidth={320}
        columns={{ compact: 2 }}
        gap={{ compact: "sm" }}
        minColumnWidth={{ compact: 120 }}
        onLayoutResolved={onLayoutResolved}
      >
        <Text>하나</Text>
        <Text>둘</Text>
      </Grid>,
    );
    expect(onLayoutResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: 2,
        columnGap: 12,
        columnWidth: 154,
        requestedColumns: 2,
        rowGap: 12,
        windowClass: "medium",
      }),
    );
    const items = renderer.root.findAllByType(View).filter(
      (node) => flattenStyle(node.props.style).width === 154,
    );
    expect(items).toHaveLength(2);

    expect(() =>
      renderWithProvider(
        <Grid availableWidth={320} descriptor={{ columns: { compact: 1 } }} />,
      ),
    ).not.toThrow();
  });

  it("isolates deprecated content aliases to an explicit compatibility regression", () => {
    const renderer = renderWithProvider(
      <>
        <Button label="이전 버튼" />
        <Tag label="이전 태그" />
        <IconButton accessibilityLabel="이전 아이콘" icon={<Text>×</Text>} />
      </>,
    );
    const labels = renderer.root.findAllByType(NativeText).map(
      (node) => node.props.children,
    );
    expect(labels).toEqual(expect.arrayContaining(["이전 버튼", "이전 태그", "×"]));
    expect(renderer.root.findAllByType(Pressable)[1]?.props.accessibilityLabel).toBe(
      "이전 아이콘",
    );
  });

  it("renders Tag independently from Badge and shares Card slots/defaults", () => {
    const renderer = renderWithProvider(
      <>
        <Tag tone="attention">주의</Tag>
        <Card
          actions={<Button>확인</Button>}
          description="설명"
          media={<Text>미디어</Text>}
          selected
          title="제목"
        >
          <Text>내용</Text>
        </Card>
      </>,
    );
    const tag = renderer.root.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).minHeight === 20,
    );
    expect(flattenStyle(tag?.props.style)).toMatchObject({
      borderRadius: 8,
      paddingHorizontal: 4,
    });
    const selectedCard = renderer.root.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).backgroundColor === "#c9e2ff",
    );
    expect(flattenStyle(selectedCard?.props.style)).toMatchObject({
      borderColor: "rgba(3, 105, 161, 0.3)",
      borderRadius: 16,
      padding: 0,
    });
    const heading = renderer.root.find(
      (node) => node.props.accessibilityRole === "header",
    );
    expect(heading.props.children).toBe("제목");
  });
});
