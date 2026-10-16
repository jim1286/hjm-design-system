import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe } from "@hjmds/design-contracts/screen-patterns";
import { resolveComposerLimit } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import { Button, IconButton } from "./actions.js";
import { useOptionalHjmTheme } from "./provider.js";
import { TextArea } from "./forms.js";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
import { Section, Stack, Text } from "./layout.js";
import { ListRow } from "./display.js";
import { classNames, useDesignProfileDefaults } from "./internal.js";
/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, titleBadge, titleVisibility = "visible", headerAlignment = "start", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", as: Element = "main", className, layoutStyle, hjmTitleLeading }) {
    const id = useId();
    const showHeader = titleVisibility === "visible" || !!description || !!leading || !!actions;
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
        const previous = lastBodyFocus.current;
        if (previous && !previous.isConnected && document.activeElement === document.body) {
            bodyRef.current?.focus({ preventScroll: true });
        }
        if (previous && !previous.isConnected)
            lastBodyFocus.current = null;
    });
    const recipe = screenPatternRecipe;
    return _jsxs(Element, { "aria-labelledby": header || titleVisibility === "hidden" ? undefined : id, "aria-label": header || titleVisibility === "hidden" ? title : undefined, "data-content-inset": contentInset, "data-presentation": presentation, className: classNames("hjm-screen", className), style: { backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle }, children: [header ?? (showHeader ? headerAlignment === "center" ? _jsxs("header", { className: "hjm-screen__header", style: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)", alignItems: "center" }, children: [_jsx("div", { children: leading }), _jsxs("div", { className: "hjm-screen__heading", style: { textAlign: "center", minWidth: 0 }, children: [titleVisibility === "visible" && _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: "center", wrap: true, children: [hjmTitleLeading, _jsx(Heading, { level: "level3", semanticLevel: 1, id: id, children: title }), titleBadge] }), description ? _jsx(Text, { as: "p", tone: "muted", children: description }) : null] }), _jsx("div", { style: { justifySelf: "end" }, children: actions })] }) : _jsxs("header", { className: "hjm-screen__header", style: profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined, children: [leading, _jsxs("div", { className: "hjm-screen__heading", children: [titleVisibility === "visible" && _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: profileLayout?.centered ? "center" : "start", wrap: true, children: [_jsx(Heading, { level: "level3", semanticLevel: 1, id: id, children: title }), titleBadge] }), description ? _jsx(Text, { as: "p", tone: "muted", children: description }) : null] }), actions] }) : null), notice ? _jsx("div", { className: "hjm-screen__notice", children: notice }) : null, _jsx("div", { ref: bodyRef, tabIndex: bodyScroll === "content" ? -1 : 0, onFocusCapture: event => { lastBodyFocus.current = event.target; }, onBlurCapture: event => {
                    // A connected input blurred to the document intentionally relinquishes
                    // focus too; only removal of the currently focused node needs recovery.
                    if (event.relatedTarget ? !event.currentTarget.contains(event.relatedTarget) : event.target.isConnected) {
                        lastBodyFocus.current = null;
                    }
                }, className: "hjm-screen__body", "data-content-alignment": contentAlignment, "data-scroll": bodyScroll, "data-replacement": resolved.replacesContent || undefined, "aria-busy": resolved.busy || undefined, children: state.kind === "ready" ? (contentAlignment === "center" ? _jsx("div", { className: "hjm-screen__centered-content", children: children }) : children) : _jsxs("div", { className: "hjm-screen__state", role: resolved.busy ? undefined : state.kind === "error" ? "alert" : "status", children: [resolved.busy ? _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") }) : _jsx("div", { children: _jsxs(Stack, { gap: "sm", align: "center", children: [_jsx(Text, { variant: "title", children: state.title }), state.description ? _jsx(Text, { tone: "muted", children: state.description }) : null] }) }), stateAction] }) }), footer ? _jsx("footer", { className: "hjm-screen__footer", children: footer }) : null] });
}
export function SettingsScreen({ profile, sections, ...props }) {
    // Keep semantic section headings while using the smaller settings label role.
    return _jsx(ScreenLayout, { ...props, children: _jsxs(Stack, { gap: "md", children: [profile, sections.map(section => _jsx(Section, { className: "hjm-settings-section", title: _jsx(Text, { variant: "label", emphasis: "strong", tone: "muted", children: section.title }), description: section.description, children: section.children }, section.id))] }) });
}
export function NotificationInboxScreen({ filters, children, notice, ...props }) {
    return _jsx(ScreenLayout, { ...props, notice: _jsxs(Stack, { gap: "sm", children: [notice, filters] }), children: children });
}
export function NotificationItem({ read, statusLabel, timestamp, description, title, className, ...props }) {
    return _jsx(ListRow, { ...props, className: classNames("hjm-notification-item", className), "data-unread": !read || undefined, title: _jsx(Text, { emphasis: read ? "regular" : "strong", children: title }), description: _jsxs(Stack, { gap: "xxs", children: [description, _jsxs(Text, { variant: "caption", tone: "muted", children: [statusLabel, " \u00B7 ", timestamp] })] }) });
}
/** Caller supplies a virtualized timeline and keyboard-aware composer; no implicit auto-scroll or send. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", headerAlignment = "center", ...props }) {
    // An empty conversation must still allow its first message; unavailable states hide input.
    const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
    // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
    // Conversations center the peer between back and tools and use the measured 10px timeline gutter (2026-10-16).
    return _jsx(ScreenLayout, { ...props, className: classNames("hjm-chat-screen", props.className) ?? "hjm-chat-screen", hjmTitleLeading: avatar, scroll: scroll, headerAlignment: headerAlignment, footer: showComposer ? _jsxs("div", { className: "hjm-chat-screen__footer", children: [jumpToLatest ? _jsx("div", { className: "hjm-chat-screen__jump", children: _jsx(IconButton, { label: jumpToLatest.label, size: "small", shape: "circle", tone: "secondary", onClick: jumpToLatest.onPress, children: jumpToLatest.icon }) }) : null, composer] }) : null });
}
export function MessageComposer({ quickInserts, value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }) {
    validateMessageAttachments(attachments);
    if (attachments.length && !onRemoveAttachment)
        throw new TypeError("Attachments require a removal callback");
    if (lengthFeedback && maxLength === undefined)
        throw new TypeError("Composer length feedback requires maxLength");
    const limit = !lengthFeedback ? null : resolveComposerLimit(value, maxLength, lengthFeedback.threshold);
    const canSend = !sendDisabled && !limit?.exceeded && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
    const locked = disabled || pending;
    // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
    const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
    const attach = attachmentAction ? _jsx(IconButton, { label: attachmentAction.label, tone: "ghost", disabled: locked || attachmentAction.disabled, onClick: attachmentAction.onPress, children: attachmentAction.icon }) : null;
    const send = sendIcon ? _jsx(IconButton, { label: sendLabel, size: sendPresentation === "circle" ? "small" : "medium", shape: "circle", tone: sendPresentation === "circle" ? "primary" : "ghost", disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendIcon }) : _jsx(Button, { disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendLabel });
    // Readonly pending input preserves the keyboard/focus for receipt failure recovery; disabling it would blur desktop chat.
    // Enter is opt-in and IME-safe; receipt-driven clearing and failed-send recovery belong to the host.
    const composerBody = _jsxs(_Fragment, { children: [attachments.length ? _jsxs("div", { className: "hjm-message-composer__attachments", children: [attachments.map(item => _jsxs("div", { className: "hjm-message-composer__attachment", children: [_jsx("div", { className: "hjm-message-composer__preview", children: item.preview }), _jsx("span", { className: "hjm-message-composer__remove", children: _jsx(IconButton, { label: item.removeLabel, tone: "ghost", size: "small", disabled: locked || item.disabled, onClick: () => { if (!locked && !item.disabled)
                                        onRemoveAttachment?.(item.id); }, children: _jsx("span", { className: "hjm-message-composer__remove-glyph", "aria-hidden": "true", children: "\u00D7" }) }) })] }, item.id)), attach] }) : null, _jsxs("div", { className: "hjm-message-composer__row", children: [_jsx(TextArea, { ref: inputRef, maxLength: maxLength, leadingAction: leadingAction, shape: "large", rows: screenPatternRecipe.composerMinLines, "aria-label": label, placeholder: placeholder, description: description, error: error, "aria-invalid": invalid || undefined, onBlur: onBlur, value: value, disabled: disabled, readOnly: pending, "aria-busy": pending || undefined, onKeyDown: event => { if (shouldSubmitMessageKey({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing, keyCode: event.nativeEvent.keyCode }, submitMode)) {
                            event.preventDefault();
                            if (canSend)
                                onSend(value);
                        } }, onChange: event => { if (!locked)
                            onValueChange(event.currentTarget.value); }, minVisibleLines: screenPatternRecipe.composerMinLines, maxVisibleLines: screenPatternRecipe.composerMaxLines, ...(sendIcon ? { trailing: _jsxs("span", { className: "hjm-message-composer__trailing", children: [_jsx("span", { className: "hjm-message-composer__reserve", "aria-hidden": "true", inert: true, children: send }), _jsx("span", { className: "hjm-message-composer__visible", children: hasContent || pending ? send : attach })] }) } : {}) }), sendIcon ? null : send] })] });
    const quickRow = quickInserts?.items.length ? _jsx("div", { className: "hjm-message-composer__quick", role: "group", "aria-label": quickInserts.label, style: { "--hjm-quick-size": `${composerQuickInsertRecipe.itemSize}px`, "--hjm-quick-emoji": `${composerQuickInsertRecipe.emojiSize}px` }, children: quickInserts.items.map(item => _jsx("button", { type: "button", className: "hjm-message-composer__quick-item", "aria-label": item.label, disabled: locked, onClick: () => onValueChange(value + item.emoji), children: item.emoji }, item.id)) }) : null;
    return _jsxs("div", { className: "hjm-message-composer", "data-send-presentation": sendPresentation, style: { "--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle }, children: [context, quickRow, replyTo ? _jsxs("div", { className: "hjm-message-composer__reply-card", children: [_jsxs("div", { className: "hjm-message-composer__reply", children: [_jsxs("div", { className: "hjm-message-composer__reply-text", children: [_jsx(Text, { emphasis: "strong", children: replyTo.author }), _jsx(Text, { variant: "caption", tone: "muted", className: "hjm-message-composer__reply-excerpt", children: replyTo.excerpt })] }), _jsx(IconButton, { label: replyTo.cancelLabel, tone: "secondary", size: "small", shape: "circle", disabled: locked, onClick: replyTo.onCancel, children: _jsx(Text, { children: "\u00D7" }) })] }), composerBody] }) : composerBody, lengthFeedback && limit?.near ? _jsx(Progress, { shape: "circular", label: lengthFeedback.label, value: Math.min(limit.used, limit.max), max: limit.max, valueText: lengthFeedback.formatCount(limit.used, limit.max), children: _jsx(Text, { variant: "caption", children: lengthFeedback.formatCount(limit.used, limit.max) }) }) : null] });
}
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], actions, replyAction, replyLink, reactions, children, interactiveContent = false, layoutStyle }) {
    const theme = useOptionalHjmTheme();
    const display = resolveChatMessageGroupDisplay(groupPosition);
    // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
    const visibleTime = display.showTimestamp ? timestamp : "";
    const quote = replyQuote ? _jsxs(_Fragment, { children: [_jsx(Text, { emphasis: "strong", children: replyQuote.title }), _jsx(Text, { tone: "muted", className: "hjm-chat-message__quote-excerpt", children: replyQuote.excerpt })] }) : reply;
    // The quote stays inside the bubble; with replyLink a click on it jumps to the original (2026-10-16 reference).
    const mediaBlock = media.length ? _jsx("div", { className: "hjm-chat-message__media", style: { inlineSize: chatMessageRecipe.mediaWidth, gap: chatMessageRecipe.mediaGap, gridTemplateColumns: `repeat(${resolveChatMediaColumns(media.length)}, minmax(0, 1fr))` }, children: media.map(item => { const style = { aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? _jsx("button", { type: "button", className: "hjm-chat-message__media-item", "aria-label": item.label, style: style, onClick: item.onPress, children: item.preview }, item.id) : _jsx("div", { role: "img", "aria-label": item.label, className: "hjm-chat-message__media-item", style: style, children: item.preview }, item.id); }) }) : null;
    // A photo-only message drops the bubble surface so the photo itself is the message.
    const photoOnly = media.length > 0 && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
    const quoteBlock = quote ? (replyLink ? _jsx("button", { type: "button", className: "hjm-chat-message__reply hjm-chat-message__quote", "aria-label": replyLink.label, onClick: replyLink.onPress, children: quote }) : _jsx("div", { className: "hjm-chat-message__reply", children: quote })) : null;
    const revealTime = timestampPresentation === "swipe" && !!timestamp;
    // Only the pointer that began a drag can finish it; another touch must not reply or cancel it.
    const start = useRef(null);
    const [offset, setOffset] = useState(0);
    const finish = () => { start.current = null; setOffset(0); };
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
            ...(bubbleTail ? (direction === "outgoing" ? { paddingInlineEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingInlineStart: chatMessageRecipe.tailWidth }) : {}), touchAction: revealTime || replyAction ? "pan-y" : undefined }, "aria-label": author, children: [revealTime ? _jsx("time", { style: { position: "absolute", ...(direction === "outgoing" ? { right: 0, justifyContent: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", opacity: offset !== 0 ? 1 : 0, pointerEvents: "none" }, children: _jsx(Text, { variant: "caption", tone: "muted", children: timestamp }) }) : null, _jsxs("div", { className: "hjm-chat-message", style: { transform: `translateX(${offset}px)`, transition: start.current || theme?.environment.reducedMotion ? "none" : "transform var(--hjm-motion-normal, 200ms) ease-out", "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth, "--hjm-chat-avatar-size": `${chatMessageRecipe.avatarSize}px` }, "data-direction": direction, "data-tail": (bubbleTail && display.showTail) || undefined, children: [avatar ? _jsx("div", { className: "hjm-chat-message__avatar", "aria-hidden": display.showAvatar ? undefined : true, children: display.showAvatar ? avatar : null }) : null, _jsxs("div", { className: "hjm-chat-message__content", children: [author && display.showAuthor && direction !== "outgoing" ? _jsx(Text, { variant: "caption", tone: "muted", children: author }) : null, _jsxs("div", { className: "hjm-chat-message__body", children: [reactions ? _jsxs(MessageReactions, { ...reactions, interactiveContent: interactiveContent, ...(timestamp ? { menuTitle: timestamp } : {}), ...(replyAction && !replyAction.disabled ? { replyAction } : {}), children: [quoteBlock, mediaBlock, photoOnly ? null : children] }) : _jsxs("div", { className: "hjm-chat-message__bubble", "data-photo-only": photoOnly || undefined, children: [quoteBlock, mediaBlock, photoOnly ? null : children] }), (!revealTime && visibleTime) || deliveryLabel || actions ? _jsxs("div", { className: "hjm-chat-message__meta", children: [(!revealTime && visibleTime) || deliveryLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: [revealTime ? "" : visibleTime, deliveryLabel].filter(Boolean).join(" · ") }) : null, actions] }) : null] })] })] })] });
}
export function CompositionLayout({ title, headingLevel = 3, description, badge, leading, actions, notice, children, footer, state = { kind: "ready" }, stateAction, loadingIndicator, layoutStyle }) {
    const resolved = resolveScreenContentState(state);
    return _jsxs(Stack, { gap: "md", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [title || description || badge || leading || actions ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [leading, _jsxs(Stack, { gap: "xxs", layoutStyle: { flex: 1, minWidth: 0 }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? _jsx(Heading, { level: "level3", semanticLevel: headingLevel, children: title }) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), actions] }) : null, notice, state.kind === "ready" ? children : _jsxs(Stack, { gap: "sm", align: "center", justify: "center", role: resolved.busy ? undefined : state.kind === "error" ? "alert" : "status", layoutStyle: { flex: 1 }, children: [resolved.busy ? (loadingIndicator ? _jsx("div", { role: "status", "aria-busy": "true", "aria-label": [state.title, state.description].filter(Boolean).join(". "), children: _jsx("div", { "aria-hidden": "true", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsxs("div", { children: [_jsx(Text, { variant: "title", children: state.title }), state.description ? _jsx(Text, { tone: "muted", children: state.description }) : null] }), stateAction] }), footer] });
}
/** Router host owns the sole target and localized accessible name, as with ConversationRow. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false }) {
    const r = notificationRecipe;
    return _jsxs("span", { "aria-hidden": "true", "data-hjm-notification-row": "true", style: { display: "flex", alignItems: "center", gap: r.gap, padding: `${r.paddingBlock}px ${r.paddingInline}px`, width: "100%", minWidth: 0, boxSizing: "border-box" }, children: [_jsxs("span", { style: { position: "relative", width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }, children: [_jsx("span", { style: { display: "flex", width: "100%", height: "100%", overflow: "hidden", borderRadius: "50%" }, children: avatar }), avatarBadge ? _jsx("span", { style: { position: "absolute", bottom: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: "50%", background: "var(--hjm-color-surface)", border: "2px solid var(--hjm-color-surface)", boxSizing: "border-box" }, children: avatarBadge }) : null] }), _jsxs("span", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: r.contentGap }, children: [_jsx(Text, { style: { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: r.previewLines, overflow: "hidden" }, children: preview }), _jsxs("span", { style: { display: "flex", alignItems: "center", gap: r.contentGap }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: metadata }), unread ? _jsx("span", { "data-hjm-unread-dot": "true", style: { width: r.unreadSize, height: r.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" } }) : null] })] }), thumbnail ? _jsx("span", { style: { width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: "var(--hjm-radius-sm)" }, children: thumbnail }) : null] });
}
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export function IconTile({ icon, label, overlay, labelLines = 1, ghost = false }) {
    const r = iconTileRecipe;
    return _jsxs("span", { "data-hjm-icon-tile": "true", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible" }, children: [_jsxs("span", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: r.iconSize, height: r.iconSize, flexShrink: 0, borderRadius: r.iconRadius, background: "var(--hjm-color-surface-alt)", color: "var(--hjm-color-text)", boxShadow: ghost ? undefined : "0 0 0 1px var(--hjm-color-border)", outline: ghost ? "1px dashed var(--hjm-color-text-muted)" : undefined, opacity: ghost ? r.ghostOpacity : 1, fontSize: 32 }, children: [icon, overlay] }), _jsx(Text, { variant: "caption", style: { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: labelLines, width: "100%", maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "center", fontWeight: 500 }, children: label })] });
}
//# sourceMappingURL=screens.js.map