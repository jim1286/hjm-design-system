import {
  getTreeArrowKeyIntent,
  getTreeArrowResult,
  getVisibleTreeNavigationTarget,
  getVisibleTreeTypeaheadMatch,
  reconcileTreeExpansion,
  resolveTreeDescriptor,
  treeRecipe,
  type ComposeTreeAccessibleName,
  type ResolvedTreeNodeDescriptor,
  type TreeAsyncState,
  type TreeNodeDescriptor,
  type TreeSelectionModel,
} from "@hjmds/design-contracts/components/tree";
import type { CheckboxState, WebKeyboardKey } from "@hjmds/design-contracts/behaviors";
import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type TreeProps<Id extends string = string> = Readonly<{
  label: string;
  nodes: readonly TreeNodeDescriptor<Id>[];
  composeAccessibleName: ComposeTreeAccessibleName;
  expandedKeys?: ReadonlySet<Id>;
  defaultExpandedKeys?: ReadonlySet<Id>;
  onExpandedKeysChange?: (keys: ReadonlySet<Id>) => void;
  selection?: TreeSelectionModel<Id>;
  /**
   * Tri-state check marks per node, as `resolveTreeCheckedStates` derives them.
   * Checkboxes are not nested controls in a tree: the state rides on the node
   * itself as `aria-checked`, keeping the contract's one-tab-stop-per-node rule.
   */
  checkedStates?: ReadonlyMap<Id, CheckboxState>;
  onCheckedToggle?: (id: Id) => void;
  asyncState?: TreeAsyncState;
  /** Product-owned glyph for the expand/collapse affordance; decorative by contract. */
  renderToggle?: (state: Readonly<{ expanded: boolean }>) => ReactNode;
  className?: string;
}>;

const typeaheadResetMs = 500;

function selectedIds<Id extends string>(selection: TreeSelectionModel<Id> | undefined): ReadonlySet<Id> {
  if (!selection || selection.mode === "none") return new Set<Id>();
  if (selection.mode === "single") {
    const key = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
    return key === null ? new Set<Id>() : new Set<Id>([key]);
  }
  return selection.selectedKeys ?? selection.defaultSelectedKeys ?? new Set<Id>();
}

