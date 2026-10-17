/** Numeric units are consumed as CSS pixels on web and density-independent points on native. */
export const spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};
/**
 * Ordered fallbacks keep the contract platform-neutral: Web renderers join
 * the list as a CSS stack, while native renderers request the first named
 * family (or their OS default mapping), rather than receiving a CSS stack.
 */
export const fontFamily = {
    // Pretendard is bundled by HJM (Web `@hjmds/react/fonts/pretendard.css`, Native `@hjmds/react-native/fonts`)
    // so every device renders the same face (2026-10-17: Inter/Pretendard were listed but never loaded, so the
    // result depended on what each device had installed). System fonts remain the fallback until it loads.
    ui: [
        "Pretendard Variable",
        "Pretendard",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "sans-serif",
    ],
    // Chrome ignores ui-monospace and cannot address SF Mono as "SFMono-Regular", so name the macOS/
    // Windows monospace faces before the generic fallback (2026-10-17: Chrome rendered code in Courier).
    code: [
        "ui-monospace",
        "SFMono-Regular",
        "SF Mono",
        "Menlo",
        "Monaco",
        "Cascadia Mono",
        "Consolas",
        "Liberation Mono",
        "monospace",
    ],
};
/**
 * Native has no variable-weight selection on every platform, so each weight is its own registered face.
 * Keys match the asset map exported by `@hjmds/react-native/fonts`; 400 doubles as the family name inputs use.
 */
export const pretendardNativeFaces = {
    "400": "Pretendard",
    "500": "Pretendard-Medium",
    "600": "Pretendard-SemiBold",
    "700": "Pretendard-Bold",
    "800": "Pretendard-ExtraBold",
};
/** Nearest bundled face for a CSS/RN font weight ("normal", "bold", 100–900). */
export function resolvePretendardNativeFace(weight) {
    const numeric = weight === undefined || weight === "normal" ? 400 : weight === "bold" ? 700 : Number(weight);
    const steps = [400, 500, 600, 700, 800];
    const nearest = Number.isFinite(numeric) ? steps.reduce((best, step) => Math.abs(step - numeric) < Math.abs(best - numeric) ? step : best, 400) : 400;
    return pretendardNativeFaces[String(nearest)];
}
export function resolveFontFamilyStack(families, role) {
    if (!["ui", "display", "reading", "code"].includes(role))
        throw new TypeError("Unsupported font role");
    // Unspecified reading/display follow the current ui stack, rather than a
    // frozen neutral stack that would silently undo an app's existing ui override.
    return families[role] ?? families.ui;
}
/** String weights translate unchanged to CSS and React Native text styles. */
export const fontWeight = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
};
/** Numeric tracking uses CSS pixels on Web and density-independent points on Native. */
export const letterSpacing = {
    tight: -0.2,
    normal: 0,
    wide: 0.2,
};
/** Renderers map the shared intent to `font-variant-numeric` / `fontVariant`. */
export const numeric = {
    proportional: "proportional-nums",
    tabular: "tabular-nums",
};
export const typography = {
    caption: { fontSize: 11, lineHeight: 16, fontWeight: fontWeight.regular },
    // Label (form labels, section subtitles) stays 500 between body 400 and the titles: at 600 it competed
    // with titles, and Text rendered it 400 outside a profile, too weak against body (2026-10-17 user decision).
    label: { fontSize: 12, lineHeight: 18, fontWeight: fontWeight.medium },
    body: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
    bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
    // Title steps are medium (2026-10-17 user review: 800, then 700, then 600 still read too heavy —
    // "굵기 좀더 줄여").
    title: { fontSize: 18, lineHeight: 26, fontWeight: fontWeight.medium },
    titleLarge: { fontSize: 20, lineHeight: 28, fontWeight: fontWeight.medium },
    // `heading` is the largest text HJM draws. 2026-10-17 user decision ("글자 너무 커", "큰 글자 정책은 없애"):
    // the 40/32 display tier looked far too big on the service-intro screen and was removed; design profiles
    // reject any type step above this size (design-profile.ts `merge`).
    heading: { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.medium },
};
/** Visual variants choose a default family role; semantics and sizes remain independent. */
export function resolveTextFontRole(variant, role) {
    if (role !== undefined) {
        if (!["ui", "display", "reading", "code"].includes(role))
            throw new TypeError("Unsupported font role");
        return role;
    }
    if (variant === "body" || variant === "bodyLarge")
        return "reading";
    if (variant === "title" || variant === "titleLarge" || variant === "heading")
        return "display";
    return "ui";
}
/**
 * Document heading hierarchy without widening the established `TextVariant`
 * union. Every level reuses a semantic text style, so no heading exceeds `typography.heading`.
 */
