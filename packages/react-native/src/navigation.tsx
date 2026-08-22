import { radius, spacing, typography } from "@hjm/design-contracts/foundations";
import {
  createLoadMoreController,
  loadMoreBehaviorDefaults,
  validateLoadMoreDescriptor,
  type LoadMoreDescriptor,
  type LoadMoreMode,
  type LoadMoreRequestHandler,
} from "@hjm/design-contracts/components/load-more";
import {
  resolveBottomNavigationActivation,
  resolveBottomNavigationConfiguration,
  resolveBottomNavigationDescriptor,
  type BottomNavigationActivation,
  type BottomNavigationConfiguration,
  type BottomNavigationDescriptor,
} from "@hjm/design-contracts/components/bottom-navigation";
import {
  getTabNavigationTarget,
  resolveInitialTabValue,
  tabsBehaviorDefaults,
  type TabsActivationMode,
  type TabsDirection,
  type TabsMountPolicy,
  type TabsOrientation,
  type TabsPanelMode,
} from "@hjm/design-contracts/behaviors";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  View,
  findNodeHandle,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { Spinner } from "./feedback.js";

export type TabOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
  badge?: string;
  badgeAccessibilityLabel?: string;
  /** Optional localized name for this option's tab panel. */
  panelAccessibilityLabel?: string;
  panel?: ReactNode;
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
  label: string;
  options: readonly TabOption<Value>[];
  activationMode?: TabsActivationMode;
  mountPolicy?: TabsMountPolicy;
  panelMode?: TabsPanelMode;
  orientation?: TabsOrientation;
  direction?: TabsDirection;
  loop?: boolean;
  children?: (selectedValue: Value) => ReactNode;
  style?: StyleProp<ViewStyle>;
  tabListStyle?: StyleProp<ViewStyle>;
}>;

export type TabsProps<Value extends string = string> = TabsBaseProps<Value> & TabsSelection<Value>;

