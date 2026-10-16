import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe } from "@hjmds/design-contracts/screen-patterns";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, ScrollView, View } from "react-native";
import { Spinner } from "./internal/spinner.js";
import { KeyboardAvoidanceContext, useInsideKeyboardAvoidance, useKeyboardOverlap, useScrollFocusedInputIntoView } from "./keyboard.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { isReplySwipe, timestampRevealOffset, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, validateScreenExit } from "@hjmds/design-contracts/screen-patterns";
import { motion } from "@hjmds/design-contracts/foundations";
import { Stack, Text } from "./primitives.js";
import { ListRow } from "./data-display.js";
import { useHjmNativeTheme } from "./provider.js";
export function ScreenLayout({ title, titleBadge, titleVisibility = "visible", headerAlignment = "start", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, description, exit, leading: leadingSlot, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps, keyboardAvoidance = true, hjmBodyInlinePadding, hjmTitleLeading }) {
    if (exit)
        validateScreenExit(exit, leadingSlot !== undefined);
    const leading = exit ? _jsx(ScreenExitButton, { ...exit }) : leadingSlot;
    const insideAvoidance = useInsideKeyboardAvoidance();
    const avoidKeyboard = keyboardAvoidance && !insideAvoidance;
    const rootRef = useRef(null);
    const keyboardOverlap = useKeyboardOverlap(rootRef, avoidKeyboard);
    const bodyScroll = useRef(null);
    const trackScroll = useScrollFocusedInputIntoView(bodyScroll, avoidKeyboard);
    // ScrollView decorates object refs with scrollTo/scrollToEnd; mirror that instance into the host ref
    // after commit (child layout effects run before host effects) instead of passing a callback ref.
    useLayoutEffect(() => {
        if (typeof scrollRef === "function")
            scrollRef(bodyScroll.current);
        else if (scrollRef)
            scrollRef.current = bodyScroll.current;
    });
    const [leadingWidth, setLeadingWidth] = useState(0), [actionsWidth, setActionsWidth] = useState(0);
    const sideWidth = Math.max(leadingWidth, actionsWidth);
    const showHeader = titleVisibility === "visible" || !!description || !!leading || !!actions;
    const resolved = resolveScreenContentState(state);
    const { colors, environment, designProfile } = useHjmNativeTheme();
    const presentation = suppliedPresentation ?? designProfile?.screens.overview;
    const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
    const recipe = screenPatternRecipe;
    const padding = contentInset === "none" ? 0 : recipe.padding;
    // Icon-only route headers need no title breathing room: otherwise the 60pt
    // heading plus full body inset leaves category tabs detached from navigation.
    const compactHeader = header == null && showHeader && headerAlignment === "center" && titleVisibility === "hidden" && !description;
    // Titled centered headers match the iOS navigation bar band: 44 control + 4 above/below = 52
    // (2026-10-17 user: top spacing too loose at 60).
    const headerVerticalPadding = compactHeader ? 2 : 4;
    // A notice can contain navigation tabs; keep its separation from body filters.
    const bodyPaddingTop = compactHeader && !notice ? Math.min(padding, 4) : padding;
    const body = state.kind === "ready" ? (contentAlignment === "center" ? _jsx(View, { style: { marginVertical: "auto", flexShrink: 0, width: "100%" }, children: children }) : children) : _jsxs(View, { style: { marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap }, children: [resolved.busy ? _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") }) : _jsxs(View, { accessibilityLiveRegion: resolved.announcement, style: { alignItems: "center", gap: recipe.itemGap }, children: [_jsx(Text, { variant: "title", align: "center", children: state.title }), state.description ? _jsx(Text, { tone: "muted", align: "center", children: state.description }) : null] }), stateAction] });
    return _jsx(View, { ref: rootRef, testID: testID, style: [{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : colors.bg, ...(keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : {}) }, layoutStyle], children: _jsxs(KeyboardAvoidanceContext.Provider, { value: insideAvoidance || avoidKeyboard, children: [header ?? (!showHeader ? null : headerAlignment === "center" ? _jsxs(View, { style: { minHeight: compactHeader ? 48 : 52, paddingHorizontal: padding + sideWidth + recipe.itemGap, paddingVertical: headerVerticalPadding, justifyContent: "center" }, children: [_jsx(View, { onLayout: event => setLeadingWidth(event.nativeEvent.layout.width), style: { position: "absolute", left: padding, top: headerVerticalPadding, bottom: headerVerticalPadding, justifyContent: "center", flexDirection: "row", alignItems: "center" }, children: leading }), _jsxs(View, { style: { minWidth: 0, alignItems: "center", gap: 4 }, children: [titleVisibility === "visible" && _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: "center", layoutStyle: { flexWrap: "wrap" }, children: [hjmTitleLeading, _jsx(Text, { variant: "title", align: "center", accessibilityRole: "header", children: title }), titleBadge] }), description && _jsx(Text, { align: "center", tone: "muted", children: description })] }), _jsx(View, { onLayout: event => setActionsWidth(event.nativeEvent.layout.width), style: { position: "absolute", right: padding, top: headerVerticalPadding, bottom: headerVerticalPadding, justifyContent: "center", flexDirection: "row", alignItems: "center" }, children: actions })] }) : _jsxs(View, { style: { flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }, children: [leading, _jsxs(View, { style: { flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }, children: [titleVisibility === "visible" && _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: profileLayout?.centered ? "center" : "start", wrap: true, children: [_jsx(Text, { variant: profileLayout ? "heading" : "titleLarge", ...(profileLayout?.centered ? { align: "center" } : {}), accessibilityRole: "header", children: title }), titleBadge] }), description ? _jsx(Text, { tone: "muted", ...(profileLayout?.centered ? { align: "center" } : {}), children: description }) : null] }), actions] })), notice ? _jsx(View, { style: { paddingHorizontal: padding }, children: notice }) : null, scroll === "screen" || resolved.replacesContent ? _jsx(ScrollView, { ...scrollProps, ref: bodyScroll, style: { flex: 1 }, keyboardShouldPersistTaps: "handled", scrollEventThrottle: scrollProps?.scrollEventThrottle ?? 16, onScroll: event => { trackScroll(event); scrollProps?.onScroll?.(event); }, contentContainerStyle: { flexGrow: 1, padding, paddingTop: bodyPaddingTop, ...(hjmBodyInlinePadding === undefined || contentInset === "none" ? {} : { paddingHorizontal: hjmBodyInlinePadding }) }, accessibilityState: { busy: resolved.busy }, children: body })
                    : _jsx(View, { style: { flex: 1, minHeight: 0, padding, paddingTop: bodyPaddingTop, ...(hjmBodyInlinePadding === undefined || contentInset === "none" ? {} : { paddingHorizontal: hjmBodyInlinePadding }) }, children: body }), footer ? _jsx(View, { style: { padding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }, children: footer }) : null] }) });
}
export function SettingsScreen({ profile, sections, ...props }) {
    // Settings group labels are subordinate to the screen title. Generic Section uses
    // editorial headings, which overwhelmed ordinary rows in Spint (2026-10-08 QA).
    return _jsx(ScreenLayout, { ...props, children: _jsxs(Stack, { gap: "md", children: [profile, sections.map(section => _jsxs(Stack, { gap: "xs", children: [_jsx(Text, { variant: "label", emphasis: "strong", tone: "muted", accessibilityRole: "header", children: section.title }), section.description ? _jsx(Text, { variant: "caption", tone: "muted", children: section.description }) : null, section.children] }, section.id))] }) });
}
export function NotificationInboxScreen({ filters, children, notice, ...props }) {
    return _jsx(ScreenLayout, { ...props, notice: _jsxs(Stack, { gap: "sm", children: [notice, filters] }), children: children });
}
export function NotificationItem({ read, statusLabel, timestamp, description, ...props }) {
    const emphasis = { hjmTitleEmphasis: read ? "regular" : "strong" };
    return _jsx(ListRow, { ...props, ...emphasis, description: [description, `${statusLabel} · ${timestamp}`].filter(Boolean).join("\n") });
}
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", headerAlignment = "center", ...props }) {
    // An empty conversation must still allow its first message; unavailable states hide input.
    const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
    // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
    // Conversations center the peer between back and tools and use the measured 10pt timeline gutter (2026-10-16).
    return _jsx(ScreenLayout, { ...props, scroll: scroll, headerAlignment: headerAlignment, hjmBodyInlinePadding: chatMessageRecipe.timelineInset, hjmTitleLeading: avatar, footer: showComposer ? _jsxs(View, { style: { position: "relative" }, children: [jumpToLatest ? _jsx(View, { style: { position: "absolute", bottom: "100%", end: 0, marginBottom: chatMessageRecipe.jumpToLatestGap + screenPatternRecipe.padding }, children: _jsx(IconButton, { label: jumpToLatest.label, size: "small", shape: "circle", tone: "secondary", onPress: jumpToLatest.onPress, children: jumpToLatest.icon }) }) : null, composer] }) : null });
}
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }) {
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
    const { colors, tokens } = useHjmNativeTheme();
    const compactField = { hjmCompactMultiline: true };
    const attach = attachmentAction ? _jsx(IconButton, { label: attachmentAction.label, tone: "ghost", disabled: locked || (attachmentAction.disabled ?? false), onPress: attachmentAction.onPress, children: attachmentAction.icon }) : null;
    const send = sendIcon ? _jsx(IconButton, { label: sendLabel, size: sendPresentation === "circle" ? "small" : "medium", shape: "circle", tone: sendPresentation === "circle" ? "primary" : "ghost", disabled: !canSend, loading: pending, onPress: () => { if (canSend)
            onSend(value); }, children: sendIcon }) : _jsx(Button, { disabled: !canSend, loading: pending, onPress: () => { if (canSend)
            onSend(value); }, children: sendLabel });
    const composerBody = _jsxs(_Fragment, { children: [attachments.length ? _jsxs(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "handled", contentContainerStyle: { gap: tokens.spacing.sm, alignItems: "center" }, children: [attachments.map(item => _jsxs(View, { style: { width: screenPatternRecipe.attachmentSize, height: screenPatternRecipe.attachmentSize }, children: [_jsx(View, { style: { width: "100%", height: "100%", overflow: "hidden", borderRadius: tokens.radius.md }, children: item.preview }), _jsx(View, { style: { position: "absolute", top: 0, right: 0 }, children: _jsx(IconButton, { label: item.removeLabel, tone: "ghost", size: "small", disabled: locked || (item.disabled ?? false), onPress: () => { if (!locked && !item.disabled)
                                        onRemoveAttachment?.(item.id); }, children: _jsx(View, { style: { backgroundColor: colors.bg, borderRadius: tokens.radius.full, width: screenPatternRecipe.attachmentRemoveSize, height: screenPatternRecipe.attachmentRemoveSize, alignItems: "center", justifyContent: "center" }, children: _jsx(FixedGlyph, { fontSize: 18, lineHeight: 24, children: "\u00D7" }) }) }) })] }, item.id)), attach] }) : null, _jsxs(View, { style: { flexDirection: "row", alignItems: "flex-end", gap: screenPatternRecipe.itemGap }, children: [leading ? _jsx(View, { style: { alignSelf: "center", flexShrink: 0 }, children: leading }) : null, _jsx(TextArea, { ...compactField, ref: inputRef, maxLength: maxLength, leadingAction: leadingAction, shape: "large", accessibilityLabel: label, placeholder: placeholder, ...(description === undefined ? {} : { description }), ...(error === undefined ? {} : { error }), invalid: invalid, onBlur: onBlur, value: value, disabled: locked, submitBehavior: submitMode === "send" ? "submit" : "newline", onSubmitEditing: () => { if (submitMode === "send" && canSend)
                            onSend(value); }, layoutStyle: { flex: 1 }, onValueChange: onValueChange, minVisibleLines: screenPatternRecipe.composerMinLines, maxVisibleLines: screenPatternRecipe.composerMaxLines, ...(sendIcon ? { trailing: _jsx(View, { style: { alignSelf: "center", marginStart: tokens.spacing.sm, marginEnd: sendPresentation === "circle" ? tokens.spacing.xs - tokens.spacing.md : 0 }, children: _jsx(View, { style: { minWidth: sendDiameter, minHeight: sendDiameter, alignItems: "center", justifyContent: "center" }, children: hasContent || pending ? send : attach }) }) } : {}) }), sendIcon ? null : send] })] });
    const quickRow = quickInserts?.items.length ? _jsx(View, { accessibilityLabel: quickInserts.label, style: { flexDirection: "row", justifyContent: "space-between", gap: composerQuickInsertRecipe.gap }, children: quickInserts.items.map(item => _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: item.label, accessibilityState: { disabled: locked }, disabled: locked, onPress: () => onValueChange(value + item.emoji), 
            // Items share the composer width (max 44pt each) so eight emoji fit even beside a host avatar.
            style: ({ pressed }) => ({ flexGrow: 1, flexShrink: 1, flexBasis: 0, maxWidth: composerQuickInsertRecipe.itemSize, height: composerQuickInsertRecipe.itemSize, borderRadius: composerQuickInsertRecipe.itemSize / 2, alignItems: "center", justifyContent: "center", opacity: locked ? 0.5 : 1, backgroundColor: pressed ? colors.surface : "transparent" }), children: _jsx(FixedGlyph, { fontSize: composerQuickInsertRecipe.emojiSize, lineHeight: composerQuickInsertRecipe.emojiSize + 6, children: item.emoji }) }, item.id)) }) : null;
    return _jsxs(Stack, { gap: "sm", children: [context, quickRow, _jsxs(View, { style: [{ gap: tokens.spacing.sm }, replyTo ? { backgroundColor: colors.surface, borderRadius: tokens.radius.xl, padding: tokens.spacing.sm } : null], children: [replyTo ? _jsxs(View, { style: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing.sm }, children: [_jsxs(View, { style: { flex: 1, minWidth: 0, gap: 2 }, children: [_jsx(Text, { emphasis: "strong", children: replyTo.author }), _jsx(Text, { variant: "caption", tone: "muted", numberOfLines: 1, children: replyTo.excerpt })] }), _jsx(IconButton, { label: replyTo.cancelLabel, tone: "secondary", size: "small", shape: "circle", disabled: locked, onPress: replyTo.onCancel, children: _jsx(FixedGlyph, { children: "\u00D7" }) })] }) : null, composerBody] }), lengthFeedback && limit?.near ? _jsx(Progress, { shape: "circular", label: lengthFeedback.label, value: Math.min(limit.used, limit.max), max: limit.max, valueText: lengthFeedback.formatCount(limit.used, limit.max), children: _jsx(Text, { variant: "caption", children: lengthFeedback.formatCount(limit.used, limit.max) }) }) : null] });
}
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], actions, replyAction, replyLink, reactions, children, interactiveContent = false }) {
    const { colors, tokens, environment } = useHjmNativeTheme();
    const display = resolveChatMessageGroupDisplay(groupPosition);
    const revealTime = timestampPresentation === "swipe" && !!timestamp;
    const outgoing = direction === "outgoing";
    const offset = useRef(new Animated.Value(0)).current;
    const resetOffset = () => {
        offset.stopAnimation();
        if (environment.reducedMotion)
            offset.setValue(0);
        else
            Animated.timing(offset, { toValue: 0, duration: motion.normal, useNativeDriver: true }).start();
    };
    useEffect(() => () => offset.stopAnimation(), [offset]);
    // SwipeActions reveals row controls and requires an optional gesture peer; reply commits
    // on release and stays in the core timeline without capturing vertical scrolling.
    const gesture = useMemo(() => PanResponder.create({
        // Capture horizontal intent before nested message Pressables can retain the touch.
        onMoveShouldSetPanResponderCapture: (_, state) => revealTime && timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) > 0,
        onMoveShouldSetPanResponder: (_, state) => revealTime ? timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) > 0 : !!replyAction && !replyAction.disabled && Math.abs(state.dx) > 12 && Math.abs(state.dx) > Math.abs(state.dy) * 2,
        onPanResponderGrant: () => offset.stopAnimation(),
        onPanResponderMove: (_, state) => offset.setValue(revealTime ? (outgoing ? -1 : 1) * timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) : Math.max(-72, Math.min(72, state.dx))),
        onPanResponderRelease: (_, state) => { resetOffset(); if (!revealTime && replyAction && !replyAction.disabled && isReplySwipe(state.dx, state.dy))
            replyAction.onPress(); },
        onPanResponderTerminate: resetOffset,
        onPanResponderTerminationRequest: () => true,
    }), [replyAction, revealTime, outgoing, environment.reducedMotion, offset]);
    const canReply = !!replyAction && !replyAction.disabled;
    // The in-bubble quote link is merged into the bubble element, so expose it as a bubble action too.
    const quoteLink = replyLink && (replyQuote || reply) ? replyLink : undefined;
    const replyAccessibility = canReply || quoteLink ? {
        accessible: true,
        accessibilityActions: [...(canReply ? [{ name: "reply", label: replyAction.label }] : []), ...(quoteLink ? [{ name: "openOriginal", label: quoteLink.label }] : [])],
        onAccessibilityAction: (event) => { if (event.nativeEvent.actionName === "reply" && canReply)
            replyAction.onPress();
        else if (event.nativeEvent.actionName === "openOriginal")
            quoteLink?.onPress(); },
    } : {};
    // Pressable photos keep their own targets, like any interactive bubble content.
    const interactive = interactiveContent || media.some(item => !!item.onPress);
    const captionCarriesReply = interactive && !reactions;
    // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
    const visibleTime = revealTime || !display.showTimestamp ? "" : timestamp;
    const meta = [visibleTime, deliveryLabel].filter(Boolean).join(" · ");
    const surface = outgoing ? colors.surfaceAccent : colors.surface;
    // Filled, borderless bubbles separate authors by surface and side (2026-10-16 timeline standard).
    const showTail = bubbleTail && display.showTail && !(media.length > 0 && !reply && !replyQuote && (children === null || children === undefined || children === false || children === ""));
    // The tipped corner tightens so the tip continues the bubble's top edge instead of a separate bump.
    const bubbleStyle = { backgroundColor: surface, borderRadius: chatMessageRecipe.bubbleRadius, ...(showTail ? (outgoing ? { borderTopEndRadius: chatMessageRecipe.tailCornerRadius } : { borderTopStartRadius: chatMessageRecipe.tailCornerRadius }) : {}), paddingHorizontal: chatMessageRecipe.bubblePaddingInline, paddingVertical: chatMessageRecipe.bubblePaddingBlock, gap: tokens.spacing.xs, flexShrink: 1 };
    // A flat-topped triangle in the bubble surface points outward from the run's first top corner.
    const tail = showTail ? _jsx(View, { pointerEvents: "none", accessible: false, style: { position: "absolute", top: 0, ...(outgoing ? { end: -chatMessageRecipe.tailWidth + 1, borderEndWidth: chatMessageRecipe.tailWidth, borderEndColor: "transparent" } : { start: -chatMessageRecipe.tailWidth + 1, borderStartWidth: chatMessageRecipe.tailWidth, borderStartColor: "transparent" }), width: 0, height: 0, borderTopWidth: chatMessageRecipe.tailHeight, borderTopColor: surface } }) : null;
    // A quoted reply heads the bubble and is divided from the answer, as in the measured reference.
    const quote = replyQuote ? _jsxs(View, { style: { gap: 2 }, children: [_jsx(Text, { emphasis: "strong", children: replyQuote.title }), _jsx(Text, { tone: "muted", numberOfLines: 1, children: replyQuote.excerpt })] }) : reply;
    // The quote stays inside the bubble; with replyLink a tap on it jumps to the original (2026-10-16 reference).
    const columns = media.length ? resolveChatMediaColumns(media.length) : 1;
    const tile = media.length > 1 ? (chatMessageRecipe.mediaWidth - chatMessageRecipe.mediaGap * (columns - 1)) / columns : chatMessageRecipe.mediaWidth;
    const mediaBlock = media.length ? _jsx(View, { style: { width: chatMessageRecipe.mediaWidth, flexDirection: "row", flexWrap: "wrap", gap: chatMessageRecipe.mediaGap, borderRadius: chatMessageRecipe.bubbleRadius, overflow: "hidden" }, children: media.map(item => { const size = { width: tile, aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? _jsx(Pressable, { accessibilityRole: "imagebutton", accessibilityLabel: item.label, onPress: item.onPress, style: size, children: item.preview }, item.id) : _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: item.label, style: size, children: item.preview }, item.id); }) }) : null;
    // A photo-only message drops the bubble surface so the photo itself is the message.
    const photoOnly = media.length > 0 && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
    const bubbleContent = _jsxs(_Fragment, { children: [tail, quote ? _jsx(View, { style: { borderBottomWidth: 1, borderColor: colors.border, paddingBottom: tokens.spacing.xs }, children: replyLink ? _jsx(Pressable, { accessibilityRole: "link", accessibilityLabel: replyLink.label, onPress: replyLink.onPress, children: quote }) : quote }) : null, mediaBlock, photoOnly ? null : children] });
    // Later bubbles of a run keep the avatar column so their edges line up under the first bubble.
    const avatarSlot = !avatar ? null : display.showAvatar ? _jsx(View, { style: { width: chatMessageRecipe.avatarSize, alignItems: "center" }, children: avatar }) : _jsx(View, { accessible: false, style: { width: chatMessageRecipe.avatarSize } });
    return _jsxs(View, { ...gesture.panHandlers, style: { position: "relative", overflow: "hidden", marginTop: display.spacingBefore,
            // Reserve tip room only where it protrudes: the trailing edge of own messages, or the leading edge
            // when no avatar column hosts it. Symmetric 8pt padding narrowed every row (2026-10-16 review).
            ...(bubbleTail ? (outgoing ? { paddingEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingStart: chatMessageRecipe.tailWidth }) : {}) }, children: [revealTime ? _jsx(Animated.View, { pointerEvents: "none", style: { position: "absolute", ...(outgoing ? { right: 0, alignItems: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, justifyContent: "center", opacity: offset.interpolate({ inputRange: [-16, 0, 16], outputRange: [1, 0, 1], extrapolate: "clamp" }) }, children: _jsx(Text, { variant: "caption", tone: "muted", children: timestamp }) }) : null, _jsxs(Animated.View, { style: { transform: [{ translateX: offset }], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", alignItems: "flex-start", gap: chatMessageRecipe.avatarGap }, children: [!outgoing ? avatarSlot : null, _jsxs(View, { style: { maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: chatMessageRecipe.authorGap, alignItems: outgoing ? "flex-end" : "flex-start" }, children: [author && display.showAuthor && !outgoing ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply && !meta ? replyAccessibility : {}), children: author }) : null, _jsxs(View, { style: { flexDirection: outgoing ? "row-reverse" : "row", alignItems: "flex-end", gap: chatMessageRecipe.metaGap, alignSelf: "stretch" }, children: [reactions ? _jsx(MessageReactions, { ...reactions, align: outgoing ? "end" : "start", interactiveContent: interactive, ...(timestamp ? { menuTitle: timestamp } : {}), ...(replyAction && !replyAction.disabled ? { replyAction } : {}), children: _jsx(View, { style: photoOnly ? { flexShrink: 1 } : bubbleStyle, children: bubbleContent }) }) : _jsx(View, { style: photoOnly ? { flexShrink: 1 } : bubbleStyle, accessible: !interactive, ...(interactive ? {} : replyAccessibility), children: bubbleContent }), meta || actions ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexShrink: 0 }, children: [meta ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply ? replyAccessibility : {}), children: meta }) : null, actions] }) : null] })] }), outgoing ? avatarSlot : null] })] });
}
export function CompositionLayout({ title, headingLevel = 3, description, badge, leading, actions, notice, children, footer, state = { kind: "ready" }, stateAction, loadingIndicator, layoutStyle }) {
    const resolved = resolveScreenContentState(state);
    return _jsxs(Stack, { gap: "md", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [title || description || badge || leading || actions ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [leading, _jsxs(Stack, { gap: "xxs", layoutStyle: { flex: 1, minWidth: 0 }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? _jsx(Text, { variant: "title", accessibilityRole: "header", "aria-level": headingLevel, children: title }) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), actions] }) : null, notice, state.kind === "ready" ? children : _jsxs(Stack, { gap: "sm", align: "center", justify: "center", layoutStyle: { flex: 1 }, children: [resolved.busy ? (loadingIndicator ? _jsx(View, { accessible: true, accessibilityRole: "progressbar", accessibilityLabel: [state.title, state.description].filter(Boolean).join(". "), accessibilityState: { busy: true }, accessibilityLiveRegion: "polite", style: { alignItems: "center", gap: screenPatternRecipe.itemGap }, children: _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsxs(View, { accessibilityRole: state.kind === "error" ? "alert" : "text", accessibilityLiveRegion: "polite", children: [_jsx(Text, { variant: "title", align: "center", children: state.title }), state.description ? _jsx(Text, { tone: "muted", align: "center", children: state.description }) : null] }), stateAction] }), footer] });
}
/** The host supplies navigation/disabled state and the complete accessible name. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false }) {
    const r = notificationRecipe, { colors, tokens } = useHjmNativeTheme();
    return _jsxs(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexDirection: "row", alignItems: "center", gap: r.gap, paddingVertical: r.paddingBlock, paddingHorizontal: r.paddingInline, width: "100%", minWidth: 0 }, children: [_jsxs(View, { style: { width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }, children: [_jsx(View, { style: { width: "100%", height: "100%", overflow: "hidden", borderRadius: r.avatarSize / 2 }, children: avatar }), avatarBadge ? _jsx(View, { style: { position: "absolute", bottom: 0, right: 0, alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: r.avatarBadgeSize / 2, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.surface }, children: avatarBadge }) : null] }), _jsxs(View, { style: { flex: 1, minWidth: 0, gap: r.contentGap }, children: [_jsx(Text, { numberOfLines: r.previewLines, children: preview }), _jsxs(View, { style: { flexDirection: "row", alignItems: "center", gap: r.contentGap }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: metadata }), unread ? _jsx(View, { testID: "hjm-unread-dot", style: { width: r.unreadSize, height: r.unreadSize, borderRadius: r.unreadSize / 2, flexShrink: 0, backgroundColor: colors.contentBrand } }) : null] })] }), thumbnail ? _jsx(View, { style: { width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: tokens.radius.sm }, children: thumbnail }) : null] });
}
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export function IconTile({ icon, label, overlay, labelLines = 1, ghost = false }) {
    const r = iconTileRecipe;
    const { colors } = useHjmNativeTheme();
    return _jsxs(View, { style: { alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible" }, children: [_jsxs(View, { style: { position: "relative", alignItems: "center", justifyContent: "center", width: r.iconSize, height: r.iconSize, borderRadius: r.iconSize * .22, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderStyle: ghost ? "dashed" : "solid", opacity: ghost ? r.ghostOpacity : 1, borderColor: colors.border }, children: [icon, overlay] }), _jsx(Text, { variant: "caption", numberOfLines: labelLines, style: { width: "100%", minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, textAlign: "center", fontWeight: "500" }, children: label })] });
}
//# sourceMappingURL=screens.js.map