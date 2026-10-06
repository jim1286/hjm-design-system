import { FixedGlyph } from "./internal/fixed-glyph.js";
import { FieldMessage, NativeFieldFrame } from "./internal/field-frame.js";
import type { FieldPrivateProps } from "./internal/field-private.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  glyph,
  radius,
  spacing,
  typography,
} from "@hjmds/design-contracts/foundations";
import {
  fieldRecipe,
  type FieldAlign,
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
  type SwitchPresentation,
} from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
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
  type OtpFieldPresentation,
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
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Switch as NativeSwitch,
  Text as NativeText,
  TextInput,
  View,
  type StyleProp,
  type GestureResponderEvent,
  type SwitchProps as NativeSwitchProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { webChoiceProps, webOnly } from "./internal/web-a11y.js";
import {
  logicalTextAlign,
  minimumTargetStyle,
  resolveNativeTextScaleProps,
} from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";

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
    /**
     * Upper bound for a growing multiline field, in visible lines. Height is
     * recipe-owned, so this semantic axis replaces `inputStyle={{ maxHeight }}`.
     */
    maxVisibleLines?: number;
    /**
     * Lower bound for a growing multiline field, in visible lines. Height is
     * recipe-owned, so this semantic axis replaces `inputStyle={{ minHeight }}`.
     */
    minVisibleLines?: number;
    /**
     * Text placement inside the control. `start` follows the resolved
     * direction; `center` suits a short, ceremonial single value such as a
     * nickname or a code. Replaces `inputStyle={{ textAlign }}`.
     */
    align?: FieldAlign;
    onValueChange?: (value: string) => void;
    /** Helper copy below the control; the same name as the Web renderer. */
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
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
    throw new TypeError(
      "Field requires a non-empty label or accessibilityLabel",
    );
  }
  return {
    accessibleName,
    ...(visibleLabel ? { visibleLabel } : {}),
  };
}

type FieldRendererProps = AccessibleFieldProps & FieldPrivateProps &
  Readonly<{
    multiline: boolean;
    search: boolean;
    /** Internal recipe sizing for PasswordField; never exposed as a product style override. */
    recipeInputStyle?: StyleProp<TextStyle>;
    /** Component recipe amount for fieldRecipe.disabledScope (PasswordField); defaults by `search`. */
    disabledOpacity?: number;
    searchSize?: SearchFieldSize;
    leading?: ReactNode;
    leadingAction?: ReactNode; trailing?: ReactNode;
  }>;