export const Tree = forwardRef(function Tree<Id extends string = string>(
  {
    label,
    nodes,
    composeAccessibleName,
    expandedKeys: controlledExpanded,
    defaultExpandedKeys,
    onExpandedKeysChange,
    selection,
    checkedStates,
    onCheckedToggle,
    asyncState = { status: "idle" },
    renderToggle,
    className,
  }: TreeProps<Id>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  const [expandedKeys, setExpandedKeys] = useControllableState<ReadonlySet<Id>>({
    ...(controlledExpanded === undefined ? {} : { value: controlledExpanded }),
    defaultValue: defaultExpandedKeys ?? new Set<Id>(),
    ...(onExpandedKeysChange === undefined ? {} : { onChange: onExpandedKeysChange }),
  });
  const direction = useOptionalHjmTheme()?.environment.direction ?? "ltr";
  // Expansion keys survive a node list change only where the node still exists
  // and can still hold children; the contract owns that reconciliation.
  const liveExpanded = useMemo(() => reconcileTreeExpansion(nodes, expandedKeys), [nodes, expandedKeys]);
  const resolved = useMemo(
    () => resolveTreeDescriptor(nodes, liveExpanded, { composeAccessibleName }),
    [nodes, liveExpanded, composeAccessibleName],
  );
  const visible = useMemo(() => resolved.filter((node) => node.visible), [resolved]);
  const selected = selectedIds(selection);
  const [focusedId, setFocusedId] = useState<Id | null>(null);
  // Roving tab stop: one node is tabbable, and it must stay a real visible node
  // after a collapse removed the previously focused descendant.
  const activeId = visible.some((node) => node.id === focusedId) ? focusedId : visible[0]?.id ?? null;
  const rootRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef<Readonly<{ query: string; at: number }>>({ query: "", at: 0 });

  const focusNode = (id: Id) => {
    setFocusedId(id);
    rootRef.current?.querySelector<HTMLElement>(`[data-hjm-tree-node="${CSS.escape(id)}"]`)?.focus();
  };
  const setExpanded = (id: Id, expanded: boolean) => {
    const next = new Set(liveExpanded);
    if (expanded) next.add(id); else next.delete(id);
    setExpandedKeys(next);
  };
  const toggleSelection = (node: ResolvedTreeNodeDescriptor<Id>) => {
    if (node.disabled || !selection || selection.mode === "none") return;
    if (selection.mode === "single") {
      const current = selection.selectedKey ?? selection.defaultSelectedKey ?? null;
      const next = current === node.id && selection.disallowEmptySelection !== true ? null : node.id;
      selection.onSelectionChange?.(next);
      return;
    }
    const next = new Set(selection.selectedKeys ?? selection.defaultSelectedKeys ?? []);
    if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
    selection.onSelectionChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, node: ResolvedTreeNodeDescriptor<Id>) => {
    const key = event.key as WebKeyboardKey;
    const arrow = getTreeArrowKeyIntent(key, direction);
    if (arrow) {
      const result = getTreeArrowResult(visible, node.id, arrow);
      if (result.action === "none") return;
      event.preventDefault();
      if (result.action === "moveFocus") focusNode(result.targetId);
      else setExpanded(node.id, result.action === "expand");
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      const intent = key === "ArrowDown" ? "next" : key === "ArrowUp" ? "previous" : key === "Home" ? "first" : "last";
      const target = getVisibleTreeNavigationTarget(visible, node.id, intent);
      if (target === undefined) return;
      event.preventDefault();
      focusNode(target);
      return;
    }
    if (key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (checkedStates && onCheckedToggle) { if (!node.disabled) onCheckedToggle(node.id); }
      else toggleSelection(node);
      return;
    }
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;
    const now = Date.now();
    const query = now - typeahead.current.at > typeaheadResetMs ? event.key : typeahead.current.query + event.key;
    typeahead.current = { query, at: now };
    const match = getVisibleTreeTypeaheadMatch(visible, query, { startsAfterKey: node.id });
    if (match !== undefined) { event.preventDefault(); focusNode(match); }
  };

  return (
    <div
      ref={composeRefs(rootRef, forwardedRef)}
      role="tree"
      aria-label={label}
      aria-busy={asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined}
      aria-multiselectable={selection?.mode === "multiple" || undefined}
      className={classNames("hjm-tree", className)}
      style={{ "--hjm-tree-indent": `${treeRecipe.indentPerLevel}px` } as CSSProperties}
    >
      {asyncState.status === "empty" || asyncState.status === "error" || asyncState.status === "loading" ? (
        <p className="hjm-tree__state" role={asyncState.status === "error" ? "alert" : "status"}>{asyncState.message}</p>
      ) : null}
      {visible.map((node) => (
        <div
          key={node.id}
          role="treeitem"
          data-hjm-tree-node={node.id}
          aria-level={node.depth}
          aria-posinset={node.position}
          aria-setsize={node.siblingCount}
          aria-expanded={node.hasChildren ? node.expanded : undefined}
          aria-selected={selection && selection.mode !== "none" ? selected.has(node.id) : undefined}
          aria-checked={checkedStates ? (checkedStates.get(node.id) === "mixed" ? "mixed" : String(checkedStates.get(node.id) === true)) as "true" | "false" | "mixed" : undefined}
          aria-disabled={node.disabled || undefined}
          aria-label={node.accessibleName}
          // One tab stop for the whole tree; the glyph is decorative, not a
          // nested control, so a node is the only focusable thing in a row.
          tabIndex={node.id === activeId ? 0 : -1}
          className="hjm-tree__node"
          style={{ "--hjm-tree-depth": node.depth - 1 } as CSSProperties}
          onClick={() => {
            setFocusedId(node.id);
            if (checkedStates && onCheckedToggle) { if (!node.disabled) onCheckedToggle(node.id); }
            else toggleSelection(node);
          }}
          onFocus={() => setFocusedId(node.id)}
          onKeyDown={(event) => onKeyDown(event, node)}
        >
          <span aria-hidden="true" className="hjm-tree__indent" />
          {checkedStates ? (
            <span aria-hidden="true" className="hjm-tree__check" data-state={String(checkedStates.get(node.id) ?? false)}>
              {checkedStates.get(node.id) === true ? "✓" : checkedStates.get(node.id) === "mixed" ? "–" : ""}
            </span>
          ) : null}
          <span aria-hidden="true" className="hjm-tree__toggle" data-visible={node.hasChildren || undefined}>
            {node.hasChildren ? renderToggle?.({ expanded: node.expanded }) ?? (node.expanded ? "▾" : "▸") : null}
          </span>
          <span aria-hidden="true" className="hjm-tree__label">
            {node.label}
            {node.description ? <span className="hjm-tree__description">{node.description}</span> : null}
          </span>
        </div>
      ))}
      {asyncState.status === "loadingMore" ? <p className="hjm-tree__state" role="status">{asyncState.message}</p> : null}
    </div>
  );
}) as <Id extends string = string>(
  props: TreeProps<Id> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
