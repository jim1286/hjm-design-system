import { resolveComposerLimit, type ComposerLengthFeedback } from "@hjmds/design-contracts/communication";
import { Progress } from "./feedback.js";
import { resolveDesignProfileScreen, type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { useOptionalHjmTheme } from "./provider.js";
import { TextArea } from "./forms.js";
import { useId, useLayoutEffect, useRef, useState, type Ref, type ReactNode } from "react";
import { isReplySwipe, timestampRevealOffset, shouldSubmitMessageKey, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Spinner } from "./internal/spinner.js";
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
  headerAlignment?: "start" | "center";
  /** Preserve host navigation while the shared shell owns content and state. */
  header?: ReactNode;
  contentInset?: "default" | "none";
  /** Explicit layout wins over the nearest design profile. */
  presentation?: DesignProfileScreenPresentation;
  description?: string;
  leading?: ReactNode;
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
export function ScreenLayout({ title, titleBadge, titleVisibility = "visible", headerAlignment = "start", header, contentInset = "default", presentation: suppliedPresentation, description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", as: Element = "main", className, layoutStyle }: ScreenLayoutProps) {
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
    style={{ backgroundColor: designProfile?.material.canvas ? "transparent" : undefined, "--hjm-screen-width": `${profileLayout?.maxWidth ?? recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${profileLayout?.gap ?? recipe.sectionGap}px`, "--hjm-screen-item-gap": `${recipe.itemGap}px`, "--hjm-screen-state-gap": `${recipe.stateGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px`, ...layoutStyle } as React.CSSProperties}>
    {header ?? (showHeader ? headerAlignment === "center" ? <header className="hjm-screen__header" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)", alignItems: "center" }}>
      <div>{leading}</div><div className="hjm-screen__heading" style={{ textAlign: "center", minWidth: 0 }}>
        {titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify="center" wrap><Heading level="level3" semanticLevel={1} id={id}>{title}</Heading>{titleBadge}</Stack>}
        {description ? <Text as="p" tone="muted">{description}</Text> : null}</div><div style={{ justifySelf: "end" }}>{actions}</div>
    </header> : <header className="hjm-screen__header" style={profileLayout ? { flexDirection: profileLayout.headerAxis, alignItems: profileLayout.centered ? "center" : undefined, textAlign: profileLayout.centered ? "center" : undefined } : undefined}>
      {leading}<div className="hjm-screen__heading">{titleVisibility === "visible" && <Stack axis="inline" gap="xs" align="center" justify={profileLayout?.centered ? "center" : "start"} wrap><Heading level="level3" semanticLevel={1} id={id}>{title}</Heading>{titleBadge}</Stack>}
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
      className="hjm-screen__body" data-scroll={bodyScroll} data-replacement={resolved.replacesContent || undefined} aria-busy={resolved.busy || undefined}>
      {state.kind === "ready" ? children : <div className="hjm-screen__state">
        {/* Loading copy is an accessible name; visible copy beside the spinner
            contradicts the shared spinner-only loading contract. */}
        {resolved.busy ? <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} /> : <div role={state.kind === "error" ? "alert" : "status"}>
          <Stack gap="sm" align="center"><Text variant="title">{state.title}</Text>
            {state.description ? <Text tone="muted">{state.description}</Text> : null}</Stack>
        </div>}
        {stateAction}
      </div>}
    </div>
    {footer ? <footer className="hjm-screen__footer">{footer}</footer> : null}
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
  return <ListRow {...props} className={classNames("hjm-notification-item", className)} data-unread={!read || undefined} title={<Text emphasis={read ? "regular" : "strong"}>{title}</Text>}
    description={<Stack gap="xxs">{description}<Text variant="caption" tone="muted">{statusLabel} · {timestamp}</Text></Stack>} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{ composer: ReactNode }>;
/** Caller supplies a virtualized timeline and keyboard-aware composer; no implicit auto-scroll or send. */
export function ChatScreen({ composer, scroll = "content", ...props }: ChatScreenProps) {
  // An empty conversation must still allow its first message; unavailable states hide input.
  return <ScreenLayout {...props} scroll={scroll} footer={!props.state || props.state.kind === "ready" || props.state.kind === "empty" ? composer : null} />;
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
export function MessageComposer({ value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, lengthFeedback, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment, layoutStyle }: MessageComposerProps) {
  validateMessageAttachments(attachments);
  if (attachments.length && !onRemoveAttachment) throw new TypeError("Attachments require a removal callback");
  if (lengthFeedback && maxLength === undefined) throw new TypeError("Composer length feedback requires maxLength");
  const limit = !lengthFeedback ? null : resolveComposerLimit(value, maxLength!, lengthFeedback.threshold);
  const canSend = !sendDisabled && !limit?.exceeded && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
  const locked = disabled || pending;
  // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
  const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || attachmentAction.disabled} onClick={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  // Readonly pending input preserves the keyboard/focus for receipt failure recovery; disabling it would blur desktop chat.
  // Enter is opt-in and IME-safe; receipt-driven clearing and failed-send recovery belong to the host.
  return <div className="hjm-message-composer" data-send-presentation={sendPresentation} style={{"--hjm-message-composer-gap": `${screenPatternRecipe.itemGap}px`, "--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`, ...layoutStyle} as React.CSSProperties}>{context}{replyTo ? <Stack axis="inline" gap="sm" align="center"><Stack gap="xxs"><Text variant="caption" emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted">{replyTo.excerpt}</Text></Stack><IconButton label={replyTo.cancelLabel} tone="ghost" disabled={locked} onClick={replyTo.onCancel}><Text>×</Text></IconButton></Stack> : null}
    {attachments.length ? <div className="hjm-message-composer__attachments">{attachments.map(item => <div key={item.id} className="hjm-message-composer__attachment"><div className="hjm-message-composer__preview">{item.preview}</div><span className="hjm-message-composer__remove"><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked || item.disabled} onClick={() => { if (!locked && !item.disabled) onRemoveAttachment?.(item.id); }}><span className="hjm-message-composer__remove-glyph" aria-hidden="true">×</span></IconButton></span></div>)}{attach}</div> : null}
    <div className="hjm-message-composer__row"><TextArea ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" rows={screenPatternRecipe.composerMinLines} aria-label={label} placeholder={placeholder} description={description} error={error} aria-invalid={invalid || undefined} onBlur={onBlur} value={value} disabled={disabled} readOnly={pending} aria-busy={pending || undefined}
      onKeyDown={event => { if (shouldSubmitMessageKey({key:event.key, shiftKey:event.shiftKey, isComposing:event.nativeEvent.isComposing, keyCode:event.nativeEvent.keyCode}, submitMode)) { event.preventDefault(); if (canSend) onSend(value); } }}
      onChange={event => { if (!locked) onValueChange(event.currentTarget.value); }} minVisibleLines={screenPatternRecipe.composerMinLines} maxVisibleLines={screenPatternRecipe.composerMaxLines}
      {...(sendIcon ? { trailing: hasContent || pending ? send : attach } : {})} />
      {sendIcon ? null : send}
    </div>{lengthFeedback && limit?.near ? <Progress shape="circular" label={lengthFeedback.label} value={Math.min(limit.used, limit.max)} max={limit.max} valueText={lengthFeedback.formatCount(limit.used, limit.max)}><Text variant="caption">{lengthFeedback.formatCount(limit.used, limit.max)}</Text></Progress> : null}</div>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean}>; replyLink?: Readonly<{label:string; onPress():void}>; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }> }>;
  /** Canonical layout-only placement on the message row. The swipe offset still owns `transform`. */
  layoutStyle?: HjmCompositionStyleProp }>;
export function ChatMessage({ direction, author, timestamp, timestampPresentation = "always", bubbleTail = false, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent=false, layoutStyle }: ChatMessageProps) {
  const theme = useOptionalHjmTheme();
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
    style={{ ...layoutStyle, position: "relative", overflow: "hidden", paddingInline: bubbleTail ? "var(--hjm-space-xs)" : undefined, touchAction: revealTime || replyAction ? "pan-y" : undefined }} aria-label={author}>
    {revealTime ? <time style={{ position: "absolute", ...(direction === "outgoing" ? { right: 0, justifyContent: "flex-end" } : { left: 0 }), top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", opacity: offset !== 0 ? 1 : 0, pointerEvents: "none" }}><Text variant="caption" tone="muted">{timestamp}</Text></time> : null}
    <div className="hjm-chat-message" style={{ transform: `translateX(${offset}px)`, transition: start.current || theme?.environment.reducedMotion ? "none" : "transform var(--hjm-motion-normal, 200ms) ease-out", "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth } as React.CSSProperties} data-direction={direction} data-tail={bubbleTail || undefined}>
    {avatar ? <div className="hjm-chat-message__avatar">{avatar}</div> : null}
    <div className="hjm-chat-message__content">{author?<Text variant="caption" tone="muted">{author}</Text>:null}
      {reply && replyLink ? <Button tone="ghost" aria-label={replyLink.label} onClick={replyLink.onPress}>{reply}</Button> : null}
      {reactions ? <MessageReactions {...reactions} interactiveContent={interactiveContent}>{reply && !replyLink ? <div className="hjm-chat-message__reply">{reply}</div> : null}{children}</MessageReactions> : <div className="hjm-chat-message__bubble">{reply && !replyLink ? <div className="hjm-chat-message__reply">{reply}</div> : null}{children}</div>}
      {(!revealTime && timestamp)||deliveryLabel||actions?<div className="hjm-chat-message__meta">{(!revealTime && timestamp)||deliveryLabel?<Text variant="caption" tone="muted">{[revealTime ? "" : timestamp, deliveryLabel].filter(Boolean).join(" · ")}</Text>:null}{actions}</div>:null}
    </div>
    </div>
  </article>;
}

/** Shared structure for embedded compositions. The parent supplies size; this never creates a second scroller. */
export type CompositionLayoutProps = Readonly<{
  title?: string;
  description?: string;
  badge?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  state?: ScreenContentState;
  stateAction?: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;
export function CompositionLayout({title, description, badge, leading, actions, notice, children, footer, state = {kind: "ready"}, stateAction, layoutStyle}: CompositionLayoutProps) {
  const resolved = resolveScreenContentState(state);
  return <Stack gap="md" {...(layoutStyle === undefined ? {} : {layoutStyle})}>
    {title || description || badge || leading || actions ? <Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap: "wrap"}}>
      {leading}<Stack gap="xxs" layoutStyle={{flex: 1, minWidth: 0}}>
        <Stack axis="inline" gap="xs" align="center" layoutStyle={{flexWrap: "wrap"}}>{title ? <Heading level="level3">{title}</Heading> : null}{badge}</Stack>
        {description ? <Text tone="muted">{description}</Text> : null}
      </Stack>{actions}
    </Stack> : null}
    {notice}
    {state.kind === "ready" ? children : <Stack gap="sm" align="center" justify="center" layoutStyle={{flex: 1}}>
      {resolved.busy ? <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} /> : <div role={state.kind === "error" ? "alert" : "status"}><Text variant="title">{state.title}</Text>{state.description ? <Text tone="muted">{state.description}</Text> : null}</div>}
      {stateAction}
    </Stack>}
    {footer}
  </Stack>;
}
