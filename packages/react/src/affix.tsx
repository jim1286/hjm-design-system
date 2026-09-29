import { useEffect, useRef, useState, type ReactNode } from "react";
import { affixRecipe, validateAffixOffset } from "@hjmds/design-contracts/components/affix";
export type AffixProps = Readonly<{ children: ReactNode; offset?: number; disabled?: boolean; onChange?: (affixed: boolean) => void }>;
/** CSS keeps natural flow, parent boundaries and focus intact; JS only observes state and oversize content. */
export function Affix({ children, offset = affixRecipe.offset, disabled = false, onChange }: AffixProps) {
  validateAffixOffset(offset);
  const marker = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const callback = useRef(onChange); callback.current = onChange;
  const [affixed, setAffixed] = useState(false);
  const [oversize, setOversize] = useState(false);
  const reported = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    const node = content.current; const sentinel = marker.current;
    if (!node || !sentinel) return;
    let frame = 0;
    function measure() {
      frame = 0;
      let scrollRoot = node!.parentElement;
      while (scrollRoot && !/(auto|scroll|hidden|overlay)/.test(getComputedStyle(scrollRoot).overflowY)) scrollRoot = scrollRoot.parentElement;
      const viewportHeight = scrollRoot?.clientHeight ?? document.documentElement.clientHeight;
      const edge = (scrollRoot ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientTop : 0) + offset;
      const rect = node!.getBoundingClientRect();
      const tooTall = rect.height > viewportHeight - offset;
      setOversize(tooTall);
      // One CSS pixel tolerates subpixel scroll rounding, not a second positioning system.
      const next = !disabled && !tooTall && sentinel!.getBoundingClientRect().top < edge && Math.abs(rect.top - edge) <= 1;
      setAffixed(next);
      if (reported.current !== next) { reported.current = next; callback.current?.(next); }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    for (let parent = node.parentElement; parent; parent = parent.parentElement) resize.observe(parent);
    measure(); document.addEventListener("scroll", schedule, true); window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); document.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); };
  }, [offset, disabled, oversize]);
  return <><span ref={marker} className="hjm-affix__marker" aria-hidden="true" /><div ref={content} data-hjm-affix data-affixed={affixed} data-oversize={oversize} className="hjm-affix" style={{ position: disabled || oversize ? "relative" : affixRecipe.position, top: disabled || oversize ? undefined : offset }}>{children}</div></>;
}
