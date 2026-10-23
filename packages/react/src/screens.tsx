"use client";

import { cornerAccessoryPlacements, type CornerAccessoryPlacement } from "@hjmds/design-contracts/recipes";
import { iconTileRecipe, notificationRowRecipe as notificationRecipe, initialFocusDefaults, type ScreenInitialFocus, type IconTileArtwork, type IconTileFrame, type IconTileShape, type IconTileSize } from "@hjmds/design-contracts/screen-patterns";
import { BottomEntryFocusBoundary, InitialFocusScope } from "./internal/initial-focus.js";
import { iconButtonRecipe, listRowRecipe } from "@hjmds/design-contracts/recipes";
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
import { useOptionalHjmTheme } from "./provider.js";
import { TextArea } from "./forms.js";
import { useId, useLayoutEffect, useRef, useState, type Ref, type ReactNode } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, resolveCompositionStateMinHeight, type CompositionStateHeight, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, resolveChatReactionSummary, type ChatReactionSummary, typingIndicatorRecipe, chatDateSeparatorRecipe, screenHeaderRecipe, validateScreenExit, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState, type ScreenContentInset } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";
import { Section, Stack, Text, VisuallyHidden } from "./layout.js";
import { ListRow, type ListRowProps } from "./display.js";
import { classNames, useDesignProfileDefaults } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** The shared header owns badge placement; the product supplies its meaning and label. */
  titleBadge?: ReactNode;
  /**
   * Identity mark or artwork before the title (team logo, tool artwork). Decorative: the title stays the heading and
   * the accessible name. With `titleVisibility="hidden"` the mark stands alone in the title slot as the heading,
   * named by `title` (2026-10-18: yajalal team detail and Utilverse tool headers rebuilt the header to get this).
   */
  titleLeading?: ReactNode;
  /** Hide duplicate route names; retain titles that identify a subject or a task. */
  titleVisibility?: "visible" | "hidden";
  /** Centered by default (2026-10-17 user rule); `start` remains available. Extra actions sit at the trailing edge. */
  headerAlignment?: "start" | "center";
  /** Preserve host navigation while the shared shell owns content and state. */
  header?: ReactNode;
  /**
   * `none`: host owns every inset. `body-edge`: only the body drops its inline padding so list rows own their inset.
   * `body-bleed`: the body drops every padding (header, notice and footer keep theirs) for an edge-to-edge map or canvas.
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
  /** A virtualized list must own scrolling; never nest it inside a second scroll container. */
  scroll?: "screen" | "content";
  as?: "main" | "section";
  className?: string;
  /**
   * Canonical layout-only placement on the screen root (for example `flex` or `width` in a split
   * view), matching Native ScreenLayout. Every screen built on ScreenLayout forwards it.
   */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * Focus the marked, else first enabled input once on page entry (default `first-input`). Never steals an existing
   * input's focus or focuses below an overlay. A pending entry can wait for data; after user interaction it ends.
   * Bottom sheets disable automatic focus for this screen and all nested inputs, regardless of this prop.
   */
  initialFocus?: ScreenInitialFocus;
}>;

