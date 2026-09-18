import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { removeTagAt, resolveTagsInputActiveSuggestion, resolveTagsInputCommit, tagsInputBehaviorDefaults, tagsInputRecipe, } from "@hjmds/design-contracts/components/tags-input";
import { forwardRef, useRef, useState, } from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
export const TagsInput = forwardRef(function TagsInput({ label, tags: controlledTags, defaultTags, onTagsChange, onReject, onDraftChange, policy, commitKeys = tagsInputRecipe.defaults.commitKeys, suggestions, suggestionsLabel, composeRemoveLabel, placeholder, description, disabled = false, className, }, forwardedRef) {
    const [tags, setTags] = useControllableState({
        ...(controlledTags === undefined ? {} : { value: controlledTags }),
        defaultValue: defaultTags ?? [],
        ...(onTagsChange === undefined ? {} : { onChange: onTagsChange }),
    });
    const [draft, setDraft] = useState("");
    // Backspace on an empty field selects the last tag first; a second press
    // removes it. Removing on the first press loses work with no warning.
    const [armedIndex, setArmedIndex] = useState(null);
    const [activeSuggestionId, setActiveSuggestionId] = useState(null);
    const openSuggestions = (suggestions?.length ?? 0) > 0 && draft.trim().length > 0;
    const activeSuggestion = suggestions?.find((item) => item.id === activeSuggestionId) ?? null;
    const inputRef = useRef(null);
    const id = `hjm-tags-${label.replace(/\s+/gu, "-")}`;
    const changeDraft = (next) => {
        setDraft(next);
        onDraftChange?.(next);
    };
    const commit = (value) => {
        const result = resolveTagsInputCommit(tags, value, policy ?? {});
        if (!result.accepted) {
            onReject?.(result);
            return;
        }
        setTags([...tags, result.value]);
        setDraft("");
        onDraftChange?.("");
        setArmedIndex(null);
        setActiveSuggestionId(null);
    };
    const remove = (index) => {
        setTags(removeTagAt(tags, index));
        setArmedIndex(null);
        inputRef.current?.focus();
    };
    const onKeyDown = (event) => {
        const key = event.key;
        if (openSuggestions && (key === "ArrowDown" || key === "ArrowUp")) {
            event.preventDefault();
            setActiveSuggestionId(resolveTagsInputActiveSuggestion(suggestions ?? [], activeSuggestionId, key === "ArrowDown" ? "next" : "previous"));
            return;
        }
        if (key === "Escape" && activeSuggestionId !== null) {
            // Dismissing the candidate list must not clear what the user typed.
            event.preventDefault();
            setActiveSuggestionId(null);
            return;
        }
        const isCommitKey = (key === "Enter" && commitKeys.includes("Enter")) ||
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
            if (key !== "Backspace")
                setArmedIndex(null);
            return;
        }
        event.preventDefault();
        const last = tags.length - 1;
        if (armedIndex === last || tagsInputBehaviorDefaults.backspaceRemovesLastTag)
            remove(last);
        else
            setArmedIndex(last);
    };
    return (_jsxs("div", { className: classNames("hjm-tags-input", className), "data-disabled": disabled || undefined, children: [_jsx("label", { className: "hjm-tags-input__label", htmlFor: id, children: label }), _jsxs("div", { className: "hjm-tags-input__frame", style: {
                    "--hjm-tags-min-height": `${tagsInputRecipe.frame.minHeight}px`,
                    "--hjm-tags-gap": `${tagsInputRecipe.frame.gap}px`,
                    "--hjm-tags-tag-min-height": `${tagsInputRecipe.tag.minHeight}px`,
                    "--hjm-tags-remove-target": `${tagsInputRecipe.remove.minTouchTarget}px`,
                }, onClick: () => inputRef.current?.focus(), children: [_jsx("ul", { className: "hjm-tags-input__list", children: tags.map((tag, index) => (_jsxs("li", { className: "hjm-tags-input__tag", "data-armed": armedIndex === index || undefined, children: [_jsx("span", { children: tag }), _jsx("button", { type: "button", "aria-label": composeRemoveLabel(tag), className: "hjm-tags-input__remove", disabled: disabled, onClick: () => remove(index), children: "\u00D7" })] }, `${tag}-${index}`))) }), _jsx("input", { ref: composeRefs(inputRef, forwardedRef), id: id, type: "text", className: "hjm-tags-input__input", value: draft, placeholder: placeholder, disabled: disabled, "aria-describedby": description ? `${id}-description` : undefined, role: suggestions ? "combobox" : undefined, "aria-expanded": suggestions ? openSuggestions : undefined, "aria-controls": suggestions && openSuggestions ? `${id}-suggestions` : undefined, "aria-activedescendant": activeSuggestion ? `${id}-suggestion-${activeSuggestion.id}` : undefined, "aria-autocomplete": suggestions ? "list" : undefined, onChange: (event) => { changeDraft(event.target.value); setArmedIndex(null); setActiveSuggestionId(null); }, onKeyDown: onKeyDown, onBlur: () => { if (commitKeys.includes("Blur"))
                            commit(draft); setArmedIndex(null); } })] }), openSuggestions ? (_jsx("ul", { id: `${id}-suggestions`, role: "listbox", "aria-label": suggestionsLabel, className: "hjm-tags-input__suggestions", children: (suggestions ?? []).map((item) => (_jsx("li", { id: `${id}-suggestion-${item.id}`, role: "option", "aria-selected": item.id === activeSuggestionId, "aria-disabled": item.disabled || undefined, className: "hjm-tags-input__suggestion", onMouseDown: (event) => {
                        // Commit before blur so the draft is still there to replace.
                        event.preventDefault();
                        if (!item.disabled)
                            commit(item.value ?? item.label);
                    }, onMouseEnter: () => { if (!item.disabled)
                        setActiveSuggestionId(item.id); }, children: item.label }, item.id))) })) : null, description ? _jsx("p", { id: `${id}-description`, className: "hjm-tags-input__description", children: description }) : null] }));
});
//# sourceMappingURL=tags-input.js.map