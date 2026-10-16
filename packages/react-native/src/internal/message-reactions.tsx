import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Modal, Platform, Pressable, ScrollView, View, findNodeHandle, useWindowDimensions } from "react-native";
import { scrim } from "@hjmds/design-contracts/foundations";
import { holdMenuRecipe, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "../provider.js";
import { IconButton } from "../actions.js";
import { FixedGlyph } from "./fixed-glyph.js";
import { Text } from "../primitives.js";
import { ReactionPicker, type ReactionPickerProps } from "../reaction-picker.js";

/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{ id: string; label: string; icon?: ReactNode; onPress(): void; disabled?: boolean; /** Shows › for rows that open a further list (e.g. "더 보기"). */ submenu?: boolean }>;
type Props = ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{label:string;onPress():void;disabled?:boolean}>; children: ReactNode; interactiveContent?:boolean; replyAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Shown above the actions, e.g. the exact send time that a run only shows once. */
  menuTitle?: string;
  menuActions?: readonly MessageMenuAction[];
  /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
  reportAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Side of the pressed content: own messages align the preview and action card to the end. */
  align?: "start" | "end";
  /** Comments are plain text, so their preview gets a surface; chat bubbles already have one. */
  previewSurface?: boolean }>;
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export function MessageReactions({ children, closeLabel, replyAction, menuAction, menuTitle, menuActions = [], reportAction, interactiveContent=false, align = "start", previewSurface = false, ...picker }: Props) {
  // Reply leads and report trails; legacy single menuAction keeps its place before report.
  const rows: (MessageMenuAction & { danger?: boolean })[] = [
    ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
    ...menuActions,
    ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
    ...(reportAction ? [{ id: "report", ...reportAction, danger: true }] : []),
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
  const top = Math.max((insets.top ?? 0) + tokens.spacing.sm, Math.min((anchor ?? height / 2) - 76, height - (insets.bottom ?? 0) - (picker.more ? 440 : 200)));
  return <>
    {/* No accessibilityLabel: the platform names the target from the bubble text, so the message is
        read. picker.label was the name before and hid the body (2026-10-06 review); it is now the hint. */}
    {/* flexShrink lets a long bubble wrap beside its time instead of pushing the time off screen. */}
    <Pressable ref={trigger} style={{ flexShrink: 1 }} accessible={!interactiveContent} disabled={picker.disabled ?? false} accessibilityRole="button" accessibilityHint={picker.label}
      accessibilityState={{ disabled: picker.disabled ?? false }} delayLongPress={screenPatternRecipe.reactionHoldMs}
      onLongPress={event => setAnchor(event.nativeEvent.pageY)}
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
              <View style={{ flex: 1, minWidth: 0 }}><Text tone={row.danger ? "danger" : "body"}>{row.label}</Text></View>
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
