import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { glyph, radius, spacing, typography } from "@hjmds/design-contracts/foundations";
import {
  fieldRecipe,
  type FieldShape,
  type FieldVariant,
} from "@hjmds/design-contracts/recipes/base";
import {
  chipRecipe,
  searchFieldRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  selectionGroupRecipe,
  switchRecipe,
  type ChipSize,
  type SearchFieldSize,
  type SegmentedControlSize,
  type SelectionControlPresentation,
  type SelectionControlSize,
  type SwitchSize,
} from "@hjmds/design-contracts/recipes";
import {
  passwordFieldRecipe,
  resolvePasswordFieldDescriptor,
  type PasswordFieldAutofillHint,
  type PasswordFieldSize,
} from "@hjmds/design-contracts/components/password-field";
import {
  getOtpFieldSlotValues,
  otpFieldRecipe,
  resolveOtpFieldValue,
  type OtpFieldSize,
} from "@hjmds/design-contracts/components/otp-field";
import {
  getCheckboxNextState,
  reconcileCheckboxSelection,
  resolveControlAccessibleName,
  resolveInitialRadioValue,
  resolveInitialTabValue,
  reconcileRadioSelection,
  selectionGroupBehaviorDefaults,
  toggleCheckboxSelection,
  validateCheckboxSelection,
  validateRadioSelection,
  validateSelectionItems,
  type CheckboxGroupSelection,
  type CheckboxState,
  type SelectionItemDescriptor,
  type SelectionOrientation,
} from "@hjmds/design-contracts/behaviors";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  Switch as NativeSwitch,
  TextInput,
  View,
  type StyleProp,
  type GestureResponderEvent,
  type SwitchProps as NativeSwitchProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useControllableState } from "./internal/state.js";
import {
  logicalTextAlign,
  minimumTargetStyle,
  resolveNativeTextScaleProps,
} from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

type FieldAccessibleName =
  | Readonly<{
      label: string;
      accessibilityLabel?: string;
    }>
  | Readonly<{
      label?: undefined;
      accessibilityLabel: string;
    }>;

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
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    supportText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    /**
     * @deprecated Input color, typography, padding, and control height are recipe-owned. Request
     * a semantic field axis instead of overriding them in product code.
     * @see https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary
     */
    inputStyle?: StyleProp<TextStyle>;
    /**
     * @deprecated Legacy compatibility only. New apps must use `layoutStyle` for placement.
     * @see https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary
     */
    containerStyle?: StyleProp<ViewStyle>;
    /** Canonical layout-only placement for the complete field. Controlled keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

type AccessibleFieldProps = BaseFieldProps & FieldAccessibleName;

function resolveFieldAccessibleName(
  label: string | undefined,
  accessibilityLabel: string | undefined,
): Readonly<{ accessibleName: string; visibleLabel?: string }> {
  const visibleLabel = label?.trim();
  const explicitAccessibleName = accessibilityLabel?.trim();
  const accessibleName = explicitAccessibleName || visibleLabel;
  if (!accessibleName) {
    throw new TypeError("Field requires a non-empty label or accessibilityLabel");
  }
  return {
    accessibleName,
    ...(visibleLabel ? { visibleLabel } : {}),
  };
}

function FieldMessage({ error, supportText }: Pick<BaseFieldProps, "error" | "supportText">) {
  if (!error && !supportText) return null;
  return (
    <Text
      accessibilityLiveRegion={error ? "assertive" : "none"}
      tone={error ? "danger" : "muted"}
      variant={fieldRecipe.support.textVariant}
    >
      {error ?? supportText}
    </Text>
  );
}

type FieldRendererProps = AccessibleFieldProps &
  Readonly<{
    multiline: boolean;
    search: boolean;
    searchSize?: SearchFieldSize;
    leading?: ReactNode;
    trailing?: ReactNode;
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
    variant = fieldRecipe.defaults.variant,
    shape,
    accessibilityLabel,
    inputStyle,
    containerStyle,
    layoutStyle,
    allowFontScaling,
    multiline,
    search,
    searchSize = searchFieldRecipe.defaults.size,
    leading,
    trailing,
    onBlur,
    onFocus,
    ...props
  },
  ref,
) {
  const theme = useHjmNativeTheme();
  const { colors, environment, textScaling } = theme;
  const [focused, setFocused] = useState(false);
  const [currentValue, setCurrentValue] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const hint = error ?? supportText;
  const { accessibleName, visibleLabel } = resolveFieldAccessibleName(
    label,
    accessibilityLabel,
  );
  const resolvedShape = shape ?? (
    search ? searchFieldRecipe.defaults.shape : fieldRecipe.defaults.shape
  );
  const searchSizing = searchFieldRecipe.sizes[searchSize];
  const minHeight = multiline
    ? fieldRecipe.multilineMinHeight
    : search
      ? searchSizing.minHeight
      : fieldRecipe.minHeight;
  const borderWidth = search ? searchFieldRecipe.borderWidth : fieldRecipe.borderWidth;
  const borderColor = search
    ? resolveColorReference(
        error
          ? searchFieldRecipe.colors.invalid
          : focused
            ? searchFieldRecipe.colors.focus
            : searchFieldRecipe.colors.border,
        theme.palette,
      )
    : colors[
        error
          ? fieldRecipe.states.invalid.border
          : focused
            ? fieldRecipe.states.focused.border
            : fieldRecipe.states.idle.border
      ];
  const backgroundColor = search && variant === fieldRecipe.defaults.variant
    ? resolveColorReference(searchFieldRecipe.colors.background, theme.palette)
    : colors[fieldRecipe.variants[variant].background];
  const placeholderColor = search
    ? resolveColorReference(searchFieldRecipe.colors.placeholder, theme.palette)
    : colors[fieldRecipe.placeholder.color];
  const textStyle = typography[search ? searchSizing.textVariant : fieldRecipe.textVariant];
  const controlRadius = radius[
    search ? searchFieldRecipe.shapes[resolvedShape] : fieldRecipe.shapes[resolvedShape]
  ];
  const inputTextScaleProps = resolveNativeTextScaleProps(
    textScaling,
    [
      {
        color: search
          ? resolveColorReference(searchFieldRecipe.colors.content, theme.palette)
          : colors.text,
        flex: 1,
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        lineHeight: textStyle.lineHeight,
        minHeight: minHeight - (borderWidth * 2),
        paddingHorizontal: 0,
        paddingVertical: fieldRecipe.paddingVertical,
        textAlign: logicalTextAlign(environment.direction),
        textAlignVertical: multiline ? "top" : "center",
      },
      inputStyle,
    ],
    allowFontScaling,
  );

  return (
    <View
      style={[
        {
          gap: fieldRecipe.label.gap,
          opacity: disabled
            ? search
              ? searchFieldRecipe.states.disabledOpacity
              : fieldRecipe.disabledOpacity
            : 1,
        },
        containerStyle,
        layoutStyle,
      ]}
    >
      {visibleLabel ? (
        <Text
          style={{
            color: colors[fieldRecipe.label.color],
            fontWeight: fieldRecipe.label.fontWeight,
          }}
          tone="body"
          variant={fieldRecipe.label.textVariant}
        >
          {visibleLabel}
          {required ? " *" : ""}
        </Text>
      ) : null}
      <View style={{ gap: fieldRecipe.support.gap }}>
        <View
          style={{
            alignItems: multiline ? "stretch" : "center",
            backgroundColor,
            borderColor,
            borderRadius: controlRadius,
            borderWidth,
            direction: environment.direction,
            flexDirection: "row",
            gap: search ? searchSizing.gap : 0,
            minHeight,
            paddingHorizontal: search
              ? searchSizing.paddingHorizontal
              : fieldRecipe.paddingHorizontal,
          }}
        >
          {leading ? (
            <View
              accessibilityElementsHidden
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {leading}
            </View>
          ) : null}
          <TextInput
            {...props}
            {...inputTextScaleProps}
            ref={ref}
            accessibilityHint={hint}
            accessibilityLabel={accessibleName}
            accessibilityRole={search ? "search" : undefined}
            accessibilityState={{ busy, disabled }}
            editable={!disabled && !busy}
            multiline={multiline}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={setCurrentValue}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            placeholderTextColor={placeholderColor}
            value={currentValue}
          />
          {trailing}
        </View>
        <FieldMessage
          {...(error === undefined ? {} : { error })}
          {...(supportText === undefined ? {} : { supportText })}
        />
      </View>
    </View>
  );
});

export type TextFieldProps = AccessibleFieldProps;

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline={false} search={false} />;
});

export type TextAreaProps = AccessibleFieldProps;

export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline search={false} />;
});

export type SearchFieldAffordanceRenderProps = Readonly<{
  color: string;
  size: number;
  disabled: boolean;
}>;

export type SearchFieldProps = AccessibleFieldProps &
  Readonly<{
    size?: SearchFieldSize;
    /** Localized accessible name for the clear action. */
    clearLabel: string;
    /** Localized accessible name announced while search is busy. */
    busyLabel: string;
    onClear?: () => void;
    /** Decorative leading content. Defaults to a neutral search glyph. */
    leading?: ReactNode;
    /** Product-owned trailing content shown only when clear/busy is absent. */
    trailing?: ReactNode;
    renderLeading?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
    renderClearIcon?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
    renderBusyIndicator?: (props: SearchFieldAffordanceRenderProps) => ReactNode;
  }>;

