import {
  canDismissCommandPalette,
  commandPaletteBehaviorDefaults,
  commandPaletteRecipe,
  validateCommandPaletteDescriptor,
  type CommandPaletteActivateHandler,
  type CommandPaletteActivateReason,
  type CommandPaletteDescriptor,
  type CommandPaletteDismissPolicy,
  type CommandPaletteDismissReason,
  type CommandPaletteOpenChangeDetails,
  type CommandPaletteQueryState,
  type CommandPaletteSource,
} from "@hjmds/design-contracts/components/command-palette";
import {
  getCollectionNavigationIntent,
  getCollectionNavigationTarget,
  isComboboxResultCurrent,
} from "@hjmds/design-contracts/components/collection";
import type { CommandPaletteItemDescriptor } from "@hjmds/design-contracts/components/command-palette";
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { classNames, composeRefs } from "./internal.js";
import { getModalLayer, HjmPortal, renderTrigger, useModalFocus, type OverlayTrigger } from "./modal.js";

type ResultSection<Key extends string> = Readonly<{
  id: string;
  label: string | undefined;
  name: string | undefined;
  items: readonly CommandPaletteItemDescriptor<Key>[];
}>;

// Local filter = Native Combobox substring rule; why not prefix/contracts:
// docs/command-palette.md "2026-10-06" (comments ship in dist byte budgets).
function resolveResults<Key extends string>(
  source: CommandPaletteSource<Key, string>,
  query: string,
  queryState: CommandPaletteQueryState | undefined,
  emptyMessage: string | undefined,
) {
  const external = queryState?.filtering === "external";
  const needle = query.trim().toLocaleLowerCase();
  const keep = (item: CommandPaletteItemDescriptor<Key>) =>
    external || `${item.label} ${item.textValue}`.toLocaleLowerCase().includes(needle);
  const sections: ResultSection<Key>[] = (source.sections
    ? source.sections.map((section) => ({
      id: section.id,
      label: section.label,
      // validateCollection's precedence.
      name: section.accessibilityLabel?.trim() || section.label?.trim() || undefined,
      items: section.items.filter(keep),
    }))
    : [{ id: "__all", label: undefined, name: undefined, items: source.items.filter(keep) }]
  ).filter((section) => section.items.length > 0);
  const items = sections.flatMap((section) => section.items);
  const asyncState = queryState?.asyncState ?? { status: "idle" as const };
  const status = asyncState.status !== "idle"
    ? { kind: asyncState.status, message: asyncState.message }
    : items.length > 0 || emptyMessage === undefined ? null : { kind: "empty" as const, message: emptyMessage };
  return {
    sections,
    items,
    current: !external || isComboboxResultCurrent(queryState.queryValue, queryState.resultQuery),
    status,
  };
}

export type CommandPaletteProps<Key extends string = string> = Readonly<{
  descriptor: CommandPaletteDescriptor;
  source: CommandPaletteSource<Key, string>;
  query: string;
  onQueryChange: (query: string) => void;
  onActivate: CommandPaletteActivateHandler<Key>;
  /** Runs after the palette is gone, for a command that opens the next surface. */
  onActivateAfterDismiss?: CommandPaletteActivateHandler<Key>;
  /**
   * Combobox's collection state. Omitted or `filtering: "local"` filters
   * `source` by `query` in the renderer (label/textValue substring); pass
   * `filtering: "external"` with `queryValue`/`resultQuery` when the product
   * already filtered or ranked the results (server or fuzzy search).
   */
  queryState?: CommandPaletteQueryState;
  dismissPolicy?: Partial<CommandPaletteDismissPolicy>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: CommandPaletteOpenChangeDetails) => void;
  trigger?: OverlayTrigger;
  renderLeading?: (itemId: Key) => ReactNode;
  portalContainer?: HTMLElement;
  className?: string;
}>;

