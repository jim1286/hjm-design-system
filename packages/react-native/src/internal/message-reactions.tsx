import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Modal, Platform, Pressable, ScrollView, View, findNodeHandle, useWindowDimensions } from "react-native";
import { scrim } from "@hjmds/design-contracts/foundations";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "../provider.js";
import { IconButton } from "../actions.js";
import { FixedGlyph } from "./fixed-glyph.js";
import { Text } from "../primitives.js";
import { ReactionPicker, type ReactionPickerProps } from "../reaction-picker.js";

/** One row of the hold menu. Products supply copy and icons; HJM owns order, size and tone. */
export type MessageMenuAction = Readonly<{ id: string; label: string; icon?: ReactNode; onPress(): void; disabled?: boolean }>;
type Props = ReactionPickerProps & Readonly<{ closeLabel: string; menuAction?: Readonly<{label:string;onPress():void;disabled?:boolean}>; children: ReactNode; interactiveContent?:boolean; replyAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;
  /** Shown above the actions, e.g. the exact send time that a run only shows once. */
  menuTitle?: string;
  menuActions?: readonly MessageMenuAction[];
  /** Always last and in the danger tone, matching the measured reference menu (2026-10-16). */
  reportAction?: Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}> }>;
/** Core RN composition: no optional context-menu/Expo dependency enters the screens subpath. */
export function MessageReactions({ children, closeLabel, replyAction, menuAction, menuTitle, menuActions = [], reportAction, interactiveContent=false, ...picker }: Props) {
  // Reply leads and report trails; legacy single menuAction keeps its place before report.
  const rows: (MessageMenuAction & { danger?: boolean })[] = [
    ...(replyAction ? [{ id: "reply", ...replyAction }] : []),
    ...menuActions,
    ...(menuAction ? [{ id: "menu", ...menuAction }] : []),
    ...(reportAction ? [{ id: "report", ...reportAction, danger: true }] : []),
  ];
  const { colors, tokens, environment } = useHjmNativeTheme();
  const insets = useHjmNativeSafeAreaInsets();
  const { width, height } = useWindowDimensions();
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
        <View accessibilityViewIsModal onAccessibilityEscape={close} style={{ position: "absolute", top, left: tokens.spacing.md, width: Math.min(width - tokens.spacing.md * 2, screenPatternRecipe.reactionMenuWidth), gap: tokens.spacing.sm, maxHeight: Math.max(0,height-top-(insets.bottom??0)-tokens.spacing.sm) }}>
          {/* A full album can exceed the menu reservation. Scroll its content while keeping Close
              pinned inside the safe area; the device audit found Close clipped below the screen. */}
          <ScrollView style={{flexShrink:1}} contentContainerStyle={{gap:tokens.spacing.sm}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Action-only menus (comments, 2026-10-16 reference) pass no options and show no strip. */}
          {picker.options.length ? <View style={{ backgroundColor: colors.bg, borderRadius: picker.more ? tokens.radius.lg : tokens.radius.full, padding: tokens.spacing.xs }}>
            <ReactionPicker {...picker} layout="strip" onValueChange={value => { picker.onValueChange(value); close(); }} />
          </View> : null}
          <View style={{ backgroundColor: colors.bg, borderRadius: tokens.radius.lg, padding: tokens.spacing.sm }}>{children}</View>
          {menuTitle || rows.length ? <View style={{ backgroundColor: colors.bg, borderRadius: tokens.radius.lg, paddingVertical: tokens.spacing.xs }}>
            {menuTitle ? <View style={{ paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.xs }}><Text variant="caption" tone="muted">{menuTitle}</Text></View> : null}
            {/* Queue the action until the modal is gone: iOS cannot present a product sheet over it. */}
            {rows.map(row => <Pressable key={row.id} accessibilityRole="button" accessibilityLabel={row.label} accessibilityState={{ disabled: row.disabled ?? false }} disabled={row.disabled ?? false}
              onPress={() => { queuedAction.current = row.onPress; close(); }}
              style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md, opacity: row.disabled ? 0.5 : 1, backgroundColor: pressed ? colors.surface : "transparent" })}>
              {row.icon ? <View style={{ width: 24, alignItems: "center" }}>{row.icon}</View> : null}
              <Text tone={row.danger ? "danger" : "body"}>{row.label}</Text>
            </Pressable>)}
          </View> : null}
          </ScrollView>
          {/* onAccessibilityTap is iOS-only, so TalkBack could not close through this focus target.
              The standard activate action is delivered on both platforms. */}
          <View ref={firstAction} accessible accessibilityRole="button" accessibilityLabel={closeLabel}
            accessibilityActions={[{ name: "activate" }]} onAccessibilityAction={event => { if (event.nativeEvent.actionName === "activate") close(); }}
            style={{ alignSelf: "flex-start", backgroundColor: colors.bg, borderRadius: tokens.radius.full }}>
            <IconButton label={closeLabel} tone="ghost" onPress={close}><FixedGlyph>×</FixedGlyph></IconButton>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}