export const SearchField = forwardRef<TextInput, SearchFieldProps>(function SearchField(
  {
    clearLabel,
    busyLabel,
    onClear,
    leading: leadingNode,
    trailing: trailingNode,
    renderLeading,
    renderClearIcon,
    renderBusyIndicator,
    value,
    defaultValue,
    onValueChange,
    size = searchFieldRecipe.defaults.size,
    busy = false,
    disabled = false,
    ...props
  },
  ref,
) {
  const theme = useHjmNativeTheme();
  const searchSizing = searchFieldRecipe.sizes[size];
  const iconProps: SearchFieldAffordanceRenderProps = {
    color: resolveColorReference(searchFieldRecipe.colors.leading, theme.palette),
    size: glyph[searchSizing.glyph],
    disabled,
  };
  const [searchValue, setSearchValue] = useControllableState({
    ...(value === undefined ? {} : { value }),
    defaultValue: defaultValue ?? "",
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const leading = leadingNode ?? renderLeading?.(iconProps);
  const trailing = busy ? (
    <View
      accessibilityLabel={busyLabel}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={{
        alignItems: "center",
        height: searchSizing.clearDiameter,
        justifyContent: "center",
        width: searchSizing.clearDiameter,
      }}
    >
      {renderBusyIndicator?.(iconProps) ?? (
        <ActivityIndicator color={iconProps.color} size={iconProps.size} />
      )}
    </View>
  ) : searchValue.length > 0 ? (
    <Pressable
      accessibilityLabel={clearLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={searchSizing.clearHitSlop}
      onPress={() => {
        setSearchValue("");
        onClear?.();
      }}
      style={{
        alignItems: "center",
        height: searchSizing.clearDiameter,
        justifyContent: "center",
        width: searchSizing.clearDiameter,
      }}
    >
      {renderClearIcon?.(iconProps) ?? (
        <Text
          align="center"
          style={{ fontSize: iconProps.size, lineHeight: iconProps.size }}
          tone="muted"
        >
          ×
        </Text>
      )}
    </Pressable>
  ) : trailingNode;
  return (
    <FieldRenderer
      {...props}
      ref={ref}
      busy={busy}
      disabled={disabled}
      leading={leading}
      multiline={false}
      onValueChange={(next) => {
        if (!busy && !disabled) setSearchValue(next);
      }}
      search
      searchSize={size}
      trailing={trailing}
      value={searchValue}
    />
  );
});

export type PasswordFieldToggleRenderProps = Readonly<{
  name: "visibility" | "visibilityOff";
  color: string;
  size: number;
  revealed: boolean;
  disabled: boolean;
}>;

export type PasswordFieldProps = Omit<
  BaseFieldProps,
  | "autoComplete"
  | "defaultValue"
  | "secureTextEntry"
  | "textContentType"
  | "value"
> & FieldAccessibleName &
  Readonly<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    revealed?: boolean;
    defaultRevealed?: boolean;
    onRevealedChange?: (revealed: boolean) => void;
    autofillHint: PasswordFieldAutofillHint;
    revealLabel: string;
    concealLabel: string;
    size?: PasswordFieldSize;
    renderToggleIcon?: (props: PasswordFieldToggleRenderProps) => ReactNode;
  }>;

function DefaultPasswordToggleIcon({
  color,
  revealed,
  size,
}: Pick<PasswordFieldToggleRenderProps, "color" | "revealed" | "size">) {
  const eyeWidth = size * 1.08;
  const eyeHeight = size * 0.68;
  const strokeWidth = Math.max(1.5, size * 0.1);
  return (
    <View
      accessible={false}
      style={{
        alignItems: "center",
        height: size,
        justifyContent: "center",
        width: eyeWidth,
      }}
    >
      <View
        style={{
          alignItems: "center",
          borderColor: color,
          borderRadius: eyeHeight / 2,
          borderWidth: strokeWidth,
          height: eyeHeight,
          justifyContent: "center",
          width: eyeWidth,
        }}
      >
        <View
          style={{
            backgroundColor: color,
            borderRadius: size * 0.15,
            height: size * 0.3,
            width: size * 0.3,
          }}
        />
      </View>
      {revealed ? (
        <View
          style={{
            backgroundColor: color,
            borderRadius: strokeWidth,
            height: strokeWidth,
            position: "absolute",
            transform: [{ rotate: "-42deg" }],
            width: eyeWidth * 1.18,
          }}
        />
      ) : null}
    </View>
  );
}

/** Password input with independent reveal state and native autofill translation. */
export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField(
  {
    revealed: revealedProp,
    defaultRevealed = false,
    onRevealedChange,
    autofillHint,
    revealLabel,
    concealLabel,
    size = passwordFieldRecipe.defaults.size,
    renderToggleIcon,
    disabled = false,
    onSelectionChange,
    ...props
  },
  forwardedRef,
) {
  const theme = useHjmNativeTheme();
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as TextInput);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [revealed, setRevealed] = useControllableState({
    ...(revealedProp === undefined ? {} : { value: revealedProp }),
    defaultValue: defaultRevealed,
    ...(onRevealedChange === undefined ? {} : { onChange: onRevealedChange }),
  });
  const resolved = resolvePasswordFieldDescriptor(
    { revealed, autofillHint },
    {
      composeToggleAccessibleName: ({ willReveal }) =>
        willReveal ? revealLabel : concealLabel,
    },
  );
  const metrics = passwordFieldRecipe.sizes[size];
  const toggleColor = resolveColorReference(passwordFieldRecipe.toggle.color, theme.palette);
  const appearance: PasswordFieldToggleRenderProps = {
    name: revealed
      ? passwordFieldRecipe.toggle.icons.revealed
      : passwordFieldRecipe.toggle.icons.concealed,
    color: toggleColor,
    size: glyph.sm,
    revealed,
    disabled,
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.setNativeProps({ selection: selectionRef.current });
    }, 0);
    return () => clearTimeout(timeout);
  }, [revealed]);

  return (
    <FieldRenderer
      {...props}
      ref={inputRef}
      autoComplete={autofillHint === "current" ? "current-password" : "new-password"}
      disabled={disabled}
      inputStyle={[
        size === "large"
          ? {
              fontSize: typography.bodyLarge.fontSize,
              lineHeight: typography.bodyLarge.lineHeight,
              minHeight: metrics.minHeight - (passwordFieldRecipe.frame.borderWidth * 2),
            }
          : undefined,
        props.inputStyle,
      ]}
      multiline={false}
      onSelectionChange={(event) => {
        selectionRef.current = event.nativeEvent.selection;
        onSelectionChange?.(event);
      }}
      search={false}
      secureTextEntry={resolved.nativeSecureTextEntry}
      textContentType={autofillHint === "current" ? "password" : "newPassword"}
      trailing={(
        <Pressable
          accessibilityLabel={resolved.toggleAccessibleName}
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: revealed }}
          disabled={disabled}
          onPress={() => setRevealed(!revealed)}
          style={({ pressed }) => ({
            alignItems: "center",
            height: metrics.toggleDiameter,
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
            width: metrics.toggleDiameter,
          })}
        >
          {renderToggleIcon?.(appearance) ?? <DefaultPasswordToggleIcon {...appearance} />}
        </Pressable>
      )}
    />
  );
});

