import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { resolveEffectSurface, type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useHjmTheme } from "./provider.js";
export type EffectSurfaceProps = Readonly<{ descriptor?: EffectSurfaceDescriptor; children: ReactNode; className?: string }>;
/** Decorative layers never receive pointer events or own the content's name. */
export function EffectSurface({ descriptor = {}, children, className }: EffectSurfaceProps) {
  const { palette, environment } = useHjmTheme();
  const effect = resolveEffectSurface(descriptor);
  const id = useId().replace(/:/g, "");
  const host = useRef<HTMLDivElement>(null);
  const layer = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false));
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = layer.current;
    if (!node || !effect.active || environment.reducedMotion || !visible || typeof node.animate !== "function") return;
    // WAAPI stays outside React renders; visibility changes cancel the loop and
    // expose its static composition rather than scheduling invisible frames.
    let animation: Animation | undefined;
    let failed = false;
    const sync = () => { animation?.cancel(); if (document.hidden || failed) return;
      // A host may expose WAAPI but reject animation creation. Keep the static SVG
      // and content instead of propagating a decorative failure to the application.
      try { animation = node.animate([
      { transform: "scale(1.08) translate(-1%, 0%)" },
      { transform: "scale(1.12) translate(1%, 1%)" },
      { transform: "scale(1.08) translate(-1%, 0%)" },
    ], { duration: effect.period * 1000, iterations: Infinity, easing: "ease-in-out" }); } catch { failed = true; } };
    sync(); document.addEventListener("visibilitychange", sync);
    return () => { animation?.cancel(); document.removeEventListener("visibilitychange", sync); };
  }, [effect.active, effect.period, environment.reducedMotion, visible]);
  const colors = effect.colors.map(color => resolveColorReference(color, palette));
  return <div ref={host} className={className} data-hjm-effect-surface="" style={{ position: "relative", isolation: "isolate", overflow: "hidden", background: palette.theme.bg }}>
    <svg ref={layer} aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: effect.intensity }}>
      <defs>{colors.map((color, index) => <radialGradient id={`${id}-${index}`} key={index}><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient>)}
        <pattern id={`${id}-grain`} width={4} height={4} patternUnits="userSpaceOnUse">{effect.points.map((point, index) => <circle key={index} cx={point.x / 25} cy={point.y / 25} r={point.radius / 10} fill={palette.theme.text} opacity={0.28} />)}</pattern>
      </defs>
      {effect.layers.includes("mesh") && effect.anchors.map((anchor, index) => <ellipse key={index} cx={anchor.x} cy={anchor.y} rx={65} ry={70} fill={`url(#${id}-${index})`} />)}
      {effect.layers.includes("glow") && <ellipse cx={50} cy={10} rx={70} ry={95} fill={`url(#${id}-0)`} />}
      {effect.layers.includes("grain") && <rect width={100} height={100} fill={`url(#${id}-grain)`} />}
    </svg>
    <div style={{ position: "relative" }}>{children}</div>
  </div>;
}
