import { resolveDesignProfileScreen, type DesignProfileScreenPresentation } from "@hjmds/design-contracts/design-profile-layout";
import { MessageReactions } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Button, IconButton } from "./actions.js";
import { TextArea } from "./inputs.js";
import { useMemo, useState, type Ref, type ReactNode } from "react";
import { PanResponder, ScrollView, View, type AccessibilityActionEvent, type TextInput, type ScrollViewProps } from "react-native";
import { Spinner } from "./internal/spinner.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { isReplySwipe, canSubmitMessage, validateMessageAttachments, type MessageAttachmentDescriptor, resolveScreenContentState, screenPatternRecipe, type ChatMessageDescriptor, type MessageComposerDescriptor, type ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { Stack, Text } from "./primitives.js";
import { ListRow, type ListRowProps } from "./data-display.js";
import type { ListRowPrivateProps } from "./internal/list-row-private.js";
import type { FieldPrivateProps } from "./internal/field-private.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type ScreenLayoutProps = Readonly<{
  title: string;
  /** Host navigation can supply its existing header while the shared shell owns scrolling and state. */
  header?: ReactNode;
  /** Hosts that already inset routes avoid applying the shared gutter twice. */
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
  /** Use content when the child is a FlatList/virtualized timeline. */
  scroll?: "screen" | "content";
  /** Host owns safe areas and navigation bars, avoiding double insets inside nested routes. */
  layoutStyle?: HjmCompositionStyleProp;
  testID?: string;
  scrollRef?: Ref<ScrollView>;
  scrollProps?: Pick<ScrollViewProps, "refreshControl" | "keyboardDismissMode" | "showsVerticalScrollIndicator" | "showsHorizontalScrollIndicator">;
}>;

