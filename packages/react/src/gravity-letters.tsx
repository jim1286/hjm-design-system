import { useLayoutEffect, useRef } from "react";
import { gravityLetterMotion, resolveGravityLetters } from "@hjmds/design-contracts/gravity-letters";
import { useHjmTheme } from "./provider.js";
export type GravityLettersProps = Readonly<{ glyphs: readonly string[]; active?: boolean; replayKey?: string | number }>;
/** Decorative only: provide the meaningful heading outside this hidden presentation. */
export function GravityLetters({ glyphs, active = false, replayKey = 0 }: GravityLettersProps) {
  const { environment } = useHjmTheme();
  const root = useRef<HTMLSpanElement>(null);
  const signature = JSON.stringify(glyphs);
  const units = resolveGravityLetters(glyphs);
  useLayoutEffect(() => {
    if (!active || environment.reducedMotion || document.hidden) return;
    const recipe = resolveGravityLetters(JSON.parse(signature) as string[]);
    const animations = [...root.current!.children].map((node, index) => node.animate(
      gravityLetterMotion.input.map((offset, step) => ({ offset, transform: `translateY(${gravityLetterMotion.y[step]}px) rotate(${step === 0 ? recipe[index]!.rotation : 0}deg)` })),
      { duration: gravityLetterMotion.duration, delay: recipe[index]!.delay, fill: "backwards", easing: "ease-out" },
    ));
    const stop = () => animations.forEach(animation => animation.cancel());
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { stop(); document.removeEventListener("visibilitychange", visibility); };
  }, [signature, active, replayKey, environment.reducedMotion]);
  return <span ref={root} aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", pointerEvents: "none", paddingTop: 36 }}>{units.map((unit, index) => <span key={index} style={{ display: "inline-block", whiteSpace: "pre" }}>{unit.glyph}</span>)}</span>;
}
