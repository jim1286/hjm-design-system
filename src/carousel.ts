import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import type { SemanticIconName } from "./icon.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { control, motionPreset, opacity, spacing } from "./foundations.js";
import { assertFiniteNumber } from "./number-field.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * Ant Design Carousel's infinite loop and default autoplay are intentionally
 * not reproduced — both remove the one thing this contract treats as
 * non-negotiable: a reliable answer to "where am I, and where does it end".
 * See docs/carousel.md for the accessibility rationale on every point below.
 */
export type CarouselSlideDescriptor<Id extends string = string> = Readonly<{
  id: Id;
  /** Accessible name for the slide, e.g. "8/19 두산 vs LG". The slide's visual content is product-owned. */
  label: string;
}>;

export type CarouselAutoplayConfig = Readonly<{
  /** Minimum time a slide stays current before an automatic advance. */
  intervalMs: number;
}>;

/**
 * Renderer-facing prop shape only — mirrors SelectSelection's controlled/
 * uncontrolled duality, but the resolver below always takes a concrete,
 * already-resolved `currentKey` (see CarouselDescriptor) so validation and
 * position math never have to branch on which mode the product chose.
 */
export type ControlledCarouselSelection<Id extends string = string> = Readonly<{
  currentKey: Id;
  defaultCurrentKey?: never;
  onCurrentKeyChange(key: Id): void;
}>;

export type UncontrolledCarouselSelection<Id extends string = string> = Readonly<{
  currentKey?: never;
  defaultCurrentKey?: Id;
  onCurrentKeyChange?: (key: Id) => void;
}>;

export type CarouselSelection<Id extends string = string> =
  | ControlledCarouselSelection<Id>
  | UncontrolledCarouselSelection<Id>;

