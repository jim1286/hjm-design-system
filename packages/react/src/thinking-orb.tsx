import { useEffect, useRef, type CSSProperties } from "react";
import { buildThinkingOrbFrame, createThinkingOrbClock, thinkingOrbRecipe, validateThinkingOrb, type ThinkingOrbOptions } from "@hjmds/design-contracts/components/thinking-orb";
import { useHjmTheme } from "./provider.js";

export type ThinkingOrbProps = ThinkingOrbOptions & Readonly<{ className?: string; style?: CSSProperties }>;
/** Optional AI status presentation; ordinary loading retains Spinner. */
export function ThinkingOrb({ state = "working", appearance = "state", size = 64, label, speed = 1, paused = false, active = true, className, style }: ThinkingOrbProps) {
  validateThinkingOrb({ state, appearance, size, speed, label });
  const theme = useHjmTheme();
  const ink = theme.palette.theme.text;
  const reduced = theme.environment.reducedMotion;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clock = useRef(createThinkingOrbClock());
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let ratio = 1;
    let raf = 0;
    let visible = typeof IntersectionObserver === "undefined";
    let disposed = false;
    const draw = () => {
      const frame = buildThinkingOrbFrame(state, size, reduced ? thinkingOrbRecipe.motion.staticTime : clock.current.time, appearance);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = ctx.strokeStyle = ink;
      // Depth becomes semantic-ink opacity, so brand palettes work on any HJM surface.
      for (const line of frame.lines) {
        ctx.globalAlpha = (1 - Math.min(1, Math.max(0, line.white))) * (line.a ?? 1);
        ctx.lineWidth = line.w;
        ctx.beginPath(); ctx.moveTo(line.x1, line.y1); ctx.lineTo(line.x2, line.y2); ctx.stroke();
      }
      for (const dot of frame.dots) {
        ctx.globalAlpha = (1 - Math.min(1, Math.max(0, dot.white))) * (dot.a ?? 1);
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      ratio = Math.min(thinkingOrbRecipe.maxPixelRatio, window.devicePixelRatio || 1);
      canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
      draw();
    };
    const eligible = () => !disposed && active && !paused && !reduced && visible && document.visibilityState !== "hidden";
    const loop = (now: number) => {
      raf = 0;
      if (!eligible()) return;
      clock.current.sample(now, speed); draw();
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; clock.current.resetDelta();
      if (eligible()) raf = requestAnimationFrame(loop);
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false; sync();
    });
    resize(); observer?.observe(canvas); sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", resize);
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer?.disconnect(); clock.current.resetDelta();
      document.removeEventListener("visibilitychange", sync); window.removeEventListener("resize", resize);
    };
  }, [state, appearance, size, speed, active, paused, reduced, ink]);
  return <span className={className} data-hjm-thinking-orb={state} role="status" aria-live="polite" aria-atomic="true" style={{ display: "inline-flex", ...style }}>
    <canvas ref={canvasRef} aria-hidden="true" style={{ width: size, height: size, display: "block" }} />
    {/* Inline hiding works for granular consumers who do not import the stylesheet. */}
    <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 }}>{label}</span>
  </span>;
}
