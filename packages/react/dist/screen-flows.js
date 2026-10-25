"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { Children, Fragment, isValidElement } from "react";
import { IdentityAction } from "./internal/identity-action.js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createContext, useContext } from "react";
import { TextArea } from "./forms.js";
import { CompositionLayout, ScreenLayout } from "./screens.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { Button, IconButton } from "./actions.js";
import { MessageReactions } from "./internal/message-reactions.js";
import { MediaAlbumView, useMediaAlbumIndex } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
import { Stack, Text, Grid, VisuallyHidden } from "./layout.js";
import { SearchField } from "./forms.js";
import { Chip, RadioGroup } from "./selection.js";
import { AlertDialog, Menu, Sheet } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import {} from "@hjmds/design-contracts/components/upload-item";
import {} from "@hjmds/design-contracts/components/alert-dialog";
import { initialFocusDefaults, validateCommentThread, resolvePermissionAction, resolvePermissionFooter, resolveOnboardingStep, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchFilterRailVisible, resolveSearchScreenPhase, resolveFocusAfterRemoval, screenPatternRecipe, commentThreadRecipe, profileSummaryRecipe, searchScreenRecipe, resolveCommentMenuItems, resolveCommentReplyPage } from "@hjmds/design-contracts/screen-patterns";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { containerRecipe } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./display.js";
import { Icon } from "./supplemental-display.js";
import { PhotoSourceIcon } from "./internal/photo-source-icon.js";
import { Heading } from "./heading.js";
import { EmptyState, Skeleton } from "./feedback.js";
// `edge`: the action ends a header/row edge (IconButton/Button edge rule, 2026-10-17 audit); framed tones ignore it.
// `emphasis` overrides the primary/ghost pair for footers whose hierarchy a contract resolves (PermissionScreen).
function Action({ action, secondary = false, emphasis, buttonRef, edge }) { if (action.icon)
    return _jsx(IconButton, { ref: buttonRef, label: action.label, tone: "ghost", ...(edge ? { edge } : {}), disabled: !!(action.disabled || action.pending), onClick: action.onAction, children: action.icon }); return _jsx(Button, { ref: buttonRef, tone: emphasis ?? (secondary ? "ghost" : "primary"), ...(edge ? { edge } : {}), disabled: !!(action.disabled || action.pending), loading: action.pending ?? false, onClick: action.onAction, children: action.label }); }
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export function ListDetailScreen({ list, detail, back, refresh, loadMore, layoutStyle, ...screen }) {
    const open = !!detail;
    // Seed with the first render: a deep link that mounts with detail open is not a user transition,
    // so it must not pull focus from wherever the host left it (address bar, router focus target).
    const listHost = useRef(null), detailHost = useRef(null), returnFocus = useRef(null), wasOpen = useRef(open);
    // The retained host is a fallback when a virtualized list removes its focused item.
    // Hidden lists preserve scroll but drop browser focus; retain the trigger and move into the
    // detail once, then restore it (or the list body if the item was removed). See usage/ListDetailScreen.
    useLayoutEffect(() => {
        if (open && !wasOpen.current)
            detailHost.current?.querySelector("button")?.focus({ preventScroll: true });
        if (!open && wasOpen.current) {
            const target = returnFocus.current;
            if (target?.isConnected && !target.closest("[hidden]"))
                target.focus({ preventScroll: true });
            // A retained trigger can also become disabled while detail is open.
            if (document.activeElement !== target)
                (listHost.current?.querySelector('[tabindex="0"]') ?? listHost.current)?.focus({ preventScroll: true });
        }
        wasOpen.current = open;
    }, [open]);
    // layoutStyle places the outer host that owns both panes, not the inner list ScreenLayout.
    // "Load more" ends the list inside the scroll body, centered like LoadMore; the fixed footer is the bottom CTA slot (2026-10-17 review).
    return _jsxs("div", { style: { height: "100%", ...layoutStyle }, children: [_jsx("div", { ref: listHost, tabIndex: -1, hidden: open, style: { height: "100%" }, onFocusCapture: event => { returnFocus.current = event.target; }, children: _jsx(ScreenLayout, { ...screen, ...(refresh || screen.actions ? { actions: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [screen.actions, refresh ? _jsx(Action, { action: refresh, secondary: true, edge: "end" }) : null] }) } : {}), children: loadMore ? _jsxs("div", { style: { display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, gap: screenPatternRecipe.itemGap }, children: [list, _jsx("div", { style: { display: "flex", justifyContent: "center" }, children: _jsx(Action, { action: loadMore, secondary: true }) })] }) : list }) }), detail ? _jsx("div", { ref: detailHost, style: { height: "100%" }, children: _jsx(ScreenLayout, { title: detail.title, ...(detail.titleVisibility === undefined ? {} : { titleVisibility: detail.titleVisibility }), ...(detail.headerAlignment === undefined ? {} : { headerAlignment: detail.headerAlignment }), ...(detail.state === undefined ? {} : { state: detail.state }), stateAction: detail.stateAction, notice: detail.notice, actions: detail.actions, footer: detail.footer, exit: { kind: "back", label: back.label, onClick: back.onAction, disabled: !!(back.disabled || back.pending) }, children: detail.content }) }) : null] });
}
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
    return _jsxs(_Fragment, { children: [_jsx(ScreenLayout, { ...screen, initialFocus: initialFocus, exit: stepBack ? { kind: "back", label: stepBack.label, disabled: stepLocked, onClick: () => { if (!stepLocked)
                        stepBack.onAction(); } }
                    : { kind: "close", label: cancel.label, disabled: cancelLocked, onClick: () => { if (cancelLocked)
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
        const field = review.resolution ?? _jsx(TextArea, { label: review.decisionReason.label, value: review.decisionReason.value, onChange: event => review.decisionReason.onValueChange(event.currentTarget.value), ...(review.decisionReason.description === undefined ? {} : { description: review.decisionReason.description }), ...(review.decisionReason.maxLength === undefined ? {} : { maxLength: review.decisionReason.maxLength }), required: review.decisionReason.required ?? true, disabled: !!review.decisionReason.disabled || busy });
        // One decision at a time: a pending decision locks the others and the reason it was taken with.
        const decisions = review.resolution ? [] : review.decisions.map(decision => {
            const locked = !!decision.disabled || busy || !ready || reasonMissing;
            return _jsx(Button, { tone: decision.tone ?? "secondary", disabled: locked, loading: decision.pending ?? false, onClick: () => { if (locked)
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
    // File-input click must stay in the user's activation stack. Deferring until the
    // sheet animation ends can cause browsers to reject camera/album selection.
    const select = (source) => { if (disabled)
        return; onOpenChange(false); onSelect(source); };
    // Same peer list actions as Native, without changing the browser activation stack.
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: labels.title, closeLabel: labels.cancel, children: _jsxs(Stack, { gap: "xxs", children: [_jsx(ListRow, { title: labels.library, leading: _jsx(PhotoSourceIcon, { source: "library" }), disabled: disabled, onClick: () => select("library") }), cameraAvailable ? _jsx(ListRow, { title: labels.camera, leading: _jsx(PhotoSourceIcon, { source: "camera" }), disabled: disabled, onClick: () => select("camera") }) : null] }) });
}
/**
 * One picked item: preview, upload status, then move/rotate/remove. Exported (2026-10-18, Utilverse photo tools) so a
 * virtualized host (VirtualList, FlatList renderItem) renders the same cell as the screen grid instead of a copy.
 * Web keyboard focus recovery after removal belongs to the screen grid; a virtualized host owns its own.
 */
export function MediaSelectionCell({ item, index, count, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled = false }) {
    const id = item.descriptor.id;
    // The job lock is temporary, so it keeps the focused action focusable (aria-disabled; Button drops the click) instead
    // of throwing keyboard focus to <body> for the length of the job. The list boundaries stay natively disabled.
    const lock = disabled ? { "aria-disabled": true } : {};
    return _jsxs(Stack, { "data-hjm-media-item": id, gap: "xs", children: [item.preview, _jsx(UploadItem, { descriptor: item.descriptor, labels: labels, onRetry: onRetry, onCancel: onCancel }), _jsxs(Stack, { axis: "inline", gap: "xs", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Button, { "data-media-action": "up", "aria-label": moveUpLabel(item), size: "small", tone: "ghost", disabled: index === 0, ...lock, onClick: () => onMove(id, -1), children: actionLabels.moveUp }), _jsx(Button, { "data-media-action": "down", "aria-label": moveDownLabel(item), size: "small", tone: "ghost", disabled: index === count - 1, ...lock, onClick: () => onMove(id, 1), children: actionLabels.moveDown }), rotate ? _jsx(Button, { "data-media-action": "rotate", "aria-label": rotate.itemLabel(item), size: "small", tone: "ghost", ...lock, onClick: () => rotate.onRotate(id), children: rotate.label }) : null, _jsx(Button, { "data-media-action": "remove", "aria-label": removeLabel(item), size: "small", tone: "ghost", ...lock, onClick: () => onRemove(id), children: actionLabels.remove })] })] });
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({ library, selectionSummary, items, add, done, labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, rotate, disabled, ...screen }) {
    const itemActions = { labels, actionLabels, removeLabel, moveUpLabel, moveDownLabel, onRemove, onMove, onRetry, onCancel, ...(rotate === undefined ? {} : { rotate }), ...(disabled === undefined ? {} : { disabled }) };
    const grid = useRef(null), addButton = useRef(null);
    const focusedItem = useRef(null);
    useLayoutEffect(() => {
        const previous = focusedItem.current, host = grid.current;
        if (!previous)
            return;
        const active = document.activeElement;
        if (!host) {
            focusedItem.current = null;
            // Empty-state replacement unmounts the grid; the ordinary last-removal
            // destination still applies. Other state/library replacements own their focus.
            if (!previous.node.isConnected && !items.length && screen.state?.kind === "empty" && library == null
                && (active === document.body || active === previous.body) && !addButton.current?.disabled)
                addButton.current?.focus({ preventScroll: true });
            return;
        }
        const index = items.findIndex(item => item.descriptor.id === previous.id), moved = index >= 0 && index !== previous.index;
        if (index >= 0)
            previous.index = index;
        const reveal = (node) => {
            const body = previous.body;
            if (!body?.contains(node) || body.dataset.scroll !== "screen")
                return;
            const bounds = node.getBoundingClientRect(), clip = body.getBoundingClientRect();
            // Scroll only the owned body, by the minimum needed to keep the action visible.
            if (bounds.top < clip.top)
                body.scrollTop += Math.floor(bounds.top - clip.top);
            else if (bounds.bottom > clip.bottom)
                body.scrollTop += Math.ceil(bounds.bottom - clip.bottom);
        };
        const disabled = previous.node.matches(":disabled");
        if (active !== document.body && active !== previous.body && !(active === previous.node && disabled)) {
            if (active === previous.node && moved)
                reveal(previous.node);
            return;
        }
        // A keyed reorder may detach a focused node; a boundary move may disable it.
        // Recover only focus owned by this grid, after the product accepts the change.
        const id = index < 0 ? items[Math.min(previous.index, items.length - 1)]?.descriptor.id : previous.id;
        const row = Array.from(host.querySelectorAll("[data-hjm-media-item]")).find(node => node.dataset.hjmMediaItem === id);
        const target = index >= 0 && previous.node.isConnected && !disabled ? previous.node
            : row?.querySelector(index < 0 ? '[data-media-action="remove"]' : 'button[data-media-action]:not(:disabled)')
                ?? (!addButton.current?.disabled ? addButton.current : null);
        focusedItem.current = null;
        if (target) {
            target.focus({ preventScroll: true });
            reveal(target);
        }
    });
    return _jsx(ScreenLayout, { ...screen, ...(add || screen.actions ? { actions: _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [screen.actions, add ? _jsx(Action, { action: add, buttonRef: addButton, edge: "end" }) : null] }) } : {}), footer: _jsxs(Stack, { gap: "sm", children: [selectionSummary, _jsx(Action, { action: done })] }), children: library ?? _jsx(Grid, { ref: grid, columns: { compact: 2, expanded: 3 }, gap: { compact: "md" }, onFocusCapture: event => {
                const node = event.target, row = node.closest("[data-hjm-media-item]");
                const id = row?.dataset.hjmMediaItem;
                if (id !== undefined)
                    focusedItem.current = { node, id, index: items.findIndex(item => item.descriptor.id === id), body: node.closest(".hjm-screen__body") };
            }, onBlurCapture: event => {
                const node = event.target;
                // Explicit blur/outside focus relinquishes ownership; DOM removal and a newly
                // disabled move button retain it until the layout effect chooses a successor.
                if (event.relatedTarget ? !event.currentTarget.contains(event.relatedTarget) : node.isConnected && !node.matches(":disabled"))
                    focusedItem.current = null;
            }, children: items.map((item, index) => _jsx(MediaSelectionCell, { item: item, index: index, count: items.length, ...itemActions }, item.descriptor.id)) }) });
}
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
    return _jsxs(Stack, { gap: "xl", children: [legacy, recent && visible.length ? _jsxs(Stack, { gap: "sm", ref: hostRef, children: [_jsxs(Stack, { axis: "inline", justify: "between", align: "center", gap: "sm", children: [_jsx(Heading, { level: "level5", semanticLevel: 2, children: recent.title }), _jsx(Button, { tone: "ghost", size: "small", edge: "end", onClick: onClearAll, children: recent.clearAllLabel })] }), _jsx(Stack, { gap: "xxs", children: visible.map((item, index) => _jsx(ListRow, { density: "compact", leading: recent.icon, title: item, onClick: () => onCommit(item), trailingAction: _jsx(IconButton, { "data-search-recent-remove": "", label: recent.removeLabel(item), tone: "ghost", edge: "end", onClick: () => onRemove(item, index), children: recent.removeIcon ?? "×" }) }, item)) })] }) : null, suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null] });
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
    const showCount = summary && cause === "none" && summary.countVisibility !== "hidden";
    // A count-free search still owns its sorting action; do not hide it with the total.
    const showSort = summary && cause === "none" && sort;
    if (!summary?.notice && !showCount && !showSort && !applied?.items.length)
        return null;
    // The sort trigger ends the count row: edge="end" puts its chevron on the gutter like the count text starts on it
    // (2026-10-17 measured audit: chevron 29 from the edge against 16).
    return _jsxs(Stack, { gap: "sm", children: [summary?.notice, showCount || showSort ? _jsxs(Stack, { axis: "inline", justify: showCount ? "between" : "end", align: "center", gap: "sm", wrap: true, children: [showCount ? (summary.count === null ? _jsx(Skeleton, { shape: "text", width: "30%" }) : _jsx(Text, { tone: "muted", children: summary.countLabel(summary.count) })) : null, sort ? _jsx(Menu, { presentation: "anchored", label: sort.label, align: "end", selectionMode: "single", value: sort.value, onValueChange: onSortChange, items: sort.options.map(option => ({ id: option.id, label: option.label })), trigger: _jsx(Button, { size: "small", tone: "ghost", edge: "end", ...(sort.icon === undefined ? {} : { trailing: sort.icon }), children: sort.triggerLabel }) }) : null] }) : null, applied?.items.length ? _jsxs(Stack, { ref: appliedHost, axis: "inline", wrap: true, gap: "xs", align: "center", children: [applied.items.map((item, index) => _jsx(Chip, { "data-search-applied-filter": "", label: item.label, "aria-label": applied.removeLabel(item.label), trailing: applied.removeIcon ?? _jsx("span", { "aria-hidden": "true", children: "\u00D7" }), onPress: () => onRemove(item.key, index) }, item.key)), _jsx(Button, { tone: "ghost", size: "small", onClick: onClearAll, children: applied.clearAllLabel })] }) : null] });
}
function SearchResultsBody({ summary, applied, suggested, cause, onCommit, onClearAll, children }) {
    // Loading keeps each row's own height (ListRow `loading`), so the list does not jump when results land.
    if (summary?.count === null)
        return _jsx(Stack, { gap: "xxs", children: Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) => _jsx(ListRow, { loading: true, title: "", description: summary.loadingLabel, ...(index === 0 ? { loadingLabel: summary.loadingLabel } : {}) }, index)) });
    if (cause === "none" || !summary?.empty)
        return _jsx(_Fragment, { children: children });
    return _jsxs(Stack, { gap: "lg", children: [_jsx(EmptyState, { density: "compact", title: summary.empty.title, ...(summary.empty.description === undefined ? {} : { description: summary.empty.description }), ...(cause === "filters" && applied ? { action: _jsx(Button, { tone: "secondary", onClick: onClearAll, children: applied.clearAllLabel }) } : {}) }), cause === "query" && suggested?.items.length ? _jsx(SearchSuggestedChips, { suggested: suggested, onCommit: onCommit }) : null, children] });
}
function SearchFilterTrigger({ sheet, appliedCount, triggerRef }) {
    const trigger = sheet.trigger;
    return _jsx(Chip, { ref: triggerRef, label: trigger.label(appliedCount), "aria-label": trigger.accessibilityLabel(appliedCount), "aria-haspopup": "dialog", layoutStyle: { alignSelf: "center" }, ...(trigger.icon === undefined ? {} : { leading: trigger.icon }), onPress: () => sheet.onOpenChange(true) });
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
    const footer = _jsxs(Stack, { axis: "inline", justify: "end", gap: "xs", wrap: true, children: [_jsx(Button, { tone: "secondary", disabled: sheet.isDefault(draft), onClick: () => setDraft(sheet.reset(draft)), children: sheet.labels.reset }), _jsx(Button, { disabled: count === 0, onClick: () => { sheet.onApply(draft); sheet.onOpenChange(false); }, children: sheet.labels.apply(count) })] });
    return _jsx(Sheet, { open: sheet.open, onOpenChange: open => sheet.onOpenChange(open), title: sheet.title, closeLabel: sheet.labels.close, placement: session?.side ? "end" : "bottom", size: sheet.size ?? "large", footer: footer, children: sheet.renderContent(draft, setDraft) });
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
    // Two-step search shows the rail only beside results; a query-caused zero hides narrowing filters (none can fix it)
    // but keeps scope filters, which are that zero's recovery (resolveSearchFilterRailVisible, Native twin).
    const showRail = resolveSearchFilterRailVisible(phase, committedQuery !== undefined, cause, filtersRole);
    const trigger = filterSheet?.trigger ? _jsx(SearchFilterTrigger, { sheet: filterSheet, appliedCount: appliedCount, triggerRef: focus.filterTrigger }) : null;
    const rail = !showRail ? null : trigger && filters != null ? _jsxs(Stack, { axis: "inline", align: "center", gap: "xs", wrap: filtersOverflow === "wrap", children: [trigger, filters] }) : trigger ?? filters;
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
    // Search-first routes have no visible heading: navigation and input share one row.
    // Keep explicit host headers and described/titled screens in their existing layout.
    const inlineNavigation = !embedded && screen.titleVisibility === "hidden" && screen.header == null;
    const searchInput = queryField ?? _jsx(SearchField, { ...labelProps, clearLabel: queryClearLabel, value: query, onValueChange: onQueryChange, loading: searching ?? false, ...submitProps });
    const queryRow = inlineNavigation ? _jsxs(Stack, { axis: "inline", align: "center", gap: "sm", children: [screen.exit ? _jsx(ScreenExitButton, { ...screen.exit }) : null, _jsx("div", { style: { flex: 1, minWidth: 0 }, children: searchInput }), screen.actions] }) : searchInput;
    // The query field is the search screen's primary input (2026-10-18 entry focus).
    // Empty results belong to the visible body below the pinned query/filter/map region.
    // Reuse ScreenLayout's centering contract rather than giving EmptyState an arbitrary top inset.
    const centerResults = phase === "results" && cause !== "none" && resultSummary?.empty !== undefined;
    const notice = _jsxs(Stack, { gap: "sm", ref: fieldHost, children: [queryRow, filterSlot, screen.notice] });
    const results = _jsxs(Stack, { gap: "lg", ref: bodyHost, className: "hjm-search-screen__results", tabIndex: -1, justify: embedded && centerResults ? "center" : "start", style: { ...(embedded || screen.scroll === "content" ? { flex: 1, minHeight: 0 } : {}), ...(embedded ? { overflowY: screen.scroll === "content" ? "hidden" : "auto" } : {}) }, children: [suggestions || resultSummary || searchingLabel ? _jsx(SearchAnnouncement, { text: announcement }) : null, body] });
    // A sheet already owns the title, exit, focus scope and outer scroll boundary. Reuse the same input/state/results
    // anatomy without adding a nested screen; the result host alone scrolls below the pinned query.
    return _jsxs(_Fragment, { children: [embedded ? _jsx("div", { className: "hjm-search-screen--embedded", children: _jsx(CompositionLayout, { notice: notice, ...(screen.state === undefined ? {} : { state: screen.state }), stateAction: screen.stateAction, loadingIndicator: screen.loadingIndicator, footer: screen.footer, layoutStyle: { flex: 1, ...screen.layoutStyle }, children: results }) })
                : _jsx(ScreenLayout, { ...screen, contentAlignment: phase === "results" && cause !== "none" && resultSummary?.empty ? "center" : screen.contentAlignment ?? "start", initialFocus: initialFocus, ...(inlineNavigation ? { header: _jsx(_Fragment, {}) } : {}), notice: notice, children: results }), filterSheet ? _jsx(SearchFilterSheetView, { sheet: filterSheet }) : null] });
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
export function OnboardingScreen({ steps, index, onIndexChange, nextLabel, backLabel, complete, skip, progressLabel, exit, layoutStyle }) {
    const position = resolveOnboardingStep(steps.length, index);
    const step = steps[index];
    // Completion and skip persist the same flow: keep navigation stable until the receipt.
    const host = useRef(null);
    // ScreenLayout owns this scroll region; keep focus while resetting each new step.
    useLayoutEffect(() => { const body = host.current?.querySelector(".hjm-screen__body"); if (body)
        body.scrollTop = 0; }, [index]);
    const pending = !!(complete.pending || skip?.pending);
    return _jsx("div", { ref: host, style: { display: "contents" }, children: _jsx(ScreenLayout, { ...(layoutStyle === undefined ? {} : { layoutStyle }), title: step.title, description: step.description, ...(exit ? { exit: { ...exit, disabled: !!(exit.disabled || pending) } } : {}), actions: skip ? _jsx(Action, { action: { ...skip, disabled: !!(skip.disabled || pending) }, secondary: true }) : null, notice: _jsx(Text, { variant: "caption", tone: "muted", children: progressLabel(index + 1, steps.length) }), footer: _jsxs(Stack, { gap: "xs", children: [_jsx(Action, { action: position.last ? { ...complete, disabled: !!(complete.disabled || pending) } : { label: nextLabel, disabled: pending, onAction: () => onIndexChange(index + 1) } }), !position.first ? _jsx(Action, { action: { label: backLabel, disabled: pending, onAction: () => onIndexChange(index - 1) }, secondary: true }) : null] }), children: step.content }) });
}
/** Quiet secondary actions (reply, expand) read as muted copy beside the body, not as filled buttons. */
function CommentTextAction({ label, onPress, disabled = false, expanded }) {
    return _jsx("button", { type: "button", className: "hjm-comment-row__action", disabled: disabled, "aria-expanded": expanded, onClick: onPress, children: label });
}
/** Vertical dots drawn in the icon grid, matching Native's drawn glyph (the semantic `more` icon is horizontal). */
function CommentMenuGlyph() { const size = commentThreadRecipe.menuGlyphSize; return _jsx("svg", { "aria-hidden": "true", focusable: "false", width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", children: [5, 12, 19].map(y => _jsx("circle", { cx: "12", cy: y, r: "1.75" }, y)) }); }
function CommentMenuButton({ item, menu, items }) {
    const label = menu.label(item);
    return _jsx(Menu, { presentation: menu.presentation ?? "anchored", ...(menu.dismissLabel === undefined ? {} : { dismissLabel: menu.dismissLabel }), label: label, align: "end", trigger: _jsx(IconButton, { label: label, tone: "ghost", size: commentThreadRecipe.actionButtonSize, children: _jsx(CommentMenuGlyph, {}) }), items: items.map(entry => ({ id: entry.id, label: entry.label, textValue: entry.label, ...(entry.tone === undefined ? {} : { tone: entry.tone }), ...(entry.disabled === undefined ? {} : { disabled: entry.disabled }) })), onActionAfterDismiss: id => menu.onAction(item, id) });
}
/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }) {
    validateMediaSetChoice(item.media != null, item.mediaAlbum !== undefined);
    const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(item.mediaAlbum);
    // bodyText inlines the author, so its time always moves under the body; rich bodies opt in with timePlacement.
    const timeInActions = item.bodyText !== undefined || item.timePlacement === "actions";
    const avatarSize = item.parentId === null ? commentThreadRecipe.avatarSize : commentThreadRecipe.replyAvatarSize;
    const canReply = item.canReply ?? item.parentId === null;
    const menuItems = commentMenu ? resolveCommentMenuItems(commentMenu.items(item)) : [];
    const time = item.timeLabel ? _jsx("time", { className: "hjm-comment-row__time", dateTime: item.timeDateTime, children: _jsx(Text, { variant: "caption", tone: "muted", children: item.timeLabel }) }) : null;
    // The like count sits under the heart so the text column carries only identity, body and reply.
    return _jsxs(Stack, { axis: "inline", align: "start", gap: "xs", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [item.avatar ? _jsx("div", { className: "hjm-comment-row__avatar", style: { inlineSize: item.avatarAction ? iconButtonRecipe.sizes.medium.diameter : avatarSize }, children: item.avatarAction ? _jsx(IdentityAction, { action: item.avatarAction, children: item.avatar }) : item.avatar }) : null, _jsxs("div", { className: "hjm-comment-row__text", style: { gap: commentThreadRecipe.lineGap }, children: [(() => {
                        const identity = _jsxs(_Fragment, { children: [item.bodyText !== undefined ? (item.authorBadge ? _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [_jsx(Text, { emphasis: "strong", children: item.author }), item.authorBadge, _jsx(Text, { children: item.bodyText })] }) : _jsxs(Text, { children: [_jsx(Text, { emphasis: "strong", children: item.author }), " ", item.bodyText] })) : (item.author || item.authorBadge || (item.timeLabel && !timeInActions)) ? _jsxs(Stack, { axis: "inline", gap: "xxs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [item.author ? _jsx(Text, { variant: "caption", emphasis: "strong", children: item.author }) : null, item.authorBadge, timeInActions ? null : time] }) : null, item.body, item.media ? _jsx("div", { className: "hjm-comment-row__media", style: { inlineSize: commentThreadRecipe.mediaMaxWidth, maxInlineSize: "100%", borderRadius: commentThreadRecipe.mediaRadius }, children: item.media }) : null] });
                        return item.reactions ? _jsx(MessageReactions, { ...item.reactions, ...((item.canReply ?? item.parentId === null) && !item.replyDisabled ? { replyAction: { label: replyLabel, onPress: () => onReply(item.id), ...(item.reactions.replyIcon === undefined ? {} : { icon: item.reactions.replyIcon }) } } : {}), triggerClassName: "hjm-comment-row__reactions", children: identity }) : identity;
                    })(), item.mediaAlbum ? _jsx(MediaAlbumView, { className: "hjm-comment-row__album", album: item.mediaAlbum, index: albumIndex, onIndexChange: setAlbumIndex, width: commentThreadRecipe.mediaMaxWidth, radius: commentThreadRecipe.mediaRadius }) : null, (timeInActions && time) || canReply || item.reactionSummary ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [timeInActions ? time : null, item.reactionSummary, canReply ? _jsx(CommentTextAction, { label: replyLabel, disabled: item.replyDisabled ?? false, onPress: () => onReply(item.id) }) : null] }) : null, item.panel != null ? _jsx("div", { className: "hjm-comment-row__panel", style: { marginBlockStart: commentThreadRecipe.panelGap - commentThreadRecipe.lineGap }, children: item.panel }) : null] }), _jsxs("div", { className: "hjm-comment-row__like", ...(menuItems.length || item.actions == null && item.likeAction === undefined ? { "data-edge": "end" } : {}), style: { "--hjm-comment-anchor-line": `var(--hjm-type-${item.bodyText !== undefined ? commentThreadRecipe.actionAnchor.inlineTextVariant : commentThreadRecipe.actionAnchor.authorTextVariant}-line-height)` }, children: [_jsxs(Stack, { axis: "inline", style: { gap: 0 }, align: "center", layoutStyle: { flexShrink: 0 }, children: [item.likeAction !== undefined ? item.likeAction : _jsx(IconButton, { label: item.likeLabel, tone: "ghost", size: commentThreadRecipe.actionButtonSize, onClick: () => onLike(item.id), children: item.likeIcon }), item.actions, commentMenu && menuItems.length ? _jsx(CommentMenuButton, { item: item, menu: commentMenu, items: menuItems }) : null] }), item.likeCountLabel ? _jsx("div", { className: "hjm-comment-row__like-count", style: { inlineSize: commentThreadRecipe.likeColumnWidth }, children: _jsx(Text, { variant: "caption", tone: "muted", children: item.likeCountLabel }) }) : null] })] }, item.id);
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
    return _jsx(ScreenLayout, { ...screen, footer: !screen.state || screen.state.kind === "ready" || screen.state.kind === "empty" ? composer : null, children: _jsxs(Stack, { gap: "lg", children: [threadHeader, _jsx("div", { className: "hjm-comment-thread", style: { gap: commentThreadRecipe.rowGap }, children: roots.map(item => { const replies = repliesByParent.get(item.id) ?? []; const total = item.repliesCount; if (total !== undefined && (!Number.isSafeInteger(total) || total < 0))
                        throw new RangeError("CommentThreadItem repliesCount must be nonnegative"); const count = Math.max(replies.length, total ?? 0); return _jsxs("div", { className: "hjm-comment-thread", style: { gap: commentThreadRecipe.rowGap }, children: [row(item), count || item.repliesNotice || item.repliesFooter ? _jsxs("div", { className: "hjm-comment-thread", style: { gap: commentThreadRecipe.rowGap, marginInlineStart: commentThreadRecipe.replyIndent }, children: [_jsx(CommentTextAction, { label: repliesLabel(count, expanded.has(item.id)), expanded: expanded.has(item.id), onPress: () => onExpandedChange(item.id) }), expanded.has(item.id) ? _jsxs(_Fragment, { children: [item.repliesNotice, (() => { if (!moreRepliesLabel)
                                                return replies.map(row); const visible = openedReplies[item.id] ?? commentThreadRecipe.replyPageSize; const page = resolveCommentReplyPage({ loaded: replies.length, total: count, visible, revealIndex: replies.findIndex(reply => reply.id === revealedReplyId), canFetch: item.repliesPage !== undefined }); return _jsxs(_Fragment, { children: [replies.slice(0, page.shown).map(row), page.more ? _jsx(CommentTextAction, { label: moreRepliesLabel(page.remaining), disabled: page.more === "fetch" && !!item.repliesPage?.pending, onPress: () => { setOpenedReplies(current => ({ ...current, [item.id]: page.shown + commentThreadRecipe.replyPageSize })); if (page.more === "fetch")
                                                            item.repliesPage?.onLoadMore(); } }) : null] }); })(), item.repliesFooter] }) : null] }) : null] }, item.id); }) }), threadFooter] }) });
}
/** Profile identity and counts are common; routing and mutations stay controlled by the product. */
// Fragments group JSX without creating an action cell; menus remain one cell.
function profileActionItems(actions) {
    return Children.toArray(actions).flatMap(action => isValidElement(action) && action.type === Fragment
        ? profileActionItems(action.props.children)
        : [action]);
}
export function ProfileSummary({ name, headingLevel = 2, avatar, badge, nameActions, nameEdit, stats = [], actions, actionsLayout = "inline", children }) {
    const actionLayout = profileSummaryRecipe.actionsLayouts[actionsLayout];
    const edit = useContext(ProfileEditContext);
    const { tone: editTone, size: editSize } = profileSummaryRecipe.editAction;
    const editButton = edit ? _jsx(Button, { tone: editTone, size: editSize, disabled: !!(edit.disabled || edit.pending), loading: edit.pending ?? false, onClick: edit.onAction, children: edit.label }) : null;
    const nameEditButton = nameEdit ? _jsx(IconButton, { label: nameEdit.label, title: nameEdit.label, tone: "ghost", size: profileSummaryRecipe.nameEdit.size, disabled: !!(nameEdit.disabled || nameEdit.pending), onClick: nameEdit.onAction, children: nameEdit.icon ?? _jsx(Icon, { name: profileSummaryRecipe.nameEdit.icon, size: "sm" }) }) : null;
    return _jsxs(CompositionLayout, { title: name, headingLevel: headingLevel, leading: _jsx("span", { style: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: profileSummaryRecipe.avatarGlyphSize, lineHeight: 1, width: profileSummaryRecipe.avatarSize, height: profileSummaryRecipe.avatarSize, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }, children: avatar }), badge: badge, actions: nameEdit || nameActions ? _jsxs(_Fragment, { children: [nameEditButton, nameActions] }) : undefined, footer: children, children: [stats.length ? _jsx(Stack, { axis: "inline", gap: "md", align: "stretch", layoutStyle: { width: "100%" }, children: stats.map(stat => _jsx(Stack, { gap: "xxs", align: "center", justify: "center", layoutStyle: { flex: 1, minWidth: 0 }, children: stat.onPress ? _jsx(Button, { tone: "ghost", "aria-label": `${stat.value} ${stat.label}`, disabled: stat.disabled ?? false, onClick: stat.onPress, layoutStyle: { width: "100%" }, children: _jsxs(Stack, { gap: "xxs", align: "center", children: [_jsx(Text, { emphasis: "strong", children: stat.value }), _jsx(Text, { variant: "caption", tone: "muted", children: stat.label })] }) })
                        : _jsxs(_Fragment, { children: [_jsx(Text, { emphasis: "strong", children: stat.value }), _jsx(Text, { variant: "caption", tone: "muted", children: stat.label })] }) }, stat.id)) }) : null, editButton || actions ? actionsLayout === "equal" ? (_jsx(Grid, { columns: { compact: Math.max(1, profileActionItems([editButton, actions]).length) }, gap: { compact: actionLayout.gap }, layoutStyle: { width: "100%" }, children: profileActionItems([editButton, actions]) })) : _jsxs(Stack, { axis: actionLayout.axis, gap: actionLayout.gap, wrap: actionsLayout === "inline", layoutStyle: { width: "100%" }, children: [editButton, actions] }) : null] });
}
//# sourceMappingURL=screen-flows.js.map