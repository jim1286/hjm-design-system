import { control, fontWeight, radius, spacing, typography } from "./foundations.js";
/** Small renderer entry point for the three foundational visual recipes. */
export const buttonRecipe = {
    slots: ["root", "face", "side", "leading", "label", "trailing", "spinner"],
    defaults: { tone: "primary", size: "medium", shape: "rounded", align: "center", appearance: "flat" },
    // A solid underside belongs to the button, rather than a product's second press/state engine.
    raised: { depths: { small: 3, medium: 4, large: 5 }, sideShade: 0.25, settleDuration: 120 },
    tones: {
        primary: { background: "primary", content: "onPrimary", border: null, paddingHorizontal: null },
        // The outline is a border role, not a text color. Drawing it in `textSub`
        // made a resting control read heavier than the selected one beside it.
        secondary: { background: "bg", content: "text", border: "borderControl", paddingHorizontal: null },
        ghost: { background: null, content: "textMuted", border: null, paddingHorizontal: null },
        danger: { background: "dangerFill", content: "onDanger", border: null, paddingHorizontal: null },
        // A link-tone control is inline copy, so the size axis' horizontal padding
        // would push it out of alignment with the text around it.
        link: { background: null, content: "contentBrand", border: null, paddingHorizontal: 0 },
    },
    // 2026-10-28: selecting a toggle must preserve its tone's background/border; a second selection plate
    // obscured Spint's already-filled flower. Accessible state and foreground/glyph evidence remain.
    states: {
        selected: { content: "text" },
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
/** Raised paint never adds a frame to a frameless ghost/link action. */
export function resolveButtonDepth(appearance, tone, size) {
    if (appearance !== "flat" && appearance !== "raised")
        throw new TypeError("Unknown Button appearance");
    if (appearance === "flat" || tone === "ghost" || tone === "link")
        return 0;
    return buttonRecipe.raised.depths[size];
}
export function resolveButtonEdgeOverhang(tone, size) {
    const toneContract = buttonRecipe.tones[tone];
    if (toneContract.background !== null || toneContract.border !== null)
        return 0;
    return toneContract.paddingHorizontal ?? buttonRecipe.sizes[size].paddingHorizontal;
}
/** Resolves the label's line cap for one resolved environment. `null` means uncapped. */
export function resolveButtonLabelLines(largeText) {
    return largeText && buttonRecipe.label.liftCapOnLargeText ? null : buttonRecipe.label.maxLines;
}
export const surfaceRecipe = {
    default: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: true,
        clipsContent: true,
    },
    raised: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: true,
        borderAlways: true,
        // An elevated surface must not clip: `overflow: hidden` cuts off its own
        // shadow. Every other tone clips so a child image cannot spill past the
        // rounded corner, which consumers were fixing in product styles.
        clipsContent: false,
    },
    // Resting surfaces keep canvas fills; elevation and borders carry hierarchy.
    // Persistent selection has its own neutral tone below.
    sunken: {
        background: "bg",
        border: "border",
        borderAlpha: 1,
        elevated: false,
        borderAlways: true,
        clipsContent: true,
    },
    accent: {
        background: "bg",
        border: "primary",
        borderAlpha: 1,
        elevated: false,
        borderAlways: true,
        clipsContent: true,
    },
    // Selected cards need their own surface role, without repurposing a brand accent.
    selected: {
        background: "surfaceSelected", border: "borderControl", borderAlpha: 1,
        elevated: false, borderAlways: true, clipsContent: true,
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
        // Input interiors stay on the canvas; focus is conveyed by the blue outline, not a grey or blue fill.
        surface: { background: "bg" },
        inset: { background: "bg" },
    },
    shapes: {
        medium: "md",
        large: "lg",
        full: "full",
    },
    states: {
        idle: { border: "borderControl" },
        focused: { border: "contentBrand" },
        // Error and focus can share a hue in a product palette; thickness keeps validation distinct without color alone.
        invalid: { border: "danger", borderWidth: 2 },
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
        fontWeight: fontWeight.medium,
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
    /**
     * Which slots `disabledOpacity` fades (2026-10-06). Label and control dim; the
     * hint and the error keep their contrast, because they are the text that says
     * why the field is locked or what to fix. Renderers used to fade the whole
     * frame, so the small support text (`support.textVariant`) — already the
     * lowest-contrast text in the field — lost contrast too. Fading nothing was
     * rejected: the label and the control are what tell the user the field is off.
     *
     * Every field-family input follows this scope. The amount is the component
     * recipe's own `states.disabledOpacity` where it has one (SearchField,
     * PasswordField, OtpField, NumberField, Select); otherwise this recipe's
     * `disabledOpacity` (TextField, TextArea, Field, Combobox, DatePicker, TagsInput).
     */
    disabledScope: {
        dimmed: ["label", "control"],
        unchanged: ["hint", "error"],
    },
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