/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, titleBadge, titleLeading, titleVisibility = "visible", headerAlignment = "center", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, loadingIndicator, children, scroll = "screen", as: Element = "main", className, layoutStyle, initialFocus = initialFocusDefaults.screen }: ScreenLayoutProps) {
  const id = useId();
  if (exit) validateScreenExit(exit, false);
  const leading = exit ? <ScreenExitButton {...exit} /> : null;
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastBodyFocus = useRef<HTMLElement | null>(null);
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
    if (previous && !previous.isConnected) lastBodyFocus.current = null;
  });
  const recipe = screenPatternRecipe;
  // The mark is decorative beside a visible title; standing alone it becomes the heading, named by `title`.
  const mark = hasMark ? <span className="hjm-screen__title-leading" aria-hidden="true">{titleLeading}</span> : null;
  const titleRow = (level: typeof screenHeaderRecipe.titleLevel | typeof screenHeaderRecipe.centeredTitleLevel, justify: "center" | "start") => titleVisibility === "visible"
    ? <Stack axis="inline" gap="xs" align="center" justify={justify} wrap>{mark}<Heading level={level} semanticLevel={1} id={id}>{title}</Heading>{titleBadge}</Stack>
    : mark ? <div role="heading" aria-level={1} aria-label={title} style={{ display: "flex", justifyContent: justify === "center" ? "center" : "flex-start" }}>{mark}</div> : null;
  return <Element aria-labelledby={header || titleVisibility === "hidden" ? undefined : id} aria-label={header || titleVisibility === "hidden" ? title : undefined} data-content-inset={contentInset} data-presentation={presentation} className={classNames("hjm-screen", className)}
    style={{ backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle } as React.CSSProperties}><InitialFocusScope mode={initialFocus}>
    {header ?? (showHeader ? headerAlignment === "center" ? <header className="hjm-screen__header" style={{ display: "grid", gridTemplateColumns: "1fr minmax(0, auto) 1fr", alignItems: "center", boxSizing: "border-box", minBlockSize: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingBlock: compactHeader ? screenHeaderRecipe.compactPaddingVertical : screenHeaderRecipe.paddingVertical }}>
      {/* Equal side columns sized by their controls and a title-size (18) heading, matching Native's measured
          centered header (2026-10-17: the fixed 1:2:1 split with a level3 heading wrapped short titles). */}
      <div>{leading}</div><div className="hjm-screen__heading" style={{ textAlign: "center", minWidth: 0 }}>
        {titleRow(screenHeaderRecipe.centeredTitleLevel, "center")}
        </div><div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: topBarRecipe.gap }}>{actions}</div>
    </header> : <header className="hjm-screen__header" style={profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined}>
      {leading}<div className="hjm-screen__heading">{titleRow(screenHeaderRecipe.titleLevel, profileLayout?.centered ? "center" : "start")}
        </div><div style={{ display: "flex", alignItems: "center", gap: topBarRecipe.gap }}>{actions}</div>
    </header> : null)}
    {notice ? <div className="hjm-screen__notice">{notice}</div> : null}
    {/* Scrollable read-only screens need a named keyboard entry point, including hidden/custom headers: tabIndex 0
        keeps a screen-scrolled body reachable by Tab (Safari does not make scrollers focusable). */}
    <div ref={bodyRef} role="region" aria-label={title} tabIndex={bodyScroll === "content" ? -1 : 0}
      onFocusCapture={event => { lastBodyFocus.current = event.target as HTMLElement; }}
      onBlurCapture={event => {
        if (event.target === event.currentTarget) event.currentTarget.removeAttribute("data-focus-landing");
        // A connected input blurred to the document intentionally relinquishes
        // focus too; only removal of the currently focused node needs recovery.
        if (event.relatedTarget ? !event.currentTarget.contains(event.relatedTarget as Node) : (event.target as HTMLElement).isConnected) {
          lastBodyFocus.current = null;
        }
      }}
      className="hjm-screen__body" data-content-alignment={contentAlignment} data-scroll={bodyScroll} data-replacement={resolved.replacesContent || undefined} aria-busy={resolved.busy || undefined}>
      {state.kind === "ready" ? (contentAlignment === "center" ? <div className="hjm-screen__centered-content">{children}</div> : children) : <div className="hjm-screen__state">
        {/* Loading copy is an accessible name; visible copy beside the spinner
            contradicts the shared spinner-only loading contract. */}
        {/* The live role wraps only the copy: an alert around the retry action announced the button too (2026-10-17). */}
        {resolved.busy ? (loadingIndicator ? <div role="status" aria-busy="true" aria-label={[state.title, state.description].filter(Boolean).join(". ")}><div aria-hidden="true">{loadingIndicator}</div></div> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <div role={state.kind === "error" ? "alert" : "status"}>
          <Stack gap="sm" align="center"><Text variant={resolved.titleVariant}>{state.title}</Text>
            {state.description ? <Text tone="muted">{state.description}</Text> : null}</Stack>
        </div>}
        {stateAction}
      </div>}
    </div>
    {/* Same rule as Native: with contentInset="none" the host owns the insets, so BottomCTA keeps its own bar. */}
    {footer ? <footer className="hjm-screen__footer"><ScreenFooterContext.Provider value={contentInset === "none" ? null : { bottomPadding: "max(var(--hjm-screen-padding), env(safe-area-inset-bottom, 0px))" }}><BottomEntryFocusBoundary>{footer}</BottomEntryFocusBoundary></ScreenFooterContext.Provider></footer> : null}
    </InitialFocusScope>
  </Element>;
}

/**
 * Style for a product scroller that owns the body with `scroll="content"`: it reaches across the body gutter
 * (`--hjm-screen-body-inline`) and pads it back, so items stay on the gutter while the clip moves to the screen edges and
 * a bleeding CollectionRail inside scrolls edge to edge (same name and shape as Native; spint home 2026-10-17).
 * Outside a screen body the variable is unset and the room is 0; CSS resolves the distance, so no context is read.
 */
export function useScreenBodyScrollRoom(): Readonly<{ style: React.CSSProperties }> {
  return { style: { marginInline: "calc(-1 * var(--hjm-screen-body-inline, 0px))", paddingInline: "var(--hjm-screen-body-inline, 0px)" } };
}

