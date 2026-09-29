import { useEffect, useRef, useState } from "react";
import { AppState, View, StyleSheet } from "react-native";
import { Confetti } from "react-native-fast-confetti";
import { celebrationColors, celebrationRecipe, validateEventId, type CelebrationPreset } from "@hjmds/design-contracts/components/interaction-adapters";
import { useHjmNativeTheme } from "./provider.js";

export type CelebrationProps = { eventId: string; preset?: CelebrationPreset; onComplete?(): void };
export function Celebration({ eventId, preset = "small-burst", onComplete }: CelebrationProps) {
  validateEventId(eventId);
  const { environment, colors, palette } = useHjmNativeTheme();
  const [active, setActive] = useState(false);
  const seen = useRef(new Set<string>());
  const callback = useRef(onComplete); callback.current = onComplete;
  const playback = useRef<{ id: string; start(): void; end(): void } | null>(null);
  const stop = useRef<() => void>(() => {});
  const config = useRef({ preset, reduced: environment.reducedMotion }); config.current = { preset, reduced: environment.reducedMotion };
  useEffect(() => {
    let disposed = false; let done = false; let started = false; let playing = false; let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => { if (!done && !disposed && started) { done = true; setActive(false); callback.current?.(); } };
    stop.current = finish;
    playback.current = { id: eventId, end: finish, start: () => {
      if (disposed || done || playing) return;
      playing = true; clearTimeout(timer);
      timer = setTimeout(finish, celebrationRecipe[config.current.preset].duration);
    } };
    setActive(false);
    // Defer starting until after Strict Mode's probe cleanup, avoiding a consumed
    // event with no animation. The event remains owned by this mounted session.
    queueMicrotask(() => {
      if (disposed || seen.current.has(eventId)) return;
      seen.current.add(eventId); started = true;
      if (config.current.reduced || AppState.currentState !== "active") { finish(); return; }
      setActive(true);
      // Atlas/layout startup consumed nearly the whole 1.6s recipe in device QA.
      // Measure playback from the engine callback; bound failed startup separately.
      timer = setTimeout(finish, 5000);
    });
    const sub = AppState.addEventListener("change", state => { if (state !== "active") finish(); });
    return () => { disposed = true; clearTimeout(timer); sub.remove(); };
  }, [eventId]);
  useEffect(() => { if (environment.reducedMotion) stop.current(); }, [environment.reducedMotion]);
  return active && !environment.reducedMotion ? <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    {/* Faster fall and a compact spawn band make the short HJM recipe visible
        before its deadline; upstream defaults barely enter the viewport in 1.6s. */}
    <Confetti gravity={6} verticalSpacing={12}
      onAnimationStart={() => { if (playback.current?.id === eventId) playback.current.start(); }}
      onAnimationEnd={() => { if (playback.current?.id === eventId) playback.current.end(); }} key={eventId} count={celebrationRecipe[preset].count} colors={celebrationColors(colors.primary, palette.statusAccents)} autoplay infinite={false} fadeOutOnEnd reduceMotion={{ mode: "system" }} />
  </View> : null;
}