export function ScreenLayout({ title, header, contentInset = "default", presentation: suppliedPresentation, description, leading, actions, notice, footer, state = { kind: "ready" }, stateAction, children, scroll = "screen", layoutStyle, testID, scrollRef, scrollProps }: ScreenLayoutProps) {
  const resolved = resolveScreenContentState(state);
  const { colors, environment, designProfile } = useHjmNativeTheme();
  const presentation = suppliedPresentation ?? designProfile?.screens.overview;
  const profileLayout = presentation === undefined ? undefined : resolveDesignProfileScreen(presentation);
  const recipe = screenPatternRecipe;
  const padding = contentInset === "none" ? 0 : recipe.padding;
  const body = state.kind === "ready" ? children : <View style={{ marginVertical: "auto", flexShrink: 0, alignItems: "center", gap: recipe.stateGap, paddingVertical: profileLayout?.gap ?? recipe.sectionGap }}>
    {/* Keep loading copy in Spinner's accessibility name rather than a visible
        second status, matching the shared spinner-only loading contract. */}
    {resolved.busy ? <Spinner label={[state.title, state.description].filter(Boolean).join(". ")} /> : <View accessibilityLiveRegion={resolved.announcement} style={{ alignItems: "center", gap: recipe.itemGap }}>
      <Text variant="title" align="center">{state.title}</Text>
      {state.description ? <Text tone="muted" align="center">{state.description}</Text> : null}
    </View>}{stateAction}
  </View>;
  return <View testID={testID} style={[{ flex: 1, minHeight: 0, width: "100%", maxWidth: profileLayout?.maxWidth ?? recipe.maxWidth, alignSelf: "center", backgroundColor: designProfile?.material.canvas ? "transparent" : colors.bg }, layoutStyle]}>
    {/* Not TopBar: this is the page heading (titleLarge + description, actions wrap under the title at
        large text), while TopBar is a fixed-height app bar with a single-line title and safe-area top.
        Importing it would also pull navigation.js (tabs/gooey indicator) into every screens graph.
        Hosts that want the app bar pass <TopBar> through `header`. */}
    {header ?? <View style={{ flexDirection: profileLayout?.headerAxis ?? "row", flexWrap: "wrap", alignItems: profileLayout ? (profileLayout.centered ? "center" : "flex-start") : "center", padding, gap: recipe.itemGap }}>
      {/* Reserve a readable title column; wrapping moves actions below it at large text. */}
      {leading}<View style={{ flexGrow: 1, flexShrink: 1, ...(profileLayout?.headerAxis === "column" ? { width: "100%" as const } : { flexBasis: recipe.headerMinWidth * environment.textScale }) }}>
        {/* Profile headings share the Web heading role; preserve the legacy title role without a profile. */}
        <Text variant={profileLayout ? "heading" : "titleLarge"} {...(profileLayout?.centered ? { align: "center" as const } : {})} accessibilityRole="header">{title}</Text>
        {description ? <Text tone="muted" {...(profileLayout?.centered ? { align: "center" as const } : {})}>{description}</Text> : null}
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
  const emphasis: ListRowPrivateProps = { hjmTitleEmphasis: read ? "regular" : "strong" };
  return <ListRow {...props} /* Unread weight: renderer-private input, not deprecated titleStyle (list-row-private.ts). */ {...emphasis}
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
}>;
export function MessageComposer({ value, label, sendLabel, placeholder = label, description, error, invalid = false, submitMode = "newline", onBlur, disabled = false, pending = false, onValueChange, onSend, maxLength, sendDisabled = false, additionalContent = false, leadingAction, inputRef, context, replyTo, sendIcon, sendPresentation = "inline", attachmentAction, attachments = [], onRemoveAttachment }: MessageComposerProps) {
  validateMessageAttachments(attachments);
  if (attachments.length && !onRemoveAttachment) throw new TypeError("Attachments require a removal callback");
  const canSend = !sendDisabled && canSubmitMessage({ value, label, sendLabel, disabled, pending, attachmentCount: attachments.length + (additionalContent ? 1 : 0) });
  const locked = disabled || pending;
  // A bounded corner radius keeps multiline/large-text content inside the field instead of a tall pill.
  const hasContent = !!value.trim() || attachments.length > 0 || additionalContent;
  const { colors, tokens } = useHjmNativeTheme();
  const compactField: FieldPrivateProps = { hjmCompactMultiline: true };
  const attach = attachmentAction ? <IconButton label={attachmentAction.label} tone="ghost" disabled={locked || (attachmentAction.disabled ?? false)} onPress={attachmentAction.onPress}>{attachmentAction.icon}</IconButton> : null;
  const send = sendIcon ? <IconButton label={sendLabel} size={sendPresentation === "circle" ? "small" : "medium"} shape="circle" tone={sendPresentation === "circle" ? "primary" : "ghost"} disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendIcon}</IconButton> : <Button disabled={!canSend} loading={pending} onPress={() => { if (canSend) onSend(value); }}>{sendLabel}</Button>;
  return <Stack gap="sm">{context}{replyTo ? <Stack axis="inline" gap="sm" align="center"><Stack gap="xxs"><Text variant="caption" emphasis="strong">{replyTo.author}</Text><Text variant="caption" tone="muted">{replyTo.excerpt}</Text></Stack><IconButton label={replyTo.cancelLabel} tone="ghost" disabled={locked} onPress={replyTo.onCancel}><FixedGlyph>×</FixedGlyph></IconButton></Stack> : null}
    {attachments.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: tokens.spacing.sm, alignItems: "center" }}>
      {attachments.map(item => <View key={item.id} style={{ width: screenPatternRecipe.attachmentSize, height: screenPatternRecipe.attachmentSize }}>{/* Mask only the photo so the remove control is not clipped by rounded corners. */}<View style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: tokens.radius.md }}>{item.preview}</View>
        <View style={{ position: "absolute", top: 0, right: 0 }}><IconButton label={item.removeLabel} tone="ghost" size="small" disabled={locked || (item.disabled ?? false)} onPress={() => { if (!locked && !item.disabled) onRemoveAttachment?.(item.id); }}><View style={{ backgroundColor: colors.bg, borderRadius: tokens.radius.full, width: screenPatternRecipe.attachmentRemoveSize, height: screenPatternRecipe.attachmentRemoveSize, alignItems: "center", justifyContent: "center" }}><FixedGlyph fontSize={18} lineHeight={24}>×</FixedGlyph></View></IconButton></View>
      </View>)}{attach}</ScrollView> : null}
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: screenPatternRecipe.itemGap }}>{/* One-row start like Web; public minVisibleLines keeps the editor floor (field-private.ts). */}<TextArea {...compactField} ref={inputRef} maxLength={maxLength} leadingAction={leadingAction} shape="large" accessibilityLabel={label} placeholder={placeholder} {...(description === undefined ? {} : {description})} {...(error === undefined ? {} : {error})} invalid={invalid} onBlur={onBlur} value={value} disabled={locked}
      submitBehavior={submitMode === "send" ? "submit" : "newline"} onSubmitEditing={() => { if (submitMode === "send" && canSend) onSend(value); }}
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
  const canReply = !!replyAction && !replyAction.disabled;
  const replyAccessibility = canReply ? {
    accessible: true,
    accessibilityActions: [{ name: "reply", label: replyAction!.label }],
    onAccessibilityAction: (event: AccessibilityActionEvent) => { if (event.nativeEvent.actionName === "reply") replyAction!.onPress(); },
  } : {};
  const captionCarriesReply = interactiveContent && !reactions;
  const meta = timestamp || deliveryLabel ? `${timestamp}${deliveryLabel ? ` · ${deliveryLabel}` : ""}` : "";
  const bubbleStyle = { backgroundColor: outgoing ? colors.surfaceAccent : colors.bg, borderWidth: outgoing ? 0 : 1, borderColor: colors.border, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm, gap: tokens.spacing.xs };
  const bubbleContent = <>{reply && !replyLink ? <View style={{ borderStartWidth: 2, borderColor: colors.contentBrand, paddingStart: tokens.spacing.xs }}>{reply}</View> : null}{children}</>;
  return <View {...gesture.panHandlers} style={{ transform:[{translateX:offset}], flexDirection: "row", justifyContent: outgoing ? "flex-end" : "flex-start", gap: tokens.spacing.xs }}>
    {!outgoing ? avatar : null}
    {/* Accessibility (2026-10-06 review): a row-level accessible View named by `author`, and a reaction
        target named by `picker.label`, both replaced the body so screen readers never heard the message.
        The row stays a plain container; the bubble is one element whose name is its own text (iOS and
        Android derive it from children when no label is set), and reply/reaction are actions on it.
        Author and time remain separate text elements. Interactive content keeps its child controls, so
        the reply action moves to the time (or author) caption instead of a new visible button. */}
    {/* Leave a visible opposite edge so authorship survives monochrome themes; never truncate message text. */}
    <View style={{ maxWidth: screenPatternRecipe.messageMaxWidth, flexShrink: 1, gap: tokens.spacing.xxs, alignItems: outgoing ? "flex-end" : "flex-start" }}>
      {author?<Text variant="caption" tone="muted" {...(captionCarriesReply && !meta ? replyAccessibility : {})}>{author}</Text>:null}
      {reply && replyLink ? <Button tone="ghost" accessibilityLabel={replyLink.label} onPress={replyLink.onPress}>{reply}</Button> : null}
      {reactions ? <MessageReactions {...reactions} interactiveContent={interactiveContent} {...(replyAction ? {replyAction} : {})}>
        <View style={bubbleStyle}>{bubbleContent}</View>
      </MessageReactions> : <View style={bubbleStyle} accessible={!interactiveContent} {...(interactiveContent ? {} : replyAccessibility)}>{bubbleContent}</View>}
      {meta||actions?<Stack axis="inline" gap="xs" align="center">{meta?<Text variant="caption" tone="muted" {...(captionCarriesReply ? replyAccessibility : {})}>{meta}</Text>:null}{actions}</Stack>:null}
    </View>
    {outgoing ? avatar : null}
  </View>;
}
