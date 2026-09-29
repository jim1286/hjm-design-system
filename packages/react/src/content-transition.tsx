import { motion } from "framer-motion";
import { useCallback, useRef, useLayoutEffect, type ReactNode, type RefObject } from "react";
import { easing, motion as timing } from "@hjmds/design-contracts/foundations";
import { useHjmTheme } from "./provider.js";

export type ContentTransitionProps = {
  stateKey: string; children: ReactNode; motion?: "system" | "none";
  /** Host chooses a meaningful focus destination, e.g. the new panel heading. */
  focusTarget?: RefObject<HTMLElement | null>;
};
/** Motion Primitives' keyed transition pattern, adapted to HJM's single active subtree.
 * No exiting interactive copy: it would duplicate fields and focus targets. See THIRD_PARTY_NOTICES. */
export function ContentTransition({ stateKey, children, motion: preference = "system", focusTarget }: ContentTransitionProps) {
  const { environment } = useHjmTheme();
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
  return <div><motion.div ref={capturePanel} key={stateKey} initial={enabled && !first.current ? { opacity: 0 } : false}
    animate={{ opacity: 1 }} transition={{ duration: enabled ? timing.normal / 1000 : 0, ease: [...easing.enter] }}>{children}</motion.div></div>;
}
export type TextTransitionProps = { text: string; motion?: "system" | "none" };
/** Whole-text fade preserves graphemes, text wrapping, selection and a single spoken value. */
export function TextTransition({ text, motion: preference }: TextTransitionProps) {
  return <ContentTransition stateKey={text} {...(preference ? { motion: preference } : {})}>{text}</ContentTransition>;
}
