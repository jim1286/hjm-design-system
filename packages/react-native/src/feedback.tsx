import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { easing, glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import {
  resolveControlAccessibleName,
} from "@hjmds/design-contracts/behaviors";
import {
  emptyStateRecipe,
  noticeRecipe,
  progressRecipe,
  skeletonRecipe,
  toastRecipe,
  type NoticeTone as ContractNoticeTone,
  type ProgressShape,
  type ProgressSize,
  type ProgressTone,
  type ToastPlacement,
  type ToastTone,
  type ToastToneMark,
} from "@hjmds/design-contracts/recipes";
import {
  resolveResultDescriptor,
  resultRecipe,
  type ResultDescriptor,
  type ResultStatus,
} from "@hjmds/design-contracts/components/result";
import {
  liquidToastRecipe,
  createToastSession,
  createToastStore,
  resolveToastDescriptor,
  toastBehaviorDefaults,
  type ToastDescriptor,
  type ToastDismissReason,
  type ToastDuplicatePolicy,
  type ToastOverflowPolicy,
  type ToastPauseReason,
  type ToastPublishResult,
  type ToastSessionSnapshot,
  type ToastStore,
  type ToastStoreSnapshot,
  type ToastTimerUpdatePolicy,
} from "@hjmds/design-contracts/components/toast";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Text as NativeText,
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
  type ViewProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import type { ToastPresentationAdapter } from "./internal/toast-presentation.js";
export type { ToastPresentationAdapter } from "./internal/toast-presentation.js";

import { Button, IconButton } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type AnnouncementMode = "none" | "polite" | "assertive";
export type NoticeTone = ContractNoticeTone;

export type NoticeIconRenderProps = Readonly<{
  tone: NoticeTone;
  color: string;
  size: number;
}>;

export type NoticeProps = Omit<ViewProps, "children" | "style"> & Readonly<{
  title: string;
  description?: string;
  tone?: NoticeTone;
  announcement?: AnnouncementMode;
  icon?: ReactNode;
  renderIcon?: (props: NoticeIconRenderProps) => ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function Notice({
  title,
  description,
  tone = noticeRecipe.defaults.tone,
  announcement = "none",
  icon,
  renderIcon,
  action,
  style,
  ...props
}: NoticeProps) {
  const theme = useHjmNativeTheme();
  const toneContract = noticeRecipe.tones[tone];
  const foreground = resolveColorReference(toneContract.foreground, theme.palette);
  const announcementText = [title, description].filter(Boolean).join(". ");

  useEffect(() => {
    if (Platform.OS !== "ios" || announcement === "none") return;
    AccessibilityInfo.announceForAccessibilityWithOptions(announcementText, {
      queue: announcement === "polite",
    });
  }, [announcement, announcementText]);

  const resolvedIcon = icon ?? renderIcon?.({
    tone,
    color: foreground,
    size: glyph[noticeRecipe.iconSize],
  });
  return (
    <View
      {...props}
      accessibilityLiveRegion={announcement}
      accessibilityRole={announcement === "assertive" ? "alert" : undefined}
      style={[
        {
          backgroundColor: resolveColorReference(toneContract.background, theme.palette),
          borderColor: resolveColorReference(toneContract.border, theme.palette),
          borderRadius: radius[noticeRecipe.radius],
          borderWidth: noticeRecipe.borderWidth,
          gap: noticeRecipe.gap,
          padding: noticeRecipe.padding,
        },
        style,
      ]}
    >
      <View
        style={{
          alignItems: "flex-start",
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: noticeRecipe.gap,
        }}
      >
        {resolvedIcon === undefined ? null : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              alignItems: "center",
              height: glyph[noticeRecipe.iconSize],
              justifyContent: "center",
              width: glyph[noticeRecipe.iconSize],
            }}
          >
            {resolvedIcon}
          </View>
        )}
        <View style={{ flex: 1, gap: noticeRecipe.contentGap, minWidth: 0 }}>
          <Text
            style={{ color: foreground, fontWeight: noticeRecipe.title.fontWeight }}
            variant={noticeRecipe.title.textVariant}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={{ color: resolveColorReference(noticeRecipe.description.color, theme.palette) }}
              variant={noticeRecipe.description.textVariant}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      {action}
    </View>
  );
}

export type EmptyStateAlign = "center" | "upper";

export type EmptyStateProps = Omit<ViewProps, "children" | "style"> & Readonly<{
  title?: string;
  description?: string;
  illustration?: ReactNode;
  action?: ReactNode;
  density?: keyof typeof emptyStateRecipe.density;
  align?: EmptyStateAlign;
  announcement?: AnnouncementMode;
  accessibilityLabel?: string;
  titleRole?: "header";
  style?: StyleProp<ViewStyle>;
  illustrationStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<ViewStyle>;
}>;

