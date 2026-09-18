import {
  removeTagAt,
  resolveTagsInputActiveSuggestion,
  resolveTagsInputCommit,
  tagsInputBehaviorDefaults,
  tagsInputRecipe,
  type TagsInputCommitKey,
  type TagsInputCommitResult,
  type TagsInputPolicy,
  type TagsInputSuggestion,
} from "@hjmds/design-contracts/components/tags-input";
import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";

export type TagsInputProps = Readonly<{
  label: string;
  tags?: readonly string[];
  defaultTags?: readonly string[];
  onTagsChange?: (tags: readonly string[]) => void;
  /** Fires when a value could not be committed, with the contract's reason. */
  onReject?: (result: TagsInputCommitResult) => void;
  /**
   * The text being typed. A product filtering `suggestions` cannot do it
   * without this — the draft lives here, not in the product's state.
   */
  onDraftChange?: (draft: string) => void;
  policy?: TagsInputPolicy;
  commitKeys?: readonly TagsInputCommitKey[];
  /** Composes one tag's remove-control name from the tag text. */
  composeRemoveLabel: (tag: string) => string;
  /**
   * Candidates for the current draft, already filtered by the product. Present
   * them and the field becomes the multi-select combobox case without a second
   * value shape.
   */
  suggestions?: readonly TagsInputSuggestion[];
  /** Localized accessible name for the candidate list. */
  suggestionsLabel?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}>;

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(
  {
    label,
    tags: controlledTags,
    defaultTags,
    onTagsChange,
    onReject,
    onDraftChange,
    policy,
    commitKeys = tagsInputRecipe.defaults.commitKeys,
    suggestions,
    suggestionsLabel,
    composeRemoveLabel,
    placeholder,
    description,
    disabled = false,
    className,
  },
  forwardedRef,
) {
  const [tags, setTags] = useControllableState<readonly string[]>({
    ...(controlledTags === undefined ? {} : { value: controlledTags }),
    defaultValue: defaultTags ?? [],
    ...(onTagsChange === undefined ? {} : { onChange: onTagsChange }),
  });
  const [draft, setDraft] = useState("");
  // Backspace on an empty field selects the last tag first; a second press
  // removes it. Removing on the first press loses work with no warning.
  const [armedIndex, setArmedIndex] = useState<number | null>(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const openSuggestions = (suggestions?.length ?? 0) > 0 && draft.trim().length > 0;
  const activeSuggestion = suggestions?.find((item) => item.id === activeSuggestionId) ?? null;
  const inputRef = useRef<HTMLInputElement>(null);
  const id = `hjm-tags-${label.replace(/\s+/gu, "-")}`;

  const changeDraft = (next: string) => {
    setDraft(next);
    onDraftChange?.(next);
  };
  const commit = (value: string) => {
    const result = resolveTagsInputCommit(tags, value, policy ?? {});
    if (!result.accepted) { onReject?.(result); return; }
    setTags([...tags, result.value]);
    setDraft("");
    onDraftChange?.("");
    setArmedIndex(null);
    setActiveSuggestionId(null);
  };
  const remove = (index: number) => {
    setTags(removeTagAt(tags, index));
    setArmedIndex(null);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    if (openSuggestions && (key === "ArrowDown" || key === "ArrowUp")) {
      event.preventDefault();
      setActiveSuggestionId(resolveTagsInputActiveSuggestion(
        suggestions ?? [],
        activeSuggestionId,
        key === "ArrowDown" ? "next" : "previous",
      ));
      return;
    }
    if (key === "Escape" && activeSuggestionId !== null) {
      // Dismissing the candidate list must not clear what the user typed.
      event.preventDefault();
      setActiveSuggestionId(null);
      return;
    }
    const isCommitKey =
      (key === "Enter" && commitKeys.includes("Enter")) ||
      (key === "," && commitKeys.includes("Comma")) ||
      (key === " " && commitKeys.includes("Space"));
    if (isCommitKey) {
      event.preventDefault();
      // A highlighted candidate wins over the raw text; otherwise the typed
      // value commits, which is what makes this different from a Select.
      commit(activeSuggestion ? activeSuggestion.value ?? activeSuggestion.label : draft);
      return;
    }
    if (key !== "Backspace" || draft.length > 0 || tags.length === 0) {
      if (key !== "Backspace") setArmedIndex(null);
      return;
    }
    event.preventDefault();
    const last = tags.length - 1;
    if (armedIndex === last || tagsInputBehaviorDefaults.backspaceRemovesLastTag) remove(last);
    else setArmedIndex(last);
  };

  return (
    <div className={classNames("hjm-tags-input", className)} data-disabled={disabled || undefined}>
      <label className="hjm-tags-input__label" htmlFor={id}>{label}</label>
      <div
        className="hjm-tags-input__frame"
        style={{
          "--hjm-tags-min-height": `${tagsInputRecipe.frame.minHeight}px`,
          "--hjm-tags-gap": `${tagsInputRecipe.frame.gap}px`,
          "--hjm-tags-tag-min-height": `${tagsInputRecipe.tag.minHeight}px`,
          "--hjm-tags-remove-target": `${tagsInputRecipe.remove.minTouchTarget}px`,
        } as CSSProperties}
        onClick={() => inputRef.current?.focus()}
      >
        <ul className="hjm-tags-input__list">
          {tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className="hjm-tags-input__tag" data-armed={armedIndex === index || undefined}>
              <span>{tag}</span>
              <button
                type="button"
                aria-label={composeRemoveLabel(tag)}
                className="hjm-tags-input__remove"
                disabled={disabled}
                onClick={() => remove(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={composeRefs(inputRef, forwardedRef)}
          id={id}
          type="text"
          className="hjm-tags-input__input"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={description ? `${id}-description` : undefined}
          role={suggestions ? "combobox" : undefined}
          aria-expanded={suggestions ? openSuggestions : undefined}
          aria-controls={suggestions && openSuggestions ? `${id}-suggestions` : undefined}
          aria-activedescendant={activeSuggestion ? `${id}-suggestion-${activeSuggestion.id}` : undefined}
          aria-autocomplete={suggestions ? "list" : undefined}
          onChange={(event) => { changeDraft(event.target.value); setArmedIndex(null); setActiveSuggestionId(null); }}
          onKeyDown={onKeyDown}
          onBlur={() => { if (commitKeys.includes("Blur")) commit(draft); setArmedIndex(null); }}
        />
      </div>
      {openSuggestions ? (
        <ul id={`${id}-suggestions`} role="listbox" aria-label={suggestionsLabel} className="hjm-tags-input__suggestions">
          {(suggestions ?? []).map((item) => (
            <li
              key={item.id}
              id={`${id}-suggestion-${item.id}`}
              role="option"
              aria-selected={item.id === activeSuggestionId}
              aria-disabled={item.disabled || undefined}
              className="hjm-tags-input__suggestion"
              onMouseDown={(event) => {
                // Commit before blur so the draft is still there to replace.
                event.preventDefault();
                if (!item.disabled) commit(item.value ?? item.label);
              }}
              onMouseEnter={() => { if (!item.disabled) setActiveSuggestionId(item.id); }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {description ? <p id={`${id}-description`} className="hjm-tags-input__description">{description}</p> : null}
    </div>
  );
});
