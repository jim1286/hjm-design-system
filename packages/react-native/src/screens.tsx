import { iconTileRecipe, notificationRowRecipe as notificationRecipe } from "@hjmds/design-contracts/screen-patterns";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit, type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen, type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions, type MessageMenuAction } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref, type ReactNode } from "react";
import { Animated, PanResponder, Pressable, ScrollView, View, type AccessibilityActionEvent, type TextInput, type ScrollViewProps } from "react-native";
import { Spinner } from "./internal/spinner.js";
import { KeyboardAvoidanceContext, useInsideKeyboardAvoidance, useKeyboardOverlap, useScrollFocusedInputIntoView } from "./keyboard.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { ScreenFooterContext, resolveScreenBottomPadding } from "./internal/screen-footer.js";
import { ScreenBodyInsetContext } from "./internal/screen-body-inset.js";
import { listRowScrollRoom } from "./internal/list-row-scroll-room.js";
import { isReplySwipe, timestampRevealOffset, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, screenHeaderRecipe, validateScreenExit, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState, type ScreenContentInset } from "@hjmds/design-contracts/screen-patterns";
import { motion } from "@hjmds/design-contracts/foundations";
import { Stack, Text } from "./primitives.js";
import { Heading } from "./heading.js";
import { ListRow, type ListRowProps } from "./data-display.js";
import type { ListRowPrivateProps } from "./internal/list-row-private.js";
import type { FieldPrivateProps } from "./internal/field-private.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

/** Internal: lets ChatScreen narrow only the timeline gutter without a public spacing escape hatch. */
type ScreenLayoutPrivateProps = Readonly<{ hjmBodyInlinePadding?: number; hjmTitleLeading?: ReactNode }>;
export type ScreenLayoutProps = Readonly<{
  title: string;
  /** The shared header owns badge placement; the product supplies its meaning and label. */
  titleBadge?: ReactNode;
  /** Hide redundant route names while retaining descriptions and a named screen. */
  titleVisibility?: "visible" | "hidden";
  /** Centered by default (2026-10-17 user rule); `start` remains available. Extra actions sit at the trailing edge. */
  headerAlignment?: "start" | "center";
  /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
  header?: ReactNode;
  /**
   * Hosts that already inset routes avoid applying the shared gutter twice (`none`). `body-edge` keeps the header,
   * notice and footer gutter and drops only the body's horizontal padding so full-width list rows own their inset.
   */
  contentInset?: ScreenContentInset;
  /** Center a product prompt in the available body without inventing a query state. */
  contentAlignment?: "start" | "center";
  /** Keep a product wallpaper supplied by the outer host visible. */
  surface?: "default" | "transparent";
  /** Explicit layout wins over the nearest design profile. */
  presentation?: DesignProfileScreenPresentation;
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
  testID?: string;
  scrollRef?: Ref<ScrollView>;
  /**
   * Keeps the footer and focused field above the keyboard (default on, 2026-10-16 keyboard audit).
   * Skipped inside KeyboardAvoiding or a keyboard-aware Sheet/Dialog, which already handle it.
   */
  keyboardAvoidance?: boolean;
  scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator" | "onScroll" | "onScrollBeginDrag" | "onScrollEndDrag" | "scrollEventThrottle" | "alwaysBounceVertical" | "automaticallyAdjustKeyboardInsets">;
}>;

