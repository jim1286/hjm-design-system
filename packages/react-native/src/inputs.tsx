import { control, radius, spacing, typography } from "@hjm/design-contracts/foundations";
import {
  resolveInitialRadioValue,
  resolveInitialTabValue,
  reconcileRadioSelection,
  validateRadioSelection,
  validateSelectionItems,
} from "@hjm/design-contracts/behaviors";
import { forwardRef, useEffect, useId, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Switch as NativeSwitch,
  TextInput,
  View,
  type StyleProp,
  type SwitchProps as NativeSwitchProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useControllableState } from "./internal/state.js";
import {
  logicalTextAlign,
  minimumTargetHitSlop,
  minimumTargetStyle,
  scalableTextDefaults,
} from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

type BaseFieldProps = Omit<
  TextInputProps,
  | "accessibilityLabel"
  | "defaultValue"
  | "multiline"
  | "onChangeText"
  | "style"
  | "value"
> &
  Readonly<{
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    accessibilityLabel?: string;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
  }>;

function FieldMessage({ error, supportText }: Pick<BaseFieldProps, "error" | "supportText">) {
  if (!error && !supportText) return null;
  return (
    <Text
      accessibilityLiveRegion={error ? "assertive" : "none"}
      tone={error ? "danger" : "muted"}
      variant="caption"
    >
      {error ?? supportText}
    </Text>
  );
}

type FieldRendererProps = BaseFieldProps &
  Readonly<{
    multiline: boolean;
    search: boolean;
  }>;

const FieldRenderer = forwardRef<TextInput, FieldRendererProps>(function FieldRenderer(
  {
    label,
    value,
    defaultValue = "",
    onValueChange,
    supportText,
    error,
    required = false,
    disabled = false,
    busy = false,
    accessibilityLabel,
    inputStyle,
    containerStyle,
    multiline,
    search,
    ...props
  },
  ref,
) {
  const { colors, environment } = useHjmNativeTheme();
  const [currentValue, setCurrentValue] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const hint = error ?? supportText;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <Text tone="primary" variant="label">
        {label}
        {required ? " *" : ""}
      </Text>
      <View
        style={{
          alignItems: multiline ? "stretch" : "center",
          backgroundColor: colors.bg,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.md,
          borderWidth: error ? 2 : 1,
          flexDirection: "row",
          minHeight: multiline ? 112 : 44,
          paddingHorizontal: spacing.sm,
        }}
      >
        <TextInput
          {...scalableTextDefaults}
          {...props}
          ref={ref}
          accessibilityHint={hint}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityRole={search ? "search" : undefined}
          accessibilityState={{ busy, disabled }}
          editable={!disabled && !busy}
          multiline={multiline}
          onChangeText={setCurrentValue}
          placeholderTextColor={colors.textWeak}
          style={[
            {
              color: colors.text,
              flex: 1,
              fontSize: typography.bodyLarge.fontSize,
              lineHeight: typography.bodyLarge.lineHeight,
              minHeight: multiline ? 96 : 44,
              paddingHorizontal: 0,
              paddingVertical: multiline ? spacing.sm : 0,
              textAlign: logicalTextAlign(environment.direction),
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
          value={currentValue}
        />
      </View>
      <FieldMessage
        {...(error === undefined ? {} : { error })}
        {...(supportText === undefined ? {} : { supportText })}
      />
    </View>
  );
});

export type TextFieldProps = BaseFieldProps;

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline={false} search={false} />;
});

export type TextAreaProps = BaseFieldProps;

export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline search={false} />;
});

export type SearchFieldProps = BaseFieldProps &
  Readonly<{
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    /** Localized accessible name announced while search is busy. */
    busyLabel: string;
    onClear?: () => void;
  }>;