export type CarouselDescriptor<Id extends string = string> = Readonly<{
  slides: readonly CarouselSlideDescriptor<Id>[];
  currentKey: Id;
  /** Absent by default. Autoplay is opt-in — see docs/carousel.md. */
  autoplay?: CarouselAutoplayConfig;
}>;

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Carousel ${field} must not be empty`);
  }
}

export function validateCarouselSlide<Id extends string>(
  slide: CarouselSlideDescriptor<Id>,
): void {
  assertNonEmpty(slide.id, "slide id");
  if (slide.id !== slide.id.trim()) {
    throw new TypeError("Carousel slide id must not start or end with whitespace");
  }
  assertNonEmpty(slide.label, "slide label");
}

export function validateCarouselAutoplayConfig(
  autoplay: CarouselAutoplayConfig,
): void {
  assertFiniteNumber(autoplay.intervalMs, "autoplay.intervalMs");
  if (autoplay.intervalMs <= 0) {
    throw new RangeError("Carousel autoplay.intervalMs must be greater than zero");
  }
}

export function validateCarouselDescriptor<Id extends string>(
  descriptor: CarouselDescriptor<Id>,
): void {
  if (descriptor.slides.length === 0) {
    throw new RangeError("Carousel must contain at least one slide");
  }
  const ids = new Set<Id>();
  for (const slide of descriptor.slides) {
    validateCarouselSlide(slide);
    if (ids.has(slide.id)) {
      throw new TypeError(`Duplicate Carousel slide id: ${slide.id}`);
    }
    ids.add(slide.id);
  }
  if (!ids.has(descriptor.currentKey)) {
    throw new RangeError(
      `Carousel currentKey does not match any slide id: ${String(descriptor.currentKey)}`,
    );
  }
  if (descriptor.autoplay) {
    validateCarouselAutoplayConfig(descriptor.autoplay);
  }
}

export type CarouselAccessibleNameInfo = Readonly<{
  position: number;
  total: number;
  label: string;
}>;

/**
 * Same reason Steps and Timeline do not assemble their own accessible name:
 * counter-word grammar and phrase order are product-owned copy decisions.
 */
export type ComposeCarouselAccessibleName = (
  info: CarouselAccessibleNameInfo,
) => string;

export type ResolvedCarouselSlideDescriptor<Id extends string = string> =
  CarouselSlideDescriptor<Id> &
    Readonly<{
      /** 1-indexed so position and label both preserve reading order for renderers. */
      position: number;
      total: number;
      current: boolean;
      /**
       * True for every slide but the current one. A renderer must exclude an
       * inert slide's interactive content from both focus and the
       * accessibility tree — a hidden slide whose link can still receive
       * focus is worse than one that is simply unreachable until the user
       * advances to it (see docs/carousel.md).
       */
      inert: boolean;
      accessibleName: string;
    }>;

export type ResolveCarouselOptions = Readonly<{
  composeAccessibleName: ComposeCarouselAccessibleName;
}>;

/**
 * Attaches order, current/inert, and the composed accessible name used by
 * both the slide group and its indicator dot — one composer, reused for
 * every render target, the same way Steps reuses a single composer.
 */
export function resolveCarouselDescriptor<Id extends string>(
  descriptor: CarouselDescriptor<Id>,
  options: ResolveCarouselOptions,
): readonly ResolvedCarouselSlideDescriptor<Id>[] {
  validateCarouselDescriptor(descriptor);
  if (typeof options.composeAccessibleName !== "function") {
    throw new TypeError("Carousel composeAccessibleName must be a function");
  }

  const total = descriptor.slides.length;
  return descriptor.slides.map((slide, index) => {
    const position = index + 1;
    const current = slide.id === descriptor.currentKey;
    const accessibleName = options.composeAccessibleName({
      position,
      total,
      label: slide.label,
    });
    if (typeof accessibleName !== "string" || accessibleName.trim().length === 0) {
      throw new TypeError(
        "Carousel composeAccessibleName must return a non-empty string",
      );
    }
    return { ...slide, position, total, current, inert: !current, accessibleName };
  });
}

export type CarouselNavigationIntent = "next" | "previous" | "first" | "last";

/**
 * Clamps at the first/last slide instead of wrapping — infinite loop is out
 * of scope (see docs/carousel.md), so there is no modulo here at all, unlike
 * getCollectionNavigationTarget's `loop` parameter elsewhere in this package.
 */
export function getCarouselNavigationTarget<Id extends string>(
  descriptor: CarouselDescriptor<Id>,
  intent: CarouselNavigationIntent,
): Id {
  validateCarouselDescriptor(descriptor);
  const { slides, currentKey } = descriptor;
  if (intent === "first") return slides[0]!.id;
  if (intent === "last") return slides.at(-1)!.id;
  const currentIndex = slides.findIndex((slide) => slide.id === currentKey);
  const delta = intent === "next" ? 1 : -1;
  const clampedIndex = Math.min(
    Math.max(currentIndex + delta, 0),
    slides.length - 1,
  );
  return slides[clampedIndex]!.id;
}

export type CarouselAutoplayInputs = Readonly<{
  /** True whenever a platform reduce-motion preference is active. */
  reducedMotion: boolean;
  /** Renderer-combined pointer hover, focus-within, and drag signal. */
  paused: boolean;
}>;

/**
 * Autoplay is never active without an explicit config, under reduce motion,
 * or while the user is hovering, focusing, or dragging the carousel — the
 * three guards the brief requires are one function so a renderer cannot wire
 * an autoplay timer that forgets one of them.
 */
export function isCarouselAutoplayActive(
  autoplay: CarouselAutoplayConfig | undefined,
  inputs: CarouselAutoplayInputs,
): boolean {
  if (!autoplay) return false;
  validateCarouselAutoplayConfig(autoplay);
  return !inputs.reducedMotion && !inputs.paused;
}

export const carouselBehaviorDefaults = {
  autoplay: false,
} as const satisfies Readonly<{ autoplay: boolean }>;

export const carouselBehavior = {
  controlled: ["currentKey", "defaultCurrentKey", "onCurrentKeyChange"],
  inputs: ["autoplay", "reducedMotion", "dragged"],
  defaults: carouselBehaviorDefaults,
  stateAxes: {
    interaction: ["idle", "dragged"],
    value: ["selected"],
  },
  web: {
    roles: ["region", "group"],
    keyboard: ["Tab", "Enter", "Space", "ArrowLeft", "ArrowRight"],
    focus: "roving",
  },
  native: {
    roles: ["adjustable"],
    states: ["selected"],
    actions: ["increment", "decrement"],
  },
  scenarios: [
    "current-position-is-announced-with-a-readable-name-not-dots-alone",
    "inactive-slide-content-is-excluded-from-focus-and-the-accessibility-tree",
    "previous-next-and-dot-controls-stay-in-tab-order-regardless-of-current-slide",
    "arrow-keys-move-one-slide-on-web-swipe-moves-one-slide-on-native",
    "boundary-slides-clamp-instead-of-wrapping-because-loop-is-out-of-scope",
    "autoplay-is-opt-in-and-off-by-default",
    "autoplay-never-runs-when-reduced-motion-is-active",
    "autoplay-pauses-on-hover-focus-or-drag-and-does-not-announce-automatic-transitions",
  ],
} as const satisfies BehaviorContract;

export type CarouselSize = "medium";

export const carouselRecipe = {
  slots: [
    "root",
    "track",
    "slide",
    "dots",
    "dot",
    "previousControl",
    "nextControl",
  ] as const,
  defaults: { size: "medium" },
  sizes: {
    medium: {
      gap: spacing.sm,
      controlHitTarget: control.minTouchTarget,
      controlIcon: "sm",
    },
  },
  dot: {
    diameter: 8,
    hitTarget: control.minTouchTarget,
    color: {
      inactive: semanticColors.border.strong,
      current: semanticColors.content.brand,
    },
  },
  /** Previous/next chrome is composed from IconButton (ghost tone) rather than owning new button visuals. */
  control: {
    icons: {
      previous: "chevronStart",
      next: "chevronEnd",
    } as const satisfies Readonly<{ previous: SemanticIconName; next: SemanticIconName }>,
  },
  states: {
    focus: focusIndicatorContract,
    draggedOpacity: opacity.dragged,
  },
  /**
   * Manual slide-to-slide movement crossfades rather than snapping under
   * Reduce Motion, reusing the existing "context" preset instead of a new
   * token — autoplay itself simply does not run at all (isCarouselAutoplayActive).
   */
  transition: motionPreset.context,
} as const satisfies {
  slots: readonly string[];
  defaults: { size: CarouselSize };
  sizes: Record<
    CarouselSize,
    { gap: number; controlHitTarget: number; controlIcon: string }
  >;
  dot: {
    diameter: number;
    hitTarget: number;
    color: Record<"inactive" | "current", ColorReference>;
  };
  control: {
    icons: Readonly<{ previous: SemanticIconName; next: SemanticIconName }>;
  };
  states: {
    focus: typeof focusIndicatorContract;
    draggedOpacity: number;
  };
  transition: typeof motionPreset.context;
};
