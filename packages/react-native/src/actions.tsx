import type { ThemeColors } from "@hjmds/design-contracts/colors";
import { control, glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import {
  buttonRecipe,
  type ButtonSize as ContractButtonSize,
  type ButtonTone as ContractButtonTone,
} from "@hjmds/design-contracts/recipes/base";
import {
  bottomCtaRecipe,
  iconButtonRecipe,
  resolveIconButtonPresentation,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonTone as ContractIconButtonTone,
} from "@hjmds/design-contracts/recipes";
import {
  resolveLinkDescriptor,
  type LinkDescriptor,
  type LinkDestination,
} from "@hjmds/design-contracts/components/link";
import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type View as NativeView,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { minimumTargetStyle } from "./internal/styles.js";

export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type {
  IconButtonShape,
  IconButtonSize,
} from "@hjmds/design-contracts/recipes";

export type ButtonProps = Omit<
  PressableProps,
  "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"
> &
  Readonly<{
    /** @deprecated Prefer renderer-neutral `children`. */
    label?: string;
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    /** Allow the control to grow beyond its recipe height for large or custom content. */
    growWithContent?: boolean;
    loadingLabel?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    fullWidth?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
  }>;

export const Button = forwardRef<NativeView, ButtonProps>(function Button({
  label,
  children,
  tone = buttonRecipe.defaults.tone,
  size = buttonRecipe.defaults.size,
  disabled = false,
  loading = false,
  disableWhileLoading = false,
  growWithContent = false,
  loadingLabel,
  leading,
  trailing,
  fullWidth = false,
  hitSlop,
  style,
  labelStyle,
  renderLoadingIndicator,
  accessibilityLabel,
  accessibilityState,
  onPress,
  onLongPress,
  ...props
}: ButtonProps, ref) {
  const { colors, environment } = useHjmNativeTheme();
  const inactive = disabled || loading;
  const unavailable = disabled || (loading && disableWhileLoading);
  const content = loading && loadingLabel !== undefined
    ? loadingLabel
    : children ?? label;
  if (content === undefined || content === null || content === false) {
    throw new TypeError("Button requires children (or the deprecated label prop)");
  }
  const toneContract = buttonRecipe.tones[tone];
  const sizeContract = buttonRecipe.sizes[size];
  const resolveColor = (key: keyof ThemeColors | null): string =>
    key === null ? "transparent" : colors[key];
  const contentColor = resolveColor(toneContract.content);
  return (
    <Pressable
      {...props}
      ref={ref}
      accessibilityLabel={
        accessibilityLabel ?? (typeof content === "string" ? content : undefined)
      }
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: unavailable, busy: loading }}
      disabled={unavailable}
      hitSlop={hitSlop ?? (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined)}
      onPress={loading ? () => undefined : onPress}
      onLongPress={loading ? () => undefined : onLongPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: resolveColor(toneContract.background),
          borderColor: resolveColor(toneContract.border),
          borderRadius: radius.md,
          borderWidth: toneContract.border ? 1 : 0,
          direction: environment.direction,
          flexDirection: "row",
          gap: spacing.xs,
          ...(growWithContent ? {} : { height: sizeContract.height }),
          justifyContent: "center",
          minHeight: sizeContract.height,
          minWidth: control.minTouchTarget,
          opacity: inactive
            ? buttonRecipe.opacity.disabled
            : pressed
              ? buttonRecipe.opacity.pressed
              : 1,
          paddingHorizontal: sizeContract.paddingHorizontal,
          ...(fullWidth ? { alignSelf: "stretch" } : {}),
        },
        style,
      ]}
    >
      {loading
        ? renderLoadingIndicator?.({ color: contentColor, size: "small" }) ?? (
            <ActivityIndicator color={contentColor} size="small" />
          )
        : leading}
      {typeof content === "string" || typeof content === "number" ? (
        <Text
          align="center"
          emphasis="medium"
          style={[{ color: contentColor }, labelStyle]}
          variant={sizeContract.textVariant}
        >
          {content}
        </Text>
      ) : content}
      {trailing}
    </Pressable>
  );
});

export type IconButtonTone = ContractIconButtonTone;
/** @deprecated `link` was never an IconButton recipe tone; use `ghost`. */
export type LegacyNativeIconButtonTone = "link";