export const heading = {
    /**
     * @deprecated Same as `level3` since the display tier was removed (2026-10-17 user decision, "큰 글자
     * 정책은 없애"; it was 40/48/600). Kept so existing consumers keep compiling; use `level3`.
     */
    level1: typography.heading,
    /** @deprecated Same as `level3` since the display tier was removed (was 32/40/600); use `level3`. */
    level2: typography.heading,
    level3: typography.heading,
    level4: typography.titleLarge,
    level5: typography.title,
};
/** Glyphs include icons and avatars; they do not inherit paragraph line-height. */
export const glyph = {
    xs: 14,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 44,
    xxxl: 48,
};
export const motion = {
    fast: 120,
    normal: 200,
    slow: 320,
};
/**
 * Curves are stored as normalized cubic-bezier tuples so CSS and native
 * animation drivers can translate the same motion intent without sharing a
 * renderer dependency.
 */
export const easing = {
    standard: [0.2, 0, 0, 1],
    enter: [0, 0, 0, 1],
    exit: [0.3, 0, 1, 1],
    emphasized: [0.2, 0, 0, 1],
};
/** Shared transition intent; renderers translate easing tuples to their animation API. */
export const motionPreset = {
    micro: {
        duration: motion.fast,
        easing: "standard",
        reducedMotion: "instant",
    },
    enter: {
        duration: motion.normal,
        easing: "enter",
        reducedMotion: "opacity",
    },
    exit: {
        duration: motion.fast,
        easing: "exit",
        reducedMotion: "instant",
    },
    context: {
        duration: motion.slow,
        easing: "emphasized",
        reducedMotion: "opacity",
    },
};
/** Native renderers may use these values directly; web renderers use easing. */
export const spring = {
    responsive: { stiffness: 760, damping: 52, mass: 1 },
    expressive: { stiffness: 520, damping: 38, mass: 1 },
};
/** Reusable state strengths. Components still decide which states are valid. */
export const opacity = {
    disabled: 0.5,
    muted: 0.72,
    pressed: 0.86,
    dragged: 0.64,
};
/** Overlaying the content color at these strengths creates predictable states. */
export const stateLayer = {
    hover: 0.06,
    focus: 0.08,
    pressed: 0.1,
    selected: 0.1,
};
export const stroke = {
    subtle: 1,
    default: 1,
    strong: 2,
    focus: 2,
};
export const control = {
    minTouchTarget: 44,
    buttonHeight: {
        small: 36,
        medium: 44,
        large: 52,
    },
    buttonHitSlop: {
        small: 4,
        medium: 0,
        large: 0,
    },
    fieldHeight: 44,
    chipHeight: {
        small: 36,
        medium: 44,
    },
    selectionIndicator: 24,
};
/**
 * Font scale at which components switch to a large-text layout. One decision,
 * previously two literals in `segmentedControlRecipe` and `topBarRecipe`; see
 * issue #20 for why it sits with the tokens instead of beside the scale axis.
 */
export const largeTextThreshold = 1.6;
/** Product renderers may narrow these widths, but should not invent new rhythm. */
export const layout = {
    pagePadding: {
        compact: spacing.md,
        regular: spacing.lg,
        spacious: spacing.xl,
    },
    sectionGap: spacing.xl,
    contentGap: spacing.md,
    rowHeight: {
        singleLine: 56,
        twoLine: 68,
    },
    readingMaxWidth: 720,
    contentMaxWidth: 1200,
};
/** Width thresholds use CSS pixels on Web and density-independent points on Native. */
export const breakpoint = {
    compact: 0,
    medium: 600,
    expanded: 960,
    wide: 1280,
};
/** Shared stacking intent. Values remain sparse to leave room for app layers. */
export const layer = {
    base: 0,
    sticky: 100,
    dropdown: 400,
    overlay: 800,
    modal: 900,
    tooltip: 950,
    toast: 1000,
};
export const overlay = {
    scrim: 0.6,
    veil: 0.25,
};
/** Fixed backdrop contracts avoid renderer-specific names such as CSS `scrim`. */
export const backdrop = {
    modal: { color: "#000000", opacity: overlay.scrim },
    veil: { color: "#000000", opacity: overlay.veil },
};
export const scrim = `rgba(0, 0, 0, ${overlay.scrim})`;
/** Renderers translate this contract to box-shadow or native shadow/elevation properties. */
export const shadow = {
    raised: {
        color: "#000000",
        opacity: 0.08,
        radius: 4,
        offsetY: 1,
    },
    floating: {
        color: "#000000",
        opacity: 0.12,
        radius: 12,
        offsetY: 4,
    },
    overlay: {
        color: "#000000",
        opacity: 0.16,
        radius: 24,
        offsetY: 8,
    },
};
//# sourceMappingURL=foundations.js.map