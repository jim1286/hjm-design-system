"use client";
import { useEffect, useRef, useState } from "react";
import { isConfirmedTransferAbort, resolveTransferObservation, type TransferObservation, type TransferContext } from "@hjmds/design-contracts/transfer-task";
import { Button } from "./actions.js";
import { Progress } from "./feedback.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
export type TransferTaskProps = Readonly<{
  onTransfer: (context: TransferContext) => Promise<void>;
  labels: Readonly<{ start: string; queued: string; transferring: string; cancel: string; cancelling: string; cancelled: string; success: string; error: string }>;
  formatProgress: (observation: TransferObservation) => string; disabled?: boolean;
}>;
export function TransferTask(props: TransferTaskProps) {
  const action = useCompositionAction(props.disabled), mounted = useRef(true), disabled = useRef(props.disabled);
  disabled.current = props.disabled;
  const request = useRef<AbortController | null>(null), latest = useRef<TransferObservation | null>(null);
  const [observation, setObservation] = useState<TransferObservation | null>(null), [cancelRequested, setCancelRequested] = useState(false), [cancelled, setCancelled] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); request.current = null; }; }, []);
  const start = () => {
    if (!mounted.current || disabled.current || request.current) return;
    const controller = new AbortController(); let accepting = true; request.current = controller; latest.current = null;
    setObservation(null); setCancelled(false); setCancelRequested(false);
    void action.run("transfer", async () => {
      try {
        await props.onTransfer({ signal: controller.signal, report: next => {
          if (!accepting || !mounted.current || request.current !== controller || controller.signal.aborted) return;
          const value = resolveTransferObservation(next, latest.current); latest.current = value; setObservation(value);
        } });
      } catch (error) {
        if (mounted.current && request.current === controller && isConfirmedTransferAbort(error, controller.signal)) setCancelled(true);
        throw error;
      } finally { accepting = false; }
    }).then(() => { if (request.current === controller) request.current = null; });
  };
  const cancel = () => { if (mounted.current && !disabled.current && request.current && !request.current.signal.aborted) { setCancelRequested(true); request.current.abort(); } };
  const phase = action.session.getSnapshot().status;
  const status = action.pending ? cancelRequested ? props.labels.cancelling : observation ? props.labels.transferring : props.labels.queued
    : cancelled ? props.labels.cancelled : phase === "success" ? props.labels.success : action.failed ? props.labels.error : null;
  const known = observation !== null && observation.total !== null;
  return <Stack gap="md"><Stack axis="inline" gap="sm" wrap>
    <Button loading={action.pending} disabled={props.disabled === true} onPress={start}>{props.labels.start}</Button>
    {action.pending ? <Button tone="secondary" disabled={props.disabled === true || cancelRequested} onPress={cancel}>{props.labels.cancel}</Button> : null}</Stack>
    {action.pending || known ? <Progress label={status ?? props.labels.transferring} {...(known ? { value: observation.completed, max: observation.total! } : {})}
      {...(observation ? { valueText: props.formatProgress(observation) } : {})} /> : null}
    {observation && !action.pending && !known ? <Text variant="caption">{props.formatProgress(observation)}</Text> : null}
    {status && !action.pending ? <Text accessibilityRole={action.failed && !cancelled ? "alert" : "text"} accessibilityLiveRegion="polite" align="center" tone={action.failed && !cancelled ? "danger" : "primary"}>{status}</Text> : null}
  </Stack>;
}