export const SearchField = forwardRef<TextInput, SearchFieldProps>(function SearchField(
  {
    clearLabel,
    busyLabel,
    onClear,
    value,
    defaultValue,
    onValueChange,
    busy = false,
    disabled = false,
    ...props
  },
  ref,
) {
  const [searchValue, setSearchValue] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue: defaultValue ?? "",
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  return (
    <View>
      <FieldRenderer
        {...props}
        ref={ref}
        busy={busy}
        disabled={disabled}
        multiline={false}
        onValueChange={(next) => {
          if (!busy && !disabled) setSearchValue(next);
        }}
        search
        value={searchValue}
      />
      {busy ? (
        <View
          accessibilityLabel={busyLabel}
          accessibilityRole="progressbar"
          accessibilityState={{ busy: true }}
          style={{ alignItems: "center", bottom: 0, end: spacing.xs, height: 44, justifyContent: "center", position: "absolute", width: 44 }}
        >
          <ActivityIndicator size="small" />
        </View>
      ) : searchValue.length > 0 ? (
        <Pressable
          accessibilityLabel={clearLabel}
          accessibilityRole="button"
          hitSlop={minimumTargetHitSlop}
          disabled={disabled}
          onPress={() => {
            setSearchValue("");
            onClear?.();
          }}
          style={{
            alignItems: "center",
            bottom: 0,
            height: 44,
            justifyContent: "center",
            position: "absolute",
            end: spacing.xs,
            width: 44,
          }}
        >
          <Text align="center" tone="muted" variant="title">×</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

export type CheckboxProps = Readonly<{
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  accessibilityHint,
  style,
}: CheckboxProps) {
  const { colors } = useHjmNativeTheme();
  const [selected, setSelected] = useControllableState({
    ...(checked === undefined ? {} : { value: checked }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined ? {} : { onChange: onCheckedChange }),
  });
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={minimumTargetHitSlop}
      onPress={() => setSelected(!selected)}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          flexDirection: "row",
          gap: spacing.sm,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <View
        accessible={false}
        style={{
          alignItems: "center",
          backgroundColor: selected ? colors.primary : colors.bg,
          borderColor: selected ? colors.primary : colors.textWeak,
          borderRadius: radius.sm / 2,
          borderWidth: 2,
          height: 24,
          justifyContent: "center",
          width: 24,
        }}
      >
        {selected ? <Text align="center" tone="inverse" variant="label">✓</Text> : null}
      </View>
      <Text tone="body" variant="bodyLarge">{label}</Text>
    </Pressable>
  );
}

export type RadioOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
  accessibilityHint?: string;
}>;

export type RadioGroupProps<Value extends string = string> = Readonly<{
  label: string;
  options: readonly RadioOption<Value>[];
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  description?: string;
  error?: string;
  /** Optional localized qualifier; a neutral asterisk is used when omitted. */
  requiredLabel?: string;
  /** Optional localized qualifier; disabled state remains available when omitted. */
  readOnlyLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function RadioGroup<Value extends string = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  description,
  error,
  requiredLabel,
  readOnlyLabel,
  style,
}: RadioGroupProps<Value>) {
  const { colors } = useHjmNativeTheme();
  const selectionItems = options.map((option) => ({
    id: option.value,
    label: option.label,
    ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
  }));
  validateSelectionItems(selectionItems);
  if (value !== undefined) {
    validateRadioSelection(selectionItems, value);
  }
  const initialRef = useRef<Readonly<{ value: Value | null }> | null>(null);
  if (initialRef.current === null) {
    initialRef.current = {
      value: resolveInitialRadioValue(selectionItems, value ?? defaultValue, required),
    };
  }
  const [storedValue, setSelected] = useControllableState<Value | null>({
    ...(value === undefined ? {} : { value }),
    defaultValue: initialRef.current.value,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const reconciledValue = reconcileRadioSelection(selectionItems, storedValue, required);
  const controlled = value !== undefined;
  useEffect(() => {
    if (!controlled && reconciledValue !== storedValue) setSelected(reconciledValue);
  }, [controlled, reconciledValue, setSelected, storedValue]);
  const selected = reconciledValue;
  const id = useId().replaceAll(":", "");
  const labelId = `${id}-label`;
  const messageId = `${id}-message`;
  const hasError = invalid || error !== undefined;
  const resolvedGroupLabel = [
    label,
    required ? requiredLabel ?? "*" : undefined,
    readOnly ? readOnlyLabel : undefined,
  ].filter(Boolean).join(", ");

  return (
    <View
      accessibilityHint={error ?? description}
      accessibilityLabel={resolvedGroupLabel}
      accessibilityLabelledBy={labelId}
      accessibilityRole="radiogroup"
      accessibilityState={{ disabled: disabled || readOnly }}
      accessibilityValue={hasError && error ? { text: error } : undefined}
      style={[{ gap: spacing.xs }, style]}
    >
      <Text nativeID={labelId} tone="primary" variant="label">
        {label}{required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""}
      </Text>
      {options.map((option) => {
        const optionDisabled = disabled || option.disabled === true;
        const isSelected = selected === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityHint={[
              option.accessibilityHint,
              error ?? description,
              readOnly ? readOnlyLabel : undefined,
            ].filter(Boolean).join(". ") || undefined}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: optionDisabled || readOnly }}
            accessibilityValue={hasError && error ? { text: error } : undefined}
            disabled={optionDisabled || readOnly}
            onPress={() => setSelected(option.value)}
            style={({ pressed }) => [
              minimumTargetStyle,
              {
                alignItems: "center",
                flexDirection: "row",
                gap: spacing.sm,
                opacity: optionDisabled ? 0.5 : pressed ? 0.86 : 1,
              },
            ]}
          >
            <View
              accessible={false}
              style={{
                alignItems: "center",
                borderColor: isSelected ? colors.primary : colors.textWeak,
                borderRadius: radius.full,
                borderWidth: 2,
                height: 24,
                justifyContent: "center",
                width: 24,
              }}
            >
              {isSelected ? (
                <View style={{ backgroundColor: colors.primary, borderRadius: radius.full, height: 12, width: 12 }} />
              ) : null}
            </View>
            <Text tone="body" variant="bodyLarge">{option.label}</Text>
          </Pressable>
        );
      })}
      {error ? (
        <Text
          nativeID={messageId}
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          tone="danger"
          variant="caption"
        >
          {error}
        </Text>
      ) : description ? (
        <Text nativeID={messageId} tone="muted" variant="caption">{description}</Text>
      ) : null}
    </View>
  );
}

