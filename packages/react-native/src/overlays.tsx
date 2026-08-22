import {
  createAlertDialogSession,
  getAlertDialogInitialFocus,
  validateAlertDialogRequest,
  type AlertDialogOpenChangeReason,
  type AlertDialogRequest,
  type AlertDialogResult,
  type AlertDialogSession,
} from "@hjm/design-contracts/components/alert-dialog";
import {
  canDismissSheet,
  createSheetLifecycle,
  sheetBehaviorDefaults,
  type SheetDismissPolicy,
  type SheetDismissReason,
  type SheetOpenChangeDetails,
} from "@hjm/design-contracts/components/sheet";
import { overlay, radius, spacing } from "@hjm/design-contracts/foundations";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  View,
  findNodeHandle,
  type Insets,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Button, IconButton, type ButtonTone } from "./actions.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type OverlayAction = Readonly<{
  label: string;
  onPress: () => void | Promise<void>;
  tone?: ButtonTone;
  disabled?: boolean;
  accessibilityHint?: string;
}>;

type NativeModalProps = Omit<
  ModalProps,
  "animationType" | "children" | "onDismiss" | "onRequestClose" | "transparent" | "visible"
>;

type ReasonedOpenProps<Reason> = Readonly<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, detail: Readonly<{ reason: Reason }>) => void;
}>;

function useReasonedOpenState<Reason>({
  open,
  defaultOpen = false,
  onOpenChange,
}: ReasonedOpenProps<Reason>) {
  const controlledAtMount = useRef(open !== undefined);
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const pendingClose = useRef(false);

  if (controlledAtMount.current !== controlled) {
    throw new Error("HJM overlays cannot switch between controlled and uncontrolled state");
  }

  const visible = controlled ? open : internalOpen;
  const changeOpen = useCallback(
    (next: boolean, detail: Readonly<{ reason: Reason }>): boolean => {
      if (next === visible || (!next && pendingClose.current)) return false;
      if (!next) {
        pendingClose.current = true;
        setTimeout(() => {
          pendingClose.current = false;
        }, 0);
      }
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next, detail);
      return true;
    },
    [controlled, onOpenChange, visible],
  );
  return [visible, changeOpen] as const;
}

function focusNativeTarget(target: RefObject<View | null> | undefined): void {
  if (!target?.current) return;
  const handle = findNodeHandle(target.current);
  if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
}

function useRestoreFocus(
  visible: boolean,
  returnFocusRef: RefObject<View | null> | undefined,
): void {
  const previouslyVisible = useRef(visible);
  useEffect(() => {
    if (previouslyVisible.current && !visible) focusNativeTarget(returnFocusRef);
    previouslyVisible.current = visible;
  }, [returnFocusRef, visible]);
}

function Scrim(): ReactNode {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        backgroundColor: "#000000",
        bottom: 0,
        left: 0,
        opacity: overlay.scrim,
        position: "absolute",
        right: 0,
        top: 0,
      }}
    />
  );
}

function OverlayActions({
  primaryAction,
  secondaryAction,
  busy,
  onActionComplete,
}: Readonly<{
  primaryAction?: OverlayAction;
  secondaryAction?: OverlayAction;
  busy: boolean;
  onActionComplete: () => void;
}>) {
  const { environment } = useHjmNativeTheme();
  if (!primaryAction && !secondaryAction) return null;
  const renderAction = (action: OverlayAction, fallbackTone: ButtonTone) => (
    <View style={{ flex: 1 }}>
      <Button
        {...(action.accessibilityHint === undefined
          ? {}
          : { accessibilityHint: action.accessibilityHint })}
        disabled={busy || action.disabled === true}
        onPress={() => {
          void action.onPress();
          onActionComplete();
        }}
        tone={action.tone ?? fallbackTone}
      >
        {action.label}
      </Button>
    </View>
  );
  return (
    <View
      style={{
        direction: environment.direction,
        flexDirection: "row",
        gap: spacing.sm,
      }}
    >
      {secondaryAction ? renderAction(secondaryAction, "secondary") : null}
      {primaryAction ? renderAction(primaryAction, "primary") : null}
    </View>
  );
}

export type DialogOpenChangeReason = "close-action" | "back" | "outside";

