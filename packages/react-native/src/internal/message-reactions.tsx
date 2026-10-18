import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { AccessibilityInfo, Modal, Platform, Pressable, ScrollView, View, findNodeHandle, useWindowDimensions } from "react-native";
import { control, scrim } from "@hjmds/design-contracts/foundations";
import { chatMessageRecipe, holdMenuRecipe, screenPatternRecipe, type ChatReactionSummaryItem } from "@hjmds/design-contracts/screen-patterns";
import type { MenuItemTone } from "@hjmds/design-contracts/recipes";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "../provider.js";
import { IconButton } from "../actions.js";
import { FixedGlyph } from "./fixed-glyph.js";
import { Text } from "../primitives.js";
import { ReactionPicker, type ReactionPickerProps } from "../reaction-picker.js";

/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{ id: string; label: string; icon?: ReactNode; onPress(): void; disabled?: boolean; /** Shows › for rows that open a further list (e.g. "Load more"). */ submenu?: boolean;
  /** Same vocabulary as Menu items: `danger` for destructive rows such as delete (default `neutral`). */ tone?: MenuItemTone }>;
/** Lets the owning message open the same hold menu from its reaction summary. */
export type MessageReactionsHandle = Readonly<{ open(): void }>;
type Props = ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{label:string;onPress():void;disabled?:boolean}>; children: ReactNode; interactiveContent?:boolean; replyAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Shown above the actions, e.g. the exact send time that a run only shows once. */
  menuTitle?: string;
  menuActions?: readonly MessageMenuAction[];
  /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
  reportAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Side of the pressed content: own messages align the preview and action card to the end. */
  align?: "start" | "end";
  /** Comments are plain text, so their preview gets a surface; chat bubbles already have one. */
  previewSurface?: boolean;
  menuRef?: Ref<MessageReactionsHandle> }>;
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export function MessageReactions({ children, closeLabel, replyAction, menuAction, menuTitle, menuActions = [], reportAction, interactiveContent=false, align = "start", previewSurface = false, menuRef, ...picker }: Props) {
  // Reply leads and report trails; legacy single menuAction keeps its place before report.
  const rows: MessageMenuAction[] = [
    ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
    ...menuActions,
    ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
    ...(reportAction ? [{ id: "report", ...reportAction, tone: "danger" as const }] : []),
  ];
  const { colors, tokens, environment } = useHjmNativeTheme();
  const insets = useHjmNativeSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [anchor, setAnchor] = useState<number>();
  const trigger = useRef<View>(null);
  const firstAction = useRef<View>(null);
  const open = anchor !== undefined && !picker.disabled;
  // Android does not deliver Modal.onDismiss; restore after removing its native surface.
  const close = () => setAnchor(undefined);
  // iOS must dismiss this modal before the product opens its action sheet.
  const queuedAction = useRef<(() => void) | null>(null);
  const runQueuedAction = () => { const action = queuedAction.current; queuedAction.current = null; action?.(); };
  useEffect(() => () => { queuedAction.current = null; }, []);
  useEffect(() => { if (picker.disabled) setAnchor(undefined); }, [picker.disabled]);
  const restore = () => { const handle = findNodeHandle(trigger.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); };
  const focusPicker = () => { const handle = findNodeHandle(firstAction.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); };
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open && Platform.OS !== "ios") { restore(); runQueuedAction(); }
    wasOpen.current = open;
  }, [open]);
  // The anchor is the pressed content's top edge, so the preview stays where it was (strip above it,
  // actions below), as in the measured hold menus. A fixed −76 offset lifted action-only comment menus.
  const stripOffset = picker.options.length ? holdMenuRecipe.stripHeight + holdMenuRecipe.gap : 0;
  const reserve = stripOffset + rows.length * holdMenuRecipe.actionRowHeight + 160 + (picker.more ? 240 : 0);
  const top = Math.max((insets.top ?? 0) + tokens.spacing.sm, Math.min((anchor ?? height / 2) - stripOffset, height - (insets.bottom ?? 0) - reserve));
  const openAt = (fallbackY: number) => {
    const node = trigger.current;
    if (node && typeof node.measureInWindow === "function") node.measureInWindow((_x, y) => setAnchor(y));
    else setAnchor(fallbackY);
  };
  // Opened from the summary, the menu still anchors on the pressed bubble so the preview stays in place.
  useImperativeHandle(menuRef, () => ({ open: () => { if (!picker.disabled) openAt(height / 2); } }), [picker.disabled, height]);
  return <>
    {/* No accessibilityLabel: the platform names the target from the bubble text, so the message is
        read. picker.label was the name before and hid the body (2026-10-06 review); it is now the hint. */}
    {/* flexShrink lets a long bubble wrap beside its time instead of pushing the time off screen. */}
    <Pressable ref={trigger} style={{ flexShrink: 1 }} accessible={!interactiveContent} disabled={picker.disabled ?? false} accessibilityRole="button" accessibilityHint={picker.label}
      accessibilityState={{ disabled: picker.disabled ?? false }} delayLongPress={screenPatternRecipe.reactionHoldMs}
      onLongPress={event => openAt(event.nativeEvent.pageY)}
      accessibilityActions={[{ name: "activate", label: picker.label }, ...(replyAction && !replyAction.disabled ? [{name:"reply",label:replyAction.label}] : [])]}
      onAccessibilityAction={event => { if(event.nativeEvent.actionName === "reply") { if(replyAction && !replyAction.disabled) replyAction.onPress(); } else if (!picker.disabled) setAnchor(height / 2); }}>{children}</Pressable>
    {/* An interactive album must keep its own page buttons in the AX tree. A separate menu target
        preserves reaction/reply access instead of merging the whole album into one button. */}
    {interactiveContent?<IconButton label={picker.label} tone="ghost" size="small" disabled={picker.disabled??false} onPress={()=>setAnchor(height/2)} accessibilityActions={replyAction&&!replyAction.disabled?[{name:"reply",label:replyAction.label}]:[]} onAccessibilityAction={event=>{if(event.nativeEvent.actionName==="reply"&&replyAction&&!replyAction.disabled)replyAction.onPress();}}><FixedGlyph>···</FixedGlyph></IconButton>:null}
    <Modal visible={open} transparent statusBarTranslucent animationType={environment.reducedMotion ? "none" : "fade"}
      onRequestClose={close} onDismiss={() => { restore(); runQueuedAction(); }} onShow={focusPicker}>
      <View style={{ flex: 1 }}>
        <Pressable accessible={false} importantForAccessibility="no-hide-descendants" onPress={close} style={{ position: "absolute", inset: 0, backgroundColor: scrim }} />
        <View accessibilityViewIsModal onAccessibilityEscape={close} style={{ position: "absolute", top, left: holdMenuRecipe.inset, right: holdMenuRecipe.inset, maxHeight: Math.max(0,height-top-(insets.bottom??0)-tokens.spacing.sm) }}>
          {/* A full album can exceed the menu reservation. Scroll its content while keeping Close
              pinned inside the safe area; the device audit found Close clipped below the screen. */}
          <ScrollView style={{flexShrink:1}} contentContainerStyle={{gap:holdMenuRecipe.gap}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Action-only menus (comments, 2026-10-16 reference) pass no options and show no strip. */}
          {picker.options.length ? <View style={{ backgroundColor: colors.bg, borderRadius: picker.more ? tokens.radius.lg : tokens.radius.full, minHeight: holdMenuRecipe.stripHeight, justifyContent: "center", paddingHorizontal: tokens.spacing.xs }}>
            <ReactionPicker {...picker} layout="strip" onValueChange={value => { picker.onValueChange(value); close(); }} />
          </View> : null}
          {/* The pressed bubble itself is the preview, kept on its own side like the timeline. */}
          <View style={[{ alignSelf: align === "end" ? "flex-end" : "flex-start", maxWidth: screenPatternRecipe.messageMaxWidth }, previewSurface ? { backgroundColor: colors.bg, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm } : null]}>{children}</View>
          {menuTitle || rows.length ? <View style={{ alignSelf: align === "end" ? "flex-end" : "flex-start", width: holdMenuRecipe.actionWidth, maxWidth: "100%", backgroundColor: colors.bg, borderRadius: holdMenuRecipe.actionRadius, paddingVertical: tokens.spacing.xs, overflow: "hidden" }}>
            {menuTitle ? <View style={{ paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.xs }}><Text variant="caption" tone="muted">{menuTitle}</Text></View> : null}
            {/* Queue the action until the modal is gone: iOS cannot present a product sheet over it. */}
            {rows.map(row => <Pressable key={row.id} accessibilityRole="button" accessibilityLabel={row.label} accessibilityState={{ disabled: row.disabled ?? false }} disabled={row.disabled ?? false}
              onPress={() => { queuedAction.current = row.onPress; close(); }}
              style={({ pressed }) => ({ minHeight: holdMenuRecipe.actionRowHeight, flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md, opacity: row.disabled ? 0.5 : 1, backgroundColor: pressed ? colors.surface : "transparent" })}>
              {row.icon ? <View style={{ width: holdMenuRecipe.iconSize, alignItems: "center" }}>{row.icon}</View> : null}
              <View style={{ flex: 1, minWidth: 0 }}><Text tone={row.tone === "danger" ? "danger" : "body"}>{row.label}</Text></View>
              {row.submenu ? <FixedGlyph>›</FixedGlyph> : null}
            </Pressable>)}
          </View> : null}
          </ScrollView>
          {/* onAccessibilityTap is iOS-only, so TalkBack could not close through this focus target.
              The standard activate action is delivered on both platforms. */}
          {/* No visible ×: the measured hold menus close on a backdrop tap (2026-10-16). This 1pt target keeps
              the first screen-reader focus and an activate-to-close action on both platforms. */}
          <View ref={firstAction} accessible accessibilityRole="button" accessibilityLabel={closeLabel}
            accessibilityActions={[{ name: "activate" }]} onAccessibilityAction={event => { if (event.nativeEvent.actionName === "activate") close(); }}
            style={{ position: "absolute", top: 0, start: 0, width: 1, height: 1, overflow: "hidden" }} />
        </View>
      </View>
    </Modal>
  </>;
}

