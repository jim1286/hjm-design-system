import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import {
  resolveLinkDescriptor,
  type LinkDescriptor,
  type LinkDestination,
} from "@hjmds/design-contracts/components/link";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import {
  bottomCtaRecipe,
  iconButtonRecipe,
  resolveIconButtonPresentation,
  type IconButtonTone as ContractIconButtonTone,
  type IconButtonShape,
  type IconButtonSize,
} from "@hjmds/design-contracts/recipes";
import {
  type ButtonAlign as ContractButtonAlign,
  type ButtonShape as ContractButtonShape,
  type ButtonSize as ContractButtonSize,
  type ButtonTone as ContractButtonTone,
} from "@hjmds/design-contracts/recipes/base";
import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type View as NativeView,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { RecipeButton } from "./internal/recipe-button.js";

import type { HjmCompositionStyleProp } from "./composition-style.js";
import { minimumTargetStyle } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type ButtonShape = ContractButtonShape;
export type ButtonAlign = ContractButtonAlign;
export type {
IconButtonShape,
IconButtonSize
} from "@hjmds/design-contracts/recipes";

export type ButtonProps = Omit<
  PressableProps,
  "accessibilityRole" | "accessibilityState" | "children" | "disabled" | "hitSlop" | "style"
> &
  Readonly<{
    children?: ReactNode;
    tone?: ButtonTone;
    size?: ButtonSize;
    /** Frame geometry. `pill` replaces product code that overrode `borderRadius`. */
    shape?: ButtonShape;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
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
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
  }>;

// Public callers compose placement through layoutStyle; visual overrides stay inside HJM recipes.
export const Button = forwardRef<NativeView, ButtonProps>(function Button(props, ref) {
  // Untyped JS callers must not reach the private recipe override through a spread.
  if ("style" in props || "labelStyle" in props) {
    throw new TypeError("Button style/labelStyle were removed; use layoutStyle and semantic props");
  }
  return <RecipeButton {...props} ref={ref} />;
});

export type IconButtonTone = ContractIconButtonTone;
type IconButtonNameProps = Readonly<{ label: string }>;
type IconButtonContentProps = Readonly<{ children: ReactNode }>;

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
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    /** Toggle state. Paints the selected treatment and reports it to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    style?: StyleProp<ViewStyle>;
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const IconButton = forwardRef<NativeView, IconButtonProps>(function IconButton({
  label,
  children,
  tone = iconButtonRecipe.defaults.tone,
  size = iconButtonRecipe.defaults.size,
  shape = iconButtonRecipe.defaults.shape,
  selected,
  disabled = false,
  loading = false,
  disableWhileLoading = false,
  hitSlop,
  layoutStyle,
  style,
  renderLoadingIndicator,
  onPress,
  onLongPress,
  accessibilityState,
  ...props
}: IconButtonProps, ref) {
  const theme = useHjmNativeTheme();
  const resolvedLabel = label;
  const resolvedIcon = children;
  if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
    throw new TypeError("IconButton label must not be empty");
  }
  if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
    throw new TypeError("IconButton requires children");
  }
  const resolvedTone: IconButtonTone = tone;
  const presentation = resolveIconButtonPresentation(resolvedTone, theme.palette, selected === true);
  const sizeContract = iconButtonRecipe.sizes[size];
  // Web reads the same size through `--hjm-control-button-*`, which the axis
  // already raises. Native read `diameter` straight from the recipe, so a
  // product that turned `minimumVisualTarget` on got 44pt buttons but 36pt
  // icon buttons — the two renderers disagreed.
  const visibleDiameter = visibleControlHeight(
    sizeContract.diameter,
    theme.environment.minimumVisualTarget,
  );
  const glyphSize = glyph[sizeContract.glyph];
  const unavailable = disabled || (loading && disableWhileLoading);
  return (
    <Pressable
      {...props}
      ref={ref}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        ...(selected === undefined ? {} : { selected }),
        disabled: unavailable,
        busy: loading,
      }}
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
          height: visibleDiameter,
          justifyContent: "center",
          minHeight: visibleDiameter,
          minWidth: visibleDiameter,
          opacity: disabled
            ? iconButtonRecipe.states.disabledOpacity
            : loading
              ? 1
            : pressed
              ? iconButtonRecipe.states.pressedOpacity
              : 1,
          width: visibleDiameter,
        },
        style,
        layoutStyle,
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
          backgroundColor: colors.bg,
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