export function EmptyState({
  title,
  description,
  illustration,
  action,
  density = emptyStateRecipe.defaults.density,
  align = "center",
  announcement = "none",
  accessibilityLabel,
  titleRole = "header",
  style,
  illustrationStyle,
  titleStyle,
  descriptionStyle,
  actionStyle,
  ...props
}: EmptyStateProps) {
  const theme = useHjmNativeTheme();
  const contentLabel = [title, description].filter(Boolean).join(", ");
  const announcementText = accessibilityLabel ?? [title, description].filter(Boolean).join(". ");
  if (!announcementText) {
    throw new TypeError("EmptyState requires title, description, or accessibilityLabel");
  }
  useEffect(() => {
    if (Platform.OS !== "ios" || announcement === "none") return;
    AccessibilityInfo.announceForAccessibilityWithOptions(announcementText, {
      queue: announcement === "polite",
    });
  }, [announcement, announcementText]);
  const usesUpperSpacers = align === "upper" && density !== "compact";
  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? contentLabel}
      accessible={false}
      style={[
        {
          alignItems: "center",
          flexGrow: density === "compact" ? 0 : 1,
          gap: emptyStateRecipe.gap,
          justifyContent: align === "center" ? "center" : "flex-start",
          paddingHorizontal: emptyStateRecipe.paddingHorizontal,
          paddingVertical: emptyStateRecipe.density[density].paddingVertical,
        },
        style,
      ]}
    >
      {announcement === "none" || Platform.OS === "ios" ? null : (
        <Text
          accessibilityLabel={announcementText}
          accessibilityLiveRegion={announcement}
          accessibilityRole={announcement === "assertive" ? "alert" : undefined}
          accessible
          style={{ height: 1, opacity: 0, position: "absolute", width: 1 }}
        >
          {announcementText}
        </Text>
      )}
      {usesUpperSpacers ? <View accessible={false} style={{ flexGrow: 1 }} /> : null}
      {illustration ? (
        <View
          accessibilityElementsHidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            {
              alignItems: "center",
              height: glyph[emptyStateRecipe.icon.size],
              justifyContent: "center",
              width: glyph[emptyStateRecipe.icon.size],
            },
            illustrationStyle,
          ]}
        >
          {illustration}
        </View>
      ) : null}
      {title === undefined ? null : <Text
        align="center"
        accessibilityRole={titleRole}
        style={[
          {
            color: resolveColorReference(emptyStateRecipe.title.color, theme.palette),
            fontWeight: emptyStateRecipe.title.fontWeight,
          },
          titleStyle,
        ]}
        variant={emptyStateRecipe.title.textVariant}
      >
        {title}
      </Text>}
      {description ? (
        <Text
          align="center"
          style={[
            {
              color: resolveColorReference(
                emptyStateRecipe.description.color,
                theme.palette,
              ),
            },
            descriptionStyle,
          ]}
          variant={emptyStateRecipe.description.textVariant}
        >
          {description}
        </Text>
      ) : null}
      {action ? <View style={actionStyle}>{action}</View> : null}
      {usesUpperSpacers ? <View accessible={false} style={{ flexGrow: 3 }} /> : null}
    </View>
  );
}

export type ResultIconRenderProps = Readonly<{
  status: ResultStatus;
  color: string;
  backgroundColor: string;
}>;

export type ResultProps = Omit<ViewProps, "children"> &
  ResultDescriptor &
  Readonly<{
    renderIcon?: (props: ResultIconRenderProps) => ReactNode;
  }>;

