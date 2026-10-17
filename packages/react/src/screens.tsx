import { iconTileRecipe, notificationRowRecipe as notificationRecipe } from "@hjmds/design-contracts/screen-patterns";
import { iconButtonRecipe, listRowRecipe } from "@hjmds/design-contracts/recipes";
import { resolveComposerLimit, type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen, type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions, type MessageMenuAction } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { useOptionalHjmTheme } from "./provider.js";
import { TextArea } from "./forms.js";
import { useId, useLayoutEffect, useRef, useState, type Ref, type ReactNode } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, chatMessageRecipe, composerQuickInsertRecipe, resolveChatMessageGroupDisplay, resolveChatMediaColumns, screenHeaderRecipe, validateScreenExit, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState, type ScreenContentInset } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";
import { Section, Stack, Text } from "./layout.js";
import { ListRow, type ListRowProps } from "./display.js";
import { classNames, useDesignProfileDefaults } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** The shared header owns badge placement; the product supplies its meaning and label. */
  titleBadge?: ReactNode;
  /** Hide redundant route names while retaining descriptions and a named screen. */
  titleVisibility?: "visible" | "hidden";
  /** Centered by default (2026-10-17 user rule); `start` remains available. Extra actions sit at the trailing edge. */
  headerAlignment?: "start" | "center";
  /** Preserve host navigation while the shared shell owns content and state. */
  header?: ReactNode;
  /** `none`: host owns every inset. `body-edge`: only the body drops its inline padding so list rows own their inset. */
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
  /** A virtualized list must own scrolling; never nest it inside a second scroll container. */
  scroll?: "screen" | "content";
  as?: "main" | "section";
  className?: string;
  /**
   * Canonical layout-only placement on the screen root (for example `flex` or `width` in a split
   * view), matching Native ScreenLayout. Every screen built on ScreenLayout forwards it.
   */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, titleBadge, titleVisibility = "visible", headerAlignment = "center", header, contentInset = "default", contentAlignment = "start", surface = "default", presentation: suppliedPresentation, description, exit, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", as: Element = "main", className, layoutStyle , hjmTitleLeading }: ScreenLayoutProps & Readonly<{ /** Internal: ChatScreen header photo. */ hjmTitleLeading?: ReactNode }>) {
  const id = useId();
  if (exit) validateScreenExit(exit, false);
  const leading = exit ? <ScreenExitButton {...exit} /> : null;
  const showHeader = titleVisibility === "visible" || !!description || !!leading || !!actions;
  // Same header band as Native (screenHeaderRecipe): a fixed 52 band (48 icon-only) so the title sits at the same
  // height with or without exit/actions buttons (2026-10-17: Web grew 58→76 when a 44 button was present).
  const compactHeader = header == null && headerAlignment === "center" && titleVisibility === "hidden" && !description;
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
    const previous = lastBodyFocus.current;
    if (previous && !previous.isConnected && document.activeElement === document.body) {
      bodyRef.current?.focus({ preventScroll: true });
    }
    if (previous && !previous.isConnected) lastBodyFocus.current = null;
  });
  const recipe = screenPatternRecipe;
  return <Element aria-labelledby={header || titleVisibility === "hidden" ? undefined : id} aria-label={header || titleVisibility === "hidden" ? title : undefined} data-content-inset={contentInset} data-presentation={presentation} className={classNames("hjm-screen", className)}
    style={{ backgroundColor: surface === "transparent" || designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle } as React.CSSProperties}>
    {header ?? (showHeader ? headerAlignment === "center" ? <header className="hjm-screen__header" style={{ display: "grid", gridTemplateColumns: "1fr minmax(0, auto) 1fr", alignItems: "center", boxSizing: "border-box", minBlockSize: compactHeader ? screenHeaderRecipe.compactMinHeight : screenHeaderRecipe.minHeight, paddingBlock: compactHeader ? screenHeaderRecipe.compactPaddingVertical : screenHeaderRecipe.paddingVertical }}>
      {/* Equal side columns sized by their controls and a title-size (18) heading, matching Native's measured
          centered header (2026-10-17: the fixed 1:2:1 split with a level3 heading wrapped short titles). */}
      <div>{leading}</div><div className="hjm-screen__heading" style={{ textAlign: "center", minWidth: 0 }}>
        {titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify="center" wrap>{hjmTitleLeading}<Heading level={screenHeaderRecipe.centeredTitleLevel} semanticLevel={1} id={id}>{title}</Heading>{titleBadge}</Stack>}
        {description ? <Text as="p" tone="muted">{description}</Text> : null}</div><div style={{ justifySelf: "end" }}>{actions}</div>
    </header> : <header className="hjm-screen__header" style={profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined}>
      {leading}<div className="hjm-screen__heading">{titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify={profileLayout?.centered ? "center" : "start"} wrap><Heading level={screenHeaderRecipe.titleLevel} semanticLevel={1} id={id}>{title}</Heading>{titleBadge}</Stack>}
        {description ? <Text as="p" tone="muted">{description}</Text> : null}</div>{actions}
    </header> : null)}
    {notice ? <div className="hjm-screen__notice">{notice}</div> : null}
    {/* Scrollable read-only screens still need a keyboard entry point. */}
    <div ref={bodyRef} tabIndex={bodyScroll === "content" ? -1 : 0}
      onFocusCapture={event => { lastBodyFocus.current = event.target as HTMLElement; }}
      onBlurCapture={event => {
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
        {resolved.busy ? <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} /> : <div role={state.kind === "error" ? "alert" : "status"}>
          <Stack gap="sm" align="center"><Text variant="title">{state.title}</Text>
            {state.description ? <Text tone="muted">{state.description}</Text> : null}</Stack>
        </div>}
        {stateAction}
      </div>}
    </div>
    {/* Same rule as Native: with contentInset="none" the host owns the insets, so BottomCTA keeps its own bar. */}
    {footer ? <footer className="hjm-screen__footer"><ScreenFooterContext.Provider value={contentInset !== "none"}>{footer}</ScreenFooterContext.Provider></footer> : null}
  </Element>;
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
}>;
export function NotificationItem({ read, statusLabel, timestamp, description, title, className, ...props }: NotificationItemProps) {
  return <ListRow {...props} className={classNames("hjm-notification-item", className)} data-unread={!read || undefined} title={<Text variant={listRowRecipe.title.textVariant} emphasis={read ? "regular" : "strong"}>{title}</Text>}
    description={<Stack gap="xxs">{description}<Text variant="caption" tone="muted">{statusLabel} · {timestamp}</Text></Stack>} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{
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
  return <ScreenLayout {...props} className={classNames("hjm-chat-screen", props.className) ?? "hjm-chat-screen"} hjmTitleLeading={avatar} scroll={scroll} footer={showComposer ? <div className="hjm-chat-screen__footer">
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
export function MessageComposer({ leading, quickInserts, value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }: MessageComposerProps) {
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
  return <div className="hjm-message-composer" data-send-presentation={sendPresentation} style={{"--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle} as React.CSSProperties}>{context}{quickRow}{/* Replying wraps target, attachments and input in one card (2026-10-16 reference). */}{/* One stable wrapper whether or not replying, so the textarea is never remounted (focus stays). */}<div className="hjm-message-composer__reply-card" data-replying={replyTo ? true : undefined}>{replyTo ? <div className="hjm-message-composer__reply"><div className="hjm-message-composer__reply-text"><Text emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted" className="hjm-message-composer__reply-excerpt">{replyTo.excerpt}</Text></div><IconButton label={replyTo.cancelLabel} tone="secondary" size="small" shape="circle" disabled={locked} onClick={replyTo.onCancel}><Text>×</Text></IconButton></div> : null}{composerBody}</div>{lengthFeedback && limit?.near ? <Progress shape="circular" label={lengthFeedback.label} value={Math.min(limit.used, limit.max)} max={limit.max} valueText={lengthFeedback.formatCount(limit.used, limit.max)}><Text variant="caption">{lengthFeedback.formatCount(limit.used, limit.max)}</Text></Progress> : null}</div>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean; icon?:ReactNode}>; replyLink?: Readonly<{label:string; onPress():void}>; /** HJM-drawn quote ("X에게 답장" + one-line excerpt) heading the bubble; preferred over a custom `reply` node. */ replyQuote?: Readonly<{ title: string; excerpt: string }>; /** Photos sent in the message. Products own the image source, viewer and upload; HJM owns the layout. */ media?: readonly Readonly<{ id: string; label: string; preview: ReactNode; aspectRatio?: number; onPress?(): void }>[]; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>; menuActions?: readonly MessageMenuAction[]; reportAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean; icon?: ReactNode }> }>;
  /** Canonical layout-only placement on the message row. The swipe offset still owns `transform`. */
  layoutStyle?: HjmCompositionStyleProp }>;
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = true, groupPosition = "single", deliveryLabel, avatar, reply, replyQuote, media = [], actions, replyAction, replyLink, reactions, children, interactiveContent=false, layoutStyle }: ChatMessageProps) {
  const theme = useOptionalHjmTheme();
  const display = resolveChatMessageGroupDisplay(groupPosition);
  // A run shows its time once, beside its last bubble; delivery state stays on every bubble.
  const visibleTime = display.showTimestamp ? timestamp : "";
  const quote = replyQuote ? <><Text emphasis="strong">{replyQuote.title}</Text><Text tone="muted" className="hjm-chat-message__quote-excerpt">{replyQuote.excerpt}</Text></> : reply;
  // The quote stays inside the bubble; with replyLink a click on it jumps to the original (2026-10-16 reference).
  const mediaBlock = media.length ? <div className="hjm-chat-message__media" style={{ inlineSize: chatMessageRecipe.mediaWidth, gap: chatMessageRecipe.mediaGap, gridTemplateColumns: `repeat(${resolveChatMediaColumns(media.length)}, minmax(0, 1fr))` } as React.CSSProperties}>
    {media.map(item => { const style = { aspectRatio: media.length > 1 ? 1 : item.aspectRatio ?? 1 }; return item.onPress ? <button key={item.id} type="button" className="hjm-chat-message__media-item" aria-label={item.label} style={style} onClick={item.onPress}>{item.preview}</button> : <div key={item.id} role="img" aria-label={item.label} className="hjm-chat-message__media-item" style={style}>{item.preview}</div>; })}
  </div> : null;
  // A photo-only message drops the bubble surface so the photo itself is the message.
  const photoOnly = media.length > 0 && !reply && !replyQuote && (children === null || children === undefined || children === false || children === "");
  const quoteBlock = quote ? (replyLink ? <button type="button" className="hjm-chat-message__reply hjm-chat-message__quote" aria-label={replyLink.label} onClick={replyLink.onPress}>{quote}</button> : <div className="hjm-chat-message__reply">{quote}</div>) : null;
  const revealTime = timestampPresentation === "swipe" && !!timestamp;
  // Only the pointer that began a drag can finish it; another touch must not reply or cancel it.
  const start = useRef<{x:number;y:number;pointerId:number} | null>(null);
  const [offset, setOffset] = useState(0);
  const finish = () => { start.current = null; setOffset(0); };
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
      {reactions ? <MessageReactions {...reactions} interactiveContent={interactiveContent} {...(timestamp ? { menuTitle: timestamp } : {})} {...(replyAction && !replyAction.disabled ? {replyAction} : {})}>{quoteBlock}{mediaBlock}{photoOnly ? null : children}</MessageReactions> : <div className="hjm-chat-message__bubble" data-photo-only={photoOnly || undefined}>{quoteBlock}{mediaBlock}{photoOnly ? null : children}</div>}
      {(!revealTime && visibleTime)||deliveryLabel||actions?<div className="hjm-chat-message__meta">{(!revealTime && visibleTime)||deliveryLabel?<Text variant="caption" tone="muted">{[revealTime ? "" : visibleTime, deliveryLabel].filter(Boolean).join(" · ")}</Text>:null}{actions}</div>:null}
      </div>
    </div>
    </div>
  </article>;
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
  return <Stack gap="md" {...(layoutStyle === undefined ? {} : {layoutStyle})}>
    {title || description || badge || leading || actions ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap: "wrap"}}>
      {leading}<Stack gap="xxs" layoutStyle={{flex: 1, minWidth: 0}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? <Heading level="level3" semanticLevel={headingLevel}>{title}</Heading> : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>{actions}
    </Stack> : null}
    {notice}
    {state.kind === "ready" ? children : <Stack gap="sm" align="center" justify="center" layoutStyle={{flex: 1}}>
      {resolved.busy ? (loadingIndicator ? <div role="status" aria-busy="true" aria-label={[state.title, state.description].filter(Boolean).join(". ")}><div aria-hidden="true">{loadingIndicator}</div></div> : <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} />) : <div role={state.kind === "error" ? "alert" : "status"} style={{ textAlign: "center" }}>{/* Block, centered lines as Native; the live role covers the copy only, not stateAction. */}<Text as="p" variant="title">{state.title}</Text>{state.description ? <Text as="p" tone="muted">{state.description}</Text> : null}</div>}
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

