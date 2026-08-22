import {
  fieldRecipe,
  type FieldShape,
  type FieldVariant,
} from "@hjm/design-contracts/recipes/base";
import {
  iconRecipe,
  searchFieldRecipe,
  type SearchFieldSize,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { composeRefs, classNames, useControllableState } from "./internal.js";

type FieldCopyProps = Readonly<{
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
}>;

type FieldFrameProps = HTMLAttributes<HTMLDivElement> &
  FieldCopyProps &
  Readonly<{
    controlId: string;
    descriptionId?: string;
    errorId?: string;
    disabled?: boolean;
    focused?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    children: ReactNode;
  }>;

function FieldFrame({
  controlId,
  label,
  description,
  error,
  descriptionId,
  errorId,
  required = false,
  disabled = false,
  focused = false,
  variant = fieldRecipe.defaults.variant,
  shape = fieldRecipe.defaults.shape,
  className,
  children,
  ...props
}: FieldFrameProps) {
  const state = disabled ? "disabled" : error ? "invalid" : focused ? "focused" : "idle";
  return (
    <div
      {...props}
      className={classNames("hjm-field", className)}
      data-state={state}
      data-variant={variant}
      data-shape={shape}
    >
      {label !== undefined && label !== null ? (
        <label className="hjm-field__label" htmlFor={controlId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {description && !error ? (
        <div id={descriptionId} className="hjm-field__description">
          {description}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="hjm-field__error">
          {error}
        </div>
      ) : null}
    </div>
  );
}

export type FieldControlProps = Readonly<{
  id: string;
  required: boolean;
  disabled: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}>;

export type FieldProps = Omit<
  FieldFrameProps,
  "children" | "descriptionId" | "errorId"
> &
  Readonly<{
    label: ReactNode;
    children: ReactNode | ((props: FieldControlProps) => ReactNode);
  }>;

/** Generic frame for custom native controls; `controlId` keeps the label explicit. */
export function Field({
  controlId,
  description,
  error,
  required = false,
  disabled = false,
  children,
  ...props
}: FieldProps) {
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const controlProps: FieldControlProps = {
    id: controlId,
    required,
    disabled,
    ...(error ? { "aria-invalid": true as const } : {}),
    ...(error
      ? { "aria-describedby": errorId }
      : description
        ? { "aria-describedby": descriptionId }
        : {}),
  };
  return (
    <FieldFrame
      {...props}
      controlId={controlId}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
      {...(description ? { descriptionId } : {})}
      {...(error ? { errorId } : {})}
    >
      {typeof children === "function" ? children(controlProps) : children}
    </FieldFrame>
  );
}

function useFieldIds(id: string | undefined) {
  const generatedId = useId();
  const controlId = id ?? `hjm-${generatedId.replaceAll(":", "")}`;
  return {
    controlId,
    descriptionId: `${controlId}-description`,
    errorId: `${controlId}-error`,
  } as const;
}

function describedBy(
  own: string | undefined,
  description: ReactNode | undefined,
  error: ReactNode | undefined,
  descriptionId: string,
  errorId: string,
): string | undefined {
  return [own, error ? errorId : description ? descriptionId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
}

function requireFieldAccessibleName(label: ReactNode | undefined, ariaLabel: string | undefined) {
  if ((label === undefined || label === null) && !ariaLabel?.trim()) {
    throw new TypeError("Field controls require either label or aria-label");
  }
}

type SharedInputProps = FieldCopyProps &
  Readonly<{
    variant?: FieldVariant;
    shape?: FieldShape;
    leading?: ReactNode;
    trailing?: ReactNode;
    fieldClassName?: string;
  }>;

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  SharedInputProps;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id,
      label,
      description,
      error,
      required,
      disabled,
      variant,
      shape,
      leading,
      trailing,
      fieldClassName,
      className,
      onFocus,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(event);
    };
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(event);
    };
    return (
      <FieldFrame
        controlId={ids.controlId}
        label={label}
        description={description}
        error={error}
        required={required ?? false}
        disabled={disabled ?? false}
        focused={focused}
        variant={variant ?? fieldRecipe.defaults.variant}
        shape={shape ?? fieldRecipe.defaults.shape}
        className={fieldClassName}
        {...(description ? { descriptionId: ids.descriptionId } : {})}
        {...(error ? { errorId: ids.errorId } : {})}
      >
        <div className="hjm-field__control">
          {leading ? <span className="hjm-field__affix">{leading}</span> : null}
          <input
            {...props}
            ref={ref}
            id={ids.controlId}
            className={classNames("hjm-field__input", className)}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : ariaInvalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy(
              ariaDescribedBy,
              description,
              error,
              ids.descriptionId,
              ids.errorId,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {trailing ? <span className="hjm-field__affix">{trailing}</span> : null}
        </div>
      </FieldFrame>
    );
  },
);

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Omit<SharedInputProps, "leading" | "trailing">;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id,
      label,
      description,
      error,
      required,
      disabled,
      variant,
      shape,
      fieldClassName,
      className,
      onFocus,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const ids = useFieldIds(id);
    const [focused, setFocused] = useState(false);
    requireFieldAccessibleName(label, ariaLabel);
    return (
      <FieldFrame
        controlId={ids.controlId}
        label={label}
        description={description}
        error={error}
        required={required ?? false}
        disabled={disabled ?? false}
        focused={focused}
        variant={variant ?? fieldRecipe.defaults.variant}
        shape={shape ?? fieldRecipe.defaults.shape}
        className={fieldClassName}
        {...(description ? { descriptionId: ids.descriptionId } : {})}
        {...(error ? { errorId: ids.errorId } : {})}
      >
        <div className="hjm-field__control hjm-field__control--multiline">
          <textarea
            {...props}
            ref={ref}
            id={ids.controlId}
            className={classNames("hjm-field__input", className)}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : ariaInvalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy(
              ariaDescribedBy,
              description,
              error,
              ids.descriptionId,
              ids.errorId,
            )}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
        </div>
      </FieldFrame>
    );
  },
);

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue"
> &
  SharedInputProps &
  Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: SearchFieldSize;
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    onClear?: () => void;
    /** Keeps the input mounted and named while replacing trailing actions with progress. */
    loading?: boolean;
    /** Product icon adapter; the renderer owns size and inherited color. */
    renderSearchIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Product icon adapter for the clear action. */
    renderClearIcon?: (props: SearchFieldIconRenderProps) => ReactNode;
    /** Optional progress adapter. The default is the canonical CSS spinner. */
    renderLoadingIndicator?: (props: SearchFieldIconRenderProps) => ReactNode;
  }>;

