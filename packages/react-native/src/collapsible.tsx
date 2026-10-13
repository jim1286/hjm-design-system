import {
  collapsibleRecipe,
  validateCollapsibleOpenState,
  type CollapsibleOpenState,
} from "@hjmds/design-contracts/components/collapsible";
import { useState, type ReactNode } from "react";
import { control } from "@hjmds/design-contracts/foundations";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type CollapsibleProps = CollapsibleOpenState &
  Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    /** Inline tools stay expanded without a disclosure trigger. */
    presentation?: "disclosure" | "inline";
    /** Preserve local input state while hidden; hidden content stays inaccessible. */
    keepMounted?: boolean;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Collapsible({ trigger, children, disabled = false, presentation = "disclosure", keepMounted = false, layoutStyle, ...openState }: CollapsibleProps) {
  validateCollapsibleOpenState(openState as CollapsibleOpenState);
  const controlled = openState.open !== undefined;
  const [internalOpen, setInternalOpen] = useState(openState.defaultOpen ?? false);
  const open = presentation === "inline" || (openState.open ?? internalOpen);
  return (
    <View style={[{ gap: collapsibleRecipe.gap }, layoutStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => {
          if (disabled || presentation === "inline") return;
          const next = !open;
          if (!controlled) setInternalOpen(next);
          openState.onOpenChange?.(next);
        }}
        // The trigger is the only control here, so it keeps the shared 44 target like Web
        // `.hjm-collapsible__trigger`; a one-line text trigger was ~20 tall (2026-10-06 follow-up).
        style={{ display: presentation === "inline" ? "none" : "flex", minHeight: control.minTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: collapsibleRecipe.gap }}
      >
        {typeof trigger === "string" ? <Text
              fontRole="ui">{trigger}</Text> : trigger}
        {/* Decoration only: the expanded state travels through accessibilityState. */}
        <Text accessibilityElementsHidden importantForAccessibility="no">{open ? "▾" : "▸"}</Text>
      </Pressable>
      {/* Display and accessibility agree: retained input state must not leave
          collapsed tools reachable to assistive technology or hit testing. */}
      {open || keepMounted ? <View accessibilityElementsHidden={!open} importantForAccessibility={open ? "auto" : "no-hide-descendants"} style={{ display: open ? "flex" : "none" }}>{children}</View> : null}
    </View>
  );
}
