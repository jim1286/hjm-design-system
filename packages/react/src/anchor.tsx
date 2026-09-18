import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type MouseEvent } from "react";
import { getAnchorCurrentId, resolveAnchorItems, type AnchorItem } from "@hjmds/design-contracts/components/anchor";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
export type AnchorProps = Omit<HTMLAttributes<HTMLElement>, "children"> & Readonly<{
  label: string;
  items: readonly AnchorItem[];
  /** undefined observes the document; null waits for a custom scroll ref. */
  container?: HTMLElement | null;
  offset?: number;
  orientation?: "vertical" | "horizontal";
  historyMode?: "push" | "replace" | "none";
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}>;

/** Same-document table of contents; sticky positioning belongs to its host layout. */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor({ label, items, container, offset = 0,
  orientation = "vertical", historyMode = "push", onNavigate, className, ...props }, ref) {
  const resolved = resolveAnchorItems(items);
  if (!label.trim()) throw new TypeError("Anchor label must not be empty");
  getAnchorCurrentId([], offset);
  const theme = useOptionalHjmTheme();
  const [current, setCurrent] = useState<string>();
  const restoredTargets = useRef(new Map<HTMLElement, () => void>());
  const idsKey = JSON.stringify(resolved.map(({ id }) => id));
  const findTarget = (id: string) => {
    const target = document.getElementById(id);
    return target && (container === undefined || container?.contains(target)) ? target : null;
  };
  function scrollToTarget(target: HTMLElement, behavior: ScrollBehavior) {
    const top = container === undefined ? window.scrollY + target.getBoundingClientRect().top - offset
      : container === null ? 0 : container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - container.clientTop - offset;
    if (container === undefined) window.scrollTo({ top, behavior });
    else container?.scrollTo({ top, behavior });
  }
  function focusTarget(target: HTMLElement) {
    if (!target.hasAttribute("tabindex")) {
      // Headings/sections are often not focusable. Restore our temporary attribute
      // on blur/unmount so navigation does not permanently change product markup.
      restoredTargets.current.get(target)?.();
      target.setAttribute("tabindex", "-1");
      const restore = () => { if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex"); target.removeEventListener("blur", restore); restoredTargets.current.delete(target); };
      restoredTargets.current.set(target, restore); target.addEventListener("blur", restore, { once: true });
    }
    target.focus({ preventScroll: true });
  }
  useEffect(() => () => { for (const restore of [...restoredTargets.current.values()]) restore(); }, []);
  useEffect(() => {
    if (container === null) return;
    const source = container ?? window;
    const content = container ?? document.body;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = container ? container.getBoundingClientRect().top + container.clientTop : 0;
      const scroll = container ?? document.scrollingElement;
      // One CSS pixel covers scroll-height rounding without prematurely selecting a short final section.
      const atEnd = !!scroll && scroll.scrollHeight > scroll.clientHeight && scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 1;
      const positions = resolved.flatMap(({ id }) => { const node = findTarget(id); return node ? [{ id, top: node.getBoundingClientRect().top - top }] : []; });
      setCurrent(getAnchorCurrentId(positions, offset, atEnd));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    const observe = () => { resize.disconnect(); resize.observe(content); for (const item of resolved) { const node = findTarget(item.id); if (node) { resize.observe(node); if (node.parentElement) resize.observe(node.parentElement); } } };
    const mutation = new MutationObserver(() => { observe(); schedule(); });
    mutation.observe(content, { childList: true, subtree: true, characterData: true });
    const restoreHash = () => {
      let id: string; try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      if (!resolved.some((item) => item.id === id)) return;
      const target = findTarget(id); if (target) scrollToTarget(target, "instant"); schedule();
    };
    observe(); update(); restoreHash(); source.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule); window.addEventListener("hashchange", restoreHash); window.addEventListener("popstate", restoreHash);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); source.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("hashchange", restoreHash); window.removeEventListener("popstate", restoreHash); };
  }, [idsKey, container, offset]);
  return <nav {...props} ref={ref} aria-label={label} className={classNames("hjm-anchor", className)} data-orientation={orientation}>
    <ul className="hjm-anchor__list">{resolved.map((item) => <li key={item.id}><a href={item.href} className="hjm-anchor__link" aria-current={current === item.id ? "location" : undefined}
      onClick={(event) => {
        onNavigate?.(item.id, event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const target = findTarget(item.id); if (!target) return;
        event.preventDefault();
        const reduced = theme?.environment.reducedMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollToTarget(target, reduced ? "instant" : "smooth"); focusTarget(target);
        if (historyMode !== "none" && window.location.hash !== item.href) window.history[historyMode === "replace" ? "replaceState" : "pushState"](window.history.state, "", item.href);
      }}>{item.label}</a></li>)}</ul>
  </nav>;
});