/** Router host owns the sole target and localized accessible name, as with ConversationRow. */
export function NotificationRow({ preview, metadata, avatar, avatarBadge, thumbnail, unread = false }: NotificationRowProps) {
  const r = notificationRecipe;
  return <span aria-hidden="true" data-hjm-notification-row="true" style={{ display: "flex", alignItems: "center", gap: r.gap, padding: `${r.paddingBlock}px ${r.paddingInline}px`, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
    <span style={{ position: "relative", width: r.avatarSize, height: r.avatarSize, flexShrink: 0 }}>
      <span style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden", borderRadius: "50%" }}>{avatar}</span>
      {avatarBadge ? <span style={{ position: "absolute", bottom: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", width: r.avatarBadgeSize, height: r.avatarBadgeSize, borderRadius: "50%", background: "var(--hjm-color-surface)", border: "2px solid var(--hjm-color-surface)", boxSizing: "border-box" }}>{avatarBadge}</span> : null}
    </span>
    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: r.contentGap }}>
      <Text style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: r.previewLines, overflow: "hidden" }}>{preview}</Text>
      <span style={{ display: "flex", alignItems: "center", gap: r.contentGap }}><Text variant="caption" tone="muted">{metadata}</Text>{unread ? <span data-hjm-unread-dot="true" style={{ width: r.unreadSize, height: r.unreadSize, borderRadius: "50%", flexShrink: 0, background: "var(--hjm-color-content-brand)" }} /> : null}</span>
    </span>
    {thumbnail ? <span style={{ width: r.thumbnailSize, height: r.thumbnailSize, flexShrink: 0, overflow: "hidden", borderRadius: "var(--hjm-radius-sm)" }}>{thumbnail}</span> : null}
  </span>;
}

export type IconTileProps = Readonly<{ icon: ReactNode; label: string; overlay?: ReactNode; labelLines?: 1 | 2; ghost?: boolean }>;
/** Presentation shared by launcher and profile grids; the host owns navigation or drag behavior. */
export function IconTile({icon, label, overlay, labelLines = 1, ghost = false}: IconTileProps) {
  const r = iconTileRecipe;
  return <span data-hjm-icon-tile="true" style={{display: "flex", flexDirection: "column", alignItems: "center", gap: r.gap, minWidth: 0, width: "100%", overflow: "visible"}}>
    <span style={{position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: r.iconSize, height: r.iconSize, flexShrink: 0, borderRadius: r.iconRadius, background: "var(--hjm-color-surface-alt)", color: "var(--hjm-color-text)", boxShadow: ghost ? undefined : "0 0 0 1px var(--hjm-color-border)", outline: ghost ? "1px dashed var(--hjm-color-text-muted)" : undefined, opacity: ghost ? r.ghostOpacity : 1, fontSize: 32}}>{icon}{overlay}</span>
    <Text variant="caption" style={{display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: labelLines, width: "100%", maxWidth: labelLines === 2 ? r.multilineLabelMaxWidth : r.labelMaxWidth, minHeight: labelLines === 2 ? r.multilineLabelMinHeight : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "center", fontWeight: 500}}>{label}</Text>
  </span>;
}