type IconButtonNameProps =
  | Readonly<{ label: string; accessibilityLabel?: never }>
  | Readonly<{
      label?: never;
      /** @deprecated Prefer the renderer-neutral `label`. */
      accessibilityLabel: string;
    }>;

type IconButtonContentProps =
  | Readonly<{ children: ReactNode; icon?: never }>
  | Readonly<{
      children?: never;
      /** @deprecated Prefer the renderer-neutral `children`. */
      icon: ReactNode;
    }>;

export type IconButtonProps = Omit<
  PressableProps,
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "children"
  | "disabled"
  | "hitSlop"
  | "style"
> &
  IconButtonNameProps &
  IconButtonContentProps &
  Readonly<{
    tone?: IconButtonTone | LegacyNativeIconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    style?: StyleProp<ViewStyle>;
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
  }>;

export const IconButton = forwardRef<NativeView, IconButtonProps>(function IconButton({
  label,
  accessibilityLabel,
  children,
  icon,
  tone = iconButtonRecipe.defaults.tone,
  size = iconButtonRecipe.defaults.size,
  shape = iconButtonRecipe.defaults.shape,
  disabled = false,
  loading = false,
  disableWhileLoading = false,
  hitSlop,
  style,
  renderLoadingIndicator,
  onPress,
  onLongPress,
  accessibilityState,
  ...props
}: IconButtonProps, ref) {
  const theme = useHjmNativeTheme();
  const resolvedLabel = label ?? accessibilityLabel;
  const resolvedIcon = children ?? icon;
  if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
    throw new TypeError("IconButton label must not be empty");
  }
  if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
    throw new TypeError("IconButton requires children (or the deprecated icon prop)");
  }
  const resolvedTone: IconButtonTone = tone === "link" ? "ghost" : tone;
  const presentation = resolveIconButtonPresentation(resolvedTone, theme.palette);
  const sizeContract = iconButtonRecipe.sizes[size];
  const glyphSize = glyph[sizeContract.glyph];
  const unavailable = disabled || (loading && disableWhileLoading);
  return (
    <Pressable
      {...props}
      ref={ref}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: unavailable, busy: loading }}
      disabled={unavailable}
      hitSlop={hitSlop ?? (sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined)}
      onPress={loading ? () => undefined : onPress}
      onLongPress={loading ? () => undefined : onLongPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: presentation.background ?? "transparent",
          borderColor: presentation.border ?? "transparent",
          borderRadius: radius[iconButtonRecipe.shapes[shape]],
          borderWidth: 1,
          height: sizeContract.diameter,
          justifyContent: "center",
          minHeight: sizeContract.diameter,
          minWidth: sizeContract.diameter,
          opacity: disabled
            ? iconButtonRecipe.states.disabledOpacity
            : loading
              ? 1
            : pressed
              ? iconButtonRecipe.states.pressedOpacity
              : 1,
          width: sizeContract.diameter,
        },
        style,
      ]}
    >
      {loading ? (
        renderLoadingIndicator?.({ color: presentation.content, size: "small" }) ?? (
          <ActivityIndicator color={presentation.content} size="small" />
        )
      ) : (
        <View
          accessible={false}
          style={{
            alignItems: "center",
            height: glyphSize,
            justifyContent: "center",
            width: glyphSize,
          }}
        >
          {resolvedIcon}
        </View>
      )}
    </Pressable>
  );
});

export type LinkProps = Omit<
  PressableProps,
  "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"
> &
  Readonly<{
    descriptor: LinkDescriptor;
    /** Product router boundary for both internal and external destinations. */
    onNavigate: (destination: LinkDestination) => void | Promise<void>;
    leading?: ReactNode;
    trailing?: ReactNode;
    accessibilityHint?: string;
    style?: StyleProp<ViewStyle>;
  }>;

