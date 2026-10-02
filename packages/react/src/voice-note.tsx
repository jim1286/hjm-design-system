import type { ReactNode } from "react";
import { resolveVoiceNote, type VoiceNoteDescriptor } from "@hjmds/design-contracts/voice-note";
import { Asset } from "./asset.js";
import { Button } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Surface, Text } from "./layout.js";

export type VoiceNoteProps = Readonly<{
  descriptor: VoiceNoteDescriptor;
  labels: Readonly<{ play: string; pause: string; seek: string; loading: string; error: string; retry: string; backward: string; forward: string }>;
  /** Localized elapsed/duration text and slider accessible value. */
  formatTime: (seconds: number) => string;
  artwork?: ReactNode;
  onPlayingChange: (playing: boolean) => void;
  onSeek: (seconds: number) => void;
  onRetry?: () => void;
}>;

/** Audio engine, network, file permission and playback lifecycle remain host-owned. */
export function VoiceNote({ descriptor, labels, formatTime, artwork, onPlayingChange, onSeek, onRetry }: VoiceNoteProps) {
  const media = resolveVoiceNote(descriptor);
  const error = media.state === "error";
  return <Surface padding="lg"><Stack gap="md">
    <Stack axis="inline" gap="md">
      {artwork ? <Asset descriptor={{kind:"image",decorative:true,shape:"circle"}}>{artwork}</Asset> : null}
      <Text emphasis="strong">{media.title}</Text>
    </Stack>
    <Slider label={labels.seek} min={0} max={media.duration || 1} step={0.1} value={media.position} disabled={!media.canSeek} onValueChange={onSeek} getValueText={formatTime}  />
    <Text tone="muted">{formatTime(media.position)}{media.duration === null ? "" : ` / ${formatTime(media.duration)}`}</Text>
    {error ? <Text role="alert">{labels.error}</Text> : null}
    <Stack axis="inline" gap="sm">
      <Button disabled={!media.canPlay} loading={media.state === "loading"} onClick={() => onPlayingChange(media.state !== "playing")}>{media.state === "loading" ? labels.loading : media.state === "playing" ? labels.pause : labels.play}</Button>
      {error && onRetry ? <Button disabled={media.disabled ?? false} onClick={onRetry}>{labels.retry}</Button> : null}
    </Stack>
  </Stack></Surface>;
}
