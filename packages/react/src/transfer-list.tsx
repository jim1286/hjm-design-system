import {
  moveTransferListSelection,
  reconcileTransferListSelection,
  resolveTransferListFocusAfterMove,
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
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Button } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

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
  className?: string;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

const emptySelection = <Id extends string>(): TransferListSelection<Id> => ({
  source: new Set<Id>(),
  target: new Set<Id>(),
});

// Rows are multi-select: Checkbox's indicator, not a 16px rounded box that read as a radio.
function SelectionMark({ state }: { state: boolean | "mixed" }) {
  return <span aria-hidden="true" className="hjm-choice__indicator" data-kind="checkbox" data-state={state === "mixed" ? "mixed" : state ? "checked" : "unchecked"} />;
}

// The panels sit side by side or stack depending on width (CSS), so both directions are drawn and CSS shows the one
// that points at the destination panel; products no longer bake "→" into the label.
function MoveIcon({ inline, stacked }: { inline: "chevronEnd" | "chevronStart"; stacked: "chevronDown" | "chevronUp" }) {
  return <>
    <Icon name={inline} size="sm" className="hjm-transfer-list__move-icon" data-orientation="inline" />
    <Icon name={stacked} size="sm" className="hjm-transfer-list__move-icon" data-orientation="stacked" />
  </>;
}

