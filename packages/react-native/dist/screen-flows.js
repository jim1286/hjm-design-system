import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Children, Fragment, isValidElement } from "react";
import { IdentityAction, IdentityNameAction } from "./internal/identity-action.js";
import { useEffect, useRef, useState } from "react";
import { createContext, useContext } from "react";
import { TextArea } from "./inputs.js";
import { CompositionLayout, ScreenLayout } from "./screens.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid } from "./primitives.js";
import { SearchField } from "./inputs.js";
import { Chip, RadioGroup } from "./inputs.js";
import { AlertDialog, Sheet } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import {} from "@hjmds/design-contracts/components/upload-item";
import {} from "@hjmds/design-contracts/components/alert-dialog";
import { initialFocusDefaults, validateCommentThread, resolvePermissionAction, resolvePermissionFooter, resolveOnboardingStep, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchFilterRailVisible, resolveSearchScreenPhase, screenPatternRecipe, commentThreadRecipe, profileSummaryRecipe, searchScreenRecipe, resolveCommentMenuItems, resolveCommentReplyPage } from "@hjmds/design-contracts/screen-patterns";
import { iconButtonRecipe, resolveIconButtonEdgeOverhang, resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { DrawnMoreVertical, DrawnPencil } from "./internal/drawn-glyphs.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { MediaAlbumView, useMediaAlbumIndex } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
import { useHjmNativeTheme } from "./provider.js";
import { AccessibilityInfo, Animated, Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSheetBodyScroll } from "./internal/sheet-body-scroll.js";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./data-display.js";
import { PhotoSourceIcon } from "./internal/photo-source-icon.js";
// The trigger alone has no optional peers; the viewer (gesture/zoom peers) stays in the image-viewer subpath.
import { ImageViewerTrigger } from "./internal/image-viewer-trigger.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { MessageReactions } from "./internal/message-reactions.js";
import { Heading } from "./heading.js";
import { Menu } from "./navigation.js";
import { EmptyState, Skeleton } from "./feedback.js";
function Pane({ hidden = false, children }) { return _jsx(View, { style: { flex: 1, display: hidden ? "none" : "flex" }, children: children }); }
// `edge`: the action ends a header/row edge (IconButton/Button edge rule, 2026-10-17 audit); framed tones ignore it.
// `emphasis` overrides the primary/ghost pair for footers whose hierarchy a contract resolves (PermissionScreen).
function Action({ action, secondary = false, emphasis, edge }) { if (action.icon)
    return _jsx(IconButton, { label: action.label, tone: "ghost", ...(edge ? { edge } : {}), disabled: !!(action.disabled || action.pending), onPress: action.onAction, children: action.icon }); return _jsx(Button, { tone: emphasis ?? (secondary ? "ghost" : "primary"), ...(edge ? { edge } : {}), disabled: !!(action.disabled || action.pending), loading: action.pending ?? false, onPress: action.onAction, children: action.label }); }
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state.
 * Both panes reach the same window bottom, so `safeAreaBottom` goes to each (yajalal detail content sat under the home indicator, 2026-10-17). */
// layoutStyle places the outer host that owns both panes, as on Web, so the screen keeps the same
// placement while list and detail swap. Passing it to the list ScreenLayout dropped it on detail.
// "Load more" ends the list inside the scroll body, centered like LoadMore; the fixed footer is the bottom CTA slot (2026-10-17 review).
export function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }) { return _jsxs(View, { style: [{ flex: 1 }, layoutStyle], children: [_jsx(Pane, { hidden: !!detail, children: _jsx(ScreenLayout, { ...screen, ...(refresh || screen.actions ? { actions: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [screen.actions, refresh ? _jsx(Action, { action: refresh, secondary: true, edge: "end" }) : null] }) } : {}), children: loadMore ? _jsxs(View, { style: { flexGrow: 1, flexShrink: 1, minHeight: 0, gap: screenPatternRecipe.itemGap }, children: [list, _jsx(View, { style: { alignItems: "center" }, children: _jsx(Action, { action: loadMore, secondary: true }) })] }) : list }) }), detail ? _jsx(Pane, { children: _jsx(ScreenLayout, { title: detail.title, ...(detail.titleVisibility === undefined ? {} : { titleVisibility: detail.titleVisibility }), ...(detail.headerAlignment === undefined ? {} : { headerAlignment: detail.headerAlignment }), ...(detail.state === undefined ? {} : { state: detail.state }), stateAction: detail.stateAction, notice: detail.notice, actions: detail.actions, footer: detail.footer, ...(screen.safeAreaBottom === undefined ? {} : { safeAreaBottom: screen.safeAreaBottom }), exit: { kind: "back", label: back.label, onPress: back.onAction, disabled: !!(back.disabled || back.pending) }, children: detail.content }) }) : null] }); }
export function EditorScreen({ children, dirty, submitPlacement = "footer", submit, cancel, discard, draftStatus, stepBack, initialFocus = initialFocusDefaults.editor, ...screen }) {
    const [confirm, setConfirm] = useState(false);
    const cancelLocked = !!(cancel.disabled || cancel.pending || submit.pending);
    const submitAction = { ...submit, disabled: !!(submit.disabled || screen.state && screen.state.kind !== "ready") };
    // A prompt opened before an external save must not bypass the current leave lock
    // or reappear once the save finishes. Keep the draft mounted throughout.
    const stepping = !!stepBack, stepLocked = !!(stepBack?.disabled || stepBack?.pending || submit.pending);
    // A step-back exit replaces the cancel exit, so a discard prompt opened from the cancel exit cannot outlive it.
    useEffect(() => { if (cancelLocked || stepping)
        setConfirm(false); }, [cancelLocked, stepping]);
    // Preserve an async host result so AlertDialog can retain failure and retry.
    const leave = () => { if (!cancelLocked)
        return cancel.onAction(); };
    // Writing is the screen's purpose: focus the first field on entry unless the host opts out (2026-10-18).
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, initialFocus: initialFocus, exit: stepBack ? { kind: "back", label: stepBack.label, disabled: stepLocked, onPress: () => { if (!stepLocked)
                        stepBack.onAction(); } }
                    : { kind: "close", label: cancel.label, disabled: cancelLocked, onPress: () => { if (cancelLocked)
                            return; if (dirty)
                            setConfirm(true);
                        else
                            leave(); } }, actions: submitPlacement === "header" ? _jsx(Action, { action: submitAction }) : screen.actions, footer: submitPlacement === "header" ? draftStatus : _jsxs(Stack, { gap: "sm", children: [draftStatus, _jsx(Action, { action: submitAction })] }), children: children }), _jsx(AlertDialog, { open: confirm && !cancelLocked && !stepping, onOpenChange: setConfirm, request: { ...discard, mode: "confirm", onConfirm: leave } })] });
}
// Hands ProfileScreen's edit action to the ProfileSummary inside its summary slot, wherever the product nests it.
const ProfileEditContext = createContext(undefined);
export function ProfileScreen({ summary, edit, children, accountActions, editPlacement = "below-summary", ...screen }) { return _jsx(ScreenLayout, { ...screen, children: _jsxs(Stack, { gap: "xl", children: [editPlacement === "summary" ? _jsx(ProfileEditContext.Provider, { value: edit, children: summary }) : (edit ? _jsx(CompositionLayout, { footer: _jsx(Action, { action: edit, secondary: true }), children: summary }) : summary), children, accountActions] }) }); }
/** Body, stacked actions and confirmations shared by ModerationScreen (screen chrome) and ModerationForm (none). */
function useModeration(fields, ready, cancel) {
    const [confirm, setConfirm] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const review = fields.variant === "review" ? fields : null, report = fields.variant === "review" ? null : fields;
    const hasBlock = !!report?.block;
    // Withdrawing the action ends that confirmation session; a later action needs
    // a new explicit press even if the screen itself stays mounted.
    useEffect(() => { if (!hasBlock)
        setConfirm(false); }, [hasBlock]);
    const confirming = review && !review.resolution ? review.decisions.find(decision => decision.id === confirmId && decision.confirmation) : undefined;
    // Same rule for a decision: its confirmation closes when the decision or its confirmation is withdrawn or resolved.
    useEffect(() => { if (confirmId !== null && !confirming)
        setConfirmId(null); }, [confirmId, confirming]);
    const cancelAction = cancel ? _jsx(Action, { action: cancel, secondary: true }) : null;
    if (review) {
        const busy = review.decisions.some(decision => decision.pending);
        const reasonMissing = (review.decisionReason.required ?? true) && !review.decisionReason.value.trim();
        const field = review.resolution ?? _jsx(TextArea, { label: review.decisionReason.label, value: review.decisionReason.value, onValueChange: review.decisionReason.onValueChange, ...(review.decisionReason.description === undefined ? {} : { description: review.decisionReason.description }), ...(review.decisionReason.maxLength === undefined ? {} : { maxLength: review.decisionReason.maxLength }), required: review.decisionReason.required ?? true, disabled: !!review.decisionReason.disabled || busy });
        // One decision at a time: a pending decision locks the others and the reason it was taken with.
        const decisions = review.resolution ? [] : review.decisions.map(decision => {
            const locked = !!decision.disabled || busy || !ready || reasonMissing;
            return _jsx(Button, { tone: decision.tone ?? "secondary", disabled: locked, loading: decision.pending ?? false, onPress: () => { if (locked)
                    return; if (decision.confirmation)
                    setConfirmId(decision.id);
                else
                    decision.onAction(); }, children: decision.label }, decision.id);
        });
        return { body: _jsxs(Stack, { gap: "lg", children: [review.children, field] }),
            actions: decisions.length || cancelAction ? _jsxs(Stack, { gap: "xs", children: [decisions, cancelAction] }) : null,
            dialogs: confirming?.confirmation ? _jsx(AlertDialog, { open: true, onOpenChange: open => { if (!open)
                    setConfirmId(null); }, request: confirming.confirmation }) : null };
    }
    const r = report;
    return { body: _jsxs(Stack, { gap: "lg", children: [r.reasonPicker ?? (r.reasons.length ? _jsx(RadioGroup, { accessibilityLabel: r.reasonLabel, orientation: "vertical", items: r.reasons, value: r.reason, onValueChange: value => { if (value)
                        r.onReasonChange(value); } }) : null), r.children] }),
        actions: _jsxs(Stack, { gap: "xs", children: [_jsx(Action, { action: { ...r.submit, disabled: r.submit.disabled || !ready || !r.reasons.some(item => item.value === r.reason) } }), r.block ? _jsx(Action, { action: { ...r.block.action, onAction: () => setConfirm(true) }, secondary: true }) : null, cancelAction] }),
        dialogs: r.block ? _jsx(AlertDialog, { open: confirm, onOpenChange: setConfirm, request: r.block.confirmation }) : null };
}
// Every key of either variant, so the rest of the props reach ScreenLayout unchanged whichever variant is used.
const moderationFieldKeys = ["variant", "reasonPicker", "reasons", "reason", "onReasonChange", "reasonLabel", "children", "submit", "block", "decisionReason", "decisions", "resolution"];
export function ModerationScreen(props) {
    const screen = { ...props };
    for (const key of moderationFieldKeys)
        delete screen[key];
    const { body, actions, dialogs } = useModeration(props, !props.state || props.state.kind === "ready");
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, footer: actions, children: body }), dialogs] });
}
export function ModerationForm(props) {
    const { body, actions, dialogs } = useModeration(props, true, props.cancel);
    return _jsxs(_Fragment, { children: [_jsx(CompositionLayout, { ...(props.title === undefined ? {} : { title: props.title }), ...(props.headingLevel === undefined ? {} : { headingLevel: props.headingLevel }), ...(props.description === undefined ? {} : { description: props.description }), ...(props.actions === undefined ? {} : { actions: props.actions }), ...(props.layoutStyle === undefined ? {} : { layoutStyle: props.layoutStyle }), footer: actions, children: body }), dialogs] });
}
export function PhotoSourceSheet({ open, onOpenChange, onSelect, labels, disabled = false, cameraAvailable = true }) {
    const queued = useRef(null);
    useEffect(() => () => { queued.current = null; }, []);
    // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
    // dismissal completion (including Android fallback), so a timer is not a safe substitute.
    const select = (source) => { if (disabled || queued.current)
        return; queued.current = source; onOpenChange(false); };
    const complete = () => { const source = queued.current; queued.current = null; if (source && !disabled && (source !== "camera" || cameraAvailable))
        onSelect(source); };
    // A later close action is cancellation, even if the controlled owner previously
    // deferred closing after source selection. Do not launch that abandoned picker.
    const dismiss = (next) => { if (!next)
        queued.current = null; onOpenChange(next); };
    // Source choices are peer list actions; the shared row owns touch geometry and label alignment.
    return _jsx(Sheet, { open: open, onOpenChange: dismiss, title: labels.title, closeLabel: labels.cancel, onDismissComplete: complete, children: _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { title: labels.library, leading: _jsx(PhotoSourceIcon, { source: "library" }), disabled: disabled, onPress: () => select("library") }), cameraAvailable ? _jsx(ListRow, { title: labels.camera, leading: _jsx(PhotoSourceIcon, { source: "camera" }), disabled: disabled, onPress: () => select("camera") }) : null] }) });
}
/**
 * One picked item: preview, upload status, then move/rotate/remove. Exported (2026-10-18, Utilverse photo tools) so a
 * virtualized host (FlatList renderItem) renders the same cell as the screen grid instead of a copy.
 */
