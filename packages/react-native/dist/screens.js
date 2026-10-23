import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe } from "@hjmds/design-contracts/screen-patterns";
import { cornerAccessoryPlacements, iconButtonRecipe, topBarRecipe } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions, ReactionSummaryButton, ReactionSummaryText, omitReactionSummary } from "./internal/message-reactions.js";
import { MediaAlbumView, useMediaAlbumIndex } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
// Loading/failed page rendered inside `mediaAlbum.renderPage` (2026-10-18); comment rows use the same component.
export { MediaAlbumPageStatus } from "./internal/media-album.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, PanResponder, Platform, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { Spinner } from "./internal/spinner.js";
import { KeyboardAvoidanceContext, useInsideKeyboardAvoidance, useKeyboardOverlap, useScrollFocusedInputIntoView } from "./keyboard.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { ScreenFooterContext, resolveScreenBottomPadding } from "./internal/screen-footer.js";
import { ScreenBodyInsetContext } from "./internal/screen-body-inset.js";
import { BottomNavigationInsetContext } from "./internal/bottom-navigation-inset.js";
import { BottomEntryFocusBoundary, InitialFocusProvider, useInitialFocusScope } from "./internal/initial-focus.js";
import { listRowScrollRoom } from "./internal/list-row-scroll-room.js";
import { useScreenPullDismiss } from "./internal/screen-dismiss.js";
import { isReplySwipe, timestampRevealOffset, canSubmitMessage, validateMessageAttachments, resolveScreenContentState, resolveCompositionStateMinHeight, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, resolveChatReactionSummary, typingIndicatorRecipe, chatDateSeparatorRecipe, screenHeaderRecipe, validateScreenExit, resolveScreenHostInsets, screenHostDefaults, initialFocusDefaults } from "@hjmds/design-contracts/screen-patterns";
import { motion } from "@hjmds/design-contracts/foundations";
import { Stack, Text } from "./primitives.js";
import { Heading } from "./heading.js";
import { ListRow } from "./data-display.js";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "./provider.js";
const ScreenRefreshContext = createContext(null);
// ScrollView/VirtualizedList clone this element with `style` (and the scroll view as `children` on Android); pass them on.
function HjmRefreshControl({ refresh, ...props }) {
    const { palette } = useHjmNativeTheme();
    // A product visual replaces the system spinner; the control stays for the gesture and the iOS top inset.
    const tint = refresh.productIndicator ? "transparent" : resolveColorReference(screenPatternRecipe.refresh.tint, palette);
    const plate = refresh.productIndicator ? "transparent" : resolveColorReference(screenPatternRecipe.refresh.background, palette);
    return _jsx(RefreshControl, { ...props, refreshing: refresh.refreshing, onRefresh: refresh.onRefresh, tintColor: tint, colors: [tint], progressBackgroundColor: plate, progressViewOffset: refresh.progressViewOffset });
}
/**
 * The enclosing ScreenLayout's pull to refresh for a `scroll="content"` list: `<FlatList refreshControl={<ScreenRefreshControl />} />`.
 * State, colors and the product indicator come from that ScreenLayout's `onRefresh`/`refreshing`/`loadingIndicator`.
 */