export type SwitchProps = Omit<
  NativeSwitchProps,
  "accessibilityHint" | "accessibilityLabel" | "onValueChange" | "style" | "value"
> &
  Readonly<{
    label: string;
    value?: boolean;
    defaultValue?: boolean;
    onValueChange?: (value: boolean) => void;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
  }>;

export function Switch({
  label,
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  accessibilityHint,
  style,
  ...props
}: SwitchProps) {
  const { colors } = useHjmNativeTheme();
  const [enabled, setEnabled] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled }}
      disabled={disabled}
      onPress={() => setEnabled(!enabled)}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          flexDirection: "row",
          gap: spacing.sm,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <Text style={{ flex: 1 }} tone="body" variant="bodyLarge">{label}</Text>
      <NativeSwitch
        {...props}
        accessible={false}
        disabled={disabled}
        ios_backgroundColor={colors.surfaceAlt}
        pointerEvents="none"
        thumbColor={colors.bg}
        trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
        value={enabled}
      />
    </Pressable>
  );
}

export type SegmentedControlOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
}>;

export type SegmentedControlProps<Value extends string = string> = Readonly<{
  label: string;
  options: readonly SegmentedControlOption<Value>[];
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function SegmentedControl<Value extends string = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  style,
}: SegmentedControlProps<Value>) {
  const { colors } = useHjmNativeTheme();
  const descriptors = options.map((option) => ({
      id: option.value,
      label: option.label,
      ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
    }));
  const collectionFallback = resolveInitialTabValue(descriptors);
  if (collectionFallback === undefined) throw new Error("SegmentedControl requires an enabled option");
  if (value !== undefined) resolveInitialTabValue(descriptors, value);
  const initialRef = useRef<Readonly<{ value: Value }> | null>(null);
  if (initialRef.current === null) {
    const initial = resolveInitialTabValue(descriptors, value ?? defaultValue);
    if (initial === undefined) throw new Error("SegmentedControl requires an enabled option");
    initialRef.current = { value: initial };
  }
  const [storedValue, setSelected] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue: initialRef.current.value,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const storedValueValid = descriptors.some(
    (item) => item.id === storedValue && !item.disabled,
  );
  const selected = storedValueValid ? storedValue : collectionFallback;
  const controlled = value !== undefined;
  useEffect(() => {
    if (!controlled && !storedValueValid) setSelected(collectionFallback);
  }, [collectionFallback, controlled, setSelected, storedValueValid]);
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          flexDirection: "row",
          gap: spacing.xxs,
          padding: spacing.xxs,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        const optionDisabled = disabled || option.disabled === true;
        return (
          <Pressable
            key={option.value}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: optionDisabled }}
            disabled={optionDisabled}
            onPress={() => setSelected(option.value)}
            style={({ pressed }) => [
              minimumTargetStyle,
              {
                alignItems: "center",
                backgroundColor: isSelected ? colors.bg : "transparent",
                borderRadius: radius.sm,
                flex: 1,
                justifyContent: "center",
                opacity: optionDisabled ? 0.5 : pressed ? 0.86 : 1,
                paddingHorizontal: spacing.xs,
              },
            ]}
          >
            <Text
              align="center"
              style={{ fontWeight: isSelected ? typography.label.fontWeight : typography.body.fontWeight }}
              tone={isSelected ? "primary" : "muted"}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type ChipBaseProps = Readonly<{
  label: string;
  size?: "small" | "medium";
  disabled?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}>;

