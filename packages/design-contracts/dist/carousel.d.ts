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
export type CarouselSelection<Id extends string = string> = ControlledCarouselSelection<Id> | UncontrolledCarouselSelection<Id>;
export type CarouselDescriptor<Id extends string = string> = Readonly<{
    slides: readonly CarouselSlideDescriptor<Id>[];
    currentKey: Id;
    /** Absent by default. Autoplay is opt-in — see docs/carousel.md. */
    autoplay?: CarouselAutoplayConfig;
}>;
export declare function validateCarouselSlide<Id extends string>(slide: CarouselSlideDescriptor<Id>): void;
export declare function validateCarouselAutoplayConfig(autoplay: CarouselAutoplayConfig): void;
export declare function validateCarouselDescriptor<Id extends string>(descriptor: CarouselDescriptor<Id>): void;
export type CarouselAccessibleNameInfo = Readonly<{
    position: number;
    total: number;
    label: string;
}>;
/**
 * Same reason Steps and Timeline do not assemble their own accessible name:
 * counter-word grammar and phrase order are product-owned copy decisions.
 */
export type ComposeCarouselAccessibleName = (info: CarouselAccessibleNameInfo) => string;
export type ResolvedCarouselSlideDescriptor<Id extends string = string> = CarouselSlideDescriptor<Id> & Readonly<{
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
export declare function resolveCarouselDescriptor<Id extends string>(descriptor: CarouselDescriptor<Id>, options: ResolveCarouselOptions): readonly ResolvedCarouselSlideDescriptor<Id>[];
export type CarouselNavigationIntent = "next" | "previous" | "first" | "last";
/**
 * Clamps at the first/last slide instead of wrapping — infinite loop is out
 * of scope (see docs/carousel.md), so there is no modulo here at all, unlike
 * getCollectionNavigationTarget's `loop` parameter elsewhere in this package.
 */
export declare function getCarouselNavigationTarget<Id extends string>(descriptor: CarouselDescriptor<Id>, intent: CarouselNavigationIntent): Id;
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
export declare function isCarouselAutoplayActive(autoplay: CarouselAutoplayConfig | undefined, inputs: CarouselAutoplayInputs): boolean;
export declare const carouselBehaviorDefaults: {
    readonly autoplay: false;
};
export declare const carouselBehavior: {
    readonly controlled: readonly ["currentKey", "defaultCurrentKey", "onCurrentKeyChange"];
    readonly inputs: readonly ["autoplay", "reducedMotion", "dragged"];
    readonly defaults: {
        readonly autoplay: false;
    };
    readonly stateAxes: {
        readonly interaction: readonly ["idle", "dragged"];
        readonly value: readonly ["selected"];
    };
    readonly web: {
        readonly roles: readonly ["region", "group"];
        readonly keyboard: readonly ["Tab", "Enter", "Space", "ArrowLeft", "ArrowRight"];
        readonly focus: "roving";
    };
    readonly native: {
        readonly roles: readonly ["adjustable"];
        readonly states: readonly ["selected"];
        readonly actions: readonly ["increment", "decrement"];
    };
    readonly scenarios: readonly ["current-position-is-announced-with-a-readable-name-not-dots-alone", "inactive-slide-content-is-excluded-from-focus-and-the-accessibility-tree", "previous-next-and-dot-controls-stay-in-tab-order-regardless-of-current-slide", "arrow-keys-move-one-slide-on-web-swipe-moves-one-slide-on-native", "boundary-slides-clamp-instead-of-wrapping-because-loop-is-out-of-scope", "autoplay-is-opt-in-and-off-by-default", "autoplay-never-runs-when-reduced-motion-is-active", "autoplay-pauses-on-hover-focus-or-drag-and-does-not-announce-automatic-transitions"];
};
export type CarouselSize = "medium";
export declare const carouselRecipe: {
    readonly slots: readonly ["root", "track", "slide", "dots", "dot", "previousControl", "nextControl"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly sizes: {
        readonly medium: {
            readonly gap: 12;
            readonly controlHitTarget: 44;
            readonly controlIcon: "sm";
        };
    };
    readonly dot: {
        readonly diameter: 8;
        readonly hitTarget: 44;
        readonly color: {
            readonly inactive: Readonly<{
                source: "theme";
                key: "textWeak";
                alpha?: number;
            }>;
            readonly current: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
        };
    };
    /** Previous/next chrome is composed from IconButton (ghost tone) rather than owning new button visuals. */
    readonly control: {
        readonly icons: {
            readonly previous: "chevronStart";
            readonly next: "chevronEnd";
        };
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly draggedOpacity: 0.64;
    };
    /**
     * Manual slide-to-slide movement crossfades rather than snapping under
     * Reduce Motion, reusing the existing "context" preset instead of a new
     * token — autoplay itself simply does not run at all (isCarouselAutoplayActive).
     */
    readonly transition: {
        readonly duration: 320;
        readonly easing: "emphasized";
        readonly reducedMotion: "opacity";
    };
};
//# sourceMappingURL=carousel.d.ts.map