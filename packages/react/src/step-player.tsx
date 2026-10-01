import type { ReactNode } from "react";
import { Steps, type StepsProps } from "./steps.js";
import { Progress } from "./feedback.js";
import { Button } from "./actions.js";
import { Stack } from "./layout.js";

export type StepPlayerProps = Readonly<{
  descriptor: StepsProps["descriptor"];
  statusLabels: StepsProps["statusLabels"];
  composeAccessibleName: StepsProps["composeAccessibleName"];
  /** Playback position is supplied by the host, never estimated from elapsed time. */
  progress: number;
  playing: boolean;
  disabled?: boolean;
  labels: Readonly<{ play: string; pause: string; replay: string; progress: string }>;
  onPlayingChange: (playing: boolean) => void;
  /** Host resets its cursor/progress and chooses whether replay starts immediately. */
  onReplay: () => void;
  children?: ReactNode;
}>;

/** Controlled playback chrome: Steps owns the cursor and Progress owns range semantics. */
export function StepPlayer({ descriptor, statusLabels, composeAccessibleName, progress, playing, disabled = false, labels, onPlayingChange, onReplay, children }: StepPlayerProps) {
  // No internal timer: walkthroughs, recordings and host processes have different clocks.
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError("StepPlayer progress must be between 0 and 1");
  for (const label of Object.values(labels)) if (!label.trim()) throw new TypeError("StepPlayer requires localized control labels");
  return <Stack gap="lg">
    <Steps descriptor={descriptor} statusLabels={statusLabels} composeAccessibleName={composeAccessibleName} />
    {children}
    <Progress label={labels.progress} value={progress} max={1} />
    <Stack axis="inline" gap="sm">
      <Button disabled={disabled} onClick={() => onPlayingChange(!playing)}>{playing ? labels.pause : labels.play}</Button>
      <Button disabled={disabled} tone="ghost" onClick={onReplay}>{labels.replay}</Button>
    </Stack>
  </Stack>;
}
