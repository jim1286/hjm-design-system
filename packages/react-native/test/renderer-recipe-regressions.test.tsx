import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import {
  imageRecipe,
  nativeResizeModes,
} from "@hjmds/design-contracts/components/image";
import { glyph, radius } from "@hjmds/design-contracts/foundations";
import {
  accordionRecipe,
  badgeRecipe,
  chipRecipe,
  emptyStateRecipe,
  listRowRecipe,
  progressRecipe,
  sectionRecipe,
  statisticRecipe,
  topBarRecipe,
} from "@hjmds/design-contracts/recipes";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import {
  Image as NativeImage,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Accordion,
  Badge,
  Chip,
  CounterBadge,
  EmptyState,
  HjmNativeProvider,
  Image,
  Layout,
  ListRow,
  Progress,
  Section,
  Statistic,
  Text,
  TopBar,
  useHjmNativeTheme,
  type HjmNativeTheme,
  type CanonicalImageRenderProps,
  type ImageRenderProps,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const lightValue = resolveDesignSystemProviderValue(
  { direction: "ltr", reducedMotion: true, textScale: 1, theme: "light" },
  { systemTheme: "dark" },
);

// This declaration is intentionally never rendered. It makes the public prop
// union fail closed if `value` ever becomes combinable with unresolved axes.
// @ts-expect-error `value` is mutually exclusive with `theme` and the other axes.
const providerAxisCollision: ComponentProps<typeof HjmNativeProvider> = { children: null, theme: "dark", value: lightValue };
void providerAxisCollision;

function render(
  node: ReactNode,
  value = lightValue,
): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider value={value}>{node}</HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (!Array.isArray(style)) return style as Record<string, unknown>;
  return Object.assign({}, ...style.map(flattenStyle));
}

