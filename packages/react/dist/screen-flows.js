import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScreenLayout } from "./screens.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid, VisuallyHidden } from "./layout.js";
import { SearchField } from "./forms.js";
import { Chip, RadioGroup } from "./selection.js";
import { AlertDialog, Menu, Sheet } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import {} from "@hjmds/design-contracts/components/upload-item";
import {} from "@hjmds/design-contracts/components/alert-dialog";
import { validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchEmptyCause, resolveSearchScreenPhase, resolveFocusAfterRemoval, screenPatternRecipe, searchScreenRecipe } from "@hjmds/design-contracts/screen-patterns";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./display.js";
import { Heading } from "./heading.js";
import { EmptyState, Skeleton } from "./feedback.js";
function Action({ action, secondary = false }) { return _jsx(Button, { tone: secondary ? "ghost" : "primary", disabled: !!(action.disabled || action.pending), loading: action.pending ?? false, onClick: action.onAction, children: action.label }); }
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }) {
    const open = !!detail;
    // Seed with the first render: a deep link that mounts with detail open is not a user transition,
    // so it must not pull focus from wherever the host left it (address bar, router focus target).
    const listHost = useRef(null), detailHost = useRef(null), returnFocus = useRef(null), wasOpen = useRef(open);
    // Hidden lists preserve scroll but drop browser focus; retain the trigger and move into the
    // detail once, then restore it (or the list body if the item was removed). See usage/ListDetailScreen.
    useLayoutEffect(() => {
        if (open && !wasOpen.current)
            detailHost.current?.querySelector("button")?.focus({ preventScroll: true });
        if (!open && wasOpen.current) {
            const target = returnFocus.current;
            if (target?.isConnected && !target.closest("[hidden]"))
                target.focus({ preventScroll: true });
            else
                listHost.current?.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
        }
        wasOpen.current = open;
    }, [open]);
    // layoutStyle places the outer host that owns both panes, not the inner list ScreenLayout.
    return _jsxs("div", { style: { height: "100%", ...layoutStyle }, children: [_jsx("div", { ref: listHost, hidden: open, style: { height: "100%" }, onFocusCapture: event => { returnFocus.current = event.target; }, children: _jsx(ScreenLayout, { ...screen, actions: refresh ? _jsx(Action, { action: refresh, secondary: true }) : screen.actions, footer: loadMore ? _jsx(Action, { action: loadMore, secondary: true }) : null, children: list }) }), detail ? _jsx("div", { ref: detailHost, style: { height: "100%" }, children: _jsx(ScreenLayout, { title: detail.title, leading: _jsx(Action, { action: back, secondary: true }), children: detail.content }) }) : null] });
}
export function EditorScreen({ children, dirty, submitPlacement = "footer", submit, cancel, discard, draftStatus, ...screen }) {
    const [confirm, setConfirm] = useState(false);
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, leading: _jsx(Action, { action: { ...cancel, disabled: !!(cancel.disabled || submit.pending), onAction: () => { if (dirty)
                            setConfirm(true);
                        else
                            cancel.onAction(); } }, secondary: true }), actions: submitPlacement === "header" ? _jsx(Action, { action: submit }) : screen.actions, footer: submitPlacement === "header" ? draftStatus : _jsxs(Stack, { gap: "sm", children: [draftStatus, _jsx(Action, { action: submit })] }), children: children }), _jsx(AlertDialog, { open: confirm, onOpenChange: setConfirm, request: { ...discard, mode: "confirm", onConfirm: () => cancel.onAction() } })] });
}
export function ProfileScreen({ summary, edit, children, accountActions, ...screen }) { return _jsx(ScreenLayout, { ...screen, children: _jsxs(Stack, { gap: "xl", children: [_jsxs(Stack, { gap: "md", children: [summary, _jsx(Action, { action: edit, secondary: true })] }), children, accountActions] }) }); }
export function ModerationScreen({ reasonPicker, reasons, reason, onReasonChange, reasonLabel, children, submit, block, ...screen }) { const [confirm, setConfirm] = useState(false); return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, footer: _jsxs(Stack, { gap: "sm", children: [_jsx(Action, { action: { ...submit, disabled: submit.disabled || !!screen.state && screen.state.kind !== "ready" || !reasons.some(item => item.value === reason) } }), block ? _jsx(Action, { action: { ...block.action, onAction: () => setConfirm(true) }, secondary: true }) : null] }), children: _jsxs(Stack, { gap: "lg", children: [reasonPicker ?? (reasons.length ? _jsx(RadioGroup, { accessibilityLabel: reasonLabel, orientation: "vertical", items: reasons, value: reason, onValueChange: value => { if (value)
                            onReasonChange(value); } }) : null), children] }) }), block ? _jsx(AlertDialog, { open: confirm, onOpenChange: setConfirm, request: block.confirmation }) : null] }); }