type ActionChipProps = Readonly<{
  selectionMode?: "action";
  selected?: never;
  onPress: () => void;
}>;

type SelectionChipProps = Readonly<{
  selectionMode: "single" | "multiple";
  /** Product-owned controlled selection. */
  selected: boolean;
  onPress: (selected: boolean) => void;
}>;

export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);

/** Action/filter chip with role-specific, controlled selection semantics. */
export function Chip({
  label,
  size = "small",
  disabled = false,
  leading,
  trailing,
  accessibilityLabel,
  accessibilityHint,
  style,
  selectionMode = "action",
  selected,
  onPress,
}: ChipProps) {
  const { colors, environment } = useHjmNativeTheme();
  const selectable = selectionMode !== "action";
  const active = selectable && selected === true;
  const role = selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : "button";
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={role}
      accessibilityState={selectable ? { checked: active, disabled } : { disabled }}
      disabled={disabled}
      hitSlop={size === "small" ? minimumTargetHitSlop : undefined}
      onPress={() => {
        if (selectionMode === "action") (onPress as () => void)();
        else (onPress as (selected: boolean) => void)(!active);
      }}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: active ? colors.surfaceAccent : colors.bg,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: radius.full,
          borderWidth: 1,
          flexDirection: environment.direction === "rtl" ? "row-reverse" : "row",
          gap: size === "small" ? spacing.xxs : spacing.xs,
          height: control.chipHeight[size],
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
          paddingHorizontal: size === "small" ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      {leading ? <View accessible={false}>{leading}</View> : null}
      {active ? <Text accessible={false} tone="brand" variant="caption">✓</Text> : null}
      <Text
        align="center"
        style={{ fontWeight: active ? typography.label.fontWeight : typography.body.fontWeight }}
        tone={active ? "brand" : "muted"}
      >
        {label}
      </Text>
      {trailing ? <View accessible={false}>{trailing}</View> : null}
    </Pressable>
  );
}
