import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AccessibilityInfo, AppState, Platform, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { createAlertDialogSession, type AlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
export type InlineConfirmProps = Readonly<{ label: string; prompt: string; confirmLabel: string; cancelLabel: string; pendingLabel: string; successLabel: string; errorLabel: string; disabled?: boolean; onConfirm: () => void | Promise<void> }>;
const emptySubscribe = () => () => {};
const emptySnapshot = () => null;
export function InlineConfirm(props: InlineConfirmProps) {
  const [session, setSession] = useState<AlertDialogSession | null>(null);
  const [done, setDone] = useState(false);
  const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
  useEffect(() => {
    if (phase?.status !== "closing") return;
    session?.completeExit();setDone(phase.result.outcome === "confirmed");setSession(null);
  }, [phase, session]);
  const status = done ? props.successLabel : phase?.status === "error" ? phase.message
    : phase?.status === "busy" ? props.pendingLabel : session && phase?.status !== "closing" ? props.prompt : "";
  const previousStatus = useRef("");
  useEffect(() => {
    const changed = previousStatus.current !== status;
    previousStatus.current = status;
    // Android live regions do not speak on iOS. Announce each transition once,
    // excluding background work and ordinary rerenders; the button retains focus.
    if (changed && status && Platform.OS === "ios" && AppState.currentState === "active") {
      AccessibilityInfo.announceForAccessibilityWithOptions(status, { queue: phase?.status !== "error" });
    }
  }, [status, phase?.status]);
  if (done) return <Text accessibilityLiveRegion="polite">{props.successLabel}</Text>;
  if (!session) return <Button tone="danger" disabled={props.disabled ?? false} onPress={() => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: props.onConfirm, fallbackErrorMessage: props.errorLabel }))}>{props.label}</Button>;
  const busy = phase?.status === "busy";
  return <View style={{ gap: spacing.sm }}><Text accessibilityLiveRegion="polite">{props.prompt}</Text>{phase?.status === "error" && <Text accessibilityRole="alert" tone="danger">{phase.message}</Text>}
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      <Button tone="ghost" disabled={busy} onPress={() => session.cancel("cancel-action")}>{props.cancelLabel}</Button>
      <Button tone="danger" loading={busy} disabled={busy || (props.disabled ?? false)} onPress={() => { void session.confirm(); }}>{busy ? props.pendingLabel : props.confirmLabel}</Button>
    </View>
  </View>;
}
