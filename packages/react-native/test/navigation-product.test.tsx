import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { glyph, radius } from "@hjmds/design-contracts/foundations";
import {
  bottomNavigationRecipe,
  loadMoreRecipe,
  spinnerRecipe,
} from "@hjmds/design-contracts/recipes";
import {
  StrictMode,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ActivityIndicator, Keyboard, View } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BottomNavigation,
  HjmNativeProvider,
  LoadMore,
  Text,
  type BottomNavigationBadgeRenderProps,
  type BottomNavigationIconRenderProps,
  type LoadMoreHandle,
} from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const providerValue = resolveDesignSystemProviderValue(
  { direction: "ltr", reducedMotion: true, theme: "light" },
  { systemTheme: "light" },
);

function render(node: ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <HjmNativeProvider value={providerValue}>{node}</HjmNativeProvider>,
      { createNodeMock: () => ({}) },
    );
  });
  return renderer!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style ?? {}) as Record<string, unknown>;
  return Object.assign({}, ...style.filter(Boolean).map(flattenStyle));
}

afterEach(() => {
  const keyboard = Keyboard as typeof Keyboard & {
    __emit(event: "keyboardDidShow" | "keyboardDidHide"): void;
  };
  act(() => keyboard.__emit("keyboardDidHide"));
  vi.restoreAllMocks();
});