export type OtpFieldProps = Omit<
  BaseFieldProps,
  | "autoComplete"
  | "defaultValue"
  | "inputStyle"
  | "keyboardType"
  | "multiline"
  | "onChangeText"
  | "secureTextEntry"
  | "textContentType"
  | "value"
> & FieldAccessibleName &
  Readonly<{
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    size?: OtpFieldSize;
    slotStyle?: StyleProp<ViewStyle>;
    slotTextStyle?: StyleProp<TextStyle>;
  }>;

/** One accessible numeric TextInput rendered through decorative OTP slots. */
export const OtpField = forwardRef<TextInput, OtpFieldProps>(function OtpField(
  {
    label,
    accessibilityLabel,
    supportText,
    error,
    required = false,
    disabled = false,
    busy = false,
    readOnly = false,
    length,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onComplete,
    size = otpFieldRecipe.defaults.size,
    slotStyle,
    slotTextStyle,
    containerStyle,
    allowFontScaling,
    onBlur,
    onFocus,
    ...props
  },
  ref,
) {
  const theme = useHjmNativeTheme();
  const { accessibleName, visibleLabel } = resolveFieldAccessibleName(label, accessibilityLabel);
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useControllableState({
    ...(valueProp === undefined ? {} : { value: valueProp }),
    defaultValue: resolveOtpFieldValue(length, defaultValue),
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const slots = getOtpFieldSlotValues({ length, value });
  const complete = value.length === length;
  const wasCompleteRef = useRef(complete);
  useEffect(() => {
    if (complete && !wasCompleteRef.current) onComplete?.(value);
    wasCompleteRef.current = complete;
  }, [complete, onComplete, value]);
  const metrics = otpFieldRecipe.sizes[size];
  const activeIndex = Math.min(value.length, length - 1);
  const slotHeight = Math.max(
    metrics.slotSize,
    typography[metrics.textVariant].lineHeight * theme.environment.textScale + spacing.xs * 2,
  );
  const baseBorder = resolveColorReference(otpFieldRecipe.slot.border, theme.palette);
  const focusBorder = resolveColorReference(otpFieldRecipe.slot.focusBorder, theme.palette);
  const invalidBorder = resolveColorReference(otpFieldRecipe.slot.invalidBorder, theme.palette);
  const filledBorder = resolveColorReference(otpFieldRecipe.slot.filledBorder, theme.palette);
  const contentColor = resolveColorReference(otpFieldRecipe.slot.content, theme.palette);

  return (
    <View
      style={[
        {
          gap: fieldRecipe.label.gap,
          opacity: disabled || busy ? otpFieldRecipe.states.disabledOpacity : 1,
        },
        containerStyle,
      ]}
    >
      {visibleLabel ? (
        <Text
          style={{
            color: theme.colors[fieldRecipe.label.color],
            fontWeight: fieldRecipe.label.fontWeight,
          }}
          tone="body"
          variant={fieldRecipe.label.textVariant}
        >
          {visibleLabel}{required ? " *" : ""}
        </Text>
      ) : null}
      <View style={{ gap: otpFieldRecipe.support.gap }}>
        <View
          style={{
            direction: "ltr",
            flexDirection: "row",
            gap: metrics.gap,
            maxWidth: metrics.slotSize * length + metrics.gap * (length - 1),
            position: "relative",
            width: "100%",
          }}
        >
          <TextInput
            {...props}
            ref={ref}
            accessibilityHint={error ?? supportText}
            accessibilityLabel={accessibleName}
            accessibilityState={{ busy, disabled: disabled || readOnly }}
            allowFontScaling={allowFontScaling}
            autoComplete="one-time-code"
            caretHidden
            editable={!disabled && !busy && !readOnly}
            keyboardType="number-pad"
            maxLength={length}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={(rawText) => setValue(resolveOtpFieldValue(length, rawText))}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            selectionColor="transparent"
            style={{
              bottom: 0,
              color: "transparent",
              left: 0,
              opacity: 0.01,
              padding: 0,
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 1,
            }}
            textContentType="oneTimeCode"
            value={value}
          />
          {slots.map((digit, index) => {
            const borderColor = error
              ? invalidBorder
              : focused && index === activeIndex
                ? focusBorder
                : digit
                  ? filledBorder
                  : baseBorder;
            return (
              <View
                accessibilityElementsHidden
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                key={index}
                style={[
                  {
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                    borderColor,
                    borderRadius: radius[otpFieldRecipe.slot.radius],
                    borderWidth: otpFieldRecipe.slot.borderWidth,
                    flex: 1,
                    height: slotHeight,
                    justifyContent: "center",
                    maxWidth: metrics.slotSize,
                    minWidth: 0,
                  },
                  slotStyle,
                ]}
              >
                <Text
                  accessible={false}
                  align="center"
                  allowFontScaling={allowFontScaling}
                  style={[{ color: contentColor }, slotTextStyle]}
                  variant={metrics.textVariant}
                >
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>
        <FieldMessage
          {...(error === undefined ? {} : { error })}
          {...(supportText === undefined ? {} : { supportText })}
        />
      </View>
    </View>
  );
});

export type ChoiceVisualRenderProps = Readonly<{
  checked: CheckboxState;
  selected: boolean;
  disabled: boolean;
  readOnly: boolean;
  color: string;
  size: number;
}>;

type ChoiceVisualProps = Readonly<{
  presentation?: SelectionControlPresentation;
  size?: SelectionControlSize;
  indicator?: "default" | "none";
  style?: StyleProp<ViewStyle>;
  controlStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  leadingStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}>;

type ChoiceRowProps = ChoiceVisualProps & Readonly<{
  kind: "checkbox" | "radio";
  label: string;
  description?: string | undefined;
  checked: CheckboxState;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  readOnlyLabel?: string | undefined;
  requiredLabel?: string | undefined;
  invalidLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  leading?: ReactNode | undefined;
  renderLeading?: ((props: ChoiceVisualRenderProps) => ReactNode) | undefined;
  renderIndicator?: ((props: ChoiceVisualRenderProps) => ReactNode) | undefined;
  onActivate: () => void;
}>;

function ChoiceRow({
  kind,
  label,
  description,
  checked,
  disabled,
  readOnly,
  required,
  invalid,
  readOnlyLabel,
  requiredLabel,
  invalidLabel,
  accessibilityHint,
  presentation = selectionControlRecipe.defaults.presentation,
  size = selectionControlRecipe.defaults.size,
  indicator = "default",
  leading,
  renderLeading,
  renderIndicator,
  onActivate,
  style,
  controlStyle,
  indicatorStyle,
  leadingStyle,
  contentStyle,
  labelStyle,
  descriptionStyle,
}: ChoiceRowProps) {
  const theme = useHjmNativeTheme();
  const metrics = selectionControlRecipe.sizes[size];
  const plate = selectionControlRecipe.presentations[presentation];
  const selected = checked === true || checked === "mixed";
  const indicatorColor = resolveColorReference(
    selectionControlRecipe.states.indicator,
    theme.palette,
  );
  const appearance: ChoiceVisualRenderProps = {
    checked,
    selected,
    disabled,
    readOnly,
    color: indicatorColor,
    size: metrics.control,
  };
  const resolvedLeading = leading ?? renderLeading?.(appearance);
  const plateBackground = selected
    ? selectionControlRecipe.states.selectedBackground
    : plate.background ?? selectionControlRecipe.states.idleBackground;
  const plateBorder = invalid
    ? selectionControlRecipe.states.invalidBorder
    : selected
      ? selectionControlRecipe.states.selectedBorder
      : plate.border;
  const controlBorder = invalid
    ? selectionControlRecipe.states.invalidBorder
    : selected
      ? selectionControlRecipe.states.checkedBorder
      : selectionControlRecipe.states.idleBorder;
  const resolvedHint = [
    accessibilityHint ?? description,
    required ? requiredLabel : undefined,
    readOnly ? readOnlyLabel : undefined,
    invalid ? invalidLabel : undefined,
  ].filter(Boolean).join(". ") || undefined;
  const defaultIndicator = kind === "radio" ? (
    checked === true ? (
      <View
        style={{
          backgroundColor: indicatorColor,
          borderRadius: radius.full,
          height: metrics.control * selectionControlRecipe.radioDotRatio,
          width: metrics.control * selectionControlRecipe.radioDotRatio,
        }}
      />
    ) : null
  ) : checked === "mixed" ? (
    <Text accessible={false} align="center" style={{ color: indicatorColor }} variant="label">−</Text>
  ) : checked ? (
    <Text accessible={false} align="center" style={{ color: indicatorColor }} variant="label">✓</Text>
  ) : null;

  return (
    <Pressable
      accessibilityHint={resolvedHint}
      accessibilityLabel={label}
      accessibilityRole={kind}
      accessibilityState={{ checked, disabled: disabled || readOnly }}
      disabled={disabled || readOnly}
      hitSlop={plate.useSizePadding ? 0 : metrics.hitSlop}
      onPress={() => {
        if (!readOnly) onActivate();
      }}
      style={({ pressed }) => [
        {
          alignItems: "center",
          alignSelf: "stretch",
          backgroundColor: resolveColorReference(plateBackground, theme.palette),
          borderColor: plateBorder
            ? resolveColorReference(plateBorder, theme.palette)
            : "transparent",
          borderRadius: radius[plate.radius],
          borderWidth: plate.borderWidth,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: metrics.gap,
          minHeight: metrics.rowMinHeight,
          opacity: disabled
            ? selectionControlRecipe.states.disabledOpacity
            : pressed && !readOnly
              ? 0.86
              : 1,
          paddingHorizontal: plate.useSizePadding ? metrics.paddingHorizontal : 0,
          paddingVertical: plate.useSizePadding ? metrics.paddingVertical : 0,
        },
        style,
      ]}
    >
      {indicator === "default" ? (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            {
              alignItems: "center",
              backgroundColor: resolveColorReference(
                selected
                  ? selectionControlRecipe.states.checkedBackground
                  : selectionControlRecipe.states.idleBackground,
                theme.palette,
              ),
              borderColor: resolveColorReference(controlBorder, theme.palette),
              borderRadius: radius[selectionControlRecipe.shapes[kind]],
              borderWidth: 1,
              height: metrics.control,
              justifyContent: "center",
              width: metrics.control,
            },
            controlStyle,
          ]}
        >
          <View style={indicatorStyle}>
            {renderIndicator?.(appearance) ?? defaultIndicator}
          </View>
        </View>
      ) : null}
      {resolvedLeading ? (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={leadingStyle}
        >
          {resolvedLeading}
        </View>
      ) : null}
      <View style={[{ flex: 1, gap: spacing.xxs, minWidth: 0 }, contentStyle]}>
        <Text
          style={[
            {
              color: resolveColorReference(selectionControlRecipe.label.color, theme.palette),
              fontWeight: selected
                ? selectionControlRecipe.label.checkedFontWeight
                : selectionControlRecipe.label.fontWeight,
            },
            labelStyle,
          ]}
          variant={metrics.labelVariant}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={[
              {
                color: resolveColorReference(
                  selectionControlRecipe.description.color,
                  theme.palette,
                ),
              },
              descriptionStyle,
            ]}
            variant={metrics.descriptionVariant}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export type CheckboxProps = ChoiceVisualProps & Readonly<{
  label: string;
  checked?: CheckboxState;
  defaultChecked?: CheckboxState;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  description?: string;
  readOnlyLabel?: string;
  requiredLabel?: string;
  invalidLabel?: string;
  leading?: ReactNode;
  renderLeading?: (props: ChoiceVisualRenderProps) => ReactNode;
  renderIndicator?: (props: ChoiceVisualRenderProps) => ReactNode;
  accessibilityHint?: string;
}>;

export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  description,
  readOnlyLabel,
  requiredLabel,
  invalidLabel,
  leading,
  renderLeading,
  renderIndicator,
  accessibilityHint,
  ...visual
}: CheckboxProps) {
  const [selected, setSelected] = useControllableState<CheckboxState>({
    ...(checked === undefined ? {} : { value: checked }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined
      ? {}
      : { onChange: (next: CheckboxState) => onCheckedChange(next === true) }),
  });
  return (
    <ChoiceRow
      {...visual}
      accessibilityHint={accessibilityHint}
      checked={selected}
      description={description}
      disabled={disabled}
      indicator={visual.indicator ?? "default"}
      invalid={invalid}
      invalidLabel={invalidLabel}
      kind="checkbox"
      label={label}
      leading={leading}
      onActivate={() => setSelected(getCheckboxNextState(selected))}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      renderIndicator={renderIndicator}
      renderLeading={renderLeading}
      required={required}
      requiredLabel={requiredLabel}
    />
  );
}

export type RadioProps = ChoiceVisualProps & Readonly<{
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: true) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  description?: string;
  readOnlyLabel?: string;
  requiredLabel?: string;
  invalidLabel?: string;
  leading?: ReactNode;
  renderLeading?: (props: ChoiceVisualRenderProps) => ReactNode;
  renderIndicator?: (props: ChoiceVisualRenderProps) => ReactNode;
  accessibilityHint?: string;
}>;

/** Standalone native radio item. Prefer RadioGroup when group state is owned here. */
export function Radio({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  description,
  readOnlyLabel,
  requiredLabel,
  invalidLabel,
  leading,
  renderLeading,
  renderIndicator,
  accessibilityHint,
  ...visual
}: RadioProps) {
  const [selected, setSelected] = useControllableState<boolean>({
    ...(checked === undefined ? {} : { value: checked }),
    defaultValue: defaultChecked,
    ...(onCheckedChange === undefined
      ? {}
      : { onChange: (next: boolean) => next && onCheckedChange(true) }),
  });
  return (
    <ChoiceRow
      {...visual}
      accessibilityHint={accessibilityHint}
      checked={selected}
      description={description}
      disabled={disabled}
      indicator={visual.indicator ?? "default"}
      invalid={invalid}
      invalidLabel={invalidLabel}
      kind="radio"
      label={label}
      leading={leading}
      onActivate={() => setSelected(true)}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      renderIndicator={renderIndicator}
      renderLeading={renderLeading}
      required={required}
      requiredLabel={requiredLabel}
    />
  );
}

export type RadioGroupItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  description?: string;
  disabled?: boolean;
  accessibilityHint?: string;
  leading?: ReactNode;
}>;

/** @deprecated Use the renderer-neutral `RadioGroupItem` name. */
export type RadioOption<Value extends string = string> = RadioGroupItem<Value>;

type ChoiceGroupVisualProps = ChoiceVisualProps & Readonly<{
  orientation?: SelectionOrientation;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  description?: string;
  error?: string;
  required?: boolean;
  requiredLabel?: string;
  readOnlyLabel?: string;
  invalidLabel?: string;
}>;

type RadioGroupCollectionProps<Value extends string> =
  | Readonly<{
      items: readonly RadioGroupItem<Value>[];
      options?: never;
    }>
  | Readonly<{
      items?: never;
      /** @deprecated Use the renderer-neutral `items` prop. */
      options: readonly RadioOption<Value>[];
    }>;

export type RadioGroupProps<Value extends string = string> = ChoiceGroupVisualProps &
  RadioGroupCollectionProps<Value> & Readonly<{
    label?: string | undefined;
    accessibilityLabel?: string | undefined;
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value | null) => void;
    renderLeading?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
  }>;

function resolveAliasedItems<Item>(
  component: "RadioGroup" | "SegmentedControl",
  items: readonly Item[] | undefined,
  options: readonly Item[] | undefined,
): readonly Item[] {
  if ((items === undefined) === (options === undefined)) {
    throw new TypeError(`${component} requires exactly one of items or options`);
  }
  return items ?? options!;
}

function ChoiceGroupFrame({
  label,
  accessibilityLabel,
  required,
  requiredLabel,
  readOnly,
  readOnlyLabel,
  disabled,
  description,
  error,
  role,
  orientation,
  presentation,
  style,
  children,
}: Readonly<{
  label?: string | undefined;
  accessibilityLabel?: string | undefined;
  required: boolean;
  requiredLabel?: string | undefined;
  readOnly: boolean;
  readOnlyLabel?: string | undefined;
  disabled: boolean;
  description?: string | undefined;
  error?: string | undefined;
  role?: "radiogroup" | undefined;
  orientation: SelectionOrientation;
  presentation: SelectionControlPresentation;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}>) {
  const theme = useHjmNativeTheme();
  const id = useId().replaceAll(":", "");
  const labelId = `${id}-label`;
  const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Choice group");
  const announcedName = [
    accessibleName,
    required ? requiredLabel ?? "*" : undefined,
    readOnly ? readOnlyLabel : undefined,
  ].filter(Boolean).join(", ");
  const gap = selectionGroupRecipe.orientations[orientation].gap[presentation];
  return (
    <View
      accessibilityHint={[error ?? description, readOnly ? readOnlyLabel : undefined]
        .filter(Boolean).join(". ") || undefined}
      accessibilityLabel={announcedName}
      accessibilityLabelledBy={label ? labelId : undefined}
      accessibilityRole={role}
      accessibilityState={{ disabled: disabled || readOnly }}
      accessibilityValue={error ? { text: error } : undefined}
      style={[{ direction: theme.environment.direction, gap: selectionGroupRecipe.supportGap }, style]}
    >
      {label ? (
        <Text nativeID={labelId} tone="primary" variant={selectionGroupRecipe.label.textVariant}>
          {label}{required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""}
        </Text>
      ) : null}
      <View
        style={{
          direction: theme.environment.direction,
          flexDirection: orientation === "horizontal" && theme.environment.textScale < 1.6
            ? "row"
            : "column",
          gap,
        }}
      >
        {children}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" tone="danger" variant={selectionGroupRecipe.error.textVariant}>
          {error}
        </Text>
      ) : description ? (
        <Text tone="muted" variant={selectionGroupRecipe.description.textVariant}>{description}</Text>
      ) : null}
    </View>
  );
}

