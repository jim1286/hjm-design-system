import { MessageReactions } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { useMemo, useState, type Ref, type ReactNode } from "react";
import { ActivityIndicator, PanResponder, ScrollView, View, type TextInput, type ScrollViewProps } from "react-native";
import { isReplySwipe, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { Section, Stack, Text } from "./primitives.js";
import { ListRow, type ListRowProps } from "./data-display.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
  header?: ReactNode;
  /** Hosts that already inset routes avoid applying the shared gutter twice. */
  contentInset?: "default" | "none";
  description?: string;
  leading?: ReactNode;
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
  testID?: string;
  scrollRef?: Ref<ScrollView>;
  scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator">;
}>;

export function ScreenLayout({ title, header, contentInset = "default", description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps }: ScreenLayoutProps) {
  const resolved = resolveScreenContentState(state);
  const { colors, environment } = useHjmNativeTheme();
  const recipe = screenPatternRecipe;
  const padding = contentInset === "none" ? 0 : recipe.padding;
  const body = state.kind === "ready" ? children : <View style={{ marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: recipe.sectionGap }}>
    <View accessibilityLiveRegion={resolved.announcement} style={{ alignItems: "center", gap: recipe.itemGap }}>
      {resolved.busy ? <ActivityIndicator accessible={false} color={colors.contentBrand} /> : null}
      <Text variant="title" align="center">{state.title}</Text>
      {state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}
    </View>{stateAction}
  </View>;
  return <View testID={testID} style={[{ flex: 1, minHeight: 0, width: "100%", maxWidth: recipe.maxWidth, alignSelf: "center", backgroundColor: colors.bg }, layoutStyle]}>
    {header ?? <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", padding, gap: recipe.itemGap }}>
      {/* Reserve a readable title column; wrapping moves actions below it at large text. */}
      {leading}<View style={{ flexGrow: 1, flexShrink: 1, flexBasis: recipe.headerMinWidth * environment.textScale }}>
        <Text variant="titleLarge" accessibilityRole="header">{title}</Text>
        {description ? <Text tone="muted">{description}</Text> : null}
      </View>{actions}
    </View>}
    {notice ? <View style={{ paddingHorizontal: padding }}>{notice}</View> : null}
    {scroll === "screen" || resolved.replacesContent ? <ScrollView {...scrollProps} ref={scrollRef} style={{ flex: 1 }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, padding }} accessibilityState={{ busy: resolved.busy }}>{body}</ScrollView>
      : <View style={{ flex: 1, minHeight: 0, padding }}>{body}</View>}
    {footer ? <View style={{ padding, borderTopWidth: contentInset === "none" ? 0 : 1, borderColor: colors.border }}>{footer}</View> : null}
  </View>;
}

export type SettingsScreenSection = Readonly<{ id: string; title: string; description?: string; children: ReactNode }>;
export type SettingsScreenProps = Omit<ScreenLayoutProps, "children" | "scroll"> & Readonly<{ profile?: ReactNode; sections: readonly SettingsScreenSection[] }>;
export function SettingsScreen({ profile, sections, ...props }: SettingsScreenProps) {
  const { colors } = useHjmNativeTheme();
  // Match the unshaded settings groups on Web; separators preserve hierarchy without gray cards.
  return <ScreenLayout {...props}><Stack gap="xl">{profile}{sections.map(section =>
    <Section key={section.id} title={section.title} {...(section.description === undefined ? {} : { description: section.description })}><View style={{ borderTopWidth: 1, borderColor: colors.border }}>{section.children}</View></Section>)}</Stack></ScreenLayout>;
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
  return <ListRow {...props} titleStyle={{ fontWeight: read ? "400" : "700" }}
    description={[description, `${statusLabel} · ${timestamp}`].filter(Boolean).join("\n")} />;
}

export type ChatScreenProps = Omit<ScreenLayoutProps, "footer"> & Readonly<{ composer: ReactNode }>;
/** Wrap with existing KeyboardAvoiding (or the host's keyboard adapter), never both. */
export function ChatScreen({ composer, scroll = "content", ...props }: ChatScreenProps) {
  return <ScreenLayout {...props} scroll={scroll} footer={!props.state || props.state.kind === "ready" ? composer : null} />;
}

