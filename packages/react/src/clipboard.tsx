import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./actions.js";

// `onCopy` also names the DOM clipboard event handler on ButtonProps; intersected, the
// value callback had to accept a ClipboardEvent too and no product could pass it. The
// renderer consumes the prop and never forwards the DOM event, so omitting is lossless.
export type ClipboardButtonProps = Omit<ButtonProps, "children" | "onClick" | "onCopy"> &
  Readonly<{
    value: string;
    /** Localized copy for both states; the renderer invents neither. */
    labels: Readonly<{ idle: ReactNode; copied: ReactNode }>;
    /** How long the copied state stays, in ms. */
    feedbackDuration?: number;
    onCopy?: (value: string) => void;
    onCopyError?: (error: unknown) => void;
  }>;

const defaultFeedbackDuration = 2000;

/**
 * Copying is three things products kept re-deriving: the async clipboard call,
 * the temporary "copied" state, and announcing that state to a screen reader.
 * The last one is the part that was always missing — a label that only changes
 * visually tells a non-sighted user nothing happened.
 */
export const ClipboardButton = forwardRef<HTMLButtonElement, ClipboardButtonProps>(
  function ClipboardButton(
    // Default `secondary` (2026-10-06): copying is a helper beside the screen's main action, and the
    // inherited Button default `primary` added a second primary to screens that already had one.
    // Pass `tone="primary"` explicitly when copying *is* the screen's main action.
    { value, labels, feedbackDuration = defaultFeedbackDuration, onCopy, onCopyError, tone = "secondary", ...props },
    forwardedRef,
  ) {
    const [copied, setCopied] = useState(false);
    const [copying, setCopying] = useState(false);
    const pending = useRef(false);
    const generation = useRef(0);
    const mounted = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
      mounted.current = true;
      setCopying(pending.current);
      return () => {
        mounted.current = false;
        generation.current += 1;
        if (timer.current !== undefined) clearTimeout(timer.current);
      };
    }, []);
    useEffect(() => {
      // A new value makes the previous "copied" claim false: it referred to the
      // old string, and leaving it up tells the user something untrue.
      generation.current += 1;
      setCopied(false);
      if (timer.current !== undefined) clearTimeout(timer.current);
    }, [value]);

    const copy = useCallback(async () => {
      // OS clipboard promises cannot be cancelled. A per-value generation ignores
      // obsolete feedback/callbacks instead of announcing an old source as copied.
      // A ref also closes the gap before React paints the unavailable busy button.
      if (!mounted.current || pending.current) return;
      const request = ++generation.current;
      pending.current = true;
      setCopying(true);
      setCopied(false);
      if (timer.current !== undefined) clearTimeout(timer.current);
      try {
        await navigator.clipboard.writeText(value);
        if (!mounted.current || request !== generation.current) return;
        setCopied(true);
        if (timer.current !== undefined) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), feedbackDuration);
        onCopy?.(value);
      } catch (error) {
        // Clipboard access can be denied; swallowing that would leave the user
        // believing the value was copied.
        if (mounted.current && request === generation.current) onCopyError?.(error);
      } finally {
        // Keep the OS write single-flight across value changes as well: starting a
        // second write early could let the first overwrite its clipboard contents.
        pending.current = false;
        if (mounted.current) setCopying(false);
      }
    }, [value, feedbackDuration, onCopy, onCopyError]);

    return (
      <>
        <Button {...props} tone={tone} loading={props.loading || copying} ref={forwardedRef} onClick={() => { void copy(); }}>
          {copied ? labels.copied : labels.idle}
        </Button>
        {/* The state change is announced, not only painted. */}
        <span role="status" className="hjm-visually-hidden">{copied ? labels.copied : ""}</span>
      </>
    );
  },
);