export function Tabs<Value extends string = string>(props: TabsProps<Value>) {
  const {
    label,
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
    children,
    style,
    tabListStyle,
  } = props;
  if (!label.trim()) throw new TypeError("Tabs label must not be empty");
  if (options.length === 0) throw new TypeError("Tabs requires at least one option");
  if (panelMode === "dynamic" && mountPolicy !== "active") {
    throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
  }
  const { colors, environment } = useHjmNativeTheme();
  const direction = directionProp ?? environment.direction;
  const descriptors = options.map((option) => ({
      id: option.value,
      label: option.label,
      ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
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
      const known = new Set(options.map((option) => option.value));
      const next = new Set([...current].filter((id) => known.has(id)));
      next.add(selected);
      if (next.size === current.size && [...next].every((id) => current.has(id))) return current;
      return next;
    });
  }, [options, selected]);

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
  const hasPanels = children !== undefined || options.some((option) => option.panel !== undefined);

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
      <View
        accessibilityLabel={label}
        accessibilityRole="tablist"
        style={[
          {
            direction,
            flexDirection: orientation === "vertical" ? "column" : "row",
          },
          tabListStyle,
        ]}
      >
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <Pressable
              key={option.value}
              ref={(node) => {
                if (node) tabRefs.current.set(option.value, node);
                else tabRefs.current.delete(option.value);
              }}
              accessibilityActions={[
                { name: "activate" },
                { name: "increment" },
                { name: "decrement" },
              ]}
              accessibilityLabel={
                option.badge
                  ? `${option.label}, ${option.badgeAccessibilityLabel ?? option.badge}`
                  : option.label
              }
              accessibilityRole="tab"
              accessibilityState={{ disabled: option.disabled === true, selected: active }}
              disabled={option.disabled}
              onAccessibilityAction={(event) => {
                const action = event.nativeEvent.actionName;
                if (action === "activate") setSelected(option.value);
                else if (action === "increment") moveFocus(option.value, "next");
                else if (action === "decrement") moveFocus(option.value, "previous");
              }}
              onFocus={() => {
                setFocusValue(option.value);
                if (activationMode === "automatic") setSelected(option.value);
              }}
              onPress={() => {
                setFocusValue(option.value);
                setSelected(option.value);
              }}
              style={({ pressed }) => [
                minimumTargetStyle,
                {
                  alignItems: "center",
                  borderBottomColor: orientation === "horizontal" && active ? colors.primary : "transparent",
                  borderBottomWidth: orientation === "horizontal" ? 2 : 0,
                  borderStartColor: orientation === "vertical" && active ? colors.primary : "transparent",
                  borderStartWidth: orientation === "vertical" ? 2 : 0,
                  direction,
                  flex: orientation === "horizontal" ? 1 : undefined,
                  flexDirection: "row",
                  gap: spacing.xs,
                  justifyContent: "center",
                  opacity: option.disabled ? 0.5 : pressed ? 0.86 : 1,
                  paddingHorizontal: spacing.sm,
                },
              ]}
            >
              <Text
                align="center"
                style={{ fontWeight: active ? typography.label.fontWeight : typography.body.fontWeight }}
                tone={active ? "brand" : "muted"}
              >
                {option.label}
              </Text>
              {option.badge ? (
                <View
                  accessible={false}
                  style={{
                    backgroundColor: colors.surfaceAccent,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.xs,
                  }}
                >
                  <Text align="center" tone="brand" variant="caption">{option.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {hasPanels ? panelMode === "dynamic" ? (
        <View
          accessibilityLabel={options.find((option) => option.value === selected)?.panelAccessibilityLabel}
          importantForAccessibility="yes"
          role="tabpanel"
          style={{ flex: 1 }}
        >
          {options.find((option) => option.value === selected)?.panel ?? children?.(selected)}
        </View>
      ) : options.map((option) => {
        const active = option.value === selected;
        const mounted = mountPolicy === "always" ||
          (mountPolicy === "visited" && (visited.has(option.value) || active)) ||
          (mountPolicy === "active" && active);
        if (!mounted) return null;
        return (
          <View
            key={option.value}
            accessibilityLabel={option.panelAccessibilityLabel}
            importantForAccessibility={active ? "yes" : "no-hide-descendants"}
            role="tabpanel"
            style={{ display: active ? "flex" : "none", flex: 1 }}
          >
            {option.panel ?? children?.(option.value)}
          </View>
        );
      }) : null}
    </View>
  );
}

export type BottomNavigationIconRenderProps<IconName extends string = string> = Readonly<{
  name: IconName;
  selected: boolean;
}>;

export type BottomNavigationProps<
  Key extends string = string,
  IconName extends string = string,
> = Readonly<{
  descriptor: BottomNavigationDescriptor<Key, IconName>;
  onActivate: (activation: BottomNavigationActivation<Key>) => void;
  renderIcon: (props: BottomNavigationIconRenderProps<IconName>) => ReactNode;
  configuration?: BottomNavigationConfiguration;
  safeAreaBottom?: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Router-owned persistent destinations; activation emits intent without mutating selection. */
export function BottomNavigation<
  Key extends string = string,
  IconName extends string = string,
>({
  descriptor,
  onActivate,
  renderIcon,
  configuration = {},
  safeAreaBottom = 0,
  style,
}: BottomNavigationProps<Key, IconName>) {
  const resolved = resolveBottomNavigationDescriptor(descriptor);
  if (resolved.items.length > 5) {
    throw new RangeError("BottomNavigation supports at most 5 destinations on Native");
  }
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
    throw new RangeError("BottomNavigation safeAreaBottom must be non-negative");
  }
  const { colors, environment } = useHjmNativeTheme();
  const presentation = resolveBottomNavigationConfiguration(
    {
      ...configuration,
      direction: configuration.direction ?? environment.direction,
    },
    resolved.items.length,
  );
  const compact = presentation.density === "compact";

  return (
    <View
      accessibilityLabel={resolved.accessibilityLabel}
      accessibilityRole="tablist"
      style={[
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderRadius: presentation.presentation === "floating" ? radius.lg : 0,
          borderTopWidth: 1,
          direction: presentation.direction,
          flexDirection: "row",
          gap: presentation.distribution === "center-gap" ? spacing.md : 0,
          marginHorizontal: presentation.presentation === "floating" ? spacing.md : 0,
          paddingBottom: safeAreaBottom,
          paddingHorizontal: presentation.presentation === "floating" ? spacing.xs : 0,
        },
        style,
      ]}
    >
      {resolved.items.map((item) => {
        const active = item.id === resolved.selectedKey;
        return (
          <Pressable
            key={item.id}
            accessibilityLabel={item.resolvedAccessibilityLabel}
            accessibilityRole="tab"
            accessibilityState={{ disabled: item.disabled, selected: active }}
            disabled={item.disabled}
            onPress={() => {
              const activation = resolveBottomNavigationActivation(descriptor, item.id);
              if (activation) onActivate(activation);
            }}
            style={({ pressed }) => [
              minimumTargetStyle,
              {
                alignItems: "center",
                flex: presentation.distribution === "equal" ? 1 : undefined,
                gap: spacing.xxs,
                justifyContent: "center",
                minHeight: compact ? 52 : 60,
                opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                paddingHorizontal: spacing.xxs,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <View accessible={false}>{renderIcon({ name: item.icon.name, selected: active })}</View>
            <View
              accessible={false}
              style={{
                alignItems: "center",
                direction: presentation.direction,
                flexDirection: "row",
                gap: spacing.xxs,
              }}
            >
              <Text align="center" tone={active ? "brand" : "muted"} variant="caption">{item.label}</Text>
              {item.badge ? (
                <View style={{ backgroundColor: colors.dangerFill, borderRadius: radius.full, paddingHorizontal: spacing.xxs }}>
                  <Text align="center" tone="inverse" variant="caption">{item.badge.visibleLabel}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export type TopBarProps = Readonly<{
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  centered?: boolean;
  accessibilityLabel?: string;
  safeAreaTop?: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Native screen top bar with logical action slots and large-text reflow. */
export function TopBar({
  title,
  leading,
  trailing,
  centered = true,
  accessibilityLabel = title,
  safeAreaTop = 0,
  style,
}: TopBarProps) {
  if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) {
    throw new RangeError("TopBar safeAreaTop must be non-negative");
  }
  const { colors, environment } = useHjmNativeTheme();
  const largeText = environment.textScale >= 1.6;
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="toolbar"
      style={[
        {
          alignItems: largeText ? "stretch" : "center",
          backgroundColor: colors.bg,
          direction: environment.direction,
          flexDirection: largeText ? "column" : "row",
          gap: spacing.xs,
          minHeight: 52 + safeAreaTop,
          paddingHorizontal: spacing.md,
          paddingTop: safeAreaTop,
        },
        style,
      ]}
    >
      {largeText ? (
        <>
          <View
            style={{
              direction: environment.direction,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ minWidth: 44 }}>{leading}</View>
            <View style={{ minWidth: 44 }}>{trailing}</View>
          </View>
          <Text accessibilityRole="header" tone="primary" variant="bodyLarge">{title}</Text>
        </>
      ) : (
        <>
          <View style={{ alignItems: "flex-start", flex: 1, minWidth: 44 }}>{leading}</View>
          <Text accessibilityRole="header" align={centered ? "center" : undefined} numberOfLines={1} style={{ flex: 2 }} tone="primary" variant="bodyLarge">{title}</Text>
          <View style={{ alignItems: "flex-end", flex: 1, minWidth: 44 }}>{trailing}</View>
        </>
      )}
    </View>
  );
}

export type MenuItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  description?: string;
  icon?: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
  accessibilityHint?: string;
}>;

export type MenuProps<Value extends string = string> = Omit<
  ModalProps,
  "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"
> &
  Readonly<{
    triggerLabel: string;
    title?: string;
    items: readonly MenuItem<Value>[];
    onSelect: (value: Value) => void | Promise<void>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    /** Localized accessible name and visible label for dismissing the menu. */
    dismissLabel: string;
    trigger?: ReactNode;
    style?: StyleProp<ViewStyle>;
  }>;

/** A compact Modal-backed action menu suitable for touch and screen readers. */
export function Menu<Value extends string = string>({
  triggerLabel,
  title = triggerLabel,
  items,
  onSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  dismissLabel,
  trigger,
  style,
  ...modalProps
}: MenuProps<Value>) {
  if (items.length === 0) throw new Error("Menu requires at least one item");
  if (new Set(items.map((item) => item.value)).size !== items.length) {
    throw new TypeError("Menu values must be unique");
  }
  const { colors, environment } = useHjmNativeTheme();
  const [visible, setVisible] = useControllableState({
    ...(open === undefined ? {} : { value: open }),
    defaultValue: defaultOpen,
    ...(onOpenChange === undefined ? {} : { onChange: onOpenChange }),
  });
  const triggerRef = useRef<View>(null);
  const itemRefs = useRef(new Map<Value, View>());
  const previouslyVisible = useRef(visible);

  useEffect(() => {
    if (previouslyVisible.current && !visible && triggerRef.current) {
      const handle = findNodeHandle(triggerRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    previouslyVisible.current = visible;
  }, [visible]);

  const close = () => setVisible(false);
  const focusFirstItem = () => {
    const first = items.find((item) => !item.disabled) ?? items[0]!;
    const target = itemRefs.current.get(first.value);
    if (target) {
      const handle = findNodeHandle(target);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };

  return (
    <View style={style}>
      <Pressable
        ref={triggerRef}
        accessibilityLabel={triggerLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: visible }}
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          minimumTargetStyle,
          {
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          },
        ]}
      >
        {trigger ?? <Text tone="brand" variant="label">{triggerLabel}</Text>}
      </Pressable>
      <Modal
        {...modalProps}
        animationType={environment.reducedMotion ? "none" : "fade"}
        onRequestClose={close}
        onShow={focusFirstItem}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "center", padding: spacing.md }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={close}
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
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.value, node);
                    else itemRefs.current.delete(item.value);
                  }}
                  accessibilityHint={item.accessibilityHint ?? item.description}
                  accessibilityLabel={item.label}
                  accessibilityRole="menuitem"
                  accessibilityState={{ disabled: item.disabled === true }}
                  disabled={item.disabled}
                  onPress={() => {
                    try {
                      void onSelect(item.value);
                    } finally {
                      close();
                    }
                  }}
                  style={({ pressed }) => [
                    minimumTargetStyle,
                    {
                      alignItems: "center",
                      borderRadius: radius.md,
                      direction: environment.direction,
                      flexDirection: "row",
                      gap: spacing.sm,
                      opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  {item.icon ? <View accessible={false}>{item.icon}</View> : null}
                  <View style={{ flex: 1, gap: spacing.xxs }}>
                    <Text tone={item.tone === "danger" ? "danger" : "body"} variant="bodyLarge">{item.label}</Text>
                    {item.description ? <Text tone="muted" variant="caption">{item.description}</Text> : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Button onPress={close} tone="secondary">{dismissLabel}</Button>
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
  style?: StyleProp<ViewStyle>;
}>;

/** Collection footer that de-duplicates automatic and manual page requests. */
export function LoadMore({
  descriptor,
  onLoadMore,
  mode = loadMoreBehaviorDefaults.mode,
  style,
}: LoadMoreProps) {
  validateLoadMoreDescriptor(descriptor);
  const controller = useMemo(
    () => createLoadMoreController({ mode, onLoadMore }),
    [mode, onLoadMore],
  );
  const lastAutomaticKey = useRef<string | null>(null);
  const request = useCallback(
    (
      state: LoadMoreDescriptor["state"],
      reason: "viewport" | "manual" | "retry",
    ) => {
      void controller.request(state, reason).catch(() => undefined);
    },
    [controller],
  );

  useEffect(
    () => () => {
      controller.dispose();
    },
    [controller],
  );
  useEffect(() => {
    const state = descriptor.state;
    if (
      mode === "automatic" &&
      state.status === "ready" &&
      lastAutomaticKey.current !== state.requestKey
    ) {
      lastAutomaticKey.current = state.requestKey;
      request(state, "viewport");
    }
  }, [descriptor.state, mode, request]);

  const { state, labels } = descriptor;
  return (
    <View style={[{ alignItems: "center", gap: spacing.xs, padding: spacing.sm }, style]}>
      {state.status === "ready" ? (
        mode === "manual" ? (
          <Button
            onPress={() => request(state, "manual")}
            tone="secondary"
          >
            {labels.loadMore}
          </Button>
        ) : (
          <Text accessibilityLiveRegion="polite" tone="muted" variant="caption">{labels.loading}</Text>
        )
      ) : state.status === "loading" ? (
        <Spinner label={labels.loading} />
      ) : state.status === "error" ? (
        <>
          <Text accessibilityLiveRegion="assertive" tone="danger">{state.message}</Text>
          <Button
            onPress={() => request(state, "retry")}
            tone="secondary"
          >
            {labels.retry}
          </Button>
        </>
      ) : (
        <Text accessibilityLiveRegion="polite" tone="muted" variant="caption">{labels.complete}</Text>
      )}
    </View>
  );
}
