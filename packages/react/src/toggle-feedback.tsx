"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { resolveToggleFeedbackProposal, resolveToggleFeedbackFrame, toggleFeedbackPaths, toggleFeedbackRecipe, type ToggleFeedbackEffect, type ToggleFeedbackState } from "@hjmds/design-contracts/toggle-feedback";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Stack, Text } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function FeedbackGlyph({ effect, selected, active, icon }: Readonly<{ effect: ToggleFeedbackEffect; selected: boolean; active: boolean; icon?: ReactNode }>) {
  const glyph = useRef<HTMLSpanElement>(null), circle = useRef<SVGCircleElement>(null), rays = useRef<SVGPathElement>(null), previous = useRef(selected);
  const reduced = useHjmTheme().environment.reducedMotion;
  useEffect(() => {
    const entering = selected && !previous.current; previous.current = selected;
    let frame = 0, start: number | undefined;
    const draw = (p: number) => { const f = resolveToggleFeedbackFrame(effect, p); glyph.current?.style.setProperty("transform", `translateY(${f.translateY}px) scale(${f.scale})`); circle.current?.setAttribute("r", String(f.radius)); circle.current?.setAttribute("opacity", effect === "ripple" ? String(f.opacity) : "0"); rays.current?.setAttribute("d", f.rays); rays.current?.setAttribute("opacity", effect === "burst" ? String(f.opacity) : "0"); };
    const settle = () => { cancelAnimationFrame(frame); draw(1); };
    const animate = (now: number) => { start ??= now; const p = Math.min(1, (now - start) / toggleFeedbackRecipe.duration); draw(p); if (p < 1) frame = requestAnimationFrame(animate); };
    // The old selected state consumes the event; environment changes never replay it.
    if (!entering || reduced || !active || document.hidden) settle(); else { draw(0); frame = requestAnimationFrame(animate); }
    const visibility = () => { if (document.hidden) settle(); }; document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [selected, effect, active, reduced]);
  const f = resolveToggleFeedbackFrame(effect, 1);
  return <span aria-hidden="true" style={{ position: "relative", display: "inline-flex", width: toggleFeedbackRecipe.glyphSize, height: toggleFeedbackRecipe.glyphSize }}>
    <span ref={glyph} style={{ display: "inline-flex" }}>{icon ?? <svg width={24} height={24} viewBox="0 0 24 24" focusable="false"><path d={toggleFeedbackPaths[effect]} fill={selected ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" /></svg>}</span>
    <svg data-toggle-effect={effect} width={40} height={40} viewBox="0 0 40 40" focusable="false" style={{ position: "absolute", left: -8, top: -8, pointerEvents: "none" }} fill="none" stroke="currentColor" strokeWidth={1.7}><circle ref={circle} cx={20} cy={20} r={f.radius} opacity={0} /><path ref={rays} d={f.rays} opacity={0} strokeLinecap="round" /></svg>
  </span>;
}
export type ToggleFeedbackButtonProps = Readonly<{
  entityId: string; state: ToggleFeedbackState; effect: ToggleFeedbackEffect; locale: string; icon?: ReactNode;
  renderIcon?: (state: Readonly<{ selected: boolean; pending: boolean }>) => ReactNode;
  labels: Readonly<{ select: string; selected: string; pending: string; count: string; error: string }>;
  /** Update confirmed state from the real API snapshot before resolving. */
  onSelectedChange: (selected: boolean) => void | Promise<void>; disabled?: boolean; active?: boolean;
}>;
export function ToggleFeedbackButton(props: ToggleFeedbackButtonProps) {
  if (!props.entityId.trim()) throw new TypeError("Toggle feedback requires a stable entity id");
  return <ToggleFeedbackBody key={props.entityId} {...props} />;
}
function ToggleFeedbackBody(props: ToggleFeedbackButtonProps) {
  resolveToggleFeedbackProposal(props.state, props.state.selected);
  const active = props.active !== false, action = useCompositionAction<ToggleFeedbackState>(props.disabled === true || !active), state = action.active ?? props.state;
  const icon = props.renderIcon ? props.renderIcon({ selected: state.selected, pending: action.pending }) : props.icon;
  return <Stack gap="sm"><Stack axis="inline" gap="md" align="center" wrap>
    <Button tone="secondary" selected={state.selected} loading={action.pending} disabled={props.disabled === true || !active} aria-label={action.pending ? props.labels.pending : undefined}
      leading={<FeedbackGlyph effect={props.effect} selected={state.selected} active={active} {...(icon === undefined ? {} : { icon })} />}
      onClick={() => { const proposal = resolveToggleFeedbackProposal(props.state, !props.state.selected); void action.run(proposal, () => props.onSelectedChange(proposal.selected)); }}>{state.selected ? props.labels.selected : props.labels.select}</Button>
    <AnimatedStatistic density="compact" descriptor={{ id: "selection-count", label: props.labels.count }} value={state.count} locale={props.locale} animated={active} />
  </Stack>{action.failed ? <Text role="alert" tone="danger" style={{ textAlign: "center" }}>{props.labels.error}</Text> : null}</Stack>;
}
