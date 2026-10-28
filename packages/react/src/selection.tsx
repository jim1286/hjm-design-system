"use client";

import { Grid } from "./layout.js";
import type { GridDescriptor } from "@hjmds/design-contracts/grid";
import { Button } from "./actions.js";
import { useDesignProfileDefaults } from "./internal.js";
import {
  chipRecipe,
  iconRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  selectionGroupRecipe,
  switchRecipe,
  type SegmentedControlSize,
  type SelectionControlPresentation,
  type SelectionControlSize,
  type SelectionGroupOrientation,
  type SelectionGroupOverflow,
  type SelectionGroupPresentation,
  type SwitchSize,
  type SwitchPresentation,
} from "@hjmds/design-contracts/recipes";

export type { SwitchSize, SwitchPresentation };
import {
  resolveControlAccessibleName,
  reconcileCheckboxSelection,
  reconcileRadioSelection,
  resolveInitialRadioValue,
  toggleCheckboxSelection,
  validateCheckboxSelection,
  validateRadioSelection,
  type CheckboxGroupSelection,
  type SelectionItemDescriptor,
} from "@hjmds/design-contracts/behaviors";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { FieldError } from "./internal/field-error.js";

export type ChoiceLeadingRenderProps = Readonly<{
  selected: boolean;
  color: "currentColor";
  size: number;
}>;

type ChipBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onChange" | "onClick" | "size"
> &
  Readonly<{
    label: ReactNode;
    size?: keyof typeof chipRecipe.sizes;
    leading?: ReactNode;
    trailing?: ReactNode;
    renderSelectionIndicator?: (props: Readonly<{
      selected: boolean;
      color: "currentColor";
      size: number;
    }>) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

type ActionChipProps = Readonly<{
  selectionMode?: "action";
  selected?: never;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelectedChange?: never;
}>;

type SelectionChipProps = Readonly<{
  selectionMode: "single" | "multiple";
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
}>;

export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);

/** Action/filter chip with explicit selection semantics and no hidden state. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    label,
    size = chipRecipe.defaults.size,
    leading,
    trailing,
    renderSelectionIndicator,
    selectionMode = "action",
    selected,
    onSelectedChange,
    onPress,
    disabled,
    className,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  const selectable = selectionMode !== "action";
  const active = selectable && selected === true;
  return (
    <button
      {...props}
      style={{ ...style, ...layoutStyle }}
      ref={ref}
      aria-checked={selectable ? active : undefined}
      className={classNames("hjm-chip", className)}
      data-selected={active || undefined}
      data-size={size}
      disabled={disabled}
      onClick={(event) => {
        onPress?.(event);
        if (!event.defaultPrevented && selectable) onSelectedChange?.(!active);
      }}
      role={selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : undefined}
      type="button"
    >
      {active ? (
        <span aria-hidden="true" className="hjm-chip__indicator">
          {renderSelectionIndicator?.({
            selected: true,
            color: "currentColor",
            size: iconRecipe.sizes[chipRecipe.selectionIndicator.glyph],
          }) ?? "✓"}
        </span>
      ) : null}
      {leading === undefined ? null : <span aria-hidden="true" className="hjm-chip__leading">{leading}</span>}
      <span className="hjm-chip__label">{label}</span>
      {trailing === undefined ? null : <span aria-hidden="true" className="hjm-chip__trailing">{trailing}</span>}
    </button>
  );
});

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "defaultChecked" | "onChange" | "children" | "size"
> &
  Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    renderLeading?: (appearance: ChoiceLeadingRenderProps) => ReactNode;
    /**
     * Canonical layout-only placement on the root `<label>`. `style` keeps going
     * to the native input, where it always went, so existing callers do not move.
     */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      checked: checkedProp,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      onChange,
      disabled,
      readOnly = false,
      presentation = selectionControlRecipe.defaults.presentation,
      size = selectionControlRecipe.defaults.size,
      renderLeading,
      className,
      onClick,
      layoutStyle,
      ...props
    },
    forwardedRef,
  ) {
    const [checked, setChecked] = useControllableState({
      ...(checkedProp === undefined ? {} : { value: checkedProp }),
      defaultValue: defaultChecked,
      ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
    });
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const selected = checked || indeterminate;
    const leadingSize = iconRecipe.sizes[selectionControlRecipe.leading.size];

    return (
      <label
        className={classNames("hjm-choice", className)}
        style={layoutStyle}
        data-kind="checkbox"
        data-state={indeterminate ? "mixed" : checked ? "checked" : "unchecked"}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-presentation={presentation}
        data-size={size}
      >
        <input
          {...props}
          ref={composeRefs(inputRef, forwardedRef)}
          className="hjm-choice__input"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          aria-checked={indeterminate ? "mixed" : checked}
          onClick={(event) => {
            onClick?.(event);
            if (readOnly) event.preventDefault();
          }}
          onChange={(event) => {
            if (!readOnly) setChecked(event.currentTarget.checked);
            onChange?.(event);
          }}
        />
        <span className="hjm-choice__indicator" aria-hidden="true" />
        {renderLeading ? (
          <span className="hjm-choice__leading" aria-hidden="true">
            {renderLeading({
              selected,
              color: "currentColor",
              size: leadingSize,
            })}
          </span>
        ) : null}
        <span className="hjm-choice__copy">
          <span>{label}</span>
          {description ? <span className="hjm-choice__description">{description}</span> : null}
        </span>
      </label>
    );
  },
);

