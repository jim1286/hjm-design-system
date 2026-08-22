import { withAlpha } from "@hjm/design-contracts/colors";
import { radius, spacing } from "@hjm/design-contracts/foundations";
import {
  createToastSession,
  createToastStore,
  resolveToastDescriptor,
  toastBehaviorDefaults,
  type ToastDescriptor,
  type ToastDismissReason,
  type ToastDuplicatePolicy,
  type ToastOverflowPolicy,
  type ToastPauseReason,
  type ToastPublishResult,
  type ToastSessionSnapshot,
  type ToastStore,
  type ToastStoreSnapshot,
  type ToastTimerUpdatePolicy,
} from "@hjm/design-contracts/components/toast";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  AppState,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Button, IconButton } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type NoticeTone = "info" | "success" | "warning" | "danger";

export type NoticeProps = Readonly<{
  title: string;
  description?: string;
  tone?: NoticeTone;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function Notice({
  title,
  description,
  tone = "info",
  action,
  style,
}: NoticeProps) {
  const theme = useHjmNativeTheme();
  const foreground =
    tone === "danger" ? theme.colors.danger : theme.palette.statusAccents[tone];
  return (
    <View
      accessibilityLiveRegion={tone === "danger" ? "assertive" : "polite"}
      accessibilityRole={tone === "danger" ? "alert" : undefined}
      style={[
        {
          backgroundColor: withAlpha(foreground, 0.1),
          borderColor: withAlpha(foreground, 0.3),
          borderRadius: radius.md,
          borderWidth: 1,
          gap: spacing.xs,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <Text style={{ color: foreground }} variant="label">{title}</Text>
      {description ? <Text tone="body">{description}</Text> : null}
      {action}
    </View>
  );
}

export type EmptyStateProps = Readonly<{
  title: string;
  description?: string;
  illustration?: ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function EmptyState({
  title,
  description,
  illustration,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View
      accessibilityLabel={[title, description].filter(Boolean).join(", ")}
      style={[{ alignItems: "center", gap: spacing.sm, padding: spacing.xl }, style]}
    >
      {illustration ? <View accessible={false}>{illustration}</View> : null}
      <Text align="center" tone="primary" variant="title">{title}</Text>
      {description ? <Text align="center" tone="muted">{description}</Text> : null}
      {action}
    </View>
  );
}

export type ProgressProps = Readonly<{
  value: number;
  label: string;
  valueLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Progress({ value, label, valueLabel, style }: ProgressProps) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError("Progress value must be between 0 and 1");
  }
  const { colors } = useHjmNativeTheme();
  const percentage = Math.round(value * 100);
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage, text: valueLabel ?? `${percentage}%` }}
      style={[{ gap: spacing.xs }, style]}
    >
      <View
        accessible={false}
        style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.full, height: 8, overflow: "hidden" }}
      >
        <View style={{ backgroundColor: colors.primary, height: "100%", width: `${percentage}%` }} />
      </View>
      <Text tone="muted" variant="caption">{valueLabel ?? `${percentage}%`}</Text>
    </View>
  );
}

export type SpinnerProps = Readonly<{
  label: string;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
}>;

export function Spinner({ label, size = "small", style }: SpinnerProps) {
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={[{ alignItems: "center", gap: spacing.xs, justifyContent: "center" }, style]}
    >
      <ActivityIndicator color={colors.contentBrand} size={size} />
      <Text align="center" tone="muted" variant="caption">{label}</Text>
    </View>
  );
}

export type SkeletonProps = Readonly<{
  width?: ViewStyle["width"];
  height?: number;
  radius?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Skeleton({
  width = "100%",
  height = 16,
  radius: radiusValue = radius.sm,
  accessibilityLabel,
  style,
}: SkeletonProps) {
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityLabel ? { busy: true } : undefined}
      accessible={accessibilityLabel !== undefined}
      style={[
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: radiusValue,
          height,
          width,
        },
        style,
      ]}
    />
  );
}

export type ToastProps = Readonly<{
  descriptor: ToastDescriptor;
  onDismiss?: (reason: ToastDismissReason) => void;
  style?: StyleProp<ViewStyle>;
}>;

