import { control } from "./foundations.js";
export type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent" | "subtle";
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
        readonly link: {
            readonly background: null;
            readonly content: "contentBrand";
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
/**
 * `borderAlways` tells the renderer whether this tone's border is mandatory
 * or only a fallback the call site can opt into (e.g. a `bordered` prop). It
 * is `false` on `default`/`raised`/`accent`: none of the three needs a drawn
 * edge to read as a distinct surface — `raised` has its own elevation shadow,
 * `accent` has the tint itself, and `default` is usually read against a
 * differently-toned parent. Whether the edge is still worth drawing in a
 * given layout is a per-instance call, not something the tone should force.
 * A fourth, product-local tone (`subtle`, in this app's `surfaces.ts`) is the
 * one case that *does* need the border unconditionally — it fills with the
 * canvas tone, so on the canvas itself the hairline is the only thing that
 * still marks it as a bounded panel.
 */
export declare const surfaceRecipe: {
    readonly default: {
        readonly background: "surface";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: false;
        readonly borderAlways: false;
    };
    readonly raised: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: true;
        readonly borderAlways: false;
    };
    readonly accent: {
        readonly background: "surfaceAccent";
        readonly border: "primary";
        readonly borderAlpha: 0.3;
        readonly elevated: false;
        readonly borderAlways: false;
    };
    /**
     * 알리는 면(설명 배너, 등급 판, 조용한 콜아웃)의 자리.
     *
     * 브랜드 틴트가 **"선택됨"만** 뜻하게 되면서 이 면들이 집을 잃었다 — `accent`는 이제
     * 쓸 수 없고, `default`는 흰 그룹 안에서 보이지 않고, `raised`는 자기와 같은 색인
     * 캔버스 위에서 사라진다.
     *
     * `subtle`이 그 집이다. 캔버스 색으로 채우고 **헤어라인을 항상 그린다**(그래서
     * `borderAlways: true`가 이 variant의 요점이다). 흰 그룹 위에서는 채움만으로
     * 구별되고(**1.10:1** 채움, **1.23:1** 테두리), 캔버스 위에서는 채움이 같아지는 대신
     * 헤어라인이 형태를 진다. app-rn의 연결 행 아이콘 웰이 같은 이유로 같은 해법을 쓴다.
     */
    readonly subtle: {
        readonly background: "bg";
        readonly border: "border";
        readonly borderAlpha: 1;
        readonly elevated: false;
        readonly borderAlways: true;
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
export { breadcrumbRecipe } from "./breadcrumb.js";
export { calendarRecipe } from "./calendar.js";
export { carouselRecipe } from "./carousel.js";
export { commandPaletteRecipe } from "./command-palette.js";
export { dataTableRecipe } from "./data-table.js";
export { transferListRecipe } from "./transfer-list.js";
export { tourRecipe } from "./tour.js";
export { layoutRecipe } from "./layout.js";
export { otpFieldRecipe } from "./otp-field.js";
export { passwordFieldRecipe } from "./password-field.js";
export { splitterRecipe } from "./splitter.js";
export { datePickerRecipe } from "./date-picker.js";
export { descriptionListRecipe } from "./description-list.js";
export { filePickerRecipe } from "./file-picker.js";
export { formRecipe } from "./form.js";
export { imageRecipe } from "./image.js";
export { numberFieldRecipe } from "./number-field.js";
export { paginationRecipe } from "./pagination.js";
export { popoverRecipe } from "./popover.js";
export { resultRecipe } from "./result.js";
export { sliderRecipe } from "./slider.js";
export { stepsRecipe } from "./steps.js";
export { tagRecipe } from "./tag.js";
export { sidePanelRecipe } from "./side-panel.js";
export { timelineRecipe } from "./timeline.js";
export { treeRecipe } from "./tree.js";
export { uploadItemRecipe } from "./upload-item.js";
//# sourceMappingURL=recipes.d.ts.map