/** Terminal flow outcome with platform announcement and canonical actions. */
export function Result({
  status,
  title,
  description,
  actions,
  renderIcon,
  style,
  ...props
}: ResultProps) {
  const theme = useHjmNativeTheme();
  const result = resolveResultDescriptor({
    status,
    title,
    ...(description === undefined ? {} : { description }),
    ...(actions === undefined ? {} : { actions }),
  });
  const tone = resultRecipe.tones[result.status];
  const iconColor = resolveColorReference(tone.icon, theme.palette);
  const iconBackgroundColor = resolveColorReference(
    tone.iconBackground,
    theme.palette,
  );
  const failureAnnouncement = [result.title, result.description]
    .filter(Boolean)
    .join(". ");

  useEffect(() => {
    if (
      result.status !== "failure" ||
      failureAnnouncement.length === 0 ||
      Platform.OS !== "ios"
    ) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      AccessibilityInfo.announceForAccessibilityWithOptions(
        failureAnnouncement,
        { queue: false },
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [failureAnnouncement, result.status]);

  return (
    <View
      {...props}
      style={[
        {
          alignItems: "center",
          gap: resultRecipe.gap,
          paddingHorizontal: resultRecipe.paddingHorizontal,
          paddingVertical: resultRecipe.paddingVertical,
        },
        style,
      ]}
    >
      <View
        accessible={false}
        style={{
          alignItems: "center",
          backgroundColor: iconBackgroundColor,
          borderRadius: radius.full,
          height: 56,
          justifyContent: "center",
          width: 56,
        }}
      >
        {renderIcon?.({
          status: result.status,
          color: iconColor,
          backgroundColor: iconBackgroundColor,
        })}
      </View>
      <Text
        accessibilityLiveRegion={
          result.status === "failure" ? "assertive" : "none"
        }
        accessibilityRole="header"
        align="center"
        emphasis="strong"
        style={{
          color: resolveColorReference(resultRecipe.title.color, theme.palette),
          maxWidth: 520,
        }}
        variant={resultRecipe.title.textVariant}
      >
        {result.title}
      </Text>
      {result.description ? (
        <Text
          align="center"
          style={{
            color: resolveColorReference(
              resultRecipe.description.color,
              theme.palette,
            ),
            maxWidth: 520,
          }}
          variant={resultRecipe.description.textVariant}
        >
          {result.description}
        </Text>
      ) : null}
      {result.primaryAction || result.secondaryAction ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: resultRecipe.actionsGap,
            justifyContent: "center",
            marginTop: spacing.xs,
          }}
        >
          {result.primaryAction ? (
            <Button
              accessibilityLabel={result.primaryAction.accessibilityLabel}
              onPress={result.primaryAction.onAction}
            >
              {result.primaryAction.label}
            </Button>
          ) : null}
          {result.secondaryAction ? (
            <Button
              accessibilityLabel={result.secondaryAction.accessibilityLabel}
              onPress={result.secondaryAction.onAction}
              tone="secondary"
            >
              {result.secondaryAction.label}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type ProgressName =
  | Readonly<{ label: string; accessibilityLabel?: string }>
  | Readonly<{ label?: never; accessibilityLabel: string }>;

export type ProgressProps = ProgressName & Readonly<{
  value?: number;
  max?: number;
  valueText?: string;
  accessibilityHint?: string;
  size?: ProgressSize;
  /**
   * `circular` draws the same value as a ring. Native has no conic gradient, so
   * the ring is four quarter-arcs clipped by rotation — still one accessibility
   * contract, because the announcing element is unchanged.
   */
  shape?: ProgressShape;
  /** Content inside the ring. Ignored when linear. */
  children?: ReactNode;
  tone?: ProgressTone;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Progress({
  value,
  max = progressRecipe.defaults.max,
  label,
  accessibilityLabel,
  valueText,
  accessibilityHint,
  size = progressRecipe.defaults.size,
  tone = progressRecipe.defaults.tone,
  shape = progressRecipe.defaults.shape,
  children,
  style,
  labelStyle,
  valueStyle,
  trackStyle,
  indicatorStyle,
  testID,
}: ProgressProps) {
  if (!Number.isFinite(max) || max <= 0) {
    throw new RangeError("Progress max must be a positive finite number");
  }
  if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > max)) {
    throw new RangeError("Progress value must be between zero and max");
  }
  const theme = useHjmNativeTheme();
  const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Progress");
  const percentage = value === undefined ? undefined : Math.round((value / max) * 100);
  const resolvedValueText = valueText ?? (percentage === undefined ? undefined : `${percentage}%`);
  return (
    <View
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibleName}
      accessibilityRole="progressbar"
      accessibilityState={value === undefined ? { busy: true } : undefined}
      accessibilityValue={{
        min: 0,
        max: 100,
        ...(percentage === undefined ? {} : { now: percentage }),
        ...(resolvedValueText === undefined ? {} : { text: resolvedValueText }),
      }}
      testID={testID}
      style={[{ gap: spacing.xs }, style]}
    >
      {label === undefined ? null : (
        <View
          accessible={false}
          style={{
            alignItems: "center",
            direction: theme.environment.direction,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={labelStyle} variant="label">{label}</Text>
          {resolvedValueText ? (
            <Text style={valueStyle} tone="muted" variant="caption">{resolvedValueText}</Text>
          ) : null}
        </View>
      )}
      {shape === "circular" ? (
        <View
          accessible={false}
          style={[
            {
              alignItems: "center",
              borderColor: resolveColorReference(progressRecipe.track, theme.palette),
              borderRadius: progressRecipe.circular.sizes[size] / 2,
              borderWidth: progressRecipe.circular.strokeWidth[size],
              height: progressRecipe.circular.sizes[size],
              justifyContent: "center",
              width: progressRecipe.circular.sizes[size],
            },
            trackStyle,
          ]}
        >
          {/*
            The filled arc is a rotated half-ring: RN has no conic gradient, and
            pulling in a drawing dependency for one shape is not worth it. The
            value itself is announced by the wrapper, so this is decoration.
          */}
          <View
            pointerEvents="none"
            style={[
              {
                borderColor: resolveColorReference(progressRecipe.tones[tone], theme.palette),
                borderRadius: progressRecipe.circular.sizes[size] / 2,
                borderTopColor: "transparent",
                borderWidth: progressRecipe.circular.strokeWidth[size],
                height: progressRecipe.circular.sizes[size],
                position: "absolute",
                transform: [{ rotate: `${((percentage ?? 25) / 100) * 360}deg` }],
                width: progressRecipe.circular.sizes[size],
              },
              indicatorStyle,
            ]}
          />
          {children}
        </View>
      ) : (
      <View
        accessible={false}
        style={[
          {
            backgroundColor: resolveColorReference(progressRecipe.track, theme.palette),
            borderRadius: radius[progressRecipe.radius],
            height: progressRecipe.sizes[size],
            overflow: "hidden",
          },
          trackStyle,
        ]}
      >
        <View
          style={[
            {
              backgroundColor: resolveColorReference(progressRecipe.tones[tone], theme.palette),
              height: "100%",
              width: `${percentage ?? 30}%`,
            },
            indicatorStyle,
          ]}
        />
      </View>
      )}
    </View>
  );
}

export type SpinnerProps = Readonly<{
  label: string;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
}>;

export function Spinner({ label, size = "small", style }: SpinnerProps) {
  const { colors } = useHjmNativeTheme();
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessible
      style={[{ alignItems: "center", justifyContent: "center" }, style]}
    >
      <ActivityIndicator color={colors.contentBrand} size={size} />
    </View>
  );
}

export type SkeletonShape = keyof typeof skeletonRecipe.shapes;

export type SkeletonProps = Readonly<{
  shape?: SkeletonShape;
  animated?: boolean;
  width?: ViewStyle["width"];
  height?: number;
  radius?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Consumes the same skeletonRecipe as the web renderer. Until 0.10.0 this drew a
 * static View at a fixed height of 16, reading neither the recipe shapes nor its
 * animation, so the two surfaces sharing one contract looked different.
 *
 * width/height/radius stay for callers already on the 0.9 train and win over
 * `shape`. Migration: .changeset/skeleton-pulse-by-default.md
 */
export function Skeleton({
  shape = skeletonRecipe.defaults.shape,
  animated = skeletonRecipe.defaults.animated,
  width,
  height,
  radius: radiusValue,
  accessibilityLabel,
  style,
}: SkeletonProps) {
  const { environment, palette } = useHjmNativeTheme();
  const shapeSpec = skeletonRecipe.shapes[shape];
  const { duration, easing: easingName, fromOpacity, toOpacity } =
    skeletonRecipe.animation;
  // The recipe declares reducedMotion: "static". Rather than running the pulse
  // at a 0ms duration, pin the progress value to the opaque end of the range.
  const shouldAnimate = animated && !environment.reducedMotion;
  const [pulse] = useState(() => new Animated.Value(shouldAnimate ? 0 : 1));

  useEffect(() => {
    if (!shouldAnimate) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return undefined;
    }
    const curve = easing[easingName];
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration,
          easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration,
          easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, easingName, pulse, shouldAnimate]);

  const resolvedWidth =
    width ?? (shape === "circle" ? shapeSpec.defaultHeight : "100%");

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityLabel ? { busy: true } : undefined}
      accessible={accessibilityLabel !== undefined}
      style={[
        {
          backgroundColor: resolveColorReference(
            skeletonRecipe.background,
            palette,
          ),
          // A white loading placeholder needs an outline after removing grey fills.
          borderColor: palette.theme.border,
          borderWidth: 1,
          borderRadius: radiusValue ?? radius[shapeSpec.radius],
          height: height ?? shapeSpec.defaultHeight,
          opacity: shouldAnimate
            ? pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [fromOpacity, toOpacity],
              })
            : toOpacity,
          width: resolvedWidth,
        },
        style,
      ]}
    />
  );
}

