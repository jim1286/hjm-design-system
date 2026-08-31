import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  bottomNavigationRecipe,
  counterBadgeRecipe,
  loadMoreRecipe,
  menuRecipe,
  spinnerRecipe,
  tabsRecipe,
  topBarRecipe,
  type MenuDensity,
  type LoadMoreDensity,
  type TabSize,
  type TabsLayout,
  type TabsOverflow,
} from "@hjmds/design-contracts/recipes";
import {
  createLoadMoreController,
  validateLoadMoreDescriptor,
  type LoadMoreDescriptor,
  type LoadMoreMode,
  type LoadMoreRequestHandler,
  type LoadMoreRequestOutcome,
  type LoadMoreRequestReason,
} from "@hjmds/design-contracts/components/load-more";
import type { LinkDestination } from "@hjmds/design-contracts/components/link";
import {
  resolveBottomNavigationActivation,
  resolveBottomNavigationConfiguration,
  resolveBottomNavigationDescriptor,
  type BottomNavigationActivation,
  type BottomNavigationConfiguration,
  type BottomNavigationDescriptor,
  type ResolvedBottomNavigationCounterBadge,
  type ResolvedBottomNavigationItemDescriptor,
} from "@hjmds/design-contracts/components/bottom-navigation";
import {
  getTabNavigationTarget,
  resolveInitialTabValue,
  tabsBehaviorDefaults,
  type TabsActivationMode,
  type TabsDirection,
  type TabsMountPolicy,
  type TabsOrientation,
  type TabsPanelMode,
  type AsyncCollectionState,
  type CollectionItemDescriptor,
  type CollectionSectionDescriptor,
  type CollectionSelectionModel,
} from "@hjmds/design-contracts/behaviors";
import {
  flattenCollectionItems,
  validateCollection,
  type CollectionSource,
} from "@hjmds/design-contracts/components/collection";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  ActivityIndicator,
  AccessibilityInfo,
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

import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import {
  scheduleAfterNativeModalTeardown,
  shouldAwaitNativeModalDismiss,
  type NativeModalTeardownTask,
} from "./internal/modal-lifecycle.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { Spinner } from "./feedback.js";

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

/** @deprecated Use the renderer-neutral `TabItem` with its canonical `id` key. */
export type TabOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
  badge?: string;
  badgeAccessibilityLabel?: string;
  renderLeading?: (appearance: TabLeadingRenderProps) => ReactNode;
  /** Optional localized name for this option's tab panel. */
  panelAccessibilityLabel?: string;
  panel?: ReactNode;
}>;

export type TabLeadingRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: string;
  /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
  size: number;
  /** Compatibility alias for product icon libraries. */
  glyphSize: number;
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
  orientation?: TabsOrientation;
  direction?: TabsDirection;
  loop?: boolean;
  size?: TabSize;
  layout?: TabsLayout;
  overflow?: TabsOverflow;
  /** Set false when panels are rendered separately with `TabPanel`. */
  renderPanels?: boolean;
  children?: (selectedValue: Value) => ReactNode;
  style?: StyleProp<ViewStyle>;
  tabListStyle?: StyleProp<ViewStyle>;
}>;

type TabsCollectionProps<Value extends string> =
  | Readonly<{
      items: readonly TabItem<Value>[];
      options?: never;
    }>
  | Readonly<{
      items?: never;
      /** @deprecated Use the renderer-neutral `items` prop. */
      options: readonly TabOption<Value>[];
    }>;

export type TabsProps<Value extends string = string> = TabsBaseProps<Value> &
  TabsCollectionProps<Value> & TabsSelection<Value>;

function resolveTabItems<Value extends string>(
  items: readonly TabItem<Value>[] | undefined,
  options: readonly TabOption<Value>[] | undefined,
): readonly TabItem<Value>[] {
  if ((items === undefined) === (options === undefined)) {
    throw new TypeError("Tabs requires exactly one of items or options");
  }
  if (items !== undefined) return items;
  return options!.map(({ value, ...option }) => ({ ...option, id: value }));
}

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
  style?: StyleProp<ViewStyle>;
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
  const { tabsId, activeValue, label, children, style } = props;
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
      style={[style, selected ? null : { display: "none" }]}
    >
      {children}
    </View>
  );
}

