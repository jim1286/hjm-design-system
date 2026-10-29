import { IdentityAction } from "./internal/identity-action.js";
import { withAlpha } from "@hjmds/design-contracts/colors";
import type { ComponentRef } from "react";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe, type IconTileArtwork, type IconTileFrame, type IconTileShape, type IconTileSize } from "@hjmds/design-contracts/screen-patterns";
import { cornerAccessoryPlacements, iconButtonRecipe, topBarRecipe, type CornerAccessoryPlacement } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit, type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen, type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions, ReactionSummaryButton, ReactionSummaryText, omitReactionSummary, type MessageMenuAction, type MessageReactionsHandle } from "./internal/message-reactions.js";
import { MediaAlbumView, useMediaAlbumIndex, type MediaAlbum } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
export type { MediaAlbum, MediaAlbumPageStatusProps } from "./internal/media-album.js";
// Loading/failed page rendered inside `mediaAlbum.renderPage` (2026-10-18); comment rows use the same component.
export { MediaAlbumPageStatus } from "./internal/media-album.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref, type ReactNode } from "react";
import { AccessibilityInfo, Animated, PanResponder, Platform, Pressable, RefreshControl, ScrollView, View, type AccessibilityActionEvent, type RefreshControlProps, type TextInput, type ScrollViewProps } from "react-native";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { Spinner } from "./internal/spinner.js";
import { KeyboardAvoidanceContext, useInsideKeyboardAvoidance, useKeyboardOverlap, useScrollFocusedInputIntoView } from "./keyboard.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { ScreenFooterContext, resolveScreenBottomPadding } from "./internal/screen-footer.js";
import { ScreenBodyInsetContext } from "./internal/screen-body-inset.js";
import { BottomNavigationInsetContext } from "./internal/bottom-navigation-inset.js";
import { BottomEntryFocusBoundary, InitialFocusProvider, useInitialFocusScope } from "./internal/initial-focus.js";
import { listRowScrollRoom } from "./internal/list-row-scroll-room.js";
import { useScreenPullDismiss } from "./internal/screen-dismiss.js";
import { isReplySwipe, timestampRevealOffset, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, resolveCompositionStateMinHeight, type CompositionStateHeight, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, resolveChatReactionSummary, type ChatReactionSummary, typingIndicatorRecipe, chatDateSeparatorRecipe, screenHeaderRecipe, validateScreenExit, resolveScreenHostInsets, screenHostDefaults, type ScreenHostEdge, type ScreenHostSurface, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState, type ScreenContentInset, initialFocusDefaults, type ScreenInitialFocus } from "@hjmds/design-contracts/screen-patterns";
import { motion } from "@hjmds/design-contracts/foundations";
import { InheritedTextColorContext } from "./internal/text-colors.js";
import { Stack, Text } from "./primitives.js";
import { Heading } from "./heading.js";
import { ListRow, type ListRowProps } from "./data-display.js";
import type { ListRowPrivateProps } from "./internal/list-row-private.js";
import type { FieldPrivateProps } from "./internal/field-private.js";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/** Internal: lets ChatScreen narrow only the timeline gutter without a public spacing escape hatch. */
type ScreenLayoutPrivateProps = Readonly<{ hjmBodyInlinePadding?: number }>;
type ScreenRefreshState = Readonly<{ refreshing: boolean; onRefresh: () => void; productIndicator: boolean; progressViewOffset: number }>;
const ScreenRefreshContext = createContext<ScreenRefreshState | null>(null);

// ScrollView/VirtualizedList clone this element with `style` (and the scroll view as `children` on Android); pass them on.
function HjmRefreshControl({ refresh, ...props }: Omit<RefreshControlProps, "refreshing" | "onRefresh"> & Readonly<{ refresh: ScreenRefreshState }>) {
  const { palette } = useHjmNativeTheme();
  // A product visual replaces the system spinner; the control stays for the gesture and the iOS top inset.
  const tint = refresh.productIndicator ? "transparent" : resolveColorReference(screenPatternRecipe.refresh.tint, palette);
  const plate = refresh.productIndicator ? "transparent" : resolveColorReference(screenPatternRecipe.refresh.background, palette);
  return <RefreshControl {...props} refreshing={refresh.refreshing} onRefresh={refresh.onRefresh} tintColor={tint} colors={[tint]} progressBackgroundColor={plate} progressViewOffset={refresh.progressViewOffset} />;
}

export type ScreenRefreshControlProps = Omit<RefreshControlProps, "refreshing" | "onRefresh" | "tintColor" | "colors" | "progressBackgroundColor" | "progressViewOffset">;
/**
 * The enclosing ScreenLayout's pull to refresh for a `scroll="content"` list: `<FlatList refreshControl={<ScreenRefreshControl />} />`.
 * State, colors and the product indicator come from that ScreenLayout's `onRefresh`/`refreshing`/`loadingIndicator`.
 */
export function ScreenRefreshControl(props: ScreenRefreshControlProps) {
  const refresh = useContext(ScreenRefreshContext);
  if (refresh === null) throw new TypeError("ScreenRefreshControl must render inside a ScreenLayout with onRefresh");
  return <HjmRefreshControl {...props} refresh={refresh} />;
}

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** The shared header owns badge placement; the product supplies its meaning and label. */
  titleBadge?: ReactNode;
  /**
   * Identity mark or artwork before the title (team logo, tool artwork). Decorative: the title stays the header and
   * the accessible name. With `titleVisibility="hidden"` the mark stands alone in the title slot as the header,
   * named by `title` (2026-10-18: yajalal team detail and Utilverse tool headers rebuilt the header to get this).
   */
  titleLeading?: ReactNode;
  /** Optional navigation for the identity mark; the product owns the destination and translated label. */
  titleLeadingAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;
  /** Hide duplicate route names; retain titles that identify a subject or a task. */
  titleVisibility?: "visible" | "hidden";
  /** Centered by default (2026-10-17 user rule); `start` remains available. Extra actions sit at the trailing edge. */
  headerAlignment?: "start" | "center";
  /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
  header?: ReactNode;
  /** Overlay the custom header; shared scrolling reserves its measured height for the first content. */
  headerPosition?: "flow" | "overlay";
  /** Decorative top scroll-edge material. The host owns its measured frame and excludes it from input/a11y. */
  scrollEdgeEffect?: ReactNode;
  /**
   * Hosts that already inset routes avoid applying the shared gutter twice (`none`). `body-edge` keeps the header,
   * notice and footer gutter and drops only the body's horizontal padding so full-width list rows own their inset.
   * `body-bleed` keeps the same gutters and drops every body padding, so a map or canvas runs edge to edge.
   */
  contentInset?: ScreenContentInset;
  /** Center a product prompt in the available body without inventing a query state. */
  contentAlignment?: "start" | "center";
  /** Keep a product wallpaper supplied by the outer host visible. */
  surface?: "default" | "transparent";
  /** Explicit layout wins over the nearest design profile. */
  presentation?: DesignProfileScreenPresentation;
  /** @deprecated Screen headers no longer show supporting copy (2026-10-18). Move required guidance into body content. Retained until the next major API cleanup. */
  description?: string;
  /**
   * Leaving this screen (back, close, settings exit): icon-only button fixed at the header's leading edge.
   * The leading edge has no free slot (2026-10-17): every product use was a hand-made back button.
   */
  exit?: ScreenExit;
  actions?: ReactNode;
  notice?: ReactNode;
  footer?: ReactNode;
  state?: ScreenContentState;
  stateAction?: ReactNode;
  /** Brand visual for `state.kind === "loading"`; the shared state group keeps copy, centering and announcement (as CompositionLayout). */
  loadingIndicator?: ReactNode;
  children?: ReactNode;
  /** Use content when the child is a FlatList/virtualized timeline. */
  scroll?: "screen" | "content";
  /** Host owns safe areas and navigation bars, avoiding double insets inside nested routes. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * Bottom safe-area inset of the window edge this screen reaches (`useSafeAreaInsets().bottom`; 0 above a tab bar
   * or inside a host that already insets the bottom). The footer — or the body when there is none — pads
   * max(16, inset) instead of the host's inset plus 16, matching Web's `max(padding, env(safe-area-inset-bottom))`
   * (2026-10-17 user report: too much space below buttons). Pass it instead of a bottom SafeAreaView edge, never both.
   */
  safeAreaBottom?: number;
  /** Top window inset for an edge-to-edge body without a header; backgrounds still reach the window edge. */
  safeAreaTop?: number;
  testID?: string;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
  /** Native reading route: handle or a new downward pull at the top calls the existing close exit. */
  pullToDismiss?: boolean;
  /**
   * Keeps the footer and focused field above the keyboard (default on, 2026-10-16 keyboard audit).
   * Skipped inside KeyboardAvoiding or a keyboard-aware Sheet/Dialog, which already handle it.
   */
  keyboardAvoidance?: boolean;
  /**
   * Focus the marked, else first enabled input once on page entry (default `first-input`). Never steals an existing
   * input's focus or focuses below an overlay. A pending entry can wait for data; after user interaction it ends.
   * Bottom sheets disable automatic focus for this screen and all nested inputs, regardless of this prop.
   */
  initialFocus?: ScreenInitialFocus;
  /**
   * Pull to refresh, owned by the screen (2026-10-23: spint Home/Notifications/Cell hid the system spinner with
   * `tintColor="transparent"` and drew FlowerSpinner in a list header by hand). `scroll="screen"` attaches the control
   * to the body; a `scroll="content"` list passes `<ScreenRefreshControl />` as its `refreshControl`. With
   * `loadingIndicator` the system spinner is transparent and that product visual shows below the body top while
   * `refreshing`; without it the system spinner uses `screenPatternRecipe.refresh`. Bind only the user's pull: a
   * background refetch should not set `refreshing`. Requires `refreshLabel`; not with `pullToDismiss` or
   * `scrollProps.refreshControl`.
   */
  onRefresh?: () => void;
  /** The product's pull-refresh request is running (default false). */
  refreshing?: boolean;
  /** Spoken name of the refresh in progress, in the product language (e.g. "Loading new posts"). */
  refreshLabel?: string;
  scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator" | "onScroll" | "onScrollBeginDrag" | "onScrollEndDrag" | "scrollEventThrottle" | "alwaysBounceVertical" | "automaticallyAdjustKeyboardInsets">;
}>;