export type SettingsScreenSection = Readonly<{ id: string; title: string; description?: string; children: ReactNode }>;
export type SettingsScreenProps = Omit<ScreenLayoutProps, "children" | "scroll"> & Readonly<{ profile?: ReactNode; sections: readonly SettingsScreenSection[] }>;
export function SettingsScreen({ profile, sections, ...props }: SettingsScreenProps) {
  // Keep semantic section headings while using the smaller settings label role.
  return <ScreenLayout {...props}><Stack gap="md">{profile}{sections.map(section =>
    <Section className="hjm-settings-section" key={section.id} title={<Text variant="label" emphasis="strong" tone="muted">{section.title}</Text>} description={section.description}>{section.children}</Section>)}</Stack></ScreenLayout>;
}

export type NotificationInboxScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{
  filters?: ReactNode;
  children: ReactNode;
}>;
export function NotificationInboxScreen({ filters, children, notice, ...props }: NotificationInboxScreenProps) {
  return <ScreenLayout {...props} notice={<Stack gap="sm">{notice}{filters}</Stack>}>{children}</ScreenLayout>;
}

/** Read/unread is announced in localized copy as well as emphasis; rendering never marks an item read. */
export type NotificationItemProps = Omit<ListRowProps, "description" | "selected"> & Readonly<{
  read: boolean;
  statusLabel: string;
  timestamp: string;
  description?: ReactNode;
  /**
   * Localized name of the unread dot. When given, an unread item draws the dot after the status·time line
   * (notificationRowRecipe.unreadSize, content brand — the NotificationRow mark). Spint drew a "•" glyph in
   * `trailing` because the item only changed weight and meta (2026-10-23).
   */
  unreadLabel?: string;
}>;
export function NotificationItem({ read, statusLabel, timestamp, description, unreadLabel, title, className, ...props }: NotificationItemProps) {
  if (unreadLabel !== undefined && unreadLabel.trim().length === 0) throw new TypeError("NotificationItem unreadLabel must not be empty");
  const meta = <Text variant="caption" tone="muted">{statusLabel} · {timestamp}</Text>;
  const dot = !read && unreadLabel !== undefined
    ? <span role="img" aria-label={unreadLabel} data-hjm-unread-dot="true" style={{ inlineSize: notificationRecipe.unreadSize, blockSize: notificationRecipe.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" }} />
    : null;
  return <ListRow {...props} className={classNames("hjm-notification-item", className)} data-unread={!read || undefined} title={<Text variant={listRowRecipe.title.textVariant} emphasis={read ? "regular" : "strong"}>{title}</Text>}
    description={<Stack gap="xxs">{description}{dot ? <span style={{ display: "flex", alignItems: "center", gap: notificationRecipe.contentGap }}>{meta}{dot}</span> : meta}</Stack>} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer" | "titleLeading"> & Readonly<{
  composer: ReactNode;
  /** Shown while the reader is away from the latest message; the host owns scroll position and visibility. */
  jumpToLatest?: Readonly<{ label: string; icon: ReactNode; onPress(): void }>;
  /** Peer or room photo beside the centered title; group rooms add the member count through `titleBadge`. */
  avatar?: ReactNode;
}>;
/** Caller supplies a virtualized timeline and keyboard-aware composer; no implicit auto-scroll or send. */
export function ChatScreen({ composer, jumpToLatest, avatar, scroll = "content", ...props }: ChatScreenProps) {
  // An empty conversation must still allow its first message; unavailable states hide input.
  const showComposer = !props.state || props.state.kind === "ready" || props.state.kind === "empty";
  // Anchor the jump control to the composer edge so it floats over the timeline without measuring the footer.
  // Conversations center the peer between back and tools and use the measured 10px timeline gutter (2026-10-16).
  return <ScreenLayout {...props} className={classNames("hjm-chat-screen", props.className) ?? "hjm-chat-screen"} titleLeading={avatar} scroll={scroll} footer={showComposer ? <div className="hjm-chat-screen__footer">
    {jumpToLatest ? <div className="hjm-chat-screen__jump"><IconButton label={jumpToLatest.label} size="small" shape="circle" tone="secondary" onClick={jumpToLatest.onPress}>{jumpToLatest.icon}</IconButton></div> : null}
    {composer}</div> : null} />;
}

export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
  maxLength?: number;
  /** Opt-in count/ring appears only near the actual maxLength; never trims drafts. */
  lengthFeedback?: ComposerLengthFeedback;
  sendDisabled?: boolean;
  additionalContent?: boolean;
  leadingAction?: ReactNode;
  inputRef?: Ref<HTMLTextAreaElement>;
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
  /** Canonical layout-only placement on the composer root. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, descriptionAlign = "start", error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }: MessageComposerProps) {
  validateMessageAttachments(attachments);
  if (attachments.length && !onRemoveAttachment) throw new TypeError("Attachments require a removal callback");
  if (lengthFeedback && maxLength === undefined) throw new TypeError("Composer length feedback requires maxLength");
  const limit = !lengthFeedback ? null : resolveComposerLimit(value, maxLength!, lengthFeedback.threshold);
  const canSend = !sendDisabled && !limit?.exceeded && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
  const locked = disabled || pending;
  const sendDiameter = iconButtonRecipe.sizes[sendPresentation === "circle" ? "small" : "medium"].diameter;
  // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
  const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || attachmentAction.disabled} onClick={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  // Readonly pending input preserves the keyboard/focus for receipt failure recovery; disabling it would blur desktop chat.
  // Enter is opt-in and IME-safe; receipt-driven clearing and failed-send recovery belong to the host.
  const composerBody = <>{attachments.length ? <div className="hjm-message-composer__attachments">{attachments.map(item => <div key={item.id} className="hjm-message-composer__attachment"><div className="hjm-message-composer__preview">{item.preview}</div><span className="hjm-message-composer__remove"><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked || item.disabled} onClick={() => { if (!locked && !item.disabled) onRemoveAttachment?.(item.id); }}><span className="hjm-message-composer__remove-glyph" aria-hidden="true">×</span></IconButton></span></div>)}{attach}</div> : null}
    <div className="hjm-message-composer__row">{leading ? <span className="hjm-message-composer__leading">{leading}</span> : null}<TextArea ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" rows={screenPatternRecipe.composerMinLines} aria-label={label} placeholder={placeholder} description={description} error={error} aria-invalid={invalid || undefined} onBlur={onBlur} value={value} disabled={disabled} readOnly={pending} aria-busy={pending || undefined}
      onKeyDown={event => { if (shouldSubmitMessageKey({key:event.key, shiftKey:event.shiftKey, isComposing:event.nativeEvent.isComposing, keyCode:event.nativeEvent.keyCode}, submitMode)) { event.preventDefault(); if (canSend) onSend(value); } }}
      onChange={event => { if (!locked) onValueChange(event.currentTarget.value); }} minVisibleLines={screenPatternRecipe.composerMinLines} maxVisibleLines={screenPatternRecipe.composerMaxLines}
      {...(sendIcon ? { trailing: <span className="hjm-message-composer__trailing" style={{ minInlineSize: sendDiameter, minBlockSize: sendDiameter }}>{/* Reserve the send diameter so typing never resizes the field; a hidden duplicate made two "send" buttons. */}<span className="hjm-message-composer__visible">{hasContent || pending ? send : attach}</span></span> } : {})} />
      {sendIcon ? null : send}
    </div></>;
  const quickRow = quickInserts?.items.length ? <div className="hjm-message-composer__quick" role="group" aria-label={quickInserts.label} style={{ "--hjm-quick-size": `${composerQuickInsertRecipe.itemSize}px`, "--hjm-quick-emoji": `${composerQuickInsertRecipe.emojiSize}px` } as React.CSSProperties}>
    {quickInserts.items.map(item => <button key={item.id} type="button" className="hjm-message-composer__quick-item" aria-label={item.label} disabled={locked} onClick={() => onValueChange(value + item.emoji)}>{item.emoji}</button>)}
  </div> : null;
  // The error is announced by TextArea's shared Field error region (internal/field-error.tsx); no composer-only copy.
  return <div className="hjm-message-composer" data-send-presentation={sendPresentation} data-description-align={descriptionAlign} style={{"--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle} as React.CSSProperties}>{context}{quickRow}{/* Replying wraps target, attachments and input in one card (2026-10-16 reference). */}{/* One stable wrapper whether or not replying, so the textarea is never remounted (focus stays). */}<div className="hjm-message-composer__reply-card" data-replying={replyTo ? true : undefined}>{replyTo ? <div className="hjm-message-composer__reply"><div className="hjm-message-composer__reply-text"><Text emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted" className="hjm-message-composer__reply-excerpt">{replyTo.excerpt}</Text></div><IconButton label={replyTo.cancelLabel} tone="secondary" size="small" shape="circle" disabled={locked} onClick={replyTo.onCancel}><Text>×</Text></IconButton></div> : null}{composerBody}</div>{lengthFeedback && limit?.near ? <Progress shape="circular" label={lengthFeedback.label} value={Math.min(limit.used, limit.max)} max={limit.max} valueText={lengthFeedback.formatCount(limit.used, limit.max)}><Text variant="caption">{lengthFeedback.formatCount(limit.used, limit.max)}</Text></Progress> : null}</div>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean; icon?:ReactNode}>; replyLink?: Readonly<{label:string; onPress():void}>; /** HJM-drawn quote ("Replying to X" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */ replyQuote?: Readonly<{ title: string; excerpt: string }>; /** Photos sent in the message. Products own the image source, viewer and upload; HJM owns the layout. */ media?: readonly Readonly<{ id: string; label: string; preview: ReactNode; aspectRatio?: number; onPress?(): void }>[]; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>; menuActions?: readonly MessageMenuAction[]; reportAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean; icon?: ReactNode }>; summary?: ChatMessageReactionSummary }>;
  /** Canonical layout-only placement on the message row. The swipe offset still owns `transform`. */
  layoutStyle?: HjmCompositionStyleProp }> & Readonly<{
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
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], mediaAlbum, actions, replyAction, replyLink, reactions, children, interactiveContent=false, layoutStyle }: ChatMessageProps) {
  const theme = useOptionalHjmTheme();
  const display = resolveChatMessageGroupDisplay(groupPosition);
  // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
  const visibleTime = display.showTimestamp ? timestamp : "";
  const quote = replyQuote ? <><Text emphasis="strong">{replyQuote.title}</Text><Text tone="muted" className="hjm-chat-message__quote-excerpt">{replyQuote.excerpt}</Text></> : reply;
  // The quote stays inside the bubble; with replyLink a click on it jumps to the original (2026-10-16 reference).
  validateMediaSetChoice(media.length > 0, mediaAlbum !== undefined);
  const [albumIndex, setAlbumIndex] = useMediaAlbumIndex(mediaAlbum);
  const mediaBlock = mediaAlbum ? <MediaAlbumView album={mediaAlbum} index={albumIndex} onIndexChange={setAlbumIndex} width={chatMessageRecipe.mediaWidth} radius={chatMessageRecipe.bubbleRadius} />
    : media.length ? <div className="hjm-chat-message__media" style={{ inlineSize: chatMessageRecipe.mediaWidth, gap: chatMessageRecipe.mediaGap, gridTemplateColumns: `repeat(${resolveChatMediaColumns(media.length)}, minmax(0, 1fr))` } as React.CSSProperties}>
    {media.map(item => { const style = { aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? <button key={item.id} type="button" className="hjm-chat-message__media-item" aria-label={item.label} style={style} onClick={item.onPress}>{item.preview}</button> : <div key={item.id} role="img" aria-label={item.label} className="hjm-chat-message__media-item" style={style}>{item.preview}</div>; })}
  </div> : null;
  // A photo-only message drops the bubble surface so the photo itself is the message.
  const photoOnly = (media.length > 0 || mediaAlbum !== undefined) && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
  const quoteBlock = quote ? (replyLink ? <button type="button" className="hjm-chat-message__reply hjm-chat-message__quote" aria-label={replyLink.label} onClick={replyLink.onPress}>{quote}</button> : <div className="hjm-chat-message__reply">{quote}</div>) : null;
  const revealTime = timestampPresentation === "swipe" && !!timestamp;
  // Only the pointer that began a drag can finish it; another touch must not reply or cancel it.
  const start = useRef<{x:number;y:number;pointerId:number} | null>(null);
  const [offset, setOffset] = useState(0);
  const finish = () => { start.current = null; setOffset(0); };
  const menu = useRef<MessageReactionsHandle>(null);
  const summary = reactions?.summary;
  const reactionMenu = reactions ? omitReactionSummary(reactions) : undefined;
  const summaryItems = summary ? resolveChatReactionSummary(summary) : [];
  const summaryButton = reactions && summary && summaryItems.length ? (summary.readOnly ? <ReactionSummaryText label={summary.label} items={summaryItems} /> : <ReactionSummaryButton label={summary.label} items={summaryItems} selected={reactions.value} disabled={reactions.disabled ?? false} onPress={() => menu.current?.open()} />) : null;
  return <article tabIndex={replyAction && !replyAction.disabled ? 0 : undefined}
    aria-keyshortcuts={replyAction ? "Alt+ArrowLeft Alt+ArrowRight" : undefined} aria-description={replyAction?.label}
    onKeyDown={event => { if (event.target === event.currentTarget && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight") && replyAction && !replyAction.disabled) { event.preventDefault(); replyAction.onPress(); } }}
    onPointerDown={event => { if (start.current || (!revealTime && (!replyAction || replyAction.disabled)) || event.button !== 0 || (event.target as HTMLElement).closest("button,a,input,textarea")) return; start.current = {x:event.clientX,y:event.clientY,pointerId:event.pointerId}; }}
    onPointerMove={event => { if (!start.current || start.current.pointerId !== event.pointerId) return; const dx=event.clientX-start.current.x,dy=event.clientY-start.current.y; if (Math.abs(dy)>10 && Math.abs(dy)>Math.abs(dx)) {finish();return;} if (revealTime) setOffset((direction === "outgoing" ? -1 : 1) * timestampRevealOffset(direction === "outgoing" ? -dx : dx,dy)); else if (Math.abs(dx)>Math.abs(dy)*2) setOffset(Math.max(-72,Math.min(72,dx))); }}
    onPointerUp={event => { if (start.current?.pointerId !== event.pointerId) return; if (!revealTime && start.current && replyAction && !replyAction.disabled && isReplySwipe(event.clientX-start.current.x,event.clientY-start.current.y)) replyAction.onPress(); finish(); }} onPointerCancel={event => { if (start.current?.pointerId === event.pointerId) finish(); }} onPointerLeave={event => { if (start.current?.pointerId === event.pointerId) finish(); }}
    style={{ ...layoutStyle, position: "relative", overflow: "hidden", marginBlockStart: display.spacingBefore,
    // Reserve tip room only where it protrudes (own trailing edge, or leading edge without an avatar column).
    ...(bubbleTail ? (direction === "outgoing" ? { paddingInlineEnd: chatMessageRecipe.tailWidth } : avatar ? {} : { paddingInlineStart: chatMessageRecipe.tailWidth }) : {}), touchAction: revealTime || replyAction ? "pan-y" : undefined }} aria-label={author}>
    {revealTime ? <time style={{ position: "absolute", ...(direction === "outgoing" ? { right: 0, justifyContent: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", opacity: offset !== 0 ? 1 : 0, pointerEvents: "none" }}><Text variant="caption" tone="muted">{timestamp}</Text></time> : null}
    <div className="hjm-chat-message" style={{ transform: `translateX(${offset}px)`, transition: start.current || theme?.environment.reducedMotion ? "none" : "transform var(--hjm-motion-normal, 200ms) ease-out", "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth, "--hjm-chat-avatar-size": `${chatMessageRecipe.avatarSize}px` } as React.CSSProperties} data-direction={direction} data-tail={(bubbleTail && display.showTail) || undefined}>
    {/* Later bubbles of a run keep the avatar column so their edges line up under the first bubble. */}
    {avatar ? <div className="hjm-chat-message__avatar" aria-hidden={display.showAvatar ? undefined : true}>{display.showAvatar ? avatar : null}</div> : null}
    <div className="hjm-chat-message__content">{author && display.showAuthor && direction !== "outgoing"?<Text variant="caption" tone="muted">{author}</Text>:null}
      {/* Time and delivery sit beside the bubble's bottom edge, on the side facing the open space. */}
      <div className="hjm-chat-message__body">
      {reactionMenu ? <MessageReactions {...reactionMenu} menuRef={menu} interactiveContent={interactiveContent || mediaAlbum !== undefined} {...(timestamp ? { menuTitle: timestamp } : {})} {...(replyAction && !replyAction.disabled ? {replyAction} : {})}>{quoteBlock}{mediaBlock}{photoOnly ? null : children}</MessageReactions> : <div className="hjm-chat-message__bubble" data-photo-only={photoOnly || undefined}>{quoteBlock}{mediaBlock}{photoOnly ? null : children}</div>}
      {(!revealTime && visibleTime)||deliveryLabel||actions||summaryButton?<div className="hjm-chat-message__meta">{summaryButton}{(!revealTime && visibleTime)||deliveryLabel?<Text variant="caption" tone="muted">{[revealTime ? "" : visibleTime, deliveryLabel].filter(Boolean).join(" · ")}</Text>:null}{actions}</div>:null}
      </div>
    </div>
    </div>
  </article>;
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
      {resolved.busy ? (loadingIndicator ? <div role="status" aria-busy="true" aria-label={[state.title, state.description].filter(Boolean).join(". ")}><div aria-hidden="true">{loadingIndicator}</div></div> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <div role={state.kind === "error" ? "alert" : "status"} style={{ textAlign: "center" }}>{/* Block, centered lines as Native; the live role covers the copy only, not stateAction. */}<Text as="p" variant={resolved.titleVariant}>{state.title}</Text>{state.description ? <Text as="p" tone="muted">{state.description}</Text> : null}</div>}
      {stateAction}
    </Stack>;
  const content = <>
    {title || description || badge || leading || actions ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap: "wrap"}}>
      {/* Keep the copy’s natural width as its flex basis so actions wrap before squeezing a short title (Spint cell header). */}
      {/* A leading glyph and its copy are one group: when the title is long the copy wraps beside the glyph
          instead of the whole copy dropping under a lone glyph (2026-10-23, same fault as StatisticGroup). */}
      {leading ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%"}}>
        {leading}<Stack gap="xxs" layoutStyle={{flexShrink: 1, minWidth: 0}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? (titleSize === "compact" ? <Text variant="body" role="heading" aria-level={headingLevel} style={{fontWeight: 500}}>{title}</Text> : <Heading level="level5" semanticLevel={headingLevel}>{title}</Heading>) : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>
      </Stack> : <Stack gap="xxs" layoutStyle={{flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%"}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? (titleSize === "compact" ? <Text variant="body" role="heading" aria-level={headingLevel} style={{fontWeight: 500}}>{title}</Text> : <Heading level="level5" semanticLevel={headingLevel}>{title}</Heading>) : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>}{actions}
    </Stack> : null}
    {notice}
    {state.kind === "ready" ? children : stateMinHeight === null ? stateGroup : <div data-hjm-state-height={stateHeight} style={{display: "flex", flexDirection: "column", flex: 1, minHeight: stateMinHeight}}>{stateGroup}</div>}
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
  avatarBadge?: ReactNode;
  thumbnail?: ReactNode;
  unread?: boolean;
  /** The section/list supplies the boundary; HJM aligns its divider with the preview column. */
  separator?: boolean;
  /** One optional command around the passive preview; the product retains routing/permission decisions. */
  action?: Readonly<{ label: string; onActivate(): void; disabled?: boolean }>;

}>;

/** Optional shared command host; passive previews remain compatible with existing router/gesture hosts. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false, separator = false, action }: NotificationRowProps) {
  const r = notificationRecipe;
  if (action && !action.label.trim()) throw new TypeError("NotificationRow action requires a localized label");
  const content = <span aria-hidden="true" data-hjm-notification-row="true" style={{ position: "relative", display: "flex", alignItems: "center", gap: r.gap, padding: `${r.paddingBlock}px ${r.paddingInline}px`, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
    {separator ? <span data-hjm-notification-separator="true" style={{ position: "absolute", insetBlockStart: 0, insetInlineStart: r.separatorInsetStart, insetInlineEnd: 0, borderBlockStart: "1px solid var(--hjm-color-border)" }} /> : null}
    <span style={{ position: "relative", width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }}>
      <span style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden", borderRadius: "50%" }}>{avatar}</span>
      {avatarBadge ? <span style={{ position: "absolute", bottom: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: "50%", background: "var(--hjm-color-surface)", border: "2px solid var(--hjm-color-surface)", boxSizing: "border-box" }}>{avatarBadge}</span> : null}
    </span>
    <span data-hjm-notification-copy="true" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: r.contentGap }}>
      <Text style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: r.previewLines, overflow: "hidden" }}>{preview}</Text>
      <span style={{ display: "flex", alignItems: "center", gap: r.contentGap }}><Text variant="caption" tone="muted">{metadata}</Text>{unread ? <span data-hjm-unread-dot="true" style={{ width: r.unreadSize, height: r.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" }} /> : null}</span>
    </span>
    {thumbnail ? <span style={{ width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: "var(--hjm-radius-sm)" }}>{thumbnail}</span> : null}
  </span>;
  return action ? <button type="button" className="hjm-notification-row-action" aria-label={action.label}
    disabled={action.disabled} onClick={() => { if (!action.disabled) action.onActivate(); }}
    style={{ "--hjm-notification-disabled-opacity": r.interaction.disabledOpacity, "--hjm-notification-pressed-opacity": r.interaction.pressedOpacity } as React.CSSProperties}>
    {content}
  </button> : content;
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
  /** Simple activation is HJM-owned; omit for product drag/long-press gesture hosts. */
  onActivate?: () => void;
  activationLabel?: string;
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
export function IconTile({icon, label, overlay, labelLines = 1, ghost = false, frame = iconTileRecipe.defaults.frame, shape = iconTileRecipe.defaults.shape, size = iconTileRecipe.defaults.size, onActivate, activationLabel, disabled = false, locked = false, lockedLabel, accessory, accessoryPlacement = iconTileRecipe.defaults.accessoryPlacement, layoutStyle}: IconTileProps) {
  const r = iconTileRecipe;
  if (onActivate && !(activationLabel ?? label).trim()) throw new TypeError("Interactive IconTile requires a label");
  if (locked && (!onActivate || !lockedLabel?.trim())) throw new TypeError("A locked IconTile needs onActivate and a lockedLabel");
  if (!(cornerAccessoryPlacements as readonly string[]).includes(accessoryPlacement)) throw new TypeError(`Unsupported IconTile accessoryPlacement: ${accessoryPlacement}`);
  const dim = ghost ? r.ghostOpacity : locked ? r.locked.opacity : 1;
  const framed = frame === "surface";
  // Percent radius follows the rendered size, so a filling icon keeps its shape at every cell width.
  const dimensions = size === "fill" ? {width: "100%", minWidth: r.fillMinSize, maxWidth: r.fillMaxSize, aspectRatio: "1"} : {width: r.iconSize, height: r.iconSize};
  // A render-function icon needs the filling edge as a number. It is read before paint and on every resize; the
  // computed width ignores transforms (a host's press scale) and keeps fractional cell widths.
  const frameRef = useRef<HTMLSpanElement>(null);
  const measureEdge = size === "fill" && typeof icon === "function";
  const [fillEdge, setFillEdge] = useState<number>(r.fillMinSize);
  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!measureEdge || !element) return;
    setFillEdge(Number.parseFloat(getComputedStyle(element).width) || r.fillMinSize);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => { const width = entry?.borderBoxSize?.[0]?.inlineSize; if (width) setFillEdge(width); });
    observer.observe(element);
    return () => observer.disconnect();
  }, [measureEdge, r.fillMinSize]);
  const edge = size === "fill" ? fillEdge : r.iconSize;
  const content = <span data-hjm-icon-tile="true" data-frame={frame} data-shape={shape} data-size={size} data-locked={locked || undefined} style={{position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible", ...(onActivate ? {} : layoutStyle)}}>
    <span ref={frameRef} style={{position: "relative", display: "flex", alignItems: "center", justifyContent: "center", ...dimensions, boxSizing: "border-box", flexShrink: 0, borderRadius: `${Math.round(r.shapes[shape] * 100)}%`, background: framed ? "var(--hjm-color-surface-alt)" : undefined, color: "var(--hjm-color-text)", boxShadow: ghost || !framed ? undefined : "0 0 0 1px var(--hjm-color-border)", outline: ghost ? "1px dashed var(--hjm-color-text-muted)" : undefined, opacity: dim, fontSize: 32}}>{typeof icon === "function" ? icon({edge}) : icon}{overlay}</span>
    {/* The accessory sits in a box laid over the frame (same size rules, centered) so dimming the frame never dims it. */}
    {accessory ? <span aria-hidden={onActivate ? true : undefined} style={{position: "absolute", insetBlockStart: 0, left: "50%", transform: "translateX(-50%)", ...dimensions, boxSizing: "border-box", pointerEvents: "none"}}>
      <span data-hjm-icon-tile-accessory={accessoryPlacement} style={{position: "absolute", display: "inline-flex", insetInlineEnd: -r.accessory.offset, ...(accessoryPlacement === "top-end" ? {insetBlockStart: -r.accessory.offset} : {insetBlockEnd: -r.accessory.offset})}}>{accessory}</span>
    </span> : null}
    <Text variant="caption" style={{opacity: locked ? r.locked.opacity : undefined, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: labelLines, width: "100%", maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "center", fontWeight: 500}}>{label}</Text>
  </span>;
  if (!onActivate) return content;
  return <button type="button" className="hjm-icon-tile-action" aria-label={locked ? `${activationLabel ?? label}, ${lockedLabel}` : activationLabel ?? label} disabled={disabled}
    style={{ "--hjm-icon-tile-pressed-opacity": r.activation.pressedOpacity, "--hjm-icon-tile-disabled-opacity": r.activation.disabledOpacity,
      minWidth: r.activation.minimumTarget, minHeight: r.activation.minimumTarget, ...layoutStyle } as React.CSSProperties}
    onClick={() => { if (!disabled) onActivate(); }}>{content}</button>;
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
  const theme = useOptionalHjmTheme();
  const r = typingIndicatorRecipe, m = chatMessageRecipe;
  // A polite status: appearing is announced once without interrupting, and the dots stay hidden from assistive tech.
  return <div role="status" className="hjm-typing-indicator" data-reduced-motion={theme?.environment.reducedMotion || undefined}
    style={{ display: "flex", alignItems: "flex-start", gap: m.avatarGap, marginBlockStart: m.groupGap, paddingInlineStart: avatar ? 0 : m.tailWidth, ...layoutStyle, "--hjm-typing-dot": `${r.dotSize}px`, "--hjm-typing-cycle": `${r.cycleMs}ms`, "--hjm-typing-rest": r.restOpacity } as React.CSSProperties}>
    {avatar ? <span aria-hidden="true" style={{ display: "flex", justifyContent: "center", flex: `0 0 ${m.avatarSize}px`, inlineSize: m.avatarSize }}>{avatar}</span> : null}
    <span aria-hidden="true" className="hjm-typing-indicator__bubble" style={{ display: "inline-flex", alignItems: "center", gap: r.dotGap, boxSizing: "border-box", minBlockSize: `calc(var(--hjm-type-body-line-height) + ${m.bubblePaddingBlock * 2}px)`, paddingBlock: m.bubblePaddingBlock, paddingInline: m.bubblePaddingInline, borderRadius: m.bubbleRadius, background: "var(--hjm-color-surface)" }}>
      {[0, 1, 2].map(index => <span key={index} className="hjm-typing-indicator__dot" style={{ animationDelay: `${index * r.staggerMs}ms` }} />)}
    </span>
    <VisuallyHidden>{label}</VisuallyHidden>
  </div>;
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
export function ChatDateSeparator({ label, dateTime, layoutStyle }: ChatDateSeparatorProps) {
  if (!label.trim()) throw new TypeError("ChatDateSeparator requires a localized label");
  const r = chatDateSeparatorRecipe;
  return <div className="hjm-chat-date-separator" style={{ display: "flex", justifyContent: "center", textAlign: "center", paddingBlockStart: r.paddingTop, paddingBlockEnd: r.paddingBottom, ...layoutStyle }}>
    <Text variant={r.textVariant} tone={r.tone}>{dateTime ? <time dateTime={dateTime}>{label}</time> : label}</Text>
  </div>;
}
