import type { ComponentRef } from "react";
import { assertNoRemovedStyleProps } from "./internal/diagnostics.js";
import {
  getSliderStepTarget,
  resolveSliderDescriptor,
  resolveSliderFillFraction,
  resolveSliderValueFromOffset,
  sliderRecipe,
} from "@hjmds/design-contracts/components/slider";
import {
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PanResponder,
  Text as NativeText,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";

import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useControllableState } from "./internal/state.js";
import { logicalTextAlign, resolveNativeFontStyle, resolveNativeTextScaleProps } from "./internal/styles.js";
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

/** Points of travel before a drag counts as horizontal or vertical intent. */
const sliderIntentSlop = 6;

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
    /** Canonical layout-only placement for the complete slider. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/**
 * HJM-internal: ColorPicker's hue and opacity bars reuse this gesture and accessibility logic with a painted track.
 * The visible header is dropped (the bar itself shows the value) and the thumb shows the colour under it.
 */
export type SliderPrivateProps = Readonly<{ hjmColorTrack?: Readonly<{ fill: ReactNode; thumbFill: ReactNode; height: number; thumbDiameter: number; thumbBorder: number; direction: "ltr" | "rtl" }> }>;

/** Dependency-free horizontal Slider using the Native responder system. */
export const Slider: ReturnType<typeof forwardRef<ComponentRef<typeof View>, SliderProps>> = forwardRef<ComponentRef<typeof View>, SliderProps & SliderPrivateProps>(function Slider(
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
    layoutStyle,
    hjmColorTrack,
    ...viewProps
  },
  forwardedRef,
) {
  assertNoRemovedStyleProps("Slider", viewProps, ["containerStyle", "controlStyle"]);
  const { colors, environment, textScaling, tokens } = useHjmNativeTheme();
  // Painted colour tracks define a physical colour axis independently of the
  // surrounding labels' reading order; gestures and thumb geometry share it.
  const trackDirection = hjmColorTrack?.direction ?? environment.direction;

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
  const thumbDiameter = hjmColorTrack?.thumbDiameter ?? recipe.thumbDiameter;
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
  const updateFromLocation = (locationX: number) => {
    if (disabled) return;
    const extent = layoutWidth - thumbDiameter;
    if (extent <= 0) return;
    const offset = locationX - thumbDiameter / 2;
    publish(resolveSliderValueFromOffset(
      descriptor,
      offset,
      extent,
      trackDirection,
    ));
  };
  const performAction = (intent: "increment" | "decrement") => {
    if (disabled) return;
    const next = getSliderStepTarget(descriptor, intent);
    if (Object.is(next, currentValue)) return;
    publish(next);
    onValueChangeEnd?.(next);
  };

  const begin = () => {
    activeGestureRef.current = true;
    lastInteractionValueRef.current = currentValueRef.current;
    setDragging(true);
  };
  const beginRef = useRef(begin);
  beginRef.current = begin;
  const updateFromLocationRef = useRef(updateFromLocation);
  const finishRef = useRef(finish);
  updateFromLocationRef.current = updateFromLocation;
  finishRef.current = finish;

  // The responder is taken on touch start so a tap can still seek, but nothing is
  // written until the gesture shows horizontal intent (dx dominates past the slop)
  // or ends as a tap. Writing on grant moved the value 50% -> 88% when a vertical
  // page scroll merely started on the track (2026-09-30 audit, Android). A vertical
  // start leaves the gesture pending, so the ScrollView's termination request ends
  // it with no value change and no onValueChangeEnd. Rejected: claiming only on
  // move, which loses tap-to-seek on the track.
  const gestureIntentRef = useRef<"pending" | "horizontal" | "vertical">("pending");
  const grantLocationRef = useRef(0);
  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: (_event, gesture) => !disabledRef.current
        && Math.abs(gesture.dx) > sliderIntentSlop
        && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (event) => {
        gestureIntentRef.current = "pending";
        grantLocationRef.current = event.nativeEvent.locationX;
      },
      onPanResponderMove: (event, gesture) => {
        if (disabledRef.current) return;
        if (gestureIntentRef.current === "pending") {
          const dx = Math.abs(gesture?.dx ?? 0);
          const dy = Math.abs(gesture?.dy ?? 0);
          if (dy > sliderIntentSlop && dy >= dx) {
            gestureIntentRef.current = "vertical";
          } else if (dx > sliderIntentSlop && dx > dy) {
            gestureIntentRef.current = "horizontal";
            beginRef.current();
          }
        }
        if (gestureIntentRef.current === "horizontal") updateFromLocationRef.current(event.nativeEvent.locationX);
      },
      onPanResponderRelease: (_event, gesture) => {
        if (
          gestureIntentRef.current === "pending"
          && Math.abs(gesture?.dx ?? 0) <= sliderIntentSlop
          && Math.abs(gesture?.dy ?? 0) <= sliderIntentSlop
          && !disabledRef.current
        ) {
          // A tap: seek once to where the finger went down.
          beginRef.current();
          updateFromLocationRef.current(grantLocationRef.current);
        }
        gestureIntentRef.current = "pending";
        finishRef.current();
      },
      onPanResponderTerminate: () => {
        gestureIntentRef.current = "pending";
        finishRef.current();
      },
      // Yield to a parent scroll until the drag is known to be horizontal.
      onPanResponderTerminationRequest: () => gestureIntentRef.current !== "horizontal",
      onShouldBlockNativeResponder: () => true,
    }),
    [],
  );

  useEffect(() => {
    if (disabled) finishRef.current();
  }, [disabled]);

  const fraction = resolveSliderFillFraction(descriptor);
  const travel = Math.max(0, layoutWidth - thumbDiameter);
  const visualFraction = trackDirection === "rtl" ? 1 - fraction : fraction;
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
    resolveNativeFontStyle(tokens.fontFamily.ui),
    tokens.typography[recipe.labelVariant],
    { color: colors.textBody, textAlign: logicalTextAlign(environment.direction) },
  ]);
  const valueTextScaleProps = resolveNativeTextScaleProps(textScaling, [
    resolveNativeFontStyle(tokens.fontFamily.ui),
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
          gap: sliderRecipe.header.trackGap,
          opacity: disabled ? sliderRecipe.states.disabledOpacity : 1,
        },
        layoutStyle,
      ]}
    >
      {hjmColorTrack ? null : (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            alignItems: "baseline",
            direction: environment.direction,
            flexDirection: "row",
            gap: sliderRecipe.header.gap,
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
      )}
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
            direction: trackDirection,
          },
        ]}
      >
        {hjmColorTrack ? (
          <>
            <View
              pointerEvents="none"
              style={{
                borderRadius: tokens.radius.full,
                height: hjmColorTrack.height,
                left: 0,
                overflow: "hidden",
                position: "absolute",
                right: 0,
              }}
            >
              {hjmColorTrack.fill}
            </View>
            <View
              pointerEvents="none"
              style={{
                borderColor: focused ? colors.contentBrand : "#ffffff",
                borderRadius: tokens.radius.full,
                borderWidth: hjmColorTrack.thumbBorder,
                elevation: 2,
                height: thumbDiameter,
                left: thumbLeft,
                overflow: "hidden",
                position: "absolute",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                width: thumbDiameter,
                zIndex: 2,
              }}
            >
              {hjmColorTrack.thumbFill}
            </View>
          </>
        ) : (
          <>
            <View
              pointerEvents="none"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.textMuted,
                borderRadius: tokens.radius.full,
                borderWidth: 1,
                height: recipe.trackHeight,
                left: thumbDiameter / 2,
                position: "absolute",
                right: thumbDiameter / 2,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                backgroundColor: colors.contentBrand,
                borderRadius: tokens.radius.full,
                height: recipe.trackHeight,
                ...(environment.direction === "rtl"
                  ? { right: thumbDiameter / 2 }
                  : { left: thumbDiameter / 2 }),
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
                  height: thumbDiameter + sliderRecipe.states.focus.offset * 2,
                  left: thumbLeft - sliderRecipe.states.focus.offset,
                  position: "absolute",
                  width: thumbDiameter + sliderRecipe.states.focus.offset * 2,
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
                height: thumbDiameter,
                left: thumbLeft,
                opacity: dragging ? sliderRecipe.states.draggedOpacity : 1,
                position: "absolute",
                width: thumbDiameter,
                zIndex: 2,
              }}
            />
          </>
        )}
      </View>
    </View>
  );
});
