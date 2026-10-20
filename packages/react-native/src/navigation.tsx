import type { ComponentRef } from "react";
import {
  getTabNavigationTarget,
  resolveInitialTabValue,
  tabsBehaviorDefaults,
  type AsyncCollectionState,
  type CollectionItemDescriptor,
  type CollectionSectionDescriptor,
  type CollectionSelectionModel,
  type TabsActivationMode,
  type TabsDirection,
  type TabsMountPolicy,
  type TabsOrientation,
  type TabsPanelMode,
} from "@hjmds/design-contracts/behaviors";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  resolveBottomNavigationActivation,
  resolveBottomNavigationConfiguration,
  resolveBottomNavigationDescriptor,
  validateBottomNavigationProminence,
  type BottomNavigationActivation,
  type BottomNavigationConfiguration,
  type BottomNavigationDescriptor,
  type ResolvedBottomNavigationCounterBadge,
  type ResolvedBottomNavigationItemDescriptor,
} from "@hjmds/design-contracts/components/bottom-navigation";
import {
  flattenCollectionItems,
  validateCollection,
  type CollectionSource,
} from "@hjmds/design-contracts/components/collection";
import type { LinkDestination } from "@hjmds/design-contracts/components/link";
import {
  createLoadMoreController,
  validateLoadMoreDescriptor,
  type LoadMoreDescriptor,
  type LoadMoreMode,
  type LoadMoreRequestHandler,
  type LoadMoreRequestOutcome,
  type LoadMoreRequestReason,
} from "@hjmds/design-contracts/components/load-more";
import {
  backdrop,
  easing,
  glyph,
  radius,
  spacing,
} from "@hjmds/design-contracts/foundations";
import {
  resolveSwipeTabIndicator, type TabSwipePosition,
  resolveTabIndicator,
  resolveTabsAppearance,
  sampleTabIndicator,
  type GooeyIndicatorRect,
  type TabsAppearance,
} from "@hjmds/design-contracts/gooey-navigation";
import {
  bottomNavigationRecipe,
  counterBadgeRecipe,
  loadMoreRecipe,
  menuRecipe,
  spinnerRecipe,
  tabsRecipe,
  topBarRecipe,
  type LoadMoreDensity,
  type MenuDensity,
  type TabSize,
  type TabsIndicator,
  type TabsLayout,
  type TabsOverflow,
} from "@hjmds/design-contracts/recipes";
import {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  findNodeHandle,
  type ModalProps,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { RecipeButton } from "./internal/recipe-button.js";
import { BottomNavigationInsetReporterContext } from "./internal/bottom-navigation-inset.js";
export {
  BottomNavigationInsetProvider,
  useBottomNavigationInset,
  type BottomNavigationInsetProviderProps,
} from "./internal/bottom-navigation-inset.js";
import { isWebRenderer, webOnly, webTabProps } from "./internal/web-a11y.js";

export type { TabsAppearance };

import { Button } from "./actions.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { validateScreenExit } from "@hjmds/design-contracts/screen-patterns";
import { Spinner } from "./feedback.js";
import {
scheduleAfterNativeModalTeardown,
shouldAwaitNativeModalDismiss,
type NativeModalTeardownTask,
} from "./internal/modal-lifecycle.js";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle, resolveNativeShadowElevation } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { HjmNativeProvider, useHjmNativeTheme } from "./provider.js";

export type TabItem<Value extends string = string> = Readonly<{
  id: Value;
  label: string;
  disabled?: boolean;
  badge?: string;
  badgeAccessibilityLabel?: string;
  renderLeading?: (appearance: TabLeadingRenderProps) => ReactNode;
  /** Optional localized name for this item's tab panel. */
  panelAccessibilityLabel?: string;
  panel?: ReactNode;
}>;

export type TabLeadingRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: string;
  /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
  size: number;
}>;

type TabsSelection<Value extends string> =
  | Readonly<{
      value: Value;
      defaultValue?: never;
      onValueChange: (value: Value) => void;
    }>
  | Readonly<{
      value?: never;
      defaultValue?: Value;
      onValueChange?: (value: Value) => void;
    }>;

type TabsBaseProps<Value extends string> = Readonly<{
  /** Stable id used to associate external panels and automation targets. */
  id?: string;
  label: string;
  activationMode?: TabsActivationMode;
  mountPolicy?: TabsMountPolicy;
  panelMode?: TabsPanelMode;
  appearance?: TabsAppearance;
  /** Fractional pager position; selection commits through onValueChange. Horizontal only. */
  swipePosition?: TabSwipePosition;
  orientation?: TabsOrientation;
  direction?: TabsDirection;
  loop?: boolean;
  size?: TabSize;
  layout?: TabsLayout;
  overflow?: TabsOverflow;
  /** Selection mark: the 2pt underline (default) or a brand-tinted pill behind the selected tab. */
  indicator?: TabsIndicator;
  /** Set false when panels are rendered separately with `TabPanel`. */
  renderPanels?: boolean;
  children?: (selectedValue: Value) => ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
    }>;

type TabsCollectionProps<Value extends string> = Readonly<{ items: readonly TabItem<Value>[] }>;

export type TabsProps<Value extends string = string> = TabsBaseProps<Value> &
  TabsCollectionProps<Value> & TabsSelection<Value>;

function encodedTabId(value: string): string {
  return encodeURIComponent(value);
}

export function getTabId(tabsId: string, value: string): string {
  return `${tabsId}-tab-${encodedTabId(value)}`;
}

export function getTabPanelId(
  tabsId: string,
  value: string,
  mode: TabsPanelMode = "keyed",
): string {
  return mode === "dynamic"
    ? `${tabsId}-panel`
    : `${tabsId}-panel-${encodedTabId(value)}`;
}

export function getDynamicTabPanelId(tabsId: string): string {
  return getTabPanelId(tabsId, "", "dynamic");
}

type ExternalTabPanelBaseProps = Readonly<{
  tabsId: string;
  activeValue: string;
  label: string;
  children: ReactNode;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  }>;

export type TabPanelProps = ExternalTabPanelBaseProps &
  (
    | Readonly<{
        mode: "dynamic";
        value?: never;
        mountPolicy?: never;
      }>
    | Readonly<{
        mode?: "keyed";
        value: string;
        mountPolicy?: TabsMountPolicy;
      }>
  );

