import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./actions.js";

export type ClipboardButtonProps = Omit<ButtonProps, "children" | "onClick"> &
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
    { value, labels, feedbackDuration = defaultFeedbackDuration, onCopy, onCopyError, ...props },
    forwardedRef,
  ) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => { if (timer.current !== undefined) clearTimeout(timer.current); }, []);
    useEffect(() => {
      // A new value makes the previous "copied" claim false: it referred to the
      // old string, and leaving it up tells the user something untrue.
      setCopied(false);
      if (timer.current !== undefined) clearTimeout(timer.current);
    }, [value]);

    const copy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopy?.(value);
        if (timer.current !== undefined) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), feedbackDuration);
      } catch (error) {
        // Clipboard access can be denied; swallowing that would leave the user
        // believing the value was copied.
        onCopyError?.(error);
      }
    }, [value, feedbackDuration, onCopy, onCopyError]);

    return (
      <>
        <Button {...props} ref={forwardedRef} onClick={() => { void copy(); }}>
          {copied ? labels.copied : labels.idle}
        </Button>
        {/* The state change is announced, not only painted. */}
        <span role="status" className="hjm-visually-hidden">{copied ? labels.copied : ""}</span>
      </>
    );
  },
);
