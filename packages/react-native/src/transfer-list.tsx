import {
  moveTransferListSelection,
  reconcileTransferListSelection,
  resolveTransferListPanels,
  resolveTransferListSelectAllState,
  toggleTransferListSelectAll,
  toggleTransferListSelection,
  type TransferListMoveDirection,
  type TransferListPanel,
  type TransferListSelection,
} from "@hjmds/design-contracts/components/transfer-list";
import type { SelectItemDescriptor } from "@hjmds/design-contracts/behaviors";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useControllableState } from "./internal/state.js";
import { useHjmNativeTheme } from "./provider.js";

export type TransferListLabels = Readonly<{
  source: string;
  target: string;
  toTarget: string;
  toSource: string;
  selectAll: string;
  empty: string;
}>;

export type TransferListProps<Id extends string = string> = Readonly<{
  items: readonly SelectItemDescriptor<Id>[];
  labels: TransferListLabels;
  targetKeys?: ReadonlySet<Id>;
  defaultTargetKeys?: ReadonlySet<Id>;
  onTargetKeysChange?: (keys: ReadonlySet<Id>) => void;
  /** Receives which ids moved, in origin-panel order, so the product announces it. */
  onMove?: (movedIds: readonly Id[], direction: TransferListMoveDirection) => void;
  style?: StyleProp<ViewStyle>;
}>;

const emptySelection = <Id extends string>(): TransferListSelection<Id> => ({
  source: new Set<Id>(),
  target: new Set<Id>(),
});

export function TransferList<Id extends string = string>({
  items,
  labels,
  targetKeys: controlledTargetKeys,
  defaultTargetKeys,
  onTargetKeysChange,
  onMove,
  style,
}: TransferListProps<Id>) {
  const { colors } = useHjmNativeTheme();
  const [targetKeys, setTargetKeys] = useControllableState<ReadonlySet<Id>>({
    ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
    defaultValue: defaultTargetKeys ?? new Set<Id>(),
    ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
  });
  const [rawSelection, setSelection] = useState<TransferListSelection<Id>>(emptySelection<Id>);
  const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
  // A row that left the list entirely must not keep a pending check mark.
  const selection = useMemo(
    () => reconcileTransferListSelection(descriptor, rawSelection),
    [descriptor, rawSelection],
  );
  const panels = resolveTransferListPanels(descriptor);

  const move = (direction: TransferListMoveDirection) => {
    const result = moveTransferListSelection(descriptor, selection, direction);
    setTargetKeys(result.targetKeys);
    setSelection(result.selection);
    if (result.movedIds.length > 0) onMove?.(result.movedIds, direction);
  };

  const renderPanel = (panel: TransferListPanel) => {
    const rows = panels[panel];
    const selectAll = resolveTransferListSelectAllState(descriptor, selection, panel);
    return (
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Pressable
          accessibilityRole="checkbox"
          // `mixed` is the contract's answer, not a third visual state invented
          // here: some rows checked is neither on nor off.
          accessibilityState={{ checked: selectAll }}
          accessibilityLabel={`${panel === "source" ? labels.source : labels.target}, ${labels.selectAll}`}
          disabled={rows.length === 0}
          onPress={() => setSelection(toggleTransferListSelectAll(descriptor, selection, panel))}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text variant="label">{labels.selectAll}</Text>
        </Pressable>
        <ScrollView style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
          {rows.length === 0 ? (
            <Text tone="muted" variant="caption" style={{ padding: spacing.sm }}>{labels.empty}</Text>
          ) : (
            rows.map((item) => {
              const checked = selection[panel].has(item.id as Id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked, disabled: item.disabled === true }}
                  disabled={item.disabled === true}
                  onPress={() => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id as Id))}
                  style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm }}
                >
                  <Text>{checked ? "✓ " : ""}{item.label}</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <Text variant="label">{labels.source}</Text>
      {renderPanel("source")}
      {/*
        The actions sit between the panels stacked, not side by side: a phone
        has no room for two columns plus a button rail, and stacking keeps the
        reading order "list, what to do with it, other list".
      */}
      <View style={{ flexDirection: "row", gap: spacing.sm, justifyContent: "center" }}>
        <Button tone="secondary" disabled={selection.source.size === 0} onPress={() => move("toTarget")}>
          {labels.toTarget}
        </Button>
        <Button tone="secondary" disabled={selection.target.size === 0} onPress={() => move("toSource")}>
          {labels.toSource}
        </Button>
      </View>
      <Text variant="label">{labels.target}</Text>
      {renderPanel("target")}
    </View>
  );
}
