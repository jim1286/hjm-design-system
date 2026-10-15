"use client";
import { useEffect, useRef, useState } from "react";
import { mediaTransportPaths, resolveMediaPlayback, type MediaPlaybackState } from "@hjmds/design-contracts/media-transport";
import { motion } from "@hjmds/design-contracts/foundations";
import { IconButton } from "./actions.js";
import { Slider } from "./slider.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function MediaGlyph({ playing, active }: Readonly<{ playing: boolean; active: boolean }>) {
  const first = useRef<SVGPathElement>(null), second = useRef<SVGPathElement>(null), current = useRef(playing ? 1 : 0);
  const reduced = useHjmTheme().environment.reducedMotion;
  useEffect(() => {
    const target = playing ? 1 : 0, initial = current.current; let frame = 0, start: number | undefined;
    const draw = (value: number) => { current.current = value; const paths = mediaTransportPaths(value); first.current?.setAttribute("d", paths[0]); second.current?.setAttribute("d", paths[1]); };
    const settle = () => { cancelAnimationFrame(frame); draw(target); };
    const visibility = () => { if (document.hidden) settle(); };
    const animate = (now: number) => { start ??= now; const p = Math.min(1, (now - start) / motion.normal); draw(initial + (target - initial) * (1 - (1-p)**3)); if (p < 1) frame = requestAnimationFrame(animate); };
    // Geometry updates go directly to SVG: no per-frame React render and no background loop.
    if (reduced || !active || document.hidden || initial === target) settle(); else frame = requestAnimationFrame(animate);
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [playing, active, reduced]);
  const paths = mediaTransportPaths(current.current);
  return <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path ref={first} d={paths[0]} /><path ref={second} d={paths[1]} /></svg>;
}
export type MediaTransportProps = Readonly<{
  state: MediaPlaybackState; onPlay: () => void | Promise<void>; onPause: () => void | Promise<void>;
  /** Resolve after the adapter confirms the actual seek; rejecting keeps the observed position. */
  onSeek: (seconds: number) => void | Promise<void>;
  labels: Readonly<{ play: string; pause: string; seek: string; decrement: string; increment: string; unknownDuration: string; error: string }>;
  formatTime: (seconds: number) => string; disabled?: boolean; active?: boolean;
}>;
export function MediaTransport(props: MediaTransportProps) {
  const state = resolveMediaPlayback(props.state), active = props.active !== false;
  const action = useCompositionAction(props.disabled === true || !active), [draft, setDraft] = useState<number | null>(null);
  const locked = props.disabled === true || !active || action.pending;
  useEffect(() => { if (!active) setDraft(null); }, [active]);
  const toggle = () => { void action.run(state.playing ? "pause" : "play", state.playing ? props.onPause : props.onPlay); };
  const seek = (seconds: number) => {
    if (locked || !state.seekable) return;
    void action.run("seek", () => props.onSeek(Math.min(state.duration!, Math.max(0, seconds)))).then(result => { if (result.status === "success" || result.status === "error") setDraft(null); });
  };
  return <Stack gap="md"><Stack axis="inline" gap="sm" align="center">
    <IconButton label={state.playing ? props.labels.pause : props.labels.play} tone="ghost" selected={state.playing} loading={action.pending || (state.buffering === true && !state.playing)} disabled={props.disabled === true || !active} onClick={toggle}><MediaGlyph playing={state.playing} active={active} /></IconButton>
    <Text variant="caption">{props.formatTime(state.position)} / {state.duration === null ? props.labels.unknownDuration : props.formatTime(state.duration)}</Text>
  </Stack>
  {state.seekable ? <Slider label={props.labels.seek} min={0} max={state.duration!} step={.1} value={Math.min(state.duration!, draft ?? state.position)} disabled={locked}
    onValueChange={seconds => { if (!locked) setDraft(seconds); }} onValueChangeEnd={seek} getValueText={props.formatTime}  /> : null}
  {action.failed ? <Text role="alert" tone="danger" style={{ textAlign: "center" }}>{props.labels.error}</Text> : null}</Stack>;
}
