import { control } from "./foundations.js";
export type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent";
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";
/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export declare const buttonRecipe: {
    readonly slots: readonly ["root", "leading", "label", "trailing", "spinner"];
    readonly defaults: {
        readonly tone: "primary";
        readonly size: "medium";
    };
    readonly tones: {
        readonly primary: {
            readonly background: "primary";
            readonly content: "onPrimary";
            readonly border: null;
        };
        readonly secondary: {
            readonly background: "surfaceAlt";
            readonly content: "text";
            readonly border: "border";
        };
        readonly ghost: {
            readonly background: null;
            readonly content: "textMuted";
            readonly border: null;
        };
        readonly danger: {
            readonly background: "dangerFill";
            readonly content: "onDanger";
            readonly border: null;
        };
    };
    readonly sizes: {
        readonly small: {
            readonly height: 36;
            readonly hitSlop: 4;
            readonly paddingHorizontal: 12;
            readonly textVariant: "label";
        };
        readonly medium: {
            readonly height: 44;
            readonly hitSlop: 0;
            readonly paddingHorizontal: 16;
            readonly textVariant: "body";
        };
        readonly large: {
            readonly height: 52;
            readonly hitSlop: 0;
            readonly paddingHorizontal: 20;
            readonly textVariant: "bodyLarge";
        };
    };
    readonly opacity: {
        readonly disabled: 0.5;
        readonly pressed: 0.86;
    };
};
export declare const surfaceRecipe: {
    readonly default: {
        readonly background: "surface";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: false;
    };
    readonly raised: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: true;
    };
    readonly accent: {
        readonly background: "surfaceAccent";
        readonly border: "primary";
        readonly borderAlpha: 0.3;
        readonly elevated: false;
    };
};
export declare const fieldRecipe: {
    readonly slots: readonly ["root", "label", "control", "leading", "input", "trailing", "hint", "error"];
    readonly defaults: {
        readonly variant: "surface";
        readonly shape: "medium";
    };
    readonly variants: {
        readonly surface: {
            readonly background: "surface";
        };
        readonly inset: {
            readonly background: "bg";
        };
    };
    readonly shapes: {
        readonly medium: "md";
        readonly large: "lg";
        readonly full: "full";
    };
    readonly states: {
        readonly idle: {
            readonly border: "textMuted";
        };
        readonly focused: {
            readonly border: "contentBrand";
        };
        readonly invalid: {
            readonly border: "danger";
        };
    };
    readonly minHeight: 44;
    readonly multilineMinHeight: 80;
    readonly borderWidth: 1;
    readonly focusRingWidth: 2;
    readonly focusRingOffset: 2;
    readonly paddingHorizontal: 16;
    readonly paddingVertical: 12;
    readonly textVariant: "body";
    readonly label: {
        readonly color: "textBody";
        readonly textVariant: "body";
        readonly fontWeight: "600";
        readonly gap: 8;
    };
    readonly support: {
        readonly hintColor: "textMuted";
        readonly errorColor: "danger";
        readonly textVariant: "label";
        readonly gap: 6;
    };
    readonly placeholder: {
        readonly color: "textMuted";
    };
    readonly disabledOpacity: 0.6;
};
export { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, chipRecipe, comboboxRecipe, counterBadgeRecipe, dialogRecipe, dividerRecipe, emptyStateRecipe, formatCounterBadgeCount, iconButtonRecipe, iconRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, progressRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, skeletonRecipe, spinnerRecipe, stackRecipe, statisticRecipe, switchRecipe, tabsRecipe, textRecipe, toastRecipe, tooltipRecipe, topBarRecipe, type AccordionDensity, type AlertDialogTone, type AvatarShape, type AvatarSize, type BadgeSize, type BadgeTone, type BottomNavigationDensity, type BottomNavigationDistribution, type BottomNavigationPresentation, type ChipSize, type SelectDensity, type SelectSize, type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, type DialogSize, type IconButtonShape, type IconButtonSize, type IconTone, type IconWeight, type LinkTone, type LinkVariant, type LoadMoreDensity, type ListRowDensity, type MenuDensity, type MenuItemTone, type NoticeTone, type ProgressSize, type ProgressTone, type SearchFieldSize, type SegmentedControlSize, type SelectionControlKind, type SelectionControlPresentation, type SelectionControlSize, type SelectionGroupOrientation, type SelectionGroupPresentation, type SpinnerSize, type SpinnerTone, type StackAxis, type StackGap, type StatisticDensity, type StatisticPresentation, type SwitchSize, type TabSize, type TabsLayout, type TabsOverflow, type TextTone, type ToastPlacement, type ToastTone, type ToastToneMark, } from "./component-recipes.js";
//# sourceMappingURL=recipes.d.ts.map