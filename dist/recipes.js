import { control, radius, spacing, typography } from "./foundations.js";
/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export const buttonRecipe = {
    slots: ["root", "leading", "label", "trailing", "spinner"],
    defaults: { tone: "primary", size: "medium" },
    tones: {
        primary: { background: "primary", content: "onPrimary", border: null },
        secondary: { background: "surfaceAlt", content: "text", border: "border" },
        ghost: { background: null, content: "textMuted", border: null },
        danger: { background: "dangerFill", content: "onDanger", border: null },
        // A region-scoped recovery action ("기록 다시 불러오기" and the like) is not
        // `ghost`: a product author building region-level error recovery found
        // that a muted grey label doesn't read as the way forward, and kept
        // hand-painting `ghost` + brand-colored content at call sites instead
        // (see docs/content-state.md, ContentState scope axis). This tone names
        // that combination once — no plate, no border, brand copy — so the next
        // author has it in the vocabulary instead of reinventing it locally.
        link: { background: null, content: "contentBrand", border: null },
    },
    sizes: {
        small: {
            height: control.buttonHeight.small,
            hitSlop: control.buttonHitSlop.small,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            height: control.buttonHeight.medium,
            hitSlop: control.buttonHitSlop.medium,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
        large: {
            height: control.buttonHeight.large,
            hitSlop: control.buttonHitSlop.large,
            paddingHorizontal: spacing.lg,
            textVariant: "bodyLarge",
        },
    },
    opacity: {
        disabled: 0.5,
        pressed: 0.86,
    },
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
export const surfaceRecipe = {
    default: {
        background: "surface",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: false,
    },
    raised: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: true,
        borderAlways: false,
    },
    accent: {
        background: "surfaceAccent",
        border: "primary",
        borderAlpha: 0.3,
        elevated: false,
        borderAlways: false,
    },
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
    subtle: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: true,
    },
};
export const fieldRecipe = {
    slots: [
        "root",
        "label",
        "control",
        "leading",
        "input",
        "trailing",
        "hint",
        "error",
    ],
    defaults: { variant: "surface", shape: "medium" },
    variants: {
        surface: { background: "surface" },
        inset: { background: "bg" },
    },
    shapes: {
        medium: "md",
        large: "lg",
        full: "full",
    },
    states: {
        idle: { border: "textMuted" },
        focused: { border: "contentBrand" },
        invalid: { border: "danger" },
    },
    minHeight: control.minTouchTarget,
    multilineMinHeight: 80,
    borderWidth: 1,
    focusRingWidth: 2,
    focusRingOffset: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textVariant: "body",
    label: {
        color: "textBody",
        textVariant: "body",
        fontWeight: "600",
        gap: spacing.xs,
    },
    support: {
        hintColor: "textMuted",
        errorColor: "danger",
        textVariant: "label",
        gap: 6,
    },
    placeholder: { color: "textMuted" },
    disabledOpacity: 0.6,
};
export { accordionRecipe, alertDialogRecipe, avatarRecipe, badgeRecipe, bottomNavigationRecipe, bottomCtaRecipe, chipRecipe, comboboxRecipe, counterBadgeRecipe, dialogRecipe, dividerRecipe, emptyStateRecipe, formatCounterBadgeCount, iconButtonRecipe, iconRecipe, linkRecipe, listRecipe, listRowRecipe, loadMoreRecipe, menuRecipe, noticeRecipe, progressRecipe, searchFieldRecipe, selectRecipe, selectionGroupRecipe, sectionRecipe, segmentedControlRecipe, selectionControlRecipe, sheetRecipe, skeletonRecipe, spinnerRecipe, stackRecipe, statisticRecipe, switchRecipe, tabsRecipe, textRecipe, toastRecipe, tooltipRecipe, topBarRecipe, } from "./component-recipes.js";
/*
  Batch 2 저작 모듈의 시각 recipe.

  각 컴포넌트의 계약·recipe·행동을 한 모듈에 자급자족으로 담고, 여기서는 **경로만**
  모은다(`docs/authoring-brief.md`). 여러 저작자가 병렬로 작업할 때 공유 레지스트리를
  각자 고치면 서로의 변경을 덮어쓰므로, 배선은 리드가 한 번에 한다.

  recipe 본문을 `component-recipes.ts`로 옮기지 않는 이유: 그 파일은 이미 1,500줄이 넘고,
  계약(타입·validator·resolver)과 recipe가 **같은 컴포넌트를 두 파일로 갈라** 놓으면
  둘이 어긋날 자리가 생긴다. 한 컴포넌트는 한 모듈에 둔다.
*/
export { breadcrumbRecipe } from "./breadcrumb.js";
export { calendarRecipe } from "./calendar.js";
export { carouselRecipe } from "./carousel.js";
export { commandPaletteRecipe } from "./command-palette.js";
export { dataTableRecipe } from "./data-table.js";
export { transferListRecipe } from "./transfer-list.js";
// floatingActionButtonRecipe는 여기서 재수출하지 않는다. 이 모듈이 buttonRecipe를
// 정의하는데 floating-action-button.ts가 그것을 import하므로, 여기에 `export ... from`을
// 두면 순환이 된다 — ESM은 재수출을 본문보다 먼저 평가해서 buttonRecipe가 아직
// undefined인 채로 그 모듈이 실행된다. catalog.ts가 해당 모듈에서 직접 가져간다.
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
//# sourceMappingURL=recipes.js.map