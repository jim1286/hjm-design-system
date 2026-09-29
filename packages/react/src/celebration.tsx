import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { celebrationColors, celebrationRecipe, validateEventId, type CelebrationPreset } from "@hjmds/design-contracts/components/interaction-adapters";
import { useHjmTheme } from "./provider.js";

export type CelebrationProps = { eventId: string; preset?: CelebrationPreset; onComplete?(): void };
export function Celebration({ eventId, preset = "small-burst", onComplete }: CelebrationProps) {
  validateEventId(eventId);
  const canvas = useRef<HTMLCanvasElement>(null);
  const seen = useRef(new Set<string>());
  const { environment, palette } = useHjmTheme();
  const latest = useRef({ preset, onComplete, environment, palette }); latest.current = { preset, onComplete, environment, palette };
  const stop = useRef<() => void>(() => {});
  useEffect(() => {
    let disposed = false; let done = false; let started = false;
    let fire: ReturnType<typeof confetti.create> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => { fire?.reset(); if (!disposed && !done && started) { done = true; latest.current.onComplete?.(); } };
    stop.current = finish;
    // Wait until after Strict Mode's probe cleanup before consuming an event.
    queueMicrotask(() => {
      if (disposed || seen.current.has(eventId)) return;
      seen.current.add(eventId); started = true;
      const current = latest.current;
      if (current.environment.reducedMotion || document.hidden) { finish(); return; }
      fire = confetti.create(canvas.current!, { resize: true, disableForReducedMotion: true });
      // A private canvas avoids cancelling another screen's animation on cleanup.
      void fire({ particleCount: celebrationRecipe[current.preset].count,
        colors: celebrationColors(current.palette.theme.primary, current.palette.statusAccents), origin: { y: 0.7 } });
      timer = setTimeout(finish, celebrationRecipe[current.preset].duration);
    });
    const visibility = () => { if (document.hidden) finish(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); fire?.reset(); };
  }, [eventId]);
  useEffect(() => { if (environment.reducedMotion) stop.current(); }, [environment.reducedMotion]);
  return <canvas ref={canvas} aria-hidden style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