export type DialogProps = NativeModalProps &
  ReasonedOpenProps<DialogOpenChangeReason> &
  Readonly<{
    title: string;
    description?: string;
    children?: ReactNode;
    primaryAction?: OverlayAction;
    secondaryAction?: OverlayAction;
    dismissible?: boolean;
    busy?: boolean;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

/** Native modal boundary with one reasoned close intent for each user attempt. */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  dismissible = true,
  busy = false,
  closeLabel,
  returnFocusRef,
  contentStyle,
  onShow,
  ...modalProps
}: DialogProps) {
  const { colors, environment } = useHjmNativeTheme();
  const [visible, changeOpen] = useReasonedOpenState({
    ...(open === undefined ? {} : { open }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  useRestoreFocus(visible, returnFocusRef);
  const requestClose = (reason: DialogOpenChangeReason) => {
    if (dismissible && !busy) changeOpen(false, { reason });
  };

  return (
    <Modal
      {...modalProps}
      animationType={environment.reducedMotion ? "none" : "fade"}
      onRequestClose={() => requestClose("back")}
      onShow={onShow}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.md }}>
        <Scrim />
        {dismissible ? (
          <Pressable
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            onPress={() => requestClose("outside")}
            style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
          />
        ) : null}
        <View
          accessibilityLabel={[title, description].filter(Boolean).join(", ")}
          accessibilityState={{ busy }}
          accessibilityViewIsModal
          importantForAccessibility="yes"
          role="dialog"
          style={[
            {
              alignSelf: "center",
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              gap: spacing.md,
              maxWidth: 520,
              padding: spacing.lg,
              width: "100%",
            },
            contentStyle,
          ]}
        >
          <View
            style={{
              alignItems: "flex-start",
              direction: environment.direction,
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text accessibilityRole="header" tone="primary" variant="title">{title}</Text>
              {description ? <Text tone="muted">{description}</Text> : null}
            </View>
            {dismissible ? (
              <IconButton
                disabled={busy}
                label={closeLabel}
                onPress={() => requestClose("close-action")}
              >
                <Text accessible={false} variant="title">×</Text>
              </IconButton>
            ) : null}
          </View>
          {children}
          <OverlayActions
            busy={busy}
            onActionComplete={() => requestClose("close-action")}
            {...(primaryAction === undefined ? {} : { primaryAction })}
            {...(secondaryAction === undefined ? {} : { secondaryAction })}
          />
        </View>
      </View>
    </Modal>
  );
}

export type AlertDialogProps = NativeModalProps &
  ReasonedOpenProps<AlertDialogOpenChangeReason> &
  Readonly<{
    request: AlertDialogRequest;
    returnFocusRef?: RefObject<View | null>;
    onResult?: (result: AlertDialogResult) => void;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

/** Contract session owns duplicate confirms, busy dismissal, error and settlement. */
export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  request,
  returnFocusRef,
  onResult,
  contentStyle,
  onShow,
  ...modalProps
}: AlertDialogProps) {
  validateAlertDialogRequest(request);
  const { colors, environment } = useHjmNativeTheme();
  const [visible, changeOpen] = useReasonedOpenState({
    ...(open === undefined ? {} : { open }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const requestRef = useRef(request);
  requestRef.current = request;
  const [session, setSession] = useState<AlertDialogSession>(() =>
    createAlertDialogSession(request),
  );
  const phase = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const previousVisible = useRef(visible);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const pendingExitSessions = useRef<AlertDialogSession[]>([]);
  const suppressedResults = useRef(new WeakSet<AlertDialogSession>());
  const rearmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const cancelRef = useRef<View>(null);
  const confirmRef = useRef<View>(null);

  useEffect(() => {
    if (!previousVisible.current && visible) {
      setSession(createAlertDialogSession(requestRef.current));
    } else if (previousVisible.current && !visible) {
      const snapshot = session.getSnapshot();
      if (snapshot.status === "idle" || snapshot.status === "error") {
        session.cancel("programmatic");
      }
      if (!pendingExitSessions.current.includes(session)) {
        pendingExitSessions.current.push(session);
      }
    }
    previousVisible.current = visible;
  }, [session, visible]);

  useEffect(() => {
    void session.result.then((result) => {
      if (!suppressedResults.current.has(session)) onResultRef.current?.(result);
    });
  }, [session]);
  useEffect(() => () => {
    if (rearmTimer.current !== null) clearTimeout(rearmTimer.current);
    sessionRef.current.interrupt();
  }, []);

  const requestClose = (
    target: AlertDialogSession,
    reason: AlertDialogOpenChangeReason,
  ) => {
    if (!pendingExitSessions.current.includes(target)) {
      pendingExitSessions.current.push(target);
    }
    changeOpen(false, { reason });
    if (open !== undefined) {
      if (rearmTimer.current !== null) clearTimeout(rearmTimer.current);
      rearmTimer.current = setTimeout(() => {
        rearmTimer.current = null;
        if (!visibleRef.current) return;
        pendingExitSessions.current = pendingExitSessions.current.filter(
          (candidate) => candidate !== target,
        );
        suppressedResults.current.add(target);
        target.interrupt();
        setSession(createAlertDialogSession(requestRef.current));
      }, 0);
    }
  };

  const busy = phase.status === "busy";
  const error = phase.status === "error" ? phase.message : undefined;
  const cancel = (reason: "cancel-action" | "back") => {
    if (!session.cancel(reason)) return;
    requestClose(session, reason);
  };
  const confirm = () => {
    void session.confirm().then((closing) => {
      if (closing) requestClose(session, "confirm");
    });
  };
  const focusLeastDestructive: NonNullable<ModalProps["onShow"]> = (event) => {
    const focus = getAlertDialogInitialFocus(request.mode) === "cancel" ? cancelRef : confirmRef;
    focusNativeTarget(focus);
    onShow?.(event);
  };

  return (
    <Modal
      {...modalProps}
      animationType={environment.reducedMotion ? "none" : "fade"}
      onDismiss={() => {
        const completed = pendingExitSessions.current.shift();
        completed?.completeExit();
        focusNativeTarget(returnFocusRef);
      }}
      onRequestClose={() => cancel("back")}
      onShow={focusLeastDestructive}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.md }}>
        <Scrim />
        <View
          accessibilityLabel={`${request.title}, ${request.description}`}
          accessibilityState={{ busy }}
          accessibilityViewIsModal
          importantForAccessibility="yes"
          role="alertdialog"
          style={[
            {
              alignSelf: "center",
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              gap: spacing.md,
              maxWidth: 520,
              padding: spacing.lg,
              width: "100%",
            },
            contentStyle,
          ]}
        >
          <View style={{ gap: spacing.xs }}>
            <Text accessibilityRole="header" tone="primary" variant="title">{request.title}</Text>
            <Text tone="muted">{request.description}</Text>
            {error ? (
              <Text
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                style={{ color: colors.danger }}
              >
                {error}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              direction: environment.direction,
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            {request.mode === "confirm" ? (
              <Pressable
                ref={cancelRef}
                accessibilityLabel={request.cancelLabel}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => cancel("cancel-action")}
                style={({ pressed }) => [
                  minimumTargetStyle,
                  {
                    alignItems: "center",
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    flex: 1,
                    justifyContent: "center",
                    opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                    paddingHorizontal: spacing.md,
                  },
                ]}
              >
                <Text variant="label">{request.cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              ref={confirmRef}
              accessibilityLabel={request.confirmLabel}
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              disabled={busy}
              onPress={confirm}
              style={({ pressed }) => [
                minimumTargetStyle,
                {
                  alignItems: "center",
                  backgroundColor: request.tone === "danger" ? colors.dangerFill : colors.primary,
                  borderRadius: radius.md,
                  flex: 1,
                  justifyContent: "center",
                  opacity: busy ? 0.5 : pressed ? 0.86 : 1,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text
                style={{ color: request.tone === "danger" ? colors.onDanger : colors.onPrimary }}
                variant="label"
              >
                {request.confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export type SheetPlacement = "bottom" | "start" | "end";

export type SheetProps = NativeModalProps &
  ReasonedOpenProps<SheetOpenChangeDetails["reason"]> &
  Readonly<{
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    placement?: SheetPlacement;
    busy?: boolean;
    dismissPolicy?: Partial<SheetDismissPolicy>;
    /** Localized accessible name for the close action. */
    closeLabel: string;
    returnFocusRef?: RefObject<View | null>;
    safeAreaInsets?: Partial<Insets>;
    onDismissComplete?: (detail: Readonly<{ reason: SheetDismissReason }>) => void;
    contentStyle?: StyleProp<ViewStyle>;
  }>;

/** Native Sheet applies policy before emitting a concrete dismissal reason. */
export function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  placement = "bottom",
  busy = false,
  dismissPolicy,
  closeLabel,
  returnFocusRef,
  safeAreaInsets = {},
  onDismissComplete,
  contentStyle,
  onShow,
  ...modalProps
}: SheetProps) {
  const { colors, environment } = useHjmNativeTheme();
  const policy: SheetDismissPolicy = { ...sheetBehaviorDefaults, ...dismissPolicy };
  const [visible, changeOpen] = useReasonedOpenState({
    ...(open === undefined ? {} : { open }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });
  const lifecycle = useRef(createSheetLifecycle(visible));
  const previousVisible = useRef(visible);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const dismissingCycle = useRef<number | null>(null);
  const pendingDismissReason = useRef<SheetDismissReason | null>(null);
  const rearmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const insets = {
    top: safeAreaInsets.top ?? 0,
    right: safeAreaInsets.right ?? 0,
    bottom: safeAreaInsets.bottom ?? 0,
    left: safeAreaInsets.left ?? 0,
  };
  for (const [edge, value] of Object.entries(insets)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Sheet safeAreaInsets.${edge} must be non-negative`);
    }
  }

  useEffect(() => {
    if (!previousVisible.current && visible) lifecycle.current.open();
    if (previousVisible.current && !visible) {
      pendingDismissReason.current ??= "programmatic";
      dismissingCycle.current = lifecycle.current.beginDismiss();
    }
    previousVisible.current = visible;
  }, [visible]);
  useEffect(() => () => {
    if (rearmTimer.current !== null) clearTimeout(rearmTimer.current);
  }, []);

  const requestClose = (reason: SheetDismissReason) => {
    if (!canDismissSheet(reason, busy, policy)) return;
    if (!lifecycle.current.requestClose(reason, busy, policy)) return;
    pendingDismissReason.current = reason;
    changeOpen(false, { reason });
    if (open !== undefined) {
      if (rearmTimer.current !== null) clearTimeout(rearmTimer.current);
      rearmTimer.current = setTimeout(() => {
        rearmTimer.current = null;
        if (!visibleRef.current) return;
        lifecycle.current = createSheetLifecycle(true);
        pendingDismissReason.current = null;
      }, 0);
    }
  };
  const physicalPlacement =
    placement === "bottom"
      ? "bottom"
      : placement === "start"
        ? environment.direction === "rtl" ? "right" : "left"
        : environment.direction === "rtl" ? "left" : "right";
  const side = physicalPlacement !== "bottom";

  return (
    <Modal
      {...modalProps}
      animationType={environment.reducedMotion ? "none" : "slide"}
      onDismiss={() => {
        if (dismissingCycle.current !== null) {
          lifecycle.current.completeDismiss(dismissingCycle.current);
          dismissingCycle.current = null;
        }
        const reason = pendingDismissReason.current;
        pendingDismissReason.current = null;
        if (reason !== null) onDismissComplete?.({ reason });
        focusNativeTarget(returnFocusRef);
      }}
      onRequestClose={() => requestClose("back")}
      onShow={onShow}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        style={{
          alignItems: physicalPlacement === "right" ? "flex-end" : "flex-start",
          flex: 1,
          justifyContent: physicalPlacement === "bottom" ? "flex-end" : "flex-start",
        }}
      >
        <Scrim />
        {policy.dismissible && policy.outsideDismiss ? (
          <Pressable
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            onPress={() => requestClose("outside")}
            style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
          />
        ) : null}
        <View
          accessibilityLabel={[title, description].filter(Boolean).join(", ")}
          accessibilityState={{ busy }}
          accessibilityViewIsModal
          importantForAccessibility="yes"
          role="dialog"
          style={[
            {
              backgroundColor: colors.bg,
              borderRadius: radius.lg,
              borderBottomLeftRadius: physicalPlacement === "bottom" ? 0 : radius.lg,
              borderBottomRightRadius: physicalPlacement === "bottom" ? 0 : radius.lg,
              gap: spacing.md,
              height: side ? "100%" : undefined,
              maxWidth: side ? 420 : undefined,
              paddingBottom: spacing.lg + insets.bottom,
              paddingLeft: spacing.lg + insets.left,
              paddingRight: spacing.lg + insets.right,
              paddingTop: spacing.lg + insets.top,
              width: side ? "88%" : "100%",
            },
            contentStyle,
          ]}
        >
          <View
            style={{
              alignItems: "flex-start",
              direction: environment.direction,
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text accessibilityRole="header" tone="primary" variant="title">{title}</Text>
              {description ? <Text tone="muted">{description}</Text> : null}
            </View>
            {policy.dismissible ? (
              <IconButton
                disabled={busy && !policy.dismissWhileBusy}
                label={closeLabel}
                onPress={() => requestClose("close-action")}
              >
                <Text accessible={false} variant="title">×</Text>
              </IconButton>
            ) : null}
          </View>
          {children}
          {footer}
        </View>
      </View>
    </Modal>
  );
}
