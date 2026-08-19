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
export type FloatingActionButtonScrollSignal = "away-from-start" | "toward-start" | "idle";
export type FloatingActionButtonIconDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    name: IconName;
    decorative?: true;
    accessibilityLabel?: never;
    size?: never;
    tone?: never;
    weight?: never;
    directionality?: never;
}>;
export type ResolvedFloatingActionButtonIconDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    name: IconName;
    decorative: true;
}>;
/**
 * `label` is required even though `collapsed` mode shows only the icon.
 * The action's name must never shrink to nothing just because its visible
 * chrome did — `resolveFloatingActionButtonDescriptor` always reports the
 * full label as the accessible name in both layout modes.
 */
export type FloatingActionButtonDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    icon: FloatingActionButtonIconDescriptor<IconName>;
    label: string;
    layoutMode?: FloatingActionButtonLayoutMode;
}>;
export type ResolvedFloatingActionButtonDescriptor<IconName extends string = SemanticIconName> = Readonly<{
    icon: ResolvedFloatingActionButtonIconDescriptor<IconName>;
    label: string;
    layoutMode: FloatingActionButtonLayoutMode;
    resolvedAccessibilityLabel: string;
}>;
export declare const floatingActionButtonBehaviorDefaults: {
    readonly layoutMode: "expanded";
};
export declare function validateFloatingActionButtonDescriptor<IconName extends string>(descriptor: FloatingActionButtonDescriptor<IconName>): void;
/**
 * The label is the accessible name in every mode — `collapsed` never falls
 * back to the icon name, because an icon-only glyph is not a stable
 * accessible name across products or locales.
 */
export declare function resolveFloatingActionButtonDescriptor<IconName extends string>(descriptor: FloatingActionButtonDescriptor<IconName>): ResolvedFloatingActionButtonDescriptor<IconName>;
/**
 * Collapsing on `away-from-start` and expanding on `toward-start` mirrors the
 * common list-scroll convention (hide the label while the user reads,
 * reintroduce it once they scroll back toward the top). `idle` intentionally
 * keeps whatever mode is already active instead of guessing, so a renderer
 * that reports "no delta since last frame" cannot cause the button to flicker.
 */
export declare function resolveFloatingActionButtonLayoutMode(signal: FloatingActionButtonScrollSignal, previousMode?: FloatingActionButtonLayoutMode): FloatingActionButtonLayoutMode;
/**
 * Answers "who reserves the content's bottom padding" so both platform
 * renderers compute the same number instead of each re-deriving
 * diameter + margin arithmetic independently and drifting apart. The safe-area
 * inset is additive, matching every other bottom-anchored recipe in this
 * package (BottomNavigation, Sheet, Toast) rather than a `max()` clamp.
 */
export declare function resolveFloatingActionButtonContentClearance(safeAreaBottomInset: number): number;
/**
 * Both layout modes reuse Button/IconButton's `large` tier so the control
 * never changes height while morphing between a circle and a pill — only
 * shape and content change, per the brief's "don't fork the Button recipe."
 */
export declare const floatingActionButtonRecipe: {
    readonly slots: readonly ["root", "icon", "label"];
    readonly defaults: {
        readonly layoutMode: "expanded";
    };
    readonly circle: {
        readonly diameter: 52;
        readonly hitSlop: 0;
        readonly glyph: "lg";
    };
    readonly tone: {
        readonly background: Readonly<{
            source: "theme";
            key: "primary";
            alpha?: number;
        }>;
        readonly content: Readonly<{
            source: "theme";
            key: "onPrimary";
            alpha?: number;
        }>;
        readonly border: null;
    };
    readonly shape: "full";
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
    readonly expandedLabel: {
        readonly textVariant: "bodyLarge";
        readonly paddingHorizontal: 20;
    };
    readonly margin: 16;
    readonly shadow: {
        readonly color: "#000000";
        readonly opacity: 0.12;
        readonly radius: 12;
        readonly offsetY: 4;
    };
    /**
     * `micro` (120ms, instant under Reduce Motion) rather than `enter`/`exit`:
     * this transition can fire on every scroll-direction change, and a state
     * driven by continuous scrolling should use the fastest state-change tier
     * so it cannot visibly queue behind fast scroll gestures.
     */
    readonly transition: {
        readonly duration: 120;
        readonly easing: "standard";
        readonly reducedMotion: "instant";
    };
};
/**
 * Literal scenario names for behaviorRegistry.floatingActionButton (lead
 * wires into src/behaviors.ts). Kept here, not there, so this module stays
 * self-contained per the authoring brief.
 */
export declare const floatingActionButtonBehaviorScenarios: readonly ["collapses-on-scroll-away-from-start-without-losing-the-44-unit-target", "expands-on-scroll-toward-start", "idle-scroll-signal-does-not-change-the-current-mode", "accessible-name-is-the-full-label-in-both-layout-modes", "content-clearance-accounts-for-the-safe-area-inset-additively", "root-sits-after-scrollable-content-in-reading-and-tab-order", "reduced-motion-crossfades-icon-and-label-without-a-shape-tween"];
//# sourceMappingURL=floating-action-button.d.ts.map