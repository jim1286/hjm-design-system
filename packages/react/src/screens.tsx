import { MessageReactions } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./forms.js";
import { useId, useRef, useState, type Ref, type ReactNode } from "react";
import { isReplySwipe, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { Heading } from "./heading.js";
import { Section, Stack, Text } from "./layout.js";
import { ListRow, type ListRowProps } from "./display.js";
import { classNames } from "./internal.js";

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** Preserve host navigation while the shared shell owns content and state. */
  header?: ReactNode;
  contentInset?: "default" | "none";
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
}>;

/** Shared screen shell. Routing, data, permission checks and mutation state remain product-owned. */
export function ScreenLayout({ title, header, contentInset = "default", description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", as: Element = "main", className }: ScreenLayoutProps) {
  const id = useId();
  const resolved = resolveScreenContentState(state);
  const recipe = screenPatternRecipe;
  return <Element aria-labelledby={header ? undefined : id} aria-label={header ? title : undefined} data-content-inset={contentInset} className={classNames("hjm-screen", className)}
    style={{ "--hjm-screen-width": `${recipe.maxWidth}px`, "--hjm-screen-padding": `${contentInset === "none" ? 0 : recipe.padding}px`, "--hjm-screen-gap": `${recipe.sectionGap}px`, "--hjm-screen-header-min": `${recipe.headerMinWidth}px` } as React.CSSProperties}>
    {header ?? <header className="hjm-screen__header">
      {leading}<div className="hjm-screen__heading"><Heading level="level3" semanticLevel={1} id={id}>{title}</Heading>
        {description ? <Text as="p" tone="muted">{description}</Text> : null}</div>{actions}
    </header>}
    {notice ? <div className="hjm-screen__notice">{notice}</div> : null}
    <div className="hjm-screen__body" data-scroll={resolved.replacesContent ? "screen" : scroll} data-replacement={resolved.replacesContent || undefined} aria-busy={resolved.busy || undefined}>
      {state.kind === "ready" ? children : <div className="hjm-screen__state">
        <div role={state.kind === "error" ? "alert" : "status"}>
          <Stack gap="md" align="center">{resolved.busy ? <span className="hjm-auth-provider-button__spinner" aria-hidden="true" /> : null}<Text variant="title">{state.title}</Text>
            {state.description ? <Text tone="muted">{state.description}</Text> : null}</Stack>
        </div>
        {stateAction}
      </div>}
    </div>
    {footer ? <footer className="hjm-screen__footer">{footer}</footer> : null}
  </Element>;
}

export type SettingsScreenSection = Readonly<{ id: string; title: string; description?: string; children: ReactNode }>;
export type SettingsScreenProps = Omit<ScreenLayoutProps, "children" | "scroll"> & Readonly<{ profile?: ReactNode; sections: readonly SettingsScreenSection[] }>;
export function SettingsScreen({ profile, sections, ...props }: SettingsScreenProps) {
  return <ScreenLayout {...props}><Stack gap="xl">{profile}{sections.map(section =>
    <Section className="hjm-settings-section" key={section.id} title={section.title} description={section.description}>{section.children}</Section>)}</Stack></ScreenLayout>;
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
  return <ScreenLayout {...props} scroll={scroll} footer={!props.state || props.state.kind === "ready" ? composer : null} />;
}

export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
  maxLength?: number;
  sendDisabled?: boolean;
  additionalContent?: boolean;
  leadingAction?: ReactNode;
  inputRef?: Ref<HTMLTextAreaElement>;
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
}>;
export function MessageComposer({ value, label, sendLabel, disabled = false, pending = false, onValueChange, onSend, maxLength, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }: MessageComposerProps) {
  validateMessageAttachments(attachments);
  if (attachments.length && !onRemoveAttachment) throw new TypeError("Attachments require a removal callback");
  const canSend = !sendDisabled && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
  const locked = disabled || pending;
  // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
  const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || attachmentAction.disabled} onClick={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onClick={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  // Enter stays a newline for IME; receipt-driven clearing and failed-send recovery belong to the host.
  return <div className="hjm-message-composer" data-send-presentation={sendPresentation} style={{"--hjm-attachment-size": `${screenPatternRecipe.attachmentSize}px`, "--hjm-attachment-remove-size": `${screenPatternRecipe.attachmentRemoveSize}px`} as React.CSSProperties}>{context}{replyTo ? <Stack axis="inline" gap="sm" align="center"><Stack gap="xxs"><Text variant="caption" emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted">{replyTo.excerpt}</Text></Stack><IconButton label={replyTo.cancelLabel} tone="ghost" disabled={locked} onClick={replyTo.onCancel}><Text>×</Text></IconButton></Stack> : null}
    {attachments.length ? <div className="hjm-message-composer__attachments">{attachments.map(item => <div key={item.id} className="hjm-message-composer__attachment"><div className="hjm-message-composer__preview">{item.preview}</div><span className="hjm-message-composer__remove"><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked} onClick={() => onRemoveAttachment?.(item.id)}><span className="hjm-message-composer__remove-glyph" aria-hidden="true">×</span></IconButton></span></div>)}{attach}</div> : null}
    <div className="hjm-message-composer__row"><TextArea ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" rows={screenPatternRecipe.composerMinLines} aria-label={label} placeholder={label} value={value} disabled={locked}
      onChange={event => onValueChange(event.currentTarget.value)} minVisibleLines={screenPatternRecipe.composerMinLines} maxVisibleLines={screenPatternRecipe.composerMaxLines}
      {...(sendIcon ? { trailing: hasContent || pending ? send : attach } : {})} />
      {sendIcon ? null : send}
    </div></div>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean}>; replyLink?: Readonly<{label:string; onPress():void}>; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }> }> }>;
