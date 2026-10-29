import type { ComponentRef } from "react";
import { Button } from "./actions.js";
import { useInitialFocusTarget } from "./internal/initial-focus.js";
import { setInputVisibilityFrame } from "./internal/field-visibility.js";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { InheritedTextColorContext } from "./internal/text-colors.js";
import { SelectionMark } from "./internal/selection-mark.js";
import { FieldMessage, NativeFieldFrame, useFieldErrorAnnouncement } from "./internal/field-frame.js";
import type { FieldPrivateProps } from "./internal/field-private.js";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import {
  control,
  glyph,
  spacing,
  typography,
  motion as motionTiming,
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
  type SelectionGroupOverflow,
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
  characterCountRecipe,
  resolveCharacterCount,
  resolveCharacterCountMaxLength,
  shouldAnnounceCharacterCount,
  type CharacterCountOptions,
  type CharacterCountState,
  type CharacterCountStatus,
} from "@hjmds/design-contracts/character-count";
import {
  getCheckboxNextState,
  reconcileCheckboxSelection,
  resolveControlAccessibleName,
  resolveInitialRadioValue,
  resolveRadioTabStop,
  resolveInitialTabValue,
  reconcileRadioSelection,
  resolveScrollRevealOffset,
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
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  Switch as NativeSwitch,
  Text as NativeText,
  TextInput,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type SwitchProps as NativeSwitchProps,
  type TextInputProps,
} from "react-native";

import { mixedCheckboxState, useControllableState } from "./internal/state.js";
import { isWebRenderer, webChoiceProps, webOnly } from "./internal/web-a11y.js";
import {
  logicalTextAlign,
  minimumTargetStyle,
  resolveNativeFontStyle,
  resolveNativeTextScaleProps,
} from "./internal/styles.js";
import { Grid, Text } from "./primitives.js";
import type { GridDescriptor } from "@hjmds/design-contracts/grid";
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
    /** External group errors can mark this field without repeating inline copy. Supply accessibilityHint. */
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    busy?: boolean;
    variant?: FieldVariant;
    shape?: FieldShape;
    /** Canonical layout-only placement for the complete field. Controlled keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * Page-entry target: true prefers this field, false excludes it, omission uses tree order. Only chooses during
     * entry; revealing a field after interaction does not focus it. Bottom sheets disable automatic input focus.
     */
    initialFocusTarget?: boolean;
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

/** TextField and TextArea only; SearchField and PasswordField have no free-text limit to count. */
type CharacterCountProps = Readonly<{
  /**
   * Shows `length/max` and the product's sentence for the current status under the control
   * (`resolveCharacterCount`). `overflow: "block"` (default) also sets `maxLength`; do not pass both.
   */
  characterCount?: CharacterCountOptions;
}>;

/*
  Character count (characterCountRecipe, 2026-10-23 BurnTok TextLengthHint). The row is hidden from the
  accessibility tree and its sentence and counter are appended to the input hint, so they are read on focus without
  a second swipe stop. Entering near/short/over is announced once; announcing each keystroke would talk over the
  typed text. Both platforms use announceForAccessibility because an Android live region on the row would speak on
  every counter change.
*/
function useCharacterCount(
  options: CharacterCountOptions | undefined,
  value: string,
  ownMaxLength: number | undefined,
): Readonly<{ state?: CharacterCountState; maxLength?: number }> {
  if (options && ownMaxLength !== undefined) {
    throw new TypeError("Pass the limit through characterCount.max instead of maxLength");
  }
  const state = options ? resolveCharacterCount(value, options) : undefined;
  const previous = useRef<CharacterCountStatus | undefined>(undefined);
  const status = state?.status;
  useEffect(() => {
    if (state && shouldAnnounceCharacterCount(previous.current, state)) AccessibilityInfo.announceForAccessibility(state.message ?? "");
    previous.current = status;
    // Only a status change announces; the message inside one status changes with every keystroke.
  }, [status]);
  const maxLength = options ? resolveCharacterCountMaxLength(options) : ownMaxLength;
  return { ...(state ? { state } : {}), ...(maxLength === undefined ? {} : { maxLength }) };
}

function CharacterCountRow({ state }: Readonly<{ state: CharacterCountState }>) {
  const { colors, environment } = useHjmNativeTheme();
  const tone = state.invalid ? "invalid" : "idle";
  const color = colors[characterCountRecipe.colors[tone]];
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      testID="hjm-field-character-count"
      style={{ flexDirection: "row", alignItems: "flex-start", gap: characterCountRecipe.gap, direction: environment.direction }}>
      {state.message ? <Text variant={characterCountRecipe.textVariant} style={{ color, flex: 1 }}>{state.message}</Text> : null}
      <Text variant={characterCountRecipe.textVariant}
        style={{ color, flexShrink: 0, marginStart: "auto", fontVariant: [characterCountRecipe.numeric], fontWeight: characterCountRecipe.counterFontWeight[tone] }}>
        {state.counter}
      </Text>
    </View>
  );
}

type FieldRendererProps = AccessibleFieldProps & FieldPrivateProps & CharacterCountProps &
  Readonly<{
    multiline: boolean;
    search: boolean;
    /** Internal recipe sizing for PasswordField; never exposed as a product style override. */
    recipeMinHeight?: number;
    /** Recipe text must drive both glyph metrics and frame growth at large text sizes. */
    recipeTextVariant?: keyof typeof typography;
    /** Component recipe amount for fieldRecipe.disabledScope (PasswordField); defaults by `search`. */
    disabledOpacity?: number;
    searchSize?: SearchFieldSize;
    leading?: ReactNode;
    leadingAction?: ReactNode; trailing?: ReactNode;
  }>;

