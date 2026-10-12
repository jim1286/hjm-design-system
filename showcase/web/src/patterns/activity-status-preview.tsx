import { useEffect, useRef, useState } from "react";
import { ActivityChip } from "@hjmds/react/activity-chip";
import { Button, IconButton } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { ToastProvider, useToast } from "@hjmds/react/toast";
import { TopBar } from "@hjmds/react/top-bar";
import {
  activityStatusCopy as copy,
  activityStatusDescriptor,
  activityStatusResultMs,
  activityStatusStepMs,
  activityStatusSteps,
  activityStatusToastId,
  type ActivityStatusPhase,
  type ActivityStatusProps,
} from "../../../shared/activity-status";

// Placeholder mascot: a plain inline face so no product asset ships in HJM. Products pass their own media.
export function Mascot() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" focusable="false">
      <circle cx="16" cy="16" r="16" fill="#FFD76A" />
      <circle cx="11" cy="14" r="2" fill="#3A2E1F" />
      <circle cx="21" cy="14" r="2" fill="#3A2E1F" />
      <path d="M11 20c2.5 2.5 7.5 2.5 10 0" stroke="#3A2E1F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ActivityStatusScreen({ initial = "idle" }: ActivityStatusProps) {
  const toast = useToast();
  const [phase, setPhase] = useState<ActivityStatusPhase>(initial);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(initial === "running");
  const [notice, setNotice] = useState<string | null>(null);
  // The store calls onDismiss for close button, Escape and programmatic close alike, so `open` follows it.
  const closeRef = useRef(() => setOpen(false));

  // Fixture task: advance one step at a time, then finish. A product drives this from its own task events.
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setTimeout(() => {
      if (step < activityStatusSteps.length - 1) setStep(step + 1);
      else setPhase("done");
    }, activityStatusStepMs);
    return () => clearTimeout(timer);
  }, [phase, step]);

  // The result label stays briefly, then the chip leaves the header unless the panel is still open.
  useEffect(() => {
    if (phase !== "done" || open) return;
    const timer = setTimeout(() => setPhase("idle"), activityStatusResultMs);
    return () => clearTimeout(timer);
  }, [phase, open]);

  // Same id + durationMs null: every state change updates the open panel in place instead of stacking.
  useEffect(() => {
    if (!open || phase === "idle") return;
    toast.publish(activityStatusDescriptor(phase, step, <Mascot />, {
      onDismiss: () => closeRef.current(),
      onOpenResult: () => setNotice(copy.resultOpened),
    }));
  }, [open, phase, step, toast]);

  const toggle = () => {
    if (open) toast.close(activityStatusToastId);
    else setOpen(true);
  };
  const start = () => { setNotice(null); setStep(0); setPhase("running"); };

  return (
    <Stack gap="md">
      <TopBar
        leading={<IconButton label={copy.back}>←</IconButton>}
        title={copy.screenTitle}
        trailing={phase === "idle" ? undefined : (
          <ActivityChip
            label={phase === "running" ? copy.chipRunning : copy.chipDone}
            accessibilityLabel={phase === "running" ? copy.chipRunningSpoken : copy.chipDoneSpoken}
            emphasis={phase === "done" ? "emphasis" : "default"}
            expanded={open}
            media={<Mascot />}
            onClick={toggle}
          />
        )}
      />
      <Container gutter="compact">
        <Stack gap="md">
          <Text>{copy.body}</Text>
          <Button tone="secondary" onClick={start} disabled={phase === "running"}>
            {phase === "idle" ? copy.start : copy.restart}
          </Button>
          {notice ? <Text>{notice}</Text> : null}
          <Text tone="muted">{copy.fixture}</Text>
        </Stack>
      </Container>
    </Stack>
  );
}

export function ActivityStatusPreview(props: ActivityStatusProps) {
  return (
    <ToastProvider label={copy.region} placement="top">
      <ActivityStatusScreen {...props} />
    </ToastProvider>
  );
}

export function ActivityChipPreview({ emphasis = "default" }: { emphasis?: "default" | "emphasis" }) {
  const [open, setOpen] = useState(false);
  return (
    <Container gutter="compact">
      <Stack gap="md">
        <ActivityChip
          label={emphasis === "emphasis" ? copy.chipDone : copy.chipRunning}
          accessibilityLabel={emphasis === "emphasis" ? copy.chipDoneSpoken : copy.chipRunningSpoken}
          emphasis={emphasis}
          expanded={open}
          media={<Mascot />}
          onClick={() => setOpen(value => !value)}
        />
        <ActivityChip label={copy.chipRunning} />
      </Stack>
    </Container>
  );
}