export function Link({
  descriptor,
  onNavigate,
  leading,
  trailing,
  accessibilityHint,
  style,
  ...props
}: LinkProps) {
  const { colors, environment } = useHjmNativeTheme();
  const resolved = resolveLinkDescriptor(descriptor);
  return (
    <Pressable
      {...props}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={resolved.resolvedAccessibilityLabel}
      accessibilityRole="link"
      onPress={() => void onNavigate(resolved.destination)}
      style={({ pressed }) => [
        minimumTargetStyle,
        {
          alignItems: "center",
          alignSelf: "flex-start",
          direction: environment.direction,
          flexDirection: "row",
          gap: spacing.xs,
          opacity: pressed ? 0.72 : 1,
        },
        style,
      ]}
    >
      {leading ? <View accessible={false}>{leading}</View> : null}
      <Text
        style={{ color: colors.contentBrand, textDecorationLine: "underline" }}
        variant="bodyLarge"
      >
        {resolved.label}
      </Text>
      {trailing ? <View accessible={false}>{trailing}</View> : null}
    </Pressable>
  );
}

export type BottomCTAAction = Readonly<{
  label: string;
  onPress: NonNullable<PressableProps["onPress"]>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  size?: ButtonSize;
  tone?: ButtonTone;
}>;

export type BottomCTAProps = Readonly<{
  primaryAction: BottomCTAAction;
  /** A second HJM action descriptor or an arbitrary product-owned action node. */
  secondaryAction?: BottomCTAAction | ReactNode;
  description?: string;
  accessibilityLabel?: string;
  safeAreaBottom?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

function BottomCTAButton({
  action,
  fallbackTone,
}: Readonly<{ action: BottomCTAAction; fallbackTone: ButtonTone }>) {
  return (
    <Button
      {...(action.accessibilityLabel === undefined ? {} : { accessibilityLabel: action.accessibilityLabel })}
      {...(action.accessibilityHint === undefined ? {} : { accessibilityHint: action.accessibilityHint })}
      {...(action.disabled === undefined ? {} : { disabled: action.disabled })}
      {...(action.loading === undefined ? {} : { loading: action.loading })}
      {...(action.loadingLabel === undefined ? {} : { loadingLabel: action.loadingLabel })}
      fullWidth
      onPress={action.onPress}
      {...(action.size === undefined ? {} : { size: action.size })}
      tone={action.tone ?? fallbackTone}
    >
      {action.label}
    </Button>
  );
}

function isBottomCTAAction(value: BottomCTAAction | ReactNode): value is BottomCTAAction {
  return typeof value === "object"
    && value !== null
    && "label" in value
    && typeof value.label === "string"
    && "onPress" in value
    && typeof value.onPress === "function";
}

/** Native sticky-action content; products own its screen-edge positioning. */
export function BottomCTA({
  primaryAction,
  secondaryAction,
  description,
  accessibilityLabel,
  safeAreaBottom = 0,
  style,
  testID,
}: BottomCTAProps) {
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
    throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
  }
  const { colors, environment } = useHjmNativeTheme();
  const stackActions = environment.textScale >= 1.6;
  const renderedSecondary = secondaryAction === undefined || secondaryAction === null
    ? null
    : isBottomCTAAction(secondaryAction)
      ? <BottomCTAButton action={secondaryAction} fallbackTone="secondary" />
      : secondaryAction;
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="toolbar"
      testID={testID}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderTopWidth: bottomCtaRecipe.borderWidth,
          elevation: bottomCtaRecipe.shadow.elevation,
          gap: bottomCtaRecipe.gap,
          minHeight: bottomCtaRecipe.minHeight + safeAreaBottom,
          paddingBottom: Math.max(safeAreaBottom, bottomCtaRecipe.paddingBottom),
          paddingHorizontal: bottomCtaRecipe.paddingHorizontal,
          paddingTop: bottomCtaRecipe.paddingTop,
          shadowColor: bottomCtaRecipe.shadow.color,
          shadowOffset: { width: 0, height: bottomCtaRecipe.shadow.offsetY },
          shadowOpacity: bottomCtaRecipe.shadow.opacity,
          shadowRadius: bottomCtaRecipe.shadow.radius,
        },
        style,
      ]}
    >
      {description ? <Text tone="muted" variant="caption">{description}</Text> : null}
      <View
        style={{
          direction: environment.direction,
          flexDirection: stackActions ? "column-reverse" : "row",
          gap: bottomCtaRecipe.gap,
        }}
      >
        {renderedSecondary !== null ? (
          <View style={{ flex: stackActions ? undefined : 1 }}>
            {renderedSecondary}
          </View>
        ) : null}
        <View style={{ flex: stackActions ? undefined : 1 }}>
          <BottomCTAButton action={primaryAction} fallbackTone="primary" />
        </View>
      </View>
    </View>
  );
}
