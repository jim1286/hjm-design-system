import {
  getCollectionNavigationIntent,
  getCollectionNavigationTarget,
  getCollectionTypeaheadMatch,
  reconcileSelectSelection,
  resolveCollectionItem,
  resolveSelectSelectedItem,
  validateCollection,
  type SelectCollectionSectionDescriptor,
  type SelectCollectionSource,
  type SelectOpenChangeReason,
} from "@hjm/design-contracts/components/collection";
import {
  resolveControlAccessibleName,
  selectBehaviorDefaults,
  type AsyncCollectionState,
  type SelectItemDescriptor,
  type WebKeyboardKey,
} from "@hjm/design-contracts/behaviors";
import {
  iconRecipe,
  selectRecipe,
  type SelectDensity,
  type SelectSize,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { classNames, useControllableState } from "./internal.js";

export type SelectItem<Key extends string = string> = SelectItemDescriptor<Key>;
export type SelectSection<
  Key extends string = string,
  SectionKey extends string = string,
> = SelectCollectionSectionDescriptor<Key, SectionKey>;

export type SelectLeadingRenderProps = Readonly<{
  color: "currentColor";
  size: number;
  glyphSize: number;
}>;

export type SelectOptionLeadingRenderProps = SelectLeadingRenderProps & Readonly<{
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
}>;

const emptySelectionKey = Symbol("hjm-select-empty-selection");
type SelectHighlightKey<Key extends string> = Key | typeof emptySelectionKey;

type SelectSourceProps<Key extends string, SectionKey extends string> =
  SelectCollectionSource<Key, SectionKey>;

type SelectSelectionProps<Key extends string> =
  | Readonly<{
      selectedKey: Key | null;
      defaultSelectedKey?: never;
      onSelectionChange(key: Key | null): void;
    }>
  | Readonly<{
      selectedKey?: never;
      defaultSelectedKey?: Key | null;
      onSelectionChange?: (key: Key | null) => void;
    }>;

type SelectOpenProps =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(open: boolean, reason: SelectOpenChangeReason): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
    }>;

type SelectLabelProps =
  | Readonly<{ label: string; accessibilityLabel?: string }>
  | Readonly<{ label?: never; accessibilityLabel: string }>;

type SelectBaseProps<Key extends string> = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "aria-label"
  | "children"
  | "defaultValue"
  | "onChange"
  | "role"
  | "value"
> &
  Readonly<{
    description?: ReactNode;
    error?: ReactNode;
    /** Localized text shown when no item is selected. */
    placeholder: string;
    /** Localized label for the nullable empty-selection option. */
    emptySelectionLabel: string;
    asyncState?: AsyncCollectionState;
    selectedItem?: SelectItemDescriptor<Key>;
    disallowEmptySelection?: boolean;
    loop?: boolean;
    /** Locks interaction without removing the trigger from the focus order. */
    busy?: boolean;
    readOnly?: boolean;
    required?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    fieldClassName?: string;
    locale?: string | readonly string[];
    renderLeading?: (
      item: SelectItemDescriptor<Key> | null,
      appearance: SelectLeadingRenderProps,
    ) => ReactNode;
    renderOptionLeading?: (
      item: SelectItemDescriptor<Key>,
      appearance: SelectOptionLeadingRenderProps,
    ) => ReactNode;
  }>;

export type SelectProps<
  Key extends string = string,
  SectionKey extends string = string,
> = SelectBaseProps<Key> &
  SelectSourceProps<Key, SectionKey> &
  SelectSelectionProps<Key> &
  SelectOpenProps &
  SelectLabelProps;