export type ToastProps = Readonly<{
  descriptor: ToastDescriptor;
  onDismiss?: (reason: ToastDismissReason) => void;
  placement?: ToastPlacement;
  renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export type ToastToneIconRenderProps = Readonly<{
  color: string;
  mark: ToastToneMark;
  size: number;
  tone: ToastTone;
}>;

type ToastSurfaceProps = Readonly<{
  snapshot: ToastSessionSnapshot;
  /** The optional presentation owns motion; this surface still owns accessible controls. */
  managedMotion?: boolean;
  announces?: boolean;
  suspended?: boolean;
  onDismiss: (reason: ToastDismissReason) => void;
  onAction: () => void;
  onExitComplete: () => void;
  onPause: (reason: ToastPauseReason) => void;
  onResume: (reason: ToastPauseReason) => void;
  placement: ToastPlacement;
  renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

function ToastSurface({
  snapshot,
  managedMotion = false,
  announces = true,
  suspended = false,
  onDismiss,
  onAction,
  onExitComplete,
  onPause,
  onResume,
  placement,
  renderToneIcon,
  style,
}: ToastSurfaceProps) {
  const resolved = snapshot.descriptor;
  const theme = useHjmNativeTheme();
  const [motionProgress] = useState(
    () => new Animated.Value(theme.environment.reducedMotion ? 1 : 0),
  );
  const exitCompleteRef = useRef(onExitComplete);
  exitCompleteRef.current = onExitComplete;
  const tone = toastRecipe.tones[resolved.tone];
  const accent = resolveColorReference(tone.accent, theme.palette);
  const badge = resolveColorReference(tone.badge, theme.palette);
  const background = resolveColorReference(toastRecipe.surface.background, theme.palette);
  const border = resolveColorReference(toastRecipe.surface.border, theme.palette);
  const pauseFocus = () => onPause("focus");
  const resumeFocus = () => onResume("focus");
  const blockEdge = toastRecipe.placements[placement].blockEdge;
  const entryOffset = blockEdge === "top" ? -12 : 12;

  useEffect(() => {
    if (managedMotion || snapshot.phase === "queued" || snapshot.phase === "closed") return;
    const phase = snapshot.phase === "closing" ? "exit" : "enter";
    const transition = toastRecipe.transition.native[phase];
    const target = phase === "exit" ? 0 : 1;
    const duration = theme.environment.reducedMotion || suspended ? 0 : transition.duration;
    motionProgress.stopAnimation();
    if (duration === 0) {
      motionProgress.setValue(target);
      if (phase === "exit") exitCompleteRef.current();
      return;
    }
    const curve = easing[transition.easing];
    const animation = Animated.timing(motionProgress, {
      duration,
      easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
      toValue: target,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && phase === "exit") exitCompleteRef.current();
    });
    return () => animation.stop();
  }, [managedMotion, suspended, motionProgress, snapshot.phase, theme.environment.reducedMotion]);

  useEffect(() => {
    if (!announces || suspended || Platform.OS !== "ios" || snapshot.phase !== "visible") return;
    AccessibilityInfo.announceForAccessibilityWithOptions(resolved.announcement, {
      queue: resolved.priority !== "high",
    });
  }, [resolved.announcement, resolved.id, resolved.priority, snapshot.phase, suspended, announces]);

  if (snapshot.phase === "queued" || snapshot.phase === "closed") return null;
  const translateY = managedMotion || theme.environment.reducedMotion
    ? 0
    : motionProgress.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] });
  const renderedToneIcon = renderToneIcon?.({
    color: accent,
    mark: tone.mark,
    size: glyph[toastRecipe.icon.glyph],
    tone: resolved.tone,
  });

  const closeControl = <IconButton
    label={resolved.closeLabel}
    onBlur={resumeFocus}
    onFocus={pauseFocus}
    onPress={() => onDismiss("close-action")}
  >
    <NativeText accessible={false} allowFontScaling={false} style={{ color: theme.colors.textMuted, fontSize: glyph[toastRecipe.close.glyph] }}>×</NativeText>
  </IconButton>;

  return (
    <Animated.View
      accessible={false}
      onTouchCancel={() => onResume("pointer")}
      onTouchEnd={() => onResume("pointer")}
      onTouchStart={() => onPause("pointer")}
      style={[
        {
          alignItems: "stretch",
          // Liquid owns the surface; a second RN fill/border/shadow produced a double rim on iPhone (2026-10-01).
          backgroundColor: managedMotion ? "transparent" : background,
          borderColor: border,
          borderRadius: managedMotion ? liquidToastRecipe.radius : radius[toastRecipe.surface.radius],
          borderWidth: managedMotion ? 0 : toastRecipe.surface.borderWidth,
          gap: toastRecipe.surface.gap,
          maxWidth: toastRecipe.surface.maxWidth,
          minHeight: managedMotion ? liquidToastRecipe.minHeight : toastRecipe.surface.minHeight,
          opacity: managedMotion ? 1 : motionProgress,
          overflow: "hidden",
          padding: toastRecipe.surface.padding,
          shadowColor: toastRecipe.surface.shadow.color,
          shadowOffset: { width: 0, height: toastRecipe.surface.shadow.offsetY },
          shadowOpacity: managedMotion ? 0 : toastRecipe.surface.shadow.opacity,
          shadowRadius: toastRecipe.surface.shadow.radius,
          transform: [{ translateY }],
          width: "100%",
        },
        style,
      ]}
    >
      {/* 1.10.0 retired the edge strip (toneMark width 0); the tinted icon badge carries tone. */}
      {toastRecipe.toneMark.width > 0 ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: accent,
            borderRadius: radius[toastRecipe.toneMark.radius],
            bottom: 0,
            start: 0,
            position: "absolute",
            top: 0,
            width: toastRecipe.toneMark.width,
          }}
        />
      ) : null}
      {!announces || Platform.OS === "ios" ? null : (
        <Text
          accessibilityLabel={resolved.announcement}
          accessibilityLiveRegion={resolved.priority === "high" ? "assertive" : "polite"}
          accessibilityRole={resolved.priority === "high" ? "alert" : undefined}
          accessible
          style={{ height: 1, opacity: 0, position: "absolute", width: 1 }}
        >
          {resolved.announcement}
        </Text>
      )}
      {managedMotion ? (
        // A full-width editorial banner replaces the badge/body/close three-column card.
        // Keep only a small status glyph in the heading so long copy owns the entire second row.
        <View style={{ gap: spacing.xs, direction: theme.environment.direction }}>
          {resolved.title ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, paddingEnd: toastRecipe.close.diameter, minHeight: glyph.md }}>
            {renderedToneIcon === undefined ? null : <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ paddingTop: spacing.xxs, flexShrink: 0 }}>{renderedToneIcon}</View>}
            <Text variant="bodyLarge" emphasis="strong" style={{ flex: 1, minWidth: 0, color: theme.colors.text }}>{resolved.title}</Text>
          </View> : null}
          <Text variant="body" style={{ color: theme.colors.textBody, paddingEnd: resolved.title ? 0 : toastRecipe.close.diameter }}>{resolved.description}</Text>
          <View style={{ position: "absolute", top: -spacing.xs, end: -spacing.xs }}>{closeControl}</View>
        </View>
      ) : (
      <View
        style={{
          // Start-aligned so a multi-line or large-text toast keeps its badge beside the title (Web does the same).
          alignItems: "flex-start",
          direction: theme.environment.direction,
          flexDirection: "row",
          gap: toastRecipe.surface.gap,
        }}
      >
        {renderedToneIcon === undefined ? null : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              alignItems: "center",
              backgroundColor: badge,
              borderRadius: radius[toastRecipe.icon.badgeRadius],
              flexShrink: 0,
              height: toastRecipe.icon.badgeDiameter,
              justifyContent: "center",
              width: toastRecipe.icon.badgeDiameter,
            }}
          >
            {renderedToneIcon}
          </View>
        )}
        <View style={{ alignSelf: "center", flex: 1, gap: toastRecipe.content.gap, minWidth: 0 }}>
          {resolved.title ? (
            <Text
              style={{
                color: resolveColorReference(toastRecipe.title.color, theme.palette),
                fontWeight: toastRecipe.title.fontWeight,
              }}
              variant={toastRecipe.title.textVariant}
            >
              {resolved.title}
            </Text>
          ) : null}
          <Text
            style={{ color: resolveColorReference(toastRecipe.description.color, theme.palette) }}
            variant={toastRecipe.description.textVariant}
          >
            {resolved.description}
          </Text>
        </View>
        {closeControl}
      </View>
      )}
      {resolved.action ? (
        // 1.10.0: tinted pill aligned to the end (toastRecipe.action) instead of a ghost text button.
        <Pressable
          accessibilityLabel={resolved.action.accessibilityLabel}
          accessibilityRole="button"
          onBlur={resumeFocus}
          onFocus={pauseFocus}
          onPress={onAction}
          style={({ pressed }) => ({
            alignItems: managedMotion ? "flex-start" : "center",
            alignSelf: managedMotion ? "stretch" : toastRecipe.action.align === "end" ? "flex-end" : "flex-start",
            backgroundColor: managedMotion ? "transparent" : resolveColorReference(toastRecipe.action.background, theme.palette),
            borderTopWidth: managedMotion ? 1 : 0,
            borderTopColor: theme.colors.border,
            borderRadius: managedMotion ? 0 : radius[toastRecipe.action.radius],
            justifyContent: "center",
            minHeight: toastRecipe.action.minHeight,
            opacity: pressed ? toastRecipe.states.pressedOpacity : 1,
            paddingHorizontal: managedMotion ? 0 : toastRecipe.action.paddingHorizontal,
          })}
        >
          <Text
            style={{
              color: resolveColorReference(toastRecipe.action.color, theme.palette),
              fontWeight: toastRecipe.action.fontWeight,
            }}
            variant={toastRecipe.action.textVariant}
          >
            {resolved.action.label}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/** One Native toast driven by the same exactly-once session as a queued region. */
export function Toast({
  descriptor,
  onDismiss,
  placement = toastRecipe.defaults.placement,
  renderToneIcon,
  style,
}: ToastProps) {
  const descriptorRef = useRef(descriptor);
  const additionalDismissRef = useRef(onDismiss);
  descriptorRef.current = descriptor;
  additionalDismissRef.current = onDismiss;
  const decorate = useCallback(
    (next: ToastDescriptor): ToastDescriptor => ({
      ...next,
      onDismiss: (reason) => {
        descriptorRef.current.onDismiss?.(reason);
        additionalDismissRef.current?.(reason);
      },
    }),
    [],
  );
  const [session] = useState(() => {
    const created = createToastSession(decorate(descriptor));
    created.show();
    return created;
  });
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const previousDescriptor = useRef(descriptor);

  useEffect(() => {
    if (previousDescriptor.current !== descriptor) {
      session.update(decorate(descriptor));
      previousDescriptor.current = descriptor;
    }
  }, [decorate, descriptor, session]);
  useEffect(() => () => {
    session.interrupt();
  }, [session]);
  useEffect(() => {
    if (snapshot.timer.status !== "running" || snapshot.timer.remainingMs === null) return;
    const timeout = setTimeout(() => {
      session.advanceTime(snapshot.timer.remainingMs ?? 0);
    }, snapshot.timer.remainingMs);
    return () => clearTimeout(timeout);
  }, [session, snapshot.timer.remainingMs, snapshot.timer.status]);

  const completeDismiss = (reason: ToastDismissReason) => {
    session.dismiss(reason);
  };
  return (
    <ToastSurface
      onAction={() => {
        session.invokeAction();
      }}
      onDismiss={completeDismiss}
      onExitComplete={() => session.completeExit()}
      onPause={(reason) => session.pause(reason)}
      onResume={(reason) => session.resume(reason)}
      placement={placement}
      {...(renderToneIcon === undefined ? {} : { renderToneIcon })}
      snapshot={snapshot}
      style={style}
    />
  );
}

export type ToastRegionController = Readonly<{
  /** Queues a toast; the same name as the Web `useToast().publish` and the contract store. */
  publish: (descriptor: ToastDescriptor) => ToastPublishResult;
  dismiss: (id: string, reason?: ToastDismissReason) => boolean;
  pause: (id: string, reason?: ToastPauseReason) => boolean;
  resume: (id: string, reason?: ToastPauseReason) => boolean;
}>;

const ToastRegionContext = createContext<ToastRegionController | null>(null);

export type ToastSafeAreaInsets = Readonly<{
  top?: number;
  bottom?: number;
  /** Physical insets from `react-native-safe-area-context`. */
  left?: number;
  right?: number;
  /** Optional logical overrides; useful when the surrounding layout already resolved direction. */
  start?: number;
  end?: number;
}>;

export type ToastRegionProps = Readonly<{
  /** Optional renderer from the toast-liquid subpath. Requires top placement and one visible slot. */
  presentationAdapter?: ToastPresentationAdapter;
  /** Host modal ownership: hide and pause announcements without creating a second queue. */
  occluded?: boolean;
  children?: ReactNode;
  /** Optional localized name for the region; individual toasts remain self-announcing. */
  accessibilityLabel?: string;
  /** External collection compatibility; the contract store still owns each lifecycle. */
  toasts?: readonly ToastDescriptor[];
  defaultToasts?: readonly ToastDescriptor[];
  onToastsChange?: (toasts: readonly ToastDescriptor[]) => void;
  maxVisible?: number;
  maxQueued?: number;
  duplicatePolicy?: ToastDuplicatePolicy;
  timerUpdatePolicy?: ToastTimerUpdatePolicy;
  overflowPolicy?: ToastOverflowPolicy;
  placement?: ToastPlacement;
  safeAreaInsets?: ToastSafeAreaInsets;
  /** Observe the Native keyboard and keep bottom placements above it. */
  avoidKeyboard?: boolean;
  /** Additional product-owned offset, for example a persistent bottom bar. */
  keyboardOffset?: number;
  renderToneIcon?: (props: ToastToneIconRenderProps) => ReactNode;
  style?: StyleProp<ViewStyle>;
  toastStyle?: StyleProp<ViewStyle>;
}>;

function useToastKeyboardHeight(enabled: boolean): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setHeight(0);
      return;
    }
    const shown = Keyboard.addListener("keyboardDidShow", (event) => {
      setHeight(Math.max(0, event.endCoordinates.height));
    });
    const hidden = Keyboard.addListener("keyboardDidHide", () => setHeight(0));
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, [enabled]);
  return enabled ? height : 0;
}

