"use client";

import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { Spinner } from "./spinner.js";

export type PendingContentProps = Readonly<{
  pending: boolean;
  label: string;
  children: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Shared host for the public region and AuthScreen's focus-managed action block. */
export function PendingContentHost({ pending, label, children, layoutStyle, className, contentProps, indicatorClassName }:
  PendingContentProps & { className?: string; contentProps?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }; indicatorClassName?: string }) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    if (pending || !content.current) return;
    const node = content.current;
    const measure = () => { const next = node.getBoundingClientRect().height; if (next > 0) setHeight(next); };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure); observer.observe(node);
    return () => observer.disconnect();
  }, [pending]);
  if (pending && !label.trim()) throw new TypeError("PendingContent requires a non-empty pending label");
  return <div className={className} aria-busy={pending || undefined}
    style={{ ...layoutStyle, position: "relative", width: "100%", ...(pending && height ? { height } : {}) }}>
    <div {...contentProps} ref={node => {
      content.current = node;
      const ref = contentProps?.ref;
      if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
    }} inert={pending} aria-hidden={pending || undefined} style={pending ? { visibility: "hidden" } : undefined}>{children}</div>
    {pending ? <div className={indicatorClassName} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <Spinner label={label} />
    </div> : null}
  </div>;
}

/** Keep controls mounted and preserve their last ready height while a single centered spinner replaces them. */
export function PendingContent(props: PendingContentProps) { return <PendingContentHost {...props} />; }
