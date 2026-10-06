import { resolveContentTransition, type ContentTransitionPreset } from "@hjmds/design-contracts/content-transition";
import { motion } from "framer-motion";
import { useCallback, useRef, useLayoutEffect, type ReactNode, type RefObject } from "react";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ContentTransitionProps = {
  preset?: ContentTransitionPreset;
  stateKey: string; children: ReactNode; motion?: "system" | "none";
  /** Host chooses a meaningful focus destination, e.g. the new panel heading. */
  focusTarget?: RefObject<HTMLElement | null>;
  /** Canonical layout-only placement on the stable outer wrapper, not the keyed panel. */
  layoutStyle?: HjmCompositionStyleProp;
};
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export function ContentTransition({ stateKey, children, motion: preference = "system", preset = "fade", focusTarget, layoutStyle }: ContentTransitionProps) {
  const { environment } = useHjmTheme();
  const from = resolveContentTransition(preset, environment.direction);
  const enabled = preference !== "none" && !environment.reducedMotion;
  const first = useRef(true);
  const host = useRef<HTMLDivElement>(null);
  const restore = useRef(false);
  const capturePanel = useCallback((node: HTMLDivElement | null) => {
    // The keyed node detaches before DOM removal. Parent effect cleanup runs too
    // late: the browser has already moved focus to body by then.
    if (!node) restore.current = Boolean(host.current?.contains(document.activeElement));
    host.current = node;
  }, []);
  useLayoutEffect(() => {
    if (restore.current) focusTarget?.current?.focus();
    restore.current = false;
    first.current = false;
  }, [stateKey, focusTarget]);
  return <div style={layoutStyle}><motion.div ref={capturePanel} key={stateKey} initial={enabled && !first.current ? { opacity: from.opacity, x: from.translateX, y: from.translateY, scale: from.scale } : false}
    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }} transition={{ duration: enabled ? timing.normal / 1000 : 0, ease: [...easing.enter] }}>{children}</motion.div></div>;
}
export type TextTransitionProps = { preset?: ContentTransitionPreset; text: string; motion?: "system" | "none"; layoutStyle?: HjmCompositionStyleProp };
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export function TextTransition({ text, motion: preference, preset, layoutStyle }: TextTransitionProps) {
  return <ContentTransition stateKey={text} {...(preset ? { preset } : {})} {...(preference ? { motion: preference } : {})} {...(layoutStyle ? { layoutStyle } : {})}>{text}</ContentTransition>;
}