export function RadioGroup<Value extends string = string>({
  label,
  accessibilityLabel,
  items,
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
  invalidLabel,
  orientation = selectionGroupBehaviorDefaults.orientation,
  presentation = selectionGroupRecipe.defaults.presentation,
  size = selectionControlRecipe.defaults.size,
  indicator = "default",
  renderLeading,
  renderIndicator,
  style,
  ...slotStyles
}: RadioGroupProps<Value>) {
  const resolvedItems = resolveAliasedItems("RadioGroup", items, options);
  const selectionItems = resolvedItems.map((item) => ({
    id: item.value,
    label: item.label,
    ...(item.description === undefined ? {} : { description: item.description }),
    ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
  }));
  validateSelectionItems(selectionItems);
  if (value !== undefined) validateRadioSelection(selectionItems, value);
  const initialRef = useRef<Readonly<{ value: Value | null }> | null>(null);
  initialRef.current ??= {
    value: resolveInitialRadioValue(selectionItems, value ?? defaultValue, required),
  };
  const [storedValue, setSelected] = useControllableState<Value | null>({
    ...(value === undefined ? {} : { value }),
    defaultValue: initialRef.current.value,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const selected = reconcileRadioSelection(selectionItems, storedValue, required);
  useEffect(() => {
    if (value === undefined && selected !== storedValue) setSelected(selected);
  }, [selected, setSelected, storedValue, value]);
  const hasError = invalid || error !== undefined;
  return (
    <ChoiceGroupFrame
      accessibilityLabel={accessibilityLabel}
      description={description}
      disabled={disabled}
      error={error}
      label={label}
      orientation={orientation}
      presentation={presentation}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      required={required}
      requiredLabel={requiredLabel}
      role="radiogroup"
      style={style}
    >
      {resolvedItems.map((item) => {
        const optionDisabled = disabled || item.disabled === true;
        const optionSelected = selected === item.value;
        return (
          <ChoiceRow
            {...slotStyles}
            key={item.value}
            accessibilityHint={item.accessibilityHint}
            checked={optionSelected}
            description={item.description}
            disabled={optionDisabled}
            indicator={indicator}
            invalid={hasError}
            invalidLabel={invalidLabel ?? error}
            kind="radio"
            label={item.label}
            leading={item.leading}
            onActivate={() => setSelected(item.value)}
            presentation={presentation}
            readOnly={readOnly}
            readOnlyLabel={readOnlyLabel}
            renderIndicator={renderIndicator ? (props) => renderIndicator(item, props) : undefined}
            renderLeading={renderLeading ? (props) => renderLeading(item, props) : undefined}
            required={required}
            requiredLabel={requiredLabel}
            size={size}
          />
        );
      })}
    </ChoiceGroupFrame>
  );
}

export type CheckboxGroupProps<Value extends string = string> = ChoiceGroupVisualProps &
  CheckboxGroupSelection<Value> & Readonly<{
    label?: string;
    accessibilityLabel?: string;
    items: readonly SelectionItemDescriptor<Value>[];
    renderLeading?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: SelectionItemDescriptor<Value>, props: ChoiceVisualRenderProps) => ReactNode;
  }>;

/** Validated controlled/uncontrolled checkbox collection using immutable Sets. */
export function CheckboxGroup<Value extends string = string>({
  label,
  accessibilityLabel,
  items,
  value,
  defaultValue = new Set<Value>(),
  onValueChange,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  description,
  error,
  requiredLabel,
  readOnlyLabel,
  invalidLabel,
  orientation = selectionGroupBehaviorDefaults.orientation,
  presentation = selectionGroupRecipe.defaults.presentation,
  size = selectionControlRecipe.defaults.size,
  indicator = "default",
  renderLeading,
  renderIndicator,
  style,
  ...slotStyles
}: CheckboxGroupProps<Value>) {
  validateSelectionItems(items);
  if (value !== undefined) validateCheckboxSelection(items, value);
  const [storedValue, setSelected] = useControllableState<ReadonlySet<Value>>({
    ...(value === undefined ? {} : { value }),
    defaultValue,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const selected = reconcileCheckboxSelection(items, storedValue);
  useEffect(() => {
    if (value === undefined && selected !== storedValue) setSelected(selected);
  }, [selected, setSelected, storedValue, value]);
  const hasError = invalid || error !== undefined;
  return (
    <ChoiceGroupFrame
      accessibilityLabel={accessibilityLabel}
      description={description}
      disabled={disabled}
      error={error}
      label={label}
      orientation={orientation}
      presentation={presentation}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      required={required}
      requiredLabel={requiredLabel}
      style={style}
    >
      {items.map((item) => {
        const optionDisabled = disabled || item.disabled === true;
        const optionSelected = selected.has(item.id);
        return (
          <ChoiceRow
            {...slotStyles}
            key={item.id}
            checked={optionSelected}
            description={item.description}
            disabled={optionDisabled}
            indicator={indicator}
            invalid={hasError}
            invalidLabel={invalidLabel ?? error}
            kind="checkbox"
            label={item.label}
            onActivate={() => setSelected(toggleCheckboxSelection(items, selected, item.id))}
            presentation={presentation}
            readOnly={readOnly}
            readOnlyLabel={readOnlyLabel}
            renderIndicator={renderIndicator ? (props) => renderIndicator(item, props) : undefined}
            renderLeading={renderLeading ? (props) => renderLeading(item, props) : undefined}
            required={required}
            requiredLabel={requiredLabel}
            size={size}
          />
        );
      })}
    </ChoiceGroupFrame>
  );
}

type SwitchBaseProps = Omit<
  NativeSwitchProps,
  | "accessibilityHint"
  | "accessibilityLabel"
  | "defaultValue"
  | "onValueChange"
  | "style"
  | "value"
> &
  Readonly<{
    label: string;
    description?: string;
    size?: SwitchSize;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
  }>;

type SwitchCanonicalStateProps = Readonly<{
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: never;
  defaultValue?: never;
  onValueChange?: never;
}>;

type SwitchLegacyStateProps = Readonly<{
  checked?: never;
  defaultChecked?: never;
  onCheckedChange?: never;
  /** @deprecated Use the renderer-neutral `checked` prop. */
  value?: boolean;
  /** @deprecated Use the renderer-neutral `defaultChecked` prop. */
  defaultValue?: boolean;
  /** @deprecated Use the renderer-neutral `onCheckedChange` prop. */
  onValueChange?: (value: boolean) => void;
}>;

export type SwitchProps = SwitchBaseProps &
  (SwitchCanonicalStateProps | SwitchLegacyStateProps);

export function Switch({
  label,
  description,
  size = switchRecipe.defaults.size,
  checked,
  defaultChecked,
  onCheckedChange,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...props
}: SwitchProps) {
  const hasCanonicalState = checked !== undefined
    || defaultChecked !== undefined
    || onCheckedChange !== undefined;
  const hasLegacyState = value !== undefined
    || defaultValue !== undefined
    || onValueChange !== undefined;
  if (hasCanonicalState && hasLegacyState) {
    throw new TypeError(
      "Switch cannot mix checked/defaultChecked/onCheckedChange with value/defaultValue/onValueChange",
    );
  }
  const resolvedChecked = checked ?? value;
  const resolvedDefaultChecked = defaultChecked ?? defaultValue ?? false;
  const resolvedOnCheckedChange = onCheckedChange ?? onValueChange;
  const { colors, environment } = useHjmNativeTheme();
  const dimensions = switchRecipe.sizes[size];
  const [enabled, setEnabled] = useControllableState({
    ...(resolvedChecked === undefined ? {} : { value: resolvedChecked }),
    defaultValue: resolvedDefaultChecked,
    ...(resolvedOnCheckedChange === undefined
      ? {}
      : { onChange: resolvedOnCheckedChange }),
  });
  return (
    <Pressable
      accessibilityHint={accessibilityHint ?? description}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled }}
      disabled={disabled}
      onPress={() => setEnabled(!enabled)}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          direction: environment.direction,
          flexDirection: "row",
          gap: spacing.sm,
          minHeight: description
            ? switchRecipe.rowTwoLineMinHeight
            : switchRecipe.rowMinHeight,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <Text tone="body" variant="bodyLarge">{label}</Text>
        {description ? (
          <Text tone="muted" variant="caption">{description}</Text>
        ) : null}
      </View>
      <NativeSwitch
        {...props}
        accessible={false}
        disabled={disabled}
        ios_backgroundColor={colors.surfaceAlt}
        pointerEvents="none"
        style={{ height: dimensions.height, width: dimensions.width }}
        thumbColor={colors.bg}
        trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
        value={enabled}
      />
    </Pressable>
  );
}

export type SegmentedControlItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
  leading?: ReactNode;
  renderLeading?: (props: SegmentedControlLeadingRenderProps) => ReactNode;
}>;

