import type { ComponentRef } from "react";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import {
  resolveLinkDescriptor,
  type LinkDescriptor,
  type LinkDestination,
} from "@hjmds/design-contracts/components/link";
import type { SemanticIconName } from "@hjmds/design-contracts/components/icon";
import { glyph, spacing, type ElevationStep } from "@hjmds/design-contracts/foundations";
import {
  bottomCtaRecipe,
  actionGroupRecipe,
  linkRecipe,
  iconButtonRecipe,
  resolveIconButtonPresentation,
  validateIconButtonElevation,
  type IconButtonEdge,
  type IconButtonTone as ContractIconButtonTone,
  type IconButtonShape,
  type IconButtonSize,
} from "@hjmds/design-contracts/recipes";
import {
  type ButtonAlign as ContractButtonAlign,
  type ButtonAppearance as ContractButtonAppearance,
  type ButtonEdge as ContractButtonEdge,
  type ButtonShape as ContractButtonShape,
  type ButtonSize as ContractButtonSize,
  type ButtonTone as ContractButtonTone,
} from "@hjmds/design-contracts/recipes/base";
import { forwardRef, useContext, type ReactElement, type ReactNode, type Ref } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type View as NativeView,
  type PressableProps,
} from "react-native";
import { RecipeButton } from "./internal/recipe-button.js";
import { iconButtonEdgeMargins } from "./internal/icon-button-edge.js";
import { ScreenFooterContext } from "./internal/screen-footer.js";

