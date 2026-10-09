import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./forms.js";
import { useId, useRef, useState } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
import { Section, Stack, Text } from "./layout.js";
import { ListRow } from "./display.js";
import { classNames, useDesignProfileDefaults } from "./internal.js";
/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, header, contentInset = "default", presentation: suppliedPresentation, description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", as: Element = "main", className, layoutStyle }) {
    const id = useId();
    // Screens historically work with the stylesheet alone. Optional context keeps
    // that path while inheriting profiles from an enclosing Provider when present.
    const designProfile = useDesignProfileDefaults();
    const presentation = suppliedPresentation ?? designProfile?.screens.overview;
    const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
    const resolved = resolveScreenContentState(state);
    // Replacement text owns scrolling even when the ready state delegates it to
    // a virtual list. Use the rendered mode for keyboard access as well as CSS.
    const bodyScroll = resolved.replacesContent ? "screen" : scroll;
    const recipe = screenPatternRecipe;
    return _jsxs(Element, { "aria-labelledby": header ? undefined : id, "aria-label": header ? title : undefined, "data-content-inset": contentInset, "data-presentation": presentation, className: classNames("hjm-screen", className), style: { backgroundColor: designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle }, children: [header ?? _jsxs("header", { className: "hjm-screen__header", style: profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined, children: [leading, _jsxs("div", { className: "hjm-screen__heading", children: [_jsx(Heading, { level: "level3", semanticLevel: 1, id: id, children: title }), description ? _jsx(Text, { as: "p", tone: "muted", children: description }) : null] }), actions] }), notice ? _jsx("div", { className: "hjm-screen__notice", children: notice }) : null, _jsx("div", { tabIndex: bodyScroll === "content" ? undefined : 0, className: "hjm-screen__body", "data-scroll": bodyScroll, "data-replacement": resolved.replacesContent || undefined, "aria-busy": resolved.busy || undefined, children: state.kind === "ready" ? children : _jsxs("div", { className: "hjm-screen__state", children: [resolved.busy ? _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") }) : _jsx("div", { role: state.kind === "error" ? "alert" : "status", children: _jsxs(Stack, { gap: "sm", align: "center", children: [_jsx(Text, { variant: "title", children: state.title }), state.description ? _jsx(Text, { tone: "muted", children: state.description }) : null] }) }), stateAction] }) }), footer ? _jsx("footer", { className: "hjm-screen__footer", children: footer }) : null] });
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
export function ChatScreen({ composer, scroll = "content", ...props }) {
    return _jsx(ScreenLayout, { ...props, scroll: scroll, footer: !props.state || props.state.kind === "ready" ? composer : null });
}
export function MessageComposer({ value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }) {
    validateMessageAttachments(attachments);
    if (attachments.length && !onRemoveAttachment)
        throw new TypeError("Attachments require a removal callback");
    const canSend = !sendDisabled && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
    const locked = disabled || pending;
    // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
    const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
    const attach = attachmentAction ? _jsx(IconButton, { label: attachmentAction.label, tone: "ghost", disabled: locked || attachmentAction.disabled, onClick: attachmentAction.onPress, children: attachmentAction.icon }) : null;
    const send = sendIcon ? _jsx(IconButton, { label: sendLabel, size: sendPresentation === "circle" ? "small" : "medium", shape: "circle", tone: sendPresentation === "circle" ? "primary" : "ghost", disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendIcon }) : _jsx(Button, { disabled: !canSend, loading: pending, onClick: () => { if (canSend)
            onSend(value); }, children: sendLabel });
    // Readonly pending input preserves the keyboard/focus for receipt failure recovery; disabling it would blur desktop chat.
    // Enter is opt-in and IME-safe; receipt-driven clearing and failed-send recovery belong to the host.
    return _jsxs("div", { className: "hjm-message-composer", "data-send-presentation": sendPresentation, style: { "--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle }, children: [context, replyTo ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", children: [_jsxs(Stack, { gap: "xxs", children: [_jsx(Text, { variant: "caption", emphasis: "strong", children: replyTo.author }), _jsx(Text, { variant: "caption", tone: "muted", children: replyTo.excerpt })] }), _jsx(IconButton, { label: replyTo.cancelLabel, tone: "ghost", disabled: locked, onClick: replyTo.onCancel, children: _jsx(Text, { children: "\u00D7" }) })] }) : null, attachments.length ? _jsxs("div", { className: "hjm-message-composer__attachments", children: [attachments.map(item => _jsxs("div", { className: "hjm-message-composer__attachment", children: [_jsx("div", { className: "hjm-message-composer__preview", children: item.preview }), _jsx("span", { className: "hjm-message-composer__remove", children: _jsx(IconButton, { label: item.removeLabel, tone: "ghost", size: "small", disabled: locked || item.disabled, onClick: () => { if (!locked && !item.disabled)
                                        onRemoveAttachment?.(item.id); }, children: _jsx("span", { className: "hjm-message-composer__remove-glyph", "aria-hidden": "true", children: "\u00D7" }) }) })] }, item.id)), attach] }) : null, _jsxs("div", { className: "hjm-message-composer__row", children: [_jsx(TextArea, { ref: inputRef, maxLength: maxLength, leadingAction: leadingAction, shape: "large", rows: screenPatternRecipe.composerMinLines, "aria-label": label, placeholder: placeholder, description: description, error: error, "aria-invalid": invalid || undefined, onBlur: onBlur, value: value, disabled: disabled, readOnly: pending, "aria-busy": pending || undefined, onKeyDown: event => { if (shouldSubmitMessageKey({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing, keyCode: event.nativeEvent.keyCode }, submitMode)) {
                            event.preventDefault();
                            if (canSend)
                                onSend(value);
                        } }, onChange: event => { if (!locked)
                            onValueChange(event.currentTarget.value); }, minVisibleLines: screenPatternRecipe.composerMinLines, maxVisibleLines: screenPatternRecipe.composerMaxLines, ...(sendIcon ? { trailing: hasContent || pending ? send : attach } : {}) }), sendIcon ? null : send] })] });
}
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = false, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent = false, layoutStyle }) {
    const revealTime = timestampPresentation === "swipe" && !!timestamp;
    const start = useRef(null);
    const [offset, setOffset] = useState(0);
    const finish = () => { start.current = null; setOffset(0); };
    return _jsxs("article", { tabIndex: replyAction && !replyAction.disabled ? 0 : undefined, "aria-keyshortcuts": replyAction ? "Alt+ArrowLeft Alt+ArrowRight" : undefined, "aria-description": replyAction?.label, onKeyDown: event => { if (event.target === event.currentTarget && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight") && replyAction && !replyAction.disabled) {
            event.preventDefault();
            replyAction.onPress();
        } }, onPointerDown: event => { if ((!revealTime && (!replyAction || replyAction.disabled)) || event.button !== 0 || event.target.closest("button,a,input,textarea"))
            return; start.current = { x: event.clientX, y: event.clientY }; }, onPointerMove: event => { if (!start.current)
            return; const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y; if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            finish();
            return;
        } if (revealTime)
            setOffset((direction === "outgoing" ? -1 : 1) * timestampRevealOffset(direction === "outgoing" ? -dx : dx, dy));
        else if (Math.abs(dx) > Math.abs(dy) * 2)
            setOffset(Math.max(-72, Math.min(72, dx))); }, onPointerUp: event => { if (!revealTime && start.current && replyAction && !replyAction.disabled && isReplySwipe(event.clientX - start.current.x, event.clientY - start.current.y))
            replyAction.onPress(); finish(); }, onPointerCancel: finish, onPointerLeave: finish, style: { ...layoutStyle, position: "relative", overflow: "hidden", paddingInline: bubbleTail ? "var(--hjm-space-xs)" : undefined, touchAction: revealTime || replyAction ? "pan-y" : undefined }, "aria-label": author, children: [revealTime ? _jsx("time", { style: { position: "absolute", ...(direction === "outgoing" ? { right: 0, justifyContent: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", opacity: offset !== 0 ? 1 : 0, pointerEvents: "none" }, children: _jsx(Text, { variant: "caption", tone: "muted", children: timestamp }) }) : null, _jsxs("div", { className: "hjm-chat-message", style: { transform: `translateX(${offset}px)`, "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth }, "data-direction": direction, "data-tail": bubbleTail || undefined, children: [avatar ? _jsx("div", { className: "hjm-chat-message__avatar", children: avatar }) : null, _jsxs("div", { className: "hjm-chat-message__content", children: [author ? _jsx(Text, { variant: "caption", tone: "muted", children: author }) : null, reply && replyLink ? _jsx(Button, { tone: "ghost", "aria-label": replyLink.label, onClick: replyLink.onPress, children: reply }) : null, reactions ? _jsxs(MessageReactions, { ...reactions, interactiveContent: interactiveContent, children: [reply && !replyLink ? _jsx("div", { className: "hjm-chat-message__reply", children: reply }) : null, children] }) : _jsxs("div", { className: "hjm-chat-message__bubble", children: [reply && !replyLink ? _jsx("div", { className: "hjm-chat-message__reply", children: reply }) : null, children] }), (!revealTime && timestamp) || deliveryLabel || actions ? _jsxs("div", { className: "hjm-chat-message__meta", children: [(!revealTime && timestamp) || deliveryLabel ? _jsx(Text, { variant: "caption", tone: "muted", children: [revealTime ? "" : timestamp, deliveryLabel].filter(Boolean).join(" · ") }) : null, actions] }) : null] })] })] });
}
//# sourceMappingURL=screens.js.map