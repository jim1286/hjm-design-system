import type { ComponentRef } from "react";
import type { ThemeColors } from "@hjmds/design-contracts/colors";
import {
  isLargeTextScale,
  visibleControlHeight,
} from "@hjmds/design-contracts/components/design-system-provider";
import { control, spacing } from "@hjmds/design-contracts/foundations";
import {
  buttonRecipe,
  resolveButtonDepth,
  resolveButtonEdgeOverhang,
  resolveButtonLabelLines,
} from "@hjmds/design-contracts/recipes/base";
import { Children, forwardRef, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  View,
  type View as NativeView,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Text } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";

import type { ButtonProps } from "../actions.js";
// Only HJM recipe compositions may override painting; package exports hide this module from products.
type RecipeButtonProps = ButtonProps &
  Readonly<{ style?: StyleProp<ViewStyle>; labelStyle?: StyleProp<TextStyle> }>;
// React Native cannot render a raw string outside <Text>. JSX such as `{count} shared` or
// `Filter{suffix}` produces an array of strings/numbers, which the single-string check used to miss,
// so the label rendered bare inside Pressable and crashed ("Text strings must be rendered within a
// <Text> component", Showcase 2026-10-06). Joining keeps the same Text, wrapping cap and accessible
// name as a single string, matching Web where mixed text children already work. Children that
// contain elements still render as-is.
function joinTextChildren(children: ReactNode): ReactNode {
  if (!Array.isArray(children)) return children;
  const parts = Children.toArray(children);
  return parts.length > 0 && parts.every((part) => typeof part === "string" || typeof part === "number")
    ? parts.join("")
    : children;
}

// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export const RecipeButton: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, RecipeButtonProps>> = forwardRef<ComponentRef<typeof NativeView>, RecipeButtonProps>(
  function RecipeButton(
    {
      children,
      tone = buttonRecipe.defaults.tone,
      size = buttonRecipe.defaults.size,
      shape: suppliedShape,
      appearance: suppliedAppearance,
      align = buttonRecipe.defaults.align,
      selected,
      disabled = false,
      loading = false,
      completion,
      disableWhileLoading = false,
      growWithContent = false,
      loadingLabel,
      leading,
      trailing,
      edge,
      fullWidth = false,
      hitSlop,
      layoutStyle,
      style,
      labelStyle,

      renderLoadingIndicator,
      accessibilityLabel,
      accessibilityState,
      onPress,
      onLongPress,
      onPressIn,
      onPressOut,
      ...props
    }: RecipeButtonProps,
    ref,
  ) {
    const { colors, environment, tokens, textScaling, designProfile } = useHjmNativeTheme();
    const shape = suppliedShape ?? designProfile?.controls?.button?.shape ?? buttonRecipe.defaults.shape;
    const appearance = suppliedAppearance ?? designProfile?.controls?.button?.appearance ?? buttonRecipe.defaults.appearance;
    const depth = resolveButtonDepth(appearance, tone, size);
    const sideColor = tone === "secondary" ? colors.borderControl : tone === "danger" ? colors.dangerFill : colors.primary;
    const [pressOffset] = useState(() => new Animated.Value(0));
    useEffect(() => { pressOffset.stopAnimation(); pressOffset.setValue(0); }, [pressOffset, depth, disabled, loading]);
    useEffect(() => () => pressOffset.stopAnimation(), [pressOffset]);
    const moveFace = (offset: number) => {
      pressOffset.stopAnimation();
      Animated.timing(pressOffset, { toValue: offset, duration: environment.reducedMotion ? 0 : buttonRecipe.raised.settleDuration, useNativeDriver: true }).start();
    };
    const labelLines = resolveButtonLabelLines(
      isLargeTextScale(environment.textScale),
    );
    const inactive = disabled && !loading;
    const unavailable = inactive || (loading && disableWhileLoading);
    // Preserve the idle content's measured width while the pending label remains the accessible name.
    const content = joinTextChildren(children);
    const textContent = typeof content === "string" || typeof content === "number";
    if (completion && (!completion.label.trim() || typeof completion.confirmed !== "boolean" || !textContent)) {
      throw new TypeError("Button completion requires a nonempty label, a boolean confirmed value and text-only children");
    }
    const completed = completion?.confirmed === true && !loading;
    const currentContent = completed ? completion.label : content;
    const announcedContent = loading && loadingLabel !== undefined ? loadingLabel : currentContent;
    if (content === undefined || content === null || content === false) {
      throw new TypeError("Button requires children");
    }
    const toneContract = buttonRecipe.tones[tone];
    const edgeOverhang = edge === undefined ? 0 : resolveButtonEdgeOverhang(tone, size);
    const sizeContract = buttonRecipe.sizes[size];
    const selectedContract =
      selected === true && tone !== "primary" && tone !== "danger" ? buttonRecipe.states.selected : null;
    const resolveColor = (key: keyof ThemeColors | null): string =>
      key === null ? "transparent" : colors[key];
    const contentColor = resolveColor(
      selectedContract?.content ?? toneContract.content,
    );
    const visibleHeight = visibleControlHeight(
      sizeContract.height,
      environment.minimumVisualTarget,
    );
    // Yoga has no intrinsic overlapping grid. Hidden flow labels supply the maximum
    // width; a recipe-height slot exists before their first native measurement.
    const measurementKey = completion ? JSON.stringify([content, completion.label, size, tokens.fontFamily, tokens.typography[sizeContract.textVariant], environment.textScale, labelStyle]) : "";
    const [labelMeasurements, setLabelMeasurements] = useState<{ key: string; idle: number; complete: number }>({ key: "", idle: 0, complete: 0 });
    const labelMetric = tokens.typography[sizeContract.textVariant];
    const initialSlotHeight = labelMetric.lineHeight * textScaling.scale * (labelLines ?? 1);
    const measured = labelMeasurements.key === measurementKey ? Math.max(labelMeasurements.idle, labelMeasurements.complete) : 0;
    const slotHeight = Math.max(initialSlotHeight, measured);
    const measureLabel = (label: "idle" | "complete", height: number) => {
      setLabelMeasurements(previous => {
        const current = previous.key === measurementKey ? previous : { key: measurementKey, idle: 0, complete: 0 };
        return current[label] === height ? current : { ...current, [label]: height };
      });
    };
    const slots = <>
        {loading && leading != null ? <View style={{ opacity: 0 }}>{leading}</View> : leading}
        {completion ? <View style={{ flexShrink: 1, minWidth: 0, height: slotHeight }}>
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 0, opacity: 0 }}>
            <Text fontRole="ui" emphasis="medium" variant={sizeContract.textVariant} {...(labelLines === null ? {} : { numberOfLines: labelLines })} onLayout={event => measureLabel("idle", event.nativeEvent.layout.height)} style={[{ color: contentColor, flexShrink: 0, minWidth: 0 }, labelStyle]}>{content}</Text>
            <Text fontRole="ui" emphasis="medium" variant={sizeContract.textVariant} {...(labelLines === null ? {} : { numberOfLines: labelLines })} onLayout={event => measureLabel("complete", event.nativeEvent.layout.height)} style={[{ color: contentColor, flexShrink: 0, minWidth: 0 }, labelStyle]}>{completion.label}</Text>
          </View>
          <View pointerEvents="none" style={{ position: "absolute", inset: 0, justifyContent: "center", opacity: loading ? 0 : 1 }}>
            <Text fontRole="ui" align={align === "leading" ? "auto" : "center"} emphasis="medium" variant={sizeContract.textVariant} {...(labelLines === null ? {} : { numberOfLines: labelLines })} style={[{ color: contentColor, minWidth: 0 }, labelStyle]}>{currentContent}</Text>
          </View>
        </View> : textContent ? (
          <Text
              fontRole="ui"
            align={align === "leading" ? "auto" : "center"}
            emphasis="medium"
            // Wrap up to the recipe's cap instead of the single line RN gives by
            // default; the cap lifts under large text (buttonRecipe.label).
            {...(labelLines === null ? {} : { numberOfLines: labelLines })}
            style={[{ color: contentColor, flexShrink: 1, minWidth: 0 }, labelStyle, loading ? { opacity: 0 } : null]}
            variant={sizeContract.textVariant}
          >
            {content}
          </Text>
        ) : (
          loading ? <View importantForAccessibility="no-hide-descendants" style={{ opacity: 0 }}>{content}</View> : content
        )}
        {loading && trailing != null ? <View style={{ opacity: 0 }}>{trailing}</View> : trailing}
        {loading ? <View pointerEvents="none" style={{ alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 }}>
          {renderLoadingIndicator?.({ color: contentColor, size: "small" }) ?? <ActivityIndicator color={contentColor} size="small" />}
        </View> : null}
    </>;
    const faceStyle = (): ViewStyle => ({
            alignItems: "center",
            backgroundColor: resolveColor(
              toneContract.background,
            ),
            borderColor: resolveColor(
              toneContract.border,
            ),
            borderRadius: tokens.radius[buttonRecipe.shapes[shape]],
            borderWidth: toneContract.border ? 1 : 0,
            direction: environment.direction,
            flexDirection: "row",
            gap: spacing.xs,
            // Wrapped labels need their intrinsic height, especially when large text
            // lifts the line cap. Fixed recipe height clipped the independent 2x fixture.
            ...(growWithContent || textContent ? {} : { height: visibleHeight }),
            justifyContent: buttonRecipe.aligns[align],
            minHeight: visibleHeight,
            minWidth: control.minTouchTarget,
            opacity: 1,
            paddingHorizontal:
              toneContract.paddingHorizontal ?? sizeContract.paddingHorizontal,
          });
    return (
      <Pressable
        {...props}
        ref={ref}
        accessibilityLabel={
          accessibilityLabel ??
          (typeof announcedContent === "string" ? announcedContent : undefined)
        }
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          ...(selected === undefined ? {} : { selected }),
          disabled: disabled || loading,
          busy: loading,
        }}
        disabled={unavailable}
        hitSlop={
          hitSlop ??
          (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined)
        }
        onPressIn={event => { if (!disabled && !loading && depth > 0) moveFace(depth); onPressIn?.(event); }}
        onPressOut={event => { if (depth > 0) moveFace(0); onPressOut?.(event); }}
        onPress={loading ? () => undefined : onPress}
        onLongPress={loading ? () => undefined : onLongPress}
        style={({ pressed }) => depth > 0 ? [
          { paddingBottom: depth, backgroundColor: sideColor, borderRadius: tokens.radius[buttonRecipe.shapes[shape]], opacity: inactive ? buttonRecipe.opacity.disabled : 1,
            ...(fullWidth ? { width: "100%" as const, alignSelf: "stretch" as const } : {}) }, style, layoutStyle,
        ] : [
          {
            alignItems: "center",
            backgroundColor: resolveColor(
              toneContract.background,
            ),
            borderColor: resolveColor(
              toneContract.border,
            ),
            borderRadius: tokens.radius[buttonRecipe.shapes[shape]],
            borderWidth: toneContract.border ? 1 : 0,
            direction: environment.direction,
            flexDirection: "row",
            gap: spacing.xs,
            // Wrapped labels need their intrinsic height, especially when large text
            // lifts the line cap. Fixed recipe height clipped the independent 2x fixture.
            ...(growWithContent || textContent ? {} : { height: visibleHeight }),
            justifyContent: buttonRecipe.aligns[align],
            minHeight: visibleHeight,
            minWidth: control.minTouchTarget,
            opacity: inactive
              ? buttonRecipe.opacity.disabled
              : pressed
              ? buttonRecipe.opacity.pressed
              : 1,
            paddingHorizontal:
              toneContract.paddingHorizontal ?? sizeContract.paddingHorizontal,
            // Edge alignment (resolveButtonEdgeOverhang): a frameless button overhangs by its own padding.
            ...(edgeOverhang > 0 && edge !== "end" ? { marginStart: -edgeOverhang } : {}),
            ...(edgeOverhang > 0 && edge !== "start" ? { marginEnd: -edgeOverhang } : {}),
            // Stretch alone fills a column's cross axis, but becomes height in Card's row of actions.
            // fullWidth is explicitly the parent width in every host (button usage contract).
            ...(fullWidth ? { width: "100%" as const, alignSelf: "stretch" as const } : {}),
          },
          style,
          layoutStyle,
        ]}
      >
        {depth > 0 ? <>
          <View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: tokens.radius[buttonRecipe.shapes[shape]], backgroundColor: "#000000", opacity: buttonRecipe.raised.sideShade }} />
          <Animated.View style={[faceStyle(), { transform: [{ translateY: pressOffset }] }]}>{slots}</Animated.View>
        </> : slots}
      </Pressable>
    );
  },
);