export function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled = false, cameraAvailable = true }) {
    // File-input click must stay in the user's activation stack. Deferring until the
    // sheet animation ends can cause browsers to reject camera/album selection.
    const select = (source) => { if (disabled)
        return; onOpenChange(false); onSelect(source); };
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: labels.title, closeLabel: labels.cancel, children: _jsxs(Stack, { gap: "sm", children: [_jsx(Button, { tone: "secondary", disabled: disabled, onClick: () => select("library"), children: labels.library }), cameraAvailable ? _jsx(Button, { tone: "secondary", disabled: disabled, onClick: () => select("camera"), children: labels.camera }) : null] }) });
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, ...screen }) { return _jsx(ScreenLayout, { ...screen, actions: _jsx(Action, { action: add, secondary: true }), footer: _jsxs(Stack, { gap: "sm", children: [selectionSummary, _jsx(Action, { action: done })] }), children: library ?? _jsx(Grid, { columns: { compact: 2, expanded: 3 }, gap: { compact: "md" }, children: items.map((item, index) => _jsxs(Stack, { gap: "xs", children: [item.preview, _jsx(UploadItem, { descriptor: item.descriptor, labels: labels, onRetry: onRetry, onCancel: onCancel }), _jsxs(Stack, { axis: "inline", gap: "xxs", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Button, { "aria-label": moveUpLabel(item), size: "small", tone: "ghost", disabled: index === 0, onClick: () => onMove(item.descriptor.id, -1), children: actionLabels.moveUp }), _jsx(Button, { "aria-label": moveDownLabel(item), size: "small", tone: "ghost", disabled: index === items.length - 1, onClick: () => onMove(item.descriptor.id, 1), children: actionLabels.moveDown }), _jsx(Button, { "aria-label": removeLabel(item), size: "small", tone: "ghost", onClick: () => onRemove(item.descriptor.id), children: actionLabels.remove })] })] }, item.descriptor.id)) }) }); }
function Highlighted({ text, match }) {
    if (!match || match.start < 0 || match.end <= match.start || match.end > text.length)
        return text;
    return _jsxs(_Fragment, { children: [text.slice(0, match.start), _jsx(Text, { as: "span", emphasis: "strong", children: text.slice(match.start, match.end) }), text.slice(match.end)] });
}
/** Focus targets after removing a chip or row; returns refs and a scheduler the screen calls from its handlers. */
function useSearchRemovalFocus(recentCount, appliedCount, input) {
    const pending = useRef(null);
    const recentHost = useRef(null);
    const appliedHost = useRef(null);
    const filterTrigger = useRef(null);
    // Wait for the product to actually shrink the list: an async onRemove would otherwise focus the
    // chip that is about to disappear.
    useLayoutEffect(() => {
        const removal = pending.current;
        if (!removal)
            return;
        const recent = removal.list === "recent" || removal.list === "clearRecent";
        const now = recent ? recentCount : appliedCount;
        if (now >= removal.from)
            return;
        pending.current = null;
        const host = recent ? recentHost.current : appliedHost.current;
        const selector = recent ? "[data-search-recent-remove]" : "[data-search-applied-filter]";
        const items = Array.from(host?.querySelectorAll(selector) ?? []);
        const index = removal.list.startsWith("clear") ? -1 : resolveFocusAfterRemoval(removal.index, items.length);
        const fallback = recent ? input() : filterTrigger.current ?? input();
        (index >= 0 ? items[index] : fallback)?.focus();
    }, [recentCount, appliedCount, input]);
    return { recentHost, appliedHost, filterTrigger, schedule: (removal) => { pending.current = removal; } };
}
function SearchAnnouncement({ text }) {
    // Only the text changes the live region, so the same count is not re-read on every render.
    return _jsx(VisuallyHidden, { role: "status", children: text });
}
function SearchIdleSections({ recent, suggested, legacy, onCommit, hostRef, onRemove, onClearAll }) {
    const visible = recent?.items.slice(0, Math.max(0, recent.maxVisible ?? searchScreenRecipe.recentVisible)) ?? [];
    // Without the structured sections the legacy `recentSearches` slot renders exactly as before 2026-10-06.
    if (!visible.length && !suggested?.items.length)
        return _jsx(_Fragment, { children: legacy });
    return _jsxs(Stack, { gap: "xl", children: [legacy, recent && visible.length ? _jsxs(Stack, { gap: "sm", ref: hostRef, children: [_jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", children: [_jsx(Heading, { level: "level5", semanticLevel: 2, children: recent.title }), _jsx(Button, { tone: "ghost", size: "small", onClick: onClearAll, children: recent.clearAllLabel })] }), _jsx(Stack, { gap: "xxs", children: visible.map((item, index) => _jsxs(Stack, { axis: "inline", align: "center", gap: "xxs", children: [_jsx(ListRow, { density: "compact", leading: recent.icon, title: item, onClick: () => onCommit(item), layoutStyle: { flex: 1, minWidth: 0 } }), _jsx(IconButton, { "data-search-recent-remove": "", label: recent.removeLabel(item), tone: "ghost", onClick: () => onRemove(item, index), children: recent.removeIcon ?? "×" })] }, item)) })] }) : null, suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null] });
}
function SearchSuggestedChips({ suggested, onCommit }) {
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Heading, { level: "level5", semanticLevel: 2, children: suggested.title }), _jsx(Stack, { axis: "inline", wrap: true, gap: "xs", children: suggested.items.map(item => _jsx(Chip, { label: item, onPress: () => onCommit(item) }, item)) })] });
}
function SearchSuggestionList({ query, suggestions, onCommit }) {
    const typed = query.trim();
    const items = suggestions.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible));
    return _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { density: "compact", leading: suggestions.icon, title: suggestions.commitLabel(typed), onClick: () => onCommit(typed) }), items.map(item => _jsx(ListRow, { density: "compact", leading: suggestions.icon, title: _jsx(Highlighted, { text: item.query, match: item.match }), onClick: () => onCommit(item.query) }, item.query))] });
}
function SearchResultsHeader({ summary, applied, cause, appliedHost, onRemove, onClearAll, onSortChange }) {
    const sort = summary?.sort;
    const showCount = summary && cause === "none";
    if (!summary?.notice && !showCount && !applied?.items.length)
        return null;
    return _jsxs(Stack, { gap: "sm", children: [summary?.notice, showCount ? _jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", wrap: true, children: [summary.count === null ? _jsx(Skeleton, { shape: "text", width: "30%" }) : _jsx(Text, { tone: "muted", children: summary.countLabel(summary.count) }), sort ? _jsx(Menu, { label: sort.label, align: "end", selectionMode: "single", value: sort.value, onValueChange: onSortChange, items: sort.options.map(option => ({ id: option.id, label: option.label })), trigger: _jsx(Button, { size: "small", tone: "ghost", ...(sort.icon === undefined ? {} : { trailing: sort.icon }), children: sort.triggerLabel }) }) : null] }) : null, applied?.items.length ? _jsxs(Stack, { ref: appliedHost, axis: "inline", wrap: true, gap: "xs", align: "center", children: [applied.items.map((item, index) => _jsx(Chip, { "data-search-applied-filter": "", label: item.label, "aria-label": applied.removeLabel(item.label), trailing: applied.removeIcon ?? _jsx("span", { "aria-hidden": "true", children: "\u00D7" }), onPress: () => onRemove(item.key, index) }, item.key)), _jsx(Button, { tone: "ghost", size: "small", onClick: onClearAll, children: applied.clearAllLabel })] }) : null] });
}
function SearchResultsBody({ summary, applied, suggested, cause, onCommit, onClearAll, children }) {
    // Loading keeps each row's own height (ListRow `loading`), so the list does not jump when results land.
    if (summary?.count === null)
        return _jsx(Stack, { gap: "xxs", children: Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) => _jsx(ListRow, { loading: true, title: "", description: "", ...(index === 0 ? { loadingLabel: summary.loadingLabel } : {}) }, index)) });
    if (cause === "none" || !summary?.empty)
        return _jsx(_Fragment, { children: children });
    return _jsxs(Stack, { gap: "lg", children: [_jsx(EmptyState, { density: "compact", title: summary.empty.title, ...(summary.empty.description === undefined ? {} : { description: summary.empty.description }), ...(cause === "filters" && applied ? { action: _jsx(Button, { tone: "secondary", onClick: onClearAll, children: applied.clearAllLabel }) } : {}) }), cause === "query" && suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null, children] });
}
function SearchFilterTrigger({ sheet, appliedCount, triggerRef }) {
    const trigger = sheet.trigger;
    return _jsx(Chip, { ref: triggerRef, label: trigger.label(appliedCount), "aria-label": trigger.accessibilityLabel(appliedCount), "aria-haspopup": "dialog", ...(trigger.icon === undefined ? {} : { leading: trigger.icon }), onPress: () => sheet.onOpenChange(true) });
}
/** Wide windows get a side sheet so results stay visible beside the conditions (expanded = 960+). */
function sidePlacement() {
    return typeof window !== "undefined" && ["expanded", "wide"].includes(resolveWindowClass(window.innerWidth));
}
function SearchFilterSheetView({ sheet }) {
    // The draft lives only while the sheet is open: seeded from `value` on open, dropped on every close,
    // so closing (×, scrim, back, Escape) never leaks half-edited conditions into the next opening.
    const [session, setSession] = useState(null);
    if (sheet.open && !session)
        setSession({ draft: sheet.value, side: sidePlacement() });
    if (!sheet.open && session)
        setSession(null);
    const draft = session ? session.draft : sheet.value;
    const setDraft = (next) => setSession(current => current ? { ...current, draft: next } : current);
    const count = sheet.count(draft);
    // Reset sits left of the primary action on Web (sheet.md [secondary][primary]) and is always present,
    // disabled at the default, so the primary action does not jump when the draft changes.
    const footer = _jsxs(Stack, { axis: "inline", justify: "end", gap: "sm", wrap: true, children: [_jsx(Button, { tone: "secondary", disabled: sheet.isDefault(draft), onClick: () => setDraft(sheet.reset(draft)), children: sheet.labels.reset }), _jsx(Button, { disabled: count === 0, onClick: () => { sheet.onApply(draft); sheet.onOpenChange(false); }, children: sheet.labels.apply(count) })] });
    return _jsx(Sheet, { open: sheet.open, onOpenChange: open => sheet.onOpenChange(open), title: sheet.title, closeLabel: sheet.labels.close, placement: session?.side ? "end" : "bottom", size: sheet.size ?? "large", footer: footer, children: sheet.renderContent(draft, setDraft) });
}
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen({ query, queryLabel, queryField, queryClearLabel, onQueryChange, onSearch, debounceMs = 300, filters, recentSearches, children, onSubmit, committedQuery, filtersOverflow = "wrap", hostGutter = "none", queryLabelVisibility = "visible", searching, searchingLabel, recentQueries, suggestedQueries, suggestions, resultSummary, appliedFilters, filterSheet, ...screen }) {
    // The host owns localized copy. A custom queryField owns its own clear affordance.
    if (queryField == null && !queryClearLabel?.trim())
        throw new TypeError("SearchScreen requires a localized queryClearLabel for its default search field");
    const callback = useRef(onSearch);
    callback.current = onSearch;
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => callback.current(query, { signal: controller.signal }), Math.max(0, debounceMs)); return () => { clearTimeout(timer); controller.abort(); }; }, [query, debounceMs]);
    const fieldHost = useRef(null), bodyHost = useRef(null);
    const input = useCallback(() => fieldHost.current?.querySelector("input"), []);
    const focus = useSearchRemovalFocus(recentQueries?.items.length ?? 0, appliedFilters?.items.length ?? 0, input);
    // Every commit path funnels through here so "only committed searches are recorded" holds at the API:
    // onSearch (debounced typing) never reaches onSubmit. Without onSubmit (one-step search) a pick only fills the field.
    const commit = (value) => { const next = resolveSearchCommit(value); if (next === null)
        return; if (next !== query)
        onQueryChange(next); onSubmit?.(next); };
    // A picked suggestion/recent/suggested query unmounts with its phase, which dropped focus to <body>; move it to the
    // results region first (1.13.1, utilverse adoption 2026-10-06, Native twin: Keyboard.dismiss on every commit).
    // Leaving the field also closes a mobile browser's keyboard. Enter keeps focus in the field instead: it is still on
    // screen with the committed text, and moving it would make keyboard users Shift+Tab back to refine. Rejected: blur()
    // without a target, which leaves focus on <body> and loses the reading position for screen readers.
    const pick = (value) => { if (resolveSearchCommit(value) !== null)
        bodyHost.current?.focus({ preventScroll: true }); commit(value); };
    // onSubmit separates "typing" from "committed" (recent-search writes, suggestion → results) without making
    // products rebuild the default field through queryField (2026-10-06 search redesign, usage/components/search-screen.md).
    // Enter while an IME is composing (Korean/Japanese) only confirms the syllable, so it must not commit.
    // The pending debounce is left alone: products decide whether submit should also flush a request.
    const submitProps = onSubmit ? { enterKeyHint: "search", onKeyDown: (event) => { if (event.key !== "Enter" || event.nativeEvent.isComposing || event.keyCode === 229)
            return; commit(event.currentTarget.value); } } : {};
    // Reference services hide the label behind a placeholder; the placeholder names the search target (Apple HIG
    // search fields) and aria-label keeps the accessible name, so hiding never leaves an unnamed field.
    const labelProps = queryLabelVisibility === "hidden" ? { "aria-label": queryLabel, placeholder: queryLabel } : { label: queryLabel };
    const phase = resolveSearchScreenPhase(query, committedQuery);
    const appliedCount = appliedFilters?.items.length ?? 0;
    const cause = phase === "results" && resultSummary ? resolveSearchEmptyCause(resultSummary.count, appliedCount) : "none";
    // Two-step search shows the rail only beside results (typing keeps the pinned area short), and a
    // query-caused zero hides it because no filter can fix that; a filter-caused zero keeps it to undo the filter.
    const showRail = (committedQuery === undefined || phase === "results") && cause !== "query";
    const trigger = filterSheet?.trigger ? _jsx(SearchFilterTrigger, { sheet: filterSheet, appliedCount: appliedCount, triggerRef: focus.filterTrigger }) : null;
    const rail = !showRail ? null : trigger && filters != null ? _jsxs(Stack, { axis: "inline", gap: "xs", wrap: filtersOverflow === "wrap", children: [trigger, filters] }) : trigger ?? filters;
    // Wrapping chips grow the pinned area line by line at large text; the scroll rail caps it at one row.
    // A product-owned CSS/ScrollView rail would re-derive bleed, scroll padding and RTL per app.
    // contentInset="none" leaves the gutter to the host, which CSS cannot see; hostGutter names it (Native twin).
    const bleed = (screen.contentInset === "none" ? 0 : screenPatternRecipe.padding) + containerRecipe.gutters[hostGutter];
    const filterSlot = rail != null && filtersOverflow === "scroll" ? _jsx("div", { className: "hjm-search-screen__filters", "data-overflow": "scroll", style: { "--hjm-search-filters-bleed": `${bleed}px` }, children: rail }) : rail;
    const visibleSuggestions = suggestions?.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible)).length ?? 0;
    const countAnnouncement = phase === "typing" && suggestions ? suggestions.countLabel(visibleSuggestions) : phase === "results" && resultSummary && resultSummary.count !== null ? resultSummary.countLabel(resultSummary.count) : "";
    // 2026-10-06 utilverse adoption: products swapped the whole field just to show progress. The Web spinner is
    // aria-hidden, so the localized searching label goes through the same status region as the counts.
    const announcement = searching && searchingLabel ? searchingLabel : countAnnouncement;
    const removeRecent = (item, index) => { focus.schedule({ list: "recent", index, from: recentQueries.items.length }); recentQueries.onRemove(item); };
    const clearRecent = () => { focus.schedule({ list: "clearRecent", index: -1, from: recentQueries.items.length }); recentQueries.onClearAll(); };
    const removeApplied = (key, index) => { focus.schedule({ list: "applied", index, from: appliedCount }); appliedFilters.onRemove(key); };
    const clearApplied = () => { focus.schedule({ list: "clearApplied", index: -1, from: appliedCount }); appliedFilters.onClearAll(); };
    // A new order starts at the top; the previous offset would land mid-list in unrelated results.
    const changeSort = (id) => { resultSummary?.sort?.onChange(id); bodyHost.current?.closest(".hjm-screen__body")?.scrollTo?.({ top: 0 }); };
    const idle = _jsx(SearchIdleSections, { recent: recentQueries, suggested: suggestedQueries, legacy: recentSearches, onCommit: pick, hostRef: focus.recentHost, onRemove: removeRecent, onClearAll: clearRecent });
    const body = phase === "idle" ? _jsxs(_Fragment, { children: [idle, committedQuery === undefined ? children : null] })
        : phase === "typing" ? (suggestions ? _jsx(SearchSuggestionList, { query: query, suggestions: suggestions, onCommit: pick }) : null)
            : _jsxs(_Fragment, { children: [_jsx(SearchResultsHeader, { summary: resultSummary, applied: appliedFilters, cause: cause, appliedHost: focus.appliedHost, onRemove: removeApplied, onClearAll: clearApplied, onSortChange: changeSort }), _jsx(SearchResultsBody, { summary: resultSummary, applied: appliedFilters, suggested: suggestedQueries, cause: cause, onCommit: pick, onClearAll: clearApplied, children: children })] });
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, notice: _jsxs(Stack, { gap: "sm", ref: fieldHost, children: [queryField ?? _jsx(SearchField, { ...labelProps, clearLabel: queryClearLabel, value: query, onValueChange: onQueryChange, loading: searching ?? false, ...submitProps }), filterSlot, screen.notice] }), children: _jsxs(Stack, { gap: "lg", ref: bodyHost, className: "hjm-search-screen__results", tabIndex: -1, children: [suggestions || resultSummary || searchingLabel ? _jsx(SearchAnnouncement, { text: announcement }) : null, body] }) }), filterSheet ? _jsx(SearchFilterSheetView, { sheet: filterSheet }) : null] });
}
export function PermissionScreen({ status, illustration, explanation, request, settings, continueAction, skip, ...screen }) { const kind = resolvePermissionAction(status); const primary = kind === "request" ? request : kind === "settings" ? settings : kind === "continue" ? continueAction : null; return _jsx(ScreenLayout, { ...screen, footer: _jsxs(Stack, { gap: "sm", children: [primary ? _jsx(Action, { action: primary }) : null, skip ? _jsx(Action, { action: skip, secondary: true }) : null] }), children: _jsxs(Stack, { gap: "xl", align: "center", children: [illustration, explanation] }) }); }
export function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, layoutStyle }) { const position = resolveOnboardingStep(steps.length, index); const step = steps[index]; return _jsx(ScreenLayout, { ...(layoutStyle === undefined ? {} : { layoutStyle }), title: step.title, description: step.description, actions: skip ? _jsx(Action, { action: skip, secondary: true }) : null, notice: _jsx(Text, { variant: "caption", tone: "muted", children: progressLabel(index + 1, steps.length) }), footer: _jsxs(Stack, { gap: "sm", children: [_jsx(Action, { action: position.last ? complete : { label: nextLabel, onAction: () => onIndexChange(index + 1) } }), !position.first ? _jsx(Action, { action: { label: backLabel, onAction: () => onIndexChange(index - 1) }, secondary: true }) : null] }), children: step.content }); }
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({ items, expandedIds, onExpandedChange, onLike, onReply, replyLabel, repliesLabel, composer, threadFooter, ...screen }) {
    validateCommentThread(items);
    // The supplied reference joins the author to the first body line and reserves the right edge
    // for reaction and its adjacent overflow action (Oct 7 user request). Keep
    // legacy rich bodies intact; bodyText opts into that compact flow.
    const row = (item) => _jsxs(Stack, { axis: "inline", align: "start", gap: "sm", children: [item.avatar, _jsxs(Stack, { gap: "xxs", layoutStyle: { flex: 1, minWidth: 0 }, children: [item.bodyText !== undefined ? _jsxs(Text, { children: [_jsx(Text, { emphasis: "strong", children: item.author }), " ", item.bodyText] }) : _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Text, { emphasis: "strong", children: item.author }), _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel })] }), item.body, _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [item.bodyText !== undefined && item.timeLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel }) : null, item.likeCountLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: item.likeCountLabel }) : null, (item.canReply ?? item.parentId === null) ? _jsx(Button, { size: "small", tone: "ghost", disabled: item.replyDisabled ?? false, onClick: () => onReply(item.id), children: replyLabel }) : null] })] }), _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexShrink: 0 }, children: [item.likeAction !== undefined ? item.likeAction : _jsx(IconButton, { label: item.likeLabel, tone: "ghost", onClick: () => onLike(item.id), children: item.likeIcon }), item.actions] })] }, item.id);
    return _jsx(ScreenLayout, { ...screen, footer: !screen.state || screen.state.kind === "ready" || screen.state.kind === "empty" ? composer : null, children: _jsxs(Stack, { gap: "lg", children: [items.filter(item => item.parentId === null).map(item => { const replies = items.filter(reply => reply.parentId === item.id); return _jsxs(Stack, { gap: "xs", children: [row(item), replies.length ? _jsxs(Stack, { gap: "md", layoutStyle: { marginInlineStart: screenPatternRecipe.sectionGap }, children: [_jsx(Button, { layoutStyle: { alignSelf: "flex-start" }, tone: "ghost", size: "small", "aria-expanded": expandedIds.includes(item.id), onClick: () => onExpandedChange(item.id), children: repliesLabel(replies.length, expandedIds.includes(item.id)) }), expandedIds.includes(item.id) ? replies.map(row) : null] }) : null] }, item.id); }), threadFooter] }) });
}
//# sourceMappingURL=screen-flows.js.map