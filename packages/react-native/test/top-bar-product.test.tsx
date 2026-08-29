import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { type ReactNode } from "react";
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from "react-test-renderer";
import { Pressable, View } from "react-native";
import { describe, expect, it, vi } from "vitest";

import {
  HjmNativeProvider,
  Text,
  TopBar,
  TopBarAction,
  type TopBarActionControlProps,
  type TopBarLinkRenderProps,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function providerValue(
  direction: "ltr" | "rtl" = "ltr",
  textScale = 1,
) {
  return resolveDesignSystemProviderValue(
    { direction, reducedMotion: true, textScale, theme: "light" },
    { systemTheme: "light" },
  );
}

function render(
  node: ReactNode,
  direction: "ltr" | "rtl" = "ltr",
  textScale = 1,
): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider value={providerValue(direction, textScale)}>
        {node}
      </HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.filter(Boolean).map(flattenStyle));
}

function resolvedPressableStyle(node: ReactTestInstance, pressed = false) {
  const style = typeof node.props.style === "function"
    ? node.props.style({ focused: false, hovered: false, pressed })
    : node.props.style;
  return flattenStyle(style);
}

function byLabel(renderer: ReactTestRenderer, label: string): ReactTestInstance {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

function semanticOrder(toolbar: ReactTestInstance): string[] {
  return toolbar
    .findAll((node) =>
      typeof node.type === "string"
      && (
        node.props.accessibilityRole === "button"
        || node.props.accessibilityRole === "header"
        || node.props.accessibilityRole === "link"
      ))
    .map((node) => node.props.accessibilityLabel ?? node.props.children)
    .filter((value): value is string => typeof value === "string");
}

describe("Native TopBar product API", () => {
  it("supports title-optional action-only and back-only toolbars with 44pt targets", () => {
    const renderer = render(
      <>
        <TopBar
          actions={(
            <TopBarAction label="필터" onPress={vi.fn()}>
              <View testID="filter-icon" />
            </TopBarAction>
          )}
        />
        <TopBar
          leading={(
            <TopBarAction
              label="뒤로"
              labelVisibility="accessibility-only"
              onPress={vi.fn()}
            >
              <View testID="back-icon" />
            </TopBarAction>
          )}
        />
      </>,
    );

    expect(renderer.root.findAll((node) => node.props.accessibilityRole === "header"))
      .toHaveLength(0);
    const filter = byLabel(renderer, "필터");
    const back = byLabel(renderer, "뒤로");
    expect(filter.props.accessibilityRole).toBe("button");
    expect(back.props.accessibilityRole).toBe("button");
    expect(resolvedPressableStyle(filter)).toMatchObject({
      gap: topBarRecipe.action.gap,
      minHeight: topBarRecipe.action.minHeight,
      minWidth: topBarRecipe.action.minWidth,
      paddingHorizontal: topBarRecipe.action.paddingHorizontal,
    });
    expect(resolvedPressableStyle(filter, true)).toMatchObject({
      opacity: topBarRecipe.action.pressedOpacity,
    });
    expect(resolvedPressableStyle(back)).toMatchObject({
      minHeight: topBarRecipe.action.minHeight,
      minWidth: topBarRecipe.action.minWidth,
    });
    const visibleLabel = renderer.root.findAllByType(Text).find(
      (node) => node.props.children === "필터",
    );
    expect(visibleLabel?.props.variant).toBe(topBarRecipe.actionLabel.textVariant);
    expect(flattenStyle(visibleLabel?.props.style)).toMatchObject({
      fontWeight: topBarRecipe.actionLabel.fontWeight,
    });
    expect(renderer.root.findAllByType(Text).some((node) => node.props.children === "뒤로"))
      .toBe(false);
  });

  it("keeps leading, title, and trailing actions in reading order while RTL owns placement", () => {
    const renderer = render(
      <TopBar
        actions={(
          <>
            <TopBarAction label="공유" onPress={vi.fn()}>
              <View testID="share-icon" />
            </TopBarAction>
            <TopBarAction
              destination={{ kind: "internal", href: "/help" }}
              intent="link"
              label="도움말"
              onNavigate={vi.fn()}
            >
              <View testID="help-icon" />
            </TopBarAction>
          </>
        )}
        leading={(
          <TopBarAction
            label="뒤로"
            labelVisibility="accessibility-only"
            onPress={vi.fn()}
          >
            <View testID="back-icon" />
          </TopBarAction>
        )}
        title="설정"
      />,
      "rtl",
    );
    const toolbar = renderer.root.find(
      (node) => node.props.accessibilityRole === "toolbar",
    );

    expect(flattenStyle(toolbar.props.style)).toMatchObject({
      direction: "rtl",
      flexDirection: "row",
    });
    expect(semanticOrder(toolbar)).toEqual(["뒤로", "설정", "공유", "도움말"]);
    expect(
      toolbar.findAllByType(View).map((node) => flattenStyle(node.props.style))
        .some((style) => style.flexDirection === "row-reverse"),
    ).toBe(false);
  });

  it("stacks large-text chrome without moving actions ahead of the title", () => {
    const renderer = render(
      <TopBar
        actions={(
          <TopBarAction label="관심" onPress={vi.fn()}>
            <View testID="favorite-icon" />
          </TopBarAction>
        )}
        leading={(
          <TopBarAction
            label="뒤로"
            labelVisibility="accessibility-only"
            onPress={vi.fn()}
          >
            <View testID="back-icon" />
          </TopBarAction>
        )}
        title="아주 긴 선수 상세 화면 제목"
      />,
      "rtl",
      1.8,
    );
    const toolbar = renderer.root.find(
      (node) => node.props.accessibilityRole === "toolbar",
    );
    const title = toolbar.find((node) => node.props.accessibilityRole === "header");

    expect(flattenStyle(toolbar.props.style)).toMatchObject({
      alignItems: "stretch",
      direction: "rtl",
      flexDirection: "column",
    });
    expect(title.props.numberOfLines).toBeUndefined();
    expect(semanticOrder(toolbar)).toEqual(["뒤로", "아주 긴 선수 상세 화면 제목", "관심"]);
    expect(toolbar.findAllByType(View).map((node) => flattenStyle(node.props.style)))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          direction: "rtl",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          width: "100%",
        }),
      ]));
  });

  it("makes an avatar-leading title one named 44pt action without nested AX nodes", () => {
    const onTitlePress = vi.fn();
    const renderer = render(
      <TopBar
        onTitlePress={onTitlePress}
        title="러너"
        titleAccessibilityHint="프로필 열기"
        titleAccessibilityLabel="러너 프로필"
        titleLeading={<View testID="avatar" />}
      />,
    );
    const titleAction = byLabel(renderer, "러너 프로필");

    expect(titleAction.props.accessibilityRole).toBe("button");
    expect(titleAction.props.accessibilityHint).toBe("프로필 열기");
    expect(resolvedPressableStyle(titleAction)).toMatchObject({
      gap: topBarRecipe.titleAction.gap,
      minHeight: topBarRecipe.titleAction.minHeight,
      minWidth: topBarRecipe.titleAction.minWidth,
    });
    expect(renderer.root.findByProps({ testID: "avatar" }).parent?.props)
      .toMatchObject({
        accessible: false,
        importantForAccessibility: "no-hide-descendants",
      });
    expect(titleAction.findAll(
      (node) => node.props.accessibilityRole === "header",
    )).toHaveLength(0);
    act(() => titleAction.props.onPress({}));
    expect(onTitlePress).toHaveBeenCalledOnce();
  });

  it("exposes separate button and router-link adapters with guarded activation", () => {
    const onAction = vi.fn();
    const onNavigate = vi.fn();
    let actionAdapterProps: TopBarActionControlProps | undefined;
    let linkAdapterProps: TopBarLinkRenderProps | undefined;
    const renderer = render(
      <TopBar
        actions={(
          <>
            <TopBarAction
              label="새로고침"
              onPress={onAction}
              renderAction={(props) => {
                actionAdapterProps = props;
                return <Pressable {...props} testID="action-adapter" />;
              }}
            >
              <View testID="refresh-icon" />
            </TopBarAction>
            <TopBarAction
              destination={{ kind: "internal", href: "/notifications" }}
              intent="link"
              label="알림"
              onNavigate={onNavigate}
              renderLink={(props) => {
                linkAdapterProps = props;
                return <Pressable {...props} testID="router-link-adapter" />;
              }}
            >
              <View testID="notification-icon" />
            </TopBarAction>
          </>
        )}
      />,
    );

    expect(actionAdapterProps?.accessibilityRole).toBe("button");
    expect(linkAdapterProps).toMatchObject({
      accessibilityRole: "link",
      destination: { kind: "internal", href: "/notifications" },
    });
    act(() => renderer.root.findByProps({ testID: "action-adapter" }).props.onPress({}));
    act(() => renderer.root.findByProps({ testID: "router-link-adapter" }).props.onPress({}));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith({ kind: "internal", href: "/notifications" });
  });

  it("keeps disabled button and link intents named, unavailable, and inert", () => {
    const onAction = vi.fn();
    const onNavigate = vi.fn();
    const renderer = render(
      <TopBar
        actions={(
          <>
            <TopBarAction disabled label="저장" onPress={onAction}>
              <View testID="save-icon" />
            </TopBarAction>
            <TopBarAction
              destination={{ kind: "internal", href: "/locked" }}
              disabled
              intent="link"
              label="잠김"
              onNavigate={onNavigate}
            >
              <View testID="locked-icon" />
            </TopBarAction>
          </>
        )}
      />,
    );

    for (const label of ["저장", "잠김"]) {
      const action = byLabel(renderer, label);
      expect(action.props.disabled).toBe(true);
      expect(action.props.accessibilityState).toMatchObject({ disabled: true });
      expect(resolvedPressableStyle(action)).toMatchObject({
        opacity: topBarRecipe.action.disabledOpacity,
      });
      act(() => action.props.onPress({}));
    }
    expect(onAction).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("fails closed when localized action copy or link activation is missing", () => {
    expect(() => render(<TopBar title="   " />))
      .toThrow(/title must be omitted or contain non-whitespace copy/u);
    expect(() => render(
      <TopBarAction label=" " onPress={vi.fn()}><View /></TopBarAction>,
    )).toThrow(/label must not be empty/u);
    expect(() => render(
      <TopBarAction accessibilityLabel=" " label="뒤로" onPress={vi.fn()}>
        <View />
      </TopBarAction>,
    )).toThrow(/accessibilityLabel must not be empty/u);
    expect(() => render(
      <TopBarAction
        destination={{ kind: "internal", href: "/orphan" }}
        intent="link"
        label="고아 링크"
      >
        <View />
      </TopBarAction>,
    )).toThrow(/requires renderLink or onNavigate/u);
    expect(() => render(<TopBar onTitlePress={vi.fn()} />))
      .toThrow(/title affordance props require a title/u);
    expect(() => render(
      <TopBar title="설정" titleAccessibilityHint="열기" />,
    )).toThrow(/titleAccessibilityHint requires onTitlePress/u);
  });
});