export function Tabs<Value extends string = string>(props: TabsProps<Value>) {
  const {
    id,
    label,
    items,
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    activationMode = tabsBehaviorDefaults.activationMode,
    mountPolicy = tabsBehaviorDefaults.mountPolicy,
    panelMode = tabsBehaviorDefaults.panelMode,
    orientation = tabsBehaviorDefaults.orientation,
    direction: directionProp,
    loop = tabsBehaviorDefaults.loop,
    size = tabsRecipe.defaults.size,
    layout = tabsRecipe.defaults.layout,
    overflow = tabsRecipe.defaults.overflow,
    renderPanels = true,
    children,
    style,
    tabListStyle,
  } = props;
  if (!label.trim()) throw new TypeError("Tabs label must not be empty");
  if (panelMode === "dynamic" && mountPolicy !== "active") {
    throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
  }
  const tabItems = useMemo(() => resolveTabItems(items, options), [items, options]);
  if (tabItems.length === 0) throw new TypeError("Tabs requires at least one option");
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
  const tabRefs = useRef(new Map<Value, View>());

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
      const handle = findNodeHandle(node);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    });
  };
  const moveFocus = (from: Value, intent: "next" | "previous" | "first" | "last") => {
    const target = getTabNavigationTarget(descriptors, from, intent, loop);
    if (target !== undefined) focusTab(target);
  };
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
        style,
      ]}
    >
      <ScrollView
        nativeID={id}
        accessibilityLabel={label}
        accessibilityRole="tablist"
        horizontal={orientation === "horizontal"}
        scrollEnabled={scrollable && !fitted}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={tabListStyle}
        contentContainerStyle={[
          {
            borderBottomColor: orientation === "horizontal"
              ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
              : undefined,
            borderBottomWidth: orientation === "horizontal"
              ? tabsRecipe.indicatorHeight / 2
              : 0,
            borderEndColor: orientation === "vertical"
              ? resolveColorReference(tabsRecipe.colors.divider, theme.palette)
              : undefined,
            borderEndWidth: orientation === "vertical"
              ? tabsRecipe.indicatorHeight / 2
              : 0,
            direction,
            flexGrow: fitted ? 1 : 0,
            flexDirection: orientation === "vertical" ? "column" : "row",
          },
        ]}
      >
        {tabItems.map((item) => {
          const active = selected === item.id;
          return (
            <Pressable
              key={item.id}
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
              disabled={item.disabled}
              onAccessibilityAction={(event) => {
                const action = event.nativeEvent.actionName;
                if (action === "activate") setSelected(item.id);
                else if (action === "increment") moveFocus(item.id, "next");
                else if (action === "decrement") moveFocus(item.id, "previous");
              }}
              onFocus={() => {
                setFocusValue(item.id);
                if (activationMode === "automatic") setSelected(item.id);
              }}
              onPress={() => {
                setFocusValue(item.id);
                setSelected(item.id);
              }}
              style={({ pressed }) => [
                minimumTargetStyle,
                {
                  alignItems: "center",
                  backgroundColor: pressed
                    ? resolveColorReference(tabsRecipe.states.pressedBackground, theme.palette)
                    : "transparent",
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
                      active ? tabsRecipe.colors.selected : tabsRecipe.colors.idle,
                      theme.palette,
                    ),
                    size: glyph[tabsRecipe.icon.glyph],
                    glyphSize: glyph[tabsRecipe.icon.glyph],
                  })}
                </View>
              ) : null}
              <Text
                align="center"
                style={{
                  color: resolveColorReference(
                    active ? tabsRecipe.colors.selected : tabsRecipe.colors.idle,
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
                    backgroundColor: colors.surfaceAccent,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.xs,
                  }}
                >
                  <Text align="center" tone="brand" variant="caption">{item.badge}</Text>
                </View>
              ) : null}
              {active ? (
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
          style={{ flex: 1 }}
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
            style={{ display: active ? "flex" : "none", flex: 1 }}
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
  style?: StyleProp<ViewStyle>;
  surfaceStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  primaryActionStyle?: StyleProp<ViewStyle>;
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
  style,
  surfaceStyle,
  listStyle,
  primaryActionStyle,
}: BottomNavigationProps<Key, IconName>) {
  const resolved = resolveBottomNavigationDescriptor(descriptor);
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
    throw new RangeError("BottomNavigation safeAreaBottom must be non-negative");
  }
  const theme = useHjmNativeTheme();
  const presentation = resolveBottomNavigationConfiguration(
    {
      ...configuration,
      direction: configuration.direction ?? theme.environment.direction,
    },
    resolved.items.length,
  );
  const keyboardVisible = useBottomNavigationKeyboardVisible();
  const density = bottomNavigationRecipe.density[presentation.density];
  const presentationRecipe =
    bottomNavigationRecipe.presentations[presentation.presentation];
  const centerGap =
    bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
  const middleIndex = resolved.items.length / 2 - 1;
  const idleColor = resolveColorReference(
    bottomNavigationRecipe.colors.idle,
    theme.palette,
  );
  const selectedIconColor = resolveColorReference(
    bottomNavigationRecipe.colors.selectedIcon,
    theme.palette,
  );
  const selectedLabelColor = resolveColorReference(
    bottomNavigationRecipe.colors.selectedLabel,
    theme.palette,
  );
  const pressedBackground = resolveColorReference(
    bottomNavigationRecipe.states.pressedBackground,
    theme.palette,
  );
  const surfaceBackground = resolveColorReference(
    presentationRecipe.background,
    theme.palette,
  );
  const surfaceBorder = resolveColorReference(
    presentationRecipe.border,
    theme.palette,
  );
  const badgeMetrics = counterBadgeRecipe.sizes[bottomNavigationRecipe.badge.size];
  const badgeTone = counterBadgeRecipe.tones.danger;
  const badgeVariant = counterBadgeRecipe.variants[bottomNavigationRecipe.badge.variant];
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);

  if (presentation.keyboardBehavior === "hide" && keyboardVisible) return null;

  return (
    <View
      style={[
        {
          backgroundColor:
            presentation.presentation === "bar" ? surfaceBackground : "transparent",
          direction: presentation.direction,
          paddingBottom:
            safeAreaBottom + bottomNavigationRecipe.safeArea.minimumBottomPadding,
          paddingHorizontal: presentationRecipe.outerPaddingHorizontal,
          paddingTop: presentationRecipe.outerPaddingTop,
          width: "100%",
        },
        style,
      ]}
    >
      <View
        style={[
          {
            alignSelf: "center",
            backgroundColor: surfaceBackground,
            borderColor: surfaceBorder,
            borderRadius: presentationRecipe.radius
              ? radius[presentationRecipe.radius]
              : 0,
            borderTopWidth:
              presentation.presentation === "bar" ? presentationRecipe.borderWidth : 0,
            borderWidth:
              presentation.presentation === "floating" ? presentationRecipe.borderWidth : 0,
            elevation: presentationRecipe.shadow ? 8 : 0,
            maxWidth: presentationRecipe.maxWidth ?? undefined,
            position: "relative",
            shadowColor: presentationRecipe.shadow?.color,
            shadowOffset: presentationRecipe.shadow
              ? { width: 0, height: presentationRecipe.shadow.offsetY }
              : undefined,
            shadowOpacity: presentationRecipe.shadow?.opacity,
            shadowRadius: presentationRecipe.shadow?.radius,
            width: "100%",
          },
          surfaceStyle,
        ]}
      >
        <View
          accessibilityLabel={resolved.accessibilityLabel}
          accessibilityRole="tablist"
          style={[
            {
              alignItems: "flex-start",
              direction: presentation.direction,
              flexDirection: "row",
              width: "100%",
            },
            listStyle,
          ]}
        >
          {resolved.items.map((item, index) => {
            const selected = item.id === resolved.selectedKey;
            const focused = focusedKey === item.id;
            const sourceBadge = descriptor.items[index]?.badge;
            return (
              <Pressable
                key={item.id}
                accessibilityLabel={item.resolvedAccessibilityLabel}
                accessibilityRole="tab"
                accessibilityState={{ disabled: item.disabled, selected }}
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
                    backgroundColor: pressed ? pressedBackground : "transparent",
                    borderRadius: radius.lg,
                    flex: 1,
                    flexShrink: 1,
                    gap: density.gap,
                    justifyContent: "flex-start",
                    marginEnd: index === middleIndex ? centerGap : 0,
                    minHeight: density.itemMinHeight,
                    minWidth: density.itemMinWidth,
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
                  style={{
                    alignItems: "center",
                    borderRadius: radius[bottomNavigationRecipe.indicator.radius],
                    borderWidth: bottomNavigationRecipe.indicator.borderWidth,
                    justifyContent: "center",
                    minHeight: bottomNavigationRecipe.indicator.minHeight,
                    minWidth: bottomNavigationRecipe.indicator.minWidth,
                    position: "relative",
                    transform: [{
                      scale: selected
                        ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                        : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                    }],
                  }}
                >
                  {renderIcon({
                    item,
                    name: item.icon.name,
                    selected,
                    color: selected ? selectedIconColor : idleColor,
                    size: glyph[density.icon],
                    strokeWidth: selected
                      ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                      : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                  })}
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
                            borderRadius: radius[counterBadgeRecipe.radius],
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
                <Text
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
                </Text>
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
              primaryActionStyle,
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
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
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
    labelStyle,
    style,
    ...intentAndHostProps
  } = props;
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
              labelStyle,
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
      style,
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
  /** Optional visual before the title, such as a small product avatar. */
  titleLeading?: ReactNode;
  /** Makes the complete title slot a named 44pt action. */
  onTitlePress?: NonNullable<PressableProps["onPress"]>;
  titleAccessibilityLabel?: string;
  titleAccessibilityHint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Semantic alias for trailing actions; do not combine with `trailing`. */
  actions?: ReactNode;
  centered?: boolean;
  safeAreaTop?: number;
  style?: StyleProp<ViewStyle>;
  leadingStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  trailingStyle?: StyleProp<ViewStyle>;
}>;

/** Native screen top bar with logical action slots and large-text reflow. */
export function TopBar({
  title,
  titleLeading,
  onTitlePress,
  titleAccessibilityLabel,
  titleAccessibilityHint,
  leading,
  trailing,
  actions,
  centered = topBarRecipe.defaults.centered,
  safeAreaTop = 0,
  style,
  leadingStyle,
  titleStyle,
  trailingStyle,
}: TopBarProps) {
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
  const hasTitle = title !== undefined;
  const resolvedTitle = title ?? "";
  if (!hasTitle && (
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
    titleStyle,
  ];
  const renderTitle = (
    containerStyle: StyleProp<ViewStyle>,
    numberOfLines?: number,
  ) => {
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
        <Text
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
          backgroundColor: resolveColorReference(topBarRecipe.background, theme.palette),
          direction: theme.environment.direction,
          flexDirection: largeText ? "column" : "row",
          gap: topBarRecipe.gap,
          minHeight: topBarRecipe.minHeight + safeAreaTop,
          paddingHorizontal: topBarRecipe.paddingHorizontal,
          paddingTop: safeAreaTop,
        },
        style,
      ]}
    >
      {largeText ? (
        <>
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
                    leadingStyle,
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
                trailingStyle,
              ]}
            >
              {trailingContent}
            </View>
          ) : null}
        </>
      ) : (
        <>
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
                leadingStyle,
              ]}
            >
              {hasLeading ? leading : null}
            </View>
          ) : null}
          {hasTitle ? (
            renderTitle({ flex: 2, flexShrink: 1, minWidth: 0 }, 1)
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
                trailingStyle,
              ]}
            >
              {hasTrailingContent ? trailingContent : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

export type MenuItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  textValue?: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  accessibilityHint?: string;
}>;

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
  const shownRef = useRef(false);
  const previousVisibleRef = useRef(visible);
  const pendingRef = useRef<null | (() => void | Promise<void>)>(null);
  const taskRef = useRef<NativeModalTeardownTask | null>(null);
  const complete = useCallback(() => {
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
    if (!wasVisible || visible || shouldAwaitNativeModalDismiss(shownRef.current)) return;
    taskRef.current?.cancel();
    taskRef.current = scheduleAfterNativeModalTeardown(complete);
  }, [complete, visible]);
  useEffect(() => () => taskRef.current?.cancel(), []);
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
    onSelect?: (value: Value) => void | Promise<void>;
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
    style?: StyleProp<ViewStyle>;
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
  onSelect,
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
  style,
  ...modalProps
}: MenuProps<Value, SectionKey>) {
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
          id: item.value,
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
  const legacyItems = new Map((items ?? []).map((item) => [item.value, item] as const));
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
  const triggerRef = useRef<View>(null);
  const itemRefs = useRef(new Map<Value, View>());
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
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
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
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
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
    void onSelect?.(item.id);
    void onAction?.(item.id);
    close("selection", onActionAfterDismiss ? () => onActionAfterDismiss(item.id) : null);
  };
  const renderItem = (item: CollectionItemDescriptor<Value>) => {
    const legacyItem = legacyItems.get(item.id);
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
    }) ?? legacyItem?.icon;
    const trailing = renderTrailing?.(item);
    return (
      <Pressable
        key={item.id}
        ref={(node) => {
          if (node) itemRefs.current.set(item.id, node);
          else itemRefs.current.delete(item.id);
        }}
        accessibilityHint={legacyItem?.accessibilityHint ?? item.description}
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
            borderRadius: radius[densityContract.radius],
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
          <Text style={{ color: contentColor }} variant={densityContract.label.textVariant}>{item.label}</Text>
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
    <View style={style}>
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
              backgroundColor: "#00000088",
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          />
          <View
            accessibilityLabel={title}
            accessibilityRole="menu"
            accessibilityViewIsModal
            style={{
              alignSelf: "center",
              backgroundColor: colors.bg,
              borderRadius: radius.lg,
              gap: spacing.sm,
              maxHeight: "75%",
              maxWidth: 520,
              padding: spacing.md,
              width: "100%",
            }}
          >
            <Text tone="primary" variant="title">{title}</Text>
            <ScrollView>
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
            <Button onPress={() => close("programmatic")} tone="secondary">{dismissLabel}</Button>
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
  style?: StyleProp<ViewStyle>;
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
    style,
  },
  ref,
) {
  validateLoadMoreDescriptor(descriptor);
  const stateRef = useRef(descriptor.state);
  const handlerRef = useRef(onLoadMore);
  stateRef.current = descriptor.state;
  handlerRef.current = onLoadMore;
  const [controllerFacade] = useState(createNativeLoadMoreControllerFacade);
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
    lastViewportRequest.current = null;
    return () => {
      detach();
      controller.dispose();
    };
  }, [controllerFacade, mode]);

  const request = useCallback(
    async (reason: LoadMoreRequestReason) => {
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
        lastViewportRequest.current = {
          mode,
          requestKey: state.requestKey,
        };
      }
      try {
        const outcome = await controllerFacade.request(state, reason);
        onRequestOutcome?.(outcome, reason);
        return outcome;
      } catch (error) {
        onRequestError?.(error, reason);
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
        style,
      ]}
    >
      {state.status === "ready" ? (
        <Button
          onPress={() => {
            void request("manual").catch(() => undefined);
          }}
          labelStyle={{
            color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
            fontWeight: loadMoreRecipe.trigger.fontWeight,
          }}
          size="small"
          style={{
            borderRadius: radius[loadMoreRecipe.trigger.radius],
            minHeight: loadMoreRecipe.trigger.minHeight,
            paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
          }}
          tone="link"
        >
          {labels.loadMore}
        </Button>
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
          <Text
            accessible={false}
            style={{
              color: resolveColorReference(loadMoreRecipe.status.color, theme.palette),
            }}
            variant={loadMoreRecipe.status.textVariant}
          >
            {labels.loading}
          </Text>
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
          <Button
            onPress={() => {
              void request("retry").catch(() => undefined);
            }}
            labelStyle={{
              color: resolveColorReference(loadMoreRecipe.trigger.color, theme.palette),
              fontWeight: loadMoreRecipe.trigger.fontWeight,
            }}
            size="small"
            style={{
              borderRadius: radius[loadMoreRecipe.trigger.radius],
              minHeight: loadMoreRecipe.trigger.minHeight,
              paddingHorizontal: loadMoreRecipe.trigger.paddingHorizontal,
            }}
            tone="link"
          >
            {labels.retry}
          </Button>
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