export function ScreenRefreshControl(props) {
    const refresh = useContext(ScreenRefreshContext);
    if (refresh === null)
        throw new TypeError("ScreenRefreshControl must render inside a ScreenLayout with onRefresh");
    return _jsx(HjmRefreshControl, { ...props, refresh: refresh });
}
export function ScreenLayout({ title, titleBadge, titleLeading, titleVisibility = "visible", headerAlignment = "center", header, headerPosition = "flow", scrollEdgeEffect, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, loadingIndicator, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps, pullToDismiss = false, keyboardAvoidance = true, safeAreaBottom = 0, safeAreaTop = 0, initialFocus = initialFocusDefaults.screen, onRefresh, refreshing = false, refreshLabel, hjmBodyInlinePadding }) {
    if (exit)
        validateScreenExit(exit, false);
    if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0)
        throw new RangeError("ScreenLayout safeAreaTop must be non-negative");
    if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0)
        throw new RangeError("ScreenLayout safeAreaBottom must be non-negative");
    if (pullToDismiss && (exit?.kind !== "close" || scroll !== "screen" || header != null))
        throw new TypeError("ScreenLayout pullToDismiss requires its own close exit and screen scrolling");
    if (onRefresh !== undefined) {
        if (!refreshLabel?.trim())
            throw new TypeError("ScreenLayout onRefresh requires a localized refreshLabel");
        // Both read a downward pull at the top of the body; one gesture cannot mean close and reload.
        if (pullToDismiss)
            throw new TypeError("ScreenLayout onRefresh cannot be combined with pullToDismiss");
        if (scrollProps?.refreshControl)
            throw new TypeError("ScreenLayout owns the refresh control with onRefresh; drop scrollProps.refreshControl");
    }
    const dismissal = useScreenPullDismiss(pullToDismiss && !exit?.disabled, exit?.onPress, testID, exit?.label);
    // A pull-dismiss sheet exposes its close action on the handle, without a second header row.
    const leading = exit && !pullToDismiss ? _jsx(ScreenExitButton, { ...exit }) : null;
    const insideAvoidance = useInsideKeyboardAvoidance();
    const avoidKeyboard = keyboardAvoidance && !insideAvoidance;
    const rootRef = useRef(null);
    const keyboardOverlap = useKeyboardOverlap(rootRef, avoidKeyboard);
    const bodyScroll = useRef(null);
    const focusScope = useInitialFocusScope({ mode: initialFocus });
    const trackScroll = useScrollFocusedInputIntoView(bodyScroll, avoidKeyboard);
    // ScrollView decorates object refs with scrollTo/scrollToEnd; mirror that instance into the host ref
    // after commit (child layout effects run before host effects) instead of passing a callback ref.
    useLayoutEffect(() => {
        if (typeof scrollRef === "function")
            scrollRef(bodyScroll.current);
        else if (scrollRef)
            scrollRef.current = bodyScroll.current;
    });
    const [overlayHeaderHeight, setOverlayHeaderHeight] = useState(0);
    const overlayHeader = headerPosition === "overlay" && header != null;
    const [bodyTop, setBodyTop] = useState(0);
    const refresh = useMemo(() => onRefresh === undefined ? null : {
        refreshing, onRefresh, productIndicator: loadingIndicator != null, progressViewOffset: overlayHeader ? overlayHeaderHeight : 0,
    }, [loadingIndicator, onRefresh, overlayHeader, overlayHeaderHeight, refreshing]);
    const [leadingWidth, setLeadingWidth] = useState(0), [actionsWidth, setActionsWidth] = useState(0);
    const sideWidth = Math.max(leadingWidth, actionsWidth);
    const hasMark = titleLeading !== undefined && titleLeading !== null && titleLeading !== false;
    const showHeader = titleVisibility === "visible" || hasMark || !!leading || !!actions;
    const resolved = resolveScreenContentState(state);
    const { colors, environment, designProfile } = useHjmNativeTheme();
    const presentation = suppliedPresentation ?? designProfile?.screens.overview;
    const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
    const recipe = screenPatternRecipe;
    const padding = contentInset === "none" ? 0 : recipe.padding;
    // body-edge (review S5#9): list rows supply their own 16pt inset, so the body adds none; ChatScreen's narrower
    // timeline gutter only replaces the shared default gutter.
    const bodyInline = contentInset === "default" ? hjmBodyInlinePadding ?? padding : 0;
    // Icon-only route headers need no title breathing room: otherwise the 60pt
    // heading plus full body inset leaves category tabs detached from navigation.
    const compactHeader = header == null && showHeader && headerAlignment === "center" && titleVisibility === "hidden" && !hasMark;
    const headerVerticalPadding = compactHeader ? screenHeaderRecipe.compactPaddingVertical : screenHeaderRecipe.paddingVertical;
    // body-bleed: a map or canvas body has no gutter on any side; header, notice and footer keep theirs.
    const bleed = contentInset === "body-bleed";
    // A notice can contain navigation tabs; keep its separation from body filters.
    const bodyPaddingTop = bleed ? 0 : compactHeader && !notice ? Math.min(padding, screenHeaderRecipe.compactBodyTop) : padding;
    // The last region (footer, else body) owns the bottom inset once: max(gutter, safe area), never gutter + inset.
    // An overlay BottomNavigation covers `navigationInset` of the screen bottom (its safe area included), so the last
    // region keeps the gutter above the bar instead of each tab screen adding a spacer (BottomNavigationInsetProvider).
    // This is the only place the inset is applied: `scroll="content"` lists inside must not add it again.
    const navigationInset = useContext(BottomNavigationInsetContext);
    const lastRegionBottom = (gutter) => {
        const edge = resolveScreenBottomPadding(gutter, safeAreaBottom, keyboardOverlap > 0);
        return navigationInset > 0 && keyboardOverlap === 0 ? Math.max(edge, gutter + navigationInset) : edge;
    };
    const bottomPadding = lastRegionBottom(padding);
    // A bleeding last body still clears the safe area and the bar, only without the gutter.
    const bodyPaddingBottom = footer ? (bleed ? 0 : padding) : bleed ? lastRegionBottom(0) : bottomPadding;
    const ready = contentAlignment === "center" ? _jsx(View, { style: { marginVertical: "auto", flexShrink: 0, width: "100%" }, children: children }) : children;
    // body-edge/body-bleed hand the body gutter to product content (rows, a map); the shared state group has no inset
    // of its own, so it keeps the screen gutter instead of putting copy against the screen edge.
    const stateInline = contentInset === "body-edge" || bleed ? padding : 0;
    const body = state.kind === "ready" ? _jsx(ScreenBodyInsetContext.Provider, { value: bodyInline, children: ready }) : _jsxs(View, { style: { marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap, paddingHorizontal: stateInline }, children: [resolved.busy ? (loadingIndicator ? _jsx(View, { accessible: true, accessibilityRole: "progressbar", accessibilityLabel: [state.title, state.description].filter(Boolean).join(". "), accessibilityState: { busy: true }, accessibilityLiveRegion: "polite", style: { alignItems: "center" }, children: _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsxs(View, { accessibilityRole: state.kind === "error" ? "alert" : "text", accessibilityLiveRegion: resolved.announcement, style: { alignItems: "center", gap: recipe.itemGap }, children: [_jsx(Text, { variant: resolved.titleVariant, align: "center", children: state.title }), state.description ? _jsx(Text, { tone: "muted", align: "center", children: state.description }) : null] }), stateAction] });
    // The mark is decorative beside a visible title (hidden from assistive tech, as TopBar titleLeading); standing
    // alone it becomes the header, named by `title`.
    const mark = hasMark ? _jsx(View, { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexShrink: 0, alignItems: "center", justifyContent: "center" }, children: titleLeading }) : null;
    // A mark labels its title, so the two form one non-wrapping group whose heading shrinks and wraps beside the mark.
    // In the wrapping title row the heading kept its natural width and a long title dropped under a lone mark
    // (2026-10-23, same fault as StatisticGroup and CompositionLayout); the badge still wraps after the group.
    const markedTitle = (heading) => mark ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexShrink: 1, minWidth: 0, maxWidth: "100%" }, children: [mark, _jsx(View, { style: { flexShrink: 1, minWidth: 0 }, children: heading })] }) : heading;
    const standaloneMark = (centered) => mark ? _jsx(View, { accessible: true, accessibilityRole: "header", accessibilityLabel: title, style: { alignItems: centered ? "center" : "flex-start" }, children: mark }) : null;
    const Root = pullToDismiss ? Animated.View : View;
    return _jsx(Root, { ref: rootRef, onAccessibilityEscape: pullToDismiss ? dismissal.close : undefined, testID: testID, accessibilityLabel: titleVisibility === "hidden" || header ? title : undefined, onTouchStart: focusScope.onTouchStart, style: [{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : colors.bg, ...(keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : {}) }, layoutStyle, ...(pullToDismiss ? [{ transform: [{ translateY: dismissal.offset }] }] : [])], children: _jsx(ScreenRefreshContext.Provider, { value: refresh, children: _jsx(KeyboardAvoidanceContext.Provider, { value: insideAvoidance || avoidKeyboard, children: _jsxs(InitialFocusProvider, { scope: focusScope, children: [dismissal.handle, scrollEdgeEffect ? _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: "absolute", top: 0, start: 0, end: 0, height: (overlayHeader ? overlayHeaderHeight : safeAreaTop) + recipe.padding, zIndex: 1 }, children: scrollEdgeEffect }) : null, overlayHeader ? _jsx(View, { pointerEvents: "box-none", onLayout: event => setOverlayHeaderHeight(event.nativeEvent.layout.height), style: { position: "absolute", top: 0, start: 0, end: 0, zIndex: 2 }, children: header }) : header ?? (!showHeader ? null : headerAlignment === "center" ? _jsxs(View, { style: { minHeight: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingHorizontal: padding, paddingVertical: headerVerticalPadding, flexDirection: "row", alignItems: "center", gap: recipe.itemGap }, children: [_jsx(View, { style: { minWidth: sideWidth, flexShrink: 0, alignItems: "flex-start" }, children: _jsx(View, { onLayout: event => setLeadingWidth(event.nativeEvent.layout.width), style: { alignSelf: "flex-start", flexShrink: 0, flexDirection: "row", alignItems: "center" }, children: leading }) }), _jsx(View, { style: { flex: 1, minWidth: 0, alignItems: "center", gap: 4 }, children: titleVisibility === "visible" ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: "center", layoutStyle: { flexWrap: "wrap" }, children: [markedTitle(_jsx(Heading, { level: screenHeaderRecipe.centeredTitleLevel, semanticLevel: 1, align: "center", children: title })), titleBadge] }) : standaloneMark(true) }), _jsx(View, { style: { minWidth: sideWidth, flexShrink: 0, alignItems: "flex-end" }, children: _jsx(View, { onLayout: event => setActionsWidth(event.nativeEvent.layout.width), style: { alignSelf: "flex-end", flexShrink: 0, flexDirection: "row", alignItems: "center", gap: topBarRecipe.gap }, children: actions }) })] }) : _jsxs(View, { style: { flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }, children: [leading, _jsx(View, { style: { flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }, children: titleVisibility === "visible" ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: profileLayout?.centered ? "center" : "start", wrap: true, children: [markedTitle(_jsx(Heading, { level: screenHeaderRecipe.titleLevel, semanticLevel: 1, ...(profileLayout?.centered ? { align: "center" } : {}), children: title })), titleBadge] }) : standaloneMark(!!profileLayout?.centered) }), _jsx(Stack, { axis: "inline", align: "center", gap: topBarRecipe.gap, children: actions })] })), notice ? _jsx(View, { style: { paddingHorizontal: padding }, children: notice }) : null, scroll === "screen" || resolved.replacesContent ? _jsx(ScrollView, { ...scrollProps, ...(refresh ? { refreshControl: _jsx(HjmRefreshControl, { refresh: refresh }) } : {}), onLayout: refresh ? event => setBodyTop(event.nativeEvent.layout.y) : undefined, ref: bodyScroll, style: { flex: 1 }, keyboardShouldPersistTaps: "handled", scrollEventThrottle: scrollProps?.scrollEventThrottle ?? 16, onScroll: event => { trackScroll(event); scrollProps?.onScroll?.(event); }, alwaysBounceVertical: pullToDismiss || scrollProps?.alwaysBounceVertical, onScrollBeginDrag: event => { dismissal.onScrollBeginDrag(event); scrollProps?.onScrollBeginDrag?.(event); }, onScrollEndDrag: event => { dismissal.onScrollEndDrag(event); scrollProps?.onScrollEndDrag?.(event); }, contentContainerStyle: { flexGrow: 1, padding, paddingTop: bodyPaddingTop + (overlayHeader ? overlayHeaderHeight : header == null && !showHeader ? safeAreaTop : 0), paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }, accessibilityState: { busy: resolved.busy }, children: body })
                            : _jsx(View, { onLayout: refresh ? event => setBodyTop(event.nativeEvent.layout.y) : undefined, style: { flex: 1, minHeight: 0, padding, paddingTop: bodyPaddingTop + (overlayHeader ? overlayHeaderHeight : header == null && !showHeader ? safeAreaTop : 0), paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }, children: body }), refresh?.refreshing && refresh.productIndicator && state.kind === "ready" ? _jsx(View, { pointerEvents: "none", accessible: true, accessibilityRole: "progressbar", accessibilityLabel: refreshLabel, accessibilityState: { busy: true }, accessibilityLiveRegion: "polite", testID: "hjm-screen-refresh-indicator", style: { position: "absolute", top: bodyTop + refresh.progressViewOffset + recipe.refresh.indicatorOffset, start: 0, end: 0, alignItems: "center", zIndex: 1 }, children: _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: loadingIndicator }) }) : null, footer ? _jsx(View, { style: { padding, paddingBottom: bottomPadding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }, children: _jsx(ScreenFooterContext.Provider, { value: contentInset === "none" ? null : { bottomPadding }, children: _jsx(BottomEntryFocusBoundary, { children: footer }) }) }) : null] }) }) }) });
}
/**
 * The outer host of routes (around a navigator or one screen): the full window, painted with the canvas, padded by
 * the provider's window insets for `edges`. Replaces product `SafeAreaView` + `colors.bg` wrappers (2026-10-23).
 */