export const CommandPalette = forwardRef(function CommandPalette<Key extends string = string>(
  {
    descriptor,
    source,
    query,
    onQueryChange,
    onActivate,
    onActivateAfterDismiss,
    queryState,
    dismissPolicy,
    open: openProp,
    defaultOpen,
    onOpenChange,
    trigger,
    renderLeading,
    portalContainer,
    className,
  }: CommandPaletteProps<Key>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  validateCommandPaletteDescriptor(descriptor);
  const policy: CommandPaletteDismissPolicy = { ...commandPaletteBehaviorDefaults, ...dismissPolicy };
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;
  const results = useMemo(
    () => resolveResults<Key>(source, query, queryState, descriptor.emptyMessage),
    [source, query, queryState, descriptor.emptyMessage],
  );
  // Stale external rows stay visible but inert, as in the Native Combobox.
  const enabled = results.current ? results.items.filter((item) => !item.disabled) : [];
  const [activeId, setActiveId] = useState<Key | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = `${useId().replaceAll(":", "")}-command-palette`;
  const active = enabled.find((item) => item.id === activeId) ?? enabled[0] ?? null;

  useEffect(() => {
    // A new query builds a new result list; the first enabled row becomes active
    // so Enter always has an unambiguous target. Only the query resets it: products
    // often pass `source`/`queryState` as inline objects, and keying on their
    // identity snapped the active row back to the first item on every render
    // (2026-10-06 usage-guide audit). A row that disappears from the results
    // already falls back to the first enabled row through `active` above.
    setActiveId(null);
  }, [query]);

  const change = (next: boolean, reason: CommandPaletteOpenChangeDetails["reason"]) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next, { reason });
  };
  const requestClose = (reason: CommandPaletteDismissReason) => {
    if (!canDismissCommandPalette(reason, policy)) return;
    change(false, reason);
  };
  const activate = (itemId: Key, reason: CommandPaletteActivateReason) => {
    onActivate(itemId, reason);
    // Running a command always closes the palette — `activation` is a dismiss
    // reason no policy can veto — and the follow-up surface opens after that.
    change(false, "activation");
    if (onActivateAfterDismiss) queueMicrotask(() => onActivateAfterDismiss(itemId, reason));
  };

  useModalFocus({
    active: open,
    contentRef,
    initialFocusRef: inputRef,
    ...(trigger === undefined ? {} : { fallbackReturnRef: triggerRef }),
    onEscape: () => requestClose("escape"),
  });

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const intent = getCollectionNavigationIntent(event.key as never);
    if (intent) {
      const target = getCollectionNavigationTarget({ items: enabled }, active?.id ?? null, intent, true);
      if (target === undefined) return;
      event.preventDefault();
      setActiveId(target as Key);
      return;
    }
    if (event.key === "Enter" && active) {
      event.preventDefault();
      activate(active.id as Key, "keyboard");
    }
  };

  const searchInput = (
    <input
      ref={inputRef}
      type="text"
      role="combobox"
      aria-expanded
      aria-controls={`${id}-results`}
      aria-activedescendant={active ? `${id}-${active.id}` : undefined}
      aria-label={descriptor.accessibilityLabel}
      placeholder={descriptor.searchPlaceholder}
      className="hjm-command-palette__search"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  );

  const renderedTrigger = trigger === undefined
    ? null
    : renderTrigger(trigger, triggerRef, open, id, "dialog", () => change(true, "trigger"));
  if (!open) return renderedTrigger;

  return (
    <>
      {renderedTrigger}
      <HjmPortal {...(portalContainer === undefined ? {} : { container: portalContainer })}>
        <div
          className="hjm-overlay hjm-command-palette-positioner"
          data-kind="command-palette"
          style={{ zIndex: getModalLayer(0) }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose("outside"); }}
        >
          <div
            ref={composeRefs(contentRef, forwardedRef)}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={descriptor.accessibilityLabel}
            data-hjm-modal-content=""
            className={classNames("hjm-command-palette", className)}
            style={{ maxInlineSize: commandPaletteRecipe.content.maxWidth, maxBlockSize: commandPaletteRecipe.content.maxHeight } as CSSProperties}
          >
            {/*
              Opt-in through descriptor.closeLabel because the renderer must not
              invent untranslated copy. Reuses Dialog's close chrome instead of a
              second close-button style (styles.css is at its byte budget).
            */}
            {descriptor.closeLabel ? (
              <div className="hjm-command-palette__search-row">
                {searchInput}
                <button
                  type="button"
                  className="hjm-dialog__close hjm-command-palette__close"
                  aria-label={descriptor.closeLabel}
                  onClick={() => requestClose("close-action")}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            ) : searchInput}
            <div id={`${id}-results`} role="listbox" aria-label={descriptor.accessibilityLabel} className="hjm-command-palette__viewport">
              {results.status === null ? null : (
                // Once for the whole list, never per section.
                <p
                  className="hjm-command-palette__state"
                  data-kind={results.status.kind}
                  role={results.status.kind === "error" ? "alert" : "status"}
                >
                  {results.status.message}
                </p>
              )}
              {results.sections.map((section) => (
                <div
                  key={section.id}
                  className="hjm-command-palette__section"
                  {...(section.name === undefined ? { role: "presentation" } : { role: "group", "aria-label": section.name })}
                >
                  {section.label ? <p className="hjm-command-palette__section-label" aria-hidden="true">{section.label}</p> : null}
                  {section.items.map((item) => {
                    // Positioning or filtering can enter a stationary cursor;
                    // only mouse movement should override keyboard navigation.
                    const inert = item.disabled === true || !results.current;
                    return (
                    <div
                      key={item.id}
                      id={`${id}-${item.id}`}
                      role="option"
                      aria-selected={item.id === active?.id}
                      aria-disabled={inert || undefined}
                      className="hjm-command-palette__item"
                      data-tone={item.tone}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        if (!inert) activate(item.id as Key, "pointer");
                      }}
                      onMouseMove={() => { if (!inert) setActiveId(item.id as Key); }}
                    >
                      {renderLeading?.(item.id as Key)}
                      <span className="hjm-command-palette__copy">
                        <span>{item.label}</span>
                        {item.description ? <span className="hjm-command-palette__description">{item.description}</span> : null}
                      </span>
                      {item.shortcut ? <kbd className="hjm-command-palette__shortcut">{item.shortcut}</kbd> : null}
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </HjmPortal>
    </>
  );
}) as <Key extends string = string>(
  props: CommandPaletteProps<Key> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