export function ScreenLayout({ title, titleBadge, titleLeading, titleLeadingAction, titleVisibility = "visible", headerAlignment = "center", header, headerPosition = "flow", scrollEdgeEffect, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, loadingIndicator, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps, pullToDismiss = false, keyboardAvoidance = true, safeAreaBottom = 0, safeAreaTop = 0, initialFocus = initialFocusDefaults.screen, onRefresh, refreshing = false, refreshLabel, hjmBodyInlinePadding }: ScreenLayoutProps & ScreenLayoutPrivateProps) {
  if (exit) validateScreenExit(exit, false);
  if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) throw new RangeError("ScreenLayout safeAreaTop must be non-negative");
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) throw new RangeError("ScreenLayout safeAreaBottom must be non-negative");
  if (pullToDismiss && (exit?.kind !== "close" || scroll !== "screen" || header != null)) throw new TypeError("ScreenLayout pullToDismiss requires its own close exit and screen scrolling");
  if (onRefresh !== undefined) {
    if (!refreshLabel?.trim()) throw new TypeError("ScreenLayout onRefresh requires a localized refreshLabel");
    // Both read a downward pull at the top of the body; one gesture cannot mean close and reload.
    if (pullToDismiss) throw new TypeError("ScreenLayout onRefresh cannot be combined with pullToDismiss");
    if (scrollProps?.refreshControl) throw new TypeError("ScreenLayout owns the refresh control with onRefresh; drop scrollProps.refreshControl");
  }
  const dismissal = useScreenPullDismiss(pullToDismiss && !exit?.disabled, exit?.onPress, testID, exit?.label);
  // A pull-dismiss sheet exposes its close action on the handle, without a second header row.
  const leading = exit && !pullToDismiss ? <ScreenExitButton {...exit} /> : null;
  const insideAvoidance = useInsideKeyboardAvoidance();
  const avoidKeyboard = keyboardAvoidance && !insideAvoidance;
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const keyboardOverlap = useKeyboardOverlap(rootRef, avoidKeyboard);
  const bodyScroll = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const focusScope = useInitialFocusScope({ mode: initialFocus });
  const trackScroll = useScrollFocusedInputIntoView(bodyScroll, avoidKeyboard);
  // ScrollView decorates object refs with scrollTo/scrollToEnd; mirror that instance into the host ref
  // after commit (child layout effects run before host effects) instead of passing a callback ref.
  useLayoutEffect(() => {
    if (typeof scrollRef === "function") scrollRef(bodyScroll.current);
    else if (scrollRef) (scrollRef as { current: ComponentRef<typeof ScrollView> | null }).current = bodyScroll.current;
  });
  const [overlayHeaderHeight, setOverlayHeaderHeight] = useState(0);
  const overlayHeader = headerPosition === "overlay" && header != null;
  const [bodyTop, setBodyTop] = useState(0);
  const refresh = useMemo<ScreenRefreshState | null>(() => onRefresh === undefined ? null : {
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
  const lastRegionBottom = (gutter: number) => {
    const edge = resolveScreenBottomPadding(gutter, safeAreaBottom, keyboardOverlap > 0);
    return navigationInset > 0 && keyboardOverlap === 0 ? Math.max(edge, gutter + navigationInset) : edge;
  };
  const bottomPadding = lastRegionBottom(padding);
  // A bleeding last body still clears the safe area and the bar, only without the gutter.
  const bodyPaddingBottom = footer ? (bleed ? 0 : padding) : bleed ? lastRegionBottom(0) : bottomPadding;
  const ready = contentAlignment === "center" ? <View style={{ marginVertical: "auto", flexShrink: 0, width: "100%" }}>{children}</View> : children;
  // body-edge/body-bleed hand the body gutter to product content (rows, a map); the shared state group has no inset
  // of its own, so it keeps the screen gutter instead of putting copy against the screen edge.
  const stateInline = contentInset === "body-edge" || bleed ? padding : 0;
  const body = state.kind === "ready" ? <ScreenBodyInsetContext.Provider value={bodyInline}>{ready}</ScreenBodyInsetContext.Provider> : <View style={{ marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap, paddingHorizontal: stateInline }}>
    {/* Keep loading copy in Spinner's accessibility name rather than a visible
        second status, matching the shared spinner-only loading contract. */}
    {resolved.busy ? (loadingIndicator ? <View accessible accessibilityRole="progressbar" accessibilityLabel={[state.title, state.description].filter(Boolean).join(". ")} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={{ alignItems: "center" }}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{loadingIndicator}</View></View> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <View accessibilityRole={state.kind === "error" ? "alert" : "text"} accessibilityLiveRegion={resolved.announcement} style={{ alignItems: "center", gap: recipe.itemGap }}>
      <Text variant={resolved.titleVariant} align="center">{state.title}</Text>
      {state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}
    </View>}{stateAction}
  </View>;
  // The mark is decorative beside a visible title (hidden from assistive tech, as TopBar titleLeading); standing
  // alone it becomes the header, named by `title`.
  const mark = hasMark ? titleLeadingAction ? <IdentityAction action={titleLeadingAction}>{titleLeading}</IdentityAction> : <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexShrink: 0, alignItems: "center", justifyContent: "center" }}>{titleLeading}</View> : null;
  // A mark labels its title, so the two form one non-wrapping group whose heading shrinks and wraps beside the mark.
  // In the wrapping title row the heading kept its natural width and a long title dropped under a lone mark
  // (2026-10-23, same fault as StatisticGroup and CompositionLayout); the badge still wraps after the group.
  const markedTitle = (heading: ReactNode) => mark ? <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexShrink: 1, minWidth: 0, maxWidth: "100%"}}>{mark}<View style={{ flexShrink: 1, minWidth: 0 }}>{heading}</View></Stack> : heading;
  // Badge keeps itself start-aligned in column layouts; the title slot owns vertical centering beside the heading.
  const badge = titleBadge != null ? <View style={{ alignSelf: "center" }}>{titleBadge}</View> : null;
  const standaloneMark = (centered: boolean) => mark ? <View accessible accessibilityRole="header" accessibilityLabel={title} style={{ alignItems: centered ? "center" : "flex-start" }}>{mark}</View> : null;
  const Root = pullToDismiss ? Animated.View : View;
  return <Root ref={rootRef} onAccessibilityEscape={pullToDismiss ? dismissal.close : undefined} testID={testID} accessibilityLabel={titleVisibility === "hidden" || header ? title : undefined} onTouchStart={focusScope.onTouchStart} style={[{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : colors.bg, ...(keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : {}) }, layoutStyle, ...(pullToDismiss ? [{ transform: [{ translateY: dismissal.offset }] }] : [])]}>
    <ScreenRefreshContext.Provider value={refresh}><KeyboardAvoidanceContext.Provider value={insideAvoidance || avoidKeyboard}><InitialFocusProvider scope={focusScope}>
    {dismissal.handle}
    {scrollEdgeEffect ? <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", top: 0, start: 0, end: 0, height: (overlayHeader ? overlayHeaderHeight : safeAreaTop) + recipe.padding, zIndex: 1 }}>{scrollEdgeEffect}</View> : null}
    {/* Not TopBar: this is the page heading (titleLarge, actions wrap under the title at
        large text), while TopBar is a fixed-height app bar with a single-line title and safe-area top.
        Importing it would also pull navigation.js (tabs/gooey indicator) into every screens graph.
        Hosts that want the app bar pass <TopBar> through `header`. */}
    {overlayHeader ? <View pointerEvents="box-none" onLayout={event => setOverlayHeaderHeight(event.nativeEvent.layout.height)} style={{ position: "absolute", top: 0, start: 0, end: 0, zIndex: 2 }}>{header}</View> : header ?? (!showHeader ? null : headerAlignment === "center" ? <View style={{ minHeight: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingHorizontal: padding, paddingVertical: headerVerticalPadding, flexDirection: "row", alignItems: "center", gap: recipe.itemGap }}>
      {/* Minimum side widths keep intrinsic control rows measurable. A fixed width re-constrained
          the caption to its previous measurement and wrapped the settings version inside 44pt.
          Equal side columns center the title; in-flow controls also contribute their height so
          wrapping a title/badge cannot shrink controls and start another Yoga layout cycle. */}
      <View style={{ minWidth: sideWidth, flexShrink: 0, alignItems: "flex-start" }}>
        <View onLayout={event => setLeadingWidth(event.nativeEvent.layout.width)} style={{ alignSelf: "flex-start", flexShrink: 0, flexDirection: "row", alignItems: "center" }}>{leading}</View>
      </View>
      <View style={{ flex: 1, minWidth: 0, alignItems: "center", gap: 4 }}>
        {titleVisibility === "visible" ? <Stack axis="inline" gap="xs" align="center" justify="center" layoutStyle={{flexWrap: "wrap"}}>{markedTitle(<Heading level={screenHeaderRecipe.centeredTitleLevel} semanticLevel={1} align="center">{title}</Heading>)}{badge}</Stack> : standaloneMark(true)}
      </View>
      <View style={{ minWidth: sideWidth, flexShrink: 0, alignItems: "flex-end" }}>
        <View onLayout={event => setActionsWidth(event.nativeEvent.layout.width)} style={{ alignSelf: "flex-end", flexShrink: 0, flexDirection: "row", alignItems: "center", gap: topBarRecipe.gap }}>{actions}</View>
      </View>
    </View> : <View style={{ flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }}>
      {/* Reserve a readable title column; wrapping moves actions below it at large text. */}
      {leading}<View style={{ flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" as const } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }}>
        {/* Same Heading level as Web (screenHeaderRecipe.titleLevel), with or without a design profile. */}
        {titleVisibility === "visible" ? <Stack axis="inline" gap="xs" align="center" justify={profileLayout?.centered ? "center" : "start"} wrap>{markedTitle(<Heading level={screenHeaderRecipe.titleLevel} semanticLevel={1} {...(profileLayout?.centered ? { align: "center" as const } : {})}>{title}</Heading>)}{badge}</Stack> : standaloneMark(!!profileLayout?.centered)}
      </View><Stack axis="inline" align="center" gap={topBarRecipe.gap}>{actions}</Stack>
    </View>)}
    {notice ? <View style={{ paddingHorizontal: padding }}>{notice}</View> : null}
    {scroll === "screen" || resolved.replacesContent ? <ScrollView {...scrollProps} {...(refresh ? { refreshControl: <HjmRefreshControl refresh={refresh} /> } : {})} onLayout={refresh ? event => setBodyTop(event.nativeEvent.layout.y) : undefined} ref={bodyScroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" scrollEventThrottle={scrollProps?.scrollEventThrottle ?? 16} onScroll={event => { trackScroll(event); scrollProps?.onScroll?.(event); }}
      alwaysBounceVertical={pullToDismiss || scrollProps?.alwaysBounceVertical}
      onScrollBeginDrag={event => { dismissal.onScrollBeginDrag(event); scrollProps?.onScrollBeginDrag?.(event); }}
      onScrollEndDrag={event => { dismissal.onScrollEndDrag(event); scrollProps?.onScrollEndDrag?.(event); }}
      contentContainerStyle={{ flexGrow: 1, padding, paddingTop: bodyPaddingTop + (overlayHeader ? overlayHeaderHeight : header == null && !showHeader ? safeAreaTop : 0), paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }} accessibilityState={{ busy: resolved.busy }}>{body}</ScrollView>
      : <View onLayout={refresh ? event => setBodyTop(event.nativeEvent.layout.y) : undefined} style={{ flex: 1, minHeight: 0, padding, paddingTop: bodyPaddingTop + (overlayHeader ? overlayHeaderHeight : header == null && !showHeader ? safeAreaTop : 0), paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }}>{body}</View>}
    {refresh?.refreshing && refresh.productIndicator && state.kind === "ready" ? <View pointerEvents="none" accessible accessibilityRole="progressbar" accessibilityLabel={refreshLabel} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" testID="hjm-screen-refresh-indicator" style={{ position: "absolute", top: bodyTop + refresh.progressViewOffset + recipe.refresh.indicatorOffset, start: 0, end: 0, alignItems: "center", zIndex: 1 }}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{loadingIndicator}</View></View> : null}
    {/* The footer owns the bar (border, padding, surface) unless contentInset="none" hands every inset to the host;
        only then may BottomCTA render bare, otherwise it keeps its own bar (utilverse tool footers lost theirs, 2026-10-17). */}
    {footer ? <View style={{ padding, paddingBottom: bottomPadding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }}><ScreenFooterContext.Provider value={contentInset === "none" ? null : { bottomPadding }}><BottomEntryFocusBoundary>{footer}</BottomEntryFocusBoundary></ScreenFooterContext.Provider></View> : null}
    </InitialFocusProvider></KeyboardAvoidanceContext.Provider></ScreenRefreshContext.Provider>
  </Root>;
}

export type { ScreenHostEdge, ScreenHostSurface } from "@hjmds/design-contracts/screen-patterns";
export type ScreenHostProps = Readonly<{
  children?: ReactNode;
  /**
   * Window edges padded by HjmNativeProvider `safeAreaInsets` (default top, right, left). Leave `bottom` to the
   * screen's `safeAreaBottom`, which pads the last region max(gutter, inset) once; add it only around content that
   * has no ScreenLayout/footer of its own.
   */
  edges?: readonly ScreenHostEdge[];
  /** `default` paints the theme canvas behind the insets and beside the reading column; `transparent` keeps an outer wallpaper. */
  surface?: ScreenHostSurface;
  testID?: string;
}>;

/**
 * The outer host of routes (around a navigator or one screen): the full window, painted with the canvas, padded by
 * the provider's window insets for `edges`. Replaces product `SafeAreaView` + `colors.bg` wrappers (2026-10-23).
 */
export function ScreenHost({ children, edges = screenHostDefaults.edges, surface = screenHostDefaults.surface, testID }: ScreenHostProps) {
  const { colors } = useHjmNativeTheme();
  const padding = resolveScreenHostInsets(edges, useHjmNativeSafeAreaInsets());
  if (surface !== "default" && surface !== "transparent") throw new TypeError(`Unsupported ScreenHost surface: ${String(surface)}`);
  return <View testID={testID} style={{ flex: 1, minHeight: 0, width: "100%", backgroundColor: surface === "transparent" ? "transparent" : colors.bg, paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left }}>{children}</View>;
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

export type SettingsScreenSection = Readonly<{ id: string; title: string; description?: string; children: ReactNode }>;
export type SettingsScreenProps = Omit<ScreenLayoutProps, "children" | "scroll"> & Readonly<{ profile?: ReactNode; sections: readonly SettingsScreenSection[] }>;
export function SettingsScreen({ profile, sections, ...props }: SettingsScreenProps) {
  // Settings group labels are subordinate to the screen title. Generic Section uses
  // editorial headings, which overwhelmed ordinary rows in Spint (2026-10-08 QA).
  return <ScreenLayout {...props}><Stack gap="md">{profile}{sections.map(section =>
    <Stack key={section.id} gap="xs">
      <Text variant="label" emphasis="strong" tone="muted" accessibilityRole="header">{section.title}</Text>
      {section.description ? <Text variant="caption" tone="muted">{section.description}</Text> : null}
      {section.children}
    </Stack>)}</Stack></ScreenLayout>;
}

/** Conversation rows own their inset; products supply routing/data and the optional virtualized host.
 * Keep this composition shared with Showcase: rebuilding it in BurnTok doubled gutters (2026-10-25).
 */
export type ConversationListScreenProps = Omit<ScreenLayoutProps, "contentInset" | "notice"> & Readonly<{
  search?: ReactNode;
  notice?: ReactNode;
}>;
export function ConversationListScreen({ search, notice, ...props }: ConversationListScreenProps) {
  return <ScreenLayout {...props} contentInset="body-edge"
    notice={search || notice ? <Stack gap="sm">{search}{notice}</Stack> : undefined} />;
}

export type NotificationInboxScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{ filters?: ReactNode; rowPresentation?: "item" | "preview"; children: ReactNode }>;
export function NotificationInboxScreen({ filters, children, notice, rowPresentation = "item", ...props }: NotificationInboxScreenProps) {
  return <ScreenLayout {...props} {...(rowPresentation === "preview" ? { contentInset: "body-edge" as const } : {})}
    notice={notice || filters ? <Stack gap="sm">{notice}{filters}</Stack> : undefined}>{children}</ScreenLayout>;
}

export type NotificationItemProps = Omit<ListRowProps, "description" | "selected" | "titleStyle"> & Readonly<{
  read: boolean;
  statusLabel: string;
  timestamp: string;
  description?: string;
  /** Localized name of the unread dot. When given, an unread item draws the dot after the status·time line. */
  unreadLabel?: string;
}>;
export function NotificationItem({ read, statusLabel, timestamp, description, unreadLabel, ...props }: NotificationItemProps) {
  if (unreadLabel !== undefined && unreadLabel.trim().length === 0) throw new TypeError("NotificationItem unreadLabel must not be empty");
  // Status·time is a separate muted caption, as on Web, not a second description line.
  const privateProps: ListRowPrivateProps = { hjmTitleEmphasis: read ? "regular" : "strong", hjmMeta: `${statusLabel} · ${timestamp}`,
    ...(!read && unreadLabel !== undefined ? { hjmUnreadLabel: unreadLabel } : {}) };
  return <ListRow {...props} /* Unread weight and meta: renderer-private inputs, not deprecated titleStyle (list-row-private.ts). */ {...privateProps}
    {...(description === undefined ? {} : { description })} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer" | "titleLeading" | "titleLeadingAction"> & Readonly<{
  composer: ReactNode;
  /** Shown while the reader is away from the latest message; the host owns scroll position and visibility. */
  jumpToLatest?: Readonly<{ label: string; icon: ReactNode; onPress(): void }>;
  /** Peer or room photo beside the centered title; group rooms add the member count through `titleBadge`. */
  avatar?: ReactNode;
  /** Opens the peer profile (or group details); omit for a decorative avatar. */
  avatarAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;
}>;
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, jumpToLatest, avatar, avatarAction, scroll = "content", ...props }: ChatScreenProps) {
  // An empty conversation must still allow its first message; unavailable states hide input.
  const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
  // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
  // Conversations center the peer between back and tools and use the measured 10pt timeline gutter (2026-10-16).
  return <ScreenLayout {...props} scroll={scroll} hjmBodyInlinePadding={chatMessageRecipe.timelineInset} titleLeading={avatar} {...(avatarAction ? { titleLeadingAction: avatarAction } : {})} footer={showComposer ? <View style={{ position: "relative" }}>
    {jumpToLatest ? <View style={{ position: "absolute", bottom: "100%", end: 0, marginBottom: chatMessageRecipe.jumpToLatestGap + screenPatternRecipe.padding }}><IconButton label={jumpToLatest.label} size="small" shape="circle" tone="secondary" onPress={jumpToLatest.onPress}>{jumpToLatest.icon}</IconButton></View> : null}
    {composer}</View> : null} />;
}

export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
  maxLength?: number;
  /** Opt-in count/ring appears only near the actual maxLength; never trims drafts. */
  lengthFeedback?: ComposerLengthFeedback;
  sendDisabled?: boolean;
  additionalContent?: boolean;
  leadingAction?: ReactNode;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
  /** Release typing presence when the host input loses focus. */
  onBlur?: () => void;
  onValueChange(value: string): void;
  onSend(value: string): void;
  /** Emoji row above the input; a tap appends the emoji to the draft (measured comment sheet, 2026-10-16). */
  /** Outside the field, beside the input row (e.g. the writer's avatar); the quick-insert row stays full width. */
  leading?: ReactNode;
  quickInserts?: Readonly<{ label: string; items: readonly Readonly<{ id: string; emoji: string; label: string }>[] }>;
  context?: ReactNode;
  replyTo?: Readonly<{ author: string; excerpt: string; cancelLabel: string; onCancel(): void }>;
  /** Editing keeps the same input mounted. The host owns the saved draft and server confirmation. */
  editTarget?: Readonly<{ label: string; excerpt: string; cancelLabel: string; onCancel(): void }>;
  /** Icon mode puts the send/attachment action inside the growing field. */
  sendIcon?: ReactNode;
  /** Reference comment layout: a filled circular send action inside the field. */
  sendPresentation?: "inline" | "circle";
  attachmentAction?: Readonly<{ label: string; icon: ReactNode; onPress(): void; disabled?: boolean }>;
  attachments?: readonly (MessageAttachmentDescriptor & Readonly<{ preview: ReactNode }>)[];
  onRemoveAttachment?: (id: string) => void;
}>;
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, descriptionAlign = "start", error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, editTarget, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }: MessageComposerProps) {
  if (replyTo && editTarget) throw new TypeError("A composer cannot reply and edit at the same time");
  const target = editTarget ? { ...editTarget, author: editTarget.label } : replyTo;
  validateMessageAttachments(attachments);
  if (attachments.length && !onRemoveAttachment) throw new TypeError("Attachments require a removal callback");
  if (lengthFeedback && maxLength === undefined) throw new TypeError("Composer length feedback requires maxLength");
  const limit = !lengthFeedback ? null : resolveComposerLimit(value, maxLength!, lengthFeedback.threshold);
  const canSend = !sendDisabled && !limit?.exceeded && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
  const locked = disabled || pending;
  const sendDiameter = iconButtonRecipe.sizes[sendPresentation === "circle" ? "small" : "medium"].diameter;
  // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
  const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
  const { colors, tokens } = useHjmNativeTheme();
  // The error is announced by TextArea's shared FieldMessage (internal/field-frame.tsx), on Android and iOS.
  const compactField: FieldPrivateProps = { hjmCompactMultiline: true, hjmDescriptionAlign: descriptionAlign };
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || (attachmentAction.disabled ?? false)} onPress={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  const composerBody = <>{attachments.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: tokens.spacing.sm, alignItems: "center" }}>
      {attachments.map(item => <View key={item.id} style={{ width: screenPatternRecipe.attachmentSize, height: screenPatternRecipe.attachmentSize }}>{/* Mask only the photo so the remove control is not clipped by rounded corners. */}<View style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: tokens.radius.md }}>{item.preview}</View>
        <View style={{ position: "absolute", top: 0, right: 0 }}><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked || (item.disabled ?? false)} onPress={() => { if (!locked && !item.disabled) onRemoveAttachment?.(item.id); }}><View style={{ backgroundColor: colors.bg, borderRadius: tokens.radius.full, width: screenPatternRecipe.attachmentRemoveSize, height: screenPatternRecipe.attachmentRemoveSize, alignItems: "center", justifyContent: "center" }}><FixedGlyph fontSize={18} lineHeight={24}>×</FixedGlyph></View></IconButton></View>
      </View>)}{attach}</ScrollView> : null}
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: screenPatternRecipe.itemGap }}>{leading ? <View style={{ alignSelf: "center", flexShrink: 0 }}>{leading}</View> : null}{/* One-row start like Web; public minVisibleLines keeps the editor floor (field-private.ts). */}<TextArea {...compactField} ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" accessibilityLabel={label} placeholder={placeholder} {...(description === undefined ? {} : {description})} {...(error === undefined ? {} : {error})} invalid={invalid} onBlur={onBlur} value={value} disabled={locked}
      submitBehavior={submitMode === "send" ? "submit" : "newline"} onSubmitEditing={() => { if (submitMode === "send" && canSend) onSend(value); }}
      layoutStyle={{ flex: 1 }} onValueChange={onValueChange} minVisibleLines={screenPatternRecipe.composerMinLines} maxVisibleLines={screenPatternRecipe.composerMaxLines}
      {...(sendIcon ? { trailing: <View style={{ alignSelf: "center", marginStart: tokens.spacing.sm, marginEnd: sendPresentation === "circle" ? tokens.spacing.xs - tokens.spacing.md : 0 }}>
        {/* Reserve the send button's diameter so typing the first character never resizes the field.
            A hidden duplicate button made two "send" controls; size from the recipe instead. */}
        <View style={{ minWidth: sendDiameter, minHeight: sendDiameter, alignItems: "center", justifyContent: "center" }}>{hasContent || pending ? send : attach}</View>
      </View> } : {})} />
      {sendIcon ? null : send}
    </View></>;
  const quickRow = quickInserts?.items.length ? <View accessibilityLabel={quickInserts.label} style={{ flexDirection: "row", justifyContent: "space-between", gap: composerQuickInsertRecipe.gap }}>
    {quickInserts.items.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ disabled: locked }} disabled={locked} onPress={() => onValueChange(value + item.emoji)}
      // Items share the composer width (max 44pt each) so eight emoji fit even beside a host avatar.
      style={({ pressed }) => ({ flexGrow: 1, flexShrink: 1, flexBasis: 0, maxWidth: composerQuickInsertRecipe.itemSize, height: composerQuickInsertRecipe.itemSize, borderRadius: composerQuickInsertRecipe.itemSize / 2, alignItems: "center", justifyContent: "center", opacity: locked ? 0.5 : 1, backgroundColor: pressed ? colors.surface : "transparent" })}>
      <FixedGlyph fontSize={composerQuickInsertRecipe.emojiSize} lineHeight={composerQuickInsertRecipe.emojiSize + 6}>{item.emoji}</FixedGlyph>
    </Pressable>)}
  </View> : null;
  return <Stack gap="sm">{context}{quickRow}{/* Replying wraps target, attachments and input in one card (2026-10-16 reference). */}{/* One stable wrapper whether or not replying, so the input is never remounted (focus stays). */}<View style={[{ gap: tokens.spacing.sm }, target ? { backgroundColor: colors.surface, borderRadius: tokens.radius.xl, padding: tokens.spacing.sm } : null]}>{target ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing.sm }}><View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text emphasis="strong">{target.author}</Text><Text variant="caption" tone="muted" numberOfLines={1}>{target.excerpt}</Text></View><IconButton label={target.cancelLabel} tone="secondary" size="small" shape="circle" disabled={locked} onPress={target.onCancel}><FixedGlyph>×</FixedGlyph></IconButton></View> : null}{composerBody}</View>{lengthFeedback && limit?.near ? <Progress shape="circular" label={lengthFeedback.label} value={Math.min(limit.used, limit.max)} max={limit.max} valueText={lengthFeedback.formatCount(limit.used, limit.max)}><Text variant="caption">{lengthFeedback.formatCount(limit.used, limit.max)}</Text></Progress> : null}</Stack>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; avatarAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;  reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean; icon?:ReactNode}>; replyLink?: Readonly<{label:string; onPress():void}>; /** HJM-drawn quote ("Replying to X" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */ replyQuote?: Readonly<{ title: string; excerpt: string }>; /** Photos sent in the message. Products own the image source, viewer and upload; HJM owns the layout. */ media?: readonly Readonly<{ id: string; label: string; preview: ReactNode; aspectRatio?: number; onPress?(): void }>[]; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>; menuActions?: readonly MessageMenuAction[]; reportAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean; icon?: ReactNode }>; summary?: ChatMessageReactionSummary }> }> & Readonly<{
  /**
   * Paged alternative to `media` (2026-10-18, Utilverse): HJM mounts only the shown photo, so a product that authorizes
   * each image fetches one page at a time. Exclusive with `media` (validated at render): one message has one photo set.
   */
  mediaAlbum?: MediaAlbum }>;