function byLabel(renderer: ReactTestRenderer, label: string): ReactTestInstance {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

function copy(renderer: ReactTestRenderer, value: string): ReactTestInstance {
  return renderer.root.findAllByType(Text).find((node) => node.props.children === value)!;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Native provider and structural renderer regressions", () => {
  it("preserves the supplied product palette and every resolved environment axis by reference", () => {
    const productValue = {
      ...lightValue,
      environment: {
        ...lightValue.environment,
        direction: "rtl" as const,
        reducedMotion: false,
        textScale: 1.35,
      },
      palette: {
        ...lightValue.palette,
        theme: {
          ...lightValue.palette.theme,
          primary: "#123456",
          surfaceDefault: "#fefefe",
        },
      },
    };
    let captured: HjmNativeTheme | undefined;
    function Probe() {
      captured = useHjmNativeTheme();
      return <View testID="provider-probe" />;
    }

    render(<Probe />, productValue);

    expect(captured?.environment).toBe(productValue.environment);
    expect(captured?.palette).toBe(productValue.palette);
    expect(captured?.colors).toBe(productValue.palette.theme);
    expect(captured?.colors).toMatchObject({ primary: "#123456", surfaceDefault: "#fefefe" });
  });

  it("keeps persistent Layout regions in source order without inventing a Native bypass link", () => {
    const renderer = render(
      <Layout
        footer={<View testID="footer-content" />}
        footerProps={{ testID: "footer-region" }}
        header={<View testID="header-content" />}
        headerProps={{ testID: "header-region" }}
        mainProps={{ testID: "main-region" }}
        sidebar={{
          children: <View testID="sidebar-content" />,
          containerProps: { testID: "sidebar-region" },
          label: "주요 탐색",
          mode: "persistent",
          role: "navigation",
        }}
        testID="layout-root"
      >
        <View testID="main-content" />
      </Layout>,
    );
    const layout = renderer.root.findAllByType(View)
      .find((node) => node.props.testID === "layout-root")!;
    const regionIds = new Set(["header-region", "sidebar-region", "main-region", "footer-region"]);
    const order = layout.findAll((node) => regionIds.has(node.props.testID as string))
      .map((node) => node.props.testID)
      .filter((id, index, ids) => id !== ids[index - 1]);

    expect(order).toEqual(["header-region", "sidebar-region", "main-region", "footer-region"]);
    expect(byLabel(renderer, "주요 탐색").props.accessibilityRole).toBeUndefined();
    expect(() => render(
      <Layout header={<View />}><View /></Layout>,
    )).not.toThrow();
  });

  it("passes an overlay sidebar through its owner without changing region order or lifecycle", () => {
    const renderOverlay = vi.fn((sidebar: ReactNode) => (
      <View accessibilityViewIsModal testID="overlay-region">{sidebar}</View>
    ));
    const renderer = render(
      <Layout
        footer={<View />}
        footerProps={{ testID: "footer-region" }}
        header={<View />}
        headerProps={{ testID: "header-region" }}
        mainProps={{ testID: "main-region" }}
        sidebar={{
          children: <View testID="filter-content" />,
          containerProps: { testID: "sidebar-region" },
          label: "필터",
          mode: "overlay",
          renderOverlay,
          role: "complementary",
        }}
        testID="layout-root"
      >
        <View />
      </Layout>,
    );
    const passedSidebar = renderOverlay.mock.calls[0]?.[0];
    expect(renderOverlay).toHaveBeenCalledOnce();
    expect(isValidElement<{ accessibilityLabel?: string }>(passedSidebar)).toBe(true);
    if (isValidElement<{ accessibilityLabel?: string }>(passedSidebar)) {
      expect(passedSidebar.props.accessibilityLabel).toBe("필터");
    }
    expect(renderer.root.findByProps({ testID: "overlay-region" }).props.accessibilityViewIsModal)
      .toBe(true);
    const layout = renderer.root.findAllByType(View)
      .find((node) => node.props.testID === "layout-root")!;
    const regionIds = new Set([
      "header-region",
      "overlay-region",
      "sidebar-region",
      "main-region",
      "footer-region",
    ]);
    expect(layout.findAll((node) => regionIds.has(node.props.testID as string))
      .map((node) => node.props.testID)
      .filter((id, index, ids) => id !== ids[index - 1]))
      .toEqual([
        "header-region",
        "overlay-region",
        "sidebar-region",
        "main-region",
        "footer-region",
      ]);
  });

  it("preserves optimized Image host props and owns the accessible error fallback lifecycle", () => {
    let adapterProps: ImageRenderProps | undefined;
    const renderImage = vi.fn((props: ImageRenderProps) => {
      adapterProps = props;
      return <View testID="optimized-host" />;
    });
    const onError = vi.fn();
    const imageStyle = { height: 120, width: 180 } as const;
    const renderer = render(
      <Image
        accessibilityLabel="대표 이미지"
        blurRadius={2}
        containerStyle={{ minHeight: 120 }}
        fallback={<Text>이미지 대체</Text>}
        onError={onError}
        renderImage={renderImage}
        resizeMode="cover"
        source={{ uri: "https://example.com/cover.png" }}
        style={imageStyle}
      />,
    );

    expect(adapterProps).toMatchObject({
      accessible: true,
      accessibilityLabel: "대표 이미지",
      accessibilityRole: "image",
      nativeProps: { blurRadius: 2, resizeMode: "cover" },
      source: { uri: "https://example.com/cover.png" },
      style: imageStyle,
    });
    const event = { nativeEvent: { error: "network" } } as never;
    act(() => adapterProps?.onError(event));
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(event);
    expect(renderImage).toHaveBeenCalledOnce();
    const fallback = renderer.root.findAllByType(View).find(
      (node) => node.props.accessibilityLabel === "대표 이미지" && node.props.accessible === true,
    )!;
    expect(fallback.props).toMatchObject({ accessible: true, accessibilityRole: "image" });
    expect(renderer.root.findAllByType(View).some(
      (node) => flattenStyle(node.props.style).minHeight === 120,
    )).toBe(true);
    expect(renderer.root.findAll((node) => node.children.includes("이미지 대체"))).not.toHaveLength(0);

    let decorativeProps: ImageRenderProps | undefined;
    render(
      <Image
        decorative
        renderImage={(props) => {
          decorativeProps = props;
          return <View />;
        }}
        source={{ uri: "https://example.com/texture.png" }}
      />,
    );
    expect(decorativeProps?.accessible).toBe(false);
    expect(decorativeProps?.accessibilityLabel).toBeUndefined();
    expect(decorativeProps?.accessibilityRole).toBeUndefined();
  });

  it("resolves the canonical Image descriptor into an intrinsic frame and transport adapter", () => {
    let adapterProps: CanonicalImageRenderProps | undefined;
    const onLoad = vi.fn();
    const onLoadStatusChange = vi.fn();
    const sourceAdapter = vi.fn((descriptor: CanonicalImageRenderProps["descriptor"]) => ({
      headers: { Authorization: "asset-token" },
      uri: descriptor.src,
    }));
    const renderer = render(
      <Image
        accessibilityLabel="2026 시즌 기록 차트"
        decorative={false}
        fit="fill"
        height={400}
        onLoad={onLoad}
        onLoadStatusChange={onLoadStatusChange}
        renderImage={(props) => {
          adapterProps = props;
          return <View testID="canonical-image-host" />;
        }}
        sourceAdapter={sourceAdapter}
        src="https://cdn.example.com/chart.png"
        width={800}
      />,
    );

    expect(adapterProps).toMatchObject({
      accessible: true,
      accessibilityLabel: "2026 시즌 기록 차트",
      accessibilityRole: "image",
      descriptor: {
        src: "https://cdn.example.com/chart.png",
        width: 800,
        height: 400,
        fit: "fill",
        decorative: false,
      },
      fit: "fill",
      height: 400,
      legacySource: false,
      nativeProps: { resizeMode: nativeResizeModes.fill },
      resizeMode: nativeResizeModes.fill,
      source: {
        headers: { Authorization: "asset-token" },
        uri: "https://cdn.example.com/chart.png",
      },
      src: "https://cdn.example.com/chart.png",
      status: "loading",
      width: 800,
    });
    const root = renderer.root.findAllByType(View).find((node) => {
      const resolved = flattenStyle(node.props.style);
      return resolved.width === 800 && resolved.aspectRatio === 2;
    })!;
    expect(flattenStyle(root.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(
        imageRecipe.placeholder.background,
        lightValue.palette,
      ),
      borderRadius: radius[imageRecipe.radius],
      overflow: "hidden",
    });

    const event = { nativeEvent: { source: adapterProps!.source } } as never;
    act(() => adapterProps?.onLoad(event));
    expect(onLoad).toHaveBeenCalledWith(event);
    expect(onLoadStatusChange).toHaveBeenLastCalledWith("loaded");
    expect(adapterProps?.status).toBe("loaded");
    expect(sourceAdapter).toHaveBeenCalledOnce();
  });

  it("supplies an accessible built-in fallback and recovers when canonical src changes", () => {
    let adapterProps: CanonicalImageRenderProps | undefined;
    const onLoadStatusChange = vi.fn();
    const renderCanonical = (src: string) => (
      <HjmNativeProvider value={lightValue}>
        <Image
          accessibilityLabel="경기 포스터"
          decorative={false}
          height={180}
          onLoadStatusChange={onLoadStatusChange}
          renderImage={(props) => {
            adapterProps = props;
            return <View testID="canonical-image-host" />;
          }}
          src={src}
          width={320}
        />
      </HjmNativeProvider>
    );
    const renderer = render(
      <Image
        accessibilityLabel="경기 포스터"
        decorative={false}
        height={180}
        onLoadStatusChange={onLoadStatusChange}
        renderImage={(props) => {
          adapterProps = props;
          return <View testID="canonical-image-host" />;
        }}
        src="https://cdn.example.com/missing.png"
        width={320}
      />,
    );

    act(() => adapterProps?.reportError({ code: "404" }));
    const fallback = renderer.root.findAllByType(View).find(
      (node) => node.props.accessibilityLabel === "경기 포스터",
    )!;
    expect(fallback.props).toMatchObject({
      accessible: true,
      accessibilityRole: "image",
    });
    expect(renderer.root.findAll((node) => node.children.includes("!"))).not.toHaveLength(0);
    expect(onLoadStatusChange).toHaveBeenLastCalledWith("error");
    expect(renderer.root.findAllByProps({ testID: "canonical-image-host" })).toHaveLength(0);

    act(() => renderer.update(renderCanonical("https://cdn.example.com/recovered.png")));
    expect(renderer.root.findAllByProps({ testID: "canonical-image-host" }).length)
      .toBeGreaterThan(0);
    expect(adapterProps).toMatchObject({
      src: "https://cdn.example.com/recovered.png",
      status: "loading",
    });

    act(() => renderer.update(renderCanonical("https://cdn.example.com/missing.png")));
    expect(renderer.root.findAllByProps({ testID: "canonical-image-host" }).length)
      .toBeGreaterThan(0);
    expect(adapterProps).toMatchObject({
      src: "https://cdn.example.com/missing.png",
      status: "loading",
    });
  });

  it("uses recipe fit on the built-in host and defaults canonical images to decorative", () => {
    const renderer = render(
      <Image
        fit="contain"
        height={90}
        src="https://cdn.example.com/texture.png"
        width={160}
      />,
    );
    const asset = renderer.root.findByType(NativeImage);
    expect(asset.props).toMatchObject({
      accessible: false,
      resizeMode: nativeResizeModes.contain,
      source: { uri: "https://cdn.example.com/texture.png" },
    });
    expect(asset.props.style).toEqual([StyleSheet.absoluteFill, undefined]);
  });

  it("hides a decorative CounterBadge subtree and rejects an explicitly empty name", () => {
    const renderer = render(<CounterBadge count={128} max={99} />);
    const badge = renderer.root.findAllByType(View).find(
      (node) => node.props.importantForAccessibility === "no-hide-descendants",
    )!;
    expect(badge.props).toMatchObject({
      accessibilityLabel: undefined,
      accessibilityRole: undefined,
      accessible: false,
      importantForAccessibility: "no-hide-descendants",
    });
    expect(badge.findByType(Text).props.accessible).toBe(false);
    expect(() => render(<CounterBadge accessibilityLabel="   " count={1} />))
      .toThrow(/must not be empty/u);
  });
});

