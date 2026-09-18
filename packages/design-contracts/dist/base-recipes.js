import { control, fontWeight, radius, spacing, typography } from "./foundations.js";
/** Small renderer entry point for the three foundational visual recipes. */
export const buttonRecipe = {
    slots: ["root", "leading", "label", "trailing", "spinner"],
    defaults: { tone: "primary", size: "medium", shape: "rounded", align: "center" },
    tones: {
        primary: { background: "primary", content: "onPrimary", border: null, paddingHorizontal: null },
        // The outline is a border role, not a text color. Drawing it in `textSub`
        // made a resting control read heavier than the selected one beside it.
        secondary: { background: "surfaceAlt", content: "text", border: "borderControl", paddingHorizontal: null },
        ghost: { background: null, content: "textMuted", border: null, paddingHorizontal: null },
        danger: { background: "dangerFill", content: "onDanger", border: null, paddingHorizontal: null },
        // A link-tone control is inline copy, so the size axis' horizontal padding
        // would push it out of alignment with the text around it.
        link: { background: null, content: "contentBrand", border: null, paddingHorizontal: 0 },
    },
    /**
     * Visual treatment for a control that is also a toggle. `accessibilityState`
     * / `aria-pressed` already expressed the state; without a paired visual every
     * consumer painted the selected background in product styles.
     */
    states: {
        selected: { background: "surfaceAccent", content: "contentBrand", border: "contentBrand" },
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
    shapes: { rounded: "md", pill: "full" },
    aligns: { center: "center", leading: "flex-start" },
    opacity: { disabled: 0.5, pressed: 0.86 },
    /**
     * 긴 라벨의 처리 규칙. 지금까지 이 판단이 없어서 Web은 무한히 줄바꿈하고 RN은 한 줄로
     * 잘렸다 — 같은 번역문이 두 표면에서 다르게 보였다.
     *
     * 자르지 않고 **두 줄까지 접는다**. 잘린 행동 라벨("삭제하..."))은 무엇을 하는 버튼인지
     * 잃는다. 대신 무제한 줄바꿈도 막는다 — 하단 CTA 행처럼 버튼이 남의 레이아웃을 밀어내는
     * 자리가 있고, 두 줄을 넘는 라벨은 레이아웃이 아니라 카피의 문제다.
     *
     * 큰 글자 설정에서는 상한을 **푼다**. 사용자가 키운 글자에서 두 줄로 자르면 내용이
     * 사라지고, 그건 WCAG 1.4.4를 어긴다. 제품 카피가 아니라 사용자 설정이 원인이기 때문에
     * 같은 규칙을 적용할 수 없다.
     */
    label: { overflow: "wrap", maxLines: 2, liftCapOnLargeText: true },
};
/** Resolves the label's line cap for one resolved environment. `null` means uncapped. */
export function resolveButtonLabelLines(largeText) {
    return largeText && buttonRecipe.label.liftCapOnLargeText ? null : buttonRecipe.label.maxLines;
}
export const surfaceRecipe = {
    default: {
        background: "surface",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: false,
        clipsContent: true,
    },
    raised: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: true,
        borderAlways: false,
        // An elevated surface must not clip: `overflow: hidden` cuts off its own
        // shadow. Every other tone clips so a child image cannot spill past the
        // rounded corner, which consumers were fixing in product styles.
        clipsContent: false,
    },
    // `semanticColors.surface.sunken` already named this role; without a paired
    // tone a consumer had to paint `surfaceAlt` in its own product styles.
    sunken: {
        background: "surfaceAlt",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: false,
        clipsContent: true,
    },
    accent: {
        background: "surfaceAccent",
        border: "primary",
        borderAlpha: 0.3,
        elevated: false,
        borderAlways: false,
        clipsContent: true,
    },
    subtle: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: true,
        clipsContent: true,
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
    defaults: { variant: "surface", shape: "medium", align: "start" },
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
    /**
     * Upper bound for a growing multiline field, expressed in visible lines. A
     * consumer otherwise reaches for `inputStyle={{ maxHeight }}`, which moves a
     * recipe-owned dimension into product code. `null` keeps unbounded growth.
     */
    multilineMaxVisibleLines: null,
    borderWidth: 1,
    focusRingWidth: 2,
    focusRingOffset: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textVariant: "body",
    label: {
        color: "textBody",
        textVariant: "body",
        fontWeight: fontWeight.semibold,
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
/**
 * Renderer-neutral Surface geometry. Tone colors stay in `surfaceRecipe` for
 * compatibility; these axes make the previously implicit Web/Native defaults
 * explicit without changing that public recipe shape.
 */
export const surfaceDefaults = {
    tone: "default",
    padding: "none",
    radius: "lg",
    bordered: false,
};
export const surfaceGeometry = {
    paddings: { none: 0, ...spacing },
    radii: radius,
};
//# sourceMappingURL=base-recipes.js.map