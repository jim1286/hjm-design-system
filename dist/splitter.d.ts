/**
 * `"horizontal"` means panes sit side by side (the separator is a vertical
 * bar); `"vertical"` means panes stack top/bottom (the separator is a
 * horizontal bar). See `resolveSplitterSeparatorOrientation` — the two are
 * intentionally not spelled the same way to keep that inversion visible.
 */
export type SplitterAxis = "horizontal" | "vertical";
/**
 * "Pick a number within a range" — the same problem NumberField and Slider
 * already solve, applied to a pane size instead of a displayed value. This
 * descriptor reuses `min`/`max`/`step`/`value` verbatim and calls
 * `src/number-field.ts`'s judgment functions directly rather than
 * re-deriving clamp/snap/step arithmetic a third time.
 */
export type SplitterDescriptor = Readonly<{
    /** The primary pane's current size, in whatever unit the product chose (fraction or px). */
    value: number;
    min: number;
    max: number;
    step?: number;
    axis?: SplitterAxis;
    /** Required accessible name for the separator (e.g. "패널 크기 조절"). */
    label: string;
    /** Product-formatted announcement of the current size, e.g. "35%" or "320px". */
    valueText?: string;
}>;
export declare const splitterDefaults: {
    readonly axis: "horizontal";
};
export declare function validateSplitterDescriptor(descriptor: SplitterDescriptor): void;
/**
 * A WAI-ARIA `separator` reports orientation as the axis the pointer moves
 * *along*, which is perpendicular to how the panes are arranged — a
 * side-by-side (`"horizontal"`) splitter has a *vertical* separator bar.
 * Named and exported so renderers translate this once instead of
 * re-deriving the inversion at each call site.
 */
export declare function resolveSplitterSeparatorOrientation(axis: SplitterAxis): "horizontal" | "vertical";
/** Keyboard step, reusing NumberField's stepper arithmetic unchanged. */
export declare function getNextSplitterValue(descriptor: SplitterDescriptor, direction: "increment" | "decrement"): number;
/** Drag resolution: snaps a raw pointer-derived value to the same step grid keyboard resize uses. */
export declare function resolveSplitterDragValue(descriptor: SplitterDescriptor, rawValue: number): number;
/** Boundary jump for Home/End, reusing NumberField's clamp unchanged. */
export declare function resolveSplitterBoundaryValue(descriptor: SplitterDescriptor, boundary: "min" | "max"): number;
/**
 * Reused visual language from Slider: a thin visible line (`thickness`) with
 * a much larger `hitTarget` — the same "small handle, 44-unit hit area"
 * split documented in `docs/slider.md`.
 */
export declare const splitterRecipe: {
    readonly slots: readonly ["root", "pane", "separator", "handle"];
    readonly defaults: {
        readonly axis: "horizontal";
    };
    readonly separator: {
        readonly thickness: 1;
        readonly hitTarget: 44;
        readonly color: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly hoverColor: Readonly<{
            source: "theme";
            key: "textWeak";
            alpha?: number;
        }>;
        readonly activeColor: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
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
    };
};
/**
 * Deliberately excluded: collapse-to-hidden-pane (antd's collapsible
 * arrows) and N-pane/multi-separator layouts. Neither has measured product
 * demand, and both would roughly double this contract's surface (a
 * collapsed pane needs its own reveal affordance and bypasses `min`; N
 * panes need an ordered list of separators instead of one value) — the
 * same reasoning Slider used to leave out two-handle `range` mode.
 */
export declare const splitterBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
    readonly inputs: readonly ["min", "max", "step", "label", "valueText"];
    readonly stateAxes: {
        readonly interaction: readonly ["idle", "hover", "focusVisible", "pressed", "dragged"];
        readonly availability: readonly ["enabled", "disabled"];
    };
    readonly web: {
        readonly roles: readonly ["separator"];
        readonly keyboard: readonly ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["separator-role-carries-aria-valuenow-min-max-and-optional-valuetext", "separator-orientation-is-perpendicular-to-the-splitter-axis-not-equal-to-it", "keyboard-arrow-keys-step-like-numberfield-home-and-end-jump-to-the-boundary", "drag-and-keyboard-resize-produce-the-same-snapped-value", "reuses-number-field-range-judgment-instead-of-a-new-numeric-domain", "no-collapse-to-hidden-pane-or-multi-separator-layout-in-this-contract"];
};
//# sourceMappingURL=splitter.d.ts.map