export function ChatMessage({ direction, author, timestamp, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent=false }: ChatMessageProps) {
  const start = useRef<{x:number;y:number} | null>(null);
  const [offset, setOffset] = useState(0);
  const finish = () => { start.current = null; setOffset(0); };
  return <article tabIndex={replyAction && !replyAction.disabled ? 0 : undefined}
    aria-keyshortcuts={replyAction ? "Alt+ArrowLeft Alt+ArrowRight" : undefined} aria-description={replyAction?.label}
    onKeyDown={event => { if (event.target === event.currentTarget && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight") && replyAction && !replyAction.disabled) { event.preventDefault(); replyAction.onPress(); } }}
    onPointerDown={event => { if (!replyAction || replyAction.disabled || event.button !== 0 || (event.target as HTMLElement).closest("button,a,input,textarea")) return; start.current = {x:event.clientX,y:event.clientY}; }}
    onPointerMove={event => { if (!start.current) return; const dx=event.clientX-start.current.x,dy=event.clientY-start.current.y; if (Math.abs(dy)>10 && Math.abs(dy)>Math.abs(dx)) {finish();return;} if (Math.abs(dx)>Math.abs(dy)*2) setOffset(Math.max(-72,Math.min(72,dx))); }}
    onPointerUp={event => { if (start.current && replyAction && !replyAction.disabled && isReplySwipe(event.clientX-start.current.x,event.clientY-start.current.y)) replyAction.onPress(); finish(); }} onPointerCancel={finish} onPointerLeave={finish}
    className="hjm-chat-message" style={{ transform: `translateX(${offset}px)`, touchAction: replyAction ? "pan-y" : undefined, "--hjm-message-max-width": screenPatternRecipe.messageMaxWidth } as React.CSSProperties} data-direction={direction} aria-label={author}>
    {avatar ? <div className="hjm-chat-message__avatar">{avatar}</div> : null}
    <div className="hjm-chat-message__content">{author?<Text variant="caption" tone="muted">{author}</Text>:null}
      {reply && replyLink ? <Button tone="ghost" aria-label={replyLink.label} onClick={replyLink.onPress}>{reply}</Button> : null}
      {reactions ? <MessageReactions {...reactions} interactiveContent={interactiveContent}>{reply && !replyLink ? <div className="hjm-chat-message__reply">{reply}</div> : null}{children}</MessageReactions> : <div className="hjm-chat-message__bubble">{reply && !replyLink ? <div className="hjm-chat-message__reply">{reply}</div> : null}{children}</div>}
      {timestamp||deliveryLabel||actions?<div className="hjm-chat-message__meta">{timestamp||deliveryLabel?<Text variant="caption" tone="muted">{timestamp}{deliveryLabel ? ` · ${deliveryLabel}` : ""}</Text>:null}{actions}</div>:null}
    </div>
  </article>;
}
