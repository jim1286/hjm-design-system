import {
  getSliderStepTarget,
  resolveSliderDescriptor,
  resolveSliderFillFraction,
  resolveSliderValueFromOffset,
  sliderRecipe,
} from "@hjmds/design-contracts/components/slider";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PanResponder,
  Text as NativeText,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useControllableState } from "./internal/state.js";
import { logicalTextAlign, resolveNativeTextScaleProps } from "./internal/styles.js";
import { useHjmNativeTheme } from "./provider.js";

type NativeSliderViewProps = Omit<
  ViewProps,
  | "accessibilityActions"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "accessibilityValue"
  | "accessible"
  | "children"
  | "onAccessibilityAction"
  | "onLayout"
  | "style"
>;

export type SliderProps = NativeSliderViewProps &
  Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
    disabled?: boolean;
    /** Product-localized label for the standard adjustable decrement action. */
    decrementLabel: string;
    /** Product-localized label for the standard adjustable increment action. */
    incrementLabel: string;
    /** Product-owned visible and accessible value formatting. */
    getValueText?: (value: number) => string;
    onLayout?: (event: LayoutChangeEvent) => void;
    containerStyle?: StyleProp<ViewStyle>;
    controlStyle?: StyleProp<ViewStyle>;
  }>;

/** Dependency-free horizontal Slider using the Native responder system. */
export const Slider = forwardRef<View, SliderProps>(function Slider(
  {
    label,
    min,
    max,
    step,
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    decrementLabel,
    incrementLabel,
    getValueText,
    disabled = false,
    onFocus,
    onBlur,
    onLayout,
    containerStyle,
    controlStyle,
    ...viewProps
  },
  forwardedRef,
) {
  const { colors, environment, textScaling, tokens } = useHjmNativeTheme();
  const [currentValue, setCurrentValue] = useControllableState<number>({
    ...(value === undefined ? {} : { value }),
    defaultValue: defaultValue ?? min,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const valueText = getValueText?.(currentValue);
  const descriptor = resolveSliderDescriptor({
    label,
    value: currentValue,
    min,
    max,
    ...(step === undefined ? {} : { step }),
    ...(valueText === undefined ? {} : { valueText }),
  });
  const recipe = sliderRecipe.sizes.medium;
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const activeGestureRef = useRef(false);
  const lastInteractionValueRef = useRef(currentValue);
  const currentValueRef = useRef(currentValue);
  const disabledRef = useRef(disabled);
  currentValueRef.current = currentValue;
  disabledRef.current = disabled;

  useEffect(() => {
    if (!activeGestureRef.current) lastInteractionValueRef.current = currentValue;
  }, [currentValue]);

  const publish = (next: number) => {
    const previous = activeGestureRef.current
      ? lastInteractionValueRef.current
      : currentValue;
    lastInteractionValueRef.current = next;
    if (!Object.is(next, previous)) setCurrentValue(next);
  };
  const finish = () => {
    if (!activeGestureRef.current) return;
    activeGestureRef.current = false;
    setDragging(false);
    onValueChangeEnd?.(lastInteractionValueRef.current);
  };
  const updateFromLocation = (event: GestureResponderEvent) => {
    if (disabled) return;
    const extent = layoutWidth - recipe.thumbDiameter;
    if (extent <= 0) return;
    const offset = event.nativeEvent.locationX - recipe.thumbDiameter / 2;
    publish(resolveSliderValueFromOffset(
      descriptor,
      offset,
      extent,
      environment.direction,
    ));
  };
  const performAction = (intent: "increment" | "decrement") => {
    if (disabled) return;
    const next = getSliderStepTarget(descriptor, intent);
    if (Object.is(next, currentValue)) return;
    publish(next);
    onValueChangeEnd?.(next);
  };

  const updateFromLocationRef = useRef(updateFromLocation);
  const finishRef = useRef(finish);
  updateFromLocationRef.current = updateFromLocation;
  finishRef.current = finish;

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (event) => {
        if (disabledRef.current) return;
        activeGestureRef.current = true;
        lastInteractionValueRef.current = currentValueRef.current;
        setDragging(true);
        updateFromLocationRef.current(event);
      },
      onPanResponderMove: (event) => updateFromLocationRef.current(event),
      onPanResponderRelease: () => finishRef.current(),
      onPanResponderTerminate: () => finishRef.current(),
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
    }),
    [],
  );

  useEffect(() => {
    if (disabled) finishRef.current();
  }, [disabled]);

  const fraction = resolveSliderFillFraction(descriptor);
  const travel = Math.max(0, layoutWidth - recipe.thumbDiameter);
  const visualFraction = environment.direction === "rtl" ? 1 - fraction : fraction;
  const thumbLeft = travel * visualFraction;
  const visibleValue = valueText ?? String(currentValue);
  const actionProps = disabled
    ? {}
    : {
        accessibilityActions: [
          { name: "increment" as const, label: incrementLabel },
          { name: "decrement" as const, label: decrementLabel },
        ],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (event.nativeEvent.actionName === "increment") performAction("increment");
          if (event.nativeEvent.actionName === "decrement") performAction("decrement");
        },
      };
  const labelTextScaleProps = resolveNativeTextScaleProps(textScaling, [
    tokens.typography[recipe.labelVariant],
    { color: colors.textBody, textAlign: logicalTextAlign(environment.direction) },
  ]);
  const valueTextScaleProps = resolveNativeTextScaleProps(textScaling, [
    tokens.typography[recipe.valueLabelVariant],
    {
      color: colors.textMuted,
      fontVariant: ["tabular-nums"],
      textAlign: logicalTextAlign(environment.direction),
    },
  ]);

  return (
    <View
      style={[
        {
          gap: tokens.spacing.xs,
          opacity: disabled ? sliderRecipe.states.disabledOpacity : 1,
        },
        containerStyle,
      ]}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          alignItems: "baseline",
          direction: environment.direction,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <NativeText {...labelTextScaleProps}>
          {label}
        </NativeText>
        <NativeText {...valueTextScaleProps}>
          {visibleValue}
        </NativeText>
      </View>
      <View
        {...viewProps}
        {...panResponder.panHandlers}
        {...actionProps}
        ref={forwardedRef}
        accessible
        accessibilityLabel={label}
        accessibilityRole="adjustable"
        accessibilityState={{ disabled }}
        accessibilityValue={{
          min,
          max,
          now: currentValue,
          ...(valueText === undefined ? {} : { text: valueText }),
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onLayout={(event) => {
          setLayoutWidth(event.nativeEvent.layout.width);
          onLayout?.(event);
        }}
        style={[
          {
            justifyContent: "center",
            minHeight: recipe.hitTarget,
            minWidth: recipe.hitTarget,
          },
          controlStyle,
        ]}
      >
        <View
          pointerEvents="none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.textMuted,
            borderRadius: tokens.radius.full,
            borderWidth: 1,
            height: recipe.trackHeight,
            left: recipe.thumbDiameter / 2,
            position: "absolute",
            right: recipe.thumbDiameter / 2,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: colors.contentBrand,
            borderRadius: tokens.radius.full,
            height: recipe.trackHeight,
            ...(environment.direction === "rtl"
              ? { right: recipe.thumbDiameter / 2 }
              : { left: recipe.thumbDiameter / 2 }),
            position: "absolute",
            width: travel * fraction,
          }}
        />
        {focused ? (
          <View
            pointerEvents="none"
            style={{
              borderColor: colors.contentBrand,
              borderRadius: tokens.radius[sliderRecipe.radius],
              borderWidth: sliderRecipe.states.focus.width,
              height: recipe.thumbDiameter + sliderRecipe.states.focus.offset * 2,
              left: thumbLeft - sliderRecipe.states.focus.offset,
              position: "absolute",
              width: recipe.thumbDiameter + sliderRecipe.states.focus.offset * 2,
              zIndex: 1,
            }}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.contentBrand,
            borderRadius: tokens.radius.full,
            borderWidth: 2,
            height: recipe.thumbDiameter,
            left: thumbLeft,
            opacity: dragging ? sliderRecipe.states.draggedOpacity : 1,
            position: "absolute",
            width: recipe.thumbDiameter,
            zIndex: 2,
          }}
        />
      </View>
    </View>
  );
});