describe("Native navigation product adapters", () => {
  it("binds BottomNavigation slots, appearance, intents, safe area, and keyboard behavior", () => {
    const onActivate = vi.fn();
    const onLongActivate = vi.fn();
    const iconAppearances: BottomNavigationIconRenderProps<string, string>[] = [];
    const badgeAppearances: BottomNavigationBadgeRenderProps<string, string>[] = [];
    const descriptor = {
      accessibilityLabel: "주요 메뉴",
      items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "search", label: "검색", icon: { name: "search" } },
        {
          id: "inbox",
          label: "받은 편지함",
          icon: { name: "inbox" },
          badge: { count: 120, max: 99, accessibilityLabel: "읽지 않은 메시지 120개" },
        },
        { id: "profile", label: "프로필", icon: { name: "user" } },
      ],
      selectedKey: "home",
    } as const;

    const renderer = render(
      <BottomNavigation
        configuration={{
          density: "compact",
          distribution: "center-gap",
          keyboardBehavior: "hide",
          presentation: "floating",
        }}
        descriptor={descriptor}
        getItemTestID={(item) => `destination-${item.id}`}
        onActivate={onActivate}
        onLongActivate={onLongActivate}
        primaryAction={<View testID="create-action" />}
        renderBadge={(props) => {
          badgeAppearances.push(props);
          return <View testID={`badge-${props.item.id}`} />;
        }}
        renderIcon={(props) => {
          iconAppearances.push(props);
          return <View testID={`icon-${props.name}`} />;
        }}
        safeAreaBottom={12}
      />,
    );

    const homeIcon = iconAppearances.find((appearance) => appearance.name === "home")!;
    expect(homeIcon).toMatchObject({
      color: resolveColorReference(
        bottomNavigationRecipe.colors.selectedIcon,
        providerValue.palette,
      ),
      name: "home",
      selected: true,
      size: glyph[bottomNavigationRecipe.density.compact.icon],
      strokeWidth:
        bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected,
    });
    expect(iconAppearances.find((appearance) => appearance.name === "search"))
      .toMatchObject({
        color: resolveColorReference(
          bottomNavigationRecipe.colors.idle,
          providerValue.palette,
        ),
        selected: false,
        strokeWidth:
          bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
      });
    expect(badgeAppearances[0]).toMatchObject({
      badge: { hiddenFromAccessibility: true, visibleLabel: "99+" },
      count: 120,
      max: 99,
      selected: false,
    });
    expect(renderer.root.findByProps({ testID: "badge-inbox" }).parent?.props)
      .toMatchObject({ accessible: false, importantForAccessibility: "no-hide-descendants" });

    const search = renderer.root.findByProps({ testID: "destination-search" });
    expect(flattenStyle(search.props.style({ pressed: false }))).toMatchObject({
      marginEnd: bottomNavigationRecipe.distributions["center-gap"].centerGap,
      minHeight: bottomNavigationRecipe.density.compact.itemMinHeight,
      minWidth: bottomNavigationRecipe.density.compact.itemMinWidth,
      padding: bottomNavigationRecipe.density.compact.padding,
    });
    act(() => search.props.onPress());
    expect(onActivate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });
    act(() => search.props.onLongPress());
    expect(onLongActivate).toHaveBeenCalledWith({ key: "search", reason: "navigate" });

    const root = renderer.root.findAllByType(View).find((node) =>
      flattenStyle(node.props.style).paddingBottom ===
        12 + bottomNavigationRecipe.safeArea.minimumBottomPadding
    )!;
    expect(flattenStyle(root.props.style)).toMatchObject({
      paddingHorizontal:
        bottomNavigationRecipe.presentations.floating.outerPaddingHorizontal,
      paddingTop: bottomNavigationRecipe.presentations.floating.outerPaddingTop,
    });
    const surface = renderer.root.findAllByType(View).find((node) =>
      flattenStyle(node.props.style).maxWidth ===
        bottomNavigationRecipe.presentations.floating.maxWidth
    )!;
    expect(flattenStyle(surface.props.style)).toMatchObject({
      borderRadius: radius[bottomNavigationRecipe.presentations.floating.radius!],
      borderWidth: bottomNavigationRecipe.presentations.floating.borderWidth,
      position: "relative",
    });
    const primaryAction = renderer.root.findByProps({ testID: "create-action" });
    expect(flattenStyle(primaryAction.parent?.props.style)).toMatchObject({
      alignItems: "center",
      bottom: 0,
      justifyContent: "center",
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    });

    const keyboard = Keyboard as typeof Keyboard & {
      __emit(event: "keyboardDidShow" | "keyboardDidHide"): void;
    };
    act(() => keyboard.__emit("keyboardDidShow"));
    expect(renderer.root.findAll(
      (node) => node.props.accessibilityRole === "tablist",
    )).toHaveLength(0);
    act(() => keyboard.__emit("keyboardDidHide"));
    expect(renderer.root.findAll(
      (node) => node.props.accessibilityRole === "tablist",
    ).length).toBeGreaterThan(0);
    act(() => renderer.unmount());
  });

  it("rejects invalid native safe-area insets", () => {
    expect(() => render(
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "주요 메뉴",
          items: [
            { id: "home", label: "홈", icon: { name: "home" } },
            { id: "profile", label: "프로필", icon: { name: "user" } },
          ],
          selectedKey: "home",
        }}
        onActivate={vi.fn()}
        renderIcon={({ name }) => <Text>{name}</Text>}
        safeAreaBottom={Number.NaN}
      />,
    )).toThrow(/safeAreaBottom must be non-negative/u);
  });
});