export type SearchFieldIconRenderProps = Readonly<{
  color: "currentColor";
  size: number;
}>;

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onChange,
      size = searchFieldRecipe.defaults.size,
      clearLabel,
      onClear,
      loading = false,
      renderSearchIcon,
      renderClearIcon,
      renderLoadingIndicator,
      leading,
      trailing,
      fieldClassName,
      disabled,
      "aria-busy": ariaBusy,
      ...props
    },
    forwardedRef,
  ) {
    const [value, setValue] = useControllableState({
      ...(valueProp === undefined ? {} : { value: valueProp }),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const iconAppearance: SearchFieldIconRenderProps = {
      color: "currentColor",
      size: iconRecipe.sizes[searchFieldRecipe.sizes[size].glyph],
    };
    const canClear = value.length > 0 && !disabled;
    return (
      <TextField
        {...props}
        ref={composeRefs(inputRef, forwardedRef)}
        type="search"
        value={value}
        data-size={size}
        data-loading={loading || undefined}
        disabled={disabled}
        aria-busy={loading || ariaBusy || undefined}
        fieldClassName={classNames("hjm-search-field", fieldClassName)!}
        leading={
          leading ?? (renderSearchIcon ? renderSearchIcon(iconAppearance) : undefined)
        }
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
        trailing={
          loading ? (
            <span className="hjm-search-field__spinner" aria-hidden="true">
              {renderLoadingIndicator?.(iconAppearance)}
            </span>
          ) : canClear ? (
            <button
              type="button"
              className="hjm-search-field__clear"
              aria-label={clearLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setValue("");
                onClear?.();
                inputRef.current?.focus();
              }}
            >
              {renderClearIcon?.(iconAppearance) ?? "×"}
            </button>
          ) : trailing
        }
      />
    );
  },
);