type RadioState =
  | Readonly<{
      checked: boolean;
      defaultChecked?: never;
      onCheckedChange(checked: true): void;
    }>
  | Readonly<{
      checked?: never;
      defaultChecked?: boolean;
      onCheckedChange?: (checked: true) => void;
    }>;

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "defaultChecked" | "onChange" | "children" | "size"
> &
  RadioState &
  Readonly<{
    label: ReactNode;
    description?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    presentation?: SelectionControlPresentation;
    size?: SelectionControlSize;
    renderLeading?: (appearance: ChoiceLeadingRenderProps) => ReactNode;
    /**
     * Canonical layout-only placement on the root `<label>`. `style` keeps going
     * to the native input, where it always went, so existing callers do not move.
     */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/** Native radio item primitive. Use RadioGroup when the renderer owns group state. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    description,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    onChange,
    disabled,
    readOnly = false,
    presentation = selectionControlRecipe.defaults.presentation,
    size = selectionControlRecipe.defaults.size,
    renderLeading,
    className,
    onClick,
    layoutStyle,
    ...props
  },
  ref,
) {
  const [checked, setChecked] = useControllableState({
    ...(checkedProp === undefined ? {} : { value: checkedProp }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined
      ? {}
      : { onChange: (next: boolean) => next && onCheckedChange(true) }),
  });
  return (
    <label
      className={classNames("hjm-choice", className)}
      style={layoutStyle}
      data-kind="radio"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-presentation={presentation}
      data-size={size}
    >
      <input
        {...props}
        ref={ref}
        className="hjm-choice__input"
        type="radio"
        checked={checked}
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (readOnly) event.preventDefault();
        }}
        onChange={(event) => {
          if (!readOnly && event.currentTarget.checked) setChecked(true);
          onChange?.(event);
        }}
      />
      <span className="hjm-choice__indicator" aria-hidden="true" />
      {renderLeading ? (
        <span className="hjm-choice__leading" aria-hidden="true">
          {renderLeading({
            selected: checked,
            color: "currentColor",
            size: iconRecipe.sizes[selectionControlRecipe.leading.size],
          })}
        </span>
      ) : null}
      <span className="hjm-choice__copy">
        <span>{label}</span>
        {description ? <span className="hjm-choice__description">{description}</span> : null}
      </span>
    </label>
  );
});

/**
 * Minimal horizontal scroll that shows `option` inside `viewport` with `inset` room around it. Shared by
 * SegmentedControl and CheckboxGroup `overflow="scroll"`; rect deltas work in both reading directions.
 */
function revealInScroller(viewport: HTMLElement, option: Element, inset = 0): void {
  const frame = viewport.getBoundingClientRect(), bounds = option.getBoundingClientRect();
  const delta = bounds.left - inset < frame.left ? bounds.left - inset - frame.left
    : bounds.right + inset > frame.right ? bounds.right + inset - frame.right : 0;
  if (delta) viewport.scrollBy({ left: delta, behavior: "instant" });
}

function ChoiceItems({ grid, className, children }: Readonly<{ grid: GridDescriptor | undefined; className: string; children: ReactNode }>) {
  return grid ? <Grid {...grid}>{children}</Grid> : <div className={className}>{children}</div>;
}

export type CheckboxGroupItem<Key extends string = string> =
  SelectionItemDescriptor<Key>;

type CheckboxGroupBaseProps<Key extends string> = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "defaultValue" | "onChange" | "value"
> &
  Readonly<{
    items: readonly CheckboxGroupItem<Key>[];
    label?: string;
    accessibilityLabel?: string;
    description?: ReactNode;
    error?: ReactNode;
    orientation?: SelectionGroupOrientation;
    /** Equal-width responsive options; uses the shared Grid contract instead of intrinsic row widths. */
    grid?: GridDescriptor;
    presentation?: SelectionGroupPresentation;
    /**
     * Chip line overflow, the same meaning as SegmentedControl `overflow`: `wrap` (default) breaks onto more lines,
     * `scroll` keeps one horizontal line and scrolls a focused chip into view. Requires `presentation="chips"`
     * without `grid`.
     */
    overflow?: SelectionGroupOverflow;
    size?: SelectionControlSize;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
    renderLeading?: (
      item: CheckboxGroupItem<Key>,
      appearance: ChoiceLeadingRenderProps,
    ) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export type CheckboxGroupProps<Key extends string = string> =
  CheckboxGroupBaseProps<Key> & CheckboxGroupSelection<Key>;

function CheckboxGroupInner<Key extends string>(
  {
    items,
    label,
    accessibilityLabel,
    description,
    error,
    orientation = selectionGroupRecipe.defaults.orientation,
    grid,
    presentation = selectionGroupRecipe.defaults.presentation,
    overflow = selectionGroupRecipe.overflow.default,
    size = selectionControlRecipe.defaults.size,
    name,
    required = false,
    readOnly = false,
    renderLeading,
    value: valueProp,
    defaultValue,
    onValueChange,
    disabled,
    className,
    layoutStyle,
    style,
    ...props
  }: CheckboxGroupProps<Key>,
  ref: React.ForwardedRef<HTMLFieldSetElement>,
) {
  const resolvedLabel = resolveControlAccessibleName(
    label,
    accessibilityLabel,
    "CheckboxGroup",
  );
  if (overflow === "scroll" && (presentation !== "chips" || grid)) {
    throw new TypeError('CheckboxGroup overflow="scroll" requires presentation="chips" without grid');
  }
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useControllableState<ReadonlySet<Key>>({
    ...(valueProp === undefined ? {} : { value: valueProp }),
    defaultValue: defaultValue ?? new Set<Key>(),
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const controlled = valueProp !== undefined;
  if (controlled) validateCheckboxSelection(items, value);
  const reconciledValue = controlled
    ? value
    : reconcileCheckboxSelection(items, value);
  useEffect(() => {
    if (!controlled && reconciledValue !== value) setValue(reconciledValue);
  }, [controlled, reconciledValue, setValue, value]);
  const generatedId = useId().replaceAll(":", "");
  const descriptionId = `${generatedId}-checkbox-group-description`;
  const errorId = `${generatedId}-checkbox-group-error`;
  return (
    <fieldset
      {...props}
      ref={ref}
      style={{ ...style, ...layoutStyle }}
      className={classNames("hjm-checkbox-group", className)}
      data-orientation={orientation}
      data-presentation={presentation}
      data-overflow={presentation === "chips" ? overflow : undefined}
      onFocusCapture={(event) => {
        props.onFocusCapture?.(event);
        const option = (event.target as HTMLElement).closest(".hjm-choice");
        if (overflow === "scroll" && scrollerRef.current && option) revealInScroller(scrollerRef.current, option, selectionGroupRecipe.overflow.scrollInset);
      }}
      data-size={size}
      data-state={error ? "invalid" : disabled ? "disabled" : "idle"}
      disabled={disabled}
      aria-label={accessibilityLabel}
      aria-describedby={error ? errorId : description ? descriptionId : undefined}
      aria-required={required || undefined}
      aria-readonly={readOnly || undefined}
    >
      <legend className={label === undefined ? "hjm-visually-hidden" : undefined}>
        {label ?? resolvedLabel}
      </legend>
      {description && !error ? (
        <div id={descriptionId} className="hjm-field__description">{description}</div>
      ) : null}
      {wrapChipScroller(overflow === "scroll", scrollerRef, <ChoiceItems grid={grid} className="hjm-checkbox-group__items">
        {items.map((item) => {
          const checked = reconciledValue.has(item.id);
          return (
            <label
              key={item.id}
              className="hjm-choice"
              data-kind="checkbox"
              data-state={checked ? "checked" : "unchecked"}
              data-disabled={item.disabled || undefined}
              data-readonly={readOnly || undefined}
              data-presentation={presentation}
              data-size={size}
            >
              <input
                className="hjm-choice__input"
                type="checkbox"
                name={name}
                value={item.id}
                checked={checked}
                disabled={item.disabled}
                aria-readonly={readOnly || undefined}
                onChange={() => {
                  if (!readOnly) {
                    setValue(toggleCheckboxSelection(items, reconciledValue, item.id));
                  }
                }}
                onClick={readOnly ? (event) => event.preventDefault() : undefined}
              />
              <span className="hjm-choice__indicator" aria-hidden="true" />
              {renderLeading ? (
                <span className="hjm-choice__leading" aria-hidden="true">
                  {renderLeading(item, {
                    selected: checked,
                    color: "currentColor",
                    size: iconRecipe.sizes[selectionControlRecipe.leading.size],
                  })}
                </span>
              ) : null}
              <span className="hjm-choice__copy">
                <span>{item.label}</span>
                {item.description ? (
                  <span className="hjm-choice__description">{item.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </ChoiceItems>)}
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

/** The scrollport is separate from the items row so its inset keeps focus rings and chip hit slop unclipped. */
function wrapChipScroller(scroll: boolean, ref: React.RefObject<HTMLDivElement | null>, items: ReactNode): ReactNode {
  return scroll ? <div ref={ref} className="hjm-checkbox-group__scroller">{items}</div> : items;
}

export const CheckboxGroup = forwardRef(CheckboxGroupInner) as <Key extends string = string>(
  props: CheckboxGroupProps<Key> & RefAttributes<HTMLFieldSetElement>,
) => ReactElement;

export type RadioGroupItem = Readonly<{
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Independent sibling action; activating it never selects the option. */
  action?: Readonly<{ label: string; accessibilityLabel?: string; onAction: () => void; disabled?: boolean }>;
}>;

type RadioGroupLabelProps =
  | Readonly<{ label: ReactNode; accessibilityLabel?: string }>
  | Readonly<{ label?: never; accessibilityLabel: string }>;

export type RadioGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "defaultValue" | "onChange" | "value"
> &
  RadioGroupLabelProps &
  Readonly<{
    items: readonly RadioGroupItem[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    orientation?: SelectionGroupOrientation;
    /** One horizontal line of cards or chips, without grid. */
    overflow?: SelectionGroupOverflow;
    /** Equal-width responsive options; uses the shared Grid contract instead of intrinsic row widths. */
    grid?: GridDescriptor;
    presentation?: SelectionGroupPresentation;
    size?: SelectionControlSize;
    /** Hide the decorative dot when a product preview already communicates the choice. */
    indicator?: "default" | "none";
    description?: ReactNode;
    error?: ReactNode;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
    /** Visual preview only; the item label remains the accessible name. */
    renderLabel?: (item: RadioGroupItem) => ReactNode;
    renderLeading?: (
      item: RadioGroupItem,
      appearance: ChoiceLeadingRenderProps,
    ) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function validateItems(
  component: "RadioGroup" | "SegmentedControl",
  items: readonly Readonly<{ value: string }>[] ,
): void {
  if (items.length === 0) {
    throw new TypeError(`${component} requires at least one item`);
  }
  const values = new Set<string>();
  for (const item of items) {
    if (item.value.trim().length === 0) {
      throw new TypeError(`${component} item value must not be empty`);
    }
    if (values.has(item.value)) {
      throw new TypeError(`Duplicate ${component} item value: ${item.value}`);
    }
    values.add(item.value);
  }
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      label,
      accessibilityLabel,
      items,
      value: valueProp,
      defaultValue = null,
      onValueChange,
      orientation = selectionGroupRecipe.defaults.orientation,
      grid,
      overflow = selectionGroupRecipe.overflow.default,
      presentation = selectionGroupRecipe.defaults.presentation,
      size = selectionControlRecipe.defaults.size,
      description,
      error,
      name,
      required = false,
      readOnly = false,
      indicator = "default",
      renderLeading,
      renderLabel,
      disabled,
      className,
      layoutStyle,
      style,
      ...props
    },
    ref,
  ) {
    validateItems("RadioGroup", items);
    if (
      accessibilityLabel !== undefined &&
      accessibilityLabel.trim().length === 0
    ) throw new TypeError("RadioGroup accessibilityLabel must not be empty");
    const resolvedLabel = label === undefined || label === null
      ? resolveControlAccessibleName(undefined, accessibilityLabel, "RadioGroup")
      : label;
    const descriptors = items.map((item) => ({
      id: item.value,
      label: typeof item.label === "string" ? item.label : item.value,
      ...(typeof item.description === "string"
        ? { description: item.description }
        : {}),
      ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
    }));
    const initialValueRef = useRef<Readonly<{ value: string | null }> | null>(null);
    if (initialValueRef.current === null) {
      initialValueRef.current = {
        value: resolveInitialRadioValue(descriptors, defaultValue, required),
      };
    }
    const generatedName = useId().replaceAll(":", "");
    const [storedValue, setValue] = useControllableState<string | null>({
      ...(valueProp === undefined ? {} : { value: valueProp }),
      defaultValue: initialValueRef.current.value,
      ...(onValueChange === undefined
        ? {}
        : {
            onChange: (next: string | null) => {
              if (next !== null) onValueChange(next);
            },
          }),
    });
    const controlled = valueProp !== undefined;
    if (controlled) validateRadioSelection(descriptors, storedValue);
    const value = controlled
      ? storedValue
      : reconcileRadioSelection(descriptors, storedValue, required);
    useEffect(() => {
      if (!controlled && value !== storedValue) setValue(value);
    }, [controlled, setValue, storedValue, value]);
    if (overflow === "scroll" && (grid || !["card", "chips"].includes(presentation))) {
      throw new TypeError('RadioGroup overflow="scroll" requires card or chips without grid');
    }
    const scrollerRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const scroller = scrollerRef.current;
      const option = scroller?.querySelector('[data-state="checked"]');
      if (overflow === "scroll" && scroller && option) revealInScroller(scroller, option, selectionGroupRecipe.overflow.scrollInset);
    }, [value, items, overflow]);
    const descriptionId = `${generatedName}-radio-description`;
    const errorId = `${generatedName}-radio-error`;
    return (
      <fieldset
        {...props}
        ref={ref}
        style={{ ...style, ...layoutStyle }}
        className={classNames("hjm-radio-group", className)}
        data-orientation={orientation}
        data-overflow={overflow}
        onFocusCapture={event => {
          props.onFocusCapture?.(event);
          const option = (event.target as HTMLElement).closest(".hjm-choice");
          if (overflow === "scroll" && scrollerRef.current && option) revealInScroller(scrollerRef.current, option, selectionGroupRecipe.overflow.scrollInset);
        }}
        data-presentation={presentation}
        data-size={size}
        data-state={error ? "invalid" : disabled ? "disabled" : "idle"}
        disabled={disabled}
        aria-label={accessibilityLabel}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
        aria-readonly={readOnly || undefined}
      >
        <legend className={label == null ? "hjm-visually-hidden" : undefined}>
          {resolvedLabel}
        </legend>
        {description && !error ? <div id={descriptionId} className="hjm-field__description">{description}</div> : null}
        {wrapChipScroller(overflow === "scroll", scrollerRef, <ChoiceItems grid={grid} className="hjm-radio-group__items">
          {items.map((item) => {
            const selected = item.value === value;
            const choice = (
              <label
                key={item.value}
                className={item.action ? "hjm-choice__target" : "hjm-choice"}
                data-kind="radio"
                data-state={selected ? "checked" : "unchecked"}
                data-disabled={item.disabled || undefined}
                data-readonly={readOnly || undefined}
                data-presentation={presentation}
                data-size={size}
              >
                <input
                  className="hjm-choice__input"
                  type="radio"
                  name={name ?? generatedName}
                  value={item.value}
                  checked={selected}
                  disabled={item.disabled}
                  required={required}
                  {...(renderLabel && typeof item.label === "string" ? { "aria-label": item.label } : {})}
                  aria-readonly={readOnly || undefined}
                  onClick={readOnly ? (event) => event.preventDefault() : undefined}
                  onChange={() => {
                    if (!readOnly) setValue(item.value);
                  }}
                />
                {indicator === "default" ? <span className="hjm-choice__indicator" aria-hidden="true" /> : null}
                {renderLeading ? (
                  <span className="hjm-choice__leading" aria-hidden="true">
                    {renderLeading(item, {
                      selected,
                      color: "currentColor",
                      size: iconRecipe.sizes[selectionControlRecipe.leading.size],
                    })}
                  </span>
                ) : null}
                <span className="hjm-choice__copy">
                  <span>{renderLabel?.(item) ?? item.label}</span>
                  {item.description ? (
                    <span className="hjm-choice__description">{item.description}</span>
                  ) : null}
                </span>
              </label>
            );
            if (!item.action) return choice;
            // A button inside a label can activate its radio. Keep two independent targets
            // inside one recipe-owned frame, including when the group is read-only.
            return <div key={item.value} className="hjm-choice hjm-choice--with-action"
              data-kind="radio" data-state={selected ? "checked" : "unchecked"}
              data-disabled={item.disabled || undefined} data-readonly={readOnly || undefined}
              data-presentation={presentation} data-size={size}>
              {choice}
              <span className="hjm-choice__action"><Button tone="ghost" size="small"
                disabled={disabled || item.disabled || item.action.disabled}
                aria-label={item.action.accessibilityLabel} onClick={item.action.onAction}>{item.action.label}</Button></span>
            </div>;
          })}
        </ChoiceItems>)}
        <FieldError id={errorId} error={error} />
      </fieldset>
    );
  },
);

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "onChange" | "value"
> &
  Readonly<{
    label: ReactNode;
    /** Supporting copy is described separately from the stable accessible name. */
    description?: ReactNode;
    presentation?: SwitchPresentation;
    /** Hide repeated row copy visually while preserving the switch's accessible name. */
    labelVisibility?: "visible" | "hidden";
    checked?: boolean;
    defaultChecked?: boolean;
    /** Track and thumb geometry from `switchRecipe.sizes`. */
    size?: SwitchSize;
    onCheckedChange?: (checked: boolean) => void;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    labelVisibility = "visible",
    description,
    presentation = switchRecipe.presentationDefaults.web,
    checked: checkedProp,
    defaultChecked = false,
    size = switchRecipe.defaults.size,
    onCheckedChange,
    disabled,
    type = "button",
    className,
    onClick,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = description !== undefined && description !== null;
  const [checked, setChecked] = useControllableState({
    ...(checkedProp === undefined ? {} : { value: checkedProp }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
  });
  return (
    <button
      {...props}
      style={{ ...style, ...layoutStyle }}
      ref={ref}
      type={type}
      role="switch"
      className={classNames("hjm-switch", className)}
      data-size={size}
      data-presentation={presentation}
      data-label-visibility={labelVisibility}
      // Two-line row geometry only applies when the copy is on screen; a hidden label (ListRow trailing) keeps 44.
      data-two-line={(hasDescription && labelVisibility === "visible") || undefined}
      aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId)}
      aria-describedby={[props["aria-describedby"], hasDescription ? descriptionId : undefined].filter(Boolean).join(" ") || undefined}
      data-state={checked ? "checked" : "unchecked"}
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        setChecked((current) => !current);
        onClick?.(event);
      }}
    >
      <span className="hjm-switch__track" aria-hidden="true">
        <span className="hjm-switch__thumb" />
      </span>
      <span className={classNames("hjm-switch__copy", labelVisibility === "hidden" && "hjm-visually-hidden")}>
        <span id={labelId}
          className={classNames("hjm-switch__label", presentation === "row" && "hjm-text")}
          data-font-role={presentation === "row" ? "ui" : undefined}
          data-variant={presentation === "row" ? switchRecipe.rowLabelTextVariant : undefined}
        >{label}</span>
        {hasDescription ? <span id={descriptionId} className="hjm-switch__description">{description}</span> : null}
      </span>
    </button>
  );
});

export type SegmentedControlItem = Readonly<{
  value: string;
  label: ReactNode;
  /** Full spoken name when the visible label is abbreviated. */
  accessibilityLabel?: string;
  disabled?: boolean;
}>;

export type SegmentedControlProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "defaultValue" | "onChange" | "value"
> &
  Readonly<{
    label: string;
    items: readonly SegmentedControlItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SegmentedControlSize;
    presentation?: "connected" | "pills" | "text";
    /** Opaque primary/onPrimary selection, independent of presentation geometry. */
    selectionTone?: "neutral" | "brand";
    textEmphasis?: "regular" | "strong";
    /** Move only the selection artwork; radio semantics and hit targets stay fixed. */
    selectionMotion?: "none" | "slide";
    overflow?: "wrap" | "scroll";
    actions?: ReactNode;
    name?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const SegmentedControl = forwardRef<
  HTMLFieldSetElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    label,
    items,
    value: valueProp,
    defaultValue,
    onValueChange,
    size = segmentedControlRecipe.defaults.size,
    presentation = "connected",
    // 2026-10-23 user review: filled brand selection is the default; neutral remains opt-in.
    selectionTone = "brand",
    textEmphasis = "strong",
    selectionMotion: suppliedSelectionMotion,
    name,
    overflow = "wrap", actions,
    disabled = false,
    className,
    layoutStyle,
    style,
    ...props
  },
  ref,
) {
  const designProfile = useDesignProfileDefaults();
  const selectionMotion = presentation === "text" ? "none" : suppliedSelectionMotion ?? designProfile?.interactions.selectionMotion ?? "none";
  validateItems("SegmentedControl", items);
  const descriptors = items.map((item) => ({
    id: item.value,
    label: typeof item.label === "string" ? item.label : item.value,
    ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
  }));
  const initialValueRef = useRef<Readonly<{ value: string }> | null>(null);
  if (initialValueRef.current === null) {
    const initial = resolveInitialRadioValue(descriptors, defaultValue ?? null, true);
    if (initial === null) {
      throw new TypeError("SegmentedControl requires at least one enabled item");
    }
    initialValueRef.current = { value: initial };
  }
  const generatedName = useId();
  const [storedValue, setValue] = useControllableState({
    ...(valueProp === undefined ? {} : { value: valueProp }),
    defaultValue: initialValueRef.current.value,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const controlled = valueProp !== undefined;
  if (controlled) validateRadioSelection(descriptors, storedValue);
  const value = controlled
    ? storedValue
    : reconcileRadioSelection(descriptors, storedValue, true);
  if (value === null) {
    throw new TypeError("SegmentedControl requires at least one enabled item");
  }
  useEffect(() => {
    if (!controlled && value !== storedValue) setValue(value);
  }, [controlled, setValue, storedValue, value]);
  const trackRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const previousSelection = useRef<string | null>(null);
  useLayoutEffect(() => {
    const track = trackRef.current; const highlight = highlightRef.current;
    if (selectionMotion !== "slide" || !track || !highlight) { previousSelection.current = null; if (track) delete track.dataset.highlightReady; return; }
    const selected = Array.from(track.querySelectorAll<HTMLLabelElement>(".hjm-segmented__item")).find(item => item.dataset.state === "checked");
    if (!selected) return;
    const place = (animate: boolean) => {
      // CSS owns reduced motion (both provider and OS); no provider import is
      // added to this small selection entry just for decorative artwork.
      highlight.dataset.moving = animate && !document.hidden ? "true" : "false";
      const inset = presentation === "pills" ? Number.parseFloat(getComputedStyle(selected, "::before").top) || 0 : 0;
      Object.assign(highlight.style, { left: `${selected.offsetLeft}px`, top: `${selected.offsetTop + inset}px`, width: `${selected.offsetWidth}px`, height: `${selected.offsetHeight - inset * 2}px`, opacity: selected.dataset.disabled === "true" ? "0.5" : "1" });
      track.dataset.highlightReady = "true";
    };
    place(previousSelection.current !== null && previousSelection.current !== value);
    previousSelection.current = value;
    let bounds = `${selected.offsetLeft}:${selected.offsetTop}:${selected.offsetWidth}:${selected.offsetHeight}`;
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
      const next = `${selected.offsetLeft}:${selected.offsetTop}:${selected.offsetWidth}:${selected.offsetHeight}`;
      if (next !== bounds) { bounds = next; place(false); }
    });
    for (const item of track.querySelectorAll(".hjm-segmented__item")) observer?.observe(item);
    // Fixed-width RTL pills move when the track resizes without changing their
    // own size. Observing only items leaves the selected artwork at its old x.
    observer?.observe(track);
    const visibility = () => place(false);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [value, items, presentation, selectionMotion, disabled]);
  const revealOption = (option: Element | null) => {
    if (overflow !== "scroll" || !option) return;
    const viewport = trackRef.current?.parentElement;
    if (viewport) revealInScroller(viewport, option);
  };
  useLayoutEffect(() => { revealOption(trackRef.current?.querySelector('[data-state="checked"]') ?? null); }, [value, items, overflow]);
  const group = (
    <fieldset
      {...props}
      disabled={disabled}
      ref={ref}
      style={{ ...style, ...(actions == null ? layoutStyle : { flex: 1, minInlineSize: 0 }) }}
      className={classNames("hjm-segmented", className)}
      data-overflow={overflow}
      onFocusCapture={event => { props.onFocusCapture?.(event); revealOption((event.target as HTMLElement).closest(".hjm-segmented__item")); }}
      data-size={size}
      data-presentation={presentation}
      data-selection-tone={selectionTone}
      data-text-emphasis={presentation === "text" ? textEmphasis : undefined}
      role={presentation === "text" ? "radiogroup" : undefined}
    >
      <legend className="hjm-visually-hidden">{label}</legend>
      {/* The scroller is separate from the drawn track so a small track's options can extend their hit area past
          the track edge; a scrolling track would clip it (segmentedControlRecipe.sizes, 2026-10-17). */}
      <div className="hjm-segmented__scroller">
      <div className="hjm-segmented__items" ref={trackRef}>
        {selectionMotion === "slide" ? <span ref={highlightRef} className="hjm-segmented__highlight" aria-hidden="true" /> : null}
        {items.map((item) => (
          <label
            key={item.value}
            className="hjm-segmented__item"
            data-state={item.value === value ? "checked" : "unchecked"}
            // A disabled group must look disabled like Native; fieldset[disabled] alone only
            // blocked input and the per-item styling never saw it (2026-10-17 review).
            data-disabled={item.disabled || disabled || undefined}
          >
            <input
              type="radio"
              name={name ?? generatedName}
              value={item.value}
              aria-label={item.accessibilityLabel}
              checked={item.value === value}
              disabled={item.disabled || disabled}
              required
              onChange={() => setValue(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      </div>
    </fieldset>
  );
  return actions == null ? group : <div className="hjm-segmented-rail" style={layoutStyle}>{group}{actions}</div>;
});
