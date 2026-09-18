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
  flattenCollectionItems,
  getCollectionNavigationIntent,
  getCollectionNavigationTarget,
} from "@hjmds/design-contracts/components/collection";
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

export type CommandPaletteProps<Key extends string = string> = Readonly<{
  descriptor: CommandPaletteDescriptor;
  source: CommandPaletteSource<Key, string>;
  query: string;
  onQueryChange: (query: string) => void;
  onActivate: CommandPaletteActivateHandler<Key>;
  /** Runs after the palette is gone, for a command that opens the next surface. */
  onActivateAfterDismiss?: CommandPaletteActivateHandler<Key>;
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
  const items = useMemo(() => flattenCollectionItems<Key, string>(source), [source]);
  const enabled = items.filter((item) => !item.disabled);
  // The query state is Combobox's, so the message to show is its async slice —
  // the palette adds no second loading vocabulary of its own.
  const asyncState = queryState?.asyncState ?? { status: "idle" as const };
  const [activeId, setActiveId] = useState<Key | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = `${useId().replaceAll(":", "")}-command-palette`;
  const active = enabled.find((item) => item.id === activeId) ?? enabled[0] ?? null;

  useEffect(() => {
    // A new query builds a new result list; the first enabled row becomes active
    // so Enter always has an unambiguous target.
    setActiveId(null);
  }, [query, source]);

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

  const renderedTrigger = trigger === undefined
    ? null
    : renderTrigger(trigger, triggerRef, open, id, "dialog", () => change(true, "trigger"));
  if (!open) return renderedTrigger;

  const rows = (source.sections ?? [{ id: "__all", label: undefined, items: source.items ?? [] }]) as readonly {
    id: string; label?: string; items: readonly (typeof items)[number][];
  }[];
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
            <div id={`${id}-results`} role="listbox" aria-label={descriptor.accessibilityLabel} className="hjm-command-palette__viewport">
              {asyncState.status === "idle" ? null : (
                <p className="hjm-command-palette__state" role={asyncState.status === "error" ? "alert" : "status"}>{asyncState.message}</p>
              )}
              {rows.map((section) => (
                <div key={section.id} className="hjm-command-palette__section" role="group" aria-label={section.label}>
                  {section.label ? <p className="hjm-command-palette__section-label">{section.label}</p> : null}
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      id={`${id}-${item.id}`}
                      role="option"
                      aria-selected={item.id === active?.id}
                      aria-disabled={item.disabled || undefined}
                      className="hjm-command-palette__item"
                      data-tone={item.tone}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        if (!item.disabled) activate(item.id as Key, "pointer");
                      }}
                      onMouseEnter={() => { if (!item.disabled) setActiveId(item.id as Key); }}
                    >
                      {renderLeading?.(item.id as Key)}
                      <span className="hjm-command-palette__copy">
                        <span>{item.label}</span>
                        {item.description ? <span className="hjm-command-palette__description">{item.description}</span> : null}
                      </span>
                      {item.shortcut ? <kbd className="hjm-command-palette__shortcut">{item.shortcut}</kbd> : null}
                    </div>
                  ))}
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
