import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { useMemo, useState } from "react";
import { PanResponder, ScrollView, View } from "react-native";
import { Spinner } from "./internal/spinner.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { isReplySwipe, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Section, Stack, Text } from "./primitives.js";
import { ListRow } from "./data-display.js";
import { useHjmNativeTheme } from "./provider.js";
export function ScreenLayout({ title, header, contentInset = "default", presentation: suppliedPresentation, description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps }) {
    const resolved = resolveScreenContentState(state);
    const { colors, environment, designProfile } = useHjmNativeTheme();
    const presentation = suppliedPresentation ?? designProfile?.screens.overview;
    const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
    const recipe = screenPatternRecipe;
    const padding = contentInset === "none" ? 0 : recipe.padding;
    const body = state.kind === "ready" ? children : _jsxs(View, { style: { marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap }, children: [resolved.busy ? _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") }) : _jsxs(View, { accessibilityLiveRegion: resolved.announcement, style: { alignItems: "center", gap: recipe.itemGap }, children: [_jsx(Text, { variant: "title", align: "center", children: state.title }), state.description ? _jsx(Text, { tone: "muted", align: "center", children: state.description }) : null] }), stateAction] });
    return _jsxs(View, { testID: testID, style: [{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: designProfile?.material.canvas ? "transparent" : colors.bg }, layoutStyle], children: [header ?? _jsxs(View, { style: { flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }, children: [leading, _jsxs(View, { style: { flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }, children: [_jsx(Text, { variant: profileLayout ? "heading" : "titleLarge", ...(profileLayout?.centered ? { align: "center" } : {}), accessibilityRole: "header", children: title }), description ? _jsx(Text, { tone: "muted", ...(profileLayout?.centered ? { align: "center" } : {}), children: description }) : null] }), actions] }), notice ? _jsx(View, { style: { paddingHorizontal: padding }, children: notice }) : null, scroll === "screen" || resolved.replacesContent ? _jsx(ScrollView, { ...scrollProps, ref: scrollRef, style: { flex: 1 }, keyboardShouldPersistTaps: "handled", contentContainerStyle: { flexGrow: 1, padding }, accessibilityState: { busy: resolved.busy }, children: body })
                : _jsx(View, { style: { flex: 1, minHeight: 0, padding }, children: body }), footer ? _jsx(View, { style: { padding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }, children: footer }) : null] });
}
export function SettingsScreen({ profile, sections, ...props }) {
    const { colors } = useHjmNativeTheme();
    // Match the unshaded settings groups on Web; separators preserve hierarchy without gray cards.
    return _jsx(ScreenLayout, { ...props, children: _jsxs(Stack, { gap: "xl", children: [profile, sections.map(section => _jsx(Section, { title: section.title, ...(section.description === undefined ? {} : { description: section.description }), children: _jsx(View, { style: { borderTopWidth: 1, borderColor: colors.border }, children: section.children }) }, section.id))] }) });
}
export function NotificationInboxScreen({ filters, children, notice, ...props }) {
    return _jsx(ScreenLayout, { ...props, notice: _jsxs(Stack, { gap: "sm", children: [notice, filters] }), children: children });
}
export function NotificationItem({ read, statusLabel, timestamp, description, ...props }) {
    const emphasis = { hjmTitleEmphasis: read ? "regular" : "strong" };
    return _jsx(ListRow, { ...props, ...emphasis, description: [description, `${statusLabel} · ${timestamp}`].filter(Boolean).join("\n") });
}
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, scroll = "content", ...props }) {
    return _jsx(ScreenLayout, { ...props, scroll: scroll, footer: !props.state || props.state.kind === "ready" ? composer : null });
}
export function MessageComposer({ value, label, sendLabel, disabled = false, pending = false, onValueChange, onSend, maxLength, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }) {
    validateMessageAttachments(attachments);
    if (attachments.length && !onRemoveAttachment)
        throw new TypeError("Attachments require a removal callback");
    const canSend = !sendDisabled && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
    const locked = disabled || pending;
    // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
    const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
    const { colors, tokens } = useHjmNativeTheme();
    const compactField = { hjmCompactMultiline: true };
    const attach = attachmentAction ? _jsx(IconButton, { label: attachmentAction.label, tone: "ghost", disabled: locked || (attachmentAction.disabled ?? false), onPress: attachmentAction.onPress, children: attachmentAction.icon }) : null;
    const send = sendIcon ? _jsx(IconButton, { label: sendLabel, size: sendPresentation === "circle" ? "small" : "medium", shape: "circle", tone: sendPresentation === "circle" ? "primary" : "ghost", disabled: !canSend, loading: pending, onPress: () => { if (canSend)
            onSend(value); }, children: sendIcon }) : _jsx(Button, { disabled: !canSend, loading: pending, onPress: () => { if (canSend)
            onSend(value); }, children: sendLabel });
    return _jsxs(Stack, { gap: "sm", children: [context, replyTo ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", children: [_jsxs(Stack, { gap: "xxs", children: [_jsx(Text, { variant: "caption", emphasis: "strong", children: replyTo.author }), _jsx(Text, { variant: "caption", tone: "muted", children: replyTo.excerpt })] }), _jsx(IconButton, { label: replyTo.cancelLabel, tone: "ghost", disabled: locked, onPress: replyTo.onCancel, children: _jsx(FixedGlyph, { children: "\u00D7" }) })] }) : null, attachments.length ? _jsxs(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", contentContainerStyle: { gap: tokens.spacing.sm, alignItems: "center" }, children: [attachments.map(item => _jsxs(View, { style: { width: screenPatternRecipe.attachmentSize, height: screenPatternRecipe.attachmentSize }, children: [_jsx(View, { style: { width: "100%", height: "100%", overflow: "hidden", borderRadius: tokens.radius.md }, children: item.preview }), _jsx(View, { style: { position: "absolute", top: 0, right: 0 }, children: _jsx(IconButton, { label: item.removeLabel, tone: "ghost", size: "small", disabled: locked, onPress: () => onRemoveAttachment?.(item.id), children: _jsx(View, { style: { backgroundColor: colors.bg, borderRadius: tokens.radius.full, width: screenPatternRecipe.attachmentRemoveSize, height: screenPatternRecipe.attachmentRemoveSize, alignItems: "center", justifyContent: "center" }, children: _jsx(FixedGlyph, { fontSize: 18, lineHeight: 24, children: "\u00D7" }) }) }) })] }, item.id)), attach] }) : null, _jsxs(View, { style: { flexDirection: "row", alignItems: "flex-end", gap: screenPatternRecipe.itemGap }, children: [_jsx(TextArea, { ...compactField, ref: inputRef, maxLength: maxLength, leadingAction: leadingAction, shape: "large", accessibilityLabel: label, placeholder: label, value: value, disabled: locked, layoutStyle: { flex: 1 }, onValueChange: onValueChange, minVisibleLines: screenPatternRecipe.composerMinLines, maxVisibleLines: screenPatternRecipe.composerMaxLines, ...(sendIcon ? { trailing: _jsx(View, { style: { alignSelf: "center", marginStart: tokens.spacing.sm, marginEnd: sendPresentation === "circle" ? tokens.spacing.xs - tokens.spacing.md : 0 }, children: hasContent || pending ? send : attach }) } : {}) }), sendIcon ? null : send] })] });
}
export function ChatMessage({ direction, author, timestamp, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent = false }) {
    const { colors, tokens } = useHjmNativeTheme();
    const outgoing = direction === "outgoing";
    const [offset, setOffset] = useState(0);
    // SwipeActions reveals row controls and requires an optional gesture peer; reply commits
    // on release and stays in the core timeline without capturing vertical scrolling.
    const gesture = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_, state) => !!replyAction && !replyAction.disabled && Math.abs(state.dx) > 12 && Math.abs(state.dx) > Math.abs(state.dy) * 2,
        onPanResponderMove: (_, state) => setOffset(Math.max(-72, Math.min(72, state.dx))),
        onPanResponderRelease: (_, state) => { setOffset(0); if (replyAction && !replyAction.disabled && isReplySwipe(state.dx, state.dy))
            replyAction.onPress(); },
        onPanResponderTerminate: () => setOffset(0),
        onPanResponderTerminationRequest: () => true,
    }), [replyAction]);
    const canReply = !!replyAction && !replyAction.disabled;
    const replyAccessibility = canReply ? {
        accessible: true,
        accessibilityActions: [{ name: "reply", label: replyAction.label }],
        onAccessibilityAction: (event) => { if (event.nativeEvent.actionName === "reply")
            replyAction.onPress(); },
    } : {};
    const captionCarriesReply = interactiveContent && !reactions;
    const meta = timestamp || deliveryLabel ? `${timestamp}${deliveryLabel ? ` · ${deliveryLabel}` : ""}` : "";
    const bubbleStyle = { backgroundColor: outgoing ? colors.surfaceAccent : colors.bg, borderWidth: outgoing ? 0 : 1, borderColor: colors.border, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm, gap: tokens.spacing.xs };
    const bubbleContent = _jsxs(_Fragment, { children: [reply && !replyLink ? _jsx(View, { style: { borderStartWidth: 2, borderColor: colors.contentBrand, paddingStart: tokens.spacing.xs }, children: reply }) : null, children] });
    return _jsxs(View, { ...gesture.panHandlers, style: { transform: [{ translateX: offset }], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", gap: tokens.spacing.xs }, children: [!outgoing ? avatar : null, _jsxs(View, { style: { maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: tokens.spacing.xxs, alignItems: outgoing ? "flex-end" : "flex-start" }, children: [author ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply && !meta ? replyAccessibility : {}), children: author }) : null, reply && replyLink ? _jsx(Button, { tone: "ghost", accessibilityLabel: replyLink.label, onPress: replyLink.onPress, children: reply }) : null, reactions ? _jsx(MessageReactions, { ...reactions, interactiveContent: interactiveContent, ...(replyAction ? { replyAction } : {}), children: _jsx(View, { style: bubbleStyle, children: bubbleContent }) }) : _jsx(View, { style: bubbleStyle, accessible: !interactiveContent, ...(interactiveContent ? {} : replyAccessibility), children: bubbleContent }), meta || actions ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", children: [meta ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply ? replyAccessibility : {}), children: meta }) : null, actions] }) : null] }), outgoing ? avatar : null] });
}
//# sourceMappingURL=screens.js.map