export const TransferList = forwardRef(function TransferList<Id extends string = string>(
  {
    items,
    labels,
    targetKeys: controlledTargetKeys,
    defaultTargetKeys,
    onTargetKeysChange,
    onMove,
    className,
    layoutStyle,
  }: TransferListProps<Id>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<Readonly<Record<TransferListPanel, Id | null>>>({ source: null, target: null });
  const focusWithin = useRef(false);
  const focusedPanel = useRef<TransferListPanel | null>(null);
  const previousPanels = useRef(panels);
  useLayoutEffect(() => {
    const before = previousPanels.current;
    previousPanels.current = panels;
    const panel = focusedPanel.current;
    if (!focusWithin.current || panel === null || document.activeElement !== document.body) return;
    const id = focused[panel];
    if (id === null || panels[panel].some(item => item.id === id)) return;
    // External removals bypass the move handler, but must not drop row focus onto body.
    const next = resolveTransferListFocusAfterMove(panels[panel], before[panel].findIndex(item => item.id === id));
    if (next !== null) focusRow(panel, next);
    else rootRef.current?.querySelector<HTMLElement>(`[data-hjm-transfer-empty="${panel}"]`)?.focus();
  }, [focused, panels]);

  const focusRow = (panel: TransferListPanel, id: Id | null) => {
    setFocused((previous) => ({ ...previous, [panel]: id }));
    if (id === null) return;
    rootRef.current?.querySelector<HTMLElement>(`[data-hjm-transfer-row="${panel}:${CSS.escape(id)}"]`)?.focus();
  };
  const move = (direction: TransferListMoveDirection) => {
    const from: TransferListPanel = direction === "toTarget" ? "source" : "target";
    const before = panels[from];
    const result = moveTransferListSelection(descriptor, selection, direction);
    if (result.movedIds.length === 0) return;
    const removedIndex = before.findIndex((item) => item.id === result.movedIds[0]);
    const remaining = before.filter((item) => !result.movedIds.includes(item.id));
    setTargetKeys(result.targetKeys);
    // Controlled owners may refuse or defer the move; keep checks until the rows actually leave.
    if (controlledTargetKeys === undefined) setSelection(result.selection);
    onMove?.(result.movedIds, direction);
    // Focus lands on the row that slid into the first removed position, or on
    // the panel's empty state — never on the document body.
    const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
    queueMicrotask(() => {
      if (result.movedIds.some(id => rootRef.current?.querySelector(`[data-hjm-transfer-row="${from}:${CSS.escape(id)}"]`))) return;
      if (next !== null) focusRow(from, next);
      else rootRef.current?.querySelector<HTMLElement>(`[data-hjm-transfer-empty="${from}"]`)?.focus();
    });
  };
  const moveSingle = (panel: TransferListPanel, id: Id) => {
    // A focused row moves on its own: a single move must not require first
    // building a multi-selection.
    const single = { ...emptySelection<Id>(), [panel]: new Set<Id>([id]) } as TransferListSelection<Id>;
    const direction: TransferListMoveDirection = panel === "source" ? "toTarget" : "toSource";
    const result = moveTransferListSelection(descriptor, single, direction);
    if (result.movedIds.length === 0) return;
    const before = panels[panel];
    const removedIndex = before.findIndex((item) => item.id === id);
    const remaining = before.filter((item) => item.id !== id);
    setTargetKeys(result.targetKeys);
    if (controlledTargetKeys === undefined) {
      setSelection((current) => ({ ...current, [panel]: new Set([...current[panel]].filter((key) => key !== id)) }));
    }
    onMove?.(result.movedIds, direction);
    const next = resolveTransferListFocusAfterMove(remaining, removedIndex);
    queueMicrotask(() => {
      if (rootRef.current?.querySelector(`[data-hjm-transfer-row="${panel}:${CSS.escape(id)}"]`)) return;
      if (next !== null) focusRow(panel, next);
      else rootRef.current?.querySelector<HTMLElement>(`[data-hjm-transfer-empty="${panel}"]`)?.focus();
    });
  };

  const renderPanel = (panel: TransferListPanel) => {
    const panelItems = panels[panel];
    const selected = selection[panel];
    const selectAllState = resolveTransferListSelectAllState(descriptor, selection, panel);
    const activeId = panelItems.some((item) => item.id === focused[panel])
      ? focused[panel]
      : panelItems.find((item) => !item.disabled)?.id ?? panelItems[0]?.id ?? null;
    const onKeyDown = (event: KeyboardEvent<HTMLElement>, item: SelectItemDescriptor<Id>) => {
      const index = panelItems.findIndex((candidate) => candidate.id === item.id);
      const goto = (nextIndex: number) => {
        const target = panelItems[Math.min(Math.max(nextIndex, 0), panelItems.length - 1)];
        if (target) { event.preventDefault(); focusRow(panel, target.id); }
      };
      if (event.key === "ArrowDown") goto(index + 1);
      else if (event.key === "ArrowUp") goto(index - 1);
      else if (event.key === "Home") goto(0);
      else if (event.key === "End") goto(panelItems.length - 1);
      else if (event.key === " ") {
        event.preventDefault();
        setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id));
      } else if (event.key === "Enter") {
        event.preventDefault();
        moveSingle(panel, item.id);
      }
    };
    return (
      <div className="hjm-transfer-list__panel" role="group" aria-label={labels[panel]}>
        <div className="hjm-transfer-list__header">
          <span className="hjm-transfer-list__title">{labels[panel]}</span>
          <button
            type="button"
            role="checkbox"
            aria-checked={selectAllState === "mixed" ? "mixed" : String(selectAllState === true) as "true" | "false"}
            aria-label={`${labels[panel]} ${labels.selectAll}`}
            className="hjm-transfer-list__select-all"
            disabled={!panelItems.some(item => !item.disabled)}
            onClick={() => setSelection(toggleTransferListSelectAll(descriptor, selection, panel))}
          >
            <SelectionMark state={selectAllState} />
          </button>
        </div>
        {panelItems.length === 0 ? (
          <p className="hjm-transfer-list__empty" data-hjm-transfer-empty={panel} tabIndex={-1}>{labels.empty}</p>
        ) : (
          <div role="listbox" aria-multiselectable="true" aria-label={labels[panel]} className="hjm-transfer-list__options">
            {panelItems.map((item) => (
              <div
                key={item.id}
                role="option"
                data-hjm-transfer-row={`${panel}:${item.id}`}
                aria-selected={selected.has(item.id)}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.id === activeId ? 0 : -1}
                className="hjm-transfer-list__option"
                onFocus={() => { focusedPanel.current = panel; setFocused((previous) => ({ ...previous, [panel]: item.id })); }}
                onClick={() => setSelection(toggleTransferListSelection(descriptor, selection, panel, item.id))}
                onKeyDown={(event) => onKeyDown(event, item)}
              >
                <SelectionMark state={selected.has(item.id)} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={composeRefs(rootRef, forwardedRef)} style={layoutStyle} className={classNames("hjm-transfer-list", className)}
      onFocusCapture={() => { focusWithin.current = true; }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusWithin.current = false; }}>
      {renderPanel("source")}
      <div className="hjm-transfer-list__actions">
        <Button tone="secondary" disabled={!canMove("source")} onClick={() => move("toTarget")}
          leading={<MoveIcon inline="chevronEnd" stacked="chevronDown" />}>
          {labels.toTarget}
        </Button>
        <Button tone="secondary" disabled={!canMove("target")} onClick={() => move("toSource")}
          leading={<MoveIcon inline="chevronStart" stacked="chevronUp" />}>
          {labels.toSource}
        </Button>
      </div>
      {renderPanel("target")}
    </div>
  );
}) as <Id extends string = string>(
  props: TransferListProps<Id> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
