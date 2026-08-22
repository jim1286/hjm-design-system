import { iconButtonRecipe } from "./icon-button-recipe.js";
import { motionPreset, shadow, spacing } from "./foundations.js";
import type { SemanticIconName } from "./icon.js";

/**
 * FloatingActionButton is not a smaller BottomCTA. BottomCTA is the screen's
 * conclusion (full-width, end of a flow, `bottomCtaRecipe`'s full-bleed
 * anatomy). FloatingActionButton is a single create action that floats above
 * scrollable content the user is still browsing — it never spans the width
 * and never claims to be the screen's only action. That is the entire
 * justification for a second contract instead of a BottomCTA variant.
 */
export type FloatingActionButtonLayoutMode = "expanded" | "collapsed";

/**
 * The renderer owns scroll listening and thresholding (same boundary as
 * LoadMore's IntersectionObserver/onEndReached and Popover's AnchoredOverlay —
 * this package never touches a scroll container). It only reports a discrete
 * signal; `resolveFloatingActionButtonLayoutMode` turns that into the next
 * mode without the renderer re-deriving the collapse/expand rule itself.
 */
export type FloatingActionButtonScrollSignal =
  | "away-from-start"
  | "toward-start"
  | "idle";

export type FloatingActionButtonIconDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{
  name: IconName;
  decorative?: true;
  accessibilityLabel?: never;
  size?: never;
  tone?: never;
  weight?: never;
  directionality?: never;
}>;

export type ResolvedFloatingActionButtonIconDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{ name: IconName; decorative: true }>;

/**
 * `label` is required even though `collapsed` mode shows only the icon.
 * The action's name must never shrink to nothing just because its visible
 * chrome did — `resolveFloatingActionButtonDescriptor` always reports the
 * full label as the accessible name in both layout modes.
 */
export type FloatingActionButtonDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{
  icon: FloatingActionButtonIconDescriptor<IconName>;
  label: string;
  layoutMode?: FloatingActionButtonLayoutMode;
}>;

export type ResolvedFloatingActionButtonDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{
  icon: ResolvedFloatingActionButtonIconDescriptor<IconName>;
  label: string;
  layoutMode: FloatingActionButtonLayoutMode;
  resolvedAccessibilityLabel: string;
}>;

export const floatingActionButtonBehaviorDefaults = {
  layoutMode: "expanded",
} as const satisfies Readonly<{ layoutMode: FloatingActionButtonLayoutMode }>;

