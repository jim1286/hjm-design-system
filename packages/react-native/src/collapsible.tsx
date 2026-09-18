import {
  collapsibleRecipe,
  validateCollapsibleOpenState,
  type CollapsibleOpenState,
} from "@hjmds/design-contracts/components/collapsible";
import { useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";

export type CollapsibleProps = CollapsibleOpenState &
  Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
  }>;

export function Collapsible({ trigger, children, disabled = false, style, ...openState }: CollapsibleProps) {
  validateCollapsibleOpenState(openState as CollapsibleOpenState);
  const controlled = openState.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
  const open = openState.open ?? internalOpen;
  return (
    <View style={[{ gap: collapsibleRecipe.gap }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => {
          const next = !open;
          if (!controlled) setInternalOpen(next);
          openState.onOpenChange?.(next);
        }}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }}
      >
        {typeof trigger === "string" ? <Text>{trigger}</Text> : trigger}
        {/* Decoration only: the expanded state travels through accessibilityState. */}
        <Text accessibilityElementsHidden importantForAccessibility="no">{open ? "▾" : "▸"}</Text>
      </Pressable>
      {/*
        Unmounted when closed rather than hidden: content left in the tree stays
        reachable by the screen reader, which contradicts the collapsed state.
        There is no aria-controls on native — the nesting is the relationship.
      */}
      {open ? <View>{children}</View> : null}
    </View>
  );
}
