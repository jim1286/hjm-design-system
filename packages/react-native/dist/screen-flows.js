import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { ScreenLayout } from "./screens.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid } from "./primitives.js";
import { SearchField } from "./inputs.js";
import { Chip, RadioGroup } from "./inputs.js";
import { AlertDialog, Sheet } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import {} from "@hjmds/design-contracts/components/upload-item";
import {} from "@hjmds/design-contracts/components/alert-dialog";
import { validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchEmptyCause, resolveSearchScreenPhase, screenPatternRecipe, searchScreenRecipe } from "@hjmds/design-contracts/screen-patterns";
import { AccessibilityInfo, Keyboard, ScrollView, View } from "react-native";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./data-display.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { Heading } from "./heading.js";
import { Menu } from "./navigation.js";
import { EmptyState, Skeleton } from "./feedback.js";
function Pane({ hidden = false, children }) { return _jsx(View, { style: { flex: 1, display: hidden ? "none" : "flex" }, children: children }); }
function Action({ action, secondary = false }) { return _jsx(Button, { tone: secondary ? "ghost" : "primary", disabled: !!(action.disabled || action.pending), loading: action.pending ?? false, onPress: action.onAction, children: action.label }); }
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
// layoutStyle places the outer host that owns both panes, as on Web, so the screen keeps the same
// placement while list and detail swap. Passing it to the list ScreenLayout dropped it on detail.
export function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }) { return _jsxs(View, { style: [{ flex: 1 }, layoutStyle], children: [_jsx(Pane, { hidden: !!detail, children: _jsx(ScreenLayout, { ...screen, actions: refresh ? _jsx(Action, { action: refresh, secondary: true }) : screen.actions, footer: loadMore ? _jsx(Action, { action: loadMore, secondary: true }) : null, children: list }) }), detail ? _jsx(Pane, { children: _jsx(ScreenLayout, { title: detail.title, leading: _jsx(Action, { action: back, secondary: true }), children: detail.content }) }) : null] }); }
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
    const queued = useRef(null);
    useEffect(() => () => { queued.current = null; }, []);
    // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
    // dismissal completion (including Android fallback), so a timer is not a safe substitute.
    const select = (source) => { if (disabled || queued.current)
        return; queued.current = source; onOpenChange(false); };
    const complete = () => { const source = queued.current; queued.current = null; if (source && !disabled)
        onSelect(source); };
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: labels.title, closeLabel: labels.cancel, onDismissComplete: complete, children: _jsxs(Stack, { gap: "sm", children: [_jsx(Button, { tone: "secondary", disabled: disabled, onPress: () => select("library"), children: labels.library }), cameraAvailable ? _jsx(Button, { tone: "secondary", disabled: disabled, onPress: () => select("camera"), children: labels.camera }) : null] }) });
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, ...screen }) { return _jsx(ScreenLayout, { ...screen, actions: _jsx(Action, { action: add, secondary: true }), footer: _jsxs(Stack, { gap: "sm", children: [selectionSummary, _jsx(Action, { action: done })] }), children: library ?? _jsx(Grid, { columns: { compact: 2, expanded: 3 }, gap: { compact: "md" }, children: items.map((item, index) => _jsxs(Stack, { gap: "xs", children: [item.preview, _jsx(UploadItem, { descriptor: item.descriptor, labels: labels, onRetry: onRetry, onCancel: onCancel }), _jsxs(Stack, { axis: "inline", gap: "xxs", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Button, { accessibilityLabel: moveUpLabel(item), size: "small", tone: "ghost", disabled: index === 0, onPress: () => onMove(item.descriptor.id, -1), children: actionLabels.moveUp }), _jsx(Button, { accessibilityLabel: moveDownLabel(item), size: "small", tone: "ghost", disabled: index === items.length - 1, onPress: () => onMove(item.descriptor.id, 1), children: actionLabels.moveDown }), _jsx(Button, { accessibilityLabel: removeLabel(item), size: "small", tone: "ghost", onPress: () => onRemove(item.descriptor.id), children: actionLabels.remove })] })] }, item.descriptor.id)) }) }); }
/** Announce only when the text changes; iOS queues it behind the current utterance instead of cutting it off. */
function useSearchAnnouncement(text) {
    useEffect(() => {
        if (!text)
            return;
        if (AccessibilityInfo.announceForAccessibilityWithOptions)
            AccessibilityInfo.announceForAccessibilityWithOptions(text, { queue: true });
        else
            AccessibilityInfo.announceForAccessibility(text);
    }, [text]);
}
function SearchIdleSections({ recent, suggested, legacy, onCommit }) {
    const visible = recent?.items.slice(0, Math.max(0, recent.maxVisible ?? searchScreenRecipe.recentVisible)) ?? [];
    // Without the structured sections the legacy `recentSearches` slot renders exactly as before 2026-10-06.
    if (!visible.length && !suggested?.items.length)
        return _jsx(_Fragment, { children: legacy });
    return _jsxs(Stack, { gap: "xl", children: [legacy, recent && visible.length ? _jsxs(Stack, { gap: "sm", children: [_jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", children: [_jsx(Heading, { level: "level5", children: recent.title }), _jsx(Button, { tone: "ghost", size: "small", onPress: recent.onClearAll, children: recent.clearAllLabel })] }), _jsx(Stack, { gap: "xxs", children: visible.map(item => _jsx(ListRow, { density: "compact", leading: recent.icon, title: item, onPress: () => onCommit(item), trailingAction: _jsx(IconButton, { label: recent.removeLabel(item), tone: "ghost", onPress: () => recent.onRemove(item), children: recent.removeIcon ?? _jsx(FixedGlyph, { tone: "muted", children: "\u00D7" }) }) }, item)) })] }) : null, suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null] });
}
function SearchSuggestedChips({ suggested, onCommit }) {
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Heading, { level: "level5", children: suggested.title }), _jsx(Stack, { axis: "inline", wrap: true, gap: "xs", children: suggested.items.map(item => _jsx(Chip, { label: item, onPress: () => onCommit(item) }, item)) })] });
}
function SearchSuggestionList({ query, suggestions, onCommit }) {
    const typed = query.trim();
    const items = suggestions.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible));
    return _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { density: "compact", leading: suggestions.icon, title: suggestions.commitLabel(typed), onPress: () => onCommit(typed) }), items.map(item => _jsx(ListRow, { density: "compact", leading: suggestions.icon, title: item.query, onPress: () => onCommit(item.query) }, item.query))] });
}
function SearchResultsHeader({ summary, applied, cause, onSortChange }) {
    const sort = summary?.sort;
    const showCount = summary && cause === "none";
    if (!summary?.notice && !showCount && !applied?.items.length)
        return null;
    return _jsxs(Stack, { gap: "sm", children: [summary?.notice, showCount ? _jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", wrap: true, children: [summary.count === null ? _jsx(Skeleton, { shape: "text", width: "30%", accessibilityLabel: summary.loadingLabel }) : _jsx(Text, { tone: "muted", children: summary.countLabel(summary.count) }), sort ? _jsx(Menu, { triggerLabel: sort.triggerLabel, title: sort.label, dismissLabel: sort.dismissLabel, items: sort.options.map(option => ({ id: option.id, label: option.label })), selection: { mode: "single", selectedKey: sort.value, onSelectionChange: next => { if (next)
                                onSortChange(next); } }, renderTrigger: trigger => _jsx(Button, { size: "small", tone: "ghost", accessibilityState: trigger.accessibilityState, onPress: trigger.onPress, ...(sort.icon === undefined ? {} : { trailing: sort.icon }), children: sort.triggerLabel }) }) : null] }) : null, applied?.items.length ? _jsxs(Stack, { axis: "inline", wrap: true, gap: "xs", align: "center", children: [applied.items.map(item => _jsx(Chip, { label: item.label, accessibilityLabel: applied.removeLabel(item.label), trailing: applied.removeIcon ?? _jsx(FixedGlyph, { tone: "muted", children: "\u00D7" }), onPress: () => applied.onRemove(item.key) }, item.key)), _jsx(Button, { tone: "ghost", size: "small", onPress: applied.onClearAll, children: applied.clearAllLabel })] }) : null] });
}
function SearchResultsBody({ summary, applied, suggested, cause, onCommit, children }) {
    // Two text lines per row approximate ListRow's two-line height so results do not jump when they land.
    if (summary?.count === null)
        return _jsx(Stack, { gap: "md", children: Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) => _jsxs(Stack, { gap: "xs", children: [_jsx(Skeleton, { shape: "text", width: "70%" }), _jsx(Skeleton, { shape: "text", width: "40%" })] }, index)) });
    if (cause === "none" || !summary?.empty)
        return _jsx(_Fragment, { children: children });
    return _jsxs(Stack, { gap: "lg", children: [_jsx(EmptyState, { density: "compact", announcement: "polite", title: summary.empty.title, ...(summary.empty.description === undefined ? {} : { description: summary.empty.description }), ...(cause === "filters" && applied ? { action: _jsx(Button, { tone: "secondary", onPress: applied.onClearAll, children: applied.clearAllLabel }) } : {}) }), cause === "query" && suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null, children] });
}
function SearchFilterTrigger({ sheet, appliedCount }) {
    const trigger = sheet.trigger;
    return _jsx(Chip, { label: trigger.label(appliedCount), accessibilityLabel: trigger.accessibilityLabel(appliedCount), ...(trigger.icon === undefined ? {} : { leading: trigger.icon }), onPress: () => sheet.onOpenChange(true) });
}
function SearchFilterSheetView({ sheet }) {
    // The draft lives only while the sheet is open: seeded from `value` on open, dropped on every close.
    const [session, setSession] = useState(null);
    if (sheet.open && !session)
        setSession({ draft: sheet.value });
    if (!sheet.open && session)
        setSession(null);
    const draft = session ? session.draft : sheet.value;
    const setDraft = (next) => setSession(current => current ? { draft: next } : current);
    const count = sheet.count(draft);
    // Native sheet footers stack full-width buttons with the primary action first (sheet.md).
    const footer = _jsxs(Stack, { gap: "sm", children: [_jsx(Button, { fullWidth: true, disabled: count === 0, onPress: () => { sheet.onApply(draft); sheet.onOpenChange(false); }, children: sheet.labels.apply(count) }), _jsx(Button, { fullWidth: true, tone: "secondary", disabled: sheet.isDefault(draft), onPress: () => setDraft(sheet.reset(draft)), children: sheet.labels.reset })] });
    return _jsx(Sheet, { open: sheet.open, onOpenChange: open => sheet.onOpenChange(open), title: sheet.title, closeLabel: sheet.labels.close, size: sheet.size ?? "large", scrollable: true, footer: footer, children: sheet.renderContent(draft, setDraft) });
}
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen({ query, queryLabel, queryField, queryClearLabel, onQueryChange, onSearch, debounceMs = 300, filters, recentSearches, children, onSubmit, committedQuery, filtersOverflow = "wrap", hostGutter = "none", queryLabelVisibility = "visible", searching, searchingLabel, recentQueries, suggestedQueries, suggestions, resultSummary, appliedFilters, filterSheet, ...screen }) {
    // The host owns localized copy. A custom queryField owns its own clear affordance.
    if (queryField == null && !queryClearLabel?.trim())
        throw new TypeError("SearchScreen requires a localized queryClearLabel for its default search field");
    const callback = useRef(onSearch);
    callback.current = onSearch;
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => callback.current(query, { signal: controller.signal }), Math.max(0, debounceMs)); return () => { clearTimeout(timer); controller.abort(); }; }, [query, debounceMs]);
    // Every commit path funnels through here so "only committed searches are recorded" holds at the API:
    // onSearch (debounced typing) never reaches onSubmit. Without onSubmit (one-step search) a pick only fills the field.
    // Every commit closes the keyboard so results get the screen. The search key already blurs the field; a picked
    // suggestion/recent/suggested query did not, and utilverse called Keyboard.dismiss() in onSubmit (1.13.0 adoption,
    // 2026-10-06). Done here, not in onSubmit, so one-step search (no onSubmit) behaves the same.
    const commit = (value) => { const next = resolveSearchCommit(value); if (next === null)
        return; Keyboard.dismiss(); if (next !== query)
        onQueryChange(next); onSubmit?.(next); };
    // onSubmit separates "typing" from "committed" without making products rebuild the default field through
    // queryField (2026-10-06 search redesign, usage/components/search-screen.md). The single-line TextInput keeps
    // its default blur-on-submit, so the keyboard closes and results get the screen. The debounce is left alone.
    const submitProps = onSubmit ? { returnKeyType: "search", onSubmitEditing: (event) => commit(event.nativeEvent.text) } : {};
    // Hidden label: the placeholder names the search target and accessibilityLabel keeps the field named.
    const labelProps = queryLabelVisibility === "hidden" ? { accessibilityLabel: queryLabel, placeholder: queryLabel } : { label: queryLabel };
    const phase = resolveSearchScreenPhase(query, committedQuery);
    const appliedCount = appliedFilters?.items.length ?? 0;
    const cause = phase === "results" && resultSummary ? resolveSearchEmptyCause(resultSummary.count, appliedCount) : "none";
    // Two-step search shows the rail only beside results, and a query-caused zero hides it (no filter can fix it).
    const showRail = (committedQuery === undefined || phase === "results") && cause !== "query";
    const trigger = filterSheet?.trigger ? _jsx(SearchFilterTrigger, { sheet: filterSheet, appliedCount: appliedCount }) : null;
    const rail = !showRail ? null : trigger && filters != null ? _jsxs(Stack, { axis: "inline", gap: "xs", wrap: filtersOverflow === "wrap", children: [trigger, filters] }) : trigger ?? filters;
    // Wrapping chips grow the pinned area line by line at large text; the scroll rail caps it at one row.
    // It bleeds over ScreenLayout's notice padding so chips scroll to the screen edge instead of clipping mid-chip.
    // With contentInset="none" the host owns the gutter, which SearchScreen cannot measure; `hostGutter` names it so the
    // rail still reaches the host edge (utilverse 1.13.0 adoption, 2026-10-06: the rail stopped at the Container/Sheet
    // padding). A token name, not a number, keeps product code off raw spacing. Rejected: measuring the window offset
    // (layout jump on the first frame, and wrong inside a centered max-width host).
    const inset = (screen.contentInset === "none" ? 0 : screenPatternRecipe.padding) + containerRecipe.gutters[hostGutter];
    const filterSlot = rail != null && filtersOverflow === "scroll" ? _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", style: { marginHorizontal: -inset, flexGrow: 0 }, contentContainerStyle: { paddingHorizontal: inset }, children: rail }) : rail;
    const visibleSuggestions = suggestions?.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible)).length ?? 0;
    const countAnnouncement = phase === "typing" && suggestions ? suggestions.countLabel(visibleSuggestions) : phase === "results" && resultSummary && resultSummary.count !== null ? resultSummary.countLabel(resultSummary.count) : "";
    // Same text as the Web status region: the busy indicator's label is only read when focused, so progress is announced too.
    useSearchAnnouncement(searching && searchingLabel ? searchingLabel : countAnnouncement);
    const scrollView = useRef(null);
    const scrollRef = (node) => { scrollView.current = node; const own = screen.scrollRef; if (typeof own === "function")
        own(node);
    else if (own)
        own.current = node; };
    // A new order starts at the top; the previous offset would land mid-list in unrelated results.
    const changeSort = (id) => { resultSummary?.sort?.onChange(id); scrollView.current?.scrollTo?.({ y: 0, animated: false }); };
    const idle = _jsx(SearchIdleSections, { recent: recentQueries, suggested: suggestedQueries, legacy: recentSearches, onCommit: commit });
    const body = phase === "idle" ? _jsxs(_Fragment, { children: [idle, committedQuery === undefined ? children : null] })
        : phase === "typing" ? (suggestions ? _jsx(SearchSuggestionList, { query: query, suggestions: suggestions, onCommit: commit }) : null)
            : _jsxs(_Fragment, { children: [_jsx(SearchResultsHeader, { summary: resultSummary, applied: appliedFilters, cause: cause, onSortChange: changeSort }), _jsx(SearchResultsBody, { summary: resultSummary, applied: appliedFilters, suggested: suggestedQueries, cause: cause, onCommit: commit, children: children })] });
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, scrollRef: scrollRef, notice: _jsxs(Stack, { gap: "sm", children: [queryField ?? _jsx(SearchField, { ...labelProps, clearLabel: queryClearLabel, value: query, onValueChange: onQueryChange, busy: searching ?? false, busyLabel: searchingLabel ?? queryLabel, ...submitProps }), filterSlot, screen.notice] }), children: _jsx(Stack, { gap: "lg", children: body }) }), filterSheet ? _jsx(SearchFilterSheetView, { sheet: filterSheet }) : null] });
}
export function PermissionScreen({ status, illustration, explanation, request, settings, continueAction, skip, ...screen }) { const kind = resolvePermissionAction(status); const primary = kind === "request" ? request : kind === "settings" ? settings : kind === "continue" ? continueAction : null; return _jsx(ScreenLayout, { ...screen, footer: _jsxs(Stack, { gap: "sm", children: [primary ? _jsx(Action, { action: primary }) : null, skip ? _jsx(Action, { action: skip, secondary: true }) : null] }), children: _jsxs(Stack, { gap: "xl", align: "center", children: [illustration, explanation] }) }); }
// Large headings and a software keyboard can consume the entire fixed header
// area. Keep step guidance in the existing scroll body, with completion actions fixed.
export function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, layoutStyle }) { const position = resolveOnboardingStep(steps.length, index); const step = steps[index]; return _jsx(ScreenLayout, { ...(layoutStyle === undefined ? {} : { layoutStyle }), title: step.title, header: _jsx(_Fragment, {}), footer: _jsxs(Stack, { gap: "sm", children: [_jsx(Action, { action: position.last ? complete : { label: nextLabel, onAction: () => onIndexChange(index + 1) } }), !position.first ? _jsx(Action, { action: { label: backLabel, onAction: () => onIndexChange(index - 1) }, secondary: true }) : null] }), children: _jsxs(Stack, { gap: "md", children: [_jsx(Text, { variant: "titleLarge", accessibilityRole: "header", children: step.title }), _jsx(Text, { tone: "muted", children: step.description }), _jsx(Text, { variant: "caption", tone: "muted", children: progressLabel(index + 1, steps.length) }), skip ? _jsx(Action, { action: skip, secondary: true }) : null, step.content] }) }); }
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({ items, expandedIds, onExpandedChange, onLike, onReply, replyLabel, repliesLabel, composer, threadFooter, ...screen }) {
    validateCommentThread(items);
    // The supplied reference joins the author to the first body line and reserves the right edge
    // for reaction and its adjacent overflow action (Oct 7 user request). Keep
    // legacy rich bodies intact; bodyText opts into that compact flow.
    const row = (item) => _jsxs(Stack, { axis: "inline", align: "start", gap: "sm", children: [item.avatar, _jsxs(Stack, { gap: "xxs", layoutStyle: { flex: 1, minWidth: 0 }, children: [item.bodyText !== undefined ? _jsxs(Text, { children: [_jsx(Text, { emphasis: "strong", children: item.author }), " ", item.bodyText] }) : _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Text, { emphasis: "strong", children: item.author }), _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel })] }), item.body, _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [item.bodyText !== undefined && item.timeLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel }) : null, item.likeCountLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: item.likeCountLabel }) : null, (item.canReply ?? item.parentId === null) ? _jsx(Button, { size: "small", tone: "ghost", disabled: item.replyDisabled ?? false, onPress: () => onReply(item.id), children: replyLabel }) : null] })] }), _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexShrink: 0 }, children: [item.likeAction !== undefined ? item.likeAction : _jsx(IconButton, { label: item.likeLabel, tone: "ghost", onPress: () => onLike(item.id), children: item.likeIcon }), item.actions] })] }, item.id);
    return _jsx(ScreenLayout, { ...screen, footer: !screen.state || screen.state.kind === "ready" || screen.state.kind === "empty" ? composer : null, children: _jsxs(Stack, { gap: "lg", children: [items.filter(item => item.parentId === null).map(item => { const replies = items.filter(reply => reply.parentId === item.id); return _jsxs(Stack, { gap: "xs", children: [row(item), replies.length ? _jsxs(Stack, { gap: "md", layoutStyle: { marginStart: screenPatternRecipe.sectionGap }, children: [_jsx(Button, { layoutStyle: { alignSelf: "flex-start" }, tone: "ghost", size: "small", accessibilityState: { expanded: expandedIds.includes(item.id) }, onPress: () => onExpandedChange(item.id), children: repliesLabel(replies.length, expandedIds.includes(item.id)) }), expandedIds.includes(item.id) ? replies.map(row) : null] }) : null] }, item.id); }), threadFooter] }) });
}
//# sourceMappingURL=screen-flows.js.map