const FieldRenderer = forwardRef<TextInput, FieldRendererProps>(
  function FieldRenderer(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      description,
      error,
      required = false,
      disabled = false,
      busy = false,
      variant = fieldRecipe.defaults.variant,
      shape,
      accessibilityLabel,

      layoutStyle,
      allowFontScaling,
      multiline,
      maxVisibleLines,
      minVisibleLines,
      align = fieldRecipe.defaults.align,
      search,
      recipeInputStyle,
      disabledOpacity,
      searchSize = searchFieldRecipe.defaults.size,
      leading,
      trailing,
    leadingAction,
      hjmCompactMultiline = false,
      onBlur,
      onFocus,
      onContentSizeChange,
      onSelectionChange,
      ...props
    },
    ref,
  ) {
    const resolvedDisabledOpacity =
      disabledOpacity ?? (search ? searchFieldRecipe.states.disabledOpacity : fieldRecipe.disabledOpacity);
    const theme = useHjmNativeTheme();
    const { colors, environment, textScaling } = theme;
    const [focused, setFocused] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const inputRef = useRef<TextInput>(null);
    const restoreFocusRef = useRef(false);
    const selectionRef = useRef<{ start: number; end: number } | null>(null);
    const attachInput = useCallback((node: TextInput | null) => {
      if (node === null) restoreFocusRef.current = inputRef.current?.isFocused?.() ?? false;
      inputRef.current = node;
    }, []);
    const [currentValue, setCurrentValue] = useControllableState({
      ...(value === undefined ? {} : { value }),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const supportText = description;
    const hint = error ?? supportText;
    const { accessibleName, visibleLabel } = resolveFieldAccessibleName(
      label,
      accessibilityLabel,
    );
    const resolvedShape =
      shape ??
      (search ? searchFieldRecipe.defaults.shape : fieldRecipe.defaults.shape);
    const searchSizing = searchFieldRecipe.sizes[searchSize];
    const resolvedMaxVisibleLines =
      maxVisibleLines ?? fieldRecipe.multilineMaxVisibleLines;
    const borderWidth = search
      ? searchFieldRecipe.borderWidth
      : fieldRecipe.borderWidth;
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
    const backgroundColor =
      search && variant === fieldRecipe.defaults.variant
        ? resolveColorReference(
            searchFieldRecipe.colors.background,
            theme.palette,
          )
        : colors[fieldRecipe.variants[variant].background];
    const placeholderColor = search
      ? resolveColorReference(
          searchFieldRecipe.colors.placeholder,
          theme.palette,
        )
      : colors[fieldRecipe.placeholder.color];
    const textStyle =
      typography[search ? searchSizing.textVariant : fieldRecipe.textVariant];
    // Native TextInput scales its text without enlarging a fixed frame (BT-QA-020).
    // Size the one-line frame for the same scale instead of capping accessible text.
    const frameTextScale = textScaling.mode === "controlled"
      ? textScaling.scale
      : allowFontScaling === false
      ? 1
      : Math.min(textScaling.scale, props.maxFontSizeMultiplier && props.maxFontSizeMultiplier > 0 ? props.maxFontSizeMultiplier : Infinity);
    const singleLineMinHeight = Math.ceil(textStyle.lineHeight * frameTextScale + fieldRecipe.paddingVertical * 2 + borderWidth * 2);
    // iOS RCTUITextView updates typingAttributes/placeholder but leaves existing
    // attributed text at its old scale (BT-QA-025). Refresh only the native editor,
    // keeping the field's draft state and restoring focus/selection instead of capping text.
    const editorKey = Platform.OS === "ios" && multiline
      ? `multiline-${frameTextScale}`
      : "field";
    // Deps: only an editorKey remount changes the handle; none re-attached callback refs every render.
    useImperativeHandle(ref, () => inputRef.current as TextInput, [editorKey]);
    useLayoutEffect(() => {
      if (restoreFocusRef.current) {
        inputRef.current?.focus?.();
        const selection = props.selection ?? selectionRef.current;
        if (selection) inputRef.current?.setNativeProps?.({ selection });
        restoreFocusRef.current = false;
      }
    }, [editorKey, props.selection]);
    // A composer that should open several lines tall asks in lines, not pixels,
    // so the recipe keeps ownership of line height and vertical padding. Compact: see field-private.ts.
    const minHeight = multiline
      ? minVisibleLines === undefined
        ? fieldRecipe.multilineMinHeight
        : Math.max(
            hjmCompactMultiline ? fieldRecipe.minHeight : fieldRecipe.multilineMinHeight,
            textStyle.lineHeight * minVisibleLines +
              fieldRecipe.paddingVertical * 2,
          )
      : Math.max(search ? searchSizing.minHeight : fieldRecipe.minHeight, singleLineMinHeight);
    const controlRadius =
      radius[
        search
          ? searchFieldRecipe.shapes[resolvedShape]
          : fieldRecipe.shapes[resolvedShape]
      ];
    const inputTextScaleProps = resolveNativeTextScaleProps(
      textScaling,
      [
        {
          color: search
            ? resolveColorReference(
                searchFieldRecipe.colors.content,
                theme.palette,
              )
            : colors.text,
          flex: 1,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          lineHeight: textStyle.lineHeight,
          minHeight: minHeight - borderWidth * 2,
          // Explicit line bounds opt into content-driven composer sizing, without changing ordinary editors.
          ...(multiline && minVisibleLines !== undefined ? { height: Math.max(minHeight - borderWidth * 2, Math.min(currentValue ? contentHeight : 0, textStyle.lineHeight * (resolvedMaxVisibleLines ?? 1000) + fieldRecipe.paddingVertical * 2)) } : {}),
          ...(multiline &&
          resolvedMaxVisibleLines !== null &&
          resolvedMaxVisibleLines !== undefined
            ? {
                maxHeight:
                  textStyle.lineHeight * resolvedMaxVisibleLines +
                  fieldRecipe.paddingVertical * 2,
              }
            : {}),
          paddingHorizontal: 0,
          paddingVertical: fieldRecipe.paddingVertical,
          textAlign:
            align === "center"
              ? "center"
              : logicalTextAlign(environment.direction),
          textAlignVertical: multiline ? "top" : "center",
        },
        recipeInputStyle,
      ],
      allowFontScaling,
    );

    return (
      <NativeFieldFrame
        {...(visibleLabel === undefined ? {} : { label: visibleLabel })}
        required={required}
        {...(error === undefined ? {} : { error })}
        {...(supportText === undefined ? {} : { description: supportText })}
        // fieldRecipe.disabledScope (2026-10-06): label and control fade, the hint and the
        // error do not. This frame used to carry the opacity, which faded the support text
        // that explains the locked state; Web made the same change in the same release.
        {...(disabled ? { disabledOpacity: resolvedDisabledOpacity } : {})}
        style={layoutStyle}
      >
        <View
          style={{
            opacity: disabled ? resolvedDisabledOpacity : 1,
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
          {leadingAction ? <View style={{ alignSelf: "center" }}>{leadingAction}</View> : null}
          <TextInput
            key={editorKey}
            {...props}
            {...inputTextScaleProps}
            ref={attachInput}
            accessibilityHint={hint}
            accessibilityLabel={accessibleName}
            accessibilityRole={search ? "search" : undefined}
            accessibilityState={{ busy, disabled }}
            // SearchField `busy` means "results are loading", not "this value is being committed":
            // locking the editor dropped every keystroke typed while suggestions refreshed, while the
            // Web SearchField keeps typing under `aria-busy` (2026-10-06 parity follow-up). Plain
            // fields keep the lock because their busy means a pending save of the current value.
            editable={!disabled && (search || !busy)}
            multiline={multiline}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onContentSizeChange={event => {
              if (multiline && minVisibleLines !== undefined) setContentHeight(event.nativeEvent.contentSize.height);
              onContentSizeChange?.(event);
            }}
            onSelectionChange={event => {
              selectionRef.current = event.nativeEvent.selection;
              onSelectionChange?.(event);
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
      </NativeFieldFrame>
    );
  },
);

export type TextFieldProps = AccessibleFieldProps;

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline={false} search={false} />;
});

export type TextAreaProps = AccessibleFieldProps & Readonly<{ trailing?: ReactNode; leadingAction?: ReactNode }>;

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
  const inputRef = useRef<TextInput>(null);
  // Single-line child editor never remounts.
  useImperativeHandle(ref, () => inputRef.current as TextInput, []);
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
        inputRef.current?.focus();
      }}
      style={{
        alignItems: "center",
        height: searchSizing.clearDiameter,
        justifyContent: "center",
        width: searchSizing.clearDiameter,
      }}
    >
      {renderClearIcon?.(iconProps) ?? (
        <FixedGlyph tone="muted" fontSize={iconProps.size}>×</FixedGlyph>
      )}
    </Pressable>
  ) : trailingNode;
  return (
    <FieldRenderer
      {...props}
      ref={inputRef}
      busy={busy}
      disabled={disabled}
      leading={leading}
      multiline={false}
      onValueChange={(next) => {
        // Typing continues while busy (same as Web `loading`); only disabled ignores input.
        if (!disabled) setSearchValue(next);
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
  // Single-line child editor never remounts.
  useImperativeHandle(forwardedRef, () => inputRef.current as TextInput, []);
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
      // passwordFieldRecipe.states owns the amount; both renderers used the field default 0.6 until 2026-10-06.
      disabledOpacity={passwordFieldRecipe.states.disabledOpacity}
      recipeInputStyle={[
        size === "large"
          ? {
              fontSize: typography.bodyLarge.fontSize,
              lineHeight: typography.bodyLarge.lineHeight,
              minHeight: metrics.minHeight - (passwordFieldRecipe.frame.borderWidth * 2),
            }
          : undefined,
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
          // No `selected`: the label already names the next action, and VoiceOver
          // would read "Selected, Hide password" — the Native twin of the
          // `aria-pressed` the contract rules out (password-field.md, rationale 1).
          accessibilityState={{ disabled }}
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
    presentation?: OtpFieldPresentation;
    /**
     * @deprecated Raw slot style bypasses `otpFieldRecipe`. Use `size` and `presentation` for slot
     * appearance and `layoutStyle` for placement. Removed in the next major (consumer-policy.md §3.1).
     */
    slotStyle?: StyleProp<ViewStyle>;
    /**
     * @deprecated Raw slot text style bypasses `otpFieldRecipe`; `size` selects the digit typography.
     * Removed in the next major (consumer-policy.md §3.1).
     */
    slotTextStyle?: StyleProp<TextStyle>;
  }>;

/** One accessible numeric TextInput rendered through decorative OTP slots. */
export const OtpField = forwardRef<TextInput, OtpFieldProps>(function OtpField(
  {
    label,
    accessibilityLabel,
    description,
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
    presentation = "boxes",
    slotStyle,
    slotTextStyle,
    // Inherited from BaseFieldProps; before 1.13 it fell into `...props` and was spread onto the
    // hidden TextInput, so OtpField silently ignored its own canonical placement prop.
    layoutStyle,

    allowFontScaling,
    onBlur,
    onFocus,
    ...props
  },
  ref,
) {
  const supportText = description;
  const theme = useHjmNativeTheme();
  warnDeprecatedStyleProps(
    "OtpField",
    { slotStyle, slotTextStyle },
    "size/presentation for slot appearance and layoutStyle for placement",
  );
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
  // fieldRecipe.disabledScope: label and slots fade; the hint/error below keep full contrast.
  // The whole column used to fade (2026-10-06 change, same as Web).
  const disabledOpacity = disabled || busy ? otpFieldRecipe.states.disabledOpacity : 1;

  return (
    <View
      style={[
        { gap: fieldRecipe.label.gap },
        layoutStyle,
      ]}
    >
      {visibleLabel ? (
        <Text
          style={{
            color: theme.colors[fieldRecipe.label.color],
            fontWeight: fieldRecipe.label.fontWeight,
            opacity: disabledOpacity,
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
            maxWidth: metrics.slotSize * length + metrics.gap * (length - 1),
            opacity: disabledOpacity,
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
              // UIKit excludes views with opacity <= 0.01 from hit testing.
              // Keep it behind opaque, pointer-transparent slots: Android may paint
              // composing text despite a transparent text color.
              padding: 0,
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 0,
            }}
            textContentType="oneTimeCode"
            value={value}
          />
          <View
            pointerEvents="none"
            style={{ backgroundColor: theme.colors.bg, flexDirection: "row", gap: metrics.gap, width: "100%", zIndex: 1 }}
          >
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
                pointerEvents="none"
                key={index}
                style={[
                  {
                    alignItems: "center",
                    backgroundColor: theme.colors.bg,
                    borderColor,
                    borderRadius: presentation === "underline" ? 0 : radius[otpFieldRecipe.slot.radius],
                    // Underline changes only decoration; one TextInput still owns edits and autofill.
                    borderWidth: presentation === "underline" ? 0 : otpFieldRecipe.slot.borderWidth,
                    borderBottomWidth: presentation === "underline" ? 2 : otpFieldRecipe.slot.borderWidth,
                    flex: 1,
                    height: slotHeight,
                    justifyContent: "center",
                    maxWidth: metrics.slotSize,
                    minWidth: 0,
                    zIndex: 1,
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
  /** Canonical layout-only placement for the row (or the group frame). Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  controlStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  indicatorStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  leadingStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * @deprecated Raw visual style bypasses `selectionControlRecipe`. Use `layoutStyle` for placement and
   * `presentation`/`size`/`indicator`/`renderIndicator`/`renderLeading` for appearance. Removed in the
   * next major (consumer-policy.md §3.1).
   */
  descriptionStyle?: StyleProp<TextStyle>;
}>;

const choiceVisualReplacement =
  "layoutStyle for placement and presentation/size/indicator/renderIndicator/renderLeading for appearance";

/** Public choice components share one deprecated slot list; ChoiceRow itself stays silent. */
function warnChoiceVisualStyles(component: string, visual: ChoiceVisualProps): void {
  warnDeprecatedStyleProps(
    component,
    {
      style: visual.style,
      controlStyle: visual.controlStyle,
      indicatorStyle: visual.indicatorStyle,
      leadingStyle: visual.leadingStyle,
      contentStyle: visual.contentStyle,
      labelStyle: visual.labelStyle,
      descriptionStyle: visual.descriptionStyle,
    },
    choiceVisualReplacement,
  );
}

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
  /** Roving tabindex position inside a radio group. Web renderer only. */
  webTabIndex?: number | undefined;
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
  webTabIndex,
  layoutStyle,
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
  // Selection marks are artwork inside a fixed box, not readable copy. HJM Text
  // applies controlled textScale even with allowFontScaling=false, clipping at 200%.
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
  ) : checked ? (
    <NativeText accessible={false} allowFontScaling={false} style={{ ...typography.label, color: indicatorColor, textAlign: "center" }}>{checked === "mixed" ? "−" : "✓"}</NativeText>
  ) : null;

  return (
    <Pressable
      accessibilityHint={resolvedHint}
      accessibilityLabel={label}
      accessibilityRole={kind}
      // See mixedCheckboxState: a checkbox leaving "mixed" kept the suffix on Android.
      accessibilityState={kind === "checkbox" ? mixedCheckboxState(checked, { disabled: disabled || readOnly }) : { checked, disabled: disabled || readOnly }}
      {...webOnly(webChoiceProps({
        kind,
        checked,
        disabled,
        readOnly,
        onActivate,
        ...(webTabIndex === undefined ? {} : { tabIndex: webTabIndex }),
      }))}
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
        layoutStyle,
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
  warnChoiceVisualStyles("Checkbox", visual);
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
  warnChoiceVisualStyles("Radio", visual);
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

type RadioGroupCollectionProps<Value extends string> = Readonly<{ items: readonly RadioGroupItem<Value>[] }>;

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
  layoutStyle,
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
  layoutStyle?: HjmCompositionStyleProp | undefined;
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
      style={[{ direction: theme.environment.direction, gap: selectionGroupRecipe.supportGap }, style, layoutStyle]}
    >
      {label ? (
        <Text nativeID={labelId} tone="primary" variant={selectionGroupRecipe.label.textVariant}>
          {label}{required ? requiredLabel ? ` (${requiredLabel})` : " *" : ""}
        </Text>
      ) : null}
      {/* selectionGroupRecipe.slots order label → description → items → error, as Web RadioGroup/CheckboxGroup.
          Until 2026-10-06 Native put the description under the options; an error still replaces it. */}
      {description && !error ? (
        <Text tone="muted" variant={selectionGroupRecipe.description.textVariant}>{description}</Text>
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
      ) : null}
    </View>
  );
}

export function RadioGroup<Value extends string = string>(props: RadioGroupProps<Value>) {
  const {
  label,
  accessibilityLabel,
  items,
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
  layoutStyle,
  style,
  ...slotStyles
} = props;
  // Group `style` paints the frame; the remaining slot styles reach every row.
  warnChoiceVisualStyles("RadioGroup", { style, ...slotStyles });
  // Removed aliases must not silently change the selected collection in JavaScript callers.
  if ("options" in props || !Array.isArray(items)) throw new TypeError("RadioGroup requires items; options was removed");
  const resolvedItems = items;
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
  // A radio group is one tab stop: the selected option holds it, or the first
  // enabled option when nothing is selected yet.
  const webTabStop = selected ?? selectionItems.find((item) => !item.disabled)?.id;
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
      layoutStyle={layoutStyle}
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
            webTabIndex={!optionDisabled && !readOnly && item.value === webTabStop ? 0 : -1}
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
  layoutStyle,
  style,
  ...slotStyles
}: CheckboxGroupProps<Value>) {
  warnChoiceVisualStyles("CheckboxGroup", { style, ...slotStyles });
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
      layoutStyle={layoutStyle}
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
    /** Use inside a labelled ListRow; the accessible name and hint remain present. */
    labelVisibility?: "visible" | "hidden";
    description?: string;
    presentation?: SwitchPresentation;
    size?: SwitchSize;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `switchRecipe`. Use `layoutStyle` for placement and
     * `presentation`/`size` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
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

export type SwitchProps = SwitchBaseProps & SwitchCanonicalStateProps;

export function Switch({
  label,
  labelVisibility = "visible",
  presentation = switchRecipe.presentationDefaults.native,
  testID,
  description,
  size = switchRecipe.defaults.size,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  layoutStyle,
  style,
  ...props
}: SwitchProps) {
  // Reject old JavaScript callers rather than silently dropping their controlled state.
  if (["value", "defaultValue", "onValueChange"].some(key => key in props)) {
    throw new TypeError("Switch no longer accepts value/defaultValue/onValueChange; use checked/defaultChecked/onCheckedChange");
  }
  warnDeprecatedStyleProps("Switch", { style }, "layoutStyle for placement and presentation/size for appearance");
  const { colors, environment, ...nativeTheme } = useHjmNativeTheme();
  const dimensions = switchRecipe.sizes[size];
  const stacked = presentation === "row" && labelVisibility === "visible"
    && environment.textScale >= switchRecipe.stackedTextScale;
  // The platform Switch takes fills only — it has no border hook — so the recipe's
  // `*Border` slots stay web-only. The fills themselves are read from the recipe
  // rather than re-picked here; hardcoding them is how `trackOn` drifted from the
  // contract in the first place.
  const switchColors = switchRecipe.colors;
  const palette = nativeTheme.palette;
  const trackOff = resolveColorReference(
    disabled ? switchColors.trackOffDisabled : switchColors.trackOff,
    palette,
  );
  const trackOn = resolveColorReference(
    disabled ? switchColors.trackOnDisabled : switchColors.trackOn,
    palette,
  );
  const thumb = resolveColorReference(
    disabled ? switchColors.thumbDisabled : switchColors.thumbOff,
    palette,
  );
  const [enabled, setEnabled] = useControllableState({
    ...(checked === undefined ? {} : { value: checked }),
    defaultValue: (defaultChecked ?? false),
    ...(onCheckedChange === undefined
      ? {}
      : { onChange: onCheckedChange }),
  });
  return (
    <Pressable
      testID={testID}
      accessibilityHint={accessibilityHint ?? description}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled }}
      disabled={disabled}
      onPress={() => setEnabled(!enabled)}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: stacked ? "flex-start" : "center",
          alignSelf: presentation === "row" ? "stretch" : "flex-start",
          direction: environment.direction,
          flexDirection: stacked ? "column" : "row",
          gap: spacing.sm,
          minHeight: description
            ? switchRecipe.rowTwoLineMinHeight
            : switchRecipe.rowMinHeight,
          opacity: pressed ? switchRecipe.states.pressedOpacity : 1,
        },
        style,
        layoutStyle,
      ]}
    >
      {/* Only the label fades. Fading the whole row made on and off nearly
          identical, which is why the recipe's disabled colours swap hue instead. */}
      {labelVisibility === "visible" ? <View
        style={{
          flex: stacked || presentation === "inline" ? undefined : 1,
          gap: spacing.xxs,
          opacity: disabled ? switchRecipe.states.disabledOpacity : 1,
        }}
      >
        <Text tone="body" variant="bodyLarge">{label}</Text>
        {description ? (
          <Text tone="muted" variant="caption">{description}</Text>
        ) : null}
      </View> : null}
      <NativeSwitch
        {...props}
        accessible={false}
        disabled={disabled}
        ios_backgroundColor={trackOff}
        pointerEvents="none"
        // iOS UISwitch has a fixed intrinsic size (about 66pt wide on iOS 26) that
        // ignores a smaller box: forcing the recipe box drew the control from the box's
        // top-start corner, so it overflowed up and to the end and sat above the row's
        // centre in two-line rows (reported 2026-09-27, iPhone 17 Pro). On iOS we let the
        // native size drive layout so `alignItems: center` centres the real track.
        // Rejected: an oversized centring wrapper — it has to guess the per-OS UISwitch
        // size, which is exactly the number that changed. Android honours the box.
        // RN's iOS Switch composes `alignSelf: "flex-start"` under the caller's style,
        // which overrode this row's `alignItems: center` and pinned the track to the
        // row top, 8-10pt above the label centre (2026-09-30 audit, iOS 27). Restate
        // the row's cross-axis alignment explicitly.
        style={Platform.OS === "ios"
          ? { alignSelf: stacked ? "flex-start" : "center" }
          : { height: dimensions.height, width: dimensions.width }}
        thumbColor={thumb}
        trackColor={{ false: trackOff, true: trackOn }}
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

export type SegmentedControlLeadingRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: string;
  size: number;
}>;

type SegmentedControlCollectionProps<Value extends string> = Readonly<{ items: readonly SegmentedControlItem<Value>[] }>;

export type SegmentedControlProps<Value extends string = string> =
  SegmentedControlCollectionProps<Value> & Readonly<{
    label: string;
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    size?: SegmentedControlSize;
    presentation?: "connected" | "pills";
    disabled?: boolean;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses `segmentedControlRecipe`. Use `layoutStyle` for placement
     * and `size` for appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
  }>;

export function SegmentedControl<Value extends string = string>(props: SegmentedControlProps<Value>) {
  const {
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  size = segmentedControlRecipe.defaults.size,
  presentation = "connected",
  disabled = false,
  layoutStyle,
  style,
} = props;
  // Removed aliases must not silently change the selected collection in JavaScript callers.
  if ("options" in props || !Array.isArray(items)) throw new TypeError("SegmentedControl requires items; options was removed");
  warnDeprecatedStyleProps("SegmentedControl", { style }, "layoutStyle for placement and size for appearance");
  const pills = presentation === "pills";
  const resolvedItems = items;
  const theme = useHjmNativeTheme();
  const { environment } = theme;
  const sizeContract = segmentedControlRecipe.sizes[size];
  // Pills keep their row at large text (segmentedControlRecipe.pills.largeTextLayout, 1.13.1): they wrap in a
  // block and stay one line in a rail. Stacking them made a filter rail a ~440pt column (utilverse, 2026-10-06).
  const stacked = !pills && segmentedControlRecipe.adaptive.largeTextLayout === "stacked"
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
          backgroundColor: pills ? "transparent" : resolveColorReference(
            segmentedControlRecipe.container.background,
            theme.palette,
          ),
          borderColor: resolveColorReference(
            segmentedControlRecipe.container.border,
            theme.palette,
          ),
          borderRadius: radius[segmentedControlRecipe.container.radius],
          borderWidth: pills ? 0 : segmentedControlRecipe.container.borderWidth,
          direction: environment.direction,
          flexDirection: stacked ? "column" : "row",
          flexWrap: pills ? "wrap" : "nowrap",
          gap: pills ? segmentedControlRecipe.pills.gap : segmentedControlRecipe.container.gap,
          padding: pills ? 0 : segmentedControlRecipe.container.padding,
        },
        style,
        layoutStyle,
      ]}
    >
      {resolvedItems.map((item) => {
        const isSelected = item.value === selected;
        const optionDisabled = disabled || item.disabled === true;
        const contentColor = resolveColorReference(
          isSelected
            ? (pills ? segmentedControlRecipe.pills.selectedContent : segmentedControlRecipe.item.selectedContent)
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
                backgroundColor: !pills && isSelected
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
                borderWidth: !pills && isSelected
                  ? segmentedControlRecipe.item.selectedBorderWidth
                  : 0,
                flex: stacked || pills ? undefined : 1,
                maxWidth: pills ? "100%" : undefined,
                gap: segmentedControlRecipe.item.gap,
                justifyContent: "center",
                minHeight: pills ? segmentedControlRecipe.pills.minHeight : sizeContract.minHeight,
                opacity: optionDisabled
                  ? segmentedControlRecipe.item.disabledOpacity
                  : pressed
                    ? segmentedControlRecipe.item.pressedOpacity
                    : 1,
                paddingHorizontal: pills ? spacing.md : sizeContract.paddingHorizontal,
                paddingVertical: pills ? segmentedControlRecipe.pills.inset : undefined,
                width: stacked ? "100%" : undefined,
              },
            ]}
          >
            {pills ? <View pointerEvents="none" accessible={false} style={{position:"absolute",left:0,right:0,top:segmentedControlRecipe.pills.inset,bottom:segmentedControlRecipe.pills.inset,borderRadius:segmentedControlRecipe.pills.radius,backgroundColor:isSelected?resolveColorReference(segmentedControlRecipe.pills.selectedBackground,theme.palette):theme.colors.surfaceAlt}}/> : null}
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
  /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  leadingStyle?: HjmCompositionStyleProp;
  indicatorStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw text style bypasses `chipRecipe.label`. Use `size` and `selected` for label
   * typography. Removed in the next major (consumer-policy.md §3.1).
   */
  labelStyle?: StyleProp<TextStyle>;
  trailingStyle?: HjmCompositionStyleProp;
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
  layoutStyle,

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
  warnDeprecatedStyleProps("Chip", { labelStyle }, "size/selected for label typography");
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
      {...webOnly(
        selectable
          ? webChoiceProps({
              kind: role === "radio" ? "radio" : "checkbox",
              checked: active,
              disabled,
              readOnly: false,
              // Chip's controlled handler needs the press event, so Space
              // re-enters the element's own DOM click path instead of calling
              // the handler with a synthesised one.
              onActivate: (element) => element.click(),
              ...(role === "radio" ? { tabIndex: active && !disabled ? 0 : -1 } : {}),
            })
          : { "aria-disabled": disabled },
      )}
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
          // A floor, not a fixed height, as Button does for text content and as Web `.hjm-chip` already does
          // (min-block-size): the fixed 36 clipped the filter-trigger and suggested-query labels at accessibility-large
          // (utilverse 1.13.0 adoption, 2026-10-06). At 1x the label fits, so the chip is still 36.
          minHeight: visibleControlHeight(metrics.height, theme.environment.minimumVisualTarget),
          opacity: disabled
            ? chipRecipe.states.disabledOpacity
            : pressed
              ? chipRecipe.states.pressedOpacity
              : 1,
          paddingHorizontal: metrics.paddingHorizontal,
        },
        layoutStyle,
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
            // Like Checkbox, the selection mark fits a fixed glyph slot; the chip label still scales.
            <NativeText accessible={false} allowFontScaling={false} style={{ ...typography.caption, color: indicatorColor }}>✓</NativeText>
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
