import {
  transferListRecipe,
  moveTransferListSelection,
  reconcileTransferListSelection,
  resolveTransferListPanels,
  resolveTransferListSelectAllState,
  toggleTransferListSelectAll,
  toggleTransferListSelection,
  validateTransferListDescriptor,
  type TransferListMoveDirection,
  type TransferListPanel,
  type TransferListSelection,
} from "@hjmds/design-contracts/components/transfer-list";
import { reconcileCheckboxSelection, type SelectItemDescriptor } from "@hjmds/design-contracts/behaviors";
import { control, glyph, spacing } from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { DrawnChevron } from "./internal/drawn-glyphs.js";
import { SelectionMark } from "./internal/selection-mark.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

const emptySelection = <Id extends string>(): TransferListSelection<Id> => ({
  source: new Set<Id>(),
  target: new Set<Id>(),
});


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function TransferList<Id extends string = string>({
  items,
  labels,
  targetKeys: controlledTargetKeys,
  defaultTargetKeys,
  onTargetKeysChange,
  onMove,
  layoutStyle,
}: TransferListProps<Id>) {

  const { colors, designProfile, palette, environment } = useHjmNativeTheme();
  // Panels share the Web md role; preserve the pre-profile frame when no profile is selected.
  const corner = designProfile?.tokens.radius[transferListRecipe.panel.radius] ?? 12;
  const [storedTargetKeys, setTargetKeys] = useControllableState<ReadonlySet<Id>>({
    ...(controlledTargetKeys === undefined ? {} : { value: controlledTargetKeys }),
    defaultValue: defaultTargetKeys ?? new Set<Id>(),
    ...(onTargetKeysChange === undefined ? {} : { onChange: onTargetKeysChange }),
  });
  const validatedInitialTargets = useRef(false);
  if (!validatedInitialTargets.current) {
    validateTransferListDescriptor({ items, targetKeys: storedTargetKeys });
    validatedInitialTargets.current = true;
  }
  const targetKeys = useMemo(() => controlledTargetKeys === undefined
    ? reconcileCheckboxSelection(items, storedTargetKeys) : storedTargetKeys,
    [controlledTargetKeys, items, storedTargetKeys]);
  useEffect(() => {
    if (controlledTargetKeys === undefined && targetKeys !== storedTargetKeys) setTargetKeys(targetKeys);
  }, [controlledTargetKeys, setTargetKeys, storedTargetKeys, targetKeys]);
  const [rawSelection, setSelection] = useState<TransferListSelection<Id>>(emptySelection<Id>);
  const descriptor = useMemo(() => ({ items, targetKeys }), [items, targetKeys]);
  // A row that left the list entirely must not keep a pending check mark.
  const selection = useMemo(
    () => reconcileTransferListSelection(descriptor, rawSelection),
    [descriptor, rawSelection],
  );
  useEffect(() => {
    if (selection !== rawSelection) setSelection(selection);
  }, [rawSelection, selection]);
  const panels = resolveTransferListPanels(descriptor);
  const canMove = (panel: TransferListPanel) => panels[panel].some(item => !item.disabled && selection[panel].has(item.id));

  const move = (direction: TransferListMoveDirection) => {
    const result = moveTransferListSelection(descriptor, selection, direction);
    if (result.movedIds.length === 0) return;
    setTargetKeys(result.targetKeys);
    // Controlled owners may refuse or defer the move; keep checks until the rows actually leave.
    if (controlledTargetKeys === undefined) setSelection(result.selection);
    if (result.movedIds.length > 0) onMove?.(result.movedIds, direction);
  };

  const panelBorder = resolveColorReference(transferListRecipe.panel.border, palette);
  const renderPanel = (panel: TransferListPanel) => {
    const rows = panels[panel];
    const selectAll = resolveTransferListSelectAllState(descriptor, selection, panel);
    const title = panel === "source" ? labels.source : labels.target;
    // Same structure as Web: one bordered panel holding a [title | select-all] header and checkbox rows.
    return (
      <View style={{ backgroundColor: resolveColorReference(transferListRecipe.panel.background, palette), borderColor: panelBorder, borderRadius: corner, borderWidth: transferListRecipe.panel.borderWidth, overflow: "hidden" }}>
        <View style={{ alignItems: "center", borderBottomColor: panelBorder, borderBottomWidth: transferListRecipe.panel.borderWidth, direction: environment.direction, flexDirection: "row", gap: spacing.xs, minHeight: transferListRecipe.panelHeader.minHeight, paddingHorizontal: transferListRecipe.panelHeader.paddingHorizontal }}>
          <Text fontRole="ui" emphasis="strong" style={{ flex: 1 }} variant={transferListRecipe.panelHeader.title.textVariant}>{title}</Text>
          <Pressable
            accessibilityRole="checkbox"
            // `mixed` is the contract's answer, not a third visual state invented
            // here: some rows checked is neither on nor off.
            // mixedCheckboxState keeps Android from holding a stale ", mixed" suffix.
            accessibilityState={mixedCheckboxState(selectAll, { disabled: !rows.some(item => !item.disabled) })}
            accessibilityLabel={`${title}, ${labels.selectAll}`}
            disabled={!rows.some(item => !item.disabled)}
            onPress={() => setSelection(toggleTransferListSelectAll(descriptor, selection, panel))}
            style={{ alignItems: "center", justifyContent: "center", minHeight: control.minTouchTarget, minWidth: control.minTouchTarget }}
          >
            <SelectionMark checked={selectAll} />
          </Pressable>
        </View>
        <ScrollView
          accessibilityRole="list"
          accessibilityLabel={title}
          contentContainerStyle={{ padding: spacing.xxs, ...(rows.length === 0 ? { flexGrow: 1, justifyContent: "center", alignItems: "center" } : {}) }}
        >
          {rows.length === 0 ? (
            <Text tone="muted" variant={transferListRecipe.emptyState.textVariant} align="center" style={{ padding: spacing.sm }}>{labels.empty}</Text>
          ) : (
            rows.map((item) => {
              const checked = selection[panel].has(item.id as Id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={item.label}
                  accessibilityState={{ checked, disabled: item.disabled === true }}
                  disabled={item.disabled === true}
                  onPress={() => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id as Id))}
                  style={{ alignItems: "center", direction: environment.direction, flexDirection: "row", gap: transferListRecipe.item.gap, minHeight: control.minTouchTarget, opacity: item.disabled ? 0.5 : 1, paddingHorizontal: transferListRecipe.item.paddingHorizontal }}
                >
                  <SelectionMark checked={checked} />
                  <Text fontRole="ui" style={{ flex: 1 }}>{item.label}</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[{ gap: spacing.md }, layoutStyle]}>
      {renderPanel("source")}
      {/*
        The actions sit between the panels stacked, not side by side: a phone
        has no room for two columns plus a button rail, and stacking keeps the
        reading order "list, what to do with it, other list". Stacked buttons
        share one width and the stacked gap, and point down/up at their panel.
      */}
      <View style={{ alignItems: "stretch", gap: transferListRecipe.moveControls.gap }}>
        <Button tone="secondary" disabled={!canMove("source")} onPress={() => move("toTarget")}
          leading={<DrawnChevron direction="down" size={glyph.sm} color={colors.text} />}>
          {labels.toTarget}
        </Button>
        <Button tone="secondary" disabled={!canMove("target")} onPress={() => move("toSource")}
          leading={<DrawnChevron direction="up" size={glyph.sm} color={colors.text} />}>
          {labels.toSource}
        </Button>
      </View>
      {renderPanel("target")}
    </View>
  );
}