export function MediaSelectionCell({ item, index, count, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled = false }) {
    const id = item.descriptor.id;
    return _jsxs(Stack, { gap: "xs", children: [item.preview, _jsx(UploadItem, { descriptor: item.descriptor, labels: labels, onRetry: onRetry, onCancel: onCancel }), _jsxs(Stack, { axis: "inline", gap: "xs", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Button, { accessibilityLabel: moveUpLabel(item), size: "small", tone: "ghost", disabled: disabled || index === 0, onPress: () => onMove(id, -1), children: actionLabels.moveUp }), _jsx(Button, { accessibilityLabel: moveDownLabel(item), size: "small", tone: "ghost", disabled: disabled || index === count - 1, onPress: () => onMove(id, 1), children: actionLabels.moveDown }), rotate ? _jsx(Button, { accessibilityLabel: rotate.itemLabel(item), size: "small", tone: "ghost", disabled: disabled, onPress: () => rotate.onRotate(id), children: rotate.label }) : null, _jsx(Button, { accessibilityLabel: removeLabel(item), size: "small", tone: "ghost", disabled: disabled, onPress: () => onRemove(id), children: actionLabels.remove })] })] });
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled, ...screen }) {
    const itemActions = { labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, ...(rotate === undefined ? {} : { rotate }), ...(disabled === undefined ? {} : { disabled }) };
    return _jsx(ScreenLayout, { ...screen, ...(add || screen.actions ? { actions: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [screen.actions, add ? _jsx(Action, { action: add, edge: "end" }) : null] }) } : {}), footer: _jsxs(Stack, { gap: "sm", children: [selectionSummary, _jsx(Action, { action: done })] }), children: library ?? _jsx(Grid, { columns: { compact: 2, expanded: 3 }, gap: { compact: "md" }, children: items.map((item, index) => _jsx(MediaSelectionCell, { item: item, index: index, count: items.length, ...itemActions }, item.descriptor.id)) }) });
}
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
    return _jsxs(Stack, { gap: "xl", children: [legacy, recent && visible.length ? _jsxs(Stack, { gap: "sm", children: [_jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", children: [_jsx(Heading, { level: "level5", children: recent.title }), _jsx(Button, { tone: "ghost", size: "small", edge: "end", onPress: recent.onClearAll, children: recent.clearAllLabel })] }), _jsx(Stack, { gap: "xxs", children: visible.map(item => _jsx(ListRow, { density: "compact", leading: recent.icon, title: item, onPress: () => onCommit(item), trailingAction: _jsx(IconButton, { label: recent.removeLabel(item), tone: "ghost", edge: "end", onPress: () => recent.onRemove(item), children: recent.removeIcon ?? _jsx(FixedGlyph, { tone: "muted", children: "\u00D7" }) }) }, item)) })] }) : null, suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null] });
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
    const showCount = summary && cause === "none" && summary.countVisibility !== "hidden";
    // A count-free search still owns its sorting action; do not hide it with the total.
    const showSort = summary && cause === "none" && sort;
    if (!summary?.notice && !showCount && !showSort && !applied?.items.length)
        return null;
    return _jsxs(Stack, { gap: "sm", children: [summary?.notice, showCount || showSort ? _jsxs(Stack, { axis: "inline", justify: showCount ? "between" : "end", align: "center", gap: "sm", wrap: true, children: [showCount ? (summary.count === null ? _jsx(Skeleton, { shape: "text", width: "30%" }) : _jsx(Text, { tone: "muted", children: summary.countLabel(summary.count) })) : null, sort ? _jsx(Menu, { presentation: "anchored", triggerLabel: sort.triggerLabel, title: sort.label, dismissLabel: sort.dismissLabel, items: sort.options.map(option => ({ id: option.id, label: option.label })), selection: { mode: "single", selectedKey: sort.value, onSelectionChange: next => { if (next)
                                onSortChange(next); } }, renderTrigger: trigger => _jsx(Button, { size: "small", tone: "ghost", edge: "end", accessibilityState: trigger.accessibilityState, onPress: trigger.onPress, ...(sort.icon === undefined ? {} : { trailing: sort.icon }), children: sort.triggerLabel }) }) : null] }) : null, applied?.items.length ? _jsxs(Stack, { axis: "inline", wrap: true, gap: "xs", align: "center", children: [applied.items.map(item => _jsx(Chip, { label: item.label, accessibilityLabel: applied.removeLabel(item.label), trailing: applied.removeIcon ?? _jsx(FixedGlyph, { tone: "muted", children: "\u00D7" }), onPress: () => applied.onRemove(item.key) }, item.key)), _jsx(Button, { tone: "ghost", size: "small", onPress: applied.onClearAll, children: applied.clearAllLabel })] }) : null] });
}
function SearchResultsBody({ summary, applied, suggested, cause, onCommit, children }) {
    // The row owns its two-line geometry; only the first placeholder is an accessible status.
    if (summary?.count === null)
        return _jsx(Stack, { gap: "xxs", children: Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) => _jsx(ListRow, { loading: true, title: "", description: summary.loadingLabel, ...(index === 0 ? { loadingLabel: summary.loadingLabel } : {}) }, index)) });
    if (cause === "none" || !summary?.empty)
        return _jsx(_Fragment, { children: children });
    return _jsxs(Stack, { gap: "lg", children: [_jsx(EmptyState, { density: "compact", announcement: "polite", title: summary.empty.title, ...(summary.empty.description === undefined ? {} : { description: summary.empty.description }), ...(cause === "filters" && applied ? { action: _jsx(Button, { tone: "secondary", onPress: applied.onClearAll, children: applied.clearAllLabel }) } : {}) }), cause === "query" && suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null, children] });
}
function SearchFilterTrigger({ sheet, appliedCount }) {
    const trigger = sheet.trigger;
    return _jsx(Chip, { label: trigger.label(appliedCount), accessibilityLabel: trigger.accessibilityLabel(appliedCount), layoutStyle: { alignSelf: "center" }, ...(trigger.icon === undefined ? {} : { leading: trigger.icon }), onPress: () => sheet.onOpenChange(true) });
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
    const footer = _jsxs(Stack, { gap: "xs", children: [_jsx(Button, { fullWidth: true, disabled: count === 0, onPress: () => { sheet.onApply(draft); sheet.onOpenChange(false); }, children: sheet.labels.apply(count) }), _jsx(Button, { fullWidth: true, tone: "secondary", disabled: sheet.isDefault(draft), onPress: () => setDraft(sheet.reset(draft)), children: sheet.labels.reset })] });
    return _jsx(Sheet, { open: sheet.open, onOpenChange: open => sheet.onOpenChange(open), title: sheet.title, closeLabel: sheet.labels.close, size: sheet.size ?? "large", scrollable: true, footer: footer, children: sheet.renderContent(draft, setDraft) });
}
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen({ embedded = false, query, queryLabel, queryField, queryClearLabel, onQueryChange, onSearch, debounceMs, filters, recentSearches, children, onSubmit, committedQuery, filtersOverflow = "wrap", filtersRole = "narrow", hostGutter = "none", queryLabelVisibility = "hidden", searching, searchingLabel, recentQueries, suggestedQueries, suggestions, resultSummary, appliedFilters, filterSheet, initialFocus = initialFocusDefaults.search, ...screen }) {
    // The host owns localized copy. A custom queryField owns its own clear affordance.
    if (queryField == null && !queryClearLabel?.trim())
        throw new TypeError("SearchScreen requires a localized queryClearLabel for its default search field");
    const searchDelay = resolveSearchDebounceMs(debounceMs);
    const callback = useRef(onSearch);
    callback.current = onSearch;
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => callback.current(query, { signal: controller.signal }), searchDelay); return () => { clearTimeout(timer); controller.abort(); }; }, [query, searchDelay]);
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
    // Two-step search shows the rail only beside results; a query-caused zero hides narrowing filters (none can fix it)
    // but keeps scope filters, which are that zero's recovery (resolveSearchFilterRailVisible, Web twin).
    const showRail = resolveSearchFilterRailVisible(phase, committedQuery !== undefined, cause, filtersRole);
    const trigger = filterSheet?.trigger ? _jsx(SearchFilterTrigger, { sheet: filterSheet, appliedCount: appliedCount }) : null;
    const rail = !showRail ? null : trigger && filters != null ? _jsxs(Stack, { axis: "inline", align: "center", gap: "xs", wrap: filtersOverflow === "wrap", children: [trigger, filters] }) : trigger ?? filters;
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
    // Inside a Sheet's plain body the results scroller adopts the sheet's pull wiring, so the sheet reads this list's
    // offset instead of taking downward scrolls of a scrolled list as a drag (2026-10-30 Spint city sheet).
    const sheetScroll = useSheetBodyScroll();
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
    // Search-first routes have no visible heading: navigation and input share one row.
    // Keep explicit host headers and described/titled screens in their existing layout.
    const inlineNavigation = !embedded && screen.titleVisibility === "hidden" && screen.header == null;
    const input = queryField ?? _jsx(SearchField, { ...labelProps, clearLabel: queryClearLabel, value: query, onValueChange: onQueryChange, busy: searching ?? false, busyLabel: searchingLabel ?? queryLabel, ...submitProps });
    const queryRow = inlineNavigation ? _jsxs(Stack, { axis: "inline", align: "center", gap: "sm", children: [screen.exit ? _jsx(ScreenExitButton, { ...screen.exit }) : null, _jsx(View, { style: { flex: 1, minWidth: 0 }, children: input }), screen.actions] }) : input;
    // The query field is the search screen's primary input (2026-10-18 entry focus).
    // Empty results belong to the visible body below the pinned query/filter/map region.
    // Reuse ScreenLayout's centering contract rather than giving EmptyState an arbitrary top inset.
    const centerResults = phase === "results" && cause !== "none" && resultSummary?.empty !== undefined;
    const notice = _jsxs(Stack, { gap: "sm", children: [queryRow, filterSlot, screen.notice] });
    // A virtualized host needs the full remaining body height; without this flex the FlatList measured at zero.
    const results = _jsx(Stack, { gap: "lg", justify: embedded && centerResults ? "center" : "start", layoutStyle: screen.scroll === "content" || embedded ? { flex: 1 } : undefined, children: body });
    const embeddedResults = screen.scroll === "content" ? results
        : embedded && sheetScroll ? _jsx(View, { ...sheetScroll.wrapperProps, style: { flex: 1, minHeight: 0 }, children: _jsx(Animated.ScrollView, { ref: scrollRef, keyboardShouldPersistTaps: "handled", style: { flex: 1, minHeight: 0 }, contentContainerStyle: { flexGrow: 1 }, ...sheetScroll.scrollProps, children: _jsx(Animated.View, { style: [{ flexGrow: 1 }, sheetScroll.contentStyle], children: results }) }) })
            : _jsx(ScrollView, { ref: scrollRef, keyboardShouldPersistTaps: "handled", style: { flex: 1, minHeight: 0 }, contentContainerStyle: { flexGrow: 1 }, children: results });
    return _jsxs(_Fragment, { children: [embedded ? _jsx(CompositionLayout, { notice: notice, ...(screen.state === undefined ? {} : { state: screen.state }), stateAction: screen.stateAction, loadingIndicator: screen.loadingIndicator, footer: screen.footer, layoutStyle: [{ flex: 1 }, screen.layoutStyle], children: embeddedResults })
                : _jsx(ScreenLayout, { ...screen, contentAlignment: phase === "results" && cause !== "none" && resultSummary?.empty ? "center" : screen.contentAlignment ?? "start", initialFocus: initialFocus, ...(inlineNavigation ? { header: _jsx(_Fragment, {}) } : {}), scrollRef: scrollRef, notice: notice, children: results }), filterSheet ? _jsx(SearchFilterSheetView, { sheet: filterSheet }) : null] });
}
// Permission guidance occupies the current screen body; keep its default centered on both platforms.
export function PermissionScreen({ status, illustration, explanation, request, settings, continueAction, recheck, alternative, skip, ...screen }) {
    const kind = resolvePermissionAction(status);
    const primary = kind === "request" ? request : kind === "settings" ? settings : kind === "continue" ? continueAction : null;
    // Order and emphasis come from the contract: primary → recheck (denied) → alternative → skip.
    const actions = { primary, recheck, alternative, skip };
    const footer = resolvePermissionFooter(status, { recheck: !!recheck, alternative: !!alternative, skip: !!skip });
    return _jsx(ScreenLayout, { ...screen, contentAlignment: screen.contentAlignment ?? "center", footer: _jsx(Stack, { gap: "xs", children: footer.map(({ slot, emphasis }) => _jsx(Action, { action: actions[slot], emphasis: emphasis }, slot)) }), children: _jsxs(Stack, { gap: "xl", align: "center", children: [illustration, explanation] }) });
}
// Large headings and a software keyboard can consume the entire fixed header
// area. Keep step guidance in the existing scroll body, with completion actions fixed.
export function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, exit, layoutStyle, safeAreaBottom }) {
    const position = resolveOnboardingStep(steps.length, index);
    const step = steps[index];
    // Completion and skip persist the same flow: keep navigation stable until the receipt.
    const scrollRef = useRef(null);
    // A new step starts at its guidance even when the previous story was scrolled.
    useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [index]);
    const pending = !!(complete.pending || skip?.pending);
    return _jsx(ScreenLayout, { scrollRef: scrollRef, ...(layoutStyle === undefined ? {} : { layoutStyle }), ...(safeAreaBottom === undefined ? {} : { safeAreaBottom }), title: step.title, titleVisibility: "hidden", ...(exit ? { exit: { ...exit, disabled: !!(exit.disabled || pending) } } : { header: _jsx(_Fragment, {}) }), footer: _jsxs(Stack, { gap: "xs", children: [_jsx(Action, { action: position.last ? { ...complete, disabled: !!(complete.disabled || pending) } : { label: nextLabel, disabled: pending, onAction: () => onIndexChange(index + 1) } }), !position.first ? _jsx(Action, { action: { label: backLabel, disabled: pending, onAction: () => onIndexChange(index - 1) }, secondary: true }) : null] }), children: _jsxs(Stack, { gap: "md", children: [_jsx(Text, { variant: "titleLarge", accessibilityRole: "header", children: step.title }), _jsx(Text, { tone: "muted", children: step.description }), _jsx(Text, { variant: "caption", tone: "muted", children: progressLabel(index + 1, steps.length) }), skip ? _jsx(Action, { action: { ...skip, disabled: !!(skip.disabled || pending) }, secondary: true }) : null, step.content] }) });
}
function CommentTextAction({ label, onPress, disabled = false, expanded }) {
    return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: label, accessibilityState: { disabled, ...(expanded === undefined ? {} : { expanded }) }, disabled: disabled, hitSlop: commentThreadRecipe.avatarGap, onPress: onPress, style: { alignSelf: "flex-start", opacity: disabled ? 0.5 : 1 }, children: _jsx(Text, { variant: "caption", tone: "muted", emphasis: "strong", children: label }) });
}
function CommentMenuButton({ item, menu, items }) {
    const { palette } = useHjmNativeTheme();
    const label = menu.label(item);
    return _jsx(Menu, { presentation: menu.presentation ?? "anchored", triggerLabel: label, dismissLabel: menu.dismissLabel, items: items.map(entry => ({ id: entry.id, label: entry.label, ...(entry.tone === undefined ? {} : { tone: entry.tone }), ...(entry.disabled === undefined ? {} : { disabled: entry.disabled }) })), onActionAfterDismiss: id => menu.onAction(item, id), renderTrigger: trigger => _jsx(IconButton, { label: label, tone: "ghost", size: commentThreadRecipe.actionButtonSize, onPress: trigger.onPress, children: _jsx(DrawnMoreVertical, { size: commentThreadRecipe.menuGlyphSize, color: resolveIconButtonPresentation("ghost", palette).content }) }) });
}
/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }) {
    validateMediaSetChoice(item.media != null, item.mediaAlbum !== undefined);
    const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(item.mediaAlbum);
    // The nickname opens the same member profile as the picture (2026-10-29); without avatarAction it stays plain text.
    const authorName = (name) => item.avatarAction ? _jsx(IdentityNameAction, { action: item.avatarAction, children: name }) : name;
    // bodyText inlines the author, so its time always moves under the body; rich bodies opt in with timePlacement.
    const timeInActions = item.bodyText !== undefined || item.timePlacement === "actions";
    const avatarSize = item.parentId === null ? commentThreadRecipe.avatarSize : commentThreadRecipe.replyAvatarSize;
    const theme = useHjmNativeTheme();
    const menuItems = commentMenu ? resolveCommentMenuItems(commentMenu.items(item)) : [];
    // commentThreadRecipe.actionAnchor: the 44 targets centre on the identity's first line, using the line height Text
    // renders (token × controlled/OS text scale). When HJM's own like/more is last, the whole column takes the IconButton
    // edge overhang so its glyph slot ends on the row inset; the 44-wide like count shares the column and would absorb a
    // margin on the button alone.
    const visibleTarget = visibleControlHeight(iconButtonRecipe.sizes[commentThreadRecipe.actionButtonSize].diameter, theme.environment.minimumVisualTarget);
    const anchorVariant = item.bodyText !== undefined ? commentThreadRecipe.actionAnchor.inlineTextVariant : commentThreadRecipe.actionAnchor.authorTextVariant;
    const anchorOffset = (theme.tokens.typography[anchorVariant].lineHeight * theme.textScaling.scale - visibleTarget) / 2;
    const edgeOverhang = menuItems.length || item.actions == null && item.likeAction === undefined ? resolveIconButtonEdgeOverhang("ghost", commentThreadRecipe.actionButtonSize, visibleTarget) : 0;
    // The like count sits under the heart so the text column carries only identity, body and reply.
    return _jsxs(Stack, { axis: "inline", align: "start", gap: "xs", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [item.avatar ? _jsx(View, { style: { width: item.avatarAction ? iconButtonRecipe.sizes.medium.diameter : avatarSize, alignItems: "center" }, children: item.avatarAction ? _jsx(IdentityAction, { action: item.avatarAction, children: item.avatar }) : item.avatar }) : null, _jsxs(View, { style: { flex: 1, minWidth: 0, gap: commentThreadRecipe.lineGap }, children: [(() => {
                        const identity = _jsxs(_Fragment, { children: [item.bodyText !== undefined ? (item.authorBadge ? _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [authorName(_jsx(Text, { emphasis: "strong", children: item.author })), item.authorBadge, _jsx(Text, { children: item.bodyText })] }) : _jsxs(Text, { children: [authorName(_jsx(Text, { emphasis: "strong", children: item.author })), " ", item.bodyText] })) : (item.author || item.authorBadge || (item.timeLabel && !timeInActions)) ? _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [item.author ? authorName(_jsx(Text, { variant: "caption", emphasis: "strong", children: item.author })) : null, item.authorBadge, item.timeLabel && !timeInActions ? _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel }) : null] }) : null, item.body, item.media ? _jsx(View, { style: { width: commentThreadRecipe.mediaMaxWidth, maxWidth: "100%", borderRadius: commentThreadRecipe.mediaRadius, overflow: "hidden", marginTop: commentThreadRecipe.avatarGap / 2, alignSelf: "flex-start" }, children: item.media }) : null] });
                        return item.reactions ? _jsx(MessageReactions, { previewSurface: true, ...item.reactions, ...((item.canReply ?? item.parentId === null) && !item.replyDisabled ? { replyAction: { label: replyLabel, onPress: () => onReply(item.id), ...(item.reactions.replyIcon === undefined ? {} : { icon: item.reactions.replyIcon }) } } : {}), children: _jsx(View, { style: { gap: commentThreadRecipe.lineGap }, children: identity }) }) : identity;
                    })(), item.mediaAlbum ? _jsx(View, { style: { marginTop: commentThreadRecipe.avatarGap / 2, alignSelf: "flex-start" }, children: _jsx(MediaAlbumView, { album: item.mediaAlbum, index: albumIndex, onIndexChange: setAlbumIndex, width: commentThreadRecipe.mediaMaxWidth, radius: commentThreadRecipe.mediaRadius }) }) : null, (timeInActions && item.timeLabel) || (item.canReply ?? item.parentId === null) || item.reactionSummary || item.textActions?.length ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [timeInActions && item.timeLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel }) : null, item.reactionSummary, (item.canReply ?? item.parentId === null) ? _jsx(CommentTextAction, { label: replyLabel, disabled: item.replyDisabled ?? false, onPress: () => onReply(item.id) }) : null, item.textActions?.map(action => _jsx(CommentTextAction, { label: action.label, disabled: action.disabled ?? false, onPress: action.onPress }, action.id))] }) : null, item.panel != null ? _jsx(View, { style: { marginTop: commentThreadRecipe.panelGap - commentThreadRecipe.lineGap }, children: item.panel }) : null] }), _jsxs(View, { style: { flexShrink: 0, marginTop: anchorOffset, ...(edgeOverhang ? { marginEnd: -edgeOverhang } : {}) }, children: [_jsxs(Stack, { axis: "inline", gap: 0, align: "center", layoutStyle: { flexShrink: 0 }, children: [item.likeAction !== undefined ? item.likeAction : _jsx(IconButton, { label: item.likeLabel, tone: "ghost", size: commentThreadRecipe.actionButtonSize, onPress: () => onLike(item.id), children: item.likeIcon }), item.actions, commentMenu && menuItems.length ? _jsx(CommentMenuButton, { item: item, menu: commentMenu, items: menuItems }) : null] }), item.likeCountLabel ? _jsx(View, { style: { width: commentThreadRecipe.likeColumnWidth }, children: _jsx(Text, { variant: "caption", tone: "muted", align: "center", children: item.likeCountLabel }) }) : null] })] }, item.id);
}
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({ items, expandedIds, onExpandedChange, onLike, onReply, replyLabel, repliesLabel, composer, threadHeader, threadFooter, commentMenu, moreRepliesLabel, revealedReplyId, ...screen }) {
    validateCommentThread(items);
    // How far the reader opened each branch is presentation state; data, ordering and expansion stay with the product.
    const [openedReplies, setOpenedReplies] = useState({});
    // Index replies once; rescanning every item for each root makes long threads quadratic.
    const roots = [], repliesByParent = new Map();
    const expanded = new Set(expandedIds);
    for (const item of items) {
        if (item.parentId === null)
            roots.push(item);
        else {
            const siblings = repliesByParent.get(item.parentId);
            if (siblings)
                siblings.push(item);
            else
                repliesByParent.set(item.parentId, [item]);
        }
    }
    const row = (item) => _jsx(CommentThreadRow, { item: item, onLike: onLike, onReply: onReply, replyLabel: replyLabel, ...(commentMenu === undefined ? {} : { commentMenu }) }, item.id);
    // Product context belongs in the same scroll body as comments. Putting a tall
    // overview in the fixed header forced a second scroll region in Spint (2026-10-08).
    return _jsx(ScreenLayout, { ...screen, footer: !screen.state || screen.state.kind === "ready" || screen.state.kind === "empty" ? composer : null, children: _jsxs(Stack, { gap: "lg", children: [threadHeader, _jsx(View, { style: { gap: commentThreadRecipe.rowGap }, children: roots.map(item => { const replies = repliesByParent.get(item.id) ?? []; const total = item.repliesCount; if (total !== undefined && (!Number.isSafeInteger(total) || total < 0))
                        throw new RangeError("CommentThreadItem repliesCount must be nonnegative"); const count = Math.max(replies.length, total ?? 0); return _jsxs(View, { style: { gap: commentThreadRecipe.rowGap }, children: [row(item), count || item.repliesNotice || item.repliesFooter ? _jsxs(View, { style: { gap: commentThreadRecipe.rowGap, marginStart: commentThreadRecipe.replyIndent }, children: [_jsx(CommentTextAction, { label: repliesLabel(count, expanded.has(item.id)), expanded: expanded.has(item.id), onPress: () => onExpandedChange(item.id) }), expanded.has(item.id) ? _jsxs(_Fragment, { children: [item.repliesNotice, (() => { if (!moreRepliesLabel)
                                                return replies.map(row); const visible = openedReplies[item.id] ?? commentThreadRecipe.replyPageSize; const page = resolveCommentReplyPage({ loaded: replies.length, total: count, visible, revealIndex: replies.findIndex(reply => reply.id === revealedReplyId), canFetch: item.repliesPage !== undefined }); return _jsxs(_Fragment, { children: [replies.slice(0, page.shown).map(row), page.more ? _jsx(CommentTextAction, { label: moreRepliesLabel(page.remaining), disabled: page.more === "fetch" && !!item.repliesPage?.pending, onPress: () => { setOpenedReplies(current => ({ ...current, [item.id]: page.shown + commentThreadRecipe.replyPageSize })); if (page.more === "fetch")
                                                            item.repliesPage?.onLoadMore(); } }) : null] }); })(), item.repliesFooter] }) : null] }) : null] }, item.id); }) }), threadFooter] }) });
}
/** Rows of `profileSummaryRecipe.stats.maxPerRow` cells; a short last row is padded so every cell keeps one width. */
function profileStatRows(stats) {
    const perRow = Math.min(profileSummaryRecipe.stats.maxPerRow, stats.length);
    const rows = [];
    for (let start = 0; start < stats.length; start += perRow) {
        const row = stats.slice(start, start + perRow);
        while (row.length < perRow)
            row.push(null);
        rows.push(row);
    }
    return rows;
}
/** Profile identity and counts are common; routing and mutations stay controlled by the product. */
// Fragments group JSX without creating an action cell; menus remain one cell.
function profileActionItems(actions) {
    return Children.toArray(actions).flatMap(action => isValidElement(action) && action.type === Fragment
        ? profileActionItems(action.props.children)
        : [action]);
}
// react-native-svg is an optional peer: screen-flows must not import icon-svg (2026-10-25 Metro crash in apps without it).
// The fallback pencil is the View-drawn glyph like the comment ⋮; products normally pass their own glyph via `nameEdit.icon`.
function NameEditGlyph() {
    const { palette } = useHjmNativeTheme();
    return _jsx(DrawnPencil, { size: glyph[iconButtonRecipe.sizes[profileSummaryRecipe.nameEdit.size].glyph], color: resolveIconButtonPresentation("ghost", palette).content });
}
export function ProfileSummary({ name, headingLevel = 2, avatar, badge, nameActions, nameEdit, avatarView, stats = [], actions, actionsLayout = "inline", children }) {
    const actionLayout = profileSummaryRecipe.actionsLayouts[actionsLayout];
    const edit = useContext(ProfileEditContext);
    const { tone: editTone, size: editSize } = profileSummaryRecipe.editAction;
    const editButton = edit ? _jsx(Button, { tone: editTone, size: editSize, disabled: !!(edit.disabled || edit.pending), loading: edit.pending ?? false, onPress: edit.onAction, children: edit.label }) : null;
    const nameEditButton = nameEdit ? _jsx(IconButton, { label: nameEdit.label, tone: "ghost", size: profileSummaryRecipe.nameEdit.size, disabled: !!(nameEdit.disabled || nameEdit.pending), onPress: nameEdit.onAction, children: nameEdit.icon ?? _jsx(NameEditGlyph, {}) }) : null;
    const avatarFrame = _jsx(View, { style: { alignItems: "center", justifyContent: "center", width: profileSummaryRecipe.avatarSize, height: profileSummaryRecipe.avatarSize, flexShrink: 0, borderRadius: profileSummaryRecipe.avatarSize / 2, overflow: "hidden" }, children: avatar });
    return _jsxs(CompositionLayout, { title: name, headingLevel: headingLevel, leading: avatarView ? _jsx(ImageViewerTrigger, { label: avatarView.label, onPress: avatarView.onPress, disabled: avatarView.disabled ?? false, children: avatarFrame }) : avatarFrame, badge: badge, actions: nameEdit || nameActions ? _jsxs(_Fragment, { children: [nameEditButton, nameActions] }) : undefined, footer: children, children: [stats.length ? _jsx(Stack, { gap: profileSummaryRecipe.stats.rowGap, layoutStyle: { width: "100%" }, children: profileStatRows(stats).map((row, index) => _jsx(Stack, { axis: "inline", gap: "md", align: "stretch", layoutStyle: { width: "100%" }, children: row.map((stat, cell) => stat ?
                        // Cells start at the top: a label that wraps to two lines must not lower its value below its neighbours (2026-10-28).
                        _jsx(Stack, { gap: "xxs", align: "center", justify: "start", layoutStyle: { flex: 1, minWidth: 0 }, children: stat.onPress ? _jsx(Button, { tone: "ghost", accessibilityLabel: `${stat.value} ${stat.label}`, disabled: stat.disabled ?? false, onPress: stat.onPress, layoutStyle: { width: "100%" }, children: _jsxs(Stack, { gap: "xxs", align: "center", children: [_jsx(Text, { emphasis: "strong", children: stat.value }), _jsx(Text, { variant: "caption", tone: "muted", children: stat.label })] }) })
                                : _jsxs(_Fragment, { children: [_jsx(Text, { emphasis: "strong", children: stat.value }), _jsx(Text, { variant: "caption", tone: "muted", children: stat.label })] }) }, stat.id) : _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flex: 1, minWidth: 0 } }, `empty-${cell}`)) }, index)) }) : null, editButton || actions ? actionsLayout === "equal" ? (_jsx(Grid, { columns: { compact: Math.max(1, profileActionItems([editButton, actions]).length) }, gap: { compact: actionLayout.gap }, style: { width: "100%" }, children: profileActionItems([editButton, actions]) })) : _jsxs(Stack, { axis: actionLayout.axis, gap: actionLayout.gap, wrap: actionsLayout === "inline", layoutStyle: { width: "100%" }, children: [editButton, actions] }) : null] });
}
//# sourceMappingURL=screen-flows.js.map