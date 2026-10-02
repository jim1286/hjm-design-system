import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createAlertDialogSession, type AlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
export type InlineConfirmProps = Readonly<{ label: string; prompt: string; confirmLabel: string; cancelLabel: string; pendingLabel: string; successLabel: string; errorLabel: string; disabled?: boolean; onConfirm: () => void | Promise<void> }>;
const emptySubscribe = () => () => {};
const emptySnapshot = () => null;
/** Low-complexity confirmation using the existing async dialog session semantics. */
export function InlineConfirm(props: InlineConfirmProps) {
  const [session, setSession] = useState<AlertDialogSession | null>(null);
  const [done, setDone] = useState(false);
  const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (session) cancel.current?.focus(); }, [session]);
  useEffect(() => {
    if (phase?.status !== "closing") return;
    const confirmed = phase.result.outcome === "confirmed";
    session?.completeExit();setDone(confirmed);setSession(null);
    // Cancel returns focus to the original action; success leaves a live result.
    if (!confirmed) queueMicrotask(() => trigger.current?.focus());
  }, [phase, session]);
  if (done) return <span role="status">{props.successLabel}</span>;
  if (!session) return <Button ref={trigger} tone="danger" disabled={props.disabled ?? false} onClick={() => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: props.onConfirm, fallbackErrorMessage: props.errorLabel }))}>{props.label}</Button>;
  const busy = phase?.status === "busy";
  return <div role="group" aria-label={props.prompt} onKeyDown={event => { if (event.key === "Escape" && !busy) { event.stopPropagation();session.cancel("escape"); } }} style={{ display: "grid", gap: "var(--hjm-space-sm)" }}>
    <span>{props.prompt}</span>{phase?.status === "error" && <span role="alert">{phase.message}</span>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-sm)" }}>
      <Button ref={cancel} tone="ghost" disabled={busy} onClick={() => session.cancel("cancel-action")}>{props.cancelLabel}</Button>
      <Button tone="danger" loading={busy} disabled={busy || (props.disabled ?? false)} onClick={() => { void session.confirm(); }}>{busy ? props.pendingLabel : props.confirmLabel}</Button>
    </div>
  </div>;
}
