"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createAlertDialogSession, type AlertDialogSession } from "@hjmds/design-contracts/components/alert-dialog";
import { Button } from "./actions.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type InlineConfirmProps = Readonly<{ label: string; prompt: string; confirmLabel: string; cancelLabel: string; pendingLabel: string; successLabel: string; errorLabel: string; disabled?: boolean; onConfirm: () => void | Promise<void>;
  /** Canonical layout-only placement, applied to whichever root the current phase renders so the block does not jump. */
  layoutStyle?: HjmCompositionStyleProp }>;
const emptySubscribe = () => () => {};
const emptySnapshot = () => null;
/** Low-complexity confirmation using the existing async dialog session semantics. */
export function InlineConfirm(props: InlineConfirmProps) {
  // The displayed prompt can change while confirmation is open. Execute the
  // current action rather than the callback captured when the prompt opened.
  const confirmRef = useRef(props.onConfirm);
  confirmRef.current = props.onConfirm;
  const [session, setSession] = useState<AlertDialogSession | null>(null);
  const [done, setDone] = useState(false);
  const phase = useSyncExternalStore(session?.subscribe ?? emptySubscribe, session?.getSnapshot ?? emptySnapshot, emptySnapshot);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLSpanElement>(null);
  const focusResult = useRef(false);
  useEffect(() => { if (session) cancel.current?.focus(); }, [session]);
  useEffect(() => {
    if (phase?.status !== "closing") return;
    const confirmed = phase.result.outcome === "confirmed";
    // Completion removes both actions. Move only this group's current focus;
    // an async response must not steal focus from another part of the page.
    focusResult.current = confirmed && (group.current?.contains(document.activeElement) ?? false);
    session?.completeExit();setDone(confirmed);setSession(null);
    // Cancel returns focus to the original action; success leaves a live result.
    if (!confirmed) queueMicrotask(() => trigger.current?.focus());
  }, [phase, session]);
  useEffect(() => { if (done && focusResult.current) { focusResult.current = false; result.current?.focus(); } }, [done]);
  if (done) return <span ref={result} tabIndex={-1} role="status" style={props.layoutStyle}>{props.successLabel}</span>;
  if (!session) return <Button ref={trigger} tone="danger" disabled={props.disabled ?? false} {...(props.layoutStyle === undefined ? {} : { layoutStyle: props.layoutStyle })} onClick={() => setSession(createAlertDialogSession({ mode: "confirm", tone: "danger", title: props.label, description: props.prompt, confirmLabel: props.confirmLabel, cancelLabel: props.cancelLabel, onConfirm: () => confirmRef.current(), fallbackErrorMessage: props.errorLabel }))}>{props.label}</Button>;
  const busy = phase?.status === "busy";
  return <div ref={group} role="group" aria-label={props.prompt} onKeyDown={event => { if (event.key === "Escape" && !busy) { event.stopPropagation();session.cancel("escape"); } }} style={{ ...props.layoutStyle, display: "grid", gap: "var(--hjm-space-sm)" }}>
    <span>{props.prompt}</span>{phase?.status === "error" && <span role="alert">{phase.message}</span>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" }}>
      <Button ref={cancel} tone="ghost" disabled={busy} onClick={() => session.cancel("cancel-action")}>{props.cancelLabel}</Button>
      <Button ref={confirm} tone="danger" loading={busy} disabled={props.disabled ?? false} onClick={event => {
        // WebKit pointer activation can leave focus on the now-disabled cancel
        // button. Transfer it before submitting; loading already blocks repeats.
        if (event.detail > 0 || group.current?.contains(document.activeElement)) confirm.current?.focus();
        void session.confirm();
      }}>{busy ? props.pendingLabel : props.confirmLabel}</Button>
    </div>
  </div>;
}