export function ScreenHost({ children, edges = screenHostDefaults.edges, surface = screenHostDefaults.surface, testID }) {
    const { colors } = useHjmNativeTheme();
    const padding = resolveScreenHostInsets(edges, useHjmNativeSafeAreaInsets());
    if (surface !== "default" && surface !== "transparent")
        throw new TypeError(`Unsupported ScreenHost surface: ${String(surface)}`);
    return _jsx(View, { testID: testID, style: { flex: 1, minHeight: 0, width: "100%", backgroundColor: surface === "transparent" ? "transparent" : colors.bg, paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left }, children: children });
}
/**
 * Styles for a product scroller that owns the body with `scroll="content"` (FlatList, SectionList): `style` reaches
 * across the ScreenLayout body gutter and `contentContainerStyle` pads it back, so items stay on the gutter while the
 * clip moves to the screen edges. A bleeding CollectionRail inside then scrolls edge to edge instead of being cut by
 * the list (spint home re-added a gutter per section under `body-edge` to get one edge-to-edge rail, 2026-10-17).
 * Outside a ScreenLayout body it returns zero room.
 */
export function useScreenBodyScrollRoom() {
    const room = listRowScrollRoom(useContext(ScreenBodyInsetContext));
    return { style: room.viewport, contentContainerStyle: room.content };
}
export function SettingsScreen({ profile, sections, ...props }) {
    // Settings group labels are subordinate to the screen title. Generic Section uses
    // editorial headings, which overwhelmed ordinary rows in Spint (2026-10-08 QA).
    return _jsx(ScreenLayout, { ...props, children: _jsxs(Stack, { gap: "md", children: [profile, sections.map(section => _jsxs(Stack, { gap: "xs", children: [_jsx(Text, { variant: "label", emphasis: "strong", tone: "muted", accessibilityRole: "header", children: section.title }), section.description ? _jsx(Text, { variant: "caption", tone: "muted", children: section.description }) : null, section.children] }, section.id))] }) });
}
export function NotificationInboxScreen({ filters, children, notice, ...props }) {
    return _jsx(ScreenLayout, { ...props, notice: _jsxs(Stack, { gap: "sm", children: [notice, filters] }), children: children });
}
export function NotificationItem({ read, statusLabel, timestamp, description, unreadLabel, ...props }) {
    if (unreadLabel !== undefined && unreadLabel.trim().length === 0)
        throw new TypeError("NotificationItem unreadLabel must not be empty");
    // Status·time is a separate muted caption, as on Web, not a second description line.
    const privateProps = { hjmTitleEmphasis: read ? "regular" : "strong", hjmMeta: `${statusLabel} · ${timestamp}`,
        ...(!read && unreadLabel !== undefined ? { hjmUnreadLabel: unreadLabel } : {}) };
    return _jsx(ListRow, { ...props, ...privateProps, ...(description === undefined ? {} : { description }) });
}
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", ...props }) {
    // An empty conversation must still allow its first message; unavailable states hide input.
    const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
    // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
    // Conversations center the peer between back and tools and use the measured 10pt timeline gutter (2026-10-16).
    return _jsx(ScreenLayout, { ...props, scroll: scroll, hjmBodyInlinePadding: chatMessageRecipe.timelineInset, titleLeading: avatar, footer: showComposer ? _jsxs(View, { style: { position: "relative" }, children: [jumpToLatest ? _jsx(View, { style: { position: "absolute", bottom: "100%", end: 0, marginBottom: chatMessageRecipe.jumpToLatestGap + screenPatternRecipe.padding }, children: _jsx(IconButton, { label: jumpToLatest.label, size: "small", shape: "circle", tone: "secondary", onPress: jumpToLatest.onPress, children: jumpToLatest.icon }) }) : null, composer] }) : null });
}
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, descriptionAlign = "start", error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }) {
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
    // The error is announced by TextArea's shared FieldMessage (internal/field-frame.tsx), on Android and iOS.
    const compactField = { hjmCompactMultiline: true, hjmDescriptionAlign: descriptionAlign };
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
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], mediaAlbum, actions, replyAction, replyLink, reactions, children, interactiveContent = false }) {
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
    // Pressable photos and album page buttons keep their own targets, like any interactive bubble content.
    const interactive = interactiveContent || media.some(item => !!item.onPress) || mediaAlbum !== undefined;
    const captionCarriesReply = interactive && !reactions;
    const menu = useRef(null);
    const summary = reactions?.summary;
    const reactionMenu = reactions ? omitReactionSummary(reactions) : undefined;
    const summaryItems = summary ? resolveChatReactionSummary(summary) : [];
    const summaryButton = reactions && summary && summaryItems.length ? (summary.readOnly ? _jsx(ReactionSummaryText, { label: summary.label, items: summaryItems }) : _jsx(ReactionSummaryButton, { label: summary.label, items: summaryItems, selected: reactions.value, disabled: reactions.disabled ?? false, onPress: () => menu.current?.open() })) : null;
    // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
    const visibleTime = revealTime || !display.showTimestamp ? "" : timestamp;
    const meta = [visibleTime, deliveryLabel].filter(Boolean).join(" · ");
    const surface = outgoing ? colors.surfaceAccent : colors.surface;
    // Filled, borderless bubbles separate authors by surface and side (2026-10-16 timeline standard).
    const showTail = bubbleTail && display.showTail && !((media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === ""));
    // Tighten the first corner to join the overlapping rounded tip.
    const bubbleStyle = { backgroundColor: surface, borderRadius: chatMessageRecipe.bubbleRadius, ...(showTail ? (outgoing ? { borderTopEndRadius: chatMessageRecipe.tailCornerRadius } : { borderTopStartRadius: chatMessageRecipe.tailCornerRadius }) : {}), paddingHorizontal: chatMessageRecipe.bubblePaddingInline, paddingVertical: chatMessageRecipe.bubblePaddingBlock, gap: tokens.spacing.xs, flexShrink: 1 };
    // The reference keeps the tip on the top edge and curves its underside into the bubble; overlap joins the rounded corner.
    const tail = showTail ? _jsx(View, { pointerEvents: "none", accessible: false, style: { position: "absolute", top: 0, ...(outgoing ? { end: -chatMessageRecipe.tailWidth + 1, borderTopEndRadius: 1, borderBottomEndRadius: chatMessageRecipe.tailHeight } : { start: -chatMessageRecipe.tailWidth + 1, borderTopStartRadius: 1, borderBottomStartRadius: chatMessageRecipe.tailHeight }), width: chatMessageRecipe.tailWidth + chatMessageRecipe.tailCornerRadius, height: chatMessageRecipe.tailHeight, backgroundColor: surface } }) : null;
    // A quoted reply heads the bubble and is divided from the answer, as in the measured reference.
    const quote = replyQuote ? _jsxs(View, { style: { gap: 2 }, children: [_jsx(Text, { emphasis: "strong", children: replyQuote.title }), _jsx(Text, { tone: "muted", numberOfLines: 1, children: replyQuote.excerpt })] }) : reply;
    // The quote stays inside the bubble; with replyLink a tap on it jumps to the original (2026-10-16 reference).
    const columns = media.length ? resolveChatMediaColumns(media.length) : 1;
    const tile = media.length > 1 ? (chatMessageRecipe.mediaWidth - chatMessageRecipe.mediaGap * (columns - 1)) / columns : chatMessageRecipe.mediaWidth;
    // The page index lives here so the hold-menu preview (a second render of the bubble) shows the same page.
    validateMediaSetChoice(media.length > 0, mediaAlbum !== undefined);
    const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(mediaAlbum);
    const mediaBlock = mediaAlbum ? _jsx(MediaAlbumView, { album: mediaAlbum, index: albumIndex, onIndexChange: setAlbumIndex, width: chatMessageRecipe.mediaWidth, radius: chatMessageRecipe.bubbleRadius })
        : media.length ? _jsx(View, { style: { width: chatMessageRecipe.mediaWidth, flexDirection: "row", flexWrap: "wrap", gap: chatMessageRecipe.mediaGap, borderRadius: chatMessageRecipe.bubbleRadius, overflow: "hidden" }, children: media.map(item => { const size = { width: tile, aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? _jsx(Pressable, { accessibilityRole: "imagebutton", accessibilityLabel: item.label, onPress: item.onPress, style: size, children: item.preview }, item.id) : _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: item.label, style: size, children: item.preview }, item.id); }) }) : null;
    // A photo-only message drops the bubble surface so the photo itself is the message.
    const photoOnly = (media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
    // Web bubbles accept plain text children; RN needs a Text host, so the public children contract matches.
    const body = typeof children === "string" || typeof children === "number" ? _jsx(Text, { children: children }) : children;
    const bubbleContent = _jsxs(_Fragment, { children: [tail, quote ? _jsx(View, { style: { borderBottomWidth: 1, borderColor: colors.border, paddingBottom: tokens.spacing.xs }, children: replyLink ? _jsx(Pressable, { accessibilityRole: "link", accessibilityLabel: replyLink.label, onPress: replyLink.onPress, children: quote }) : quote }) : null, mediaBlock, photoOnly ? null : body] });
    // Later bubbles of a run keep the avatar column so their edges line up under the first bubble.
    const avatarSlot = !avatar ? null : display.showAvatar ? _jsx(View, { style: { width: chatMessageRecipe.avatarSize, alignItems: "center" }, children: avatar }) : _jsx(View, { accessible: false, style: { width: chatMessageRecipe.avatarSize } });
    return _jsxs(View, { ...gesture.panHandlers, style: { position: "relative", overflow: "hidden", marginTop: display.spacingBefore,
            // Reserve tip room only where it protrudes: the trailing edge of own messages, or the leading edge
            // when no avatar column hosts it. Symmetric 8pt padding narrowed every row (2026-10-16 review).
            ...(bubbleTail ? (outgoing ? { paddingEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingStart: chatMessageRecipe.tailWidth }) : {}) }, children: [revealTime ? _jsx(Animated.View, { pointerEvents: "none", style: { position: "absolute", ...(outgoing ? { right: 0, alignItems: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, justifyContent: "center", opacity: offset.interpolate({ inputRange: [-16, 0, 16], outputRange: [1, 0, 1], extrapolate: "clamp" }) }, children: _jsx(Text, { variant: "caption", tone: "muted", children: timestamp }) }) : null, _jsxs(Animated.View, { style: { transform: [{ translateX: offset }], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", alignItems: "flex-start", gap: chatMessageRecipe.avatarGap }, children: [!outgoing ? avatarSlot : null, _jsxs(View, { style: { maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: chatMessageRecipe.authorGap, alignItems: outgoing ? "flex-end" : "flex-start" }, children: [author && display.showAuthor && !outgoing ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply && !meta ? replyAccessibility : {}), children: author }) : null, _jsxs(View, { style: { flexDirection: outgoing ? "row-reverse" : "row", alignItems: "flex-end", gap: chatMessageRecipe.metaGap, alignSelf: "stretch" }, children: [reactionMenu ? _jsx(MessageReactions, { ...reactionMenu, menuRef: menu, align: outgoing ? "end" : "start", interactiveContent: interactive, ...(timestamp ? { menuTitle: timestamp } : {}), ...(replyAction && !replyAction.disabled ? { replyAction } : {}), children: _jsx(View, { style: photoOnly ? { flexShrink: 1 } : bubbleStyle, children: bubbleContent }) }) : _jsx(View, { style: photoOnly ? { flexShrink: 1 } : bubbleStyle, accessible: !interactive, ...(interactive ? {} : replyAccessibility), children: bubbleContent }), meta || actions || summaryButton ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexShrink: 0 }, children: [summaryButton, meta ? _jsx(Text, { variant: "caption", tone: "muted", ...(captionCarriesReply ? replyAccessibility : {}), children: meta }) : null, actions] }) : null] })] }), outgoing ? avatarSlot : null] })] });
}
export function CompositionLayout({ title, titleSize = "default", headingLevel = 3, description, badge, leading, actions, notice, children, footer, aside, footerAside, state = { kind: "ready" }, stateAction, stateHeight = "fit", loadingIndicator, layoutStyle }) {
    const resolved = resolveScreenContentState(state);
    const stateMinHeight = resolveCompositionStateMinHeight(stateHeight);
    // The floor sits on a host around the state group: layoutStyle is placement-only and excludes sizes.
    const stateGroup = state.kind === "ready" ? null : _jsxs(Stack, { gap: "sm", align: "center", justify: "center", layoutStyle: { flex: 1 }, children: [resolved.busy ? (loadingIndicator ? _jsx(View, { accessible: true, accessibilityRole: "progressbar", accessibilityLabel: [state.title, state.description].filter(Boolean).join(". "), accessibilityState: { busy: true }, accessibilityLiveRegion: "polite", style: { alignItems: "center", gap: screenPatternRecipe.itemGap }, children: _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: loadingIndicator }) }) : _jsx(Spinner, { label: [state.title, state.description].filter(Boolean).join(". ") })) : _jsxs(View, { accessibilityRole: state.kind === "error" ? "alert" : "text", accessibilityLiveRegion: "polite", children: [_jsx(Text, { variant: resolved.titleVariant, align: "center", children: state.title }), state.description ? _jsx(Text, { tone: "muted", align: "center", children: state.description }) : null] }), stateAction] });
    // Compact section titles follow the 2026-10-19 mobile typography direction; headingLevel still owns document semantics.
    const content = _jsxs(_Fragment, { children: [title || description || badge || leading || actions ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [leading ? _jsxs(Stack, { axis: "inline", gap: "sm", align: "center", layoutStyle: { flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%" }, children: [leading, _jsxs(Stack, { gap: "xxs", layoutStyle: { flexShrink: 1, minWidth: 0 }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? (titleSize === "compact" ? _jsx(Text, { variant: "body", fontRole: "ui", accessibilityRole: "header", "aria-level": headingLevel, style: { fontWeight: "500" }, children: title }) : _jsx(Heading, { level: "level5", semanticLevel: headingLevel, children: title })) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] })] }) : _jsxs(Stack, { gap: "xxs", layoutStyle: { flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%" }, children: [_jsxs(Stack, { axis: "inline", gap: "xs", align: "center", layoutStyle: { flexWrap: "wrap" }, children: [title ? (titleSize === "compact" ? _jsx(Text, { variant: "body", fontRole: "ui", accessibilityRole: "header", "aria-level": headingLevel, style: { fontWeight: "500" }, children: title }) : _jsx(Heading, { level: "level5", semanticLevel: headingLevel, children: title })) : null, badge] }), description ? _jsx(Text, { tone: "muted", children: description }) : null] }), actions] }) : null, notice, state.kind === "ready" ? children : stateMinHeight === null ? stateGroup : _jsx(View, { testID: "hjm-composition-state-region", style: { flex: 1, minHeight: stateMinHeight }, children: stateGroup })] });
    // Supporting art spans the heading and body, so a long title cannot push it into a separate row.
    // Diairy postcard cards (2026-10-20) exposed the misuse of header actions for this passive content.
    return _jsxs(Stack, { gap: "md", ...(layoutStyle === undefined ? {} : { layoutStyle }), children: [aside ? _jsxs(Stack, { axis: "inline", gap: "md", align: "start", children: [_jsx(Stack, { gap: "md", layoutStyle: { flex: 1, minWidth: 0 }, children: content }), _jsx(Stack, { layoutStyle: { flexShrink: 0, maxWidth: "40%" }, children: aside })] }) : content, footerAside ? _jsxs(Stack, { axis: "inline", gap: "xs", align: "center", justify: "between", wrap: true, children: [footer ? _jsx(Stack, { layoutStyle: { flexGrow: 1, minWidth: 0 }, children: footer }) : null, footerAside] }) : footer] });
}
/** Optional shared command host; passive previews remain compatible with existing router/gesture hosts. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false, separator = false, action }) {
    const r = notificationRecipe, { colors, tokens } = useHjmNativeTheme();
    if (action && !action.label.trim())
        throw new TypeError("NotificationRow action requires a localized label");
    const content = _jsxs(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { flexDirection: "row", alignItems: "center", gap: r.gap, paddingVertical: r.paddingBlock, paddingHorizontal: r.paddingInline, width: "100%", minWidth: 0 }, children: [separator ? _jsx(View, { testID: "hjm-notification-separator", style: { position: "absolute", top: 0, start: r.separatorInsetStart, end: 0, borderTopWidth: 1, borderColor: colors.border } }) : null, _jsxs(View, { style: { width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }, children: [_jsx(View, { style: { width: "100%", height: "100%", overflow: "hidden", borderRadius: r.avatarSize / 2 }, children: avatar }), avatarBadge ? _jsx(View, { style: { position: "absolute", bottom: 0, right: 0, alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: r.avatarBadgeSize / 2, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.surface }, children: avatarBadge }) : null] }), _jsxs(View, { style: { flex: 1, minWidth: 0, gap: r.contentGap }, children: [_jsx(Text, { numberOfLines: r.previewLines, children: preview }), _jsxs(View, { style: { flexDirection: "row", alignItems: "center", gap: r.contentGap }, children: [_jsx(Text, { variant: "caption", tone: "muted", children: metadata }), unread ? _jsx(View, { testID: "hjm-unread-dot", style: { width: r.unreadSize, height: r.unreadSize, borderRadius: r.unreadSize / 2, flexShrink: 0, backgroundColor: colors.contentBrand } }) : null] })] }), thumbnail ? _jsx(View, { style: { width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: tokens.radius.sm }, children: thumbnail }) : null] });
    return action ? _jsx(Pressable, { accessible: true, accessibilityRole: "button", accessibilityLabel: action.label, accessibilityState: { disabled: action.disabled ?? false }, disabled: action.disabled, onPress: () => { if (!action.disabled)
            action.onActivate(); }, style: ({ pressed }) => ({ width: "100%", opacity: action.disabled ? r.interaction.disabledOpacity : pressed ? r.interaction.pressedOpacity : 1 }), children: content }) : content;
}
/** Shared launcher/profile tile; simple activation and gesture-only presentation reuse identical content. */
export function IconTile({ icon, label, overlay, labelLines = 1, ghost = false, frame = iconTileRecipe.defaults.frame, shape = iconTileRecipe.defaults.shape, size = iconTileRecipe.defaults.size, onActivate, activationLabel, activationHint, onLongPress, disabled = false, locked = false, lockedLabel, accessory, accessoryPlacement = iconTileRecipe.defaults.accessoryPlacement, layoutStyle }) {
    const r = iconTileRecipe;
    if (onActivate && !(activationLabel ?? label).trim())
        throw new TypeError("Interactive IconTile requires a label");
    if (locked && (!onActivate || !lockedLabel?.trim()))
        throw new TypeError("A locked IconTile needs onActivate and a lockedLabel");
    if (!cornerAccessoryPlacements.includes(accessoryPlacement))
        throw new TypeError(`Unsupported IconTile accessoryPlacement: ${accessoryPlacement}`);
    const dim = ghost ? r.ghostOpacity : locked ? r.locked.opacity : 1;
    if (onLongPress && !onActivate)
        throw new TypeError("IconTile onLongPress requires onActivate");
    const { colors } = useHjmNativeTheme();
    // A filling icon's edge is known only after layout; the radius follows the measured edge so the shape holds at every
    // cell width (percentage border radii are not relied on across the supported RN versions).
    const [fillEdge, setFillEdge] = useState(r.fillMinSize);
    const edge = size === "fill" ? fillEdge : r.iconSize;
    const framed = frame === "surface";
    const dimensions = size === "fill" ? { width: "100%", minWidth: r.fillMinSize, maxWidth: r.fillMaxSize, aspectRatio: 1 } : { width: r.iconSize, height: r.iconSize };
    const content = _jsxs(View, { style: [{ position: "relative", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible" }, onActivate ? undefined : layoutStyle], children: [_jsxs(View, { onLayout: size === "fill" ? event => setFillEdge(event.nativeEvent.layout.width) : undefined, style: { position: "relative", alignItems: "center", justifyContent: "center", ...dimensions, borderRadius: edge * r.shapes[shape], backgroundColor: framed ? colors.surfaceAlt : "transparent", borderWidth: framed || ghost ? 1 : 0, borderStyle: ghost ? "dashed" : "solid", opacity: dim, borderColor: colors.border }, children: [typeof icon === "function" ? icon({ edge }) : icon, overlay] }), accessory ? _jsx(View, { pointerEvents: "none", accessibilityElementsHidden: onActivate ? true : undefined, importantForAccessibility: onActivate ? "no-hide-descendants" : undefined, style: { position: "absolute", top: 0, left: "50%", marginLeft: -edge / 2, width: edge, height: edge }, children: _jsx(View, { testID: "hjm-icon-tile-accessory", style: [{ position: "absolute", end: -r.accessory.offset }, accessoryPlacement === "top-end" ? { top: -r.accessory.offset } : { bottom: -r.accessory.offset }], children: accessory }) }) : null, _jsx(Text, { variant: "caption", numberOfLines: labelLines, style: { opacity: locked ? r.locked.opacity : undefined, width: "100%", minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, textAlign: "center", fontWeight: "500" }, children: label })] });
    if (!onActivate)
        return content;
    return _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: locked ? `${activationLabel ?? label}, ${lockedLabel}` : activationLabel ?? label, accessibilityHint: activationHint, accessibilityState: { disabled }, disabled: disabled, onPress: () => { if (!disabled)
            onActivate(); }, onLongPress: onLongPress ? () => { if (!disabled)
            onLongPress(); } : undefined, style: ({ pressed }) => [{ minWidth: r.activation.minimumTarget, minHeight: r.activation.minimumTarget, width: "100%", opacity: disabled ? r.activation.disabledOpacity : pressed ? r.activation.pressedOpacity : 1 }, layoutStyle], children: content });
}
/**
 * Incoming "is typing" row for a ChatScreen timeline (2026-10-18 BurnTok DM drew its own). The host shows it only while
 * presence says someone is typing and places it after the last message; HJM owns the bubble, dots and announcement.
 */
export function TypingIndicator({ label, avatar, layoutStyle }) {
    if (!label.trim())
        throw new TypeError("TypingIndicator requires a localized label");
    const { colors, tokens, environment } = useHjmNativeTheme();
    const r = typingIndicatorRecipe, m = chatMessageRecipe;
    const dots = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;
    useEffect(() => {
        if (environment.reducedMotion) {
            dots.forEach(dot => dot.setValue(1));
            return;
        }
        const half = r.cycleMs / 2;
        const pulses = dots.map((dot, index) => {
            dot.setValue(r.restOpacity);
            return Animated.sequence([Animated.delay(index * r.staggerMs), Animated.loop(Animated.sequence([
                    Animated.timing(dot, { toValue: 1, duration: half, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: r.restOpacity, duration: half, useNativeDriver: true }),
                ]))]);
        });
        pulses.forEach(pulse => pulse.start());
        return () => pulses.forEach(pulse => pulse.stop());
    }, [dots, environment.reducedMotion]);
    // A polite status, as Web role="status": Android hears it through the live region; iOS ignores live regions, so it is
    // queued once behind the current speech when the row appears.
    useEffect(() => { if (Platform.OS === "ios")
        AccessibilityInfo.announceForAccessibilityWithOptions(label, { queue: true }); }, [label]);
    return _jsxs(View, { accessible: true, accessibilityLabel: label, accessibilityLiveRegion: "polite", style: [{ flexDirection: "row", alignItems: "flex-start", gap: m.avatarGap, marginTop: m.groupGap, paddingStart: avatar ? 0 : m.tailWidth }, layoutStyle], children: [avatar ? _jsx(View, { style: { width: m.avatarSize, alignItems: "center" }, children: avatar }) : null, _jsx(View, { style: { flexDirection: "row", alignItems: "center", gap: r.dotGap, minHeight: tokens.typography.body.lineHeight + m.bubblePaddingBlock * 2, paddingVertical: m.bubblePaddingBlock, paddingHorizontal: m.bubblePaddingInline, borderRadius: m.bubbleRadius, backgroundColor: colors.surface }, children: dots.map((opacity, index) => _jsx(Animated.View, { style: { width: r.dotSize, height: r.dotSize, borderRadius: r.dotSize / 2, backgroundColor: colors.textMuted, opacity } }, index)) })] });
}
/**
 * Centered date (or time) row between ChatScreen timeline groups (2026-10-18 Utilverse chat drew a caption). Grouping
 * rules stay with the product; the next message keeps its own group gap, so this row adds only the space before it.
 */
export function ChatDateSeparator({ label, layoutStyle }) {
    if (!label.trim())
        throw new TypeError("ChatDateSeparator requires a localized label");
    const r = chatDateSeparatorRecipe;
    return _jsx(View, { style: [{ alignItems: "center", paddingTop: r.paddingTop, paddingBottom: r.paddingBottom }, layoutStyle], children: _jsx(Text, { variant: r.textVariant, tone: r.tone, align: "center", children: label }) });
}
//# sourceMappingURL=screens.js.map