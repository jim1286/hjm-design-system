import { useEffect, useRef, useState } from "react";
import { PatternStatus } from "./pattern-status";
import { ScrollView, Text as NativeText, View } from "react-native";
import { ActivityChip } from "@hjmds/react-native/activity-chip";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { ToastRegion, useToastRegion } from "@hjmds/react-native/feedback";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { TopBar } from "@hjmds/react-native/top-bar";
import {
  activityStatusCopy as copy,
  activityStatusDescriptor,
  activityStatusResultMs,
  activityStatusStepMs,
  activityStatusSteps,
  activityStatusToastId,
  type ActivityStatusPhase,
  type ActivityStatusProps,
} from "../../shared/activity-status";

// Placeholder mascot: an emoji so no product asset or SVG peer ships in HJM. Products pass their own media.
export function Mascot() {
  return <NativeText accessible={false} allowFontScaling={false} style={{ fontSize: 20 }}>🐥</NativeText>;
}

function ActivityStatusScreen({ initial = "idle" }: ActivityStatusProps) {
  const { publish, dismiss } = useToastRegion();
  const [phase, setPhase] = useState<ActivityStatusPhase>(initial);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(initial === "running");
  const [notice, setNotice] = useState<string | null>(null);
  // The region calls onDismiss for the close button, swipe and programmatic dismiss alike, so `open` follows it.
  const closeRef = useRef(() => setOpen(false));

  useEffect(() => {
    if (phase !== "running") return;
    const timer = setTimeout(() => {
      if (step < activityStatusSteps.length - 1) setStep(step + 1);
      else setPhase("done");
    }, activityStatusStepMs);
    return () => clearTimeout(timer);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "done" || open) return;
    const timer = setTimeout(() => setPhase("idle"), activityStatusResultMs);
    return () => clearTimeout(timer);
  }, [phase, open]);

  // Depend on the stable publish method, not the region controller object: publishing
  // updates that controller and would otherwise trigger an endless publication loop.
  // Same id + durationMs null keeps each step in the same panel.
  useEffect(() => {
    if (!open || phase === "idle") return;
    publish(activityStatusDescriptor(phase, step, <Mascot />, {
      onDismiss: () => closeRef.current(),
      onOpenResult: () => setNotice(copy.resultOpened),
    }));
  }, [open, phase, step, publish]);

  const toggle = () => {
    if (open) dismiss(activityStatusToastId, "programmatic");
    else setOpen(true);
  };
  const start = () => { setNotice(null); setStep(0); setPhase("running"); };

  return (
    <View style={{ flex: 1 }}>
      <TopBar
        leading={<IconButton label={copy.back} onPress={() => {}}><NativeText accessible={false}>←</NativeText></IconButton>}
        title={copy.screenTitle}
        {...(phase === "idle" ? {} : {
          trailing: (
            <ActivityChip
              label={phase === "running" ? copy.chipRunning : copy.chipDone}
              accessibilityLabel={phase === "running" ? copy.chipRunningSpoken : copy.chipDoneSpoken}
              emphasis={phase === "done" ? "emphasis" : "default"}
              expanded={open}
              media={<Mascot />}
              onPress={toggle}
            />
          ),
        })}
      />
      <ScrollView>
        <Container gutter="compact">
          <Stack gap="md">
            <Text>{copy.body}</Text>
            <Button tone="secondary" onPress={start} disabled={phase === "running"}>
              {phase === "idle" ? copy.start : copy.restart}
            </Button>
            {notice ? <PatternStatus announceOnMount>{notice}</PatternStatus> : null}
            <Text tone="muted">{copy.fixture}</Text>
          </Stack>
        </Container>
      </ScrollView>
    </View>
  );
}

export function ActivityStatusPreview(props: ActivityStatusProps) {
  return (
    <ToastRegion placement="top" maxVisible={1} accessibilityLabel={copy.region} layoutStyle={{ flex: 1 }}>
      <ActivityStatusScreen {...props} />
    </ToastRegion>
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
          onPress={() => setOpen(value => !value)}
        />
        <ActivityChip label={copy.chipRunning} onPress={() => {}} />
      </Stack>
    </Container>
  );
}
