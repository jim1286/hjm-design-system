import {
  findActiveMentionTrigger,
  resolveMentionInsertion,
  type MentionMatch,
  type MentionTriggerConfig,
} from "@hjmds/design-contracts/components/mentions";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TextArea, type TextAreaProps } from "./forms.js";
import { classNames, composeRefs } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";

export type MentionCandidate = Readonly<{
  id: string;
  label: string;
  /** Text inserted after the trigger character; defaults to `label`. */
  insertText?: string;
  description?: string;
}>;

export type MentionsProps<TriggerId extends string = string> =
  Omit<TextAreaProps, "value" | "defaultValue" | "onChange" | "children"> &
  Readonly<{
    value: string;
    onValueChange: (value: string) => void;
    triggers: readonly MentionTriggerConfig<TriggerId>[];
    /** Candidates for the active query; the product owns filtering and loading. */
    candidates: readonly MentionCandidate[];
    /** Fires whenever the active trigger match changes, including to null. */
    onMentionQueryChange?: (match: MentionMatch<TriggerId> | null) => void;
    /** Localized message shown when the popup is open with no candidates. */
    emptyMessage: string;
    /** Localized accessible name for the candidate list. */
    listLabel: string;
    renderCandidate?: (candidate: MentionCandidate) => ReactNode;
  }>;

export const Mentions = forwardRef(function Mentions<TriggerId extends string = string>(
  {
    value,
    onValueChange,
    triggers,
    candidates,
    onMentionQueryChange,
    emptyMessage,
    listLabel,
    renderCandidate,
    className,
    ...textAreaProps
  }: MentionsProps<TriggerId>,
  forwardedRef: React.Ref<HTMLTextAreaElement>,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [match, setMatch] = useState<MentionMatch<TriggerId> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const id = `${useId().replaceAll(":", "")}-mentions`;
  const open = match !== null;
  const activeCandidate = candidates[Math.min(activeIndex, Math.max(candidates.length - 1, 0))];

  const notifyRef = useRef(onMentionQueryChange);
  notifyRef.current = onMentionQueryChange;
  useEffect(() => { notifyRef.current?.(match); }, [match]);

  const syncMatch = (text: string, cursor: number) => {
    // The contract owns trigger detection, including "a space closes it" and
    // "the nearer trigger wins"; this component only reports the cursor.
    const next = findActiveMentionTrigger(text, cursor, triggers);
    setMatch((previous) => (previous?.triggerStart === next?.triggerStart && previous?.query === next?.query ? previous : next));
    if (next === null || next.query !== match?.query) setActiveIndex(0);
  };
  const commit = (candidate: MentionCandidate) => {
    const input = inputRef.current;
    if (!match || !input) return;
    const result = resolveMentionInsertion(value, match, input.selectionStart ?? value.length, candidate.insertText ?? candidate.label);
    onValueChange(result.text);
    setMatch(null);
    queueMicrotask(() => {
      input.focus();
      input.setSelectionRange(result.cursorPosition, result.cursorPosition);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (candidates.length === 0) return;
      event.preventDefault();
      setActiveIndex((previous) => {
        const next = event.key === "ArrowDown" ? previous + 1 : previous - 1;
        return (next + candidates.length) % candidates.length;
      });
      return;
    }
    if (event.key === "Escape") {
      // Dismissing the popup must not touch the text the user already typed.
      event.preventDefault();
      event.stopPropagation();
      setMatch(null);
      return;
    }
    if (event.key === "Enter" && activeCandidate && candidates.length > 0) {
      event.preventDefault();
      commit(activeCandidate);
    }
  };

  const position = useAnchoredPopup(inputRef, open ? list : null, {
    placement: "bottom", align: "start", matchAnchorWidth: true, zIndex: 900,
  });

  return (
    <div className={classNames("hjm-mentions", className)}>
      <TextArea
        {...textAreaProps}
        ref={composeRefs(inputRef, forwardedRef)}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open && activeCandidate ? `${id}-${activeCandidate.id}` : undefined}
        onChange={(event) => {
          onValueChange(event.target.value);
          syncMatch(event.target.value, event.target.selectionStart ?? event.target.value.length);
        }}
        onKeyUp={(event) => {
          // Caret moves without an edit (arrows, clicks) change which trigger is
          // active, so the match is re-read from the caret, not only from input.
          if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) return;
          const input = event.currentTarget;
          syncMatch(input.value, input.selectionStart ?? input.value.length);
        }}
        onClick={(event) => {
          const input = event.currentTarget;
          syncMatch(input.value, input.selectionStart ?? input.value.length);
        }}
        onBlur={(event) => { textAreaProps.onBlur?.(event); setMatch(null); }}
        onKeyDown={(event) => { textAreaProps.onKeyDown?.(event); onKeyDown(event); }}
      />
      {open ? (
        <AnchoredPortal anchorRef={inputRef}>
          <div
            ref={setList}
            id={id}
            role="listbox"
            aria-label={listLabel}
            className="hjm-mentions__list"
            style={position.style as CSSProperties}
          >
            {candidates.length === 0 ? (
              <p className="hjm-mentions__empty" role="status">{emptyMessage}</p>
            ) : candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                id={`${id}-${candidate.id}`}
                role="option"
                aria-selected={candidate.id === activeCandidate?.id}
                className="hjm-mentions__option"
                // Pointer commit must not blur the textarea first, or the caret
                // position the insertion depends on would already be gone.
                onMouseDown={(event) => { event.preventDefault(); commit(candidate); }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {renderCandidate?.(candidate) ?? (
                  <>
                    <span>{candidate.label}</span>
                    {candidate.description ? <span className="hjm-mentions__description">{candidate.description}</span> : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </AnchoredPortal>
      ) : null}
    </div>
  );
}) as <TriggerId extends string = string>(
  props: MentionsProps<TriggerId> & { ref?: React.Ref<HTMLTextAreaElement> },
) => React.ReactElement | null;