function assertNonNegativeOffset(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`ToastRegion ${field} must be non-negative`);
  }
}

function snapshotDescriptor(snapshot: ToastSessionSnapshot): ToastDescriptor {
  const descriptor = snapshot.descriptor;
  return {
    id: descriptor.id,
    ...(descriptor.title === null ? {} : { title: descriptor.title }),
    description: descriptor.description,
    tone: descriptor.tone,
    presentation: descriptor.presentation,
    priority: descriptor.priority,
    announcement: descriptor.announcement,
    durationMs: descriptor.durationMs,
    ...(descriptor.action === null
      ? {}
      : {
          action: {
            label: descriptor.action.label,
            accessibilityLabel: descriptor.action.accessibilityLabel,
            onAction: descriptor.action.onAction,
            dismissOnAction: descriptor.action.dismissOnAction,
          },
        }),
    closeLabel: descriptor.closeLabel,
    ...(descriptor.onDismiss === null ? {} : { onDismiss: descriptor.onDismiss }),
  };
}

function allToastSnapshots(snapshot: ToastStoreSnapshot): readonly ToastSessionSnapshot[] {
  return [...snapshot.visible, ...snapshot.queued];
}

function PresentedToast({ adapter, width, availableHeight, windowOrigin, ...props }: ToastSurfaceProps & {
  adapter: ToastPresentationAdapter | undefined;
  width: number;
  availableHeight: number;
  windowOrigin: { x: number; y: number } | undefined;
}) {
  // Updating a job's copy must not replay its entrance or replace its presentation mid-session.
  const [enhanced] = useState(() => props.snapshot.descriptor.presentation === "liquid");
  const selected = enhanced ? adapter : undefined;
  const enabled = selected !== undefined;
  const callbacks = useRef(props);
  callbacks.current = props;
  useLayoutEffect(() => {
    if (enabled) callbacks.current.onPause("presentation");
    else callbacks.current.onResume("presentation");
  }, [enabled]);
  const announcement = props.snapshot.descriptor;
  const lastAnnouncement = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (props.suspended || props.snapshot.phase !== "visible" || Platform.OS !== "ios") return;
    const key = `${announcement.id}:${announcement.priority}:${announcement.announcement}`;
    if (lastAnnouncement.current === key) return;
    lastAnnouncement.current = key;
    AccessibilityInfo.announceForAccessibilityWithOptions(announcement.announcement, { queue: announcement.priority !== "high" });
  }, [announcement.announcement, announcement.priority, props.snapshot.phase, props.suspended]);
  const announcer = Platform.OS === "ios" || props.suspended ? null : <Text
    accessibilityLabel={announcement.announcement} accessibilityLiveRegion={announcement.priority === "high" ? "assertive" : "polite"}
    accessible style={{ height: 1, opacity: 0, position: "absolute", width: 1 }}>{announcement.announcement}</Text>;
  const fallback = <ToastSurface {...props} announces={false} />;
  if (!selected) return <>{announcer}{fallback}</>;
  const Surface = selected.Surface;
  return <>{announcer}<Surface anchor={selected.anchor} snapshot={props.snapshot} width={width} availableHeight={availableHeight}
    {...(windowOrigin === undefined ? {} : { windowOrigin })}
    suspended={props.suspended ?? false}
    body={<ToastSurface {...props} announces={false} managedMotion />}
    fallback={fallback} onPause={props.onPause} onResume={props.onResume}
    onDismiss={props.onDismiss} onExitComplete={props.onExitComplete} /></>;
}

