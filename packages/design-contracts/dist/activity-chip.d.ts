import type { ColorReference } from "./color-references.js";
import { radius, type FontWeightValue, type TextVariant } from "./foundations.js";
/**
 * ActivityChip — a compact pressable status for one running background task (a review, an upload,
 * a sync). It shows a small decorative media and a short label in an otherwise empty header slot,
 * and opens the matching panel toast for details (composition `activity-status`).
 *
 * Why a new component (2026-10-10, BurnTok "똑쟁이" request): `Chip` is a selection/action control
 * with pressed/checked semantics; a status that toggles a details panel is a disclosure trigger with
 * `aria-expanded`, so reusing Chip would announce the wrong role. The name differs because Chip exists.
 * The task state, its copy and the panel content stay product-owned; HJM owns the trigger shape,
 * disclosure semantics and the panel (Toast) lifecycle.
 */
export type ActivityChipEmphasis = "default" | "emphasis";
export type ActivityChipDescriptor = Readonly<{
    /** Short visible status, for example "다듬는 중". */
    label: string;
    /** Full spoken status; defaults to `label`. */
    accessibilityLabel?: string;
    /** `emphasis` marks a result that waits for the user (e.g. a ready version to apply). */
    emphasis?: ActivityChipEmphasis;
    /** Whether the details panel it controls is open. */
    expanded?: boolean;
}>;
export type ResolvedActivityChipDescriptor = Readonly<{
    label: string;
    accessibilityLabel: string;
    emphasis: ActivityChipEmphasis;
    expanded: boolean;
}>;
export declare const activityChipDefaults: {
    readonly emphasis: "default";
    readonly expanded: false;
};
/** Validates product copy once so Web and Native reject the same empty labels. */
export declare function resolveActivityChipDescriptor(descriptor: ActivityChipDescriptor): ResolvedActivityChipDescriptor;
export type ActivityChipRecipe = Readonly<{
    slots: readonly ["root", "media", "label"];
    defaults: typeof activityChipDefaults;
    root: Readonly<{
        minHeight: number;
        maxWidth: number;
        radius: keyof typeof radius;
        borderWidth: number;
        gap: number;
        paddingStart: number;
        paddingEnd: number;
        pressedOpacity: number;
    }>;
    media: Readonly<{
        size: number;
        radius: keyof typeof radius;
    }>;
    label: Readonly<{
        textVariant: TextVariant;
        fontWeight: FontWeightValue;
        maxLines: number;
    }>;
    emphasis: Readonly<Record<ActivityChipEmphasis, Readonly<{
        background: ColorReference;
        foreground: ColorReference;
        border: ColorReference;
    }>>>;
}>;
export declare const activityChipRecipe: {
    readonly slots: readonly ["root", "media", "label"];
    readonly defaults: {
        readonly emphasis: "default";
        readonly expanded: false;
    };
    readonly root: {
        readonly minHeight: 44;
        readonly maxWidth: 180;
        readonly radius: "full";
        readonly borderWidth: 1;
        readonly gap: 4;
        readonly paddingStart: 4;
        readonly paddingEnd: 12;
        readonly pressedOpacity: 0.86;
    };
    readonly media: {
        readonly size: 28;
        readonly radius: "full";
    };
    readonly label: {
        readonly textVariant: "label";
        readonly fontWeight: "700";
        readonly maxLines: 1;
    };
    readonly emphasis: {
        readonly default: {
            readonly background: Readonly<{
                source: "theme";
                key: "surface";
                alpha?: number;
            }>;
            readonly foreground: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
        readonly emphasis: {
            readonly background: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
            readonly foreground: Readonly<{
                source: "theme";
                key: "onPrimary";
                alpha?: number;
            }>;
            readonly border: Readonly<{
                source: "theme";
                key: "primary";
                alpha?: number;
            }>;
        };
    };
};
//# sourceMappingURL=activity-chip.d.ts.map