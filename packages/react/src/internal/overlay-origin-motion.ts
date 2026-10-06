import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { resolveOriginTransition, type TransitionRect } from '@hjmds/design-contracts/content-transition';
import { dialogRecipe } from '@hjmds/design-contracts/recipes';
import { easing } from '@hjmds/design-contracts/foundations';

/** Keep one real modal subtree through exit; cancellation must never settle a reopened cycle. */
export function useOverlayOriginMotion(open: boolean, origin: TransitionRect | undefined, reduced: boolean | undefined) {
  const systemReduced = useSyncExternalStore(subscribeMotion, readMotion, () => false);
  const reduce = reduced ?? systemReduced;
  const interrupted = useRef<string | null>(null);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [present, setPresent] = useState(open);
  const visible = open || present;
  useLayoutEffect(() => {
    if (!node) { interrupted.current = null; if (!open) setPresent(false); return; }
    if (open) setPresent(true);
    const transform = resolveOriginTransition(origin, node.getBoundingClientRect(), reduce);
    if (!transform || typeof node.animate !== 'function') { interrupted.current = null; setPresent(open); return; }
    const from = `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scaleX}, ${transform.scaleY})`;
    const start = interrupted.current;
    interrupted.current = null;
    const phase = open ? dialogRecipe.transition.enter : dialogRecipe.transition.exit;
    let cancelled = false;
    let animation: Animation;
    try {
      // WAAPI only owns presentation. Modal focus, state and completion remain canonical.
      animation = node.animate([{ transform: start ?? (open ? from : 'none') }, { transform: open ? 'none' : from }], {
        duration: phase.duration, easing: `cubic-bezier(${easing[phase.easing].join(',')})`, fill: 'both',
      });
    } catch { setPresent(open); return; }
    animation.finished.then(() => {
      if (cancelled) return;
      if (!open) setPresent(false);
      animation.cancel();
    }, () => { if (!cancelled) setPresent(open); });
    return () => {
      cancelled = true;
      // Sample before cancelling so a rapid close/reopen continues at its current visual position.
      interrupted.current = animation.playState === 'running' ? getComputedStyle(node).transform : null;
      animation.cancel();
    };
  }, [open, node, origin?.x, origin?.y, origin?.width, origin?.height, reduce]);
  return { visible, setNode };
}

function readMotion() { return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function subscribeMotion(listener: () => void) {
  if (typeof matchMedia === 'undefined') return () => {};
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