function validateTrimmedCopy(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must not be empty`);
  }
  if (value !== value.trim()) {
    throw new TypeError(`${field} must not start or end with whitespace`);
  }
}

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new TypeError(`Unsupported FloatingActionButton ${field} field: ${key}`);
    }
  }
}

const descriptorKeys = new Set(["icon", "label", "layoutMode"]);
const iconKeys = new Set(["name", "decorative"]);
const layoutModes = new Set<FloatingActionButtonLayoutMode>(["expanded", "collapsed"]);
const scrollSignals = new Set<FloatingActionButtonScrollSignal>([
  "away-from-start",
  "toward-start",
  "idle",
]);

export function validateFloatingActionButtonDescriptor<IconName extends string>(
  descriptor: FloatingActionButtonDescriptor<IconName>,
): void {
  if (!isObject(descriptor)) {
    throw new TypeError("FloatingActionButton descriptor must be an object");
  }
  rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
  validateTrimmedCopy(descriptor.label, "FloatingActionButton label");
  if (!isObject(descriptor.icon)) {
    throw new TypeError("FloatingActionButton icon must be an object");
  }
  rejectUnknownKeys(descriptor.icon, iconKeys, "icon");
  if (descriptor.icon.decorative !== undefined && descriptor.icon.decorative !== true) {
    throw new TypeError("FloatingActionButton icon must be decorative");
  }
  validateTrimmedCopy(descriptor.icon.name, "FloatingActionButton icon name");
  if (
    descriptor.layoutMode !== undefined &&
    !layoutModes.has(descriptor.layoutMode)
  ) {
    throw new TypeError(
      `Unsupported FloatingActionButton layoutMode: ${String(descriptor.layoutMode)}`,
    );
  }
}

/**
 * The label is the accessible name in every mode — `collapsed` never falls
 * back to the icon name, because an icon-only glyph is not a stable
 * accessible name across products or locales.
 */
export function resolveFloatingActionButtonDescriptor<IconName extends string>(
  descriptor: FloatingActionButtonDescriptor<IconName>,
): ResolvedFloatingActionButtonDescriptor<IconName> {
  validateFloatingActionButtonDescriptor(descriptor);
  return {
    icon: { name: descriptor.icon.name, decorative: true },
    label: descriptor.label,
    layoutMode:
      descriptor.layoutMode ?? floatingActionButtonBehaviorDefaults.layoutMode,
    resolvedAccessibilityLabel: descriptor.label,
  };
}

/**
 * Collapsing on `away-from-start` and expanding on `toward-start` mirrors the
 * common list-scroll convention (hide the label while the user reads,
 * reintroduce it once they scroll back toward the top). `idle` intentionally
 * keeps whatever mode is already active instead of guessing, so a renderer
 * that reports "no delta since last frame" cannot cause the button to flicker.
 */
export function resolveFloatingActionButtonLayoutMode(
  signal: FloatingActionButtonScrollSignal,
  previousMode: FloatingActionButtonLayoutMode = floatingActionButtonBehaviorDefaults.layoutMode,
): FloatingActionButtonLayoutMode {
  if (!scrollSignals.has(signal)) {
    throw new TypeError(`Unsupported FloatingActionButton scroll signal: ${String(signal)}`);
  }
  if (!layoutModes.has(previousMode)) {
    throw new TypeError(
      `Unsupported FloatingActionButton layoutMode: ${String(previousMode)}`,
    );
  }
  if (signal === "away-from-start") return "collapsed";
  if (signal === "toward-start") return "expanded";
  return previousMode;
}

/**
 * Answers "who reserves the content's bottom padding" so both platform
 * renderers compute the same number instead of each re-deriving
 * diameter + margin arithmetic independently and drifting apart. The safe-area
 * inset is additive, matching every other bottom-anchored recipe in this
 * package (BottomNavigation, Sheet, Toast) rather than a `max()` clamp.
 */
export function resolveFloatingActionButtonContentClearance(
  safeAreaBottomInset: number,
): number {
  if (!Number.isFinite(safeAreaBottomInset) || safeAreaBottomInset < 0) {
    throw new RangeError(
      "FloatingActionButton safeAreaBottomInset must be a non-negative finite number",
    );
  }
  return (
    floatingActionButtonRecipe.circle.diameter +
    floatingActionButtonRecipe.margin * 2 +
    safeAreaBottomInset
  );
}

/**
 * Both layout modes reuse Button/IconButton's `large` tier so the control
 * never changes height while morphing between a circle and a pill — only
 * shape and content change, per the brief's "don't fork the Button recipe."
 */
export const floatingActionButtonRecipe = {
  slots: ["root", "icon", "label"] as const,
  defaults: { layoutMode: "expanded" } as const,
  circle: iconButtonRecipe.sizes.large,
  tone: iconButtonRecipe.tones.primary,
  shape: iconButtonRecipe.shapes.circle,
  /**
   * Button의 large 티어와 같은 값이다. 그런데 `buttonRecipe`를 import하지는 않는다 —
   * 그것은 `recipes.ts`에 있고 그 파일은 `component-recipes.ts`를 import하는 **하류**라,
   * 여기서 거슬러 올라가면 순환이 된다(ESM은 재수출을 본문보다 먼저 평가해서
   * `buttonRecipe`가 undefined인 채로 이 모듈이 실행된다).
   *
   * 대신 같은 foundations 토큰을 직접 읽고, **두 값이 어긋나지 않는다는 것은
   * `test/floating-action-button.test.ts`의 불변식으로 강제한다.** 이 저장소가 규칙을
   * 다루는 방식대로 — 지켜야 할 것은 import가 아니라 테스트로 묶는다.
   */
  expandedLabel: {
    textVariant: "bodyLarge",
    paddingHorizontal: spacing.lg,
  },
  margin: spacing.md,
  shadow: shadow.floating,
  /**
   * `micro` (120ms, instant under Reduce Motion) rather than `enter`/`exit`:
   * this transition can fire on every scroll-direction change, and a state
   * driven by continuous scrolling should use the fastest state-change tier
   * so it cannot visibly queue behind fast scroll gestures.
   */
  transition: motionPreset.micro,
} as const;

/**
 * Literal scenario names for behaviorRegistry.floatingActionButton (lead
 * wires into src/behaviors.ts). Kept here, not there, so this module stays
 * self-contained per the authoring brief.
 */
export const floatingActionButtonBehaviorScenarios = [
  "collapses-on-scroll-away-from-start-without-losing-the-44-unit-target",
  "expands-on-scroll-toward-start",
  "idle-scroll-signal-does-not-change-the-current-mode",
  "accessible-name-is-the-full-label-in-both-layout-modes",
  "content-clearance-accounts-for-the-safe-area-inset-additively",
  "root-sits-after-scrollable-content-in-reading-and-tab-order",
  "reduced-motion-crossfades-icon-and-label-without-a-shape-tween",
] as const;