/** Bounded FIFO region with one clock, app-state pause and teardown interruption. */
export function ToastRegion({
  presentationAdapter,
  occluded = false,
  children,
  accessibilityLabel,
  toasts,
  defaultToasts = [],
  onToastsChange,
  maxVisible = toastBehaviorDefaults.maxVisible,
  maxQueued = toastBehaviorDefaults.maxQueued,
  duplicatePolicy = toastBehaviorDefaults.duplicatePolicy,
  timerUpdatePolicy = toastBehaviorDefaults.timerUpdatePolicy,
  overflowPolicy = toastBehaviorDefaults.overflowPolicy,
  placement = toastRecipe.defaults.placement,
  safeAreaInsets = {},
  avoidKeyboard = true,
  keyboardOffset = 0,
  renderToneIcon,
  style,
  toastStyle,
}: ToastRegionProps) {
  if (presentationAdapter && (presentationAdapter.kind !== "liquid" || placement !== "top" || maxVisible !== 1)) {
    throw new TypeError("Liquid Toast requires top placement and maxVisible=1");
  }
  defaultToasts.forEach(resolveToastDescriptor);
  toasts?.forEach(resolveToastDescriptor);
  const [store] = useState<ToastStore>(() =>
    createToastStore({
      maxVisible,
      maxQueued,
      duplicatePolicy,
      timerUpdatePolicy,
      overflowPolicy,
    }),
  );
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const lastTime = useRef(performance.now());
  const disposed = useRef(false);
  const flushTime = useCallback(() => {
    if (disposed.current) return;
    const now = performance.now();
    const elapsed = Math.max(0, now - lastTime.current);
    lastTime.current = now;
    // Settle before publish/pause/resume, otherwise frequent updates reset the deadline.
    if (elapsed > 0) store.advanceTime(elapsed);
  }, [store]);
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const dimensions = useWindowDimensions();
  const viewportRef = useRef<View>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [windowOrigin, setWindowOrigin] = useState<{ x: number; y: number }>();
  const rawDescriptors = useRef(new Map<string, ToastDescriptor>());
  const initialDescriptors = useRef(toasts ?? defaultToasts);
  const onToastsChangeRef = useRef(onToastsChange);
  onToastsChangeRef.current = onToastsChange;
  const theme = useHjmNativeTheme();
  const placementContract = toastRecipe.placements[placement];
  const bottomPlacement = placementContract.blockEdge === "bottom";
  const keyboardHeight = useToastKeyboardHeight(avoidKeyboard && bottomPlacement);
  const safeTop = safeAreaInsets.top ?? 0;
  const safeBottom = safeAreaInsets.bottom ?? 0;
  const safeLeft = safeAreaInsets.left ?? 0;
  const safeRight = safeAreaInsets.right ?? 0;
  const safeStart = safeAreaInsets.start
    ?? (theme.environment.direction === "rtl" ? safeRight : safeLeft);
  const safeEnd = safeAreaInsets.end
    ?? (theme.environment.direction === "rtl" ? safeLeft : safeRight);
  assertNonNegativeOffset(keyboardOffset, "keyboardOffset");
  assertNonNegativeOffset(safeTop, "safeAreaInsets.top");
  assertNonNegativeOffset(safeBottom, "safeAreaInsets.bottom");
  assertNonNegativeOffset(safeLeft, "safeAreaInsets.left");
  assertNonNegativeOffset(safeRight, "safeAreaInsets.right");
  assertNonNegativeOffset(safeStart, "safeAreaInsets.start");
  assertNonNegativeOffset(safeEnd, "safeAreaInsets.end");

  const pruneRaw = useCallback(() => {
    const ids = new Set(allToastSnapshots(store.getSnapshot()).map((entry) => entry.descriptor.id));
    for (const id of rawDescriptors.current.keys()) {
      if (!ids.has(id)) rawDescriptors.current.delete(id);
    }
  }, [store]);
  const emitChange = useCallback(() => {
    pruneRaw();
    const next = allToastSnapshots(store.getSnapshot()).map(
      (entry) => rawDescriptors.current.get(entry.descriptor.id) ?? snapshotDescriptor(entry),
    );
    onToastsChangeRef.current?.(next);
  }, [pruneRaw, store]);
  const completeExit = useCallback((id: string) => {
    if (disposed.current) return false;
    flushTime();
    const changed = store.completeExit(id);
    if (changed) {
      pruneRaw();
      emitChange();
    }
    return changed;
  }, [emitChange, pruneRaw, store, flushTime]);

  const storeLifetime = useRef(0);
  const hasSeededDefaults = useRef(false);
  useEffect(() => {
    storeLifetime.current += 1;
    disposed.current = false;
    lastTime.current = performance.now();
    if (!hasSeededDefaults.current) {
      hasSeededDefaults.current = true;
      for (const descriptor of initialDescriptors.current) {
        rawDescriptors.current.set(descriptor.id, descriptor);
        store.publish(descriptor);
      }
    }
    return () => {
      disposed.current = true;
      // Strict Effects/Fast Refresh replay setup with the same store; only a real
      // unmount may destroy it. A microtask lets synchronous replay cancel disposal.
      const ending = ++storeLifetime.current;
      queueMicrotask(() => { if (storeLifetime.current === ending) store.dispose(); });
    };
  }, [store]);

  useEffect(() => {
    if (toasts === undefined) return;
    flushTime();
    const nextIds = new Set(toasts.map((descriptor) => descriptor.id));
    for (const descriptor of toasts) {
      if (rawDescriptors.current.get(descriptor.id) !== descriptor) {
        rawDescriptors.current.set(descriptor.id, descriptor);
        store.publish(descriptor);
      }
    }
    for (const entry of allToastSnapshots(store.getSnapshot())) {
      if (!nextIds.has(entry.descriptor.id)) {
        store.dismiss(entry.descriptor.id, "programmatic");
      }
    }
    pruneRaw();
  }, [pruneRaw, store, toasts]);

  useEffect(() => {
    const updateWindowPause = (state: string) => {
      flushTime();
      setAppActive(state === "active");
      if (state === "active") store.resumeAll("window");
      else store.pauseAll("window");
    };
    updateWindowPause(AppState.currentState);
    const subscription = AppState.addEventListener("change", updateWindowPause);
    return () => subscription.remove();
  }, [store, flushTime]);

  useLayoutEffect(() => {
    flushTime();
    if (occluded) store.pauseAll("occlusion");
    else store.resumeAll("occlusion");
  }, [occluded, store, flushTime]);

  useEffect(() => {
    const running = snapshot.visible
      .map((entry) => entry.timer)
      .filter((timer) => timer.status === "running" && timer.remainingMs !== null);
    if (running.length === 0) return;
    const remaining = Math.min(...running.map((timer) => timer.remainingMs ?? Infinity));
    const timeout = setTimeout(() => {
      flushTime();
    }, remaining);
    return () => clearTimeout(timeout);
  }, [snapshot.visible, store, flushTime]);

  const publish = useCallback((descriptor: ToastDescriptor) => {
    flushTime();
    rawDescriptors.current.set(descriptor.id, descriptor);
    const result = store.publish(descriptor);
    pruneRaw();
    emitChange();
    return result;
  }, [emitChange, pruneRaw, store]);
  const dismiss = useCallback((id: string, reason: ToastDismissReason = "programmatic") => {
    flushTime();
    const changed = store.dismiss(id, reason);
    if (changed) {
      pruneRaw();
      emitChange();
    }
    return changed;
  }, [emitChange, pruneRaw, store]);
  const invokeAction = useCallback((id: string) => {
    flushTime();
    return store.invokeAction(id);
  }, [store]);
  const controller = {
    publish,
    dismiss,
    pause: (id: string, reason: ToastPauseReason = "programmatic") => { flushTime(); return !disposed.current && store.pause(id, reason); },
    resume: (id: string, reason: ToastPauseReason = "programmatic") => { flushTime(); return !disposed.current && store.resume(id, reason); },
  } satisfies ToastRegionController;

  const suspended = occluded || !appActive;
  const width = viewportWidth ?? Math.max(0, dimensions.width - safeLeft - safeRight - toastRecipe.viewport.inset * 2);
  const availableHeight = Math.max(0, dimensions.height - (windowOrigin?.y ?? safeTop + toastRecipe.viewport.inset) - safeBottom - toastRecipe.viewport.inset);
  const hasChildren = children !== undefined && children !== null;
  const inlineAlignment = placementContract.inlineEdge === "start"
    ? "flex-start"
    : placementContract.inlineEdge === "end"
      ? "flex-end"
      : "center";
  const blockOffset = toastRecipe.viewport.inset
    + (bottomPlacement ? safeBottom + keyboardHeight + keyboardOffset : safeTop);
  return (
    <ToastRegionContext.Provider value={controller}>
      <View style={[{ flex: hasChildren ? 1 : undefined }, style]}>
        {children}
        <View
          ref={viewportRef}
          onLayout={event => {
            setViewportWidth(event.nativeEvent.layout.width);
            viewportRef.current?.measureInWindow?.((x, y) => setWindowOrigin(previous => previous?.x === x && previous?.y === y ? previous : { x, y }));
          }}
          accessibilityLabel={accessibilityLabel}
          accessibilityElementsHidden={suspended}
          importantForAccessibility={suspended ? "no-hide-descendants" : "auto"}
          pointerEvents={suspended ? "none" : "box-none"}
          style={{
            opacity: suspended ? 0 : 1,
            alignItems: inlineAlignment,
            direction: theme.environment.direction,
            elevation: toastRecipe.viewport.layer,
            end: toastRecipe.viewport.inset + safeEnd,
            flexDirection: placementContract.stackFrom === "bottom" ? "column-reverse" : "column",
            gap: toastRecipe.viewport.gap,
            position: hasChildren ? "absolute" : "relative",
            start: toastRecipe.viewport.inset + safeStart,
            zIndex: toastRecipe.viewport.layer,
            ...(bottomPlacement ? { bottom: blockOffset } : { top: blockOffset }),
          }}
        >
          {snapshot.visible.map((entry) => (
            <PresentedToast
              key={entry.descriptor.id}
              adapter={presentationAdapter}
              width={width}
              availableHeight={availableHeight}
              windowOrigin={windowOrigin}
              suspended={suspended}
              onAction={() => invokeAction(entry.descriptor.id)}
              onDismiss={(reason) => dismiss(entry.descriptor.id, reason)}
              onExitComplete={() => completeExit(entry.descriptor.id)}
              onPause={(reason) => { controller.pause(entry.descriptor.id, reason); }}
              onResume={(reason) => { controller.resume(entry.descriptor.id, reason); }}
              placement={placement}
              {...(renderToneIcon === undefined ? {} : { renderToneIcon })}
              snapshot={entry}
              style={toastStyle}
            />
          ))}
        </View>
      </View>
    </ToastRegionContext.Provider>
  );
}

export function useToastRegion(): ToastRegionController {
  const controller = useContext(ToastRegionContext);
  if (controller === null) throw new Error("useToastRegion must be used inside ToastRegion");
  return controller;
}