type ToastSurfaceProps = Readonly<{
  snapshot: ToastSessionSnapshot;
  onDismiss: (reason: ToastDismissReason) => void;
  onAction: () => void;
  onPause: (reason: ToastPauseReason) => void;
  onResume: (reason: ToastPauseReason) => void;
  style?: StyleProp<ViewStyle>;
}>;

function ToastSurface({
  snapshot,
  onDismiss,
  onAction,
  onPause,
  onResume,
  style,
}: ToastSurfaceProps) {
  const resolved = snapshot.descriptor;
  const theme = useHjmNativeTheme();
  if (snapshot.phase === "queued" || snapshot.phase === "closed") return null;
  const foreground =
    resolved.tone === "neutral"
      ? theme.colors.textMuted
      : resolved.tone === "danger"
        ? theme.colors.danger
        : theme.palette.statusAccents[resolved.tone];
  const background =
    resolved.tone === "neutral"
      ? theme.colors.surfaceAlt
      : withAlpha(foreground, 0.12);
  const pauseFocus = () => onPause("focus");
  const resumeFocus = () => onResume("focus");

  return (
    <View
      accessible={false}
      onTouchEnd={() => onResume("pointer")}
      onTouchStart={() => onPause("pointer")}
      style={[
        {
          backgroundColor: background,
          borderColor: withAlpha(foreground, 0.35),
          borderRadius: radius.md,
          borderWidth: 1,
          gap: spacing.sm,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <Text
        accessibilityLabel={resolved.announcement}
        accessibilityLiveRegion={resolved.priority === "high" ? "assertive" : "polite"}
        accessibilityRole={resolved.priority === "high" ? "alert" : undefined}
        accessible
        style={{ height: 1, opacity: 0, position: "absolute", width: 1 }}
      >
        {resolved.announcement}
      </Text>
      <View
        style={{
          alignItems: "flex-start",
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xxs }}>
          {resolved.title ? <Text style={{ color: foreground }} variant="label">{resolved.title}</Text> : null}
          <Text tone="body">{resolved.description}</Text>
        </View>
        <IconButton
          label={resolved.closeLabel}
          onBlur={resumeFocus}
          onFocus={pauseFocus}
          onPress={() => onDismiss("close-action")}
        >
          <Text accessible={false} tone="muted" variant="title">×</Text>
        </IconButton>
      </View>
      {resolved.action ? (
        <View style={{ alignSelf: "flex-start" }}>
          <Button
            accessibilityLabel={resolved.action.accessibilityLabel}
            onBlur={resumeFocus}
            onFocus={pauseFocus}
            onPress={onAction}
            tone="ghost"
          >
            {resolved.action.label}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

/** One Native toast driven by the same exactly-once session as a queued region. */
export function Toast({ descriptor, onDismiss, style }: ToastProps) {
  const descriptorRef = useRef(descriptor);
  const additionalDismissRef = useRef(onDismiss);
  descriptorRef.current = descriptor;
  additionalDismissRef.current = onDismiss;
  const decorate = useCallback(
    (next: ToastDescriptor): ToastDescriptor => ({
      ...next,
      onDismiss: (reason) => {
        descriptorRef.current.onDismiss?.(reason);
        additionalDismissRef.current?.(reason);
      },
    }),
    [],
  );
  const [session] = useState(() => {
    const created = createToastSession(decorate(descriptor));
    created.show();
    return created;
  });
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const previousDescriptor = useRef(descriptor);

  useEffect(() => {
    if (previousDescriptor.current !== descriptor) {
      session.update(decorate(descriptor));
      previousDescriptor.current = descriptor;
    }
  }, [decorate, descriptor, session]);
  useEffect(() => () => {
    session.interrupt();
  }, [session]);
  useEffect(() => {
    if (snapshot.timer.status !== "running" || snapshot.timer.remainingMs === null) return;
    const timeout = setTimeout(() => {
      session.advanceTime(snapshot.timer.remainingMs ?? 0);
      session.completeExit();
    }, snapshot.timer.remainingMs);
    return () => clearTimeout(timeout);
  }, [session, snapshot.timer.remainingMs, snapshot.timer.status]);

  const completeDismiss = (reason: ToastDismissReason) => {
    if (session.dismiss(reason)) session.completeExit();
  };
  return (
    <ToastSurface
      onAction={() => {
        if (session.invokeAction()) session.completeExit();
      }}
      onDismiss={completeDismiss}
      onPause={(reason) => session.pause(reason)}
      onResume={(reason) => session.resume(reason)}
      snapshot={snapshot}
      style={style}
    />
  );
}

export type ToastRegionController = Readonly<{
  show: (descriptor: ToastDescriptor) => ToastPublishResult;
  dismiss: (id: string, reason?: ToastDismissReason) => boolean;
  pause: (id: string, reason?: ToastPauseReason) => boolean;
  resume: (id: string, reason?: ToastPauseReason) => boolean;
}>;

const ToastRegionContext = createContext<ToastRegionController | null>(null);

export type ToastRegionProps = Readonly<{
  children?: ReactNode;
  /** Optional localized name for the region; individual toasts remain self-announcing. */
  accessibilityLabel?: string;
  /** External collection compatibility; the contract store still owns each lifecycle. */
  toasts?: readonly ToastDescriptor[];
  defaultToasts?: readonly ToastDescriptor[];
  onToastsChange?: (toasts: readonly ToastDescriptor[]) => void;
  maxVisible?: number;
  maxQueued?: number;
  duplicatePolicy?: ToastDuplicatePolicy;
  timerUpdatePolicy?: ToastTimerUpdatePolicy;
  overflowPolicy?: ToastOverflowPolicy;
  style?: StyleProp<ViewStyle>;
  toastStyle?: StyleProp<ViewStyle>;
}>;

function snapshotDescriptor(snapshot: ToastSessionSnapshot): ToastDescriptor {
  const descriptor = snapshot.descriptor;
  return {
    id: descriptor.id,
    ...(descriptor.title === null ? {} : { title: descriptor.title }),
    description: descriptor.description,
    tone: descriptor.tone,
    priority: descriptor.priority,
    announcement: descriptor.announcement,
    durationMs: descriptor.durationMs,
    ...(descriptor.action === null
      ? {}
      : {
          action: {
            label: descriptor.action.label,
            accessibilityLabel: descriptor.action.accessibilityLabel,
            onAction: descriptor.action.onAction,
            dismissOnAction: descriptor.action.dismissOnAction,
          },
        }),
    closeLabel: descriptor.closeLabel,
    ...(descriptor.onDismiss === null ? {} : { onDismiss: descriptor.onDismiss }),
  };
}

function allToastSnapshots(snapshot: ToastStoreSnapshot): readonly ToastSessionSnapshot[] {
  return [...snapshot.visible, ...snapshot.queued];
}

/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export function ToastRegion({
  children,
  accessibilityLabel,
  toasts,
  defaultToasts = [],
  onToastsChange,
  maxVisible = toastBehaviorDefaults.maxVisible,
  maxQueued = toastBehaviorDefaults.maxQueued,
  duplicatePolicy = toastBehaviorDefaults.duplicatePolicy,
  timerUpdatePolicy = toastBehaviorDefaults.timerUpdatePolicy,
  overflowPolicy = toastBehaviorDefaults.overflowPolicy,
  style,
  toastStyle,
}: ToastRegionProps) {
  defaultToasts.forEach(resolveToastDescriptor);
  toasts?.forEach(resolveToastDescriptor);
  const [store] = useState<ToastStore>(() =>
    createToastStore({
      maxVisible,
      maxQueued,
      duplicatePolicy,
      timerUpdatePolicy,
      overflowPolicy,
    }),
  );
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const rawDescriptors = useRef(new Map<string, ToastDescriptor>());
  const initialDescriptors = useRef(toasts ?? defaultToasts);
  const onToastsChangeRef = useRef(onToastsChange);
  onToastsChangeRef.current = onToastsChange;

  const pruneRaw = useCallback(() => {
    const ids = new Set(allToastSnapshots(store.getSnapshot()).map((entry) => entry.descriptor.id));
    for (const id of rawDescriptors.current.keys()) {
      if (!ids.has(id)) rawDescriptors.current.delete(id);
    }
  }, [store]);
  const emitChange = useCallback(() => {
    pruneRaw();
    const next = allToastSnapshots(store.getSnapshot()).map(
      (entry) => rawDescriptors.current.get(entry.descriptor.id) ?? snapshotDescriptor(entry),
    );
    onToastsChangeRef.current?.(next);
  }, [pruneRaw, store]);
  const completeClosing = useCallback(() => {
    let changed = false;
    for (const entry of store.getSnapshot().visible) {
      if (entry.phase === "closing") changed = store.completeExit(entry.descriptor.id) || changed;
    }
    if (changed) pruneRaw();
    return changed;
  }, [pruneRaw, store]);

  useEffect(() => {
    for (const descriptor of initialDescriptors.current) {
      rawDescriptors.current.set(descriptor.id, descriptor);
      store.publish(descriptor);
    }
    return () => {
      store.dispose();
    };
  }, [store]);

  useEffect(() => {
    if (toasts === undefined) return;
    const nextIds = new Set(toasts.map((descriptor) => descriptor.id));
    for (const descriptor of toasts) {
      if (rawDescriptors.current.get(descriptor.id) !== descriptor) {
        rawDescriptors.current.set(descriptor.id, descriptor);
        store.publish(descriptor);
      }
    }
    for (const entry of allToastSnapshots(store.getSnapshot())) {
      if (!nextIds.has(entry.descriptor.id)) {
        store.dismiss(entry.descriptor.id, "programmatic");
        store.completeExit(entry.descriptor.id);
      }
    }
    pruneRaw();
  }, [pruneRaw, store, toasts]);

  useEffect(() => {
    const updateWindowPause = (state: string) => {
      if (state === "active") store.resumeAll("window");
      else store.pauseAll("window");
    };
    updateWindowPause(AppState.currentState);
    const subscription = AppState.addEventListener("change", updateWindowPause);
    return () => subscription.remove();
  }, [store]);

  useEffect(() => {
    const running = snapshot.visible
      .map((entry) => entry.timer)
      .filter((timer) => timer.status === "running" && timer.remainingMs !== null);
    if (running.length === 0) return;
    const remaining = Math.min(...running.map((timer) => timer.remainingMs ?? Infinity));
    const timeout = setTimeout(() => {
      store.advanceTime(remaining);
      if (completeClosing()) emitChange();
    }, remaining);
    return () => clearTimeout(timeout);
  }, [completeClosing, emitChange, snapshot.visible, store]);

  const show = useCallback((descriptor: ToastDescriptor) => {
    rawDescriptors.current.set(descriptor.id, descriptor);
    const result = store.publish(descriptor);
    pruneRaw();
    emitChange();
    return result;
  }, [emitChange, pruneRaw, store]);
  const dismiss = useCallback((id: string, reason: ToastDismissReason = "programmatic") => {
    const changed = store.dismiss(id, reason);
    if (changed) {
      store.completeExit(id);
      pruneRaw();
      emitChange();
    }
    return changed;
  }, [emitChange, pruneRaw, store]);
  const invokeAction = useCallback((id: string) => {
    const changed = store.invokeAction(id);
    if (changed && completeClosing()) emitChange();
    return changed;
  }, [completeClosing, emitChange, store]);
  const controller = {
    show,
    dismiss,
    pause: (id: string, reason: ToastPauseReason = "programmatic") => store.pause(id, reason),
    resume: (id: string, reason: ToastPauseReason = "programmatic") => store.resume(id, reason),
  } satisfies ToastRegionController;

  const hasChildren = children !== undefined && children !== null;
  return (
    <ToastRegionContext.Provider value={controller}>
      <View style={[{ flex: hasChildren ? 1 : undefined }, style]}>
        {children}
        <View
          accessibilityLabel={accessibilityLabel}
          pointerEvents="box-none"
          style={{
            bottom: spacing.md,
            end: spacing.md,
            gap: spacing.sm,
            maxWidth: 520,
            position: hasChildren ? "absolute" : "relative",
            start: spacing.md,
          }}
        >
          {snapshot.visible.map((entry) => (
            <ToastSurface
              key={entry.descriptor.id}
              onAction={() => invokeAction(entry.descriptor.id)}
              onDismiss={(reason) => dismiss(entry.descriptor.id, reason)}
              onPause={(reason) => store.pause(entry.descriptor.id, reason)}
              onResume={(reason) => store.resume(entry.descriptor.id, reason)}
              snapshot={entry}
              style={toastStyle}
            />
          ))}
        </View>
      </View>
    </ToastRegionContext.Provider>
  );
}

export function useToastRegion(): ToastRegionController {
  const controller = useContext(ToastRegionContext);
  if (controller === null) throw new Error("useToastRegion must be used inside ToastRegion");
  return controller;
}