describe("Native canonical recipe bindings", () => {
  it("binds Badge tone, size, copy, and leading/label slots to badgeRecipe", () => {
    const renderer = render(
      <Badge
        label="위험"
        labelStyle={{ letterSpacing: 2 }}
        leading={<View testID="badge-leading" />}
        size="small"
        tone="danger"
      />,
    );
    const badge = byLabel(renderer, "위험");
    expect(badge.props.accessible).toBe(true);
    const tone = badgeRecipe.tones.danger;
    const metrics = badgeRecipe.sizes.small;
    expect(flattenStyle(badge.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(tone.background, lightValue.palette),
      borderColor: resolveColorReference(tone.border!, lightValue.palette),
      borderRadius: radius[badgeRecipe.radius],
      borderWidth: badgeRecipe.borderWidth,
      gap: metrics.gap,
      minHeight: metrics.minHeight,
      paddingHorizontal: metrics.paddingHorizontal,
    });
    const leading = renderer.root.findByProps({ testID: "badge-leading" }).parent;
    expect(leading?.props).toMatchObject({
      accessible: false,
      importantForAccessibility: "no-hide-descendants",
    });
    const label = copy(renderer, "위험");
    expect(label.props).toMatchObject({
      accessible: false,
      emphasis: "strong",
      variant: metrics.textVariant,
    });
    expect(flattenStyle(label.props.style)).toMatchObject({
      color: resolveColorReference(tone.content, lightValue.palette),
      letterSpacing: 2,
    });
  });

  it("binds a selectable Chip to recipe metrics/colors and forwards the Native press event", () => {
    const onPress = vi.fn();
    const renderSelectionIndicator = vi.fn((props: { selected: boolean; color: string; size: number }) => (
      <View testID="chip-indicator" {...props} />
    ));
    const renderer = render(
      <Chip
        indicatorStyle={{ marginStart: 1 }}
        label="인기"
        labelStyle={{ letterSpacing: 1 }}
        leading={<View testID="chip-leading" />}
        leadingStyle={{ marginStart: 2 }}
        onPress={onPress}
        renderSelectionIndicator={renderSelectionIndicator}
        selected
        selectionMode="multiple"
        size="medium"
        trailing={<View testID="chip-trailing" />}
        trailingStyle={{ marginEnd: 3 }}
      />,
    );
    const chip = byLabel(renderer, "인기");
    const metrics = chipRecipe.sizes.medium;
    const selected = chipRecipe.states.selected;
    expect(chip.props).toMatchObject({
      accessibilityRole: "checkbox",
      accessibilityState: { checked: true, disabled: false },
      hitSlop: metrics.hitSlop,
    });
    expect(flattenStyle(chip.props.style({ pressed: false }))).toMatchObject({
      backgroundColor: resolveColorReference(selected.background, lightValue.palette),
      borderColor: resolveColorReference(selected.border, lightValue.palette),
      borderRadius: radius[chipRecipe.radius],
      borderWidth: chipRecipe.borderWidth,
      gap: metrics.gap,
      height: metrics.height,
      paddingHorizontal: metrics.paddingHorizontal,
    });
    expect(flattenStyle(chip.props.style({ pressed: true })).opacity)
      .toBe(chipRecipe.states.pressedOpacity);
    expect(renderSelectionIndicator).toHaveBeenCalledWith({
      color: resolveColorReference(chipRecipe.selectionIndicator.color, lightValue.palette),
      selected: true,
      size: glyph[chipRecipe.selectionIndicator.glyph],
    });
    expect(flattenStyle(renderer.root.findByProps({ testID: "chip-indicator" }).parent?.props.style))
      .toMatchObject({ marginStart: 1 });
    expect(flattenStyle(renderer.root.findByProps({ testID: "chip-leading" }).parent?.props.style))
      .toMatchObject({ marginStart: 2 });
    expect(flattenStyle(renderer.root.findByProps({ testID: "chip-trailing" }).parent?.props.style))
      .toMatchObject({ marginEnd: 3 });
    const label = copy(renderer, "인기");
    expect(label.props.variant).toBe(metrics.textVariant);
    expect(flattenStyle(label.props.style)).toMatchObject({
      color: resolveColorReference(selected.content, lightValue.palette),
      fontWeight: chipRecipe.label.selectedFontWeight,
      letterSpacing: 1,
    });

    const event = { nativeEvent: { locationX: 17 } } as GestureResponderEvent;
    act(() => chip.props.onPress(event));
    expect(onPress).toHaveBeenCalledWith(false, event);
  });

  it("binds ListRow density and state colors while preserving caller accessibility state and slots", () => {
    const renderer = render(
      <ListRow
        accessibilityState={{ expanded: true }}
        density="compact"
        description="상세 설명"
        descriptionStyle={{ letterSpacing: 1 }}
        leading={<View testID="row-leading" />}
        onPress={vi.fn()}
        selected
        title="선택된 행"
        titleStyle={{ textDecorationLine: "underline" }}
        trailing={<View testID="row-trailing" />}
      />,
    );
    const row = byLabel(renderer, "선택된 행, 상세 설명");
    const metrics = listRowRecipe.density.compact;
    expect(row.props.accessibilityState).toEqual({ disabled: false, expanded: true, selected: true });
    expect(flattenStyle(row.props.style({ pressed: false }))).toMatchObject({
      backgroundColor: resolveColorReference(
        listRowRecipe.states.selectedBackground,
        lightValue.palette,
      ),
      gap: listRowRecipe.gap,
      minHeight: metrics.twoLineMinHeight,
      paddingHorizontal: metrics.paddingHorizontal,
      paddingVertical: metrics.paddingVertical,
    });
    expect(flattenStyle(row.props.style({ pressed: true }))).toMatchObject({
      backgroundColor: resolveColorReference(
        listRowRecipe.states.pressedBackground,
        lightValue.palette,
      ),
    });
    expect(renderer.root.findByProps({ testID: "row-leading" }).parent?.props.accessible).toBe(false);
    expect(renderer.root.findByProps({ testID: "row-trailing" }).parent?.props.accessible).toBe(false);
    const title = copy(renderer, "선택된 행");
    expect(title.props.variant).toBe(listRowRecipe.title.textVariant);
    expect(flattenStyle(title.props.style)).toMatchObject({
      color: resolveColorReference(listRowRecipe.title.color, lightValue.palette),
      fontWeight: listRowRecipe.title.fontWeight,
      textDecorationLine: "underline",
    });
    const description = copy(renderer, "상세 설명");
    expect(description.props.variant).toBe(listRowRecipe.description.textVariant);
    expect(flattenStyle(description.props.style)).toMatchObject({
      color: resolveColorReference(listRowRecipe.description.color, lightValue.palette),
      letterSpacing: 1,
    });
  });

  it("binds Statistic density/surface presentation and exposes the semantic trend adapter", () => {
    const renderTrendMark = vi.fn((props: { name: string; color: string; size: number }) => (
      <View testID="trend-mark" {...props} />
    ));
    const renderer = render(
      <Statistic
        density="compact"
        descriptor={{
          hint: "세전 금액",
          id: "revenue",
          label: "매출",
          prefix: "₩",
          suffix: "원",
          trend: { direction: "up", label: "전주 대비 증가", tone: "success" },
          value: "12,000",
        }}
        hintStyle={{ letterSpacing: 1 }}
        presentation="surface"
        renderTrendMark={renderTrendMark}
        valueStyle={{ fontSize: 31 }}
      />,
    );
    const root = byLabel(renderer, "매출, ₩12,000원, 전주 대비 증가, 세전 금액");
    const density = statisticRecipe.density.compact;
    const surface = statisticRecipe.presentations.surface;
    expect(root.props.accessible).toBe(true);
    expect(flattenStyle(root.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(surface.background!, lightValue.palette),
      borderColor: resolveColorReference(surface.border!, lightValue.palette),
      borderRadius: radius[surface.radius],
      borderWidth: surface.borderWidth,
      gap: density.gap,
      minWidth: 0,
      padding: density.padding,
    });
    expect(renderTrendMark).toHaveBeenCalledWith({
      color: resolveColorReference(statisticRecipe.trend.tones.success, lightValue.palette),
      name: statisticRecipe.trend.marks.up,
      size: glyph.sm,
    });
    expect(renderer.root.findByProps({ testID: "trend-mark" }).parent?.props.accessible).toBe(false);
    const label = copy(renderer, "매출");
    expect(label.props.variant).toBe(density.labelVariant);
    expect(flattenStyle(label.props.style)).toMatchObject({
      color: resolveColorReference(statisticRecipe.label.color, lightValue.palette),
      fontWeight: statisticRecipe.label.fontWeight,
    });
    const value = copy(renderer, "12,000");
    expect(value.props.variant).toBe(density.valueVariant);
    expect(flattenStyle(value.props.style)).toMatchObject({
      color: resolveColorReference(statisticRecipe.value.color, lightValue.palette),
      flexShrink: 1,
      fontSize: 31,
      fontVariant: ["tabular-nums"],
      fontWeight: statisticRecipe.value.fontWeight,
    });
    expect(flattenStyle(value.parent?.props.style)).toMatchObject({
      flexDirection: "row",
      flexWrap: "wrap",
      minWidth: 0,
    });
    const trend = copy(renderer, "전주 대비 증가");
    expect(flattenStyle(trend.props.style)).toMatchObject({ flexShrink: 1 });
    expect(flattenStyle(trend.parent?.props.style)).toMatchObject({
      flexDirection: "row",
      flexWrap: "wrap",
      minWidth: 0,
    });
    expect(flattenStyle(copy(renderer, "세전 금액").props.style)).toMatchObject({
      color: resolveColorReference(statisticRecipe.hint.color, lightValue.palette),
      letterSpacing: 1,
    });
  });

  it("binds Accordion density, disclosure state, indicator adapter, and panel slots", () => {
    const onExpandedValuesChange = vi.fn();
    const renderIndicator = vi.fn((props: { value: string; expanded: boolean; disabled: boolean; color: string; size: number }) => (
      <View testID="accordion-indicator" {...props} />
    ));
    const renderer = render(
      <Accordion
        density="compact"
        itemStyle={{ borderBottomWidth: 3 }}
        items={[{
          accessibilityHint: "두 번 탭하여 펼치기",
          accessibilityLabel: "배송 도움말",
          content: <Text>내일 도착</Text>,
          contentAccessibilityLabel: "배송 상세",
          description: "예상 일정",
          title: "배송",
          value: "shipping",
        }]}
        label="도움말"
        onExpandedValuesChange={onExpandedValuesChange}
        panelStyle={{ paddingEnd: 9 }}
        renderIndicator={renderIndicator}
        titleStyle={{ letterSpacing: 1 }}
        triggerStyle={{ marginHorizontal: 2 }}
      />,
    );
    const trigger = byLabel(renderer, "배송 도움말");
    const density = accordionRecipe.density.compact;
    expect(trigger.props).toMatchObject({
      accessibilityHint: "두 번 탭하여 펼치기",
      accessibilityRole: "button",
      accessibilityState: { disabled: false, expanded: false },
    });
    expect(flattenStyle(trigger.props.style({ pressed: false }))).toMatchObject({
      gap: accordionRecipe.gap,
      marginHorizontal: 2,
      minHeight: density.triggerMinHeight,
      paddingHorizontal: accordionRecipe.paddingHorizontal,
      paddingVertical: density.paddingVertical,
    });
    expect(flattenStyle(trigger.props.style({ pressed: true }))).toMatchObject({
      backgroundColor: resolveColorReference(
        accordionRecipe.states.pressedBackground,
        lightValue.palette,
      ),
    });
    expect(renderIndicator).toHaveBeenLastCalledWith({
      color: resolveColorReference(accordionRecipe.indicator.color, lightValue.palette),
      disabled: false,
      expanded: false,
      size: glyph[accordionRecipe.indicator.glyph],
      value: "shipping",
    });
    const title = copy(renderer, "배송");
    expect(title.props.variant).toBe(accordionRecipe.title.textVariant);
    expect(flattenStyle(title.props.style)).toMatchObject({
      color: resolveColorReference(accordionRecipe.title.color, lightValue.palette),
      fontWeight: accordionRecipe.title.fontWeight,
      letterSpacing: 1,
    });

    act(() => trigger.props.onPress());
    expect(onExpandedValuesChange).toHaveBeenCalledWith(["shipping"]);
    expect(byLabel(renderer, "배송 도움말").props.accessibilityState.expanded).toBe(true);
    expect(renderIndicator).toHaveBeenLastCalledWith(expect.objectContaining({ expanded: true }));
    expect(flattenStyle(byLabel(renderer, "배송 상세").props.style)).toMatchObject({
      paddingBottom: accordionRecipe.panel.paddingBottom,
      paddingEnd: 9,
      paddingStart: accordionRecipe.panel.paddingInlineStart,
    });
    const item = trigger.parent;
    expect(flattenStyle(item?.props.style)).toMatchObject({
      borderBottomColor: resolveColorReference(accordionRecipe.divider, lightValue.palette),
      borderBottomWidth: 3,
    });
  });

  it("binds Section header/copy recipes and keeps caller slot styles final", () => {
    const renderer = render(
      <Section
        action={<View testID="section-action" />}
        actionStyle={{ minWidth: 77 }}
        contentStyle={{ paddingTop: 5 }}
        description="설명"
        descriptionStyle={{ letterSpacing: 1 }}
        headerStyle={{ marginTop: 3 }}
        title="개요"
        titleStyle={{ fontSize: 25 }}
      >
        <View testID="section-content" />
      </Section>,
    );
    const root = renderer.root.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).gap === sectionRecipe.gap,
    )!;
    expect(flattenStyle(root.props.style).gap).toBe(sectionRecipe.gap);
    const header = root.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).marginTop === 3,
    )!;
    expect(flattenStyle(header.props.style)).toMatchObject({
      flexDirection: "row",
      gap: sectionRecipe.headerGap,
      marginTop: 3,
    });
    const title = copy(renderer, "개요");
    expect(title.props).toMatchObject({ accessibilityRole: "header", variant: sectionRecipe.title.textVariant });
    expect(flattenStyle(title.props.style)).toMatchObject({
      color: resolveColorReference(sectionRecipe.title.color, lightValue.palette),
      fontSize: 25,
      fontWeight: sectionRecipe.title.fontWeight,
    });
    const description = copy(renderer, "설명");
    expect(description.props.variant).toBe(sectionRecipe.description.textVariant);
    expect(flattenStyle(description.props.style)).toMatchObject({
      color: resolveColorReference(sectionRecipe.description.color, lightValue.palette),
      letterSpacing: 1,
    });
    expect(flattenStyle(renderer.root.findByProps({ testID: "section-action" }).parent?.props.style))
      .toMatchObject({ minWidth: 77 });
    expect(flattenStyle(renderer.root.findByProps({ testID: "section-content" }).parent?.props.style))
      .toMatchObject({ paddingTop: 5 });
  });

  it("binds TopBar chrome/title recipes, safe area metrics, and logical slots", () => {
    const renderer = render(
      <TopBar
        leading={<View testID="top-leading" />}
        leadingStyle={{ width: 51 }}
        safeAreaTop={12}
        title="설정"
        titleStyle={{ letterSpacing: 2 }}
        trailing={<View testID="top-trailing" />}
        trailingStyle={{ width: 52 }}
      />,
    );
    const toolbar = renderer.root.find(
      (node) => node.props.accessibilityRole === "toolbar",
    );
    expect(toolbar.props.accessibilityRole).toBe("toolbar");
    expect(flattenStyle(toolbar.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(topBarRecipe.background, lightValue.palette),
      flexDirection: "row",
      gap: topBarRecipe.gap,
      minHeight: topBarRecipe.minHeight + 12,
      paddingHorizontal: topBarRecipe.paddingHorizontal,
      paddingTop: 12,
    });
    const title = copy(renderer, "설정");
    expect(title.props).toMatchObject({
      accessibilityRole: "header",
      numberOfLines: 1,
      variant: topBarRecipe.title.textVariant,
    });
    expect(flattenStyle(title.props.style)).toMatchObject({
      color: resolveColorReference(topBarRecipe.title.color, lightValue.palette),
      fontWeight: topBarRecipe.title.fontWeight,
      letterSpacing: 2,
    });
    expect(flattenStyle(renderer.root.findByProps({ testID: "top-leading" }).parent?.props.style))
      .toMatchObject({ minWidth: topBarRecipe.sideMinWidth, width: 51 });
    expect(flattenStyle(renderer.root.findByProps({ testID: "top-trailing" }).parent?.props.style))
      .toMatchObject({ minWidth: topBarRecipe.sideMinWidth, width: 52 });
  });

  it("binds EmptyState density, copy, illustration, and action slots to emptyStateRecipe", () => {
    const renderer = render(
      <EmptyState
        action={<View testID="empty-action" />}
        actionStyle={{ marginTop: 7 }}
        density="compact"
        description="필터를 바꿔보세요"
        descriptionStyle={{ letterSpacing: 1 }}
        illustration={<View testID="empty-illustration" />}
        illustrationStyle={{ opacity: 0.8 }}
        title="결과 없음"
        titleStyle={{ fontSize: 21 }}
      />,
    );
    const root = byLabel(renderer, "결과 없음, 필터를 바꿔보세요");
    expect(flattenStyle(root.props.style)).toMatchObject({
      gap: emptyStateRecipe.gap,
      paddingHorizontal: emptyStateRecipe.paddingHorizontal,
      paddingVertical: emptyStateRecipe.density.compact.paddingVertical,
    });
    const illustration = renderer.root.findByProps({ testID: "empty-illustration" }).parent!;
    expect(illustration.props.accessible).toBe(false);
    expect(flattenStyle(illustration.props.style)).toMatchObject({
      height: glyph[emptyStateRecipe.icon.size],
      opacity: 0.8,
      width: glyph[emptyStateRecipe.icon.size],
    });
    const title = copy(renderer, "결과 없음");
    expect(title.props).toMatchObject({ accessibilityRole: "header", variant: emptyStateRecipe.title.textVariant });
    expect(flattenStyle(title.props.style)).toMatchObject({
      color: resolveColorReference(emptyStateRecipe.title.color, lightValue.palette),
      fontSize: 21,
      fontWeight: emptyStateRecipe.title.fontWeight,
    });
    const description = copy(renderer, "필터를 바꿔보세요");
    expect(description.props.variant).toBe(emptyStateRecipe.description.textVariant);
    expect(flattenStyle(description.props.style)).toMatchObject({
      color: resolveColorReference(emptyStateRecipe.description.color, lightValue.palette),
      letterSpacing: 1,
    });
    expect(flattenStyle(renderer.root.findByProps({ testID: "empty-action" }).parent?.props.style))
      .toMatchObject({ marginTop: 7 });
  });

  it("binds Progress visible copy, semantic value, track/indicator recipe, and slots", () => {
    const renderer = render(
      <Progress
        accessibilityHint="업로드 완료까지 남은 비율"
        indicatorStyle={{ opacity: 0.75 }}
        label="업로드"
        labelStyle={{ letterSpacing: 1 }}
        max={200}
        size="large"
        tone="success"
        testID="upload-progress"
        trackStyle={{ marginTop: 2 }}
        value={50}
        valueStyle={{ fontWeight: "700" }}
        valueText="50 / 200"
      />,
    );
    const progress = byLabel(renderer, "업로드");
    expect(progress.props).toMatchObject({
      accessibilityHint: "업로드 완료까지 남은 비율",
      accessibilityRole: "progressbar",
      accessibilityValue: { max: 100, min: 0, now: 25, text: "50 / 200" },
      testID: "upload-progress",
    });
    const label = copy(renderer, "업로드");
    expect(label.props.variant).toBe("label");
    expect(flattenStyle(label.props.style)).toMatchObject({ letterSpacing: 1 });
    const value = copy(renderer, "50 / 200");
    expect(value.props.variant).toBe("caption");
    expect(flattenStyle(value.props.style)).toMatchObject({ fontWeight: "700" });
    const track = renderer.root.findAllByType(View).find((node) => {
      const style = flattenStyle(node.props.style);
      return style.height === progressRecipe.sizes.large && style.overflow === "hidden";
    })!;
    expect(track.props.accessible).toBe(false);
    expect(flattenStyle(track.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(progressRecipe.track, lightValue.palette),
      borderRadius: radius[progressRecipe.radius],
      height: progressRecipe.sizes.large,
      marginTop: 2,
    });
    const indicator = track.findAllByType(View).find(
      (node) => flattenStyle(node.props.style).width === "25%",
    )!;
    expect(flattenStyle(indicator.props.style)).toMatchObject({
      backgroundColor: resolveColorReference(progressRecipe.tones.success, lightValue.palette),
      height: "100%",
      opacity: 0.75,
      width: "25%",
    });

    const accessibilityOnly = render(
      <Progress accessibilityLabel="최신 기록을 불러오는 중" />,
    );
    expect(accessibilityOnly.root.findAllByType(View).find(
      (node) => node.props.accessibilityLabel === "최신 기록을 불러오는 중",
    )?.props).toMatchObject({ accessibilityRole: "progressbar" });
    expect(accessibilityOnly.root.findAllByType(Text)).toHaveLength(0);
  });
});