export type MessageComposerProps = Omit<MessageComposerDescriptor, "attachmentCount"> & Readonly<{
  maxLength?: number;
  sendDisabled?: boolean;
  additionalContent?: boolean;
  leadingAction?: ReactNode;
  inputRef?: Ref<TextInput>;
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
  const { colors, tokens } = useHjmNativeTheme();
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || (attachmentAction.disabled ?? false)} onPress={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  return <Stack gap="sm">{context}{replyTo ? <Stack axis="inline" gap="sm" align="center"><Stack gap="xxs"><Text variant="caption" emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted">{replyTo.excerpt}</Text></Stack><IconButton label={replyTo.cancelLabel} tone="ghost" disabled={locked} onPress={replyTo.onCancel}><Text>×</Text></IconButton></Stack> : null}
    {attachments.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: tokens.spacing.sm, alignItems: "center" }}>
      {attachments.map(item => <View key={item.id} style={{ width: screenPatternRecipe.attachmentSize, height: screenPatternRecipe.attachmentSize }}>{/* Mask only the photo so the remove control is not clipped by rounded corners. */}<View style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: tokens.radius.md }}>{item.preview}</View>
        <View style={{ position: "absolute", top: 0, right: 0 }}><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked} onPress={() => onRemoveAttachment?.(item.id)}><View style={{ backgroundColor: colors.bg, borderRadius: tokens.radius.full, width: screenPatternRecipe.attachmentRemoveSize, height: screenPatternRecipe.attachmentRemoveSize, alignItems: "center", justifyContent: "center" }}><Text allowFontScaling={false} style={{ fontSize: 18, lineHeight: 24 }}>×</Text></View></IconButton></View>
      </View>)}{attach}</ScrollView> : null}
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: screenPatternRecipe.itemGap }}><TextArea ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" accessibilityLabel={label} placeholder={label} value={value} disabled={locked}
      layoutStyle={{ flex: 1 }} onValueChange={onValueChange} minVisibleLines={screenPatternRecipe.composerMinLines} maxVisibleLines={screenPatternRecipe.composerMaxLines}
      {...(sendIcon ? { trailing: <View style={{ alignSelf: "center", marginStart: tokens.spacing.sm, marginEnd: sendPresentation === "circle" ? tokens.spacing.xs - tokens.spacing.md : 0 }}>{hasContent || pending ? send : attach}</View> } : {})} />
      {sendIcon ? null : send}
    </View></Stack>;
}

export type ChatMessageProps = ChatMessageDescriptor & Readonly<{ children: ReactNode; interactiveContent?: boolean; avatar?: ReactNode; reply?: ReactNode; actions?: ReactNode; replyAction?: Readonly<{label:string; onPress():void; disabled?:boolean}>; replyLink?: Readonly<{label:string; onPress():void}>; reactions?: ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{ label: string; onPress(): void; disabled?: boolean }> }> }>;
export function ChatMessage({ direction, author, timestamp, deliveryLabel, avatar, reply, actions, replyAction, replyLink, reactions, children, interactiveContent=false }: ChatMessageProps) {
  const { colors, tokens } = useHjmNativeTheme();
  const outgoing = direction === "outgoing";
  const [offset, setOffset] = useState(0);
  // SwipeActions reveals row controls and requires an optional gesture peer; reply commits
  // on release and stays in the core timeline without capturing vertical scrolling.
  const gesture = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, state) => !!replyAction && !replyAction.disabled && Math.abs(state.dx)>12 && Math.abs(state.dx)>Math.abs(state.dy)*2,
    onPanResponderMove: (_, state) => setOffset(Math.max(-72,Math.min(72,state.dx))),
    onPanResponderRelease: (_, state) => { setOffset(0); if (replyAction && !replyAction.disabled && isReplySwipe(state.dx,state.dy)) replyAction.onPress(); },
    onPanResponderTerminate: () => setOffset(0),
    onPanResponderTerminationRequest: () => true,
  }), [replyAction]);
  return <View {...gesture.panHandlers} accessible={!reactions && !!replyAction} accessibilityLabel={!reactions && replyAction ? author : undefined}
    accessibilityActions={replyAction && !replyAction.disabled ? [{name:"reply",label:replyAction.label}] : []}
    onAccessibilityAction={event => { if(event.nativeEvent.actionName === "reply" && replyAction && !replyAction.disabled) replyAction.onPress(); }} style={{ transform:[{translateX:offset}], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", gap: tokens.spacing.xs }}>
    {!outgoing ? avatar : null}
    {/* Leave a visible opposite edge so authorship survives monochrome themes; never truncate message text. */}
    <View style={{ maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: tokens.spacing.xxs, alignItems: outgoing ? "flex-end" : "flex-start" }}>
      {author?<Text variant="caption" tone="muted">{author}</Text>:null}
      {reply && replyLink ? <Button tone="ghost" accessibilityLabel={replyLink.label} onPress={replyLink.onPress}>{reply}</Button> : null}
      {reactions ? <MessageReactions {...reactions} interactiveContent={interactiveContent} {...(replyAction ? {replyAction} : {})}>
      <View style={{ backgroundColor: outgoing ? colors.surfaceAccent : colors.bg, borderWidth: outgoing ? 0 : 1, borderColor: colors.border, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm, gap: tokens.spacing.xs }}>
        {reply && !replyLink ? <View style={{ borderStartWidth: 2, borderColor: colors.contentBrand, paddingStart: tokens.spacing.xs }}>{reply}</View> : null}
        {children}
      </View>
      </MessageReactions> : (
      <View style={{ backgroundColor: outgoing ? colors.surfaceAccent : colors.bg, borderWidth: outgoing ? 0 : 1, borderColor: colors.border, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm, gap: tokens.spacing.xs }}>
        {reply && !replyLink ? <View style={{ borderStartWidth: 2, borderColor: colors.contentBrand, paddingStart: tokens.spacing.xs }}>{reply}</View> : null}
        {children}
      </View>
      )}
      {timestamp||deliveryLabel||actions?<Stack axis="inline" gap="xs" align="center">{timestamp||deliveryLabel?<Text variant="caption" tone="muted">{timestamp}{deliveryLabel ? ` · ${deliveryLabel}` : ""}</Text>:null}{actions}</Stack>:null}
    </View>
    {outgoing ? avatar : null}
  </View>;
}