/** External panel host for products that keep routing, query, or list state outside Tabs. */
export function TabPanel(props: TabPanelProps) {
  const { tabsId, activeValue, label, children, layoutStyle } = props;
  assertNoRemovedStyleProps("TabPanel", props, ["style"]);
  const dynamic = props.mode === "dynamic";
  const value = dynamic ? activeValue : props.value;
  const selected = value === activeValue;
  const mountPolicy = dynamic
    ? "active"
    : props.mountPolicy ?? tabsBehaviorDefaults.mountPolicy;
  const [visited, setVisited] = useState(selected);
  useEffect(() => {
    if (selected) setVisited(true);
  }, [selected]);
  const mounted = dynamic || selected || mountPolicy === "always" ||
    (mountPolicy === "visited" && visited);
  if (!mounted) return null;
  return (
    <View
      nativeID={getTabPanelId(tabsId, value, dynamic ? "dynamic" : "keyed")}
      accessibilityLabel={label}
      accessibilityLabelledBy={getTabId(tabsId, dynamic ? activeValue : value)}
      accessibilityElementsHidden={!selected}
      importantForAccessibility={selected ? "auto" : "no-hide-descendants"}
      pointerEvents={selected ? "auto" : "none"}
      role="tabpanel"
      style={[layoutStyle, selected ? null : { display: "none" }]}
    >
      {children}
    </View>
  );
}


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Tabs<Value extends string = string>(props: TabsProps<Value>) {
  const {
    id,
    label,
    items,
    value: valueProp,
    defaultValue,
    onValueChange,
    activationMode = tabsBehaviorDefaults.activationMode,
    mountPolicy = tabsBehaviorDefaults.mountPolicy,
    panelMode = tabsBehaviorDefaults.panelMode,
    appearance: suppliedAppearance,
    swipePosition,
    orientation = tabsBehaviorDefaults.orientation,
    direction: directionProp,
    loop = tabsBehaviorDefaults.loop,
    size = tabsRecipe.defaults.size,
    layout = tabsRecipe.defaults.layout,
    overflow = tabsRecipe.defaults.overflow,
    indicator = tabsRecipe.defaults.indicator,
    renderPanels = true,
    children,
    layoutStyle,
  } = props;
  assertNoRemovedStyleProps("Tabs", props, ["style", "tabListStyle"]);
  if (!label.trim()) throw new TypeError("Tabs label must not be empty");
  if (panelMode === "dynamic" && mountPolicy !== "active") {
    throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
  }
  if ("options" in props || !Array.isArray(items)) throw new TypeError("Tabs requires items; options was removed");
  const tabItems = items;
  if (tabItems.length === 0) throw new TypeError("Tabs requires at least one option");
  if (!(indicator in tabsRecipe.indicators)) throw new TypeError(`Unsupported Tabs indicator: ${String(indicator)}`);
  const mark = tabsRecipe.indicators[indicator];
  const filled = indicator === "filled";
  const theme = useHjmNativeTheme();
  const { colors, environment } = theme;
  const direction = directionProp ?? environment.direction;
  const sizeContract = tabsRecipe.sizes[size];
  const fitted = tabsRecipe.layouts[layout].fitted;
  const scrollable = tabsRecipe.overflow[overflow].scrollable;
  const descriptors = tabItems.map((item) => ({
      id: item.id,
      label: item.label,
      ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
  const collectionFallback = resolveInitialTabValue(descriptors);
  if (collectionFallback === undefined) throw new TypeError("Tabs requires an enabled option");
  if (valueProp !== undefined) resolveInitialTabValue(descriptors, valueProp);
  const initialRef = useRef<Readonly<{ value: Value }> | null>(null);
  if (initialRef.current === null) {
    const initial = resolveInitialTabValue(descriptors, valueProp ?? defaultValue);
    if (initial === undefined) throw new TypeError("Tabs requires an enabled option");
    initialRef.current = { value: initial };
  }
  const [storedValue, setSelected] = useControllableState({
    ...(valueProp === undefined ? {} : { value: valueProp }),
    defaultValue: initialRef.current.value,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const controlled = valueProp !== undefined;
  const storedValueValid = descriptors.some(
    (item) => item.id === storedValue && !item.disabled,
  );
  const selected = storedValueValid ? storedValue : collectionFallback;
  const [focusValue, setFocusValue] = useState(selected);
  const [visited, setVisited] = useState<ReadonlySet<Value>>(() => new Set([selected]));
  const tabRefs = useRef(new Map<Value, ComponentRef<typeof View>>());
  const appearance = resolveTabsAppearance(suppliedAppearance, theme.designProfile?.interactions.selectionMotion, orientation);
  const movingIndicator = appearance !== "standard" || (orientation === "horizontal" && swipePosition !== undefined);
  const [indicatorRects, setIndicatorRects] = useState<Record<string, GooeyIndicatorRect>>({});
  const tabScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [tabViewport, setTabViewport] = useState(0);
  const [tabContentWidth, setTabContentWidth] = useState(0);
  const destination = indicatorRects[selected];
  useLayoutEffect(() => {
    if (orientation !== "horizontal" || !scrollable || fitted || !destination || !tabViewport) return;
    // Physical RTL offset keeps selected labels visible at 200% scale (iOS showcase).
    const x = Math.max(0, Math.min(destination.x + destination.width / 2 - tabViewport / 2, tabContentWidth - tabViewport));
    tabScroll.current?.scrollTo({ x, animated: false });
  }, [selected, destination, tabViewport, tabContentWidth, direction, orientation, scrollable, fitted]);
  const previousIndicator = useRef<{ value: Value; rect: GooeyIndicatorRect } | null>(null);
  const progress = useRef(new Animated.Value(1)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const swipeWidth = useRef(new Animated.Value(0)).current;
  const [indicatorRecipe, setIndicatorRecipe] = useState<ReturnType<typeof resolveTabIndicator> | null>(null);
  const recipeRef = useRef<ReturnType<typeof resolveTabIndicator> | null>(null);
  const progressFrame = useRef(1);
  const interruptedIndicator = useRef<GooeyIndicatorRect | null>(null);
  useLayoutEffect(() => {
    // Track JS-driver presentation in a ref; no React render/layout work per frame.
    const listener = progress.addListener(({ value }) => { progressFrame.current = value; });
    return () => progress.removeListener(listener);
  }, [progress]);
  useLayoutEffect(() => {
    const interrupted = interruptedIndicator.current;
    interruptedIndicator.current = null;
    progress.stopAnimation(); progress.setValue(1);
    if (swipePosition || appearance === "standard" || !destination) {
      previousIndicator.current = null; recipeRef.current = null; setIndicatorRecipe(null); return;
    }
    const previous = previousIndicator.current;
    const animate = previous && previous.value !== selected && !environment.reducedMotion && AppState.currentState === "active";
    const recipe = resolveTabIndicator(animate ? interrupted ?? previous.rect : destination, destination, appearance);
    recipeRef.current = recipe;
    setIndicatorRecipe(recipe);
    previousIndicator.current = { value: selected, rect: destination };
    if (!animate) return;
    progress.setValue(0);
    // Width morphing must use the JS driver; transforms alone would distort the pill corners.
    // Plain sliding translates the shared standard curve; explicit gooey keeps
    // its established native timing so existing consumers do not change feel.
    const animation = Animated.timing(progress, { toValue: 1, duration: recipe.duration, useNativeDriver: false,
      ...(appearance === "slide" ? { easing: Easing.bezier(...easing.standard) } : {}),
    });
    animation.start();
    const stop = () => { animation.stop(); progress.setValue(1); };
    const subscription = AppState.addEventListener("change", state => { if (state !== "active") stop(); });
    return () => {
      interruptedIndicator.current = recipeRef.current ? sampleTabIndicator(recipeRef.current, progressFrame.current) : null;
      stop(); subscription.remove();
    };
  }, [appearance, selected, destination, environment.reducedMotion, progress, swipePosition]);


  useLayoutEffect(() => {
    if (!swipePosition || orientation !== "horizontal") return;
    const place = (position = swipePosition.get()) => {
      const rect = resolveSwipeTabIndicator(tabItems.map(item => indicatorRects[item.id]), position);
      if (!rect) return;
      swipeX.setValue(rect.x); swipeWidth.setValue(rect.width);
    };
    place();
    return swipePosition.subscribe(place);
  }, [swipePosition, indicatorRects, orientation, swipeX, swipeWidth, tabItems]);
  useEffect(() => {
    if (!controlled && !storedValueValid) setSelected(collectionFallback);
  }, [collectionFallback, controlled, setSelected, storedValueValid]);
  useEffect(() => {
    if (!descriptors.some((item) => item.id === focusValue && !item.disabled)) {
      setFocusValue(selected);
    }
  }, [descriptors, focusValue, selected]);
  useEffect(() => {
    setVisited((current) => {
      const known = new Set(tabItems.map((item) => item.id));
      const next = new Set([...current].filter((id) => known.has(id)));
      next.add(selected);
      if (next.size === current.size && [...next].every((id) => current.has(id))) return current;
      return next;
    });
  }, [tabItems, selected]);

  const focusTab = (target: Value) => {
    setFocusValue(target);
    if (activationMode === "automatic") setSelected(target);
    queueMicrotask(() => {
      const node = tabRefs.current.get(target);
      if (!node) return;
      // On web the tab is a real focusable element, so DOM focus is what moves
      // the caret; `setAccessibilityFocus` is an iOS/Android-only bridge call.
      if (isWebRenderer) {
        (node as unknown as { focus?: () => void }).focus?.();
        return;
      }
      const handle = findNodeHandle(node);
      if (typeof handle === "number") AccessibilityInfo.setAccessibilityFocus(handle);
    });
  };
  const moveFocus = (from: Value, intent: "next" | "previous" | "first" | "last") => {
    const target = getTabNavigationTarget(descriptors, from, intent, loop);
    if (target !== undefined) focusTab(target);
  };
  // Panel flexGrow preserves intrinsic height in auto-sized stacks; flex:1 collapsed it to zero.
  const hasPanels = renderPanels &&
    (children !== undefined || tabItems.some((item) => item.panel !== undefined));

  return (
    <View
      accessibilityLabel={label}
      style={[
        {
          direction,
          flexDirection: orientation === "vertical" ? "row" : "column",
          gap: spacing.md,
        },
        layoutStyle,
      ]}
    >
      <ScrollView
        ref={tabScroll}
        onLayout={event => setTabViewport(event.nativeEvent.layout.width)}
        onContentSizeChange={width => setTabContentWidth(width)}
        nativeID={id}
        accessibilityLabel={label}
        accessibilityRole="tablist"
        horizontal={orientation === "horizontal"}
        scrollEnabled={scrollable && !fitted}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            borderBottomColor: orientation === "horizontal" && mark.listDivider
              ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
              : undefined,
            borderBottomWidth: orientation === "horizontal" && mark.listDivider
              ? tabsRecipe.indicatorHeight / 2
              : 0,
            borderEndColor: orientation === "vertical" && mark.listDivider
              ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
              : undefined,
            borderEndWidth: orientation === "vertical" && mark.listDivider
              ? tabsRecipe.indicatorHeight / 2
              : 0,
            // The filled pill keeps tabsRecipe.gap between tabs so neighbouring pills never touch.
            gap: filled ? tabsRecipe.gap : undefined,
            direction,
            flexGrow: fitted ? 1 : 0,
            flexDirection: orientation === "vertical" ? "column" : "row",
            // The divider lives on the content container, so it must span the viewport like Web .hjm-tabs__list;
            // content-width containers cut it off after the last tab (2026-10-17 review N7).
            minWidth: orientation === "horizontal" ? tabViewport : undefined,
          },
        ]}
      >
        {movingIndicator && (indicatorRecipe || swipePosition) ? <Animated.View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{
          // The filled pill spans the tab height and moves behind the labels (rendered before the tabs).
          ...(filled && mark.background
            ? { position: "absolute", top: 0, bottom: 0, borderRadius: theme.tokens.radius[mark.radius], backgroundColor: resolveColorReference(mark.background, theme.palette) }
            : { position: "absolute", bottom: 0, height: appearance === "gooey" ? 6 : tabsRecipe.indicatorHeight, borderRadius: theme.tokens.radius.full, backgroundColor: resolveColorReference(tabsRecipe.colors.indicator, theme.palette) }),
          left: swipePosition ? swipeX : progress.interpolate({ inputRange: [...indicatorRecipe!.input], outputRange: [...indicatorRecipe!.x] }),
          width: swipePosition ? swipeWidth : progress.interpolate({ inputRange: [...indicatorRecipe!.input], outputRange: [...indicatorRecipe!.width] }),
        }} /> : null}
        {tabItems.map((item) => {
          const active = selected === item.id;
          return (
            <Pressable
              key={item.id}
              onLayout={orientation === "horizontal" ? event => {
                const { x, width } = event.nativeEvent.layout;
                if (width <= 0) return;
                setIndicatorRects(current => current[item.id]?.x === x && current[item.id]?.width === width ? current : { ...current, [item.id]: { x, width } });
              } : undefined}
              nativeID={id ? getTabId(id, item.id) : undefined}
              role={Platform.OS === "ios" ? "button" : "tab"}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              accessibilityActions={[
                { name: "activate" },
                { name: "increment" },
                { name: "decrement" },
              ]}
              accessibilityLabel={
                item.badge
                  ? `${item.label}, ${item.badgeAccessibilityLabel ?? item.badge}`
                  : item.label
              }
              accessibilityRole="tab"
              accessibilityState={{ disabled: item.disabled === true, selected: active }}
              {...webOnly(webTabProps({
                selected: active,
                disabled: item.disabled === true,
                // aria-controls must name a rendered panel; a Tabs without
                // panels has nothing for it to point at.
                controls: id && hasPanels ? getTabPanelId(id, item.id, panelMode) : undefined,
                focused: focusValue === item.id,
                orientation,
                direction,
                onActivate: () => {
                  setFocusValue(item.id);
                  setSelected(item.id);
                },
                onMoveFocus: (intent) => moveFocus(item.id, intent),
              }))}
              disabled={item.disabled}
              onAccessibilityAction={(event) => {
                if (item.disabled) return;
                const action = event.nativeEvent.actionName;
                if (action === "activate") setSelected(item.id);
                else if (action === "increment") moveFocus(item.id, "next");
                else if (action === "decrement") moveFocus(item.id, "previous");
              }}
              onFocus={() => {
                if (item.disabled) return;
                setFocusValue(item.id);
                if (activationMode === "automatic") setSelected(item.id);
              }}
              onPress={() => {
                if (item.disabled) return;
                setFocusValue(item.id);
                setSelected(item.id);
              }}
              style={({ pressed }) => [
                minimumTargetStyle,
                {
                  alignItems: "center",
                  backgroundColor: pressed
                    ? resolveColorReference(tabsRecipe.states.pressedBackground, theme.palette)
                    : filled && active && mark.background && !(movingIndicator && (indicatorRecipe || swipePosition))
                      ? resolveColorReference(mark.background, theme.palette)
                      : "transparent",
                  ...(filled && mark.radius ? { borderRadius: theme.tokens.radius[mark.radius] } : {}),
                  direction,
                  flex: fitted ? 1 : undefined,
                  flexDirection: "row",
                  gap: tabsRecipe.gap,
                  justifyContent: "center",
                  minHeight: sizeContract.minHeight,
                  opacity: item.disabled ? tabsRecipe.states.disabledOpacity : 1,
                  paddingHorizontal: sizeContract.paddingHorizontal,
                  position: "relative",
                },
              ]}
            >
              {item.renderLeading ? (
                <View
                  accessibilityElementsHidden
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                >
                  {item.renderLeading({
                    selected: active,
                    disabled: item.disabled === true,
                    color: resolveColorReference(
                      active ? mark.selectedContent : tabsRecipe.colors.idle,
                      theme.palette,
                    ),
                    size: glyph[tabsRecipe.icon.glyph],
                  })}
                </View>
              ) : null}
              <Text
              fontRole="ui"
                align="center"
                style={{
                  color: resolveColorReference(
                    active ? mark.selectedContent : tabsRecipe.colors.idle,
                    theme.palette,
                  ),
                  fontWeight: active
                    ? tabsRecipe.label.selectedFontWeight
                    : tabsRecipe.label.fontWeight,
                }}
                variant={sizeContract.textVariant}
              >
                {item.label}
              </Text>
              {item.badge ? (
                <View
                  accessible={false}
                  style={{
                    backgroundColor: colors.bg,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.xs,
                  }}
                >
                  <Text align="center" tone="brand" variant="caption">{item.badge}</Text>
                </View>
              ) : null}
              {active && !filled && (!movingIndicator || (!indicatorRecipe && !swipePosition)) ? (
                <View
                  accessibilityElementsHidden
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  style={{
                    backgroundColor: resolveColorReference(
                      tabsRecipe.colors.indicator,
                      theme.palette,
                    ),
                    ...(orientation === "horizontal"
                      ? {
                          bottom: -tabsRecipe.indicatorHeight / 2,
                          height: tabsRecipe.indicatorHeight,
                          left: 0,
                          right: 0,
                        }
                      : {
                          bottom: 0,
                          end: -tabsRecipe.indicatorHeight / 2,
                          top: 0,
                          width: tabsRecipe.indicatorHeight,
                        }),
                    position: "absolute",
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      {hasPanels ? panelMode === "dynamic" ? (
        <View
          accessibilityLabel={tabItems.find((item) => item.id === selected)?.panelAccessibilityLabel}
          accessibilityLabelledBy={id ? getTabId(id, selected) : undefined}
          nativeID={id ? getDynamicTabPanelId(id) : undefined}
          importantForAccessibility="yes"
          role="tabpanel"
          style={{ flexGrow: 1, flexShrink: 1 }}
        >
          {tabItems.find((item) => item.id === selected)?.panel ?? children?.(selected)}
        </View>
      ) : tabItems.map((item) => {
        const active = item.id === selected;
        const mounted = mountPolicy === "always" ||
          (mountPolicy === "visited" && (visited.has(item.id) || active)) ||
          (mountPolicy === "active" && active);
        if (!mounted) return null;
        return (
          <View
            key={item.id}
            accessibilityLabel={item.panelAccessibilityLabel}
            accessibilityLabelledBy={id ? getTabId(id, item.id) : undefined}
            nativeID={id ? getTabPanelId(id, item.id) : undefined}
            importantForAccessibility={active ? "yes" : "no-hide-descendants"}
            role="tabpanel"
            style={{ display: active ? "flex" : "none", flexGrow: 1, flexShrink: 1 }}
          >
            {item.panel ?? children?.(item.id)}
          </View>
        );
      }) : null}
    </View>
  );
}

export type BottomNavigationIconRenderProps<
  Key extends string = string,
  IconName extends string = string,
> = Readonly<{
  item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
  name: IconName;
  selected: boolean;
  color: string;
  size: number;
  strokeWidth: number;
}>;

export type BottomNavigationBadgeRenderProps<
  Key extends string = string,
  IconName extends string = string,
> = Readonly<{
  item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
  badge: ResolvedBottomNavigationCounterBadge;
  count: number;
  max?: number;
  selected: boolean;
}>;

export type BottomNavigationProps<
  Key extends string = string,
  IconName extends string = string,
> = Readonly<{
  descriptor: BottomNavigationDescriptor<Key, IconName>;
  onActivate: (activation: BottomNavigationActivation<Key>) => void;
  /** Optional router adapter for tabLongPress or an equivalent intent. */
  onLongActivate?: (activation: BottomNavigationActivation<Key>) => void;
  renderIcon: (props: BottomNavigationIconRenderProps<Key, IconName>) => ReactNode;
  /** Product badge adapter; its subtree remains hidden from accessibility. */
  renderBadge?: (props: BottomNavigationBadgeRenderProps<Key, IconName>) => ReactNode;
  getItemTestID?: (
    item: ResolvedBottomNavigationItemDescriptor<Key, IconName>,
  ) => string | undefined;
  /** Centered sibling action. Pair with `distribution: "center-gap"`. */
  primaryAction?: ReactNode;
  configuration?: BottomNavigationConfiguration;
  safeAreaBottom?: number;
  /**
   * `inline` (default) takes its own height in the host layout, as a navigator tab bar does. `overlay` pins the
   * bar to the bottom of its host over the screens, so content scrolls behind a floating bar, and publishes the
   * covered height to the nearest BottomNavigationInsetProvider (ScreenLayout pads by it). Native only: the Web
   * bar is always `position: fixed`, i.e. always an overlay.
   */
  placement?: "inline" | "overlay";
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
        }>;

function useBottomNavigationKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(() => Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export function BottomNavigation<
  Key extends string = string,
  IconName extends string = string,
>({
  descriptor,
  onActivate,
  onLongActivate,
  renderIcon,
  renderBadge,
  getItemTestID,
  primaryAction,
  configuration = {},
  safeAreaBottom = 0,
  placement = "inline",
  layoutStyle,
  ...removedProps
}: BottomNavigationProps<Key, IconName>) {
  assertNoRemovedStyleProps("BottomNavigation", removedProps, ["style", "surfaceStyle", "listStyle", "primaryActionStyle"]);
  const resolved = resolveBottomNavigationDescriptor(descriptor);
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
    throw new RangeError("BottomNavigation safeAreaBottom must be non-negative");
  }
  if (placement !== "inline" && placement !== "overlay") {
    throw new TypeError(`Unsupported BottomNavigation placement: ${String(placement)}`);
  }
  const theme = useHjmNativeTheme();
  const presentation = resolveBottomNavigationConfiguration(
    {
      ...configuration,
      direction: configuration.direction ?? theme.environment.direction,
    },
    resolved.items.length,
  );
  validateBottomNavigationProminence(resolved.items, presentation);
  const capsule = presentation.presentation === "capsule";
  const tile = presentation.selection === "tile";
  const tileRecipe = bottomNavigationRecipe.selectionTile;
  const raised = tile && presentation.surface === "raised";
  const raisedRecipe = bottomNavigationRecipe.raisedSurface;
  // Hidden labels keep the item's accessibilityLabel; only the visible Text row is dropped.
  const labelsVisible = presentation.labels === "visible";
  const expandedLabels = theme.environment.textScale >= 1.5 || resolved.items.length > 4;
  // Controlled providers bake scale into Text's style, so the native multiplier
  // prop cannot enforce the recipe limit (BT-QA-021). Scope labels only; AX names stay.
  const labelTextScale = Math.min(theme.environment.textScale, bottomNavigationRecipe.largeText.maxFontSizeMultiplier);
  const keyboardVisible = useBottomNavigationKeyboardVisible();
  const density = bottomNavigationRecipe.density[presentation.density];
  const presentationRecipe =
    bottomNavigationRecipe.presentations[presentation.presentation];
  // Floating/capsule presentations own elevation; a flat bar must never gain
  // one just because a profile has a floating token. Keep router state outside.
  // The raised plank's lower edge is its elevation; a floating shadow under it reads as two objects.
  const surfaceShadow = presentationRecipe.shadow && !raised
    ? theme.designProfile?.tokens.shadow.floating ?? presentationRecipe.shadow
    : null;
  const centerGap =
    bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
  // `shape` reframes the floating surface (radius + inner padding); `standard` keeps the presentation recipe.
  const shapeRecipe = presentation.shape === "standard"
    ? null
    : bottomNavigationRecipe.shapes[presentation.shape];
  const surfaceRadius = shapeRecipe
    ? theme.tokens.radius[shapeRecipe.radius]
    : presentationRecipe.radius ? theme.tokens.radius[presentationRecipe.radius] : 0;
  const surfacePadding = shapeRecipe?.surfacePadding ?? 0;
  // Edge items follow the frame's inner curve: the frame radius minus its border and inner padding.
  const edgeItemRadius = Math.max(0, surfaceRadius - presentationRecipe.borderWidth - surfacePadding);
  const lift = presentation.iconEmphasis === "lift"
    ? bottomNavigationRecipe.icon.liftEmphasis
    : null;
  const middleIndex = resolved.items.length / 2 - 1;
  const idleColor = resolveColorReference(
    bottomNavigationRecipe.colors.idle,
    theme.palette,
  );
  const selectedIconColor = resolveColorReference(
    tile ? tileRecipe.selectedContent : bottomNavigationRecipe.colors.selectedIcon,
    theme.palette,
  );
  const selectedLabelColor = resolveColorReference(
    tile ? tileRecipe.selectedContent : bottomNavigationRecipe.colors.selectedLabel,
    theme.palette,
  );
  const pressedBackground = resolveColorReference(
    bottomNavigationRecipe.states.pressedBackground,
    theme.palette,
  );
  const surfaceBackground = resolveColorReference(
    raised ? raisedRecipe.background : tile ? tileRecipe.background : presentationRecipe.background,
    theme.palette,
  );
  const surfaceBorder = resolveColorReference(
    raised ? raisedRecipe.border : presentationRecipe.border,
    theme.palette,
  );
  const selectedDepthColor = raised
    ? resolveColorReference(raisedRecipe.selectedDepthColor, theme.palette)
    : undefined;
  const badgeMetrics = counterBadgeRecipe.sizes[bottomNavigationRecipe.badge.size];
  const badgeTone = counterBadgeRecipe.tones.danger;
  const badgeVariant = counterBadgeRecipe.variants[bottomNavigationRecipe.badge.variant];
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);
  const destinationRefs = useRef(new Map<Key, ComponentRef<typeof Pressable>>());
  const keyboardFocusKey = resolved.items.some(item => item.id === focusedKey && !item.disabled)
    ? focusedKey : resolved.selectedKey ?? resolved.items.find(item => !item.disabled)?.id;
  const iconSize = presentation.iconSize === "standard"
    ? glyph[density.icon]
    : bottomNavigationRecipe.iconSizes[presentation.iconSize];
  const prominentRecipe = bottomNavigationRecipe.prominentDestination;
  // Lifting by (diameter - indicator height) keeps the prominent label on the other labels' line; an app-icon
  // slot taller than the indicator minimum raises that height.
  const prominentLift = prominentRecipe.diameter - Math.max(bottomNavigationRecipe.indicator.minHeight, iconSize);
  // The lifted circle extends beyond the bar: overlays report it, while inline bars reserve it in flow.
  const prominentOverflow = resolved.items.some((item) => item.prominent)
    ? Math.max(0, prominentLift - density.padding - presentationRecipe.outerPaddingTop)
    : 0;
  const prominentShadow = theme.designProfile?.tokens.shadow.floating ?? prominentRecipe.shadow;
  const hiddenForKeyboard = presentation.keyboardBehavior === "hide" && keyboardVisible;
  const overlay = placement === "overlay";
  const reportInset = useContext(BottomNavigationInsetReporterContext);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  useEffect(() => {
    if (!reportInset || !overlay) return;
    reportInset(hiddenForKeyboard || measuredHeight === 0 ? 0 : measuredHeight + prominentOverflow);
    return () => reportInset(0);
  }, [reportInset, overlay, hiddenForKeyboard, measuredHeight, prominentOverflow]);

  if (hiddenForKeyboard) return null;

  return (
    <View
      pointerEvents={overlay ? "box-none" : undefined}
      onLayout={overlay ? (event) => setMeasuredHeight(event.nativeEvent.layout.height) : undefined}
      style={[
        {
          ...(overlay ? { bottom: 0, left: 0, position: "absolute" as const, right: 0 } : {}),
          backgroundColor:
            presentation.presentation === "bar" ? surfaceBackground : "transparent",
          direction: presentation.direction,
          paddingBottom:
            safeAreaBottom + bottomNavigationRecipe.safeArea.minimumBottomPadding,
          paddingHorizontal: presentationRecipe.outerPaddingHorizontal,
          // Reserve the circle inside the painted box: margin exposed the scene as a strip below the footer.
          paddingTop: presentationRecipe.outerPaddingTop + (overlay ? 0 : prominentOverflow),
          width: "100%",
        },
        layoutStyle,
      ]}
    >
      <View
        style={[
          {
            alignSelf: "center",
            flexDirection: capsule ? "row" : "column",
            alignItems: capsule ? "center" : undefined,
            gap: capsule ? spacing.xs : 0,
            backgroundColor: capsule ? "transparent" : surfaceBackground,
            borderColor: surfaceBorder,
            borderRadius: surfaceRadius,
            // RN's per-edge zero overrides borderWidth and erased floating's all-edge frame.
            // Capsule's own list paints its border; bar/floating keep the recipe top edge here.
            borderTopWidth:
              capsule ? 0 : presentationRecipe.borderWidth,
            borderWidth:
              presentation.presentation === "floating" ? presentationRecipe.borderWidth : 0,
            // Per-edge width after borderWidth: only the lower edge thickens into the plank side.
            ...(raised ? { borderBottomWidth: raisedRecipe.depth } : {}),
            ...(surfaceShadow ? resolveNativeShadowElevation(surfaceShadow, theme.designProfile !== undefined, 8) : { elevation: 0 }),
            maxWidth: presentationRecipe.maxWidth ?? undefined,
            position: "relative",
            shadowColor: surfaceShadow?.color,
            shadowOffset: surfaceShadow
              ? { width: 0, height: surfaceShadow.offsetY }
              : undefined,
            shadowOpacity: surfaceShadow?.opacity,
            shadowRadius: surfaceShadow?.radius,
            width: "100%",
          },
        ]}
      >
        <View
          accessibilityLabel={resolved.accessibilityLabel}
          accessibilityRole="tablist"
          style={[
            {
              alignItems: capsule ? "stretch" : "flex-start",
              direction: presentation.direction,
              flexDirection: "row",
              width: capsule ? undefined : "100%",
              maxWidth: presentationRecipe.contentMaxWidth ?? undefined,
              alignSelf: capsule ? undefined : "center",
              flex: capsule ? 1 : undefined,
              minWidth: 0,
              padding: tile ? tileRecipe.padding : capsule ? spacing.xxs : surfacePadding,
              gap: tile ? tileRecipe.gap : 0,
              backgroundColor: capsule ? surfaceBackground : undefined,
              borderRadius: capsule ? radius.full : undefined,
              borderWidth: capsule ? presentationRecipe.borderWidth : 0,
              borderColor: surfaceBorder,
            },
          ]}
        >
          {resolved.items.map((item, index) => {
            const selected = item.id === resolved.selectedKey;
            const focused = focusedKey === item.id;
            const sourceBadge = descriptor.items[index]?.badge;
            return (
              <Pressable
                key={item.id}
                // React Native maps `tab` to UIAccessibilityTraitNone on iOS
                // (RCTViewManager.m), so `accessibilityRole` alone leaves the
                // item with no trait: VoiceOver reads the name and never says
                // it can be activated. Same branch `Tabs` above already uses.
                role={Platform.OS === "ios" ? "button" : "tab"}
                accessibilityLabel={item.resolvedAccessibilityLabel}
                accessibilityRole="tab"
                accessibilityState={{ disabled: item.disabled, selected }}
                ref={node => { if (node) destinationRefs.current.set(item.id, node); else destinationRefs.current.delete(item.id); }}
                // RN Web omits accessibilityState.selected. Share Tabs' DOM state and
                // manual keyboard activation; arrow focus must not navigate routes by itself.
                {...webOnly(webTabProps({ selected, disabled: item.disabled, controls: undefined,
                  focused: keyboardFocusKey === item.id, orientation: "horizontal", direction: presentation.direction,
                  onActivate: () => {
                    const activation = resolveBottomNavigationActivation(descriptor, item.id);
                    if (activation) onActivate(activation);
                  },
                  onMoveFocus: intent => {
                    const target = getTabNavigationTarget(resolved.items, item.id, intent, tabsBehaviorDefaults.loop);
                    if (target === undefined) return;
                    setFocusedKey(target);
                    queueMicrotask(() => (destinationRefs.current.get(target) as unknown as { focus?: () => void } | undefined)?.focus?.());
                  },
                }))}
                disabled={item.disabled}
                onBlur={() => {
                  setFocusedKey((current) => current === item.id ? null : current);
                }}
                onFocus={() => setFocusedKey(item.id)}
                onLongPress={onLongActivate
                  ? () => {
                      const activation = resolveBottomNavigationActivation(
                        descriptor,
                        item.id,
                      );
                      if (activation) onLongActivate(activation);
                    }
                  : undefined}
                onPress={() => {
                  const activation = resolveBottomNavigationActivation(descriptor, item.id);
                  if (activation) onActivate(activation);
                }}
                testID={getItemTestID?.(item)}
                style={({ pressed }) => [
                  minimumTargetStyle,
                  {
                    alignItems: "center",
                    backgroundColor: tile && selected
                      ? resolveColorReference(tileRecipe.selectedBackground, theme.palette)
                      : pressed ? pressedBackground : capsule && selected ? theme.colors.surfaceAccent : "transparent",
                    borderRadius: tile ? theme.tokens.radius[tileRecipe.radius] : capsule ? radius.full : theme.tokens.radius.lg,
                    // Every raised tile reserves the edge so selection never shifts icon/label rows.
                    // The translucent edge composites over the brand fill, darkening it.
                    ...(raised ? {
                      borderBottomWidth: raisedRecipe.selectedDepth,
                      borderBottomColor: selected ? selectedDepthColor : "transparent",
                    } : {}),
                    // Floating edge items touch the frame. Their pressed fill must follow its
                    // inner curve; the smaller generic radius painted over the border in Spint.
                    // Match corners instead of clipping the whole surface (which clips shadows/focus).
                    ...(presentation.presentation === "floating" && !tile ? {
                      ...(index === 0 ? {
                        borderTopStartRadius: edgeItemRadius,
                        borderBottomStartRadius: edgeItemRadius,
                      } : {}),
                      ...(index === resolved.items.length - 1 ? {
                        borderTopEndRadius: edgeItemRadius,
                        borderBottomEndRadius: edgeItemRadius,
                      } : {}),
                    } : {}),
                    flexDirection: capsule && !expandedLabels ? "row" : "column",
                    flex: capsule && selected && !expandedLabels ? 2 : 1,
                    flexShrink: 1,
                    gap: density.gap,
                    // Icon-only items center the indicator instead of leaving an empty label row.
                    justifyContent: capsule || !labelsVisible ? "center" : "flex-start",
                    marginEnd: index === middleIndex ? centerGap : 0,
                    minHeight: density.itemMinHeight,
                    minWidth: capsule ? 44 : density.itemMinWidth,
                    opacity: item.disabled
                      ? bottomNavigationRecipe.states.disabledOpacity
                      : 1,
                    outlineColor: focused
                      ? resolveColorReference(
                          bottomNavigationRecipe.states.focus.color,
                          theme.palette,
                        )
                      : "transparent",
                    outlineOffset: focused
                      ? bottomNavigationRecipe.states.focus.offset
                      : 0,
                    outlineStyle: focused ? "solid" : undefined,
                    outlineWidth: focused
                      ? bottomNavigationRecipe.states.focus.width
                      : 0,
                    padding: density.padding,
                  },
                ]}
              >
                <View
                  accessibilityElementsHidden
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  style={item.prominent ? {
                    alignItems: "center",
                    backgroundColor: resolveColorReference(prominentRecipe.background, theme.palette),
                    borderRadius: prominentRecipe.diameter / 2,
                    height: prominentRecipe.diameter,
                    justifyContent: "center",
                    marginTop: -prominentLift,
                    position: "relative",
                    width: prominentRecipe.diameter,
                    ...resolveNativeShadowElevation(prominentShadow, theme.designProfile !== undefined, 8),
                    shadowColor: prominentShadow.color,
                    shadowOffset: { width: 0, height: prominentShadow.offsetY },
                    shadowOpacity: prominentShadow.opacity,
                    shadowRadius: prominentShadow.radius,
                  } : {
                    alignItems: "center",
                    borderRadius: theme.tokens.radius[bottomNavigationRecipe.indicator.radius],
                    borderWidth: bottomNavigationRecipe.indicator.borderWidth,
                    justifyContent: "center",
                    minHeight: bottomNavigationRecipe.indicator.minHeight,
                    minWidth: bottomNavigationRecipe.indicator.minWidth,
                    position: "relative",
                    transform: [
                      // `lift` raises the selected icon (and its badge) on top of the shared selected scale.
                      ...(lift && selected ? [{ translateY: lift.translateY }] : []),
                      {
                        scale: selected
                          ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                          : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                      },
                    ],
                  }}
                >
                  {(() => {
                    const icon = renderIcon({
                      item,
                      name: item.icon.name,
                      selected,
                      color: item.prominent
                        ? resolveColorReference(prominentRecipe.content, theme.palette)
                        : selected ? selectedIconColor : idleColor,
                      size: item.prominent ? glyph[prominentRecipe.icon] : iconSize,
                      strokeWidth: selected
                        ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                        : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                    });
                    // Lift dims idle artwork only: the counter badge is a sibling and keeps full contrast, and the
                    // prominent circle keeps its full brand fill (prominentDestination).
                    return lift && !item.prominent && !selected
                      ? <View style={{ opacity: lift.idleOpacity }}>{icon}</View>
                      : icon;
                  })()}
                  {item.badge && sourceBadge ? (
                    <View
                      accessibilityElementsHidden
                      accessible={false}
                      importantForAccessibility="no-hide-descendants"
                      style={{
                        end: bottomNavigationRecipe.badge.anchor.inlineEnd,
                        position: "absolute",
                        top: bottomNavigationRecipe.badge.anchor.blockStart,
                      }}
                    >
                      {renderBadge ? renderBadge({
                        item,
                        badge: item.badge,
                        count: sourceBadge.count,
                        ...(sourceBadge.max === undefined ? {} : { max: sourceBadge.max }),
                        selected,
                      }) : (
                        <View
                          style={{
                            alignItems: "center",
                            backgroundColor: resolveColorReference(
                              badgeTone.background,
                              theme.palette,
                            ),
                            borderColor: badgeVariant.border
                              ? resolveColorReference(badgeVariant.border, theme.palette)
                              : "transparent",
                            borderRadius: theme.tokens.radius[counterBadgeRecipe.radius],
                            borderWidth: badgeVariant.borderWidth,
                            justifyContent: "center",
                            minHeight: badgeMetrics.height,
                            minWidth: badgeMetrics.minWidth,
                            paddingHorizontal: badgeMetrics.paddingHorizontal,
                          }}
                        >
                          <Text
                            accessible={false}
                            align="center"
                            style={{
                              color: resolveColorReference(badgeTone.content, theme.palette),
                              fontWeight: counterBadgeRecipe.fontWeight,
                            }}
                            variant={badgeMetrics.textVariant}
                          >
                            {item.badge.visibleLabel}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
                {labelsVisible && (!capsule || expandedLabels || selected) && <HjmNativeProvider
                  textScale={labelTextScale}
                ><Text
                  align="center"
                  allowFontScaling={bottomNavigationRecipe.largeText.allowFontScaling}
                  maxFontSizeMultiplier={
                    bottomNavigationRecipe.largeText.maxFontSizeMultiplier
                  }
                  style={{
                    color: selected ? selectedLabelColor : idleColor,
                    flexShrink: 1,
                    fontWeight: selected
                      ? bottomNavigationRecipe.label.selectedFontWeight
                      : bottomNavigationRecipe.label.fontWeight,
                    minWidth: 0,
                  }}
                  variant={density.label}
                >
                  {item.label}
                </Text></HjmNativeProvider>}
              </Pressable>
            );
          })}
        </View>
        {primaryAction ? (
          <View
            pointerEvents="box-none"
            style={[
              {
                alignItems: "center",
                bottom: 0,
                justifyContent: "center",
                left: 0,
                position: "absolute",
                right: 0,
                top: 0,
              },
              // Keep creation outside route destinations; absolute center placement overlaps capsule labels.
              capsule ? { position: "relative", left: undefined, right: undefined, top: undefined, bottom: undefined, flexShrink: 0 } : undefined,
            ]}
          >
            {primaryAction}
          </View>
        ) : null}
      </View>
    </View>
  );
}

type TopBarActionHostProps = Omit<
  PressableProps,
  | "accessible"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "children"
  | "disabled"
  | "onPress"
  | "role"
  | "style"
>;

export type TopBarActionControlProps = TopBarActionHostProps & Readonly<{
  accessible: true;
  accessibilityLabel: string;
  accessibilityRole: "button" | "link";
  accessibilityState: NonNullable<PressableProps["accessibilityState"]>;
  children: ReactNode;
  disabled: boolean;
  onPress: NonNullable<PressableProps["onPress"]>;
  role: "button" | "link";
  style: NonNullable<PressableProps["style"]>;
}>;

export type TopBarLinkRenderProps = TopBarActionControlProps & Readonly<{
  destination: LinkDestination;
}>;

type TopBarActionBaseProps = TopBarActionHostProps & Readonly<{
  /** Visible micro copy and the default accessible name; products own localization. */
  label: string;
  accessibilityLabel?: string;
  accessibilityState?: PressableProps["accessibilityState"];
  children: ReactNode;
  disabled?: boolean;
  /** Back/close affordances may keep the product label accessibility-only. */
  labelVisibility?: "visible" | "accessibility-only";
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  }>;

type TopBarButtonActionProps = TopBarActionBaseProps & Readonly<{
  intent?: "button";
  onPress: NonNullable<PressableProps["onPress"]>;
  destination?: never;
  onNavigate?: never;
  renderAction?: (props: TopBarActionControlProps) => ReactElement;
  renderLink?: never;
}>;

type TopBarLinkActionProps = TopBarActionBaseProps & Readonly<{
  intent: "link";
  destination: LinkDestination;
  /** Optional when the router adapter owns activation (for example Expo Router `Link`). */
  onNavigate?: (destination: LinkDestination) => void | Promise<void>;
  onPress?: never;
  renderAction?: never;
  renderLink?: (props: TopBarLinkRenderProps) => ReactElement;
}>;

export type TopBarActionProps = TopBarButtonActionProps | TopBarLinkActionProps;

/** Recipe-owned icon-over-micro-label action for Native screen chrome. */
export function TopBarAction(props: TopBarActionProps) {
  const {
    label,
    accessibilityLabel,
    accessibilityState,
    children,
    disabled = false,
    labelVisibility = "visible",
    layoutStyle,
    ...intentAndHostProps
  } = props;
  assertNoRemovedStyleProps("TopBarAction", props, ["style", "labelStyle"]);
  if (!label.trim()) throw new TypeError("TopBarAction label must not be empty");
  const resolvedAccessibilityLabel = accessibilityLabel ?? label;
  if (!resolvedAccessibilityLabel.trim()) {
    throw new TypeError("TopBarAction accessibilityLabel must not be empty");
  }
  if (children === undefined || children === null || children === false) {
    throw new TypeError("TopBarAction requires icon or visual children");
  }
  const theme = useHjmNativeTheme();
  const intent = props.intent ?? "button";
  const hostProps: TopBarActionHostProps = intent === "link"
    ? (() => {
        const { intent: _intent, destination: _destination, onNavigate: _onNavigate, renderLink: _renderLink, ...rest } = intentAndHostProps as Omit<TopBarLinkActionProps, keyof TopBarActionBaseProps> & TopBarActionHostProps;
        return rest;
      })()
    : (() => {
        const { intent: _intent, onPress: _onPress, renderAction: _renderAction, ...rest } = intentAndHostProps as Omit<TopBarButtonActionProps, keyof TopBarActionBaseProps> & TopBarActionHostProps;
        return rest;
      })();
  const handlePress: NonNullable<PressableProps["onPress"]> = (event) => {
    if (disabled) return;
    if (props.intent === "link") {
      void props.onNavigate?.(props.destination);
    } else {
      props.onPress(event);
    }
  };
  const controlProps: TopBarActionControlProps = {
    ...hostProps,
    accessible: true,
    accessibilityLabel: resolvedAccessibilityLabel,
    accessibilityRole: intent,
    accessibilityState: { ...accessibilityState, disabled },
    children: (
      <>
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          {children}
        </View>
        {labelVisibility === "visible" ? (
          <Text
            accessible={false}
            style={[
              {
                color: resolveColorReference(topBarRecipe.actionLabel.color, theme.palette),
                fontWeight: topBarRecipe.actionLabel.fontWeight,
              },
            ]}
            variant={topBarRecipe.actionLabel.textVariant}
          >
            {label}
          </Text>
        ) : null}
      </>
    ),
    disabled,
    onPress: handlePress,
    role: intent,
    style: ({ pressed }) => [
      {
        alignItems: "center",
        direction: theme.environment.direction,
        gap: topBarRecipe.action.gap,
        justifyContent: "center",
        minHeight: topBarRecipe.action.minHeight,
        minWidth: topBarRecipe.action.minWidth,
        opacity: disabled
          ? topBarRecipe.action.disabledOpacity
          : pressed
            ? topBarRecipe.action.pressedOpacity
            : 1,
        paddingHorizontal: topBarRecipe.action.paddingHorizontal,
      },
      layoutStyle,
    ],
  };
  if (props.intent === "link") {
    if (!props.renderLink && !props.onNavigate) {
      throw new TypeError("TopBarAction link intent requires renderLink or onNavigate");
    }
    const linkProps = { ...controlProps, destination: props.destination };
    return props.renderLink?.(linkProps) ?? <Pressable {...controlProps} />;
  }
  return props.renderAction?.(controlProps) ?? <Pressable {...controlProps} />;
}

export type TopBarProps = Readonly<{
  title?: string;
  /** Product control in the shared title slot; exclusive with text title affordances. */
  titleContent?: ReactNode;
  /** @deprecated Header supporting copy is no longer displayed; retained until the next major API cleanup. */
  subtitle?: string;
  /** Optional visual before the title, such as a small product avatar. */
  titleLeading?: ReactNode;
  /** Makes the complete title slot a named 44pt action. */
  onTitlePress?: NonNullable<PressableProps["onPress"]>;
  titleAccessibilityLabel?: string;
  titleAccessibilityHint?: string;
  /** Leaving this screen: icon-only back/close fixed at the leading edge (2026-10-17). Exclusive with `leading`. */
  exit?: ScreenExit;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Semantic alias for trailing actions; do not combine with `trailing`. */
  actions?: ReactNode;
  centered?: boolean;
  safeAreaTop?: number;
  /** Share a product scene behind the bar without replacing its layout or controls. */
  surface?: "default" | "transparent";
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
        }>;

/** Native screen top bar with logical action slots and large-text reflow. */
export function TopBar({
  title,
  titleContent: customTitleContent,
  subtitle,
  titleLeading,
  onTitlePress,
  titleAccessibilityLabel,
  titleAccessibilityHint,
  exit,
  leading: leadingSlot,
  trailing,
  actions,
  centered = topBarRecipe.defaults.centered,
  safeAreaTop = 0,
  surface = "default",
  layoutStyle,
  ...removedProps
}: TopBarProps) {
  assertNoRemovedStyleProps("TopBar", removedProps, ["style", "leadingStyle", "titleStyle", "trailingStyle"]);
  if (exit) validateScreenExit(exit, leadingSlot !== undefined);
  const leading = exit ? <ScreenExitButton {...exit} /> : leadingSlot;
  if (customTitleContent !== undefined && (title !== undefined || subtitle !== undefined || titleLeading !== undefined || onTitlePress !== undefined || titleAccessibilityLabel !== undefined || titleAccessibilityHint !== undefined)) {
    throw new TypeError("TopBar titleContent is exclusive with title affordances");
  }
  if (subtitle !== undefined && !subtitle.trim()) throw new TypeError("TopBar subtitle must not be empty");
  if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) {
    throw new RangeError("TopBar safeAreaTop must be non-negative");
  }
  if (title !== undefined && !title.trim()) {
    throw new TypeError("TopBar title must be omitted or contain non-whitespace copy");
  }
  if (titleAccessibilityLabel !== undefined && !titleAccessibilityLabel.trim()) {
    throw new TypeError("TopBar titleAccessibilityLabel must not be empty");
  }
  const hasLeading = leading !== undefined && leading !== null && leading !== false;
  const hasTrailing = trailing !== undefined && trailing !== null && trailing !== false;
  const hasActions = actions !== undefined && actions !== null && actions !== false;
  if (hasTrailing && hasActions) {
    throw new TypeError("TopBar accepts either trailing or actions, not both");
  }
  const trailingContent = hasTrailing ? trailing : actions;
  const hasTrailingContent = hasTrailing || hasActions;
  const hasTitle = title !== undefined || customTitleContent !== undefined;
  const resolvedTitle = title ?? "";
  if (!hasTitle && (
    subtitle !== undefined ||
    titleLeading !== undefined ||
    onTitlePress !== undefined ||
    titleAccessibilityLabel !== undefined ||
    titleAccessibilityHint !== undefined
  )) {
    throw new TypeError("TopBar title affordance props require a title");
  }
  if (titleAccessibilityHint !== undefined && onTitlePress === undefined) {
    throw new TypeError("TopBar titleAccessibilityHint requires onTitlePress");
  }
  const renderCompactLeadingSlot = hasLeading || (hasTitle && centered);
  const renderCompactTrailingSlot = hasTrailingContent || (hasTitle && centered);
  const theme = useHjmNativeTheme();
  const largeText = theme.environment.textScale >= topBarRecipe.largeTextThreshold;
  const resolvedTitleStyle: StyleProp<TextStyle> = [
    {
      color: resolveColorReference(topBarRecipe.title.color, theme.palette),
      fontWeight: topBarRecipe.title.fontWeight,
    },
  ];
  const renderTitle = (
    containerStyle: StyleProp<ViewStyle>,
    numberOfLines?: number,
  ) => {
    // Match Web: a clickable title is a UI button; a static heading keeps display.
    const titleContent = (
      <>
        {titleLeading !== undefined && titleLeading !== null && titleLeading !== false ? (
          <View
            accessibilityElementsHidden
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            {titleLeading}
          </View>
        ) : null}
        <View style={{ flexShrink: 1, minWidth: 0 }}>
        <Text
          fontRole={onTitlePress ? "ui" : "display"}
          {...(onTitlePress
            ? { accessible: false }
            : {
                accessibilityLabel: titleAccessibilityLabel,
                accessibilityRole: "header" as const,
              })}
          numberOfLines={numberOfLines}
          style={[{ flexShrink: 1, minWidth: 0 }, resolvedTitleStyle]}
          variant={topBarRecipe.title.textVariant}
        >
          {resolvedTitle}
        </Text>
        </View>
      </>
    );
    const commonStyle: StyleProp<ViewStyle> = [
      containerStyle,
      {
        alignItems: "center",
        direction: theme.environment.direction,
        flexDirection: "row",
        gap: topBarRecipe.titleAction.gap,
        justifyContent: centered ? "center" : "flex-start",
        minHeight: topBarRecipe.titleAction.minHeight,
        minWidth: topBarRecipe.titleAction.minWidth,
      },
    ];
    if (customTitleContent !== undefined) return <View accessible={false} style={commonStyle}>{customTitleContent}</View>;
    if (onTitlePress) {
      return (
        <Pressable
          accessible
          accessibilityHint={titleAccessibilityHint}
          accessibilityLabel={titleAccessibilityLabel ?? resolvedTitle}
          accessibilityRole="button"
          onPress={onTitlePress}
          style={({ pressed }) => [
            commonStyle,
            { opacity: pressed ? topBarRecipe.titleAction.pressedOpacity : 1 },
          ]}
        >
          {titleContent}
        </Pressable>
      );
    }
    return (
      <View
        accessible={false}
        style={commonStyle}
      >
        {titleContent}
      </View>
    );
  };
  return (
    <View
      accessibilityRole="toolbar"
      style={[
        {
          alignItems: largeText ? "stretch" : "center",
          backgroundColor: surface === "transparent" ? "transparent" : resolveColorReference(topBarRecipe.background, theme.palette),
          direction: theme.environment.direction,
          flexDirection: largeText ? "column" : "row",
          gap: topBarRecipe.gap,
          minHeight: topBarRecipe.minHeight + safeAreaTop,
          paddingHorizontal: topBarRecipe.paddingHorizontal,
          paddingTop: safeAreaTop,
        },
        layoutStyle,
      ]}
    >
      {largeText ? (
        // These branches have different host hierarchies. Reusing the full-width
        // large row as a compact side slot left Fabric's layout stale after an OS
        // text-size reset; replace that subtree instead of overriding it in apps.
        <Fragment key="large-text">
          {hasLeading || hasTitle ? (
            <View
              style={{
                alignItems: "center",
                direction: theme.environment.direction,
                flexDirection: "row",
                gap: topBarRecipe.gap,
                width: "100%",
              }}
            >
              {hasLeading ? (
                <View
                  style={[
                    {
                      alignItems: "flex-start",
                      direction: theme.environment.direction,
                      flexDirection: "row",
                      minWidth: topBarRecipe.sideMinWidth,
                    },
                  ]}
                >
                  {leading}
                </View>
              ) : null}
              {hasTitle ? (
                renderTitle({ flex: 1, flexShrink: 1, minWidth: 0 })
              ) : null}
              {hasTitle && centered && hasLeading ? (
                <View
                  accessibilityElementsHidden
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  pointerEvents="none"
                  style={{ minWidth: topBarRecipe.sideMinWidth }}
                />
              ) : null}
            </View>
          ) : null}
          {hasTrailingContent ? (
            <View
              style={[
                {
                  direction: theme.environment.direction,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: topBarRecipe.gap,
                  justifyContent: "flex-end",
                  minWidth: topBarRecipe.sideMinWidth,
                  width: "100%",
                },
              ]}
            >
              {trailingContent}
            </View>
          ) : null}
        </Fragment>
      ) : (
        <Fragment key="compact">
          {renderCompactLeadingSlot ? (
            <View
              style={[
                {
                  alignItems: "center",
                  direction: theme.environment.direction,
                  flex: hasTitle ? 1 : undefined,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  minWidth: topBarRecipe.sideMinWidth,
                },
              ]}
            >
              {hasLeading ? leading : null}
            </View>
          ) : null}
          {hasTitle ? (
            // Keep long route titles readable; the screen-chrome contract promises wrapping, while a one-line cap silently hid the rest.
            renderTitle({ flex: 2, flexShrink: 1, minWidth: 0 })
          ) : null}
          {renderCompactTrailingSlot ? (
            <View
              style={[
                {
                  alignItems: "center",
                  direction: theme.environment.direction,
                  flex: hasTitle ? 1 : undefined,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: topBarRecipe.gap,
                  justifyContent: "flex-end",
                  marginStart: hasTitle ? undefined : "auto",
                  minWidth: topBarRecipe.sideMinWidth,
                },
              ]}
            >
              {hasTrailingContent ? trailingContent : null}
            </View>
          ) : null}
        </Fragment>
      )}
    </View>
  );
}

/** Flat and sectioned menus share collection identifiers and rendering slots. */
export type MenuItem<Value extends string = string> = Omit<
  CollectionItemDescriptor<Value>, "textValue"
> & Readonly<{ textValue?: string }>;

export type MenuSection<
  Value extends string = string,
  SectionKey extends string = string,
> = CollectionSectionDescriptor<Value, SectionKey>;

export type MenuOpenChangeReason =
  | "trigger"
  | "selection"
  | "escape"
  | "outside"
  | "programmatic";

export type MenuItemRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: string;
  size: number;
}>;

export type MenuTriggerRenderProps = Readonly<{
  accessibilityState: Readonly<{ busy: boolean; disabled: boolean; expanded: boolean }>;
  onPress: () => void;
}>;

function useMenuAfterDismiss(visible: boolean) {
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const shownRef = useRef(false);
  const previousVisibleRef = useRef(visible);
  const pendingRef = useRef<null | (() => void | Promise<void>)>(null);
  const taskRef = useRef<NativeModalTeardownTask | null>(null);
  const complete = useCallback(() => {
    if (!mountedRef.current || visibleRef.current) return;
    taskRef.current?.cancel();
    taskRef.current = null;
    shownRef.current = false;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void pending();
  }, []);
  useLayoutEffect(() => {
    const wasVisible = previousVisibleRef.current;
    previousVisibleRef.current = visible;
    if (!wasVisible && visible) {
      // Reopening invalidates the previous selection; its late teardown must not run under the new menu.
      generationRef.current += 1;
      taskRef.current?.cancel();
      taskRef.current = null;
      pendingRef.current = null;
      shownRef.current = false;
    }
    if (!wasVisible || visible || shouldAwaitNativeModalDismiss(shownRef.current)) return;
    taskRef.current?.cancel();
    const generation = generationRef.current;
    taskRef.current = scheduleAfterNativeModalTeardown(() => {
      if (generation === generationRef.current) complete();
    });
  }, [complete, visible]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      pendingRef.current = null;
      taskRef.current?.cancel();
    };
  }, []);
  return {
    queue(callback: null | (() => void | Promise<void>)) {
      pendingRef.current = callback;
    },
    onDismiss: complete,
    onShow() {
      shownRef.current = true;
    },
  } as const;
}

export type MenuProps<
  Value extends string = string,
  SectionKey extends string = string,
> = Omit<
  ModalProps,
  | "animationType"
  | "children"
  | "onDismiss"
  | "onRequestClose"
  | "onShow"
  | "style"
  | "transparent"
  | "visible"
> &
  Readonly<{
    triggerLabel: string;
    title?: string;
    items?: readonly MenuItem<Value>[];
    sections?: readonly MenuSection<Value, SectionKey>[];
    source?: CollectionSource<Value, SectionKey>;
    selection?: CollectionSelectionModel<Value>;
    onAction?: (value: Value) => void | Promise<void>;
    onActionAfterDismiss?: (value: Value) => void | Promise<void>;
    onSelectionAfterDismiss?: (value: Value) => void | Promise<void>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: MenuOpenChangeReason) => void;
    onDismiss?: (reason: MenuOpenChangeReason) => void;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    readOnlyLabel?: string;
    asyncState?: AsyncCollectionState;
    onRetry?: () => void;
    retryLabel?: string;
    density?: MenuDensity;
    renderLeading?: (
      item: CollectionItemDescriptor<Value>,
      props: MenuItemRenderProps,
    ) => ReactNode;
    renderTrailing?: (item: CollectionItemDescriptor<Value>) => ReactNode;
    /** Localized accessible name and visible label for dismissing the menu. */
    dismissLabel: string;
    trigger?: ReactNode;
    renderTrigger?: (props: MenuTriggerRenderProps) => ReactElement;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
      }>;

/** Sectioned Native action/selection menu with teardown-safe action callbacks. */
export function Menu<
  Value extends string = string,
  SectionKey extends string = string,
>({
  triggerLabel,
  title = triggerLabel,
  items,
  sections,
  source: sourceProp,
  selection = { mode: "none" },
  onAction,
  onActionAfterDismiss,
  onSelectionAfterDismiss,
  open,
  defaultOpen = false,
  onOpenChange,
  onDismiss,
  disabled = false,
  readOnly = false,
  busy = false,
  readOnlyLabel,
  asyncState = { status: "idle" },
  onRetry,
  retryLabel,
  density = menuRecipe.defaults.density,
  renderLeading,
  renderTrailing,
  dismissLabel,
  trigger,
  renderTrigger,
  layoutStyle,
  ...modalProps
}: MenuProps<Value, SectionKey>) {
  assertNoRemovedStyleProps("Menu", modalProps, ["style"]);
  const providedSources = [sourceProp, items, sections].filter(
    (candidate) => candidate !== undefined,
  ).length;
  if (providedSources !== 1) {
    throw new TypeError("Menu requires exactly one of source, items, or sections");
  }
  const source: CollectionSource<Value, SectionKey> = sourceProp ?? (sections
    ? { sections }
    : {
        items: (items ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          textValue: item.textValue ?? item.label,
          ...(item.description === undefined ? {} : { description: item.description }),
          ...(item.shortcut === undefined ? {} : { shortcut: item.shortcut }),
          ...(item.tone === undefined
            ? {}
            : { tone: item.tone === "danger" ? "danger" : "neutral" }),
          ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
        })),
      });
  validateCollection(source);
  const collectionItems = flattenCollectionItems(source) as readonly CollectionItemDescriptor<Value>[];
  if (collectionItems.length === 0 && asyncState.status === "idle") {
    throw new Error("Menu requires an item or a non-idle asyncState");
  }
  const theme = useHjmNativeTheme();
  const { colors, environment } = theme;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const visible = open ?? uncontrolledOpen;
  const [uncontrolledSingle, setUncontrolledSingle] = useState<Value | null>(
    selection.mode === "single" ? selection.defaultSelectedKey ?? null : null,
  );
  const [uncontrolledMultiple, setUncontrolledMultiple] = useState<ReadonlySet<Value>>(
    selection.mode === "multiple"
      ? selection.defaultSelectedKeys ?? new Set<Value>()
      : new Set<Value>(),
  );
  const selectedSingle = selection.mode === "single"
    ? selection.selectedKey ?? uncontrolledSingle
    : null;
  const selectedMultiple = selection.mode === "multiple"
    ? selection.selectedKeys ?? uncontrolledMultiple
    : new Set<Value>();
  for (const key of selection.mode === "multiple"
    ? selectedMultiple
    : selectedSingle === null ? [] : [selectedSingle]) {
    if (!collectionItems.some((item) => item.id === key)) {
      throw new RangeError(`Menu selection must identify an item: ${key}`);
    }
  }
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const itemRefs = useRef(new Map<Value, ComponentRef<typeof View>>());
  const modalDismiss = useMenuAfterDismiss(visible);
  const densityContract = menuRecipe.density[density];
  const requestOpen = useCallback((next: boolean, reason: MenuOpenChangeReason) => {
    if (next === visible) return;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, reason);
  }, [onOpenChange, open, visible]);
  const close = useCallback((reason: MenuOpenChangeReason, after?: null | (() => void | Promise<void>)) => {
    modalDismiss.queue(async () => {
      const handle = findNodeHandle(triggerRef.current);
      if (typeof handle === "number") AccessibilityInfo.setAccessibilityFocus(handle);
      onDismiss?.(reason);
      await after?.();
    });
    requestOpen(false, reason);
  }, [modalDismiss, onDismiss, requestOpen]);
  useEffect(() => {
    if (visible && (disabled || readOnly)) close("programmatic");
  }, [close, disabled, readOnly, visible]);
  const focusFirstItem = () => {
    const first = collectionItems.find((item) => !item.disabled) ?? collectionItems[0];
    if (!first) return;
    const target = itemRefs.current.get(first.id);
    if (target) {
      const handle = findNodeHandle(target);
      if (typeof handle === "number") AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  const activate = (item: CollectionItemDescriptor<Value>) => {
    if (item.disabled || disabled || readOnly || busy) return;
    if (selection.mode === "single") {
      if (selection.selectedKey === undefined) setUncontrolledSingle(item.id);
      selection.onSelectionChange?.(item.id);
      close("selection", onSelectionAfterDismiss
        ? () => onSelectionAfterDismiss(item.id)
        : null);
      return;
    }
    if (selection.mode === "multiple") {
      const next = new Set(selectedMultiple);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      if (selection.selectedKeys === undefined) setUncontrolledMultiple(next);
      selection.onSelectionChange?.(next);
      return;
    }
    void onAction?.(item.id);
    close("selection", onActionAfterDismiss ? () => onActionAfterDismiss(item.id) : null);
  };
  const renderItem = (item: CollectionItemDescriptor<Value>) => {
    const selected = selection.mode === "single"
      ? selectedSingle === item.id
      : selection.mode === "multiple"
        ? selectedMultiple.has(item.id)
        : false;
    const itemDisabled = item.disabled === true || disabled || readOnly || busy;
    const contentColor = resolveColorReference(
      item.tone === "danger" ? menuRecipe.tones.danger : menuRecipe.tones.neutral,
      theme.palette,
    );
    const leading = renderLeading?.(item, {
      selected,
      disabled: itemDisabled,
      color: resolveColorReference(menuRecipe.leading.color, theme.palette),
      size: glyph[menuRecipe.leading.glyph],
    });
    const trailing = renderTrailing?.(item);
    return (
      <Pressable
        key={item.id}
        ref={(node) => {
          if (node) itemRefs.current.set(item.id, node);
          else itemRefs.current.delete(item.id);
        }}
        accessibilityHint={item.description}
        accessibilityLabel={item.label}
        accessibilityRole="menuitem"
        accessibilityState={{
          disabled: itemDisabled,
          ...(selection.mode === "single" ? { selected } : {}),
          ...(selection.mode === "multiple" ? { checked: selected } : {}),
        }}
        disabled={itemDisabled}
        onPress={() => activate(item)}
        style={({ pressed }) => [
          minimumTargetStyle,
          {
            alignItems: "center",
            backgroundColor: selected
              ? resolveColorReference(densityContract.selectedBackground, theme.palette)
              : pressed
                ? resolveColorReference(densityContract.highlightedBackground, theme.palette)
                : "transparent",
            borderRadius: theme.tokens.radius[densityContract.radius],
            direction: environment.direction,
            flexDirection: "row",
            gap: densityContract.gap,
            minHeight: densityContract.minHeight,
            opacity: itemDisabled ? menuRecipe.states.disabledOpacity : 1,
            paddingHorizontal: densityContract.paddingHorizontal,
          },
        ]}
      >
        {leading ? (
          <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
            {leading}
          </View>
        ) : null}
        <View style={{ flex: 1, gap: spacing.xxs, minWidth: 0 }}>
          <Text
              fontRole="ui" style={{ color: contentColor }} variant={densityContract.label.textVariant}>{item.label}</Text>
          {item.description ? <Text tone="muted" variant={densityContract.description.textVariant}>{item.description}</Text> : null}
        </View>
        {item.shortcut ? <Text accessible={false} tone="muted" variant={menuRecipe.shortcut.textVariant}>{item.shortcut}</Text> : null}
        {trailing ? <View accessibilityElementsHidden accessible={false}>{trailing}</View> : null}
        {selection.mode !== "none" && selected ? <Text accessible={false} tone="brand">✓</Text> : null}
      </Pressable>
    );
  };
  const collection = source.sections ? source.sections.map((section) => (
    <View key={section.id} accessibilityLabel={section.accessibilityLabel ?? section.label}>
      {section.label ? (
        <Text
          style={{
            color: resolveColorReference(menuRecipe.sectionLabel.color, theme.palette),
            paddingHorizontal: menuRecipe.sectionLabel.paddingHorizontal,
            paddingVertical: menuRecipe.sectionLabel.paddingVertical,
          }}
          variant={menuRecipe.sectionLabel.textVariant}
        >
          {section.label}
        </Text>
      ) : null}
      {section.items.map(renderItem)}
    </View>
  )) : collectionItems.map(renderItem);
  const triggerProps: MenuTriggerRenderProps = {
    accessibilityState: { busy, disabled: disabled || readOnly || busy, expanded: visible },
    onPress: () => {
      if (!disabled && !readOnly && !busy) requestOpen(!visible, "trigger");
    },
  };

  return (
    <View style={[layoutStyle]}>
      <View ref={triggerRef}>
        {renderTrigger ? renderTrigger(triggerProps) : (
          <Pressable
            accessibilityHint={readOnly ? readOnlyLabel : undefined}
            accessibilityLabel={triggerLabel}
            accessibilityRole="button"
            accessibilityState={triggerProps.accessibilityState}
            disabled={disabled || readOnly || busy}
            onPress={triggerProps.onPress}
            style={({ pressed }) => [
              minimumTargetStyle,
              {
                alignItems: "center",
                justifyContent: "center",
                opacity: disabled || busy ? menuRecipe.states.disabledOpacity : pressed ? 0.86 : 1,
              },
            ]}
          >
            {trigger ?? <Text tone="brand" variant="label">{triggerLabel}</Text>}
          </Pressable>
        )}
      </View>
      <Modal
        {...modalProps}
        animationType="none"
        onDismiss={modalDismiss.onDismiss}
        onRequestClose={() => close("escape")}
        onShow={() => {
          modalDismiss.onShow();
          focusFirstItem();
        }}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "center", padding: spacing.md }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={() => close("outside")}
            style={{
              backgroundColor: backdrop.modal.color, opacity: backdrop.modal.opacity,
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          />
          <View
            accessibilityLabel={title.trim() || triggerLabel}
            accessibilityRole="menu"
            accessibilityViewIsModal
            style={{
              alignSelf: "center",
              backgroundColor: colors.bg,
              borderRadius: theme.tokens.radius.lg,
              gap: spacing.sm,
              maxHeight: "75%",
              maxWidth: menuRecipe.maxWidth,
              padding: spacing.md,
              width: "100%",
            }}
          >
            {/* Empty titles intentionally hide the heading; rendering an empty Text still reserves a line box. */}
            {title.trim() ? <Text tone="muted" variant="label" align="center">{title}</Text> : null}
            {/* A short action list must size to its content; ScrollView's default growth left empty modal space. */}
            <ScrollView style={{ flexGrow: 0 }}>
              {asyncState.status === "loading" || asyncState.status === "error" || asyncState.status === "empty" ? (
                <View style={{ gap: spacing.sm, minHeight: densityContract.minHeight }}>
                  {asyncState.status === "loading" ? <Spinner label={asyncState.message} /> : (
                    <Text
                      accessibilityLiveRegion={asyncState.status === "error" ? "assertive" : "polite"}
                      accessibilityRole={asyncState.status === "error" ? "alert" : undefined}
                      tone={asyncState.status === "error" ? "danger" : "muted"}
                    >
                      {asyncState.message}
                    </Text>
                  )}
                  {asyncState.status === "error" && onRetry ? (
                    <Button onPress={onRetry} tone="secondary">{retryLabel ?? dismissLabel}</Button>
                  ) : null}
                </View>
              ) : collection}
              {asyncState.status === "loadingMore" ? <Spinner label={asyncState.message} /> : null}
            </ScrollView>
            <View style={{ paddingTop: spacing.xs }}>
              <Button onPress={() => close("programmatic")} tone="ghost">{dismissLabel}</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export type LoadMoreProps = Readonly<{
  descriptor: LoadMoreDescriptor;
  onLoadMore: LoadMoreRequestHandler;
  mode?: LoadMoreMode;
  density?: LoadMoreDensity;
  onRequestOutcome?: (
    outcome: LoadMoreRequestOutcome,
    reason: LoadMoreRequestReason,
  ) => void;
  onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
  /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type LoadMoreHandle = Readonly<{
  /** Pass this method to FlatList.onEndReached through a small callback. */
  onEndReached(): Promise<LoadMoreRequestOutcome>;
}>;

function createNativeLoadMoreControllerFacade() {
  type Controller = ReturnType<typeof createLoadMoreController>;
  let active: Controller | null = null;
  return {
    request(
      state: LoadMoreDescriptor["state"],
      reason: "viewport" | "manual" | "retry",
    ) {
      if (!active) throw new Error("Cannot use a detached LoadMore controller");
      return active.request(state, reason);
    },
    attach(controller: Controller) {
      active = controller;
      return () => {
        if (active === controller) active = null;
      };
    },
  } as const;
}

/** Collection footer that de-duplicates automatic and manual page requests. */
export const LoadMore = forwardRef<LoadMoreHandle, LoadMoreProps>(function LoadMore(
  {
    descriptor,
    onLoadMore,
    mode = loadMoreRecipe.defaults.mode,
    density = loadMoreRecipe.defaults.density,
    onRequestOutcome,
    onRequestError,
    layoutStyle,

  },
  ref,
) {
  validateLoadMoreDescriptor(descriptor);
  const stateRef = useRef(descriptor.state);
  const handlerRef = useRef(onLoadMore);
  stateRef.current = descriptor.state;
  handlerRef.current = onLoadMore;
  const [controllerFacade] = useState(createNativeLoadMoreControllerFacade);
  const requestGeneration = useRef(0);
  const requestActive = useRef(false);
  const lastViewportRequest = useRef<Readonly<{
    mode: LoadMoreMode;
    requestKey: string;
  }> | null>(null);

  useLayoutEffect(() => {
    const controller = createLoadMoreController({
      mode,
      onLoadMore: (request) => handlerRef.current(request),
    });
    const detach = controllerFacade.attach(controller);
    requestGeneration.current += 1;
    requestActive.current = true;
    lastViewportRequest.current = null;
    return () => {
      requestGeneration.current += 1;
      requestActive.current = false;
      detach();
      controller.dispose();
    };
  }, [controllerFacade, mode]);

  const request = useCallback(
    async (reason: LoadMoreRequestReason) => {
      // FlatList may have queued onEndReached before the footer was removed.
      if (!requestActive.current) return "blocked-by-state";
      const generation = requestGeneration.current;
      const state = stateRef.current;
      if (reason === "viewport" && mode === "automatic" && state.status === "ready") {
        const previous = lastViewportRequest.current;
        if (
          previous?.mode === mode &&
          previous.requestKey === state.requestKey
        ) {
          const outcome = "already-requesting" as const;
          onRequestOutcome?.(outcome, reason);
          return outcome;
        }
      }
      try {
        const outcome = await controllerFacade.request(state, reason);
        if (generation !== requestGeneration.current) return outcome;
        // Only a successfully completed viewport request retires its cursor.
        // A blocked next page or a rejection must remain eligible for retry.
        if (outcome === "started" && reason === "viewport" && state.status === "ready") {
          lastViewportRequest.current = { mode, requestKey: state.requestKey };
        }
        onRequestOutcome?.(outcome, reason);
        return outcome;
      } catch (error) {
        if (generation === requestGeneration.current) onRequestError?.(error, reason);
        // The request was accepted and started; product error state arrives
        // through the controlled descriptor and optional callback. Keep the
        // FlatList imperative bridge rejection-free like the Web observer.
        return "started";
      }
    },
    [controllerFacade, mode, onRequestError, onRequestOutcome],
  );

  useImperativeHandle(ref, () => ({
    onEndReached: () => request("viewport"),
  }), [request]);

  const { state, labels } = descriptor;
  const densityContract = loadMoreRecipe.density[density];
  const theme = useHjmNativeTheme();
  return (
    <View
      style={[
        {
          alignItems: "center",
          gap: densityContract.gap,
          paddingVertical: densityContract.paddingVertical,
        },
        layoutStyle,
      ]}
    >
      {state.status === "ready" ? (
        <RecipeButton
          onPress={() => {
            void request("manual").catch(() => undefined);
          }}
          labelStyle={{
            color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
            fontWeight: loadMoreRecipe.trigger.fontWeight,
          }}
          size="small"
          style={{
            borderRadius: theme.tokens.radius[loadMoreRecipe.trigger.radius],
            minHeight: loadMoreRecipe.trigger.minHeight,
            paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
          }}
          tone="link"
        >
          {labels.loadMore}
        </RecipeButton>
      ) : state.status === "loading" ? (
        <View
          accessibilityLabel={labels.loading}
          accessibilityRole="progressbar"
          accessibilityState={{ busy: true }}
          accessible
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: densityContract.gap,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            color={resolveColorReference(
              spinnerRecipe.tones[loadMoreRecipe.spinner.tone],
              theme.palette,
            )}
            size={loadMoreRecipe.spinner.size}
          />
        </View>
      ) : state.status === "error" ? (
        <>
          <Text
            accessibilityLiveRegion="assertive"
            style={{ color: resolveColorReference(loadMoreRecipe.error.color, theme.palette) }}
            variant={loadMoreRecipe.error.textVariant}
          >
            {state.message}
          </Text>
          <RecipeButton
            onPress={() => {
              void request("retry").catch(() => undefined);
            }}
            labelStyle={{
              color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
              fontWeight: loadMoreRecipe.trigger.fontWeight,
            }}
            size="small"
            style={{
              borderRadius: theme.tokens.radius[loadMoreRecipe.trigger.radius],
              minHeight: loadMoreRecipe.trigger.minHeight,
              paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
            }}
            tone="link"
          >
            {labels.retry}
          </RecipeButton>
        </>
      ) : (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: resolveColorReference(loadMoreRecipe.end.color, theme.palette) }}
          variant={loadMoreRecipe.end.textVariant}
        >
          {labels.complete}
        </Text>
      )}
    </View>
  );
});