describe("Native LoadMore collection binding", () => {
  const labels = {
    complete: "모두 불러옴",
    loading: "불러오는 중",
    loadMore: "더 보기",
    retry: "다시 시도",
  } as const;

  it("renders the canonical density and reports request outcomes", async () => {
    const onRequestOutcome = vi.fn();
    const renderer = render(
      <LoadMore
        density="compact"
        descriptor={{
          labels: {
            complete: "모두 불러옴",
            loading: "불러오는 중",
            loadMore: "더 보기",
            retry: "다시 시도",
          },
          state: { status: "ready", requestKey: "compact-page" },
        }}
        mode="manual"
        onLoadMore={async () => undefined}
        onRequestOutcome={onRequestOutcome}
      />,
    );
    const root = renderer.root.findAllByType(View).find((node) =>
      flattenStyle(node.props.style).paddingVertical ===
        loadMoreRecipe.density.compact.paddingVertical
    )!;
    expect(flattenStyle(root.props.style)).toMatchObject({
      gap: loadMoreRecipe.density.compact.gap,
      paddingVertical: loadMoreRecipe.density.compact.paddingVertical,
    });

    await act(async () => {
      renderer.root.find(
        (node) => node.props.accessibilityLabel === "더 보기",
      ).props.onPress();
      await Promise.resolve();
    });
    expect(onRequestOutcome).toHaveBeenCalledWith("started", "manual");
  });

  it("keeps its request controller attached through StrictMode effect replay", async () => {
    const onLoadMore = vi.fn(async () => undefined);
    const renderer = render(
      <StrictMode>
        <LoadMore
          descriptor={{
            labels: {
              complete: "모두 불러옴",
              loading: "불러오는 중",
              loadMore: "더 보기",
              retry: "다시 시도",
            },
            state: { status: "ready", requestKey: "strict-page" },
          }}
          mode="manual"
          onLoadMore={onLoadMore}
        />
      </StrictMode>,
    );
    await act(async () => {
      renderer.root.find(
        (node) => node.props.accessibilityLabel === "더 보기",
      ).props.onPress();
      await Promise.resolve();
    });
    expect(onLoadMore).toHaveBeenCalledOnce();
    expect(onLoadMore).toHaveBeenCalledWith({
      reason: "manual",
      requestKey: "strict-page",
    });
  });

  it("binds ready, loading, error, and complete UI to the shared state recipe", () => {
    const ready = render(
      <LoadMore
        descriptor={{ labels, state: { status: "ready", requestKey: "ready-page" } }}
        mode="manual"
        onLoadMore={async () => undefined}
      />,
    );
    const readyTrigger = ready.root.find(
      (node) => typeof node.type === "string"
        && node.props.accessibilityLabel === labels.loadMore,
    );
    expect(flattenStyle(readyTrigger.props.style)).toMatchObject({
      borderRadius: radius[loadMoreRecipe.trigger.radius],
      minHeight: loadMoreRecipe.trigger.minHeight,
      paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
    });
    const readyCopy = ready.root.findAllByType(Text).find(
      (node) => node.props.children === labels.loadMore,
    );
    expect(readyCopy?.props.variant).toBe(loadMoreRecipe.trigger.textVariant);
    expect(flattenStyle(readyCopy?.props.style)).toMatchObject({
      color: resolveColorReference(loadMoreRecipe.trigger.color, providerValue.palette),
      fontWeight: loadMoreRecipe.trigger.fontWeight,
    });

    const loading = render(
      <LoadMore
        descriptor={{ labels, state: { status: "loading", requestKey: "loading-page" } }}
        onLoadMore={async () => undefined}
      />,
    );
    const progress = loading.root.find(
      (node) => node.props.accessibilityRole === "progressbar",
    );
    expect(progress.props).toMatchObject({
      accessibilityLabel: labels.loading,
      accessibilityState: { busy: true },
      accessible: true,
    });
    expect(loading.root.findByType(ActivityIndicator).props).toMatchObject({
      color: resolveColorReference(
        spinnerRecipe.tones[loadMoreRecipe.spinner.tone],
        providerValue.palette,
      ),
      size: loadMoreRecipe.spinner.size,
    });
    const loadingCopy = loading.root.findAllByType(Text).find(
      (node) => node.props.children === labels.loading,
    );
    expect(loadingCopy?.props).toMatchObject({
      accessible: false,
      variant: loadMoreRecipe.status.textVariant,
    });
    expect(flattenStyle(loadingCopy?.props.style)).toMatchObject({
      color: resolveColorReference(loadMoreRecipe.status.color, providerValue.palette),
    });

    const error = render(
      <LoadMore
        descriptor={{
          labels,
          state: { status: "error", requestKey: "error-page", message: "네트워크 오류" },
        }}
        onLoadMore={async () => undefined}
      />,
    );
    const errorCopy = error.root.findAllByType(Text).find(
      (node) => node.props.children === "네트워크 오류",
    );
    expect(errorCopy?.props).toMatchObject({
      accessibilityLiveRegion: "assertive",
      variant: loadMoreRecipe.error.textVariant,
    });
    expect(flattenStyle(errorCopy?.props.style)).toMatchObject({
      color: resolveColorReference(loadMoreRecipe.error.color, providerValue.palette),
    });
    expect(error.root.find(
      (node) => node.props.accessibilityLabel === labels.retry,
    ).props.accessibilityRole).toBe("button");

    const complete = render(
      <LoadMore
        descriptor={{ labels, state: { status: "complete" } }}
        onLoadMore={async () => undefined}
      />,
    );
    const completeCopy = complete.root.findAllByType(Text).find(
      (node) => node.props.children === labels.complete,
    );
    expect(completeCopy?.props).toMatchObject({
      accessibilityLiveRegion: "polite",
      variant: loadMoreRecipe.end.textVariant,
    });
    expect(flattenStyle(completeCopy?.props.style)).toMatchObject({
      color: resolveColorReference(loadMoreRecipe.end.color, providerValue.palette),
    });
  });

  it("turns rejected product requests into a safe imperative result and error callback", async () => {
    const failure = new Error("offline");
    const onRequestError = vi.fn();
    const onRequestOutcome = vi.fn();
    const ref = { current: null as LoadMoreHandle | null };
    render(
      <LoadMore
        ref={ref}
        descriptor={{ labels, state: { status: "ready", requestKey: "failed-page" } }}
        onLoadMore={async () => Promise.reject(failure)}
        onRequestError={onRequestError}
        onRequestOutcome={onRequestOutcome}
      />,
    );

    let outcome: Awaited<ReturnType<LoadMoreHandle["onEndReached"]>> | undefined;
    await act(async () => {
      outcome = await ref.current!.onEndReached();
    });

    expect(outcome).toBe("started");
    expect(onRequestError).toHaveBeenCalledWith(failure, "viewport");
    expect(onRequestOutcome).not.toHaveBeenCalled();
  });

  it("exposes one FlatList viewport gate and follows the latest cursor and handler", async () => {
    let finishFirst!: () => void;
    const firstHandler = vi.fn(
      () => new Promise<void>((resolve) => { finishFirst = resolve; }),
    );
    const nextHandler = vi.fn(async () => undefined);
    let handle: LoadMoreHandle | null = null;
    let firstViewportRequest: ReturnType<LoadMoreHandle["onEndReached"]> | null = null;

    function FlatListFooter({
      requestKey,
      onLoadMore,
    }: Readonly<{
      requestKey: string;
      onLoadMore: typeof firstHandler;
    }>) {
      const ref = useRef<LoadMoreHandle>(null);
      useLayoutEffect(() => {
        handle = ref.current;
        firstViewportRequest ??= ref.current?.onEndReached() ?? null;
      }, []);
      return (
        <LoadMore
          ref={ref}
          descriptor={{ state: { status: "ready", requestKey }, labels }}
          onLoadMore={onLoadMore}
        />
      );
    }

    const renderer = render(
      <FlatListFooter onLoadMore={firstHandler} requestKey="page-2" />,
    );
    expect(firstHandler).toHaveBeenCalledOnce();
    expect(firstHandler).toHaveBeenCalledWith({
      reason: "viewport",
      requestKey: "page-2",
    });
    await expect(handle!.onEndReached()).resolves.toBe("already-requesting");

    finishFirst();
    await expect(firstViewportRequest!).resolves.toBe("started");
    await expect(handle!.onEndReached()).resolves.toBe("already-requesting");

    act(() => {
      renderer.update(
        <HjmNativeProvider value={providerValue}>
          <FlatListFooter
            onLoadMore={nextHandler as typeof firstHandler}
            requestKey="page-3"
          />
        </HjmNativeProvider>,
      );
    });
    expect(nextHandler).not.toHaveBeenCalled();
    await expect(handle!.onEndReached()).resolves.toBe("started");
    expect(nextHandler).toHaveBeenCalledOnce();
    expect(nextHandler).toHaveBeenCalledWith({
      reason: "viewport",
      requestKey: "page-3",
    });
  });
});