/** @deprecated Use the renderer-neutral `SegmentedControlItem` name. */
export type SegmentedControlOption<Value extends string = string> =
  SegmentedControlItem<Value>;

export type SegmentedControlLeadingRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: string;
  size: number;
}>;

type SegmentedControlCollectionProps<Value extends string> =
  | Readonly<{
      items: readonly SegmentedControlItem<Value>[];
      options?: never;
    }>
  | Readonly<{
      items?: never;
      /** @deprecated Use the renderer-neutral `items` prop. */
      options: readonly SegmentedControlOption<Value>[];
    }>;

export type SegmentedControlProps<Value extends string = string> =
  SegmentedControlCollectionProps<Value> & Readonly<{
    label: string;
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    size?: SegmentedControlSize;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
  }>;

export function SegmentedControl<Value extends string = string>({
  label,
  items,
  options,
  value,
  defaultValue,
  onValueChange,
  size = segmentedControlRecipe.defaults.size,
  disabled = false,
  style,
}: SegmentedControlProps<Value>) {
  const resolvedItems = resolveAliasedItems("SegmentedControl", items, options);
  const theme = useHjmNativeTheme();
  const { environment } = theme;
  const sizeContract = segmentedControlRecipe.sizes[size];
  const stacked = segmentedControlRecipe.adaptive.largeTextLayout === "stacked"
    && environment.textScale >= segmentedControlRecipe.adaptive.stackAtFontScale;
  const descriptors = resolvedItems.map((item) => ({
      id: item.value,
      label: item.label,
      ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
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
          backgroundColor: resolveColorReference(
            segmentedControlRecipe.container.background,
            theme.palette,
          ),
          borderColor: resolveColorReference(
            segmentedControlRecipe.container.border,
            theme.palette,
          ),
          borderRadius: radius[segmentedControlRecipe.container.radius],
          borderWidth: segmentedControlRecipe.container.borderWidth,
          direction: environment.direction,
          flexDirection: stacked ? "column" : "row",
          gap: segmentedControlRecipe.container.gap,
          padding: segmentedControlRecipe.container.padding,
        },
        style,
      ]}
    >
      {resolvedItems.map((item) => {
        const isSelected = item.value === selected;
        const optionDisabled = disabled || item.disabled === true;
        const contentColor = resolveColorReference(
          isSelected
            ? segmentedControlRecipe.item.selectedContent
            : segmentedControlRecipe.item.idleContent,
          theme.palette,
        );
        const leading = item.leading ?? item.renderLeading?.({
          selected: isSelected,
          disabled: optionDisabled,
          color: contentColor,
          size: glyph.sm,
        });
        return (
          <Pressable
            key={item.value}
            accessibilityLabel={item.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: optionDisabled }}
            disabled={optionDisabled}
            hitSlop={sizeContract.hitSlop}
            onPress={() => setSelected(item.value)}
            style={({ pressed }) => [
              {
                alignItems: "center",
                backgroundColor: isSelected
                  ? resolveColorReference(
                      segmentedControlRecipe.item.selectedBackground,
                      theme.palette,
                    )
                  : "transparent",
                borderColor: isSelected
                  ? resolveColorReference(
                      segmentedControlRecipe.item.selectedBorder,
                      theme.palette,
                    )
                  : "transparent",
                borderRadius: radius[segmentedControlRecipe.item.radius],
                borderWidth: isSelected
                  ? segmentedControlRecipe.item.selectedBorderWidth
                  : 0,
                flex: stacked ? undefined : 1,
                gap: segmentedControlRecipe.item.gap,
                justifyContent: "center",
                minHeight: sizeContract.minHeight,
                opacity: optionDisabled
                  ? segmentedControlRecipe.item.disabledOpacity
                  : pressed
                    ? segmentedControlRecipe.item.pressedOpacity
                    : 1,
                paddingHorizontal: sizeContract.paddingHorizontal,
                width: stacked ? "100%" : undefined,
              },
            ]}
          >
            {leading ? (
              <View
                accessibilityElementsHidden
                accessible={false}
                importantForAccessibility="no-hide-descendants"
              >
                {leading}
              </View>
            ) : null}
            <Text
              align="center"
              style={{
                color: contentColor,
                fontWeight: isSelected
                  ? segmentedControlRecipe.item.selectedFontWeight
                  : segmentedControlRecipe.item.fontWeight,
              }}
              tone={isSelected ? "brand" : "muted"}
              variant={sizeContract.textVariant}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type ChipBaseProps = Readonly<{
  label: string;
  size?: ChipSize;
  disabled?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  leadingStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  trailingStyle?: StyleProp<ViewStyle>;
  renderSelectionIndicator?: (props: Readonly<{
    selected: boolean;
    color: string;
    size: number;
  }>) => ReactNode;
}>;

type ActionChipProps = Readonly<{
  selectionMode?: "action";
  selected?: never;
  onPress: (event: GestureResponderEvent) => void;
}>;

type SelectionChipProps = Readonly<{
  selectionMode: "single" | "multiple";
  /** Product-owned controlled selection. */
  selected: boolean;
  onPress: (selected: boolean, event: GestureResponderEvent) => void;
}>;

export type ChipProps = ChipBaseProps & (ActionChipProps | SelectionChipProps);

/** Action/filter chip with role-specific, controlled selection semantics. */
export function Chip({
  label,
  size = chipRecipe.defaults.size,
  disabled = false,
  leading,
  trailing,
  accessibilityLabel,
  accessibilityHint,
  style,
  leadingStyle,
  indicatorStyle,
  labelStyle,
  trailingStyle,
  renderSelectionIndicator,
  selectionMode = "action",
  selected,
  onPress,
}: ChipProps) {
  const theme = useHjmNativeTheme();
  const selectable = selectionMode !== "action";
  const active = selectable && selected === true;
  const metrics = chipRecipe.sizes[size];
  const presentation = chipRecipe.states[active ? "selected" : "idle"];
  const contentColor = resolveColorReference(presentation.content, theme.palette);
  const indicatorColor = resolveColorReference(
    chipRecipe.selectionIndicator.color,
    theme.palette,
  );
  const role = selectionMode === "single" ? "radio" : selectionMode === "multiple" ? "checkbox" : "button";
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={role}
      accessibilityState={selectable ? { checked: active, disabled } : { disabled }}
      disabled={disabled}
      hitSlop={metrics.hitSlop}
      onPress={(event) => {
        if (selectionMode === "action") {
          (onPress as (event: GestureResponderEvent) => void)(event);
        } else {
          (onPress as (selected: boolean, event: GestureResponderEvent) => void)(
            !active,
            event,
          );
        }
      }}
      style={({ pressed }) => [
        {
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: resolveColorReference(presentation.background, theme.palette),
          borderColor: resolveColorReference(presentation.border, theme.palette),
          borderRadius: radius[chipRecipe.radius],
          borderWidth: chipRecipe.borderWidth,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: metrics.gap,
          height: metrics.height,
          opacity: disabled
            ? chipRecipe.states.disabledOpacity
            : pressed
              ? chipRecipe.states.pressedOpacity
              : 1,
          paddingHorizontal: metrics.paddingHorizontal,
        },
        style,
      ]}
    >
      {leading ? <View accessible={false} style={leadingStyle}>{leading}</View> : null}
      {active ? (
        <View accessible={false} style={indicatorStyle}>
          {renderSelectionIndicator ? (
            renderSelectionIndicator({
              selected: active,
              color: indicatorColor,
              size: glyph[chipRecipe.selectionIndicator.glyph],
            })
          ) : (
            <Text style={{ color: indicatorColor }} variant="caption">✓</Text>
          )}
        </View>
      ) : null}
      <Text
        align="center"
        style={[
          {
            color: contentColor,
            fontWeight: active
              ? chipRecipe.label.selectedFontWeight
              : chipRecipe.label.fontWeight,
          },
          labelStyle,
        ]}
        variant={metrics.textVariant}
      >
        {label}
      </Text>
      {trailing ? <View accessible={false} style={trailingStyle}>{trailing}</View> : null}
    </Pressable>
  );
}
