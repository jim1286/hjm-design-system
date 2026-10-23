"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cornerAccessoryPlacements } from "@hjmds/design-contracts/recipes";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe, initialFocusDefaults } from "@hjmds/design-contracts/screen-patterns";
import { BottomEntryFocusBoundary, InitialFocusScope } from "./internal/initial-focus.js";
import { iconButtonRecipe, listRowRecipe } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions, ReactionSummaryButton, ReactionSummaryText, omitReactionSummary } from "./internal/message-reactions.js";
import { MediaAlbumView, useMediaAlbumIndex } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
// Loading/failed page rendered inside `mediaAlbum.renderPage` (2026-10-18); comment rows use the same component.
export { MediaAlbumPageStatus } from "./internal/media-album.js";
import { Button, IconButton } from "./actions.js";
import { useOptionalHjmTheme } from "./provider.js";
import { TextArea } from "./forms.js";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, resolveCompositionStateMinHeight, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, resolveChatReactionSummary, typingIndicatorRecipe, chatDateSeparatorRecipe, screenHeaderRecipe, validateScreenExit } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";
import { Section, Stack, Text, VisuallyHidden } from "./layout.js";
import { ListRow } from "./display.js";
import { classNames, useDesignProfileDefaults } from "./internal.js";
/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, titleBadge, titleLeading, titleVisibility = "visible", headerAlignment = "center", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, loadingIndicator, children, scroll = "screen", as: Element = "main", className, layoutStyle, initialFocus = initialFocusDefaults.screen }) {
    const id = useId();
    if (exit)
        validateScreenExit(exit, false);
    const leading = exit ? _jsx(ScreenExitButton, { ...exit }) : null;
    const hasMark = titleLeading !== undefined && titleLeading !== null && titleLeading !== false;
    const showHeader = titleVisibility === "visible" || hasMark || !!leading || !!actions;
    // Same header band as Native (screenHeaderRecipe): a fixed 52 band (48 icon-only) so the title sits at the same
    // height with or without exit/actions buttons (2026-10-17: Web grew 58→76 when a 44 button was present).
    const compactHeader = header == null && headerAlignment === "center" && titleVisibility === "hidden" && !hasMark;
    // Screens historically work with the stylesheet alone. Optional context keeps
    // that path while inheriting profiles from an enclosing Provider when present.
    const designProfile = useDesignProfileDefaults();
    const presentation = suppliedPresentation ?? designProfile?.screens.overview;
    const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
    const resolved = resolveScreenContentState(state);
    // Replacement text owns scrolling even when the ready state delegates it to
    // a virtual list. Use the rendered mode for keyboard access as well as CSS.
    const bodyScroll = resolved.replacesContent ? "screen" : scroll;
    const bodyRef = useRef(null);
    const lastBodyFocus = useRef(null);
    useLayoutEffect(() => {
        // Replacing a focused retry/input removes its DOM node. Keep keyboard users
        // in the same content region without stealing focus moved to another control.
        // The body is a landing target here, not a control the user moved to, so it is marked to draw no ring while it
        // holds this recovered focus (as the search results landing). The mark clears on blur: a later Tab to the region
        // shows the HJM focus ring (2026-10-23 web check: the browser's default ring outlined the whole body).
        const previous = lastBodyFocus.current;
        const body = bodyRef.current;
        if (body && previous && !previous.isConnected && document.activeElement === document.body) {
            body.setAttribute("data-focus-landing", "");
            body.focus({ preventScroll: true });
        }
        if (previous && !previous.isConnected)
            lastBodyFocus.current = null;
    });
    const recipe = screenPatternRecipe;
    // The mark is decorative beside a visible title; standing alone it becomes the heading, named by `title`.
    const mark = hasMark ? _jsx("span", { className: "hjm-screen__title-leading", "aria-hidden": "true", children: titleLeading }) : null;
    const titleRow = (level, justify) => titleVisibility === "visible"
        ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: justify, wrap: true, children: [mark
                    // A mark labels its title: one non-wrapping group whose heading shrinks and wraps beside the mark. In the wrapping
                    // row the heading's max-content basis dropped a long title under a lone mark (2026-10-23, as CompositionLayout).
                    ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexShrink: 1, minWidth: 0, maxWidth: "100%" }, children: [mark, _jsx(Heading, { level: level, semanticLevel: 1, id: id, layoutStyle: { minWidth: 0 }, children: title })] })
                    : _jsx(Heading, { level: level, semanticLevel: 1, id: id, children: title }), titleBadge] })
        : mark ? _jsx("div", { role: "heading", "aria-level": 1, "aria-label": title, style: { display: "flex", justifyContent: justify === "center" ? "center" : "flex-start" }, children: mark }) : null;
    return _jsx(Element, { "aria-labelledby": header || titleVisibility === "hidden" ? undefined : id, "aria-label": header || titleVisibility === "hidden" ? title : undefined, "data-content-inset": contentInset, "data-presentation": presentation, className: classNames("hjm-screen", className), style: { backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle }, children: _jsxs(InitialFocusScope, { mode: initialFocus, children: [header ?? (showHeader ? headerAlignment === "center" ? _jsxs("header", { className: "hjm-screen__header", style: { display: "grid", gridTemplateColumns: "1fr minmax(0, auto) 1fr", alignItems: "center", boxSizing: "border-box", minBlockSize: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingBlock: compactHeader ? screenHeaderRecipe.compactPaddingVertical : screenHeaderRecipe.paddingVertical }, children: [_jsx("div", { children: leading }), _jsx("div", { className: "hjm-screen__heading", style: { textAlign: "center", minWidth: 0 }, children: titleRow(screenHeaderRecipe.centeredTitleLevel, "center") }), _jsx("div", { style: { justifySelf: "end", display: "flex", alignItems: "center", gap: topBarRecipe.gap }, children: actions })] }) : _jsxs("header", { className: "hjm-screen__header", style: profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined, children: [leading, _jsx("div", { className: "hjm-screen__heading", children: titleRow(screenHeaderRecipe.titleLevel, profileLayout?.centered ? "center" : "start") }), _jsx("div", { style: { display: "flex", alignItems: "center", gap: topBarRecipe.gap }, children: actions })] }) : null), notice ? _jsx("div", { className: "hjm-screen__notice", children: notice }) : null, _jsx("div", { ref: bodyRef, role: "region", "aria-label": title, tabIndex: bodyScroll === "content" ? -1 : 0, onFocusCapture: event => { lastBodyFocus.current = event.target; }, onBlurCapture: event => {
                        if (event.target === event.currentTarget)
                            event.currentTarget.removeAttribute("data-focus-landing");
                        // A connected input blurred to the document intentionally relinquishes
                        // focus too; only removal of the currently focused node needs recovery.
                        if (event.relatedTarget ? !event.currentTarget.contains(event.relatedTarget) : event.target.isConnected) {
                            lastBodyFocus.current = null;
                        }
                    }, className: "hjm-screen__body", "data-content-alignment": contentAlignment, "data-scroll": bodyScroll, "data-replacement": resolved.replacesContent || undefined, "aria-busy": resolved.busy || undefined, children: state.kind === "ready" ? (contentAlignment === "center" ? _jsx("div", { className: "hjm-screen__centered-content", children: children }) : children) : _jsxs("div", { className: "hjm-screen__state", children: [resolved.busy ? (loadingIndicator ? _jsx("div", { role: "status", "aria-busy": "true", "aria-label": [state.title, state.description].filter(Boolean).join(". "), children: _jsx("div", { "aria-hidden": "true", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsx("div", { role: state.kind === "error" ? "alert" : "status", children: _jsxs(Stack, { gap: "sm", align: "center", children: [_jsx(Text, { variant: resolved.titleVariant, children: state.title }), state.description ? _jsx(Text, { tone: "muted", children: state.description }) : null] }) }), stateAction] }) }), footer ? _jsx("footer", { className: "hjm-screen__footer", children: _jsx(ScreenFooterContext.Provider, { value: contentInset === "none" ? null : { bottomPadding: "max(var(--hjm-screen-padding), env(safe-area-inset-bottom, 0px))" }, children: _jsx(BottomEntryFocusBoundary, { children: footer }) }) }) : null] }) });
}
/**
 * Style for a product scroller that owns the body with `scroll="content"`: it reaches across the body gutter
 * (`--hjm-screen-body-inline`) and pads it back, so items stay on the gutter while the clip moves to the screen edges and
 * a bleeding CollectionRail inside scrolls edge to edge (same name and shape as Native; spint home 2026-10-17).
 * Outside a screen body the variable is unset and the room is 0; CSS resolves the distance, so no context is read.
 */
export function useScreenBodyScrollRoom() {
    return { style: { marginInline: "calc(-1 * var(--hjm-screen-body-inline, 0px))", paddingInline: "var(--hjm-screen-body-inline, 0px)" } };
}
export function SettingsScreen({ profile, sections, ...props }) {
    // Keep semantic section headings while using the smaller settings label role.
    return _jsx(ScreenLayout, { ...props, children: _jsxs(Stack, { gap: "md", children: [profile, sections.map(section => _jsx(Section, { className: "hjm-settings-section", title: _jsx(Text, { variant: "label", emphasis: "strong", tone: "muted", children: section.title }), description: section.description, children: section.children }, section.id))] }) });
}
export function NotificationInboxScreen({ filters, children, notice, ...props }) {
    return _jsx(ScreenLayout, { ...props, notice: _jsxs(Stack, { gap: "sm", children: [notice, filters] }), children: children });
}
export function NotificationItem({ read, statusLabel, timestamp, description, unreadLabel, title, className, ...props }) {
    if (unreadLabel !== undefined && unreadLabel.trim().length === 0)
        throw new TypeError("NotificationItem unreadLabel must not be empty");
    const meta = _jsxs(Text, { variant: "caption", tone: "muted", children: [statusLabel, " \u00B7 ", timestamp] });
    const dot = !read && unreadLabel !== undefined
        ? _jsx("span", { role: "img", "aria-label": unreadLabel, "data-hjm-unread-dot": "true", style: { inlineSize: notificationRecipe.unreadSize, blockSize: notificationRecipe.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" } })
        : null;
    return _jsx(ListRow, { ...props, className: classNames("hjm-notification-item", className), "data-unread": !read || undefined, title: _jsx(Text, { variant: listRowRecipe.title.textVariant, emphasis: read ? "regular" : "strong", children: title }), description: _jsxs(Stack, { gap: "xxs", children: [description, dot ? _jsxs("span", { style: { display: "flex", alignItems: "center", gap: notificationRecipe.contentGap }, children: [meta, dot] }) : meta] }) });
}
/** Caller supplies a virtualized timeline and keyboard-aware composer; no implicit auto-scroll or send. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", ...props }) {
    // An empty conversation must still allow its first message; unavailable states hide input.
    const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
    // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
    // Conversations center the peer between back and tools and use the measured 10px timeline gutter (2026-10-16).
    return _jsx(ScreenLayout, { ...props, className: classNames("hjm-chat-screen", props.className) ?? "hjm-chat-screen", titleLeading: avatar, scroll: scroll, footer: showComposer ? _jsxs("div", { className: "hjm-chat-screen__footer", children: [jumpToLatest ? _jsx("div", { className: "hjm-chat-screen__jump", children: _jsx(IconButton, { label: jumpToLatest.label, size: "small", shape: "circle", tone: "secondary", onClick: jumpToLatest.onPress, children: jumpToLatest.icon }) }) : null, composer] }) : null });
}
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, descriptionAlign = "start", error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }) {
    validateMessageAttachments(attachments);
    if (attachments.length && !onRemoveAttachment)
        throw new TypeError("Attachments require a removal callback");
    if (lengthFeedback && maxLength === undefined)
        throw new TypeError("Composer length feedback requires maxLength");
    const limit = !lengthFeedback ? null : resolveComposerLimit(value, maxLength, lengthFeedback.threshold);
    const canSend = !sendDisabled && !limit?.exceeded && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
    const locked = disabled || pending;
    const sendDiameter = iconButtonRecipe.sizes[sendPresentation === "circle" ? "small" : "medium"].diameter;
    // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
    const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
    const attach = attachmentAction ? _jsx(IconButton, { label: attachmentAction.label, tone: "ghost", disabled: locked || attachmentAction.disabled, onClick: attachmentAction.onPress, children: attachmentAction.icon }) : null;
    const send = sendIcon ? _jsx(IconButton, { label: sendLabel, size: sendPresentation === "circle" ? "small" : "medium", shape: "circle", tone: sendPresentation === "circle" ? "primary" : "ghost", disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendIcon }) : _jsx(Button, { disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendLabel });
    // Readonly pending input preserves the keyboard/focus for receipt failure recovery; disabling it would blur desktop chat.
    // Enter is opt-in and IME-safe; receipt-driven clearing and failed-send recovery belong to the host.
    const composerBody = _jsxs(_Fragment, { children: [attachments.length ? _jsxs("div", { className: "hjm-message-composer__attachments", children: [attachments.map(item => _jsxs("div", { className: "hjm-message-composer__attachment", children: [_jsx("div", { className: "hjm-message-composer__preview", children: item.preview }), _jsx("span", { className: "hjm-message-composer__remove", children: _jsx(IconButton, { label: item.removeLabel, tone: "ghost", size: "small", disabled: locked || item.disabled, onClick: () => { if (!locked && !item.disabled)
                                        onRemoveAttachment?.(item.id); }, children: _jsx("span", { className: "hjm-message-composer__remove-glyph", "aria-hidden": "true", children: "\u00D7" }) }) })] }, item.id)), attach] }) : null, _jsxs("div", { className: "hjm-message-composer__row", children: [leading ? _jsx("span", { className: "hjm-message-composer__leading", children: leading }) : null, _jsx(TextArea, { ref: inputRef, maxLength: maxLength, leadingAction: leadingAction, shape: "large", rows: screenPatternRecipe.composerMinLines, "aria-label": label, placeholder: placeholder, description: description, error: error, "aria-invalid": invalid || undefined, onBlur: onBlur, value: value, disabled: disabled, readOnly: pending, "aria-busy": pending || undefined, onKeyDown: event => { if (shouldSubmitMessageKey({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing, keyCode: event.nativeEvent.keyCode }, submitMode)) {
                            event.preventDefault();
                            if (canSend)
                                onSend(value);
                        } }, onChange: event => { if (!locked)
                            onValueChange(event.currentTarget.value); }, minVisibleLines: screenPatternRecipe.composerMinLines, maxVisibleLines: screenPatternRecipe.composerMaxLines, ...(sendIcon ? { trailing: _jsx("span", { className: "hjm-message-composer__trailing", style: { minInlineSize: sendDiameter, minBlockSize: sendDiameter }, children: _jsx("span", { className: "hjm-message-composer__visible", children: hasContent || pending ? send : attach }) }) } : {}) }), sendIcon ? null : send] })] });
    const quickRow = quickInserts?.items.length ? _jsx("div", { className: "hjm-message-composer__quick", role: "group", "aria-label": quickInserts.label, style: { "--hjm-quick-size": `${composerQuickInsertRecipe.itemSize}px`, "--hjm-quick-emoji": `${composerQuickInsertRecipe.emojiSize}px` }, children: quickInserts.items.map(item => _jsx("button", { type: "button", className: "hjm-message-composer__quick-item", "aria-label": item.label, disabled: locked, onClick: () => onValueChange(value + item.emoji), children: item.emoji }, item.id)) }) : null;
    // The error is announced by TextArea's shared Field error region (internal/field-error.tsx); no composer-only copy.
    return _jsxs("div", { className: "hjm-message-composer", "data-send-presentation": sendPresentation, "data-description-align": descriptionAlign, style: { "--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle }, children: [context, quickRow, _jsxs("div", { className: "hjm-message-composer__reply-card", "data-replying": replyTo ? true : undefined, children: [replyTo ? _jsxs("div", { className: "hjm-message-composer__reply", children: [_jsxs("div", { className: "hjm-message-composer__reply-text", children: [_jsx(Text, { emphasis: "strong", children: replyTo.author }), _jsx(Text, { variant: "caption", tone: "muted", className: "hjm-message-composer__reply-excerpt", children: replyTo.excerpt })] }), _jsx(IconButton, { label: replyTo.cancelLabel, tone: "secondary", size: "small", shape: "circle", disabled: locked, onClick: replyTo.onCancel, children: _jsx(Text, { children: "\u00D7" }) })] }) : null, composerBody] }), lengthFeedback && limit?.near ? _jsx(Progress, { shape: "circular", label: lengthFeedback.label, value: Math.min(limit.used, limit.max), max: limit.max, valueText: lengthFeedback.formatCount(limit.used, limit.max), children: _jsx(Text, { variant: "caption", children: lengthFeedback.formatCount(limit.used, limit.max) }) }) : null] });
}
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], mediaAlbum, actions, replyAction, replyLink, reactions, children, interactiveContent = false, layoutStyle }) {
    const theme = useOptionalHjmTheme();
    const display = resolveChatMessageGroupDisplay(groupPosition);
    // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
    const visibleTime = display.showTimestamp ? timestamp : "";
    const quote = replyQuote ? _jsxs(_Fragment, { children: [_jsx(Text, { emphasis: "strong", children: replyQuote.title }), _jsx(Text, { tone: "muted", className: "hjm-chat-message__quote-excerpt", children: replyQuote.excerpt })] }) : reply;
    // The quote stays inside the bubble; with replyLink a click on it jumps to the original (2026-10-16 reference).
    validateMediaSetChoice(media.length > 0, mediaAlbum !== undefined);
    const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(mediaAlbum);
    const mediaBlock = mediaAlbum ? _jsx(MediaAlbumView, { album: mediaAlbum, index: albumIndex, onIndexChange: setAlbumIndex, width: chatMessageRecipe.mediaWidth, radius: chatMessageRecipe.bubbleRadius })
        : media.length ? _jsx("div", { className: "hjm-chat-message__media", style: { inlineSize: chatMessageRecipe.mediaWidth, gap: chatMessageRecipe.mediaGap, gridTemplateColumns: `repeat(${resolveChatMediaColumns(media.length)}, minmax(0, 1fr))` }, children: media.map(item => { const style = { aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? _jsx("button", { type: "button", className: "hjm-chat-message__media-item", "aria-label": item.label, style: style, onClick: item.onPress, children: item.preview }, item.id) : _jsx("div", { role: "img", "aria-label": item.label, className: "hjm-chat-message__media-item", style: style, children: item.preview }, item.id); }) }) : null;
    // A photo-only message drops the bubble surface so the photo itself is the message.
    const photoOnly = (media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
    const quoteBlock = quote ? (replyLink ? _jsx("button", { type: "button", className: "hjm-chat-message__reply hjm-chat-message__quote", "aria-label": replyLink.label, onClick: replyLink.onPress, children: quote }) : _jsx("div", { className: "hjm-chat-message__reply", children: quote })) : null;
    const revealTime = timestampPresentation === "swipe" && !!timestamp;
    // Only the pointer that began a drag can finish it; another touch must not reply or cancel it.
    const start = useRef(null);
    const [offset, setOffset] = useState(0);
    const finish = () => { start.current = null; setOffset(0); };
    const menu = useRef(null);
    const summary = reactions?.summary;
    const reactionMenu = reactions ? omitReactionSummary(reactions) : undefined;
    const summaryItems = summary ? resolveChatReactionSummary(summary) : [];
    const summaryButton = reactions && summary && summaryItems.length ? (summary.readOnly ? _jsx(ReactionSummaryText, { label: summary.label, items: summaryItems }) : _jsx(ReactionSummaryButton, { label: summary.label, items: summaryItems, selected: reactions.value, disabled: reactions.disabled ?? false, onPress: () => menu.current?.open() })) : null;
    return _jsxs("article", { tabIndex: replyAction && !replyAction.disabled ? 0 : undefined, "aria-keyshortcuts": replyAction ? "Alt+ArrowLeft Alt+ArrowRight" : undefined, "aria-description": replyAction?.label, onKeyDown: event => { if (event.target === event.currentTarget && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight") && replyAction && !replyAction.disabled) {
            event.preventDefault();
            replyAction.onPress();
        } }, onPointerDown: event => { if (start.current || (!revealTime && (!replyAction || replyAction.disabled)) || event.button !== 0 || event.target.closest("button,a,input,textarea"))
            return; start.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }; }, onPointerMove: event => { if (!start.current || start.current.pointerId !== event.pointerId)
            return; const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y; if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            finish();
            return;
        } if (revealTime)
            setOffset((direction === "outgoing" ? -1 : 1) * timestampRevealOffset(direction === "outgoing" ? -dx : dx, dy));
        else if (Math.abs(dx) > Math.abs(dy) * 2)
            setOffset(Math.max(-72, Math.min(72, dx))); }, onPointerUp: event => { if (start.current?.pointerId !== event.pointerId)
            return; if (!revealTime && start.current && replyAction && !replyAction.disabled && isReplySwipe(event.clientX - start.current.x, event.clientY - start.current.y))
            replyAction.onPress(); finish(); }, onPointerCancel: event => { if (start.current?.pointerId === event.pointerId)
            finish(); }, onPointerLeave: event => { if (start.current?.pointerId === event.pointerId)
            finish(); }, style: { ...layoutStyle, position: "relative", overflow: "hidden", marginBlockStart: display.spacingBefore,
            // Reserve tip room only where it protrudes (own trailing edge, or leading edge without an avatar column).
            ...(bubbleTail ? (direction === "outgoing" ? { paddingInlineEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingInlineStart: chatMessageRecipe.tailWidth }) : {}), touchAction: revealTime || replyAction ? "pan-y" : undefined }, "aria-label": author, children: [revealTime ? _jsx("time", { style: { position: "absolute", ...(direction === "outgoing" ? { right: 0, justifyContent: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", opacity: offset !== 0 ? 1 : 0, pointerEvents: "none" }, children: _jsx(Text, { variant: "caption", tone: "muted", children: timestamp }) }) : null, _jsxs("div", { className: "hjm-chat-message", style: { transform: `translateX(${offset}px)`, transition: start.current || theme?.environment.reducedMotion ? "none" : "transform var(--hjm-motion-normal, 200ms) ease-out", "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth, "--hjm-chat-avatar-size": `${chatMessageRecipe.avatarSize}px` }, "data-direction": direction, "data-tail": (bubbleTail && display.showTail) || undefined, children: [avatar ? _jsx("div", { className: "hjm-chat-message__avatar", "aria-hidden": display.showAvatar ? undefined : true, children: display.showAvatar ? avatar : null }) : null, _jsxs("div", { className: "hjm-chat-message__content", children: [author && display.showAuthor && direction !== "outgoing" ? _jsx(Text, { variant: "caption", tone: "muted", children: author }) : null, _jsxs("div", { className: "hjm-chat-message__body", children: [reactionMenu ? _jsxs(MessageReactions, { ...reactionMenu, menuRef: menu, interactiveContent: interactiveContent || mediaAlbum !== undefined, ...(timestamp ? { menuTitle: timestamp } : {}), ...(replyAction && !replyAction.disabled ? { replyAction } : {}), children: [quoteBlock, mediaBlock, photoOnly ? null : children] }) : _jsxs("div", { className: "hjm-chat-message__bubble", "data-photo-only": photoOnly || undefined, children: [quoteBlock, mediaBlock, photoOnly ? null : children] }), (!revealTime && visibleTime) || deliveryLabel || actions || summaryButton ? _jsxs("div", { className: "hjm-chat-message__meta", children: [summaryButton, (!revealTime && visibleTime) || deliveryLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: [revealTime ? "" : visibleTime, deliveryLabel].filter(Boolean).join(" · ") }) : null, actions] }) : null] })] })] })] });
}
export function CompositionLayout({ title, titleSize = "default", headingLevel = 3, description, badge, leading, actions, notice, children, footer, aside, footerAside, state = { kind: "ready" }, stateAction, stateHeight = "fit", loadingIndicator, layoutStyle }) {
    const resolved = resolveScreenContentState(state);
    const stateMinHeight = resolveCompositionStateMinHeight(stateHeight);
    // The floor sits on a host around the state group: layoutStyle is placement-only and excludes sizes.
    const stateGroup = state.kind === "ready" ? null : _jsxs(Stack, { gap: "sm", align: "center", justify: "center", layoutStyle: { flex: 1 }, children: [resolved.busy ? (loadingIndicator ? _jsx("div", { role: "status", "aria-busy": "true", "aria-label": [state.title, state.description].filter(Boolean).join(". "), children: _jsx("div", { "aria-hidden": "true", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsxs("div", { role: state.kind === "error" ? "alert" : "status", style: { textAlign: "center" }, children: [_jsx(Text, { as: "p", variant: resolved.titleVariant, children: state.title }), state.description ? _jsx(Text, { as: "p", tone: "muted", children: state.description }) : null] }), stateAction] });
    const content = _jsxs(_Fragment, { children: [title || description || badge || leading || actions ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [leading ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%" }, children: [leading, _jsxs(Stack, { gap: "xxs", layoutStyle: { flexShrink: 1, minWidth: 0 }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? (titleSize === "compact" ? _jsx(Text, { variant: "body", role: "heading", "aria-level": headingLevel, style: { fontWeight: 500 }, children: title }) : _jsx(Heading, { level: "level5", semanticLevel: headingLevel, children: title })) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] })] }) : _jsxs(Stack, { gap: "xxs", layoutStyle: { flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%" }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? (titleSize === "compact" ? _jsx(Text, { variant: "body", role: "heading", "aria-level": headingLevel, style: { fontWeight: 500 }, children: title }) : _jsx(Heading, { level: "level5", semanticLevel: headingLevel, children: title })) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), actions] }) : null, notice, state.kind === "ready" ? children : stateMinHeight === null ? stateGroup : _jsx("div", { "data-hjm-state-height": stateHeight, style: { display: "flex", flexDirection: "column", flex: 1, minHeight: stateMinHeight }, children: stateGroup })] });
    // Supporting art spans the heading and body, so a long title cannot push it into a separate row.
    // Diairy postcard cards (2026-10-20) exposed the misuse of header actions for this passive content.
    return _jsxs(Stack, { gap: "md", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [aside ? _jsxs(Stack, { axis: "inline", gap: "md", align: "start", children: [_jsx(Stack, { gap: "md", layoutStyle: { flex: 1, minWidth: 0 }, children: content }), _jsx(Stack, { layoutStyle: { flexShrink: 0, maxWidth: "40%" }, children: aside })] }) : content, footerAside ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: "between", wrap: true, children: [footer ? _jsx(Stack, { layoutStyle: { flexGrow: 1, minWidth: 0 }, children: footer }) : null, footerAside] }) : footer] });
}
/** Optional shared command host; passive previews remain compatible with existing router/gesture hosts. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false, separator = false, action }) {
    const r = notificationRecipe;
    if (action && !action.label.trim())
        throw new TypeError("NotificationRow action requires a localized label");
    const content = _jsxs("span", { "aria-hidden": "true", "data-hjm-notification-row": "true", style: { position: "relative", display: "flex", alignItems: "center", gap: r.gap, padding: `${r.paddingBlock}px ${r.paddingInline}px`, width: "100%", minWidth: 0, boxSizing: "border-box" }, children: [separator ? _jsx("span", { "data-hjm-notification-separator": "true", style: { position: "absolute", insetBlockStart: 0, insetInlineStart: r.separatorInsetStart, insetInlineEnd: 0, borderBlockStart: "1px solid var(--hjm-color-border)" } }) : null, _jsxs("span", { style: { position: "relative", width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }, children: [_jsx("span", { style: { display: "flex", width: "100%", height: "100%", overflow: "hidden", borderRadius: "50%" }, children: avatar }), avatarBadge ? _jsx("span", { style: { position: "absolute", bottom: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: "50%", background: "var(--hjm-color-surface)", border: "2px solid var(--hjm-color-surface)", boxSizing: "border-box" }, children: avatarBadge }) : null] }), _jsxs("span", { "data-hjm-notification-copy": "true", style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: r.contentGap }, children: [_jsx(Text, { style: { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: r.previewLines, overflow: "hidden" }, children: preview }), _jsxs("span", { style: { display: "flex", alignItems: "center", gap: r.contentGap }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: metadata }), unread ? _jsx("span", { "data-hjm-unread-dot": "true", style: { width: r.unreadSize, height: r.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" } }) : null] })] }), thumbnail ? _jsx("span", { style: { width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: "var(--hjm-radius-sm)" }, children: thumbnail }) : null] });
    return action ? _jsx("button", { type: "button", className: "hjm-notification-row-action", "aria-label": action.label, disabled: action.disabled, onClick: () => { if (!action.disabled)
            action.onActivate(); }, style: { "--hjm-notification-disabled-opacity": r.interaction.disabledOpacity, "--hjm-notification-pressed-opacity": r.interaction.pressedOpacity }, children: content }) : content;
}
/** Shared launcher/profile tile; simple activation and gesture-only presentation reuse identical content. */
export function IconTile({ icon, label, overlay, labelLines = 1, ghost = false, frame = iconTileRecipe.defaults.frame, shape = iconTileRecipe.defaults.shape, size = iconTileRecipe.defaults.size, onActivate, activationLabel, disabled = false, locked = false, lockedLabel, accessory, accessoryPlacement = iconTileRecipe.defaults.accessoryPlacement, layoutStyle }) {
    const r = iconTileRecipe;
    if (onActivate && !(activationLabel ?? label).trim())
        throw new TypeError("Interactive IconTile requires a label");
    if (locked && (!onActivate || !lockedLabel?.trim()))
        throw new TypeError("A locked IconTile needs onActivate and a lockedLabel");
    if (!cornerAccessoryPlacements.includes(accessoryPlacement))
        throw new TypeError(`Unsupported IconTile accessoryPlacement: ${accessoryPlacement}`);
    const dim = ghost ? r.ghostOpacity : locked ? r.locked.opacity : 1;
    const framed = frame === "surface";
    // Percent radius follows the rendered size, so a filling icon keeps its shape at every cell width.
    const dimensions = size === "fill" ? { width: "100%", minWidth: r.fillMinSize, maxWidth: r.fillMaxSize, aspectRatio: "1" } : { width: r.iconSize, height: r.iconSize };
    // A render-function icon needs the filling edge as a number. It is read before paint and on every resize; the
    // computed width ignores transforms (a host's press scale) and keeps fractional cell widths.
    const frameRef = useRef(null);
    const measureEdge = size === "fill" && typeof icon === "function";
    const [fillEdge, setFillEdge] = useState(r.fillMinSize);
    useLayoutEffect(() => {
        const element = frameRef.current;
        if (!measureEdge || !element)
            return;
        setFillEdge(Number.parseFloat(getComputedStyle(element).width) || r.fillMinSize);
        if (typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(([entry]) => { const width = entry?.borderBoxSize?.[0]?.inlineSize; if (width)
            setFillEdge(width); });
        observer.observe(element);
        return () => observer.disconnect();
    }, [measureEdge, r.fillMinSize]);
    const edge = size === "fill" ? fillEdge : r.iconSize;
    const content = _jsxs("span", { "data-hjm-icon-tile": "true", "data-frame": frame, "data-shape": shape, "data-size": size, "data-locked": locked || undefined, style: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible", ...(onActivate ? {} : layoutStyle) }, children: [_jsxs("span", { ref: frameRef, style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", ...dimensions, boxSizing: "border-box", flexShrink: 0, borderRadius: `${Math.round(r.shapes[shape] * 100)}%`, background: framed ? "var(--hjm-color-surface-alt)" : undefined, color: "var(--hjm-color-text)", boxShadow: ghost || !framed ? undefined : "0 0 0 1px var(--hjm-color-border)", outline: ghost ? "1px dashed var(--hjm-color-text-muted)" : undefined, opacity: dim, fontSize: 32 }, children: [typeof icon === "function" ? icon({ edge }) : icon, overlay] }), accessory ? _jsx("span", { "aria-hidden": onActivate ? true : undefined, style: { position: "absolute", insetBlockStart: 0, left: "50%", transform: "translateX(-50%)", ...dimensions, boxSizing: "border-box", pointerEvents: "none" }, children: _jsx("span", { "data-hjm-icon-tile-accessory": accessoryPlacement, style: { position: "absolute", display: "inline-flex", insetInlineEnd: -r.accessory.offset, ...(accessoryPlacement === "top-end" ? { insetBlockStart: -r.accessory.offset } : { insetBlockEnd: -r.accessory.offset }) }, children: accessory }) }) : null, _jsx(Text, { variant: "caption", style: { opacity: locked ? r.locked.opacity : undefined, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: labelLines, width: "100%", maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "center", fontWeight: 500 }, children: label })] });
    if (!onActivate)
        return content;
    return _jsx("button", { type: "button", className: "hjm-icon-tile-action", "aria-label": locked ? `${activationLabel ?? label}, ${lockedLabel}` : activationLabel ?? label, disabled: disabled, style: { "--hjm-icon-tile-pressed-opacity": r.activation.pressedOpacity, "--hjm-icon-tile-disabled-opacity": r.activation.disabledOpacity,
            minWidth: r.activation.minimumTarget, minHeight: r.activation.minimumTarget, ...layoutStyle }, onClick: () => { if (!disabled)
            onActivate(); }, children: content });
}
/**
 * Incoming "is typing" row for a ChatScreen timeline (2026-10-18 BurnTok DM drew its own). The host shows it only while
 * presence says someone is typing and places it after the last message; HJM owns the bubble, dots and announcement.
 */
export function TypingIndicator({ label, avatar, layoutStyle }) {
    if (!label.trim())
        throw new TypeError("TypingIndicator requires a localized label");
    const theme = useOptionalHjmTheme();
    const r = typingIndicatorRecipe, m = chatMessageRecipe;
    // A polite status: appearing is announced once without interrupting, and the dots stay hidden from assistive tech.
    return _jsxs("div", { role: "status", className: "hjm-typing-indicator", "data-reduced-motion": theme?.environment.reducedMotion || undefined, style: { display: "flex", alignItems: "flex-start", gap: m.avatarGap, marginBlockStart: m.groupGap, paddingInlineStart: avatar ? 0 : m.tailWidth, ...layoutStyle, "--hjm-typing-dot": `${r.dotSize}px`, "--hjm-typing-cycle": `${r.cycleMs}ms`, "--hjm-typing-rest": r.restOpacity }, children: [avatar ? _jsx("span", { "aria-hidden": "true", style: { display: "flex", justifyContent: "center", flex: `0 0 ${m.avatarSize}px`, inlineSize: m.avatarSize }, children: avatar }) : null, _jsx("span", { "aria-hidden": "true", className: "hjm-typing-indicator__bubble", style: { display: "inline-flex", alignItems: "center", gap: r.dotGap, boxSizing: "border-box", minBlockSize: `calc(var(--hjm-type-body-line-height) + ${m.bubblePaddingBlock * 2}px)`, paddingBlock: m.bubblePaddingBlock, paddingInline: m.bubblePaddingInline, borderRadius: m.bubbleRadius, background: "var(--hjm-color-surface)" }, children: [0, 1, 2].map(index => _jsx("span", { className: "hjm-typing-indicator__dot", style: { animationDelay: `${index * r.staggerMs}ms` } }, index)) }), _jsx(VisuallyHidden, { children: label })] });
}
/**
 * Centered date (or time) row between ChatScreen timeline groups (2026-10-18 Utilverse chat drew a caption). Grouping
 * rules stay with the product; the next message keeps its own group gap, so this row adds only the space before it.
 */
export function ChatDateSeparator({ label, dateTime, layoutStyle }) {
    if (!label.trim())
        throw new TypeError("ChatDateSeparator requires a localized label");
    const r = chatDateSeparatorRecipe;
    return _jsx("div", { className: "hjm-chat-date-separator", style: { display: "flex", justifyContent: "center", textAlign: "center", paddingBlockStart: r.paddingTop, paddingBlockEnd: r.paddingBottom, ...layoutStyle }, children: _jsx(Text, { variant: r.textVariant, tone: r.tone, children: dateTime ? _jsx("time", { dateTime: dateTime, children: label }) : label }) });
}
//# sourceMappingURL=screens.js.map