/** ChatMessage strips its summary before spreading the rest into the hold menu. */
export function omitReactionSummary<T extends Readonly<{ summary?: unknown }>>({ summary: _summary, ...rest }: T): Omit<T, "summary"> {
  return rest;
}

/**
 * Current reactions as one button beside the time; pressing it opens the hold menu. The pill is the single target and
 * carries the product's label, so per-emoji parts are not separate elements. hitSlop extends the 24pt pill to the 44pt
 * touch target without changing the timeline row height.
 */
export function ReactionSummaryButton({ label, items, selected, disabled, onPress }: Readonly<{ label: string; items: readonly (ChatReactionSummaryItem & Readonly<{ showCount: boolean }>)[]; selected: string | null; disabled: boolean; onPress(): void }>) {
  const { colors, tokens } = useHjmNativeTheme();
  const r = chatMessageRecipe.reactionSummary;
  const mine = items.some(item => item.id === selected);
  const slop = Math.max(0, (control.minTouchTarget - r.minHeight) / 2);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} hitSlop={{ top: slop, bottom: slop }}
    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: r.itemGap, minHeight: r.minHeight, paddingHorizontal: r.paddingInline, borderRadius: tokens.radius.full, borderWidth: 1, borderColor: mine ? colors.contentBrand : colors.border, backgroundColor: pressed ? colors.surfaceAlt : colors.surface, opacity: disabled ? 0.5 : 1 })}>
    {items.map(item => <View key={item.id} style={{ flexDirection: "row", alignItems: "center", gap: r.emojiGap }}><Text variant="caption">{item.emoji}</Text>{item.showCount ? <Text variant="caption">{String(item.count)}</Text> : null}</View>)}
  </Pressable>;
}