const FieldRenderer = forwardRef<ComponentRef<typeof TextInput>, FieldRendererProps>(
  function FieldRenderer(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      description,
      error,
      invalid = false,
      accessibilityHint,
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
      recipeMinHeight,
      recipeTextVariant,
      disabledOpacity,
      searchSize = searchFieldRecipe.defaults.size,
      leading,
      trailing,
    leadingAction,
      hjmCompactMultiline = false,
      hjmDescriptionAlign = "start",
      initialFocusTarget,
      onBlur,
      onFocus,
      onContentSizeChange,
      onSelectionChange,
      characterCount,
      maxLength: ownMaxLength,
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
    const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
    const fieldFrameRef = useRef<ComponentRef<typeof View>>(null);
    const restoreFocusRef = useRef(false);
    const selectionRef = useRef<{ start: number; end: number } | null>(null);
    const attachInput = useCallback((node: ComponentRef<typeof TextInput> | null) => {
      if (node === null) restoreFocusRef.current = inputRef.current?.isFocused?.() ?? false;
      if (inputRef.current) setInputVisibilityFrame(inputRef.current, null);
      inputRef.current = node;
      if (node) setInputVisibilityFrame(node, fieldFrameRef);
    }, []);
    const [currentValue, setCurrentValue] = useControllableState({
      ...(value === undefined ? {} : { value }),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    // Disabled and read-only fields are never focused on entry (busy plain fields are locked too).
    useInitialFocusTarget(inputRef, initialFocusTarget,
      () => !disabled && !props.readOnly && props.editable !== false && (search || !busy));
    const supportText = description;
    const count = useCharacterCount(characterCount, currentValue, ownMaxLength);
    const countHint = count.state ? [count.state.message, count.state.counter].filter(Boolean).join(", ") : undefined;
    const hint = [error ?? accessibilityHint ?? supportText, countHint].filter(Boolean).join(", ") || undefined;
    // Over the limit (overflow "allow") draws the invalid border like an external group error.
    const invalidState = invalid || count.state?.status === "over";
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
    const borderWidth = error || invalidState ? fieldRecipe.states.invalid.borderWidth
      : search ? searchFieldRecipe.borderWidth : fieldRecipe.borderWidth;
    const borderColor = search
      ? resolveColorReference(
          error || invalidState
            ? searchFieldRecipe.colors.invalid
            : focused
            ? searchFieldRecipe.colors.focus
            : searchFieldRecipe.colors.border,
          theme.palette,
        )
      : colors[
          error || invalidState
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
      theme.tokens.typography[search ? searchSizing.textVariant : recipeTextVariant ?? fieldRecipe.textVariant];
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
    useImperativeHandle(ref, () => inputRef.current as ComponentRef<typeof TextInput>, [editorKey]);
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
      : Math.max(search ? searchSizing.minHeight : recipeMinHeight ?? fieldRecipe.minHeight, singleLineMinHeight);
    const controlRadius =
      theme.tokens.radius[
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
          ...resolveNativeFontStyle(theme.tokens.fontFamily.ui),
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
      ],
      allowFontScaling,
    );

    // SearchField `busy` means "results are loading", not "this value is being committed":
    // locking the editor dropped every keystroke typed while suggestions refreshed, while the
    // Web SearchField keeps typing under `aria-busy` (2026-10-06 parity follow-up). Plain
    // fields keep the lock because their busy means a pending save of the current value.
    // iOS scrolls the one-line viewport before reporting intrinsic growth. Keep bounded
    // composers unscrollable until their content exceeds the recipe cap; ordinary editors retain caller behavior.
    const editor = (<TextInput
            key={editorKey}
            {...props}
            {...(count.maxLength === undefined ? {} : { maxLength: count.maxLength })}
            {...inputTextScaleProps}
            ref={attachInput}
            accessibilityHint={hint}
            accessibilityLabel={accessibleName}
            accessibilityRole={search ? "search" : undefined}
            accessibilityState={{ busy, disabled }}
            editable={!disabled && !props.readOnly && props.editable !== false && (search || !busy)}
            multiline={multiline}
            scrollEnabled={multiline && minVisibleLines !== undefined
              ? !!currentValue && contentHeight > textStyle.lineHeight * (resolvedMaxVisibleLines ?? 1000) + fieldRecipe.paddingVertical * 2
              : props.scrollEnabled}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onContentSizeChange={event => {
              // Bounded sizing is owned by the unconstrained text measurement below.
              onContentSizeChange?.(event);
            }}
            onSelectionChange={event => {
              selectionRef.current = event.nativeEvent.selection;
              onSelectionChange?.(event);
            }}
            onChangeText={(next) => {
              if (!disabled && !props.readOnly && props.editable !== false && (search || !busy)) setCurrentValue(next);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            placeholderTextColor={placeholderColor}
            value={currentValue}
          />
    );

    return (
      <NativeFieldFrame
        frameRef={fieldFrameRef}
        descriptionAlign={hjmDescriptionAlign}
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
          {multiline && minVisibleLines !== undefined ? <View style={{ flex: 1, flexDirection: "row" }}>
            {/* iOS reports the constrained editor viewport as content height. Measure the same
                text at its actual width without height constraints; this also preserves trailing newlines. */}
            <NativeText {...resolveNativeTextScaleProps(textScaling, [{
              ...resolveNativeFontStyle(theme.tokens.fontFamily.ui), fontSize: textStyle.fontSize,
              fontWeight: textStyle.fontWeight, lineHeight: textStyle.lineHeight,
              position: "absolute", left: 0, right: 0, opacity: 0,
              paddingVertical: fieldRecipe.paddingVertical,
            }], allowFontScaling)} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
              pointerEvents="none" onTextLayout={event => setContentHeight(
                event.nativeEvent.lines.reduce((height, line) => height + Math.max(line.height, textStyle.lineHeight), 0) + fieldRecipe.paddingVertical * 2
              )}>{currentValue + "\u200b"}</NativeText>
            {editor}
          </View> : editor}
          {trailing}
        </View>
        {count.state ? <CharacterCountRow state={count.state} /> : null}
      </NativeFieldFrame>
    );
  },
);

export type TextFieldProps = AccessibleFieldProps & CharacterCountProps;

export const TextField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>> = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(props, ref) {
  return <FieldRenderer {...props} ref={ref} multiline={false} search={false} />;
});

export type TextAreaProps = AccessibleFieldProps & CharacterCountProps & Readonly<{ trailing?: ReactNode; leadingAction?: ReactNode }>;

export const TextArea: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, TextAreaProps>> = forwardRef<ComponentRef<typeof TextInput>, TextAreaProps>(function TextArea(props, ref) {
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

export const SearchField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, SearchFieldProps>> = forwardRef<ComponentRef<typeof TextInput>, SearchFieldProps>(function SearchField(
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
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  // Single-line child editor never remounts.
  useImperativeHandle(ref, () => inputRef.current as ComponentRef<typeof TextInput>, []);
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
  ) : searchValue.length > 0 && !props.readOnly && props.editable !== false ? (
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
  // Web's `visibility`/`visibilityOff` paths: an almond eye pointed at both sides, a ring pupil and a top-start to
  // bottom-end slash. The eye is a square with two rounded opposite corners turned 45deg; the earlier full pill read
  // as a capsule, not an eye (2026-10-17 review). Views keep react-native-svg optional for this core input.
  const strokeWidth = Math.max(1.5, size * 0.1);
  const side = size * 0.62;
  const pupil = size * 0.34;
  // RTL swaps the rounded corners and the turn together (scenario matrix), which draws the same symmetric eye.
  const rtl = useHjmNativeTheme().environment.direction === "rtl";
  return (
    <View accessible={false} style={{ alignItems: "center", height: size, justifyContent: "center", width: size }}>
      <View
        style={{
          borderColor: color,
          ...(rtl ? { borderTopRightRadius: side * 0.85, borderBottomLeftRadius: side * 0.85 } : { borderTopLeftRadius: side * 0.85, borderBottomRightRadius: side * 0.85 }),
          borderWidth: strokeWidth,
          height: side,
          position: "absolute",
          transform: [{ rotate: rtl ? "-45deg" : "45deg" }],
          width: side,
        }}
      />
      <View style={{ borderColor: color, borderRadius: pupil / 2, borderWidth: strokeWidth, height: pupil, width: pupil }} />
      {revealed ? (
        <View
          style={{
            backgroundColor: color,
            borderRadius: strokeWidth,
            height: strokeWidth,
            position: "absolute",
            transform: [{ rotate: "45deg" }],
            width: size * 1.06,
          }}
        />
      ) : null}
    </View>
  );
}

/** Password input with independent reveal state and native autofill translation. */
export const PasswordField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, PasswordFieldProps>> = forwardRef<ComponentRef<typeof TextInput>, PasswordFieldProps>(function PasswordField(
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
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  // Single-line child editor never remounts.
  useImperativeHandle(forwardedRef, () => inputRef.current as ComponentRef<typeof TextInput>, []);
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
  // Size is a minimum; both text and frame derive from themed metrics so large text cannot be clipped.
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
      autoComplete={autofillHint === "none" ? "off" : autofillHint === "current" ? "current-password" : "new-password"}
      disabled={disabled}
      // passwordFieldRecipe.states owns the amount; both renderers used the field default 0.6 until 2026-10-06.
      disabledOpacity={passwordFieldRecipe.states.disabledOpacity}
      recipeTextVariant={size === "large" ? "bodyLarge" : fieldRecipe.textVariant}
      recipeMinHeight={metrics.minHeight}
      multiline={false}
      onSelectionChange={(event) => {
        selectionRef.current = event.nativeEvent.selection;
        onSelectionChange?.(event);
      }}
      search={false}
      secureTextEntry={resolved.nativeSecureTextEntry}
      importantForAutofill={autofillHint === "none" ? "no" : props.importantForAutofill}
      textContentType={autofillHint === "none" ? "none" : autofillHint === "current" ? "password" : "newPassword"}
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

  }>;

/** One accessible numeric TextInput rendered through decorative OTP slots. */
export const OtpField: ReturnType<typeof forwardRef<ComponentRef<typeof TextInput>, OtpFieldProps>> = forwardRef<ComponentRef<typeof TextInput>, OtpFieldProps>(function OtpField(
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
  assertNoRemovedStyleProps("OtpField", props, ["slotStyle", "slotTextStyle"]);
  const supportText = description;
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
    theme.tokens.typography[metrics.textVariant].lineHeight * theme.environment.textScale + spacing.xs * 2,
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
            editable={!disabled && !busy && !readOnly && props.editable !== false}
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
                    borderRadius: presentation === "underline" ? 0 : theme.tokens.radius[otpFieldRecipe.slot.radius],
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
                ]}
              >
                <Text
                  accessible={false}
                  align="center"
                  allowFontScaling={allowFontScaling}
                  style={[{ color: contentColor }]}
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




}>;

type ChoiceRowProps = ChoiceVisualProps & Readonly<{
  selectionTone?: "neutral" | "brand" | "brand-outline";
  kind: "checkbox" | "radio";
  label: string;
  labelContent?: ReactNode;
  action?: Readonly<{ label: string; accessibilityLabel?: string; onAction: () => void; disabled?: boolean }>;
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
  /** Chip rail (CheckboxGroup overflow="scroll") measures each chip and reveals the focused one. */
  onRailLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  onRailFocus?: (() => void) | undefined;
}>;

// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
function ChoiceRow({
  selectionTone = "neutral",
  kind,
  label,
  labelContent,
  action,
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
  onRailLayout,
  onRailFocus,
}: ChoiceRowProps) {
  const theme = useHjmNativeTheme();
  const metrics = selectionControlRecipe.sizes[size];
  const chips = presentation === "chips", chipMetrics = chipRecipe.sizes[size];
  const rowMinHeight = chips ? visibleControlHeight(chipMetrics.height, theme.environment.minimumVisualTarget) : metrics.rowMinHeight;
  const plate = selectionControlRecipe.presentations[presentation];
  const selected = checked === true || checked === "mixed";
  const chipState = chipRecipe.states[selected ? "selected" : "idle"];
  const brandSelected = selected && selectionTone === "brand";
  const outlineSelected = selected && selectionTone === "brand-outline";
  const selectedContent = brandSelected ? resolveColorReference(selectionControlRecipe.states.selectedBrand.content, theme.palette) : undefined;
  const indicatorColor = resolveColorReference(
    chips ? chipState.content : selectionControlRecipe.states.indicator,
    theme.palette,
  );
  const appearance: ChoiceVisualRenderProps = {
    checked,
    selected,
    disabled,
    readOnly,
    color: selectedContent ?? indicatorColor,
    size: metrics.control,
  };
  const resolvedLeading = leading ?? renderLeading?.(appearance);
  const plateBackground = outlineSelected ? selectionControlRecipe.states.idleBackground : brandSelected ? selectionControlRecipe.states.selectedBrand.background : chips ? chipState.background : selected
    ? selectionControlRecipe.states.selectedBackground
    : plate.background ?? selectionControlRecipe.states.idleBackground;
  const plateBorder = invalid
    ? selectionControlRecipe.states.invalidBorder
    : brandSelected || outlineSelected ? selectionControlRecipe.states.selectedBrand.background : chips ? chipState.border : selected
      ? selectionControlRecipe.states.selectedBorder
      : plate.border;
  const frameStyle = {
    ...(chips ? { maxWidth: "100%" as const } : {}),
    backgroundColor: resolveColorReference(plateBackground, theme.palette),
    borderColor: plateBorder ? resolveColorReference(plateBorder, theme.palette) : "transparent",
    borderRadius: theme.tokens.radius[plate.radius],
    borderWidth: plate.borderWidth,
  };
  const resolvedHint = [
    accessibilityHint ?? description,
    required ? requiredLabel : undefined,
    readOnly ? readOnlyLabel : undefined,
    invalid ? invalidLabel : undefined,
  ].filter(Boolean).join(". ") || undefined;
  const target = (
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
      hitSlop={chips ? chipMetrics.hitSlop : plate.useSizePadding ? 0 : metrics.hitSlop}
      {...(onRailFocus ? { onFocus: onRailFocus } : {})}
      {...(onRailLayout && !action ? { onLayout: onRailLayout } : {})}
      onPress={() => {
        if (!readOnly) onActivate();
      }}
      style={({ pressed }) => [
        {
          alignItems: "center",
          alignSelf: chips ? "flex-start" : "stretch",
          // Grid cells stretch to the tallest sibling; the visible card must fill that cell too.
          flexGrow: presentation === "card" ? 1 : undefined,
          ...frameStyle,
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: chips ? chipMetrics.gap : metrics.gap,
          minHeight: rowMinHeight,
          opacity: disabled
            ? selectionControlRecipe.states.disabledOpacity
            : pressed && !readOnly
              ? 0.86
              : 1,
          paddingHorizontal: chips ? chipMetrics.paddingHorizontal : plate.useSizePadding ? metrics.paddingHorizontal : 0,
          paddingVertical: chips ? 0 : plate.useSizePadding ? metrics.paddingVertical : 0,
        },
        action ? { flex: 1, minWidth: 0, backgroundColor: "transparent", borderWidth: 0, borderRadius: 0, opacity: pressed && !readOnly && !disabled ? 0.86 : 1 } : layoutStyle,
      ]}
    >
      {chips && indicator === "default" && renderIndicator ? (
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{renderIndicator(appearance)}</View>
      ) : !chips && indicator === "default" ? (
        <SelectionMark kind={kind} checked={checked} size={size} invalid={invalid ?? false}>
          {renderIndicator?.(appearance)}
        </SelectionMark>
      ) : null}
      {resolvedLeading ? (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {resolvedLeading}
        </View>
      ) : null}
      {/* Keep an intrinsic basis: basis 0 collapsed horizontal labels (2026-10-17 review).
          Chip copy must also stop growing, or it expands each content-sized chip to the entire group width. */}
      <InheritedTextColorContext.Provider value={selectedContent}>
      <View style={[{ flexGrow: chips ? 0 : 1, flexShrink: 1, gap: spacing.xxs, minWidth: 0 }]}>
        {labelContent != null && typeof labelContent !== "string" && typeof labelContent !== "number" ? labelContent : <Text
              fontRole="ui"
          style={[
            {
              color: selectedContent ?? resolveColorReference(chips ? chipState.content : selectionControlRecipe.label.color, theme.palette),
              fontWeight: selected
                ? selectionControlRecipe.label.checkedFontWeight
                : selectionControlRecipe.label.fontWeight,
            },
          ]}
          variant={chips ? chipMetrics.textVariant : metrics.labelVariant}
        >
          {labelContent ?? label}
        </Text>}
        {description ? (
          <Text
            style={[
              {
                color: resolveColorReference(
                  brandSelected ? selectionControlRecipe.states.selectedBrand.content : selectionControlRecipe.description.color,
                  theme.palette,
                ),
              },
            ]}
            variant={metrics.descriptionVariant}
          >
            {description}
          </Text>
        ) : null}
      </View>
      </InheritedTextColorContext.Provider>
    </Pressable>
  );
  if (!action) return target;
  // The selection target owns its accessible label; the action is a separate sibling
  // so rename/manage never changes the selected option or nests a button in a radio.
  return <View {...(onRailLayout ? { onLayout: onRailLayout } : {})} style={[{
    alignItems: "center", alignSelf: chips ? "flex-start" : "stretch", flexDirection: "row", direction: theme.environment.direction,
    minHeight: rowMinHeight,
    flexGrow: presentation === "card" ? 1 : undefined,
    ...frameStyle,
    opacity: disabled ? selectionControlRecipe.states.disabledOpacity : 1,
  }, layoutStyle]}>
    {target}
    <View style={{ paddingEnd: spacing.xs }}><Button tone="ghost" size="small"
      disabled={disabled || action.disabled === true} accessibilityLabel={action.accessibilityLabel} onPress={action.onAction}>{action.label}</Button></View>
  </View>;
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
  action?: Readonly<{ label: string; accessibilityLabel?: string; onAction: () => void; disabled?: boolean }>;
}>;

type ChoiceGroupVisualProps = ChoiceVisualProps & Readonly<{
  orientation?: SelectionOrientation;
  /** Equal-width responsive options, measured and arranged by the shared Grid. */
  grid?: GridDescriptor;
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
    /** One horizontal line of cards or chips, without grid; the selected item stays visible. */
    overflow?: SelectionGroupOverflow;
    /** Brand fill uses primary/onPrimary; brand-outline keeps canvas and emphasizes the primary border. */
    selectionTone?: "neutral" | "brand" | "brand-outline";
    /** Visual preview only; the string label remains the accessible name. */
    renderLabel?: (item: RadioGroupItem<Value>) => ReactNode;
    renderLeading?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
    renderIndicator?: (item: RadioGroupItem<Value>, props: ChoiceVisualRenderProps) => ReactNode;
  }>;

type ChipRail = Readonly<{
  ref: React.RefObject<ComponentRef<typeof ScrollView> | null>;
  onScroll: (event: { nativeEvent: { contentOffset: { x: number } } }) => void;
  onViewportLayout: (event: LayoutChangeEvent) => void;
  onContentSizeChange: (width: number, height: number) => void;
  itemLayout: (id: string) => (event: LayoutChangeEvent) => void;
  reveal: (id: string) => void;
}>;

/** Measures chips in the rail and scrolls the least distance that shows a focused chip (resolveScrollRevealOffset). */
function useChipRail(enabled: boolean, selected?: string | null): ChipRail | undefined {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const viewport = useRef(0);
  const contentWidth = useRef(0);
  const rects = useRef<Record<string, Readonly<{ x: number; width: number }>>>({});
  useEffect(() => { if (enabled && selected) rail?.reveal(selected); }, [enabled, selected]);
  if (!enabled) return undefined;
  const rail: ChipRail = {
    ref,
    onScroll: event => { offset.current = event.nativeEvent.contentOffset.x; },
    onViewportLayout: event => { viewport.current = event.nativeEvent.layout.width; if (selected) rail.reveal(selected); },
    onContentSizeChange: width => { contentWidth.current = width; if (selected) rail.reveal(selected); },
    itemLayout: id => event => { const { x, width } = event.nativeEvent.layout; rects.current[id] = { x, width }; if (id === selected) rail.reveal(id); },
    reveal: id => {
      const rect = rects.current[id];
      // Wait for the scroll content before revealing a controlled selection; early scrollTo gets clamped.
      if (!rect || viewport.current <= 0 || (selected && contentWidth.current <= 0)) return;
      // Layout x is inside the padded content row; the scroll offset counts the content padding too.
      const inset = selectionGroupRecipe.overflow.scrollInset;
      const next = resolveScrollRevealOffset(offset.current, viewport.current, rect.x + inset, rect.width, inset);
      if (next !== offset.current) { offset.current = next; ref.current?.scrollTo({ x: next, animated: false }); }
    },
  };
  return rail;
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
  grid,
  layoutStyle,
  rail,
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
  grid?: GridDescriptor | undefined;
  presentation: SelectionControlPresentation;
  layoutStyle?: HjmCompositionStyleProp | undefined;
  /** Chip rail for overflow="scroll"; the frame owns the scroll view and its inset. */
  rail?: ChipRail | undefined;
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
  useFieldErrorAnnouncement(error);
  return (
    <View
      accessibilityHint={[error ?? description, readOnly ? readOnlyLabel : undefined]
        .filter(Boolean).join(". ") || undefined}
      accessibilityLabel={announcedName}
      accessibilityLabelledBy={label ? labelId : undefined}
      accessibilityRole={role}
      accessibilityState={{ disabled: disabled || readOnly }}
      accessibilityValue={error ? { text: error } : undefined}
      style={[{ direction: theme.environment.direction, gap: selectionGroupRecipe.supportGap }, layoutStyle]}
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
      {rail ? (
        // Same scroller as SegmentedControl overflow="scroll": an LTR scroll view with the reading direction on
        // its row. selectionGroupRecipe.overflow.scrollInset pads every side (focus ring, chip hit slop, equal end
        // gap) and the negative margin keeps the chips aligned with the column.
        <ScrollView
          ref={rail.ref}
          horizontal
          keyboardShouldPersistTaps="handled"
          onScroll={rail.onScroll}
          onContentSizeChange={rail.onContentSizeChange}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          onLayout={rail.onViewportLayout}
          style={{ direction: "ltr", flexGrow: 0, margin: -selectionGroupRecipe.overflow.scrollInset }}
          contentContainerStyle={{ padding: selectionGroupRecipe.overflow.scrollInset }}
        >
          <View style={{ direction: theme.environment.direction, flexDirection: "row", flexWrap: "nowrap", gap }}>{children}</View>
        </ScrollView>
      ) : grid ? <Grid {...grid}>{children}</Grid> : (
        <View style={{
          direction: theme.environment.direction,
          flexDirection: presentation === "chips" || (orientation === "horizontal" && theme.environment.textScale < 1.6) ? "row" : "column",
          flexWrap: presentation === "chips" ? "wrap" : undefined,
          gap,
        }}>
          {children}
        </View>
      )}
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
  grid,
  overflow = selectionGroupRecipe.overflow.default,
  presentation = selectionGroupRecipe.defaults.presentation,
  size = selectionControlRecipe.defaults.size,
  indicator = "default",
  selectionTone = "neutral",
  renderLeading,
  renderLabel,
  renderIndicator,
  layoutStyle,
  ...slotStyles
} = props;
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
  const webTabStop = resolveRadioTabStop(selectionItems, selected);
  useEffect(() => {
    if (value === undefined && selected !== storedValue) setSelected(selected);
  }, [selected, setSelected, storedValue, value]);
  if (overflow === "scroll" && (grid || !["card", "chips"].includes(presentation))) {
    throw new TypeError('RadioGroup overflow="scroll" requires card or chips without grid');
  }
  const rail = useChipRail(overflow === "scroll", selected);
  const hasError = invalid || error !== undefined;
  return (
    <ChoiceGroupFrame
      accessibilityLabel={accessibilityLabel}
      description={description}
      disabled={disabled}
      error={error}
      label={label}
      orientation={orientation}
      grid={grid}
      rail={rail}
      presentation={presentation}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      required={required}
      requiredLabel={requiredLabel}
      role="radiogroup"
      layoutStyle={layoutStyle}
    >
      {resolvedItems.map((item) => {
        const optionDisabled = disabled || item.disabled === true;
        const optionSelected = selected === item.value;
        return (
          <ChoiceRow
            {...slotStyles}
            key={item.value}
            onRailLayout={rail?.itemLayout(item.value)}
            onRailFocus={() => rail?.reveal(item.value)}
            accessibilityHint={item.accessibilityHint}
            checked={optionSelected}
            description={item.description}
            disabled={optionDisabled}
            indicator={indicator}
            invalid={hasError}
            invalidLabel={invalidLabel ?? error}
            kind="radio"
            selectionTone={selectionTone}
            label={item.label}
            labelContent={renderLabel?.(item)}
            {...(item.action ? { action: item.action } : {})}
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
    /**
     * Chip line overflow, the same meaning as SegmentedControl `overflow`: `wrap` (default) breaks onto more lines,
     * `scroll` keeps one horizontal line and scrolls a focused chip into view. Requires `presentation="chips"`
     * without `grid`.
     */
    overflow?: SelectionGroupOverflow;
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
  grid,
  presentation = selectionGroupRecipe.defaults.presentation,
  overflow = selectionGroupRecipe.overflow.default,
  size = selectionControlRecipe.defaults.size,
  indicator = "default",
  renderLeading,
  renderIndicator,
  layoutStyle,
  ...slotStyles
}: CheckboxGroupProps<Value>) {
  validateSelectionItems(items);
  if (overflow === "scroll" && (presentation !== "chips" || grid)) {
    throw new TypeError('CheckboxGroup overflow="scroll" requires presentation="chips" without grid');
  }
  const rail = useChipRail(overflow === "scroll");
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
      grid={grid}
      presentation={presentation}
      readOnly={readOnly}
      readOnlyLabel={readOnlyLabel}
      required={required}
      requiredLabel={requiredLabel}
      layoutStyle={layoutStyle}
      rail={rail}
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
            onRailLayout={rail?.itemLayout(item.id)}
            onRailFocus={rail ? () => rail.reveal(item.id) : undefined}
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
  ...props
}: SwitchProps) {
  assertNoRemovedStyleProps("Switch", props, ["style"]);
  // Reject old JavaScript callers rather than silently dropping their controlled state.
  if (["value", "defaultValue", "onValueChange"].some(key => key in props)) {
    throw new TypeError("Switch no longer accepts value/defaultValue/onValueChange; use checked/defaultChecked/onCheckedChange");
  }

  const { colors, environment, ...nativeTheme } = useHjmNativeTheme();
  const dimensions = switchRecipe.sizes[size];
  const stacked = presentation === "row" && labelVisibility === "visible"
    && environment.textScale >= switchRecipe.stackedTextScale;
  // The platform Switch takes fills only — it has no border hook — so the recipe's
  // `*Border` slots stay web-only. The fills themselves are read from the recipe
  // rather than re-picked here; hardcoding them is how `trackOn` drifted from the
  // contract in the first place.
  const twoLine = Boolean(description) && labelVisibility === "visible";
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
      {...webOnly(webChoiceProps({ kind: "checkbox", checked: enabled, disabled, readOnly: false,
        onActivate: () => setEnabled(!enabled) }))}
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
          // A described row pads its copy (switchRecipe.rowPaddingVertical) so stacked rows need no gap;
          // a hidden label (ListRow trailing) keeps the single control height, as on Web.
          minHeight: twoLine
            ? switchRecipe.rowTwoLineMinHeight
            : switchRecipe.rowMinHeight,
          paddingVertical: twoLine ? switchRecipe.rowPaddingVertical : 0,
          opacity: pressed ? switchRecipe.states.pressedOpacity : 1,
        },
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
        <Text fontRole="ui" tone="body" variant={presentation === "row" ? switchRecipe.rowLabelTextVariant : "bodyLarge"}>{label}</Text>
        {description ? (
          <Text tone="muted" variant="caption">{description}</Text>
        ) : null}
      </View> : null}
      {/* iOS UISwitch has a fixed intrinsic size (about 66pt wide on iOS 26) that
          ignores a smaller box: forcing the recipe box drew the control from the box's
          top-start corner, so it overflowed up and to the end and sat above the row's
          centre in two-line rows (reported 2026-09-27, iPhone 17 Pro). On iOS we let the
          native size drive layout so `alignItems: center` centres the real track.
          Rejected: an oversized centring wrapper — it has to guess the per-OS UISwitch
          size, which is exactly the number that changed. Android honours the box.
          RN's iOS Switch composes `alignSelf: "flex-start"` under the caller's style,
          which overrode this row's `alignItems: center` and pinned the track to the
          row top, 8-10pt above the label centre (2026-09-30 audit, iOS 27). Restate
          the row's cross-axis alignment explicitly. */}
      {/* RN Web's Switch always creates a focusable input, even with accessible=false.
          The row owns activation, so web draws the recipe's decorative track instead. */}
      {isWebRenderer ? <View {...props} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
        style={{ width: dimensions.width, height: dimensions.height, flexDirection: "row", alignItems: "center",
          justifyContent: enabled ? "flex-end" : "flex-start", direction: environment.direction,
          borderRadius: dimensions.height / 2, borderWidth: 1, padding: dimensions.inset - 1,
          borderColor: resolveColorReference(disabled ? enabled ? switchColors.trackOnBorderDisabled : switchColors.trackOffBorderDisabled : enabled ? switchColors.trackOnBorder : switchColors.trackOffBorder, palette),
          backgroundColor: enabled ? trackOn : trackOff }}>
        <View style={{ width: dimensions.thumb, height: dimensions.thumb, borderRadius: dimensions.thumb / 2,
          borderWidth: enabled && !disabled ? 0 : 1,
          borderColor: resolveColorReference(disabled ? switchColors.thumbDisabledBorder : switchColors.thumbOffBorder, palette),
          backgroundColor: resolveColorReference(disabled ? switchColors.thumbDisabled : enabled ? switchColors.thumbOn : switchColors.thumbOff, palette) }} />
      </View> : <NativeSwitch
        {...props}
        accessible={false}
        disabled={disabled}
        ios_backgroundColor={trackOff}
        pointerEvents="none"
        style={Platform.OS === "ios"
          ? { alignSelf: stacked ? "flex-start" : "center" }
          : { height: dimensions.height, width: dimensions.width }}
        thumbColor={thumb}
        trackColor={{ false: trackOff, true: trackOn }}
        value={enabled}
      />}
    </Pressable>
  );
}

export type SegmentedControlItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  /** Full spoken name when the visible label is abbreviated. */
  accessibilityLabel?: string;
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

type SelectionHighlightRect = Readonly<{ x: number; y: number; width: number; height: number }>;
function NativeSelectionHighlight({ rect, selection, reducedMotion, pills, disabled, brand }: Readonly<{ brand: boolean; rect: SelectionHighlightRect; selection: string; reducedMotion: boolean; pills: boolean; disabled: boolean }>) {
  const theme = useHjmNativeTheme();
  const positions = useRef({ x: new Animated.Value(rect.x), y: new Animated.Value(rect.y), width: new Animated.Value(rect.width), height: new Animated.Value(rect.height) }).current;
  const previousSelection = useRef(selection);
  useEffect(() => {
    const keys = ["x", "y", "width", "height"] as const;
    const settle = () => { for (const key of keys) { positions[key].stopAnimation(); positions[key].setValue(rect[key]); } };
    const changed = previousSelection.current !== selection; previousSelection.current = selection;
    if (!changed || reducedMotion || AppState.currentState !== "active") { settle(); return; }
    // Width/height must follow measured text and wrapping, so use the layout
    // driver instead of scaling labels or assuming equal-width index positions.
    // The curve matches CSS ease-out; RN's implicit ease-in-out would drift from Web.
    const animations = keys.map(key => Animated.timing(positions[key], { toValue: rect[key], duration: motionTiming.normal, easing: Easing.bezier(0, 0, 0.58, 1), useNativeDriver: false }));
    animations.forEach(animation => animation.start());
    const sub = AppState.addEventListener("change", state => { if (state !== "active") settle(); });
    return () => { animations.forEach(animation => animation.stop()); sub.remove(); };
  }, [rect.x, rect.y, rect.width, rect.height, selection, reducedMotion, positions]);
  return <Animated.View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", left: positions.x, top: positions.y, width: positions.width, height: positions.height, borderRadius: pills ? segmentedControlRecipe.pills.radius : theme.tokens.radius[segmentedControlRecipe.item.radius], backgroundColor: resolveColorReference(brand ? segmentedControlRecipe.selectedBrand.background : pills ? segmentedControlRecipe.pills.selectedBackground : segmentedControlRecipe.item.selectedBackground, theme.palette), borderColor: resolveColorReference(segmentedControlRecipe.item.selectedBorder, theme.palette), borderWidth: pills ? 0 : segmentedControlRecipe.item.selectedBorderWidth, opacity: disabled ? segmentedControlRecipe.item.disabledOpacity : 1 }} />;
}

export type SegmentedControlProps<Value extends string = string> =
  SegmentedControlCollectionProps<Value> & Readonly<{
    label: string;
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value) => void;
    size?: SegmentedControlSize;
    presentation?: "connected" | "pills" | "text";
    /** Opaque primary/onPrimary selection, independent of presentation geometry. */
    selectionTone?: "neutral" | "brand";
    textEmphasis?: "regular" | "strong";
    /** Move only decorative selection artwork, never labels or hit targets. */
    selectionMotion?: "none" | "slide";
    disabled?: boolean;
    /** Pills wrap by default; a rail keeps one row while actions remain outside the selection group. */
    overflow?: "wrap" | "scroll";
    actions?: ReactNode;
    testID?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
  // Match Web's brand-filled default (2026-10-23 user review); neutral remains opt-in.
  selectionTone = "brand",
  textEmphasis = "strong",
  selectionMotion: suppliedSelectionMotion,
  disabled = false,
  layoutStyle,
  overflow = "wrap", actions, testID,
} = props;
  // Removed aliases must not silently change the selected collection in JavaScript callers.
  if ("options" in props || !Array.isArray(items)) throw new TypeError("SegmentedControl requires items; options was removed");

  const pills = presentation === "pills";
  const textOnly = presentation === "text";
  const resolvedItems = items;
  const theme = useHjmNativeTheme();
  const { environment } = theme;
  const sizeContract = segmentedControlRecipe.sizes[size];
  // Pills keep their row at large text (segmentedControlRecipe.pills.largeTextLayout, 1.13.1): they wrap in a
  // block and stay one line in a rail. Stacking them made a filter rail a ~440pt column (utilverse, 2026-10-06).
  const stacked = !pills && !textOnly && segmentedControlRecipe.adaptive.largeTextLayout === "stacked"
    && environment.textScale >= segmentedControlRecipe.adaptive.stackAtFontScale;
  // Connected options sit inside the track, so the option height is the shared control height minus the track
  // inset; the outer box then matches Button/Chip of the same size (segmentedControlRecipe.sizes, 2026-10-17).
  // Vertical-only slop restores the 44 target; options are 4 apart, so horizontal slop would overlap a neighbour.
  const outerHeight = visibleControlHeight(sizeContract.height, environment.minimumVisualTarget);
  // Stacked rows (large text) sit 4 apart vertically, so each option keeps a full 44 box and no slop instead.
  const itemMinHeight = stacked ? control.minTouchTarget
    : outerHeight - 2 * (segmentedControlRecipe.container.padding + segmentedControlRecipe.container.borderWidth);
  const outerSlop = Math.max(0, (control.minTouchTarget - outerHeight) / 2);
  const itemHitSlop = Math.max(0, (control.minTouchTarget - itemMinHeight) / 2);
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
  const [itemRects, setItemRects] = useState<Record<string, SelectionHighlightRect>>({});
  const selectedRect = itemRects[selected];
  const selectionMotion = textOnly ? "none" : suppliedSelectionMotion ?? theme.designProfile?.interactions.selectionMotion ?? "none";
  const movingHighlight = selectionMotion === "slide" && selectedRect !== undefined;
  const highlightRect = selectedRect && pills ? { ...selectedRect, y: selectedRect.y + segmentedControlRecipe.pills.inset, height: selectedRect.height - 2 * segmentedControlRecipe.pills.inset } : selectedRect;
  // Connected rows follow Web .hjm-segmented__items: items never shrink below their label (min-inline-size:
  // max-content), spare width is shared, and an over-wide row scrolls instead of breaking labels mid-word
  // (2026-10-17 review N6). Labels are not truncated; the horizontal scroll content leaves them unconstrained.
  const scrollRow = overflow === "scroll" || (!stacked && !pills && !textOnly);
  const [trackWidth, setTrackWidth] = useState(0);
  const railRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const railOffset = useRef(0);
  const reveal = (rect: SelectionHighlightRect | undefined) => {
    if (!scrollRow || !rect || trackWidth <= 0) return;
    const offset = railOffset.current;
    const next = resolveScrollRevealOffset(offset, trackWidth, rect.x, rect.width);
    if (next !== offset) { railOffset.current = next; railRef.current?.scrollTo({ x: next, animated: false }); }
  };
  useEffect(() => { reveal(selectedRect); }, [selectedRect, trackWidth, scrollRow]);
  const borderWidth = pills || textOnly ? 0 : segmentedControlRecipe.container.borderWidth;
  const containerStyle = {
          backgroundColor: pills || textOnly ? "transparent" : resolveColorReference(
            segmentedControlRecipe.container.background,
            theme.palette,
          ),
          borderColor: resolveColorReference(
            segmentedControlRecipe.container.border,
            theme.palette,
          ),
          borderRadius: theme.tokens.radius[segmentedControlRecipe.container.radius],
          borderWidth,
          direction: environment.direction,
  } as const;
  const rowStyle = {
          flexDirection: stacked ? "column" : "row",
          flexWrap: pills && !scrollRow ? "wrap" : "nowrap",
          gap: textOnly ? segmentedControlRecipe.text.gap : pills ? segmentedControlRecipe.pills.gap : segmentedControlRecipe.container.gap,
          padding: pills || textOnly ? 0 : segmentedControlRecipe.container.padding,
  } as const;
  const content = (<>
      {movingHighlight && highlightRect ? <NativeSelectionHighlight rect={highlightRect} selection={selected} reducedMotion={environment.reducedMotion} pills={pills} disabled={disabled} brand={selectionTone === "brand"} /> : null}
      {resolvedItems.map((item) => {
        const isSelected = item.value === selected;
        const optionDisabled = disabled || item.disabled === true;
        const contentColor = resolveColorReference(
          isSelected
            ? (selectionTone === "brand" && !textOnly ? segmentedControlRecipe.selectedBrand.content : pills ? segmentedControlRecipe.pills.selectedContent : segmentedControlRecipe.item.selectedContent)
            : segmentedControlRecipe.item.idleContent,
          theme.palette,
        );
        const leading = item.leading ?? item.renderLeading?.({
          selected: isSelected,
          disabled: optionDisabled,
          color: textOnly ? (isSelected ? theme.colors.text : theme.colors.textMuted) : contentColor,
          size: glyph.sm,
        });
        return (
          <Pressable
            key={item.value}
            onFocus={() => reveal(itemRects[item.value])}
            onLayout={selectionMotion === "slide" || scrollRow ? event => {
              const { x, y, width, height } = event.nativeEvent.layout;
              if (width <= 0 || height <= 0) return;
              setItemRects(previous => {
                const old = previous[item.value];
                return old && old.x === x && old.y === y && old.width === width && old.height === height ? previous : { ...previous, [item.value]: { x, y, width, height } };
              });
            } : undefined}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: optionDisabled }}
            // RN Web does not forward checked state from accessibilityState. Share the
            // existing choice adapter so filter rails expose selection and one keyboard entry.
            {...webOnly(webChoiceProps({ kind: "radio", checked: isSelected, disabled: optionDisabled,
              readOnly: false, tabIndex: isSelected && !optionDisabled ? 0 : -1,
              onActivate: () => setSelected(item.value) }))}
            disabled={optionDisabled}
            hitSlop={pills || textOnly ? undefined : { top: itemHitSlop, bottom: itemHitSlop }}
            onPress={() => setSelected(item.value)}
            style={({ pressed }) => [
              {
                alignItems: "center",
                backgroundColor: !textOnly && !movingHighlight && !pills && isSelected
                  ? resolveColorReference(
                      selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.item.selectedBackground,
                      theme.palette,
                    )
                  : "transparent",
                borderColor: isSelected && !movingHighlight
                  ? resolveColorReference(
                      segmentedControlRecipe.item.selectedBorder,
                      theme.palette,
                    )
                  : "transparent",
                borderRadius: theme.tokens.radius[segmentedControlRecipe.item.radius],
                borderWidth: !textOnly && !pills && isSelected
                  ? segmentedControlRecipe.item.selectedBorderWidth
                  : 0,
                flexBasis: scrollRow ? "auto" : undefined,
                flexGrow: scrollRow && !pills && !textOnly ? 1 : undefined,
                flexShrink: scrollRow ? 0 : undefined,
                maxWidth: pills ? "100%" : undefined,
                // Leading artwork and its label share a row; column layout squeezed theme options.
                flexDirection: textOnly ? "column" : "row",
                gap: segmentedControlRecipe.item.gap,
                justifyContent: "center",
                minHeight: pills ? Math.max(segmentedControlRecipe.pills.minHeight, outerHeight + 2 * segmentedControlRecipe.pills.inset) : textOnly ? segmentedControlRecipe.text.minHeight : itemMinHeight,
                opacity: optionDisabled
                  ? segmentedControlRecipe.item.disabledOpacity
                  : pressed
                    ? segmentedControlRecipe.item.pressedOpacity
                    : 1,
                paddingHorizontal: textOnly ? 0 : pills ? segmentedControlRecipe.pills.paddingHorizontal[size] : sizeContract.paddingHorizontal,
                paddingVertical: pills ? segmentedControlRecipe.pills.inset : undefined,
                width: stacked ? "100%" : undefined,
              },
            ]}
          >
            {pills ? <View pointerEvents="none" accessible={false} style={{position:"absolute",left:0,right:0,top:segmentedControlRecipe.pills.inset,bottom:segmentedControlRecipe.pills.inset,borderRadius:segmentedControlRecipe.pills.radius,backgroundColor:isSelected?(movingHighlight?"transparent":resolveColorReference(selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.pills.selectedBackground,theme.palette)):resolveColorReference(segmentedControlRecipe.pills.background,theme.palette),borderWidth:segmentedControlRecipe.pills.borderWidth,borderColor:resolveColorReference(isSelected?(selectionTone === "brand" ? segmentedControlRecipe.selectedBrand.background : segmentedControlRecipe.pills.selectedBackground):segmentedControlRecipe.pills.border,theme.palette)}}/> : null}
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
              fontRole="ui"
              align="center"
              style={{
                color: textOnly ? (isSelected ? theme.colors.text : theme.colors.textMuted) : contentColor,
                fontWeight: textOnly ? segmentedControlRecipe.text[textEmphasis][isSelected ? "selected":"idle"] : isSelected
                  ? segmentedControlRecipe.item.selectedFontWeight
                  : segmentedControlRecipe.item.fontWeight,
              }}
              tone={isSelected ? "brand" : "muted"}
              variant={textOnly ? "bodyLarge" : pills ? segmentedControlRecipe.pills.textVariant : sizeContract.textVariant}
            >
              {item.label}
            </Text>
            {textOnly ? <View accessible={false} style={{width:segmentedControlRecipe.text.indicatorWidth,height:segmentedControlRecipe.text.indicatorHeight,borderRadius:segmentedControlRecipe.text.indicatorRadius,backgroundColor:isSelected ? theme.colors.contentBrand:"transparent"}}/> : null}
          </Pressable>
        );
      })}
  </>);
  // The scroller clips its content, so it reaches `outerSlop` past the 36 track on each block side (negative
  // margin, no layout growth) and the options' vertical slop can complete the 44 target like Chip's hitSlop.
  // An explicit flexGrow:0 overrides Yoga's flex:1 shorthand. Apply it only without actions,
  // otherwise the radio rail collapses to zero while its fixed actions remain visible.
  const group = scrollRow ? (
    <View accessibilityLabel={label} accessibilityRole="radiogroup" testID={actions == null ? testID : undefined} style={[actions == null ? { flexGrow: 0 } : { flex: 1, minWidth: 0 }, actions == null ? layoutStyle : undefined]}>
      <ScrollView
        ref={railRef}
        horizontal
        keyboardShouldPersistTaps="handled"
        onScroll={event => { railOffset.current = event.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
        style={{ direction: "ltr", flexGrow: 0, marginVertical: pills || textOnly ? 0 : -outerSlop }}
        contentContainerStyle={{ minWidth: pills || textOnly ? undefined : trackWidth, paddingVertical: pills || textOnly ? 0 : outerSlop }}
      >
        <View style={[containerStyle, rowStyle, { flexGrow: 1 }]}>{content}</View>
      </ScrollView>
    </View>
  ) : (
    <View accessibilityLabel={label} accessibilityRole="radiogroup" testID={actions == null ? testID : undefined} style={[containerStyle, rowStyle, actions == null ? layoutStyle : { flex: 1, minWidth: 0 }]}>
      {content}
    </View>
  );
  // Actions are siblings, not radio options, and stay visible while the filter row scrolls (Spint spot rail).
  return actions == null ? group : <View testID={testID} style={[{ flexDirection: "row", direction: environment.direction, alignItems: "center", gap: spacing.xs }, layoutStyle]}>{group}{actions}</View>;
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
/** Forwards the host View ref so a chip can be a focus-return target (2026-10-16, DiscoveryGallery). */
export const Chip: ReturnType<typeof forwardRef<ComponentRef<typeof View>, ChipProps>> = forwardRef<ComponentRef<typeof View>, ChipProps>(function Chip({
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
  trailingStyle,
  renderSelectionIndicator,
  selectionMode = "action",
  selected,
  onPress,
}, ref) {
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
      ref={ref}
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
          borderRadius: theme.tokens.radius[chipRecipe.radius],
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
              fontRole="ui"
        align="center"
        style={[
          {
            color: contentColor,
            // Shrink beside the leading glyph and selection mark so a long label wraps inside the chip (chip.md: labels
            // wrap). At its natural width the label plus the glyphs overran the chip (2026-10-23 flex audit).
            flexShrink: 1,
            fontWeight: active
              ? chipRecipe.label.selectedFontWeight
              : chipRecipe.label.fontWeight,
          },
        ]}
        variant={metrics.textVariant}
      >
        {label}
      </Text>
      {trailing ? <View accessible={false} style={trailingStyle}>{trailing}</View> : null}
    </Pressable>
  );
});
