import {
  segmentedControlRecipe,
  selectionGroupRecipe,
  type SegmentedControlSize,
  type SelectionGroupOrientation,
  type SelectionGroupPresentation,
} from "@hjm/design-contracts/recipes";
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
} from "@hjm/design-contracts/behaviors";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "defaultChecked" | "onChange" | "children"
> &
  Readonly<{
    label: ReactNode;
    description?: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
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
      className,
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

    return (
      <label
        className={classNames("hjm-choice", className)}
        data-kind="checkbox"
        data-state={indeterminate ? "mixed" : checked ? "checked" : "unchecked"}
        data-disabled={disabled || undefined}
      >
        <input
          {...props}
          ref={composeRefs(inputRef, forwardedRef)}
          className="hjm-choice__input"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? "mixed" : checked}
          onChange={(event) => {
            setChecked(event.currentTarget.checked);
            onChange?.(event);
          }}
        />
        <span className="hjm-choice__indicator" aria-hidden="true" />
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
  "type" | "checked" | "defaultChecked" | "onChange" | "children"
> &
  RadioState &
  Readonly<{
    label: ReactNode;
    description?: ReactNode;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
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
    className,
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
      data-kind="radio"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled || undefined}
    >
      <input
        {...props}
        ref={ref}
        className="hjm-choice__input"
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          if (event.currentTarget.checked) setChecked(true);
          onChange?.(event);
        }}
      />
      <span className="hjm-choice__indicator" aria-hidden="true" />
      <span className="hjm-choice__copy">
        <span>{label}</span>
        {description ? <span className="hjm-choice__description">{description}</span> : null}
      </span>
    </label>
  );
});

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
    presentation?: SelectionGroupPresentation;
    name?: string;
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
    presentation = selectionGroupRecipe.defaults.presentation,
    name,
    value: valueProp,
    defaultValue,
    onValueChange,
    disabled,
    className,
    ...props
  }: CheckboxGroupProps<Key>,
  ref: React.ForwardedRef<HTMLFieldSetElement>,
) {
  const resolvedLabel = resolveControlAccessibleName(
    label,
    accessibilityLabel,
    "CheckboxGroup",
  );
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
      className={classNames("hjm-checkbox-group", className)}
      data-orientation={orientation}
      data-presentation={presentation}
      data-state={error ? "invalid" : disabled ? "disabled" : "idle"}
      disabled={disabled}
      aria-label={accessibilityLabel}
      aria-describedby={error ? errorId : description ? descriptionId : undefined}
    >
      <legend className={label === undefined ? "hjm-visually-hidden" : undefined}>
        {label ?? resolvedLabel}
      </legend>
      {description && !error ? (
        <div id={descriptionId} className="hjm-field__description">{description}</div>
      ) : null}
      <div className="hjm-checkbox-group__items">
        {items.map((item) => {
          const checked = reconciledValue.has(item.id);
          return (
            <label
              key={item.id}
              className="hjm-choice"
              data-kind="checkbox"
              data-state={checked ? "checked" : "unchecked"}
              data-disabled={item.disabled || undefined}
            >
              <input
                className="hjm-choice__input"
                type="checkbox"
                name={name}
                value={item.id}
                checked={checked}
                disabled={item.disabled}
                onChange={() => setValue(toggleCheckboxSelection(items, reconciledValue, item.id))}
              />
              <span className="hjm-choice__indicator" aria-hidden="true" />
              <span className="hjm-choice__copy">
                <span>{item.label}</span>
                {item.description ? (
                  <span className="hjm-choice__description">{item.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <div id={errorId} className="hjm-field__error">{error}</div> : null}
    </fieldset>
  );
}

export const CheckboxGroup = forwardRef(CheckboxGroupInner) as <Key extends string = string>(
  props: CheckboxGroupProps<Key> & RefAttributes<HTMLFieldSetElement>,
) => ReactElement;

export type RadioGroupItem = Readonly<{
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}>;

export type RadioGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "defaultValue" | "onChange" | "value"
> &
  Readonly<{
    label: ReactNode;
    accessibilityLabel?: string;
    items: readonly RadioGroupItem[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    orientation?: SelectionGroupOrientation;
    description?: ReactNode;
    error?: ReactNode;
    name?: string;
    required?: boolean;
    readOnly?: boolean;
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
      description,
      error,
      name,
      required = false,
      readOnly = false,
      disabled,
      className,
      ...props
    },
    ref,
  ) {
    validateItems("RadioGroup", items);
    if (
      accessibilityLabel !== undefined &&
      accessibilityLabel.trim().length === 0
    ) throw new TypeError("RadioGroup accessibilityLabel must not be empty");
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
    const descriptionId = `${generatedName}-radio-description`;
    const errorId = `${generatedName}-radio-error`;
    return (
      <fieldset
        {...props}
        ref={ref}
        className={classNames("hjm-radio-group", className)}
        data-orientation={orientation}
        data-state={error ? "invalid" : disabled ? "disabled" : "idle"}
        disabled={disabled}
        aria-label={accessibilityLabel}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
        aria-readonly={readOnly || undefined}
      >
        <legend>{label}</legend>
        {description && !error ? <div id={descriptionId} className="hjm-field__description">{description}</div> : null}
        <div className="hjm-radio-group__items">
          {items.map((item) => {
            const selected = item.value === value;
            return (
              <label
                key={item.value}
                className="hjm-choice"
                data-kind="radio"
                data-state={selected ? "checked" : "unchecked"}
                data-disabled={item.disabled || undefined}
              >
                <input
                  className="hjm-choice__input"
                  type="radio"
                  name={name ?? generatedName}
                  value={item.value}
                  checked={selected}
                  disabled={item.disabled}
                  required={required}
                  aria-readonly={readOnly || undefined}
                  onClick={readOnly ? (event) => event.preventDefault() : undefined}
                  onChange={() => {
                    if (!readOnly) setValue(item.value);
                  }}
                />
                <span className="hjm-choice__indicator" aria-hidden="true" />
                <span className="hjm-choice__copy">
                  <span>{item.label}</span>
                  {item.description ? (
                    <span className="hjm-choice__description">{item.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
        {error ? <div id={errorId} className="hjm-field__error">{error}</div> : null}
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
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }>;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    type = "button",
    className,
    onClick,
    ...props
  },
  ref,
) {
  const [checked, setChecked] = useControllableState({
    ...(checkedProp === undefined ? {} : { value: checkedProp }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
  });
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      role="switch"
      className={classNames("hjm-switch", className)}
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
      <span>{label}</span>
    </button>
  );
});

export type SegmentedControlItem = Readonly<{
  value: string;
  label: ReactNode;
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
    name?: string;
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
    name,
    className,
    ...props
  },
  ref,
) {
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
  return (
    <fieldset
      {...props}
      ref={ref}
      className={classNames("hjm-segmented", className)}
      data-size={size}
    >
      <legend className="hjm-visually-hidden">{label}</legend>
      <div className="hjm-segmented__items">
        {items.map((item) => (
          <label
            key={item.value}
            className="hjm-segmented__item"
            data-state={item.value === value ? "checked" : "unchecked"}
            data-disabled={item.disabled || undefined}
          >
            <input
              type="radio"
              name={name ?? generatedName}
              value={item.value}
              checked={item.value === value}
              disabled={item.disabled}
              required
              onChange={() => setValue(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
});