function SelectInner<Key extends string, SectionKey extends string>(
  props: SelectProps<Key, SectionKey>,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    items,
    sections,
    label,
    accessibilityLabel,
    description,
    error,
    placeholder,
    emptySelectionLabel,
    asyncState = { status: "idle" },
    selectedItem,
    disallowEmptySelection = selectBehaviorDefaults.disallowEmptySelection,
    loop = selectBehaviorDefaults.loop,
    busy = false,
    readOnly = false,
    size = selectRecipe.defaults.size,
    density = selectRecipe.defaults.density,
    fieldClassName,
    locale,
    renderLeading,
    renderOptionLeading,
    className,
    id: idProp,
    name,
    disabled = false,
    required = false,
    selectedKey: selectedKeyProp,
    defaultSelectedKey,
    onSelectionChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    ...buttonProps
  } = props;
  const source: SelectCollectionSource<Key, SectionKey> = sections === undefined
    ? { items: items ?? [] }
    : { sections };
  validateCollection(source);
  const accessibleName = resolveControlAccessibleName(
    label,
    accessibilityLabel,
    "Select",
  );
  if (placeholder.trim().length === 0) throw new TypeError("Select placeholder must not be empty");
  if (emptySelectionLabel.trim().length === 0) {
    throw new TypeError("Select emptySelectionLabel must not be empty");
  }
  const flatItems = source.sections
    ? source.sections.flatMap((section) => section.items)
    : source.items;
  if (
    flatItems.length === 0 &&
    (asyncState.status === "idle" || asyncState.status === "loadingMore")
  ) {
    throw new TypeError("Select requires options unless its async state is transient or empty");
  }
  const initialSelectionRef = useRef<Readonly<{ value: Key | null }> | null>(null);
  if (initialSelectionRef.current === null) {
    initialSelectionRef.current = {
      value: reconcileSelectSelection(
        source,
        selectedKeyProp ?? defaultSelectedKey ?? null,
        {
        disallowEmptySelection,
        asyncState,
        ...(selectedItem === undefined ? {} : { selectedItem }),
        },
      ),
    };
  }
  const [storedSelectedKey, setSelectedKey] = useControllableState<Key | null>({
    ...(selectedKeyProp === undefined ? {} : { value: selectedKeyProp }),
    defaultValue: initialSelectionRef.current.value,
    ...(onSelectionChange === undefined ? {} : { onChange: onSelectionChange }),
  });
  const reconciledSelectedKey = reconcileSelectSelection(source, storedSelectedKey, {
    disallowEmptySelection,
    asyncState,
    ...(selectedItem === undefined ? {} : { selectedItem }),
  });
  const reconciliationRequestRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (storedSelectedKey === reconciledSelectedKey) {
      reconciliationRequestRef.current = undefined;
      return;
    }
    const token = `${storedSelectedKey ?? "<empty>"}->${reconciledSelectedKey ?? "<empty>"}`;
    if (reconciliationRequestRef.current === token) return;
    reconciliationRequestRef.current = token;
    setSelectedKey(reconciledSelectedKey);
  }, [reconciledSelectedKey, setSelectedKey, storedSelectedKey]);
  const resolvedSelectedItem = resolveSelectSelectedItem(
    source,
    reconciledSelectedKey,
    selectedItem !== undefined && selectedItem.id === reconciledSelectedKey
      ? selectedItem
      : undefined,
  );

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const openControlled = openProp !== undefined;
  const open = openControlled ? openProp : internalOpen;
  const pendingOpenRequestRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (pendingOpenRequestRef.current === open) pendingOpenRequestRef.current = undefined;
  }, [open]);
  const changeOpen = useCallback(
    (nextOpen: boolean, reason: SelectOpenChangeReason) => {
      if (nextOpen === open || pendingOpenRequestRef.current === nextOpen) return;
      pendingOpenRequestRef.current = nextOpen;
      if (!openControlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen, reason);
      if (openControlled && nextOpen) {
        queueMicrotask(() => {
          if (pendingOpenRequestRef.current === true) {
            pendingOpenRequestRef.current = undefined;
          }
        });
      }
    },
    [onOpenChange, open, openControlled],
  );

  const generatedId = useId().replaceAll(":", "");
  const controlId = idProp ?? `hjm-select-${generatedId}`;
  const listboxId = `${controlId}-listbox`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const optionId = (key: Key) =>
    `${controlId}-option-${flatItems.findIndex((item) => item.id === key)}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef(new Map<SelectHighlightKey<Key>, HTMLDivElement>());
  const typeaheadRef = useRef({ value: "", time: 0 });
  const restoreFocusRef = useRef(false);
  const showOptions = asyncState.status === "idle" || asyncState.status === "loadingMore";
  const emptySelectionAvailable = !disallowEmptySelection && showOptions;
  const selectionItemInSource = resolveCollectionItem(source, reconciledSelectedKey);
  const initialHighlight = selectionItemInSource && !selectionItemInSource.disabled
    ? selectionItemInSource.id
    : reconciledSelectedKey === null && emptySelectionAvailable
      ? emptySelectionKey
      : getCollectionNavigationTarget(source, null, "first", loop) ?? null;
  const [highlightedKey, setHighlightedKey] = useState<SelectHighlightKey<Key> | null>(
    initialHighlight,
  );
  const highlightedItem = showOptions && highlightedKey !== emptySelectionKey
    ? resolveCollectionItem(source, highlightedKey)
    : null;
  const activeKey: SelectHighlightKey<Key> | null = highlightedItem && !highlightedItem.disabled
    ? highlightedItem.id
    : highlightedKey === emptySelectionKey && emptySelectionAvailable
      ? emptySelectionKey
      : null;
  const activeOptionId = activeKey === emptySelectionKey
    ? `${controlId}-option-empty`
    : activeKey === null
      ? undefined
      : optionId(activeKey);

  useEffect(() => {
    if (!open) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        queueMicrotask(() => triggerRef.current?.focus());
      }
      return;
    }
    if (activeKey === null && showOptions) setHighlightedKey(initialHighlight);
  }, [activeKey, initialHighlight, open, showOptions]);
  useEffect(() => {
    if (open && activeKey !== null) {
      optionRefs.current.get(activeKey)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeKey, open]);
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        changeOpen(false, "outside");
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [changeOpen, open]);

  const openWithIntent = (intent: "first" | "last" = "first") => {
    if (disabled || busy || readOnly) return;
    const selectedInSource = resolveCollectionItem(source, reconciledSelectedKey);
    const target = selectedInSource && !selectedInSource.disabled
      ? selectedInSource.id
      : reconciledSelectedKey === null && emptySelectionAvailable
        ? emptySelectionKey
        : intent === "last" && emptySelectionAvailable
          ? emptySelectionKey
          : getCollectionNavigationTarget(source, null, intent, loop) ?? null;
    setHighlightedKey(target);
    changeOpen(true, "keyboard");
  };
  const moveHighlight = (intent: "next" | "previous" | "first" | "last") => {
    const enabledKeys = flatItems
      .filter((item) => !item.disabled)
      .map((item) => item.id);
    const firstKey = enabledKeys[0];
    const lastKey = enabledKeys.at(-1);
    if (emptySelectionAvailable) {
      if (intent === "last") {
        setHighlightedKey(emptySelectionKey);
        return;
      }
      if (activeKey === emptySelectionKey) {
        if (intent === "previous" && lastKey !== undefined) setHighlightedKey(lastKey);
        else if (
          ((intent === "next" && loop) || intent === "first") &&
          firstKey !== undefined
        ) {
          setHighlightedKey(firstKey);
        }
        return;
      }
      if (intent === "next" && activeKey === lastKey) {
        setHighlightedKey(emptySelectionKey);
        return;
      }
      if (intent === "previous" && activeKey === firstKey && loop) {
        setHighlightedKey(emptySelectionKey);
        return;
      }
    }
    const target = getCollectionNavigationTarget(
      source,
      activeKey === emptySelectionKey ? null : activeKey,
      intent,
      loop,
    );
    if (target !== undefined) setHighlightedKey(target);
  };
  const commit = (key: SelectHighlightKey<Key>) => {
    if (key === emptySelectionKey) {
      if (disabled || readOnly || !emptySelectionAvailable) return;
      setSelectedKey(null);
      restoreFocusRef.current = true;
      changeOpen(false, "selection");
      return;
    }
    const item = resolveCollectionItem(source, key);
    if (
      !item ||
      item.disabled ||
      disabled ||
      busy ||
      readOnly ||
      asyncState.status === "loading"
    ) return;
    setSelectedKey(key);
    restoreFocusRef.current = true;
    changeOpen(false, "selection");
  };
  const runTypeahead = (key: string) => {
    const now = Date.now();
    const previous = now - typeaheadRef.current.time < 500
      ? typeaheadRef.current.value
      : "";
    const combined = `${previous}${key}`;
    const query = new Set(combined.toLocaleLowerCase()).size === 1 ? key : combined;
    typeaheadRef.current = { value: combined, time: now };
    const match = getCollectionTypeaheadMatch(source, query, {
      startsAfterKey: activeKey === emptySelectionKey
        ? reconciledSelectedKey
        : activeKey ?? reconciledSelectedKey,
      ...(locale === undefined ? {} : { locale }),
    });
    if (match !== undefined) {
      setHighlightedKey(match);
      if (!open) changeOpen(true, "keyboard");
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || busy || readOnly) return;
    const navigationIntent = getCollectionNavigationIntent(
      event.key as WebKeyboardKey,
    );
    if (navigationIntent !== undefined) {
      event.preventDefault();
      if (!open) {
        openWithIntent(
          navigationIntent === "previous" || navigationIntent === "last"
            ? "last"
            : "first",
        );
      }
      else moveHighlight(navigationIntent);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) openWithIntent();
      else if (activeKey !== null) commit(activeKey);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      restoreFocusRef.current = true;
      changeOpen(false, "escape");
    } else if (event.key === "Tab" && open) {
      changeOpen(false, "blur");
    } else if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      runTypeahead(event.key);
    }
  };
  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
    queueMicrotask(() => {
      if (
        open &&
        document.activeElement instanceof Node &&
        !rootRef.current?.contains(document.activeElement)
      ) changeOpen(false, "blur");
    });
  };
  const describedBy = error ? errorId : description ? descriptionId : undefined;

  const renderOption = (item: SelectItemDescriptor<Key>) => {
    const selected = item.id === reconciledSelectedKey;
    const active = item.id === activeKey;
    const leadingSize = iconRecipe.sizes[selectRecipe.optionLeading.glyph];
    const leading = renderOptionLeading?.(item, {
      selected,
      highlighted: active,
      disabled: item.disabled ?? false,
      color: "currentColor",
      size: leadingSize,
      glyphSize: leadingSize,
    });
    return (
      <div
        key={item.id}
        ref={(node) => {
          if (node) optionRefs.current.set(item.id, node);
          else optionRefs.current.delete(item.id);
        }}
        id={optionId(item.id)}
        role="option"
        className="hjm-select__option"
        aria-selected={selected}
        aria-disabled={item.disabled || undefined}
        data-state={item.disabled ? "disabled" : selected ? "selected" : "idle"}
        data-active={active || undefined}
        onMouseDown={(event) => event.preventDefault()}
        onMouseMove={() => {
          if (!item.disabled) setHighlightedKey(item.id);
        }}
        onClick={() => commit(item.id)}
      >
        {leading ? (
          <span className="hjm-select__option-leading" aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <span className="hjm-select__option-copy">
          <span>{item.label}</span>
          {item.description ? (
            <span className="hjm-select__option-description">{item.description}</span>
          ) : null}
        </span>
        {selected ? <span className="hjm-select__check" aria-hidden="true">✓</span> : null}
      </div>
    );
  };

  const triggerLeadingSize = iconRecipe.sizes[selectRecipe.sizes[size].glyph];
  const triggerLeading = renderLeading?.(resolvedSelectedItem, {
    color: "currentColor",
    size: triggerLeadingSize,
    glyphSize: triggerLeadingSize,
  });

  return (
    <div
      ref={rootRef}
      className={classNames("hjm-field hjm-select", fieldClassName)}
      data-state={disabled ? "disabled" : error ? "invalid" : open ? "focused" : "idle"}
      data-size={size}
      data-density={density}
      data-async-state={asyncState.status}
      data-busy={busy || undefined}
    >
      {label !== undefined ? (
        <label className="hjm-field__label" htmlFor={controlId}>
          {label}{required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      <div className="hjm-select__anchor">
        <button
          {...buttonProps}
          ref={(node) => {
            triggerRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          id={controlId}
          type="button"
          role="combobox"
          className={classNames("hjm-field__control hjm-select__trigger", className)}
          disabled={disabled}
          aria-disabled={busy || undefined}
          aria-label={accessibilityLabel ?? (label === undefined ? accessibleName : undefined)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-busy={busy || asyncState.status === "loading" || asyncState.status === "loadingMore" || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-readonly={readOnly || undefined}
          aria-required={required || undefined}
          onFocus={onFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented || disabled || busy || readOnly) return;
            if (open) changeOpen(false, "trigger");
            else openWithIntent();
          }}
        >
          {triggerLeading ? (
            <span className="hjm-select__leading" aria-hidden="true">
              {triggerLeading}
            </span>
          ) : null}
          <span
            className="hjm-select__value"
            data-state={resolvedSelectedItem ? "selected" : "placeholder"}
          >
            {resolvedSelectedItem?.label ?? placeholder}
          </span>
          {busy ? (
            <span className="hjm-select__busy-indicator" aria-hidden="true" />
          ) : (
            <span className="hjm-select__indicator" aria-hidden="true">⌄</span>
          )}
        </button>
        {open ? (
          <div
            id={listboxId}
            role="listbox"
            aria-label={accessibleName}
            className="hjm-select__listbox"
          >
            {asyncState.status !== "idle" ? (
              <div
                className="hjm-select__message"
                role={asyncState.status === "error" ? "alert" : "status"}
              >
                {asyncState.message}
              </div>
            ) : null}
            {showOptions ? (
              source.sections ? source.sections.map((section) => {
                const sectionLabelId = `${controlId}-section-${section.id}`;
                return (
                  <div
                    key={section.id}
                    role="group"
                    aria-labelledby={section.label ? sectionLabelId : undefined}
                    aria-label={section.label ? undefined : section.accessibilityLabel}
                    className="hjm-select__section"
                  >
                    {section.label ? (
                      <div id={sectionLabelId} className="hjm-select__section-label">
                        {section.label}
                      </div>
                    ) : null}
                    {section.items.map(renderOption)}
                  </div>
                );
              }) : source.items.map(renderOption)
            ) : null}
            {!disallowEmptySelection && showOptions ? (
              <div
                ref={(node) => {
                  if (node) optionRefs.current.set(emptySelectionKey, node);
                  else optionRefs.current.delete(emptySelectionKey);
                }}
                id={`${controlId}-option-empty`}
                role="option"
                className="hjm-select__option hjm-select__option--empty"
                aria-selected={reconciledSelectedKey === null}
                data-state={reconciledSelectedKey === null ? "selected" : "idle"}
                data-active={activeKey === emptySelectionKey || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setHighlightedKey(emptySelectionKey)}
                onClick={() => commit(emptySelectionKey)}
              >
                {emptySelectionLabel}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {description && !error ? (
        <div id={descriptionId} className="hjm-field__description">{description}</div>
      ) : null}
      {error ? <div id={errorId} className="hjm-field__error">{error}</div> : null}
      {name ? <input type="hidden" name={name} value={reconciledSelectedKey ?? ""} /> : null}
    </div>
  );
}

export const Select = forwardRef(SelectInner) as <
  Key extends string = string,
  SectionKey extends string = string,
>(
  props: SelectProps<Key, SectionKey> & RefAttributes<HTMLButtonElement>,
) => ReactElement | null;