import type { HjmCompositionStyleProp } from "./composition-style.js";
import { assertNoRemovedStyleProps, warnOnce } from "./internal/diagnostics.js";
import { minimumTargetStyle, resolveNativeElevationStyle, resolveNativeShadowElevation } from "./internal/styles.js";
import { Icon, Text, type NativeIconRenderProps } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ButtonTone = ContractButtonTone;
export type ButtonSize = ContractButtonSize;
export type ButtonShape = ContractButtonShape;
export type ButtonAppearance = ContractButtonAppearance;
export type ButtonAlign = ContractButtonAlign;
export type ButtonEdge = ContractButtonEdge;
export type {
IconButtonEdge,
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
    appearance?: ButtonAppearance;
    /** Label placement inside the frame; `leading` suits a full-width row action. */
    align?: ButtonAlign;
    /** Toggle state. Preserves tone background; reports selection to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Explicit confirmed mutation result. Both text labels reserve the same slot in every state. */
    completion?: Readonly<{ confirmed: boolean; label: string }>;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    /** Allow the control to grow beyond its recipe height for large or custom content. */
    growWithContent?: boolean;
    loadingLabel?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    /**
     * Container edge(s) this button sits on (start/end follow the reading direction). A ghost button overhangs that
     * edge by its inline padding so the label or trailing glyph lines up with the inset (`resolveButtonEdgeOverhang`).
     */
    edge?: ButtonEdge;
    fullWidth?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    /** Canonical layout-only placement. Controlled visual and state keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
  }>;

// Public callers compose placement through layoutStyle; visual overrides stay inside HJM recipes.
export const Button: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, ButtonProps>> = forwardRef<ComponentRef<typeof NativeView>, ButtonProps>(function Button(props, ref) {
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
    /** Toggle state. Preserves tone background; reports selection to assistive tech. */
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /**
     * Container edge(s) this button sits on (start/end follow the reading direction). A ghost button keeps its touch
     * target but overhangs the edge by (diameter − glyph slot) / 2 so the glyph slot lines up with the container inset
     * (`resolveIconButtonEdgeOverhang`, 2026-10-17 measured audit). Framed tones align their frame and do not move.
     */
    edge?: IconButtonEdge;
    /**
     * Shadow token step for a floating control (iconButtonRecipe.elevation, default `none`). Filled tones only; an
     * elevated ghost button throws (Android draws no elevation without a fill).
     */
    elevation?: ElevationStep;
    /** Keep the busy control discoverable by default; opt in only for legacy disabled semantics. */
    disableWhileLoading?: boolean;
    hitSlop?: PressableProps["hitSlop"];
    accessibilityState?: PressableProps["accessibilityState"];
    renderLoadingIndicator?: (props: Readonly<{ color: string; size: "small" }>) => ReactNode;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const IconButton: ReturnType<typeof forwardRef<ComponentRef<typeof NativeView>, IconButtonProps>> = forwardRef<ComponentRef<typeof NativeView>, IconButtonProps>(function IconButton({
  label,
  children,
  tone = iconButtonRecipe.defaults.tone,
  size = iconButtonRecipe.defaults.size,
  shape = iconButtonRecipe.defaults.shape,
  selected,
  disabled = false,
  loading = false,
  edge,
  elevation = iconButtonRecipe.elevation.default,
  disableWhileLoading = false,
  hitSlop,
  layoutStyle,
  renderLoadingIndicator,
  onPress,
  onLongPress,
  accessibilityState,
  ...props
}: IconButtonProps, ref) {
  const theme = useHjmNativeTheme();
  assertNoRemovedStyleProps("IconButton", props, ["style"]);
  const resolvedLabel = label;
  const resolvedIcon = children;
  if (resolvedLabel === undefined || resolvedLabel.trim().length === 0) {
    throw new TypeError("IconButton label must not be empty");
  }
  if (resolvedIcon === undefined || resolvedIcon === null || resolvedIcon === false) {
    throw new TypeError("IconButton requires children");
  }
  validateIconButtonElevation(elevation, tone);
  const frame = iconButtonFrame(theme, { tone, size, shape, edge, selected: selected === true });
  const lift = resolveNativeElevationStyle(elevation, theme.tokens.shadow, theme.designProfile !== undefined);
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
      hitSlop={hitSlop ?? frame.hitSlop}
      onPress={loading ? () => undefined : onPress}
      onLongPress={loading ? () => undefined : onLongPress}
      style={({ pressed }) => [frame.style(disabled ? "disabled" : loading ? "idle" : pressed ? "pressed" : "idle"), lift, layoutStyle]}
    >
      {loading ? (
        renderLoadingIndicator?.({ color: frame.content, size: "small" }) ?? (
          <ActivityIndicator color={frame.content} size="small" />
        )
      ) : (
        <IconButtonGlyph size={frame.glyphSize}>{resolvedIcon}</IconButtonGlyph>
      )}
    </Pressable>
  );
});

type IconButtonFrameInput = Readonly<{
  tone: IconButtonTone;
  size: IconButtonSize;
  shape: IconButtonShape;
  edge: IconButtonEdge | undefined;
  selected: boolean;
}>;

/** One frame for IconButton and IconButtonLink: size, tone/selected paint, radius, edge overhang and press opacity. */
function iconButtonFrame(theme: ReturnType<typeof useHjmNativeTheme>, { tone, size, shape, edge, selected }: IconButtonFrameInput) {
  const presentation = resolveIconButtonPresentation(tone, theme.palette, selected);
  const sizeContract = iconButtonRecipe.sizes[size];
  // Web reads the same size through `--hjm-control-button-*`, which the axis
  // already raises. Native read `diameter` straight from the recipe, so a
  // product that turned `minimumVisualTarget` on got 44pt buttons but 36pt
  // icon buttons — the two renderers disagreed.
  const visibleDiameter = visibleControlHeight(
    sizeContract.diameter,
    theme.environment.minimumVisualTarget,
  );
  // Edge alignment from the same contract helper Web reads, on the visible diameter actually drawn.
  const edgeMargins = iconButtonEdgeMargins(edge, tone, size, theme.environment.minimumVisualTarget);
  return {
    content: presentation.content,
    glyphSize: glyph[sizeContract.glyph],
    hitSlop: sizeContract.hitSlop > 0 ? sizeContract.hitSlop : undefined,
    style: (state: "idle" | "pressed" | "disabled") => ({
      alignItems: "center" as const,
      backgroundColor: presentation.background ?? "transparent",
      borderColor: presentation.border ?? "transparent",
      borderRadius: theme.tokens.radius[iconButtonRecipe.shapes[shape]],
      borderWidth: 1,
      height: visibleDiameter,
      justifyContent: "center" as const,
      minHeight: visibleDiameter,
      minWidth: visibleDiameter,
      opacity: state === "disabled"
        ? iconButtonRecipe.states.disabledOpacity
        : state === "pressed"
          ? iconButtonRecipe.states.pressedOpacity
          : 1,
      width: visibleDiameter,
      ...edgeMargins,
    }),
  };
}

