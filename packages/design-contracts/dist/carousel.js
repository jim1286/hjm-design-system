import { focusIndicatorContract } from "./component-contracts.js";
import { control, motionPreset, opacity, spacing } from "./foundations.js";
import { assertFiniteNumber } from "./number-field.js";
import { semanticColors } from "./semantic-colors.js";
function assertNonEmpty(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Carousel ${field} must not be empty`);
    }
}
export function validateCarouselSlide(slide) {
    assertNonEmpty(slide.id, "slide id");
    if (slide.id !== slide.id.trim()) {
        throw new TypeError("Carousel slide id must not start or end with whitespace");
    }
    assertNonEmpty(slide.label, "slide label");
}
export function validateCarouselAutoplayConfig(autoplay) {
    assertFiniteNumber(autoplay.intervalMs, "autoplay.intervalMs");
    if (autoplay.intervalMs <= 0) {
        throw new RangeError("Carousel autoplay.intervalMs must be greater than zero");
    }
}
export function validateCarouselDescriptor(descriptor) {
    if (descriptor.slides.length === 0) {
        throw new RangeError("Carousel must contain at least one slide");
    }
    const ids = new Set();
    for (const slide of descriptor.slides) {
        validateCarouselSlide(slide);
        if (ids.has(slide.id)) {
            throw new TypeError(`Duplicate Carousel slide id: ${slide.id}`);
        }
        ids.add(slide.id);
    }
    if (!ids.has(descriptor.currentKey)) {
        throw new RangeError(`Carousel currentKey does not match any slide id: ${String(descriptor.currentKey)}`);
    }
    if (descriptor.autoplay) {
        validateCarouselAutoplayConfig(descriptor.autoplay);
    }
}
/**
 * Attaches order, current/inert, and the composed accessible name used by
 * both the slide group and its indicator dot — one composer, reused for
 * every render target, the same way Steps reuses a single composer.
 */
export function resolveCarouselDescriptor(descriptor, options) {
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
            throw new TypeError("Carousel composeAccessibleName must return a non-empty string");
        }
        return { ...slide, position, total, current, inert: !current, accessibleName };
    });
}
/**
 * Clamps at the first/last slide instead of wrapping — infinite loop is out
 * of scope (see docs/carousel.md), so there is no modulo here at all, unlike
 * getCollectionNavigationTarget's `loop` parameter elsewhere in this package.
 */
export function getCarouselNavigationTarget(descriptor, intent) {
    validateCarouselDescriptor(descriptor);
    const { slides, currentKey } = descriptor;
    if (intent === "first")
        return slides[0].id;
    if (intent === "last")
        return slides.at(-1).id;
    const currentIndex = slides.findIndex((slide) => slide.id === currentKey);
    const delta = intent === "next" ? 1 : -1;
    const clampedIndex = Math.min(Math.max(currentIndex + delta, 0), slides.length - 1);
    return slides[clampedIndex].id;
}
/**
 * Autoplay is never active without an explicit config, under reduce motion,
 * or while the user is hovering, focusing, or dragging the carousel — the
 * three guards the brief requires are one function so a renderer cannot wire
 * an autoplay timer that forgets one of them.
 */
export function isCarouselAutoplayActive(autoplay, inputs) {
    if (!autoplay)
        return false;
    validateCarouselAutoplayConfig(autoplay);
    return !inputs.reducedMotion && !inputs.paused;
}
export const carouselBehaviorDefaults = {
    autoplay: false,
};
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
};
export const carouselRecipe = {
    slots: [
        "root",
        "track",
        "slide",
        "dots",
        "dot",
        "previousControl",
        "nextControl",
    ],
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
        },
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
};
//# sourceMappingURL=carousel.js.map