export function ScreenLayout({ title, titleBadge, titleVisibility = "visible", headerAlignment = "center", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, description, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps, keyboardAvoidance = true, safeAreaBottom = 0, hjmBodyInlinePadding, hjmTitleLeading }: ScreenLayoutProps & ScreenLayoutPrivateProps) {
  if (exit) validateScreenExit(exit, false);
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) throw new RangeError("ScreenLayout safeAreaBottom must be non-negative");
  const leading = exit ? <ScreenExitButton {...exit} /> : null;
  const insideAvoidance = useInsideKeyboardAvoidance();
  const avoidKeyboard = keyboardAvoidance && !insideAvoidance;
  const rootRef = useRef<View>(null);
  const keyboardOverlap = useKeyboardOverlap(rootRef, avoidKeyboard);
  const bodyScroll = useRef<ScrollView | null>(null);
  const trackScroll = useScrollFocusedInputIntoView(bodyScroll, avoidKeyboard);
  // ScrollView decorates object refs with scrollTo/scrollToEnd; mirror that instance into the host ref
  // after commit (child layout effects run before host effects) instead of passing a callback ref.
  useLayoutEffect(() => {
    if (typeof scrollRef === "function") scrollRef(bodyScroll.current);
    else if (scrollRef) (scrollRef as { current: ScrollView | null }).current = bodyScroll.current;
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
  // body-edge (review S5#9): list rows supply their own 16pt inset, so the body adds none; ChatScreen's narrower
  // timeline gutter only replaces the shared default gutter.
  const bodyInline = contentInset === "default" ? hjmBodyInlinePadding ?? padding : 0;
  // Icon-only route headers need no title breathing room: otherwise the 60pt
  // heading plus full body inset leaves category tabs detached from navigation.
  const compactHeader = header == null && showHeader && headerAlignment === "center" && titleVisibility === "hidden" && !description;
  const headerVerticalPadding = compactHeader ? screenHeaderRecipe.compactPaddingVertical : screenHeaderRecipe.paddingVertical;
  // A notice can contain navigation tabs; keep its separation from body filters.
  const bodyPaddingTop = compactHeader && !notice ? Math.min(padding, screenHeaderRecipe.compactBodyTop) : padding;
  // The last region (footer, else body) owns the bottom inset once: max(gutter, safe area), never gutter + inset.
  const bottomPadding = resolveScreenBottomPadding(padding, safeAreaBottom, keyboardOverlap > 0);
  const bodyPaddingBottom = footer ? padding : bottomPadding;
  const ready = contentAlignment === "center" ? <View style={{ marginVertical: "auto", flexShrink: 0, width: "100%" }}>{children}</View> : children;
  const body = state.kind === "ready" ? <ScreenBodyInsetContext.Provider value={bodyInline}>{ready}</ScreenBodyInsetContext.Provider> : <View style={{ marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap }}>
    {/* Keep loading copy in Spinner's accessibility name rather than a visible
        second status, matching the shared spinner-only loading contract. */}
    {resolved.busy ? <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} /> : <View accessibilityLiveRegion={resolved.announcement} style={{ alignItems: "center", gap: recipe.itemGap }}>
      <Text variant="title" align="center">{state.title}</Text>
      {state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}
    </View>}{stateAction}
  </View>;
  return <View ref={rootRef} testID={testID} style={[{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : colors.bg, ...(keyboardOverlap > 0 ? { paddingBottom: keyboardOverlap } : {}) }, layoutStyle]}>
    <KeyboardAvoidanceContext.Provider value={insideAvoidance || avoidKeyboard}>
    {/* Not TopBar: this is the page heading (titleLarge + description, actions wrap under the title at
        large text), while TopBar is a fixed-height app bar with a single-line title and safe-area top.
        Importing it would also pull navigation.js (tabs/gooey indicator) into every screens graph.
        Hosts that want the app bar pass <TopBar> through `header`. */}
    {header ?? (!showHeader ? null : headerAlignment === "center" ? <View style={{ minHeight: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingHorizontal: padding, paddingVertical: headerVerticalPadding, flexDirection: "row", alignItems: "center", gap: recipe.itemGap }}>
      {/* Measure intrinsic control rows, never a box constrained by its own last measurement.
          Equal side columns center the title; in-flow controls also contribute their height so
          wrapping a title/badge cannot shrink controls and start another Yoga layout cycle. */}
      <View style={{ width: sideWidth, flexShrink: 0, alignItems: "flex-start" }}>
        <View onLayout={event => setLeadingWidth(event.nativeEvent.layout.width)} style={{ alignSelf: "flex-start", flexShrink: 0, flexDirection: "row", alignItems: "center" }}>{leading}</View>
      </View>
      <View style={{ flex: 1, minWidth: 0, alignItems: "center", gap: 4 }}>
        {titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify="center" layoutStyle={{flexWrap: "wrap"}}>{hjmTitleLeading}<Heading level={screenHeaderRecipe.centeredTitleLevel} semanticLevel={1} align="center">{title}</Heading>{titleBadge}</Stack>}
        {description && <Text align="center" tone="muted">{description}</Text>}
      </View>
      <View style={{ width: sideWidth, flexShrink: 0, alignItems: "flex-end" }}>
        <View onLayout={event => setActionsWidth(event.nativeEvent.layout.width)} style={{ alignSelf: "flex-end", flexShrink: 0, flexDirection: "row", alignItems: "center" }}>{actions}</View>
      </View>
    </View> : <View style={{ flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }}>
      {/* Reserve a readable title column; wrapping moves actions below it at large text. */}
      {leading}<View style={{ flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" as const } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }}>
        {/* Same Heading level as Web (screenHeaderRecipe.titleLevel), with or without a design profile. */}
        {titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify={profileLayout?.centered ? "center" : "start"} wrap><Heading level={screenHeaderRecipe.titleLevel} semanticLevel={1} {...(profileLayout?.centered ? { align: "center" as const } : {})}>{title}</Heading>{titleBadge}</Stack>}
        {description ? <Text tone="muted" {...(profileLayout?.centered ? { align: "center" as const } : {})}>{description}</Text> : null}
      </View>{actions}
    </View>)}
    {notice ? <View style={{ paddingHorizontal: padding }}>{notice}</View> : null}
    {scroll === "screen" || resolved.replacesContent ? <ScrollView {...scrollProps} ref={bodyScroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" scrollEventThrottle={scrollProps?.scrollEventThrottle ?? 16} onScroll={event => { trackScroll(event); scrollProps?.onScroll?.(event); }}
      contentContainerStyle={{ flexGrow: 1, padding, paddingTop: bodyPaddingTop, paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }} accessibilityState={{ busy: resolved.busy }}>{body}</ScrollView>
      : <View style={{ flex: 1, minHeight: 0, padding, paddingTop: bodyPaddingTop, paddingBottom: bodyPaddingBottom, paddingHorizontal: bodyInline }}>{body}</View>}
    {/* The footer owns the bar (border, padding, surface) unless contentInset="none" hands every inset to the host;
        only then may BottomCTA render bare, otherwise it keeps its own bar (utilverse tool footers lost theirs, 2026-10-17). */}
    {footer ? <View style={{ padding, paddingBottom: bottomPadding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }}><ScreenFooterContext.Provider value={contentInset === "none" ? null : { bottomPadding }}>{footer}</ScreenFooterContext.Provider></View> : null}
    </KeyboardAvoidanceContext.Provider>
  </View>;
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

export type NotificationInboxScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{ filters?: ReactNode; children: ReactNode }>;
export function NotificationInboxScreen({ filters, children, notice, ...props }: NotificationInboxScreenProps) {
  return <ScreenLayout {...props} notice={<Stack gap="sm">{notice}{filters}</Stack>}>{children}</ScreenLayout>;
}

export type NotificationItemProps = Omit<ListRowProps, "description" | "selected" | "titleStyle"> & Readonly<{
  read: boolean;
  statusLabel: string;
  timestamp: string;
  description?: string;
}>;
export function NotificationItem({ read, statusLabel, timestamp, description, ...props }: NotificationItemProps) {
  // Status·time is a separate muted caption, as on Web, not a second description line.
  const privateProps: ListRowPrivateProps = { hjmTitleEmphasis: read ? "regular" : "strong", hjmMeta: `${statusLabel} · ${timestamp}` };
  return <ListRow {...props} /* Unread weight and meta: renderer-private inputs, not deprecated titleStyle (list-row-private.ts). */ {...privateProps}
    {...(description === undefined ? {} : { description })} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{
  composer: ReactNode;
  /** Shown while the reader is away from the latest message; the host owns scroll position and visibility. */
  jumpToLatest?: Readonly<{ label: string; icon: ReactNode; onPress(): void }>;
  /** Peer or room photo beside the centered title; group rooms add the member count through `titleBadge`. */
  avatar?: ReactNode;
}>;
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", ...props }: ChatScreenProps) {
  // An empty conversation must still allow its first message; unavailable states hide input.
  const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
  // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
  // Conversations center the peer between back and tools and use the measured 10pt timeline gutter (2026-10-16).
  return <ScreenLayout {...props} scroll={scroll} hjmBodyInlinePadding={chatMessageRecipe.timelineInset} hjmTitleLeading={avatar} footer={showComposer ? <View style={{ position: "relative" }}>
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
  inputRef?: Ref<TextInput>;
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
  /** Icon mode puts the send/attachment action inside the growing field. */
  sendIcon?: ReactNode;
  /** Reference comment layout: a filled circular send action inside the field. */
  sendPresentation?: "inline" | "circle";
  attachmentAction?: Readonly<{ label: string; icon: ReactNode; onPress(): void; disabled?: boolean }>;
  attachments?: readonly (MessageAttachmentDescriptor & Readonly<{ preview: ReactNode }>)[];
  onRemoveAttachment?: (id: string) => void;
}>;
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }: MessageComposerProps) {
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
  const compactField: FieldPrivateProps = { hjmCompactMultiline: true };
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
  return <Stack gap="sm">{context}{quickRow}{/* Replying wraps target, attachments and input in one card (2026-10-16 reference). */}{/* One stable wrapper whether or not replying, so the input is never remounted (focus stays). */}<View style={[{ gap: tokens.spacing.sm }, replyTo ? { backgroundColor: colors.surface, borderRadius: tokens.radius.xl, padding: tokens.spacing.sm } : null]}>{replyTo ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing.sm }}><View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted" numberOfLines={1}>{replyTo.excerpt}</Text></View><IconButton label={replyTo.cancelLabel} tone="secondary" size="small" shape="circle" disabled={locked} onPress={replyTo.onCancel}><FixedGlyph>×</FixedGlyph></IconButton></View> : null}{composerBody}</View>{lengthFeedback && limit?.near ? <Progress shape="circular" label={lengthFeedback.label} value={Math.min(limit.used, limit.max)} max={limit.max} valueText={lengthFeedback.formatCount(limit.used, limit.max)}><Text variant="caption">{lengthFeedback.formatCount(limit.used, limit.max)}</Text></Progress> : null}</Stack>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean; icon?:ReactNode}>; replyLink?: Readonly<{label:string; onPress():void}>; /** HJM-drawn quote ("Replying to X" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */ replyQuote?: Readonly<{ title: string; excerpt: string }>; /** Photos sent in the message. Products own the image source, viewer and upload; HJM owns the layout. */ media?: readonly Readonly<{ id: string; label: string; preview: ReactNode; aspectRatio?: number; onPress?(): void }>[]; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>; menuActions?: readonly MessageMenuAction[]; reportAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean; icon?: ReactNode }> }> }>;
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], actions, replyAction, replyLink, reactions, children, interactiveContent=false }: ChatMessageProps) {
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
  const tail = showTail ? <View pointerEvents="none" accessible={false} style={{ position: "absolute", top: 0, ...(outgoing ? { end: -chatMessageRecipe.tailWidth + 1, borderEndWidth: chatMessageRecipe.tailWidth, borderEndColor: "transparent" } : { start: -chatMessageRecipe.tailWidth + 1, borderStartWidth: chatMessageRecipe.tailWidth, borderStartColor: "transparent" }), width: 0, height: 0, borderTopWidth: chatMessageRecipe.tailHeight, borderTopColor: surface }} /> : null;
  // A quoted reply heads the bubble and is divided from the answer, as in the measured reference.
  const quote = replyQuote ? <View style={{ gap: 2 }}><Text emphasis="strong">{replyQuote.title}</Text><Text tone="muted" numberOfLines={1}>{replyQuote.excerpt}</Text></View> : reply;
  // The quote stays inside the bubble; with replyLink a tap on it jumps to the original (2026-10-16 reference).
  const columns = media.length ? resolveChatMediaColumns(media.length) : 1;
  const tile = media.length > 1 ? (chatMessageRecipe.mediaWidth - chatMessageRecipe.mediaGap * (columns - 1)) / columns : chatMessageRecipe.mediaWidth;
  const mediaBlock = media.length ? <View style={{ width: chatMessageRecipe.mediaWidth, flexDirection: "row", flexWrap: "wrap", gap: chatMessageRecipe.mediaGap, borderRadius: chatMessageRecipe.bubbleRadius, overflow: "hidden" }}>
    {media.map(item => { const size = { width: tile, aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? <Pressable key={item.id} accessibilityRole="imagebutton" accessibilityLabel={item.label} onPress={item.onPress} style={size}>{item.preview}</Pressable> : <View key={item.id} accessible accessibilityRole="image" accessibilityLabel={item.label} style={size}>{item.preview}</View>; })}
  </View> : null;
  // A photo-only message drops the bubble surface so the photo itself is the message.
  const photoOnly = media.length > 0 && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
  // Web bubbles accept plain text children; RN needs a Text host, so the public children contract matches.
  const body = typeof children === "string" || typeof children === "number" ? <Text>{children}</Text> : children;
  const bubbleContent = <>{tail}{quote ? <View style={{ borderBottomWidth: 1, borderColor: colors.border, paddingBottom: tokens.spacing.xs }}>{replyLink ? <Pressable accessibilityRole="link" accessibilityLabel={replyLink.label} onPress={replyLink.onPress}>{quote}</Pressable> : quote}</View> : null}{mediaBlock}{photoOnly ? null : body}</>;
  // Later bubbles of a run keep the avatar column so their edges line up under the first bubble.
  const avatarSlot = !avatar ? null : display.showAvatar ? <View style={{ width: chatMessageRecipe.avatarSize, alignItems: "center" }}>{avatar}</View> : <View accessible={false} style={{ width: chatMessageRecipe.avatarSize }} />;
  return <View {...gesture.panHandlers} style={{ position: "relative", overflow: "hidden", marginTop: display.spacingBefore,
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
    {/* Leave a visible opposite edge so authorship survives monochrome themes; never truncate message text. */}
    <View style={{ maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: chatMessageRecipe.authorGap, alignItems: outgoing ? "flex-end" : "flex-start" }}>
      {author && display.showAuthor && !outgoing?<Text variant="caption" tone="muted" {...(captionCarriesReply && !meta ? replyAccessibility : {})}>{author}</Text>:null}
      {/* Time and delivery sit beside the bubble's bottom edge, on the side facing the open space. */}
      {/* Stretch to the column's resolved width: a percentage max width here is unresolved while Yoga
          measures an auto-width column, so long bubbles pushed the time off screen. */}
      <View style={{ flexDirection: outgoing ? "row-reverse" : "row", alignItems: "flex-end", gap: chatMessageRecipe.metaGap, alignSelf: "stretch" }}>
      {reactions ? <MessageReactions {...reactions} align={outgoing ? "end" : "start"} interactiveContent={interactive} {...(timestamp ? { menuTitle: timestamp } : {})} {...(replyAction && !replyAction.disabled ? {replyAction} : {})}>
        <View style={photoOnly ? { flexShrink: 1 } : bubbleStyle}>{bubbleContent}</View>
      </MessageReactions> : <View style={photoOnly ? { flexShrink: 1 } : bubbleStyle} accessible={!interactive} {...(interactive ? {} : replyAccessibility)}>{bubbleContent}</View>}
      {meta||actions?<Stack axis="inline" gap="xs" align="center" layoutStyle={{ flexShrink: 0 }}>{meta?<Text variant="caption" tone="muted" {...(captionCarriesReply ? replyAccessibility : {})}>{meta}</Text>:null}{actions}</Stack>:null}
      </View>
    </View>
    {outgoing ? avatarSlot : null}
    </Animated.View>
  </View>;
}

/** Shared structure for embedded compositions. The parent supplies size; this never creates a second scroller. */
export type CompositionLayoutProps = Readonly<{
  title?: string;
  /** Document heading level; visual treatment remains the shared composition title. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  description?: string;
  badge?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  state?: ScreenContentState;
  stateAction?: ReactNode;
  /** Brand visual only; the shared state group owns copy, centering and announcement. */
  loadingIndicator?: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;
export function CompositionLayout({title, headingLevel = 3, description, badge, leading, actions, notice, children, footer, state = {kind: "ready"}, stateAction, loadingIndicator, layoutStyle}: CompositionLayoutProps) {
  const resolved = resolveScreenContentState(state);
  // Same Heading level3 as Web; a title-variant Text rendered smaller and lighter on Native (2026-10-17 review).
  return <Stack gap="md" {...(layoutStyle === undefined ? {} : {layoutStyle})}>
    {title || description || badge || leading || actions ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap: "wrap"}}>
      {leading}<Stack gap="xxs" layoutStyle={{flex: 1, minWidth: 0}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? <Heading level="level3" semanticLevel={headingLevel}>{title}</Heading> : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>{actions}
    </Stack> : null}
    {notice}
    {state.kind === "ready" ? children : <Stack gap="sm" align="center" justify="center" layoutStyle={{flex: 1}}>
      {resolved.busy ? (loadingIndicator ? <View accessible accessibilityRole="progressbar" accessibilityLabel={[state.title, state.description].filter(Boolean).join(". ")} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={{ alignItems: "center", gap: screenPatternRecipe.itemGap }}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{loadingIndicator}</View></View> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <View accessibilityRole={state.kind === "error" ? "alert" : "text"} accessibilityLiveRegion="polite"><Text variant="title" align="center">{state.title}</Text>{state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}</View>}
      {stateAction}
    </Stack>}
    {footer}
  </Stack>;
}

export type NotificationRowProps = Readonly<{
  /** Text and inline emphasis only; interactive content belongs outside the row. */
  preview: ReactNode;
  metadata: string;
  avatar: ReactNode;
  avatarBadge?: ReactNode;
  thumbnail?: ReactNode;
  unread?: boolean;
}>;

/** The host supplies navigation/disabled state and the complete accessible name. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false }: NotificationRowProps) {
  const r = notificationRecipe, { colors, tokens } = useHjmNativeTheme();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", alignItems: "center", gap: r.gap, paddingVertical: r.paddingBlock, paddingHorizontal: r.paddingInline, width: "100%", minWidth: 0 }}>
    <View style={{ width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }}>
      <View style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: r.avatarSize / 2 }}>{avatar}</View>
      {avatarBadge ? <View style={{ position: "absolute", bottom: 0, right: 0, alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: r.avatarBadgeSize / 2, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.surface }}>{avatarBadge}</View> : null}
    </View>
    <View style={{ flex: 1, minWidth: 0, gap: r.contentGap }}>
      <Text numberOfLines={r.previewLines}>{preview}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: r.contentGap }}><Text variant="caption" tone="muted">{metadata}</Text>{unread ? <View testID="hjm-unread-dot" style={{ width: r.unreadSize, height: r.unreadSize, borderRadius: r.unreadSize / 2, flexShrink: 0, backgroundColor: colors.contentBrand }} /> : null}</View>
    </View>
    {thumbnail ? <View style={{ width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: tokens.radius.sm }}>{thumbnail}</View> : null}
  </View>;
}

export type IconTileProps = Readonly<{ icon: ReactNode; label: string; overlay?: ReactNode; labelLines?: 1 | 2; ghost?: boolean }>;
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export function IconTile({icon, label, overlay, labelLines = 1, ghost = false}: IconTileProps) {
  const r = iconTileRecipe;
  const {colors} = useHjmNativeTheme();
  return <View style={{alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible"}}>
    <View style={{position: "relative", alignItems: "center", justifyContent: "center", width: r.iconSize, height: r.iconSize, borderRadius: r.iconSize * .22, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderStyle: ghost ? "dashed" : "solid", opacity: ghost ? r.ghostOpacity : 1, borderColor: colors.border}}>{icon}{overlay}</View>
    <Text variant="caption" numberOfLines={labelLines} style={{width: "100%", minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, textAlign: "center", fontWeight: "500"}}>{label}</Text>
  </View>;
}
