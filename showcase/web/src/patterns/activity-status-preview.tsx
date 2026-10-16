import { useEffect, useRef, useState, type RefObject } from "react";
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

function ActivityStatusScreen({ initial = "idle", panelFocus }: ActivityStatusProps & { panelFocus: RefObject<HTMLElement | null> }) {
  const toast = useToast();
  const chipRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<ActivityStatusPhase>(initial);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(initial === "running");
  const [notice, setNotice] = useState<string | null>(null);
  // The store calls onDismiss for close button, Escape and programmatic close alike, so `open` follows it.
  const closeRef = useRef(() => {
    const previous = panelFocus.current;
    setOpen(false);
    // An initially open panel has no prior trigger focus for ToastProvider to
    // restore. Recover only focus removed with the panel; preserve outside work.
    queueMicrotask(() => {
      if (previous && panelFocus.current === previous && !previous.isConnected && document.activeElement === document.body) {
        chipRef.current?.focus();
      }
    });
  });

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
    const timer = setTimeout(() => {
      // The disappearing result chip must not leave keyboard focus on the body.
      if (document.activeElement === chipRef.current) startRef.current?.focus();
      setPhase("idle");
    }, activityStatusResultMs);
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
        exit={{ kind: "back", label: copy.back, onClick: () => {} }}
        title={copy.screenTitle}
        trailing={phase === "idle" ? undefined : (
          <ActivityChip
            ref={chipRef}
            label={phase === "running" ? copy.chipRunning : copy.chipDone}
            accessibilityLabel={phase === "running" ? copy.chipRunningSpoken : copy.chipDoneSpoken}
            emphasis={phase === "done" ? "emphasis" : "default"}
            expanded={open}
            media={<Mascot />}
            onClick={event => { event.currentTarget.focus(); toggle(); }}
          />
        )}
      />
      <Container gutter="compact">
        <Stack gap="md">
          <Text>{copy.body}</Text>
          <Button ref={startRef} tone="secondary" onClick={start} disabled={phase === "running"}>
            {phase === "idle" ? copy.start : copy.restart}
          </Button>
          <Text role="status">{notice ?? ""}</Text>
          <Text tone="muted">{copy.fixture}</Text>
        </Stack>
      </Container>
    </Stack>
  );
}

export function ActivityStatusPreview(props: ActivityStatusProps) {
  const panelFocus = useRef<HTMLElement | null>(null);
  return (
    <div
      // Portal focus bubbles through this React owner but lies outside its DOM.
      // Track only actual panel focus; an explicit blur relinquishes ownership.
      onFocusCapture={event => { panelFocus.current = event.currentTarget.contains(event.target) ? null : event.target; }}
      onBlurCapture={event => { if (panelFocus.current === event.target && event.target.isConnected) panelFocus.current = null; }}
    >
      <ToastProvider label={copy.region} placement="top">
        <ActivityStatusScreen {...props} panelFocus={panelFocus} />
      </ToastProvider>
    </div>
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
