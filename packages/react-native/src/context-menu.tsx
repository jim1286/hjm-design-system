import { cloneElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Modal, Platform, Pressable, View, useWindowDimensions, type AccessibilityActionEvent, type GestureResponderEvent } from "react-native";
import { scrim } from "@hjmds/design-contracts/foundations";
import { screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import type { ContextMenuItemDescriptor } from "@hjmds/design-contracts/components/context-menu";
import { useHjmNativeSafeAreaInsets, useHjmNativeTheme } from "./provider.js";
import { Text } from "./primitives.js";

export type NativeCanonicalContextMenuItem = Pick<ContextMenuItemDescriptor, "id" | "label" | "disabled" | "tone"> & Readonly<{ icon?: ReactNode }>;
type HostProps = Readonly<{
  onLongPress?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  accessibilityActions?: readonly Readonly<{ name: string; label?: string }>[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
}>;
export type ContextMenuProps = Readonly<{
  /** One pressable host (row, card). It keeps its own tap and name; the menu adds long-press only. */
  children: ReactElement<HostProps>;
  items: readonly NativeCanonicalContextMenuItem[];
  onAction(id: string): void;
  /** Localized name of the accessibility action that opens the menu. */
  accessibilityLabel: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

/**
 * Canonical long-press menu without native modules (2026-10-16: conversation lists and comments need the
 * same hold menu as chat). Reply/report-style rows match the chat hold menu; danger rows are last by product order.
 * Screen-reader users open it from the host's accessibility action instead of a long press.
 */
export function ContextMenu({ children, items, onAction, accessibilityLabel, disabled = false, onOpenChange }: ContextMenuProps) {
  if (!items.length || new Set(items.map(item => item.id)).size !== items.length || items.some(item => !item.id.trim() || !item.label.trim())) {
    throw new TypeError("ContextMenu needs unique, named items");
  }
  const { colors, tokens, environment } = useHjmNativeTheme();
  const insets = useHjmNativeSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [anchor, setAnchor] = useState<number>();
  const queued = useRef<string | null>(null);
  const open = anchor !== undefined && !disabled;
  const show = (y: number) => { setAnchor(y); onOpenChange?.(true); };
  const close = () => { setAnchor(undefined); onOpenChange?.(false); };
  // iOS must dismiss this modal before the product opens another sheet; Android has no onDismiss.
  const runQueued = () => { const id = queued.current; queued.current = null; if (id) onAction(id); };
  const wasOpen = useRef(false);
  useEffect(() => { if (wasOpen.current && !open && Platform.OS !== "ios") runQueued(); wasOpen.current = open; });
  useEffect(() => { if (disabled) setAnchor(undefined); }, [disabled]);
  const rowHeight = 48;
  const menuHeight = items.length * rowHeight + tokens.spacing.xs * 2;
  const top = Math.max((insets.top ?? 0) + tokens.spacing.sm, Math.min((anchor ?? height / 2) + tokens.spacing.xs, height - (insets.bottom ?? 0) - tokens.spacing.sm - menuHeight));
  const host = children.props;
  const trigger = cloneElement(children, {
    delayLongPress: host.delayLongPress ?? screenPatternRecipe.reactionHoldMs,
    onLongPress: (event: GestureResponderEvent) => { host.onLongPress?.(event); if (!disabled) show(event.nativeEvent.pageY); },
    accessibilityActions: [...(host.accessibilityActions ?? []), { name: "contextMenu", label: accessibilityLabel }],
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === "contextMenu") { if (!disabled) show(height / 2); return; }
      host.onAccessibilityAction?.(event);
    },
  });
  return <>
    {trigger}
    <Modal visible={open} transparent statusBarTranslucent animationType={environment.reducedMotion ? "none" : "fade"} onRequestClose={close} onDismiss={runQueued}>
      <View style={{ flex: 1 }}>
        <Pressable accessible={false} importantForAccessibility="no-hide-descendants" onPress={close} style={{ position: "absolute", inset: 0, backgroundColor: scrim }} />
        <View accessibilityViewIsModal onAccessibilityEscape={close}
          style={{ position: "absolute", top, start: tokens.spacing.md, width: Math.min(width - tokens.spacing.md * 2, 280), backgroundColor: colors.bg, borderRadius: tokens.radius.xl, paddingVertical: tokens.spacing.xs, overflow: "hidden" }}>
          {items.map(item => <Pressable key={item.id} accessibilityRole="menuitem" accessibilityLabel={item.label} accessibilityState={{ disabled: item.disabled ?? false }} disabled={item.disabled ?? false}
            onPress={() => { queued.current = item.id; close(); }}
            style={({ pressed }) => ({ minHeight: rowHeight, flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md, opacity: item.disabled ? 0.5 : 1, backgroundColor: pressed ? colors.surface : "transparent" })}>
            {item.icon ? <View style={{ width: 24, alignItems: "center" }}>{item.icon}</View> : null}
            <Text tone={item.tone === "danger" ? "danger" : "body"}>{item.label}</Text>
          </Pressable>)}
        </View>
      </View>
    </Modal>
  </>;
}