function IconButtonGlyph({ size, children }: Readonly<{ size: number; children: ReactNode }>) {
  return (
    <View
      accessible={false}
      style={{
        alignItems: "center",
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      {children}
    </View>
  );
}

type IconButtonLinkHostProps = Omit<
  PressableProps,
  | "accessible"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "children"
  | "disabled"
  | "hitSlop"
  | "onPress"
  | "role"
  | "style"
>;

/** Pressable props HJM prepared for a router adapter (for example Expo Router `<Link asChild>`). */
export type IconButtonLinkRenderProps = IconButtonLinkHostProps & Readonly<{
  accessible: true;
  accessibilityLabel: string;
  accessibilityRole: "link";
  accessibilityState: NonNullable<PressableProps["accessibilityState"]>;
  children: ReactNode;
  disabled: boolean;
  hitSlop: PressableProps["hitSlop"];
  onPress: NonNullable<PressableProps["onPress"]>;
  role: "link";
  style: NonNullable<PressableProps["style"]>;
  destination: LinkDestination;
}>;

/**
 * Native navigation with IconButton paint, matching Web IconButtonLink. Routing follows the TopBarAction link
 * precedent: the product either handles `onNavigate` or composes its router link through `renderLink`.
 */
export type IconButtonLinkProps = IconButtonLinkHostProps &
  IconButtonNameProps &
  IconButtonContentProps &
  Readonly<{
    destination: LinkDestination;
    /** Optional when `renderLink` lets the router own activation. */
    onNavigate?: (destination: LinkDestination) => void | Promise<void>;
    renderLink?: (props: IconButtonLinkRenderProps) => ReactElement;
    /** The link points at the current screen: unchanged tone background and `accessibilityState.selected`. */
    current?: boolean;
    disabled?: boolean;
    tone?: IconButtonTone;
    size?: IconButtonSize;
    shape?: IconButtonShape;
    edge?: IconButtonEdge;
    hitSlop?: PressableProps["hitSlop"];
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export function IconButtonLink({
  label,
  children,
  destination,
  onNavigate,
  renderLink,
  current = false,
  disabled = false,
  tone = iconButtonRecipe.defaults.tone,
  size = iconButtonRecipe.defaults.size,
  shape = iconButtonRecipe.defaults.shape,
  edge,
  hitSlop,
  layoutStyle,
  ...props
}: IconButtonLinkProps) {
  const theme = useHjmNativeTheme();
  assertNoRemovedStyleProps("IconButtonLink", props, ["style"]);
  if (!label.trim()) throw new TypeError("IconButtonLink label must not be empty");
  if (children === undefined || children === null || children === false) {
    throw new TypeError("IconButtonLink requires children");
  }
  if (!renderLink && !onNavigate) throw new TypeError("IconButtonLink requires renderLink or onNavigate");
  const frame = iconButtonFrame(theme, { tone, size, shape, edge, selected: current });
  const controlProps: IconButtonLinkRenderProps = {
    ...props,
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: "link",
    accessibilityState: { selected: current, disabled },
    children: <IconButtonGlyph size={frame.glyphSize}>{children}</IconButtonGlyph>,
    destination,
    disabled,
    hitSlop: hitSlop ?? frame.hitSlop,
    onPress: () => {
      if (!disabled) void onNavigate?.(destination);
    },
    role: "link",
    style: ({ pressed }) => [frame.style(disabled ? "disabled" : pressed ? "pressed" : "idle"), layoutStyle],
  };
  if (renderLink) return renderLink(controlProps);
  const { destination: _destination, ...pressableProps } = controlProps;
  return <Pressable {...pressableProps} />;
}

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
    /**
     * Product glyph boundary for `descriptor.leadingIcon` / `trailingIcon`. HJM resolves size
     * (`linkRecipe.icon.glyph`), the link tone, decorative semantics and RTL mirroring through `Icon`,
     * so the caller only maps a semantic name to a glyph (for example `createLucideGlyph`).
     */
    renderIcon?: (props: NativeIconRenderProps<SemanticIconName>) => ReactNode;
    accessibilityHint?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
export function Link({
  descriptor,
  onNavigate,
  leading,
  trailing,
  renderIcon,
  accessibilityHint,
  layoutStyle,
  ...props
}: LinkProps) {
  const { colors, environment } = useHjmNativeTheme();
  const resolved = resolveLinkDescriptor(descriptor);
  assertNoRemovedStyleProps("Link", props, ["style"]);
  // Until 1.12 the resolver validated leadingIcon/trailingIcon but Native never drew them, so a
  // descriptor shared with Web silently lost its chevron. A missing renderIcon now warns instead of
  // throwing: throwing would crash apps that already passed icons which were simply invisible.
  const renderDescriptorIcon = (
    icon: typeof resolved.leadingIcon,
    slot: "leadingIcon" | "trailingIcon",
    fallback: ReactNode,
  ): ReactNode => {
    if (icon === null) return fallback;
    if (fallback !== undefined && fallback !== null && fallback !== false) {
      warnOnce(
        `Link.${slot}.conflict`,
        `Link received both descriptor.${slot} and a ${slot === "leadingIcon" ? "leading" : "trailing"} node; the descriptor icon wins.`,
      );
    }
    if (renderIcon === undefined) {
      warnOnce(
        `Link.${slot}.renderIcon`,
        `Link descriptor.${slot} needs renderIcon to draw a glyph; the icon is not rendered.`,
      );
      return null;
    }
    return (
      <Icon
        descriptor={{ name: icon.name, size: linkRecipe.icon.glyph, tone: "brand", decorative: true }}
        renderGlyph={renderIcon}
      />
    );
  };
  const leadingNode = renderDescriptorIcon(resolved.leadingIcon, "leadingIcon", leading);
  const trailingNode = renderDescriptorIcon(resolved.trailingIcon, "trailingIcon", trailing);
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
        layoutStyle,
      ]}
    >
      {leadingNode ? <View accessible={false}>{leadingNode}</View> : null}
      <Text
              fontRole="ui"
        // Shrink beside a leading/trailing glyph so a long label wraps inside the parent (link.md: long labels wrap);
        // at its natural width the label plus the glyph overran it (2026-10-23 flex audit).
        style={{ color: colors.contentBrand, flexShrink: 1, textDecorationLine: "underline" }}
        variant="bodyLarge"
      >
        {resolved.label}
      </Text>
      {trailingNode ? <View accessible={false}>{trailingNode}</View> : null}
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
  /** Decorative Button adornments; label remains the action name. */
  leading?: ReactNode;
  trailing?: ReactNode;
  /**
   * Ref to this action's button. Native overlays return focus only to an explicit target
   * (`ImmersiveOverlay`/`Dialog` `returnFocusRef`), so the action that opens one must expose its button
   * (2026-10-18 Utilverse display board: focus did not come back after closing the board).
   */
  buttonRef?: Ref<ComponentRef<typeof NativeView>>;
}>;

export type BottomCTAProps = Readonly<{
  primaryAction: BottomCTAAction;
  /** A second HJM action descriptor or an arbitrary product-owned action node. */
  secondaryAction?: BottomCTAAction | ReactNode;
  description?: string;
  accessibilityLabel?: string;
  safeAreaBottom?: number;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  testID?: string;
}>;

function BottomCTAButton({
  action,
  fallbackTone,
}: Readonly<{ action: BottomCTAAction; fallbackTone: ButtonTone }>) {
  return (
    <Button
      ref={action.buttonRef}
      {...(action.accessibilityLabel === undefined ? {} : { accessibilityLabel: action.accessibilityLabel })}
      {...(action.accessibilityHint === undefined ? {} : { accessibilityHint: action.accessibilityHint })}
      {...(action.disabled === undefined ? {} : { disabled: action.disabled })}
      {...(action.loading === undefined ? {} : { loading: action.loading })}
      {...(action.loadingLabel === undefined ? {} : { loadingLabel: action.loadingLabel })}
      leading={action.leading}
      trailing={action.trailing}
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
  layoutStyle,
  testID,
  ...removedProps
}: BottomCTAProps) {
  assertNoRemovedStyleProps("BottomCTA", removedProps, ["style"]);
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) {
    throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
  }
  const { colors, environment, designProfile } = useHjmNativeTheme();
  const screenFooter = useContext(ScreenFooterContext);
  // Footer elevation separates the content above it (bottomCtaRecipe rationale).
  // Reuse profile strength but retain the upward direction; a flat profile must
  // also disable Android elevation rather than only its iOS shadow properties.
  const surfaceShadow = designProfile
    ? { ...designProfile.tokens.shadow.floating, offsetY: -Math.abs(designProfile.tokens.shadow.floating.offsetY) }
    : bottomCtaRecipe.shadow;
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
        // Inside ScreenLayout's footer the footer owns border, padding, surface and the bottom inset; an explicit
        // safeAreaBottom adds only what the footer padding does not already cover, so the gap is max(footer, inset)
        // rather than their sum (2026-10-17 user report: too much space below buttons; Web data-placement="screen-footer").
        screenFooter ? { gap: bottomCtaRecipe.gap, paddingBottom: Math.max(0, safeAreaBottom - screenFooter.bottomPadding) } : {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderTopWidth: bottomCtaRecipe.borderWidth,
          ...resolveNativeShadowElevation(surfaceShadow, designProfile !== undefined, bottomCtaRecipe.shadow.elevation),
          gap: bottomCtaRecipe.gap,
          minHeight: bottomCtaRecipe.minHeight + safeAreaBottom,
          paddingBottom: Math.max(safeAreaBottom, bottomCtaRecipe.paddingBottom),
          paddingHorizontal: bottomCtaRecipe.paddingHorizontal,
          paddingTop: bottomCtaRecipe.paddingTop,
          shadowColor: surfaceShadow.color,
          shadowOffset: { width: 0, height: surfaceShadow.offsetY },
          shadowOpacity: surfaceShadow.opacity,
          shadowRadius: surfaceShadow.radius,
        },
        layoutStyle,
      ]}
    >
      {/* bottomCtaRecipe.contentMaxWidth: copy and actions stop at the reading width on tablets, as on Web. */}
      {description ? <View style={{ alignSelf: "center", maxWidth: bottomCtaRecipe.contentMaxWidth, width: "100%" }}><Text tone="muted" variant="caption">{description}</Text></View> : null}
      <View
        style={{
          alignSelf: "center",
          direction: environment.direction,
          flexDirection: stackActions ? "column-reverse" : "row",
          gap: actionGroupRecipe.inlineGap,
          maxWidth: bottomCtaRecipe.contentMaxWidth,
          width: "100%",
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