/**
 * Current reactions drawn beside the time as one button that opens the same hold menu (2026-10-18 BurnTok DM, which
 * showed counts as status tags because the menu could not be opened from outside). Counts and the localized
 * accessible name ("Reactions: heart 2. Open menu") come from the product; `items` in display order.
 */
export type ChatMessageReactionSummary = ChatReactionSummary;
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, avatarAction, reply, replyQuote, media = [], mediaAlbum, actions, replyAction, replyLink, reactions, children, interactiveContent=false }: ChatMessageProps) {
  const { colors, tokens, environment } = useHjmNativeTheme();
  const display = resolveChatMessageGroupDisplay(groupPosition);
  const revealTime = timestampPresentation === "swipe" && !!timestamp;
  const outgoing = direction === "outgoing";
  const offset = useRef(new Animated.Value(0)).current;
  const resetOffset = () => {
    offset.stopAnimation();
    if (environment.reducedMotion) offset.setValue(0);
    else Animated.timing(offset, { toValue: 0, duration: motion.normal, useNativeDriver: true }).start();
  };
  useEffect(() => () => offset.stopAnimation(), [offset]);
  // SwipeActions reveals row controls and requires an optional gesture peer; reply commits
  // on release and stays in the core timeline without capturing vertical scrolling.
  const gesture = useMemo(() => PanResponder.create({
    // Capture horizontal intent before nested message Pressables can retain the touch.
    onMoveShouldSetPanResponderCapture: (_, state) => revealTime && timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) > 0,
    onMoveShouldSetPanResponder: (_, state) => revealTime ? timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) > 0 : !!replyAction && !replyAction.disabled && Math.abs(state.dx)>12 && Math.abs(state.dx)>Math.abs(state.dy)*2,
    onPanResponderGrant: () => offset.stopAnimation(),
    onPanResponderMove: (_, state) => offset.setValue(revealTime ? (outgoing ? -1 : 1) * timestampRevealOffset(outgoing ? -state.dx : state.dx, state.dy) : Math.max(-72,Math.min(72,state.dx))),
    onPanResponderRelease: (_, state) => { resetOffset(); if (!revealTime && replyAction && !replyAction.disabled && isReplySwipe(state.dx,state.dy)) replyAction.onPress(); },
    onPanResponderTerminate: resetOffset,
    onPanResponderTerminationRequest: () => true,
  }), [replyAction, revealTime, outgoing, environment.reducedMotion, offset]);
  const canReply = !!replyAction && !replyAction.disabled;
  // The in-bubble quote link is merged into the bubble element, so expose it as a bubble action too.
  const quoteLink = replyLink && (replyQuote || reply) ? replyLink : undefined;
  const replyAccessibility = canReply || quoteLink ? {
    accessible: true,
    accessibilityActions: [...(canReply ? [{ name: "reply", label: replyAction!.label }] : []), ...(quoteLink ? [{ name: "openOriginal", label: quoteLink.label }] : [])],
    onAccessibilityAction: (event: AccessibilityActionEvent) => { if (event.nativeEvent.actionName === "reply" && canReply) replyAction!.onPress(); else if (event.nativeEvent.actionName === "openOriginal") quoteLink?.onPress(); },
  } : {};
  // Pressable photos and album page buttons keep their own targets, like any interactive bubble content.
  const interactive = interactiveContent || media.some(item => !!item.onPress) || mediaAlbum !== undefined;
  const captionCarriesReply = interactive && !reactions;
  const menu = useRef<MessageReactionsHandle>(null);
  const summary = reactions?.summary;
  const reactionMenu = reactions ? omitReactionSummary(reactions) : undefined;
  const summaryItems = summary ? resolveChatReactionSummary(summary) : [];
  const summaryButton = reactions && summary && summaryItems.length ? (summary.readOnly ? <ReactionSummaryText label={summary.label} items={summaryItems} /> : <ReactionSummaryButton label={summary.label} items={summaryItems} selected={reactions.value} disabled={reactions.disabled ?? false} onPress={() => menu.current?.open()} />) : null;
  // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
  const visibleTime = revealTime || !display.showTimestamp ? "" : timestamp;
  const meta = [visibleTime, deliveryLabel].filter(Boolean).join(" · ");
  // Incoming bubbles need the alternate surface: surface and the light chat canvas are both white.
  const surface = outgoing ? colors.primary : colors.surfaceAlt;
  // Filled, borderless bubbles separate authors by surface and side (2026-10-16 timeline standard).
  const showTail = bubbleTail && display.showTail && !((media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === ""));
  // Tighten the first corner to join the overlapping rounded tip.
  const bubbleStyle = { backgroundColor: surface, borderRadius: chatMessageRecipe.bubbleRadius, ...(showTail ? (outgoing ? { borderTopEndRadius: chatMessageRecipe.tailCornerRadius } : { borderTopStartRadius: chatMessageRecipe.tailCornerRadius }) : {}), paddingHorizontal: chatMessageRecipe.bubblePaddingInline, paddingVertical: chatMessageRecipe.bubblePaddingBlock, gap: tokens.spacing.xs, flexShrink: 1 };
  // The reference keeps the tip on the top edge and curves its underside into the bubble; overlap joins the rounded corner.
  const tail = showTail ? <View pointerEvents="none" accessible={false} style={{ position: "absolute", top: 0, ...(outgoing ? { end: -chatMessageRecipe.tailWidth + 1, borderTopEndRadius: 1, borderBottomEndRadius: chatMessageRecipe.tailHeight } : { start: -chatMessageRecipe.tailWidth + 1, borderTopStartRadius: 1, borderBottomStartRadius: chatMessageRecipe.tailHeight }), width: chatMessageRecipe.tailWidth + chatMessageRecipe.tailCornerRadius, height: chatMessageRecipe.tailHeight, backgroundColor: surface }} /> : null;
  // A quoted reply heads the bubble and is divided from the answer, as in the measured reference.
  const quote = replyQuote ? <View style={{ gap: 2 }}><Text emphasis="strong">{replyQuote.title}</Text><Text tone="muted" numberOfLines={1}>{replyQuote.excerpt}</Text></View> : reply;
  // The quote stays inside the bubble; with replyLink a tap on it jumps to the original (2026-10-16 reference).
  const columns = media.length ? resolveChatMediaColumns(media.length) : 1;
  const tile = media.length > 1 ? (chatMessageRecipe.mediaWidth - chatMessageRecipe.mediaGap * (columns - 1)) / columns : chatMessageRecipe.mediaWidth;
  // The page index lives here so the hold-menu preview (a second render of the bubble) shows the same page.
  validateMediaSetChoice(media.length > 0, mediaAlbum !== undefined);
  const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(mediaAlbum);
  const mediaBlock = mediaAlbum ? <MediaAlbumView album={mediaAlbum} index={albumIndex} onIndexChange={setAlbumIndex} width={chatMessageRecipe.mediaWidth} radius={chatMessageRecipe.bubbleRadius} />
    : media.length ? <View style={{ width: chatMessageRecipe.mediaWidth, flexDirection: "row", flexWrap: "wrap", gap: chatMessageRecipe.mediaGap, borderRadius: chatMessageRecipe.bubbleRadius, overflow: "hidden" }}>
    {media.map(item => { const size = { width: tile, aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? <Pressable key={item.id} accessibilityRole="imagebutton" accessibilityLabel={item.label} onPress={item.onPress} style={size}>{item.preview}</Pressable> : <View key={item.id} accessible accessibilityRole="image" accessibilityLabel={item.label} style={size}>{item.preview}</View>; })}
  </View> : null;
  // A photo-only message drops the bubble surface so the photo itself is the message.
  const photoOnly = (media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
  // Web bubbles accept plain text children; RN needs a Text host, so the public children contract matches.
  const body = typeof children === "string" || typeof children === "number" ? <Text>{children}</Text> : children;
  // The rounded quote box clips a straight rail; borderStartWidth with a radius tapers at both ends.
  const quoteColor = outgoing ? colors.onPrimary : colors.contentBrand;
  const bubbleContent = <InheritedTextColorContext.Provider value={outgoing ? colors.onPrimary : undefined}>{tail}{quote ? <View style={{ overflow: "hidden", padding: chatMessageRecipe.quoteInset, paddingStart: chatMessageRecipe.quoteRailWidth + chatMessageRecipe.quoteInset, borderRadius: tokens.radius.sm, backgroundColor: withAlpha(quoteColor, chatMessageRecipe.quoteSurfaceOpacity) }}><View style={{ position: "absolute", top: 0, bottom: 0, start: 0, width: chatMessageRecipe.quoteRailWidth, backgroundColor: quoteColor }} />{replyLink ? <Pressable accessibilityRole="link" accessibilityLabel={replyLink.label} onPress={replyLink.onPress}>{quote}</Pressable> : quote}</View> : null}{mediaBlock}{photoOnly ? null : body}</InheritedTextColorContext.Provider>;
  // Later bubbles of a run keep the avatar column so their edges line up under the first bubble.
  const avatarSlot = !avatar ? null : display.showAvatar ? <View style={{ width: avatarAction ? iconButtonRecipe.sizes.medium.diameter : chatMessageRecipe.avatarSize, alignItems: "center" }}>{avatarAction ? <IdentityAction action={avatarAction}>{avatar}</IdentityAction> : avatar}</View> : <View accessible={false} style={{ width: avatarAction ? iconButtonRecipe.sizes.medium.diameter : chatMessageRecipe.avatarSize }} />;
  return <View style={{ position: "relative", overflow: "hidden", marginTop: display.spacingBefore,
    // Reserve tip room only where it protrudes: the trailing edge of own messages, or the leading edge
    // when no avatar column hosts it. Symmetric 8pt padding narrowed every row (2026-10-16 review).
    ...(bubbleTail ? (outgoing ? { paddingEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingStart: chatMessageRecipe.tailWidth }) : {}) }}>
    {revealTime ? <Animated.View pointerEvents="none" style={{ position: "absolute", ...(outgoing ? { right: 0, alignItems: "flex-end" as const } : { left: 0 }), top: 0, bottom: 0, width: 80, justifyContent: "center", opacity: offset.interpolate({ inputRange: [-16, 0, 16], outputRange: [1, 0, 1], extrapolate: "clamp" }) }}><Text variant="caption" tone="muted">{timestamp}</Text></Animated.View> : null}
    <Animated.View style={{ transform:[{translateX:offset}], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", alignItems: "flex-start", gap: chatMessageRecipe.avatarGap }}>
    {!outgoing ? avatarSlot : null}
    {/* Accessibility (2026-10-06 review): a row-level accessible View named by `author`, and a reaction
        target named by `picker.label`, both replaced the body so screen readers never heard the message.
        The row stays a plain container; the bubble is one element whose name is its own text (iOS and
        Android derive it from children when no label is set), and reply/reaction are actions on it.
        Author and time remain separate text elements. Interactive content keeps its child controls, so
        the reply action moves to the time (or author) caption instead of a new visible button. */}
    {/* Bubble gestures stay on the content column so the avatar profile control owns its touch. */}
    {/* Leave a visible opposite edge so authorship survives monochrome themes; never truncate message text. */}
    <View {...gesture.panHandlers} style={{ maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: chatMessageRecipe.authorGap, alignItems: outgoing ? "flex-end" : "flex-start" }}>
      {author && display.showAuthor && !outgoing?<Text variant="caption" tone="muted" {...(captionCarriesReply && !meta ? replyAccessibility : {})}>{author}</Text>:null}
      {/* Time and delivery sit beside the bubble's bottom edge, on the side facing the open space. */}
      {/* Stretch to the column's resolved width: a percentage max width here is unresolved while Yoga
          measures an auto-width column, so long bubbles pushed the time off screen. */}
      <View style={{ flexDirection: outgoing ? "row-reverse" : "row", alignItems: "flex-end", gap: chatMessageRecipe.metaGap, alignSelf: "stretch" }}>
      {reactionMenu ? <MessageReactions {...reactionMenu} menuRef={menu} align={outgoing ? "end" : "start"} interactiveContent={interactive} {...(timestamp ? { menuTitle: timestamp } : {})} {...(replyAction && !replyAction.disabled ? {replyAction} : {})}>
        <View style={photoOnly ? { flexShrink: 1 } : bubbleStyle}>{bubbleContent}</View>
      </MessageReactions> : <View style={photoOnly ? { flexShrink: 1 } : bubbleStyle} accessible={!interactive} {...(interactive ? {} : replyAccessibility)}>{bubbleContent}</View>}
      {meta||actions||summaryButton?<Stack axis="inline" gap="xs" align="center" layoutStyle={{ flexShrink: 0 }}>{summaryButton}{meta?<Text variant="caption" tone="muted" {...(captionCarriesReply ? replyAccessibility : {})}>{meta}</Text>:null}{actions}</Stack>:null}
      </View>
    </View>
    {outgoing ? avatarSlot : null}
    </Animated.View>
  </View>;
}

/** Shared structure for embedded compositions. The parent supplies size; this never creates a second scroller. */
export type CompositionLayoutProps = Readonly<{
  title?: string;
  /** Compact labels inside sheets retain heading semantics without a large section title. */
  titleSize?: "default" | "compact";
  /** Document heading level; visual treatment remains the shared composition title. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  description?: string;
  badge?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Passive supporting artwork beside the heading and body; never a header action. */
  aside?: ReactNode;
  /** Secondary footer metadata; wraps rather than squeezing the main footer. */
  footerAside?: ReactNode;
  state?: ScreenContentState;
  stateAction?: ReactNode;
  /**
   * Room the loading/empty/error/restricted replacement keeps in place so it centers without a parent height
   * (`screenPatternRecipe.compositionState`: compact 96 · regular 160 · large 220; `fit` = its own height).
   * Ready content is not affected.
   */
  stateHeight?: CompositionStateHeight;
  /** Brand visual only; the shared state group owns copy, centering and announcement. */
  loadingIndicator?: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;
export function CompositionLayout({title, titleSize = "default", headingLevel = 3, description, badge, leading, actions, notice, children, footer, aside, footerAside, state = {kind: "ready"}, stateAction, stateHeight = "fit", loadingIndicator, layoutStyle}: CompositionLayoutProps) {
  const resolved = resolveScreenContentState(state);
  const stateMinHeight = resolveCompositionStateMinHeight(stateHeight);
  // The floor sits on a host around the state group: layoutStyle is placement-only and excludes sizes.
  const stateGroup = state.kind === "ready" ? null : <Stack gap="sm" align="center" justify="center" layoutStyle={{flex: 1}}>
      {resolved.busy ? (loadingIndicator ? <View accessible accessibilityRole="progressbar" accessibilityLabel={[state.title, state.description].filter(Boolean).join(". ")} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={{ alignItems: "center", gap: screenPatternRecipe.itemGap }}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{loadingIndicator}</View></View> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <View accessibilityRole={state.kind === "error" ? "alert" : "text"} accessibilityLiveRegion="polite"><Text variant={resolved.titleVariant} align="center">{state.title}</Text>{state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}</View>}
      {stateAction}
    </Stack>;
  // Compact section titles follow the 2026-10-19 mobile typography direction; headingLevel still owns document semantics.
  const content = <>
    {title || description || badge || leading || actions ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap: "wrap"}}>
      {/* Keep the copy’s natural width as its flex basis so actions wrap before squeezing a short title (Spint cell header). */}
      {/* A leading glyph and its copy are one group: when the title is long the copy wraps beside the glyph
          instead of the whole copy dropping under a lone glyph (2026-10-23, same fault as StatisticGroup). */}
      {leading ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%"}}>
        {leading}<Stack gap="xxs" layoutStyle={{flexShrink: 1, minWidth: 0}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? (titleSize === "compact" ? <Text variant="body" fontRole="ui" accessibilityRole="header" aria-level={headingLevel} style={{fontWeight: "500"}}>{title}</Text> : <Heading level="level5" semanticLevel={headingLevel}>{title}</Heading>) : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>
      </Stack> : <Stack gap="xxs" layoutStyle={{flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%"}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? (titleSize === "compact" ? <Text variant="body" fontRole="ui" accessibilityRole="header" aria-level={headingLevel} style={{fontWeight: "500"}}>{title}</Text> : <Heading level="level5" semanticLevel={headingLevel}>{title}</Heading>) : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>}{actions}
    </Stack> : null}
    {notice}
    {state.kind === "ready" ? children : stateMinHeight === null ? stateGroup : <View testID="hjm-composition-state-region" style={{flex: 1, minHeight: stateMinHeight}}>{stateGroup}</View>}
  </>;
  // Supporting art spans the heading and body, so a long title cannot push it into a separate row.
  // Diairy postcard cards (2026-10-20) exposed the misuse of header actions for this passive content.
  return <Stack gap="md" {...(layoutStyle === undefined ? {} : {layoutStyle})}>
    {aside ? <Stack axis="inline" gap="md" align="start">
      <Stack gap="md" layoutStyle={{flex: 1, minWidth: 0}}>{content}</Stack>
      <Stack layoutStyle={{flexShrink: 0, maxWidth: "40%"}}>{aside}</Stack>
    </Stack> : content}
    {footerAside ? <Stack axis="inline" gap="xs" align="center" justify="between" wrap>
      {footer ? <Stack layoutStyle={{flexGrow: 1, minWidth: 0}}>{footer}</Stack> : null}
      {footerAside}
    </Stack> : footer}
  </Stack>;
}

export type NotificationRowProps = Readonly<{
  /** Text and inline emphasis only; interactive content belongs outside the row. */
  preview: ReactNode;
  metadata: string;
  avatar: ReactNode;
  avatarAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;
  avatarBadge?: ReactNode;
  thumbnail?: ReactNode;
  unread?: boolean;
  /** The section/list supplies the boundary; HJM aligns its divider with the preview column. */
  separator?: boolean;
  /** One optional command around the passive preview; the product retains routing/permission decisions. */
  action?: Readonly<{ label: string; onActivate(): void; disabled?: boolean }>;

}>;

/** Optional shared command host; passive previews remain compatible with existing router/gesture hosts. */
export function NotificationRow({ preview, metadata, avatar, avatarAction, avatarBadge, thumbnail, unread = false, separator = false, action }: NotificationRowProps) {
  const r = notificationRecipe, { colors, tokens } = useHjmNativeTheme();
  if (action && !action.label.trim()) throw new TypeError("NotificationRow action requires a localized label");
  const portrait = <View style={{width:r.avatarSize,height:r.avatarSize,flexShrink:0}}>
    <View style={{width:"100%",height:"100%",overflow:"hidden",borderRadius:r.avatarSize/2}}>{avatar}</View>
    {avatarBadge?<View style={{position:"absolute",bottom:0,right:0,alignItems:"center",justifyContent:"center",width:r.avatarBadgeSize,height:r.avatarBadgeSize,borderRadius:r.avatarBadgeSize/2,backgroundColor:colors.surface,borderWidth:2,borderColor:colors.surface}}>{avatarBadge}</View>:null}
  </View>;
  const copy = <View style={{flex:1,minWidth:0,gap:r.contentGap}}><Text numberOfLines={r.previewLines}>{preview}</Text>
    <View style={{flexDirection:"row",alignItems:"center",gap:r.contentGap}}><Text variant="caption" tone="muted">{metadata}</Text>{unread?<View testID="hjm-unread-dot" style={{width:r.unreadSize,height:r.unreadSize,borderRadius:r.unreadSize/2,flexShrink:0,backgroundColor:colors.contentBrand}}/>:null}</View>
  </View>;
  const image = thumbnail?<View style={{width:r.thumbnailSize,height:r.thumbnailSize,flexShrink:0,overflow:"hidden",borderRadius:tokens.radius.sm}}>{thumbnail}</View>:null;
  const divider = separator?<View testID="hjm-notification-separator" style={{position:"absolute",top:0,start:r.separatorInsetStart,end:0,borderTopWidth:1,borderColor:colors.border}}/>:null;
  const rowStyle = {flexDirection:"row" as const,alignItems:"center" as const,gap:r.gap,paddingVertical:r.paddingBlock,paddingHorizontal:r.paddingInline,width:"100%" as const,minWidth:0};
  const activate = () => {if(action&&!action.disabled)action.onActivate();};
  const opacity = (pressed:boolean) => action?.disabled?r.interaction.disabledOpacity:pressed?r.interaction.pressedOpacity:1;
  // Separate destinations share the same visual parts, with sibling controls rather than nested Pressables.
  if (avatarAction) return <View style={rowStyle}>{divider}<IdentityAction action={avatarAction}>{portrait}</IdentityAction>
    {action?<Pressable accessibilityRole="button" accessibilityLabel={action.label} accessibilityState={{disabled:action.disabled===true}} disabled={action.disabled} onPress={activate} style={({pressed})=>({flex:1,minWidth:0,minHeight:r.avatarSize,opacity:opacity(pressed)})}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{flex:1,flexDirection:"row",alignItems:"center",gap:r.gap}}>{copy}{image}</View></Pressable>:<View style={{flex:1,flexDirection:"row",alignItems:"center",gap:r.gap}}>{copy}{image}</View>}
  </View>;
  const content = <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={rowStyle}>{divider}{portrait}{copy}{image}</View>;
  return action?<Pressable accessible accessibilityRole="button" accessibilityLabel={action.label} accessibilityState={{disabled:action.disabled===true}} disabled={action.disabled} onPress={activate} style={({pressed})=>({width:"100%",opacity:opacity(pressed)})}>{content}</Pressable>:content;
}

export type IconTileProps = Readonly<{
  /**
   * Icon artwork. A function receives the rendered edge (`IconTileArtwork`) so fixed-size artwork such as an image
   * sizes itself to a `size="fill"` icon without the product re-computing the cell clamp.
   */
  icon: ReactNode | ((artwork: IconTileArtwork) => ReactNode); label: string; overlay?: ReactNode; labelLines?: 1 | 2; ghost?: boolean;
  /** `none`: the icon is complete product artwork, so no frame fill or hairline is drawn. */
  frame?: IconTileFrame;
  /** Frame (and ghost outline) corner shape from the product's icon theme. */
  shape?: IconTileShape;
  /** `fill`: the icon spans the grid cell between iconTileRecipe.fillMinSize and fillMaxSize. */
  size?: IconTileSize;
  /** Activation is HJM-owned; omit for product drag gesture hosts. */
  onActivate?: () => void;
  activationLabel?: string;
  activationHint?: string;
  /** Native secondary gesture; the product supplies its preview/menu without recreating the press host. */
  onLongPress?: () => void;
  disabled?: boolean;
  /** Pressable but dimmed (iconTileRecipe.locked) so `onActivate` can explain why. Requires `onActivate` and `lockedLabel`. */
  locked?: boolean;
  /** Localized lock reason appended to the accessible name ("Weather, sign-in required"). */
  lockedLabel?: string;
  /** Corner mark (lock, clock, count) on the icon frame, overhanging by iconTileRecipe.accessory.offset. */
  accessory?: ReactNode;
  accessoryPlacement?: CornerAccessoryPlacement;
  layoutStyle?: HjmCompositionStyleProp;
}>;
/** Shared launcher/profile tile; simple activation and gesture-only presentation reuse identical content. */
export function IconTile({icon, label, overlay, labelLines = 1, ghost = false, frame = iconTileRecipe.defaults.frame, shape = iconTileRecipe.defaults.shape, size = iconTileRecipe.defaults.size, onActivate, activationLabel, activationHint, onLongPress, disabled = false, locked = false, lockedLabel, accessory, accessoryPlacement = iconTileRecipe.defaults.accessoryPlacement, layoutStyle}: IconTileProps) {
  const r = iconTileRecipe;
  if (onActivate && !(activationLabel ?? label).trim()) throw new TypeError("Interactive IconTile requires a label");
  if (locked && (!onActivate || !lockedLabel?.trim())) throw new TypeError("A locked IconTile needs onActivate and a lockedLabel");
  if (!(cornerAccessoryPlacements as readonly string[]).includes(accessoryPlacement)) throw new TypeError(`Unsupported IconTile accessoryPlacement: ${accessoryPlacement}`);
  const dim = ghost ? r.ghostOpacity : locked ? r.locked.opacity : 1;
  if (onLongPress && !onActivate) throw new TypeError("IconTile onLongPress requires onActivate");
  const {colors} = useHjmNativeTheme();
  // A filling icon's edge is known only after layout; the radius follows the measured edge so the shape holds at every
  // cell width (percentage border radii are not relied on across the supported RN versions).
  const [fillEdge, setFillEdge] = useState<number>(r.fillMinSize);
  const edge = size === "fill" ? fillEdge : r.iconSize;
  const framed = frame === "surface";
  const dimensions = size === "fill" ? {width: "100%" as const, minWidth: r.fillMinSize, maxWidth: r.fillMaxSize, aspectRatio: 1} : {width: r.iconSize, height: r.iconSize};
  const content = <View style={[{position: "relative", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible"}, onActivate ? undefined : layoutStyle]}>
    <View onLayout={size === "fill" ? event => setFillEdge(event.nativeEvent.layout.width) : undefined} style={{position: "relative", alignItems: "center", justifyContent: "center", ...dimensions, borderRadius: edge * r.shapes[shape], backgroundColor: framed ? colors.surfaceAlt : "transparent", borderWidth: framed || ghost ? 1 : 0, borderStyle: ghost ? "dashed" : "solid", opacity: dim, borderColor: colors.border}}>{typeof icon === "function" ? icon({edge}) : icon}{overlay}</View>
    {/* A box laid over the frame (centered, measured edge) holds the accessory so dimming the frame never dims it. */}
    {accessory ? <View pointerEvents="none" accessibilityElementsHidden={onActivate ? true : undefined} importantForAccessibility={onActivate ? "no-hide-descendants" : undefined}
      style={{position: "absolute", top: 0, left: "50%", marginLeft: -edge / 2, width: edge, height: edge}}>
      <View testID="hjm-icon-tile-accessory" style={[{position: "absolute", end: -r.accessory.offset}, accessoryPlacement === "top-end" ? {top: -r.accessory.offset} : {bottom: -r.accessory.offset}]}>{accessory}</View>
    </View> : null}
    <Text variant="caption" numberOfLines={labelLines} style={{opacity: locked ? r.locked.opacity : undefined, width: "100%", minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, textAlign: "center", fontWeight: "500"}}>{label}</Text>
  </View>;
  if (!onActivate) return content;
  return <Pressable accessibilityRole="button" accessibilityLabel={locked ? `${activationLabel ?? label}, ${lockedLabel}` : activationLabel ?? label} accessibilityHint={activationHint} accessibilityState={{ disabled }} disabled={disabled}
    onPress={() => { if (!disabled) onActivate(); }}
    onLongPress={onLongPress ? () => { if (!disabled) onLongPress(); } : undefined}
    style={({ pressed }) => [{ minWidth: r.activation.minimumTarget, minHeight: r.activation.minimumTarget, width: "100%", opacity: disabled ? r.activation.disabledOpacity : pressed ? r.activation.pressedOpacity : 1 }, layoutStyle]}>{content}</Pressable>;
}

export type TypingIndicatorProps = Readonly<{
  /** Localized status read by assistive tech ("Seoyeon is typing"); the visible row shows only the dots. */
  label: string;
  /** Typer's photo in a group room, sized like ChatMessage avatars (`chatMessageRecipe.avatarSize`). */
  avatar?: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Incoming "is typing" row for a ChatScreen timeline (2026-10-18 BurnTok DM drew its own). The host shows it only while
 * presence says someone is typing and places it after the last message; HJM owns the bubble, dots and announcement.
 */
export function TypingIndicator({ label, avatar, layoutStyle }: TypingIndicatorProps) {
  if (!label.trim()) throw new TypeError("TypingIndicator requires a localized label");
  const { colors, tokens, environment } = useHjmNativeTheme();
  const r = typingIndicatorRecipe, m = chatMessageRecipe;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(1))).current;
  useEffect(() => {
    if (environment.reducedMotion) { dots.forEach(dot => dot.setValue(1)); return; }
    const half = r.cycleMs / 2;
    const pulses = dots.map((dot, index) => { dot.setValue(r.restOpacity); return Animated.sequence([Animated.delay(index * r.staggerMs), Animated.loop(Animated.sequence([
      Animated.timing(dot, { toValue: 1, duration: half, useNativeDriver: true }),
      Animated.timing(dot, { toValue: r.restOpacity, duration: half, useNativeDriver: true }),
    ]))]); });
    pulses.forEach(pulse => pulse.start());
    return () => pulses.forEach(pulse => pulse.stop());
  }, [dots, environment.reducedMotion]);
  // A polite status, as Web role="status": Android hears it through the live region; iOS ignores live regions, so it is
  // queued once behind the current speech when the row appears.
  useEffect(() => { if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibilityWithOptions(label, { queue: true }); }, [label]);
  return <View accessible accessibilityLabel={label} accessibilityLiveRegion="polite" style={[{ flexDirection: "row", alignItems: "flex-start", gap: m.avatarGap, marginTop: m.groupGap, paddingStart: avatar ? 0 : m.tailWidth }, layoutStyle]}>
    {avatar ? <View style={{ width: m.avatarSize, alignItems: "center" }}>{avatar}</View> : null}
    <View style={{ flexDirection: "row", alignItems: "center", gap: r.dotGap, minHeight: tokens.typography.body.lineHeight + m.bubblePaddingBlock * 2, paddingVertical: m.bubblePaddingBlock, paddingHorizontal: m.bubblePaddingInline, borderRadius: m.bubbleRadius, backgroundColor: colors.surfaceAlt }}>
      {dots.map((opacity, index) => <Animated.View key={index} style={{ width: r.dotSize, height: r.dotSize, borderRadius: r.dotSize / 2, backgroundColor: colors.textMuted, opacity }} />)}
    </View>
  </View>;
}

export type ChatDateSeparatorProps = Readonly<{
  /** Product-formatted date or time ("Today", "Oct 18", "3:04 PM"). */
  label: string;
  /** Machine-readable value for the Web `<time>` element; Native ignores it. */
  dateTime?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Centered date (or time) row between ChatScreen timeline groups (2026-10-18 Utilverse chat drew a caption). Grouping
 * rules stay with the product; the next message keeps its own group gap, so this row adds only the space before it.
 */
export function ChatDateSeparator({ label, layoutStyle }: ChatDateSeparatorProps) {
  if (!label.trim()) throw new TypeError("ChatDateSeparator requires a localized label");
  const r = chatDateSeparatorRecipe;
  return <View style={[{ alignItems: "center", paddingTop: r.paddingTop, paddingBottom: r.paddingBottom }, layoutStyle]}>
    <Text variant={r.textVariant} tone={r.tone} align="center">{label}</Text>
  </View>;
}
