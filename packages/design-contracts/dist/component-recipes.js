import { collectionItemContract, fieldFrameContract, floatingSurfaceContract, focusIndicatorContract, formSupportContract, } from "./component-contracts.js";
import { backdrop, breakpoint, control, glyph, layer, layout, fontWeight, motion, motionPreset, opacity, radius, spacing, stroke, } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
import { tooltipDescriptorDefaults } from "./tooltip.js";
import { bottomNavigationRecipeDefaults } from "./bottom-navigation-defaults.js";
export { iconButtonRecipe, resolveIconButtonPresentation, } from "./icon-button-recipe.js";
export { counterBadgeDefaults, counterBadgeRecipe, formatCounterBadgeCount, } from "./counter-badge-recipe.js";
export { progressRecipe, } from "./progress-recipe.js";
export const textRecipe = {
    slots: ["root"],
    defaults: { variant: "body", tone: "primary", emphasis: "regular" },
    tones: {
        primary: semanticColors.content.primary,
        body: semanticColors.content.body,
        muted: semanticColors.content.secondary,
        subtle: semanticColors.content.tertiary,
        weak: semanticColors.content.decorative,
        brand: semanticColors.content.brand,
        danger: semanticColors.content.danger,
        inverse: semanticColors.content.inverse,
    },
    emphasis: {
        regular: fontWeight.regular,
        medium: fontWeight.semibold,
        strong: fontWeight.bold,
    },
};
export const iconRecipe = {
    slots: ["root"],
    defaults: {
        size: "md",
        tone: "secondary",
        weight: "regular",
        decorative: true,
    },
    sizes: glyph,
    tones: {
        primary: semanticColors.content.primary,
        secondary: semanticColors.content.secondary,
        decorative: semanticColors.content.decorative,
        brand: semanticColors.content.brand,
        info: semanticColors.feedback.info.foreground,
        success: semanticColors.feedback.success.foreground,
        warning: semanticColors.feedback.warning.foreground,
        danger: semanticColors.content.danger,
        inverse: semanticColors.content.inverse,
    },
    weights: { regular: 2, strong: 2.5 },
    stroke: {
        lineCap: "round",
        lineJoin: "round",
        scaling: "proportional",
    },
};
export const stackRecipe = {
    slots: ["root"],
    defaults: { axis: "block", gap: "md", align: "stretch", justify: "start", wrap: false },
    axes: { block: "column", inline: "row" },
    gaps: spacing,
    align: ["start", "center", "end", "stretch"],
    justify: ["start", "center", "end", "between"],
};
export const linkRecipe = {
    slots: ["root", "leading", "label", "trailing"],
    defaults: { tone: "brand", variant: "inline" },
    tones: {
        brand: semanticColors.content.brand,
        neutral: semanticColors.content.body,
    },
    variants: {
        inline: {
            textVariant: "body",
            fontWeight: fontWeight.semibold,
            underline: "always",
            minHeight: null,
        },
        standalone: {
            textVariant: "body",
            fontWeight: fontWeight.bold,
            underline: "hover",
            minHeight: control.minTouchTarget,
        },
    },
    gap: spacing.xxs,
    icon: { glyph: "xs", inheritsTone: true },
    states: {
        pressedOpacity: opacity.pressed,
        focus: focusIndicatorContract,
    },
};
export const selectionGroupRecipe = {
    slots: ["root", "label", "requiredIndicator", "description", "items", "error"],
    defaults: { orientation: "vertical", presentation: "card" },
    orientations: {
        vertical: {
            direction: "column",
            // `grouped` rows sit flush inside one shared card, so the group owns
            // the only outer radius and the rows share edges instead of floating
            // apart with their own gap — the same shape as `selectionControlRecipe`'s
            // `grouped` presentation, which this gap pairs with.
            gap: { plain: spacing.xxs, card: spacing.xs, grouped: 0 },
        },
        horizontal: {
            direction: "row",
            gap: { plain: spacing.sm, card: spacing.md, grouped: 0 },
        },
    },
    label: formSupportContract.label,
    requiredIndicator: { color: semanticColors.content.danger },
    description: formSupportContract.hint,
    error: formSupportContract.error,
    supportGap: formSupportContract.gap,
    states: { disabledOpacity: opacity.disabled },
};
export const badgeRecipe = {
    slots: ["root", "icon", "label"],
    defaults: { tone: "neutral", size: "medium", variant: "filled" },
    variants: {
        filled: {
            usesToneBackground: true,
            borderFallback: null,
        },
        outline: {
            usesToneBackground: false,
            borderFallback: semanticColors.border.default,
        },
    },
    tones: {
        neutral: {
            content: semanticColors.content.secondary,
            outlineContent: semanticColors.content.secondary,
            background: semanticColors.surface.sunken,
            border: null,
        },
        strong: {
            content: semanticColors.content.inverse,
            outlineContent: semanticColors.content.primary,
            background: semanticColors.content.primary,
            border: null,
        },
        brand: {
            content: semanticColors.content.brand,
            outlineContent: semanticColors.content.brand,
            // The brand tint now means "selected" everywhere (see
            // `selectionControlRecipe`/`segmentedControlRecipe`), so a badge that
            // only labels something — a season, a grade, a question number —
            // cannot wear it: rows of static badges started reading as a filter
            // with one option switched on. The plate goes neutral and the brand
            // stays in the copy.
            background: semanticColors.surface.sunken,
            border: null,
        },
        info: {
            content: semanticColors.feedback.info.foreground,
            outlineContent: semanticColors.feedback.info.foreground,
            background: semanticColors.feedback.info.badgeBackground,
            border: semanticColors.feedback.info.border,
        },
        success: {
            content: semanticColors.feedback.success.foreground,
            outlineContent: semanticColors.feedback.success.foreground,
            background: semanticColors.feedback.success.badgeBackground,
            border: semanticColors.feedback.success.border,
        },
        warning: {
            content: semanticColors.feedback.warning.foreground,
            outlineContent: semanticColors.feedback.warning.foreground,
            background: semanticColors.feedback.warning.badgeBackground,
            border: semanticColors.feedback.warning.border,
        },
        attention: {
            content: semanticColors.feedback.attention.foreground,
            outlineContent: semanticColors.feedback.attention.foreground,
            background: semanticColors.feedback.attention.badgeBackground,
            border: semanticColors.feedback.attention.border,
        },
        danger: {
            content: semanticColors.feedback.danger.foreground,
            outlineContent: semanticColors.feedback.danger.foreground,
            background: semanticColors.feedback.danger.badgeBackground,
            border: semanticColors.feedback.danger.border,
        },
    },
    sizes: {
        small: {
            minHeight: 20,
            paddingHorizontal: spacing.xxs,
            gap: spacing.xxs,
            textVariant: "caption",
        },
        medium: {
            minHeight: 24,
            paddingHorizontal: spacing.xs,
            gap: spacing.xxs,
            textVariant: "caption",
        },
    },
    radius: "full",
    borderWidth: stroke.default,
    fontWeight: fontWeight.bold,
};
/** Search is a field specialization with stable affordance and clear targets. */
export const searchFieldRecipe = {
    slots: ["root", "leading", "input", "trailing", "clear", "spinner"],
    defaults: { size: "medium", shape: "medium" },
    sizes: {
        medium: {
            minHeight: control.minTouchTarget,
            paddingHorizontal: spacing.sm,
            gap: spacing.xs,
            glyph: "sm",
            clearDiameter: 36,
            clearHitSlop: 4,
            textVariant: "body",
        },
        large: {
            minHeight: control.buttonHeight.large,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            glyph: "sm",
            clearDiameter: control.minTouchTarget,
            clearHitSlop: 0,
            textVariant: "bodyLarge",
        },
    },
    colors: {
        background: semanticColors.surface.default,
        content: semanticColors.content.primary,
        placeholder: semanticColors.content.secondary,
        leading: semanticColors.content.decorative,
        clear: semanticColors.content.secondary,
        border: semanticColors.content.secondary,
        focus: focusIndicatorContract.color,
        invalid: semanticColors.border.danger,
    },
    /**
     * 모양은 **축이다** — 값 하나로 못 박지 않는다.
     *
     * 원래 여기는 `radius: "full"` 하나였다. 그런데 `fieldRecipe`는 같은 결정을
     * `shapes: { medium, large, full }` 축으로 열어 두고 있었고, 그래서 **한 앱 안에서
     * 평범한 입력과 찾기 입력이 서로 다른 모양이 되는 것을 계약이 막지 못했다.** 실제로
     * 갈라졌다 — app-rn은 `"md"`로 그리고 있었는데 이 계약은 `"full"`이라고 말하고
     * 있었고, 어느 쪽이 옳은지 양쪽 문서 어디에도 없었다.
     *
     * 찾기 입력이 알약이어야 하는지는 **제품이 정할 일**이고(iOS 관례는 알약, 이 앱은
     * 사각), 계약이 할 일은 그 선택지를 `fieldRecipe`와 **같은 이름으로** 주는 것이다.
     * 그러면 두 입력의 모양을 나란히 맞추는 것과 일부러 다르게 하는 것이 둘 다 표현된다.
     */
    shapes: { medium: "md", large: "lg", full: "full" },
    borderWidth: stroke.default,
    focusRingWidth: focusIndicatorContract.width,
    focusRingOffset: focusIndicatorContract.offset,
    states: {
        disabledOpacity: opacity.disabled,
        pressedOpacity: opacity.pressed,
    },
};
export const chipRecipe = {
    slots: ["root", "leading", "indicator", "label", "trailing"],
    defaults: { size: "small", selected: false },
    sizes: {
        small: {
            height: control.chipHeight.small,
            hitSlop: 4,
            paddingHorizontal: spacing.sm,
            gap: spacing.xxs,
            textVariant: "body",
        },
        medium: {
            height: control.chipHeight.medium,
            hitSlop: 0,
            paddingHorizontal: spacing.md,
            gap: spacing.xs,
            textVariant: "body",
        },
    },
    states: {
        idle: {
            background: semanticColors.surface.default,
            content: semanticColors.content.secondary,
            // A resting chip wears the shared hairline, not a text-strength
            // outline. Drawing it in `content.secondary` made an unselected chip
            // read heavier than the selected one beside it, inverting the one
            // signal that matters in a filter row.
            border: semanticColors.border.default,
        },
        selected: {
            background: semanticColors.surface.brand,
            content: semanticColors.content.brand,
            border: semanticColors.border.focus,
        },
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
    radius: "full",
    borderWidth: stroke.default,
    label: { fontWeight: fontWeight.semibold, selectedFontWeight: fontWeight.bold },
    selectionIndicator: {
        color: semanticColors.content.brand,
        glyph: "xs",
    },
    focus: focusIndicatorContract,
};
export const dividerRecipe = {
    slots: ["root", "label"],
    defaults: { orientation: "horizontal", inset: "none" },
    color: semanticColors.border.default,
    thickness: stroke.subtle,
    insets: {
        none: 0,
        start: spacing.md,
        both: spacing.md,
    },
};
export const listRecipe = {
    slots: ["root", "item", "separator"],
    defaults: { separator: "indented" },
    separators: {
        none: null,
        full: { insetStart: 0, insetEnd: 0 },
        indented: { insetStart: 40 + spacing.sm, insetEnd: 0 },
    },
    background: null,
};
export const listRowRecipe = {
    slots: ["root", "leading", "content", "title", "description", "trailing"],
    defaults: { density: "comfortable", selected: false },
    density: {
        compact: {
            oneLineMinHeight: control.minTouchTarget,
            twoLineMinHeight: 60,
            paddingHorizontal: spacing.xs,
            paddingVertical: spacing.xxs,
        },
        comfortable: {
            oneLineMinHeight: layout.rowHeight.singleLine,
            twoLineMinHeight: layout.rowHeight.twoLine,
            paddingHorizontal: spacing.xs,
            paddingVertical: spacing.xs,
        },
    },
    gap: spacing.sm,
    leadingSize: 40,
    title: { color: semanticColors.content.body, textVariant: "bodyLarge", fontWeight: fontWeight.bold },
    description: { color: semanticColors.content.secondary, textVariant: "body" },
    trailing: {
        textColor: semanticColors.content.secondary,
        iconColor: semanticColors.content.decorative,
        glyph: "sm",
        textVariant: "caption",
    },
    states: {
        pressedBackground: semanticColors.interaction.pressed,
        selectedBackground: semanticColors.surface.brand,
        disabledOpacity: opacity.disabled,
    },
};
export const accordionRecipe = {
    slots: ["root", "item", "header", "trigger", "title", "indicator", "panel", "divider"],
    defaults: { density: "comfortable", allowsMultipleExpanded: false },
    density: {
        compact: { triggerMinHeight: control.minTouchTarget, paddingVertical: spacing.xs },
        comfortable: { triggerMinHeight: layout.rowHeight.singleLine, paddingVertical: spacing.sm },
    },
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    title: { color: semanticColors.content.body, textVariant: "bodyLarge", fontWeight: fontWeight.bold },
    indicator: { color: semanticColors.content.secondary, glyph: "sm" },
    panel: {
        color: semanticColors.content.body,
        textVariant: "body",
        paddingBottom: spacing.md,
        paddingInlineStart: spacing.xs,
    },
    divider: semanticColors.border.default,
    states: {
        pressedBackground: semanticColors.interaction.pressed,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
    transition: motionPreset.enter,
};
export const menuRecipe = {
    slots: [
        "trigger",
        "content",
        "viewport",
        "section",
        "sectionLabel",
        "item",
        "leading",
        "copy",
        "label",
        "description",
        "trailing",
        "shortcut",
        "indicator",
        "dangerIndicator",
        "separator",
    ],
    defaults: { density: "comfortable", itemTone: "neutral" },
    surface: floatingSurfaceContract,
    density: {
        compact: { ...collectionItemContract, minHeight: control.minTouchTarget },
        comfortable: { ...collectionItemContract, minHeight: layout.rowHeight.singleLine },
    },
    tones: {
        neutral: collectionItemContract.label.color,
        danger: collectionItemContract.danger,
    },
    sectionLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    leading: { color: semanticColors.content.secondary, glyph: "sm" },
    shortcut: { color: semanticColors.content.secondary, textVariant: "caption" },
    indicator: { color: collectionItemContract.selectedIndicator, glyph: "sm" },
    separator: semanticColors.border.default,
    dangerIndicator: {
        color: collectionItemContract.danger,
        glyph: "sm",
        mark: "alert",
    },
    minWidth: 220,
    maxWidth: 320,
    maxHeight: 360,
    sideOffset: spacing.xs,
    collisionPadding: spacing.xs,
    states: { disabledOpacity: opacity.disabled },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
/**
 * Select is visually one field plus one collection, even though Web renders
 * the collection in a popover and Native renders it in a modal sheet.
 */
export const selectRecipe = {
    slots: [
        "root",
        "label",
        "trigger",
        "leading",
        "value",
        "placeholder",
        "busyIndicator",
        "indicator",
        "description",
        "error",
        "popover",
        "viewport",
        "section",
        "sectionLabel",
        "option",
        "optionLeading",
        "optionCopy",
        "optionLabel",
        "optionDescription",
        "selectionIndicator",
        "stateMessage",
    ],
    defaults: { size: "medium", density: "comfortable" },
    adaptive: { web: "popover", native: "sheet" },
    frame: fieldFrameContract,
    sizes: {
        medium: {
            minHeight: fieldFrameContract.minHeight,
            paddingHorizontal: fieldFrameContract.paddingHorizontal,
            textVariant: "body",
            glyph: "sm",
        },
        large: {
            minHeight: control.buttonHeight.large,
            paddingHorizontal: spacing.lg,
            textVariant: "bodyLarge",
            glyph: "md",
        },
    },
    support: formSupportContract,
    value: {
        color: semanticColors.content.body,
        placeholderColor: semanticColors.content.secondary,
        gap: spacing.sm,
    },
    leading: { color: semanticColors.content.secondary },
    indicator: { color: semanticColors.content.secondary },
    busyIndicator: { color: semanticColors.content.brand, glyph: "sm" },
    popover: {
        ...floatingSurfaceContract,
        minWidth: 220,
        maxWidth: 420,
        maxHeight: 360,
        sideOffset: spacing.xs,
        collisionPadding: spacing.xs,
    },
    density: {
        compact: { ...collectionItemContract, minHeight: control.minTouchTarget },
        comfortable: { ...collectionItemContract, minHeight: layout.rowHeight.singleLine },
    },
    sectionLabel: {
        color: semanticColors.content.secondary,
        textVariant: "label",
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    optionLeading: { color: semanticColors.content.secondary, glyph: "sm" },
    optionLabel: { fontWeight: fontWeight.semibold, selectedFontWeight: fontWeight.bold },
    selectionIndicator: { color: semanticColors.border.focus, glyph: "sm" },
    stateMessage: {
        color: semanticColors.content.secondary,
        textVariant: "body",
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
    },
    states: {
        hoverBackground: semanticColors.interaction.hover,
        pressedBackground: semanticColors.interaction.pressed,
        focus: focusIndicatorContract,
        invalidBorder: semanticColors.border.danger,
        disabledOpacity: opacity.disabled,
    },
    transition: {
        web: { enter: motionPreset.micro, exit: motionPreset.exit },
        native: { enter: motionPreset.enter, exit: motionPreset.exit },
    },
};
/** Editable input anatomy layered on the exact same collection grammar. */
export const comboboxRecipe = {
    slots: [
        "root",
        "label",
        "field",
        "leading",
        "input",
        "indicator",
        "clear",
        "loadingIndicator",
        "description",
        "error",
        "popover",
        "viewport",
        "section",
        "sectionLabel",
        "option",
        "optionLeading",
        "optionCopy",
        "optionLabel",
        "optionDescription",
        "selectionIndicator",
        "stateMessage",
    ],
    defaults: selectRecipe.defaults,
    adaptive: selectRecipe.adaptive,
    frame: selectRecipe.frame,
    sizes: selectRecipe.sizes,
    support: selectRecipe.support,
    input: selectRecipe.value,
    leading: selectRecipe.leading,
    indicator: selectRecipe.indicator,
    clear: {
        diameter: control.buttonHeight.small,
        hitSlop: control.buttonHitSlop.small,
        glyph: "xs",
        color: semanticColors.content.secondary,
    },
    loadingIndicator: { color: semanticColors.content.brand, glyph: "sm" },
    popover: selectRecipe.popover,
    density: selectRecipe.density,
    sectionLabel: selectRecipe.sectionLabel,
    optionLeading: selectRecipe.optionLeading,
    optionLabel: selectRecipe.optionLabel,
    selectionIndicator: selectRecipe.selectionIndicator,
    stateMessage: selectRecipe.stateMessage,
    states: selectRecipe.states,
    transition: selectRecipe.transition,
};
export const segmentedControlRecipe = {
    slots: ["root", "item", "label", "indicator"],
    defaults: { size: "medium" },
    adaptive: {
        // Equal-width rows stop being comparable when every short label wraps one
        // Hangul syllable per line. Native renderers stack the options before that
        // point so each choice remains a readable phrase and a 44pt target.
        largeTextLayout: "stacked",
        stackAtFontScale: 1.6,
    },
    /**
     * A recessed track with a raised white thumb. The fills used to be
     * inverted — a white track with a canvas-coloured selected segment — so the
     * chosen option read as the recessed, disabled-looking one. `surface.sunken`
     * is too close to white to carry the step, so the track takes the canvas
     * tone and a border keeps the control legible when it sits on that canvas.
     */
    container: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: stroke.subtle,
        radius: "lg",
        padding: spacing.xxs,
        gap: spacing.xxs,
    },
    sizes: {
        small: {
            minHeight: 36,
            hitSlop: 4,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            minHeight: control.minTouchTarget,
            hitSlop: 0,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
    },
    item: {
        radius: "md",
        gap: spacing.xxs,
        idleContent: semanticColors.content.secondary,
        fontWeight: fontWeight.semibold,
        // "Selected" is the brand tint, not a plain raised plate — a raised
        // white segment beside a selected brand-tinted chip spoke two different
        // visual languages for the same state. `surface.brand` is also the one
        // *opaque* brand role: a product author who tried a translucent wash of
        // `primary` here instead (same idea, see
        // `selectionControlRecipe.states.selectedBackground` below) found it
        // changed value with whatever sat behind it — #E8EFFB on a white card,
        // #DCE5F3 on the canvas — so the same "selected" read as three different
        // colors. Using the opaque tint keeps it one color everywhere.
        selectedBackground: semanticColors.surface.brand,
        selectedContent: semanticColors.content.brand,
        /**
         * The ring stays the selection signal so the control keeps a non-text
         * contrast of at least 3:1; a fill-only thumb cannot reach that against a
         * neutral track.
         */
        selectedBorder: semanticColors.border.focus,
        selectedBorderWidth: stroke.strong,
        selectedFontWeight: fontWeight.bold,
        focusRing: semanticColors.border.focus,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
};
export const switchRecipe = {
    slots: ["root", "track", "thumb", "label", "description"],
    defaults: { size: "medium" },
    sizes: {
        small: { width: 44, height: 26, thumb: 22, inset: 2 },
        medium: { width: 52, height: 32, thumb: 28, inset: 2 },
    },
    colors: {
        trackOff: semanticColors.surface.sunken,
        trackOffBorder: semanticColors.content.secondary,
        trackOn: semanticColors.content.brand,
        trackOnBorder: semanticColors.border.focus,
        thumbOff: semanticColors.canvas,
        thumbOffBorder: semanticColors.content.secondary,
        thumbOn: semanticColors.canvas,
        // A disabled switch still has to report what it is set to, so disabled
        // state changes hue instead of fading uniformly with `states.disabledOpacity`
        // — a product author found that a flat opacity made "on" and "off" nearly
        // identical, turning a saved setting unreadable while its backing request
        // was in flight. The on track keeps a recognisable (if muted) brand wash,
        // the off track and both thumbs drop to neutral tones, and every part
        // keeps a hairline border so the shape stays legible at reduced contrast.
        trackOffDisabled: semanticColors.border.default,
        trackOffBorderDisabled: semanticColors.border.default,
        trackOnDisabled: { ...semanticColors.content.brand, alpha: 0.38 },
        trackOnBorderDisabled: { ...semanticColors.content.brand, alpha: 0.38 },
        thumbDisabled: semanticColors.canvas,
        thumbDisabledBorder: semanticColors.content.decorative,
    },
    states: {
        disabledOpacity: opacity.disabled,
        pressedOpacity: opacity.pressed,
    },
    rowMinHeight: control.minTouchTarget,
    // A switch with a description is a two-line row like any other list row,
    // and a product author found that letting content decide the height gave
    // neighbouring rows different heights — this pins it to the same value as
    // `listRowRecipe.density.comfortable.twoLineMinHeight`.
    rowTwoLineMinHeight: 68,
};
export const selectionControlRecipe = {
    slots: [
        "root",
        "control",
        "indicator",
        "leading",
        "content",
        "label",
        "description",
    ],
    defaults: { kind: "checkbox", size: "medium", presentation: "card" },
    sizes: {
        small: {
            rowMinHeight: control.minTouchTarget,
            control: 20,
            hitSlop: 12,
            glyph: "xs",
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            labelVariant: "label",
            descriptionVariant: "caption",
        },
        medium: {
            rowMinHeight: layout.rowHeight.singleLine,
            control: control.selectionIndicator,
            hitSlop: 10,
            glyph: "sm",
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            labelVariant: "body",
            descriptionVariant: "label",
        },
    },
    shapes: { checkbox: "sm", radio: "full" },
    presentations: {
        plain: {
            background: null,
            border: null,
            borderWidth: 0,
            radius: "md",
            useSizePadding: false,
            labelColor: null,
        },
        card: {
            background: semanticColors.surface.default,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            radius: "md",
            useSizePadding: true,
            labelColor: null,
        },
        // A row inside a card shared by the whole group (paired with
        // `selectionGroupRecipe.orientations.*.gap.grouped`). The item owns its
        // own padding so the selected fill runs the full width of the group, and
        // only the first and last rows round — an item-level radius on every row
        // left a visible white sliver in the group's corners. `labelColor` is
        // pinned here (rather than left to the row) because a grouped row's
        // label sits directly on the shared card background, not on its own
        // plate — the row needs to know the label reads correctly there.
        grouped: {
            background: null,
            border: null,
            borderWidth: 0,
            radius: "lg",
            useSizePadding: true,
            labelColor: semanticColors.content.primary,
        },
    },
    label: {
        color: semanticColors.content.body,
        fontWeight: fontWeight.semibold,
        checkedFontWeight: fontWeight.bold,
    },
    leading: { size: "md", color: semanticColors.content.secondary },
    description: { color: semanticColors.content.secondary },
    indicators: {
        checkbox: { checked: "check", mixed: "dash" },
        radio: { checked: "dot", mixed: null },
    },
    radioDotRatio: 0.42,
    states: {
        idleBackground: semanticColors.canvas,
        idleBorder: semanticColors.content.secondary,
        checkedBackground: semanticColors.action.brand.background,
        checkedBorder: semanticColors.border.focus,
        indicator: semanticColors.action.brand.content,
        // The brand tint is one opaque role, not a translucent wash. A product
        // author found that a 10% wash of `primary` (the previous value here)
        // changed value with whatever sat behind it — #E8EFFB on a white card,
        // #DCE5F3 on the canvas — so the same "selected" read as three different
        // colors. `surface.brand` is the one opaque fill (same fix, same reason,
        // as `segmentedControlRecipe.item.selectedBackground` above).
        selectedBackground: semanticColors.surface.brand,
        selectedBorder: semanticColors.border.focus,
        hoverBackground: semanticColors.interaction.hover,
        pressedBackground: semanticColors.interaction.pressed,
        invalidBorder: semanticColors.border.danger,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
/**
 * Persistent top-level navigation. The recipe reserves an optional center gap
 * for a sibling primary action but never treats that action as a destination.
 */
export const bottomNavigationRecipe = {
    slots: [
        "root",
        "surface",
        "list",
        "item",
        "indicator",
        "icon",
        "label",
        "badge",
    ],
    defaults: bottomNavigationRecipeDefaults,
    adaptive: {
        web: "fixed-compact-viewport",
        native: "navigator-tab-bar",
    },
    presentations: {
        bar: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            borderEdges: ["block-start"],
            radius: null,
            shadow: null,
            maxWidth: null,
            outerPaddingHorizontal: 0,
            outerPaddingTop: 0,
        },
        floating: {
            background: semanticColors.canvas,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            borderEdges: ["all"],
            radius: "xl",
            shadow: floatingSurfaceContract.shadow,
            maxWidth: 384,
            outerPaddingHorizontal: spacing.md,
            outerPaddingTop: spacing.xs,
        },
    },
    distributions: {
        equal: { centerGap: 0, requiresEvenItemCount: false },
        "center-gap": {
            centerGap: control.buttonHeight.large + spacing.md,
            requiresEvenItemCount: true,
        },
    },
    density: {
        compact: {
            itemMinWidth: 52,
            itemMinHeight: 52,
            padding: spacing.xxs,
            gap: 2,
            icon: "sm",
            label: "caption",
        },
        regular: {
            itemMinWidth: 56,
            itemMinHeight: 64,
            padding: spacing.xs,
            gap: spacing.xxs,
            icon: "md",
            label: "caption",
        },
    },
    colors: {
        idle: semanticColors.content.secondary,
        selectedIcon: semanticColors.content.brand,
        selectedLabel: semanticColors.content.brand,
    },
    /**
     * Stable icon/badge layout anchor. Selection never paints this slot as a
     * pill: the icon and label below own the non-color selected evidence.
     */
    indicator: {
        minWidth: 40,
        minHeight: 28,
        radius: "full",
        visual: "none",
        background: null,
        border: null,
        borderWidth: 0,
    },
    icon: {
        /**
         * Adapters apply at least one supported emphasis. Stroke-oriented glyphs
         * use strokeWidth; renderers without stroke control use scale instead.
         */
        selectedEmphasis: {
            minimumAdaptations: 1,
            strokeWidth: { idle: stroke.strong, selected: 3 },
            scale: { idle: 1, selected: 1.06 },
        },
    },
    label: {
        fontWeight: fontWeight.semibold,
        selectedFontWeight: fontWeight.bold,
        textAlign: "center",
        wrap: true,
        fixedLines: null,
    },
    badge: {
        size: "small",
        variant: "floating",
        anchor: { blockStart: -spacing.xxs, inlineEnd: -spacing.xs },
        subtreeHiddenFromAccessibility: true,
    },
    safeArea: {
        mode: "additive",
        minimumBottomPadding: spacing.xs,
    },
    keyboard: { defaultBehavior: "hide", movesAboveKeyboard: false },
    largeText: {
        allowFontScaling: true,
        // Persistent navigation has to keep every destination visible at once.
        // Let labels respond to Dynamic Type, but cap the visual chrome before a
        // three-character destination turns into a three-line column. The full,
        // uncapped label remains the item's accessible name.
        maxFontSizeMultiplier: 1.4,
        fixedItemHeight: false,
        labelWraps: true,
    },
    direction: {
        itemOrder: "logical",
        badgeAnchor: "inline-end",
    },
    states: {
        hoverBackground: semanticColors.interaction.hover,
        pressedBackground: semanticColors.interaction.pressed,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
        selectedNonColorEvidence: {
            target: "icon-and-label",
            label: "font-weight",
            icon: "emphasis",
        },
        selectedFocusSeparation: {
            selectedTarget: "icon-and-label",
            focusTarget: "item",
            minimumGap: focusIndicatorContract.offset,
        },
    },
    transition: motionPreset.micro,
};
export const tabsRecipe = {
    slots: ["root", "list", "tab", "label", "indicator", "panel"],
    defaults: { size: "medium", layout: "content", overflow: "scroll" },
    sizes: {
        small: {
            minHeight: control.minTouchTarget,
            paddingHorizontal: spacing.sm,
            textVariant: "label",
        },
        medium: {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            textVariant: "body",
        },
    },
    colors: {
        idle: semanticColors.content.secondary,
        selected: semanticColors.content.primary,
        indicator: semanticColors.border.focus,
        divider: semanticColors.border.default,
    },
    gap: spacing.xs,
    icon: { glyph: "xs" },
    label: { fontWeight: fontWeight.semibold, selectedFontWeight: fontWeight.bold },
    layouts: {
        content: { fitted: false },
        fitted: { fitted: true },
    },
    overflow: {
        scroll: { scrollable: true, wrap: false },
        clip: { scrollable: false, wrap: false },
    },
    indicatorHeight: stroke.strong,
    states: {
        pressedBackground: semanticColors.interaction.pressed,
        focus: focusIndicatorContract,
        disabledOpacity: opacity.disabled,
    },
};
export const noticeRecipe = {
    slots: ["root", "icon", "content", "title", "description", "action"],
    defaults: { tone: "info" },
    tones: {
        ...semanticColors.feedback,
        info: {
            ...semanticColors.feedback.info,
            // The informational wash landed bluer and darker than the selection
            // tint itself over canvas, so a banner outranked the control the
            // reader was supposed to act on. `info` alone goes neutral — its
            // accent stays in the icon, the title, and the border; `success`/
            // `warning`/`attention`/`danger` keep the tinted surface because a
            // product author confirmed those readings didn't have the same
            // conflict with a selection state.
            background: semanticColors.surface.sunken,
        },
    },
    radius: "md",
    padding: spacing.md,
    gap: spacing.sm,
    contentGap: spacing.xxs,
    iconSize: "sm",
    borderWidth: stroke.default,
    title: { textVariant: "body", fontWeight: fontWeight.bold },
    description: { color: semanticColors.content.body, textVariant: "body" },
};
export const skeletonRecipe = {
    slots: ["root"],
    defaults: { shape: "block", animated: false },
    background: semanticColors.surface.sunken,
    shapes: {
        block: { radius: "md", defaultHeight: spacing.xxl },
        text: { radius: "sm", defaultHeight: spacing.md },
        circle: { radius: "full", defaultHeight: glyph.xxl },
    },
    animation: {
        duration: motion.slow * 4,
        easing: "standard",
        fromOpacity: 0.56,
        toOpacity: 1,
        reducedMotion: "static",
    },
};
export const emptyStateRecipe = {
    slots: ["root", "icon", "title", "description", "action"],
    defaults: { density: "regular" },
    density: {
        compact: { paddingVertical: spacing.xl },
        regular: { paddingVertical: spacing.xxxl },
    },
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    icon: { size: "lg", color: semanticColors.content.decorative },
    title: { textVariant: "body", color: semanticColors.content.primary, fontWeight: fontWeight.semibold },
    description: { textVariant: "label", color: semanticColors.content.secondary },
};
export const spinnerRecipe = {
    slots: ["root"],
    defaults: { size: "medium", tone: "brand" },
    sizes: { small: glyph.xs, medium: glyph.sm, large: glyph.lg },
    tones: {
        brand: semanticColors.content.brand,
        neutral: semanticColors.content.secondary,
        inverse: semanticColors.content.inverse,
    },
    strokeWidth: stroke.strong,
    animation: {
        duration: 800,
        easing: "standard",
        reducedMotion: "static",
    },
};
export const loadMoreRecipe = {
    slots: [
        "root",
        "status",
        "spinner",
        "trigger",
        "error",
        "retry",
        "end",
    ],
    defaults: { mode: "automatic", density: "regular" },
    density: {
        compact: { paddingVertical: spacing.sm, gap: spacing.xs },
        regular: { paddingVertical: spacing.lg, gap: spacing.sm },
    },
    status: {
        color: semanticColors.content.secondary,
        textVariant: "label",
    },
    error: {
        color: semanticColors.content.danger,
        textVariant: "label",
    },
    end: {
        color: semanticColors.content.secondary,
        textVariant: "caption",
    },
    trigger: {
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.md,
        radius: "md",
        color: semanticColors.content.brand,
        textVariant: "label",
        fontWeight: fontWeight.bold,
    },
    spinner: { size: "small", tone: "brand" },
    states: {
        focus: focusIndicatorContract,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
};
export const avatarRecipe = {
    slots: ["root", "image", "fallback", "badge"],
    defaults: { size: "medium", shape: "circle" },
    sizes: { small: 32, medium: 40, large: 48, xlarge: 64 },
    shapes: { rounded: "md", circle: "full" },
    background: semanticColors.surface.sunken,
    content: semanticColors.content.secondary,
    border: semanticColors.border.default,
};
export const statisticRecipe = {
    slots: [
        "group",
        "root",
        "label",
        "valueRow",
        "prefix",
        "value",
        "suffix",
        "trend",
        "trendMark",
        "hint",
    ],
    defaults: { density: "comfortable", presentation: "plain", columns: 3 },
    density: {
        compact: {
            padding: spacing.sm,
            gap: spacing.xxs,
            labelVariant: "caption",
            valueVariant: "title",
        },
        comfortable: {
            padding: spacing.md,
            gap: spacing.xs,
            labelVariant: "label",
            valueVariant: "heading",
        },
    },
    presentations: {
        plain: { background: null, border: null, borderWidth: 0, radius: "md" },
        surface: {
            background: semanticColors.surface.default,
            border: semanticColors.border.default,
            borderWidth: stroke.default,
            radius: "md",
        },
    },
    group: {
        gap: spacing.xs,
        minItemWidth: 120,
        columns: [1, 2, 3, 4],
    },
    label: {
        color: semanticColors.content.secondary,
        fontWeight: fontWeight.semibold,
    },
    value: {
        color: semanticColors.content.primary,
        fontWeight: fontWeight.heavy,
        numericVariant: "tabular",
        maxLines: null,
    },
    affix: {
        color: semanticColors.content.body,
        textVariant: "body",
        fontWeight: fontWeight.semibold,
    },
    hint: {
        color: semanticColors.content.secondary,
        textVariant: "caption",
    },
    trend: {
        textVariant: "caption",
        fontWeight: fontWeight.bold,
        gap: spacing.xxs,
        marks: {
            up: "trendUp",
            down: "trendDown",
            flat: "trendFlat",
        },
        tones: {
            neutral: semanticColors.content.secondary,
            success: semanticColors.feedback.success.foreground,
            warning: semanticColors.feedback.warning.foreground,
            danger: semanticColors.content.danger,
        },
    },
};
export const sheetRecipe = {
    slots: ["backdrop", "positioner", "content", "handle", "header", "title", "body", "footer", "close"],
    defaults: { placement: "bottom" },
    backdrop: backdrop.modal,
    content: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: floatingSurfaceContract.borderWidth,
        radius: "xl",
        shadow: floatingSurfaceContract.shadow,
        maxHeightRatio: 0.9,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    web: { maxWidth: 640 },
    safeArea: {
        edge: "bottom",
        mode: "additive",
        minimumPadding: spacing.sm,
    },
    handle: {
        width: 36,
        height: 4,
        radius: "full",
        color: semanticColors.content.secondary,
        visibleByDefault: false,
        showWhen: "swipe-dismiss-enabled",
    },
    header: { minHeight: control.minTouchTarget, gap: spacing.sm },
    title: {
        color: semanticColors.content.primary,
        textVariant: "title",
        fontWeight: fontWeight.bold,
        gap: spacing.xxs,
    },
    body: {
        color: semanticColors.content.body,
        textVariant: "body",
        gap: spacing.md,
    },
    footer: {
        color: semanticColors.content.body,
        textVariant: "body",
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
export const dialogRecipe = {
    slots: ["backdrop", "positioner", "content", "header", "title", "description", "body", "footer", "close"],
    defaults: { size: "medium", dismissible: true },
    sizes: {
        small: { maxWidth: 320, padding: spacing.lg },
        medium: { maxWidth: 420, padding: spacing.xl },
        large: { maxWidth: 640, padding: spacing.xl },
    },
    backdrop: backdrop.modal,
    content: {
        background: semanticColors.canvas,
        border: semanticColors.border.default,
        borderWidth: floatingSurfaceContract.borderWidth,
        radius: "lg",
        gap: spacing.md,
        shadow: floatingSurfaceContract.shadow,
    },
    transition: { enter: motionPreset.enter, exit: motionPreset.exit },
};
export const alertDialogRecipe = {
    slots: [
        "backdrop",
        "positioner",
        "content",
        "icon",
        "title",
        "description",
        "status",
        "error",
        "actions",
        "cancel",
        "confirm",
    ],
    defaults: { tone: "attention", size: "small" },
    sizes: dialogRecipe.sizes,
    backdrop: dialogRecipe.backdrop,
    content: dialogRecipe.content,
    tones: {
        attention: {
            icon: semanticColors.feedback.attention.foreground,
            iconBackground: semanticColors.feedback.attention.background,
            confirm: semanticColors.action.brand.background,
            confirmContent: semanticColors.action.brand.content,
        },
        danger: {
            icon: semanticColors.content.danger,
            iconBackground: semanticColors.feedback.danger.background,
            confirm: semanticColors.action.danger.background,
            confirmContent: semanticColors.action.danger.content,
        },
    },
    icon: { containerSize: control.minTouchTarget, glyph: "md", radius: "full" },
    title: {
        color: semanticColors.content.primary,
        textVariant: "title",
        fontWeight: fontWeight.bold,
    },
    description: {
        color: semanticColors.content.secondary,
        textVariant: "body",
    },
    error: formSupportContract.error,
    actions: {
        gap: spacing.sm,
        stackBelow: breakpoint.medium,
        minButtonWidth: 96,
    },
    transition: dialogRecipe.transition,
};
export const toastRecipe = {
    slots: [
        "viewport",
        "root",
        "toneMark",
        "icon",
        "content",
        "title",
        "description",
        "action",
        "close",
    ],
    defaults: { tone: "neutral", placement: "bottom", durationMs: 5000 },
    adaptive: { web: "fixed-viewport", native: "safe-area-overlay" },
    viewport: {
        layer: layer.toast,
        gap: spacing.sm,
        inset: spacing.md,
        maxWidth: 420,
        safeAreaMode: "additive",
    },
    placements: {
        top: { blockEdge: "top", inlineEdge: "center", stackFrom: "top" },
        "top-start": { blockEdge: "top", inlineEdge: "start", stackFrom: "top" },
        "top-end": { blockEdge: "top", inlineEdge: "end", stackFrom: "top" },
        bottom: { blockEdge: "bottom", inlineEdge: "center", stackFrom: "bottom" },
        "bottom-start": { blockEdge: "bottom", inlineEdge: "start", stackFrom: "bottom" },
        "bottom-end": { blockEdge: "bottom", inlineEdge: "end", stackFrom: "bottom" },
    },
    tones: {
        neutral: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.content.secondary,
            mark: "notifications",
        },
        info: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.info.foreground,
            mark: "info",
        },
        success: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.success.foreground,
            mark: "success",
        },
        warning: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.feedback.warning.foreground,
            mark: "warning",
        },
        danger: {
            foreground: semanticColors.content.primary,
            accent: semanticColors.content.danger,
            mark: "alert",
        },
    },
    surface: {
        background: semanticColors.canvas,
        border: semanticColors.border.strong,
        borderWidth: stroke.default,
        radius: "md",
        shadow: floatingSurfaceContract.shadow,
        minHeight: layout.rowHeight.singleLine,
        padding: spacing.md,
        gap: spacing.sm,
        maxWidth: 420,
    },
    toneMark: { width: stroke.strong, radius: "full" },
    icon: { glyph: "sm" },
    content: { gap: spacing.xxs },
    title: {
        color: semanticColors.content.primary,
        textVariant: "body",
        fontWeight: fontWeight.bold,
    },
    description: {
        color: semanticColors.content.body,
        textVariant: "body",
    },
    action: {
        color: semanticColors.content.brand,
        textVariant: "body",
        fontWeight: fontWeight.bold,
        minHeight: control.minTouchTarget,
        paddingHorizontal: spacing.xs,
    },
    close: {
        color: semanticColors.content.secondary,
        diameter: control.minTouchTarget,
        glyph: "xs",
    },
    states: {
        pressedOpacity: opacity.pressed,
        draggedOpacity: opacity.dragged,
        focus: focusIndicatorContract,
    },
    gesture: { dismissThreshold: 50 },
    transition: {
        web: { enter: motionPreset.micro, exit: motionPreset.exit },
        native: { enter: motionPreset.enter, exit: motionPreset.exit },
    },
};
export const tooltipRecipe = {
    slots: ["provider", "trigger", "content", "arrow"],
    defaults: tooltipDescriptorDefaults,
    layer: layer.tooltip,
    surface: {
        ...floatingSurfaceContract,
        background: semanticColors.content.primary,
        border: semanticColors.content.primary,
        radius: "sm",
        padding: spacing.xs,
    },
    content: {
        color: semanticColors.canvas,
        textVariant: "label",
        maxWidth: 280,
    },
    arrow: {
        width: 10,
        height: 5,
        color: semanticColors.content.primary,
        padding: spacing.xs,
    },
    positioning: {
        sideOffset: spacing.xxs,
        collisionPadding: spacing.sm,
    },
    transition: { enter: motionPreset.micro, exit: motionPreset.exit },
};
export const topBarRecipe = {
    slots: [
        "root",
        "leading",
        "title",
        "titleLeading",
        "titleAction",
        "trailing",
        "action",
        "actionLabel",
    ],
    defaults: { centered: true },
    minHeight: control.buttonHeight.large,
    sideMinWidth: control.minTouchTarget,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    largeTextThreshold: 1.6,
    title: { textVariant: "bodyLarge", color: semanticColors.content.primary, fontWeight: fontWeight.bold },
    titleAction: {
        minHeight: control.minTouchTarget,
        minWidth: control.minTouchTarget,
        gap: spacing.xs,
        pressedOpacity: opacity.pressed,
    },
    action: {
        minHeight: control.minTouchTarget,
        minWidth: control.minTouchTarget,
        gap: spacing.xxs,
        paddingHorizontal: spacing.xxs,
        pressedOpacity: opacity.pressed,
        disabledOpacity: opacity.disabled,
    },
    actionLabel: {
        textVariant: "caption",
        color: semanticColors.content.primary,
        fontWeight: fontWeight.medium,
    },
    background: semanticColors.canvas,
};
export const bottomCtaRecipe = {
    slots: ["root", "description", "secondaryAction", "primaryAction"],
    minHeight: 64,
    paddingHorizontal: layout.pagePadding.regular,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    // A footer painted in the canvas tone left only a 1pt hairline between it
    // and the content scrolling underneath — a product author found that the
    // line cut a glyph in half at whatever scroll position the reader stopped
    // at, reading as a broken card rather than a footer. Layering by surface
    // (one step up from canvas) instead of by shadow alone is how this
    // component builds the separation; `shadow` below is reserved for the one
    // case that still needs it — see its comment.
    background: semanticColors.surface.default,
    border: semanticColors.border.default,
    borderWidth: stroke.default,
    // The cut described above is the scroll viewport's edge, not a spacing
    // problem — content clips mid-glyph, and a hairline between two
    // similarly-light planes can't carry that on its own. The footer casts
    // upward instead: the one case where a shadow, rather than a surface step,
    // is the right tool, because the footer genuinely overlaps the content
    // beneath it.
    shadow: {
        color: "#000000",
        opacity: 0.08,
        radius: 8,
        offsetY: -2,
        elevation: 8,
    },
};
export const sectionRecipe = {
    slots: ["root", "header", "copy", "title", "description", "action", "content"],
    gap: spacing.xs,
    headerGap: spacing.sm,
    copyGap: spacing.xxs,
    title: { textVariant: "title", color: semanticColors.content.body, fontWeight: fontWeight.bold },
    description: { textVariant: "caption", color: semanticColors.content.secondary },
};
//# sourceMappingURL=component-recipes.js.map