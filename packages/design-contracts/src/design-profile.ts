import { THEMES, type ResolvedTheme, type ThemeColors } from "./colors.js";
import { radius, fontFamily, typography, heading, shadow, fontWeight, type FontWeightValue, type FontFamilyRoles } from "./foundations.js";
import { checkPaletteContrast, resolveSurfaceFillOpacity } from "./palette-contrast.js";
import { resolveEffectSurface, type EffectSurfaceDescriptor } from "./effect-surface.js";
import type { ContentTransitionPreset } from "./content-transition.js";

/** A product chooses one portable profile; the renderer owns each host translation.
 * Keep business state/callbacks outside it so a visual change cannot replace a draft.
 * See docs/design-profile.md for the staged renderer integration and coverage limits. */
export type HjmDesignPreset = "neutral" | "retro" | "paper" | "forest" | "minimal" | "editorial" | "brutalist" | "glass" | "aurora" | "terminal" | "clay";
type RadiusTokens = Readonly<Record<keyof typeof radius, number>>;
type TypeToken = Readonly<{ fontSize: number; lineHeight: number; fontWeight: FontWeightValue }>;
type TypographyTokens = Readonly<Record<keyof typeof typography, TypeToken>>;
type HeadingTokens = Readonly<Record<keyof typeof heading, TypeToken>>;
type ShadowToken = Readonly<{ color: string; opacity: number; radius: number; offsetY: number }>;
type ShadowTokens = Readonly<Record<keyof typeof shadow, ShadowToken>>;
type SurfaceMaterial = Readonly<{
  /** Host-relative strength; Web maps 1 to 32px, Native host calibrates its own blur. */
  blurStrength: number;
  /** Requested semantic fill; the renderer raises opacity when background contrast requires it. */
  fillOpacity: number;
  insetShadows: readonly Readonly<ShadowToken & { offsetX: number }>[];
}>;
type Palette = Readonly<Record<ResolvedTheme, Readonly<ThemeColors>>>;
export type HjmDesignProfile = Readonly<{
  id: string;
  palette: Palette;
  tokens: Readonly<{
    radius: RadiusTokens;
    fontFamily: FontFamilyRoles;
    typography: TypographyTokens;
    heading: HeadingTokens;
    shadow: ShadowTokens;
  }>;
  material: Readonly<Record<"canvas" | "card", EffectSurfaceDescriptor | null> & { surface?: SurfaceMaterial | null }>;
  interactions: Readonly<{
    contentTransition: ContentTransitionPreset;
    selectionMotion: "none" | "slide";
  }>;
  compositions: Readonly<{
    collection: "rows" | "cards" | "grid";
    toolbar: "inline" | "collapsible";
  }>;
  screens: Readonly<{ overview: "dashboard" | "editorial" | "landscape" }>;
}>;

/** A custom app profile is data, not a mutable global registry or renderer import.
 * Partial records inherit the selected preset independently in light and dark. */
export type HjmDesignProfileInput = Readonly<{
  extends?: HjmDesignPreset;
  id?: string;
  palette?: Readonly<Partial<Record<ResolvedTheme, Readonly<Partial<ThemeColors>>>>>;
  tokens?: Readonly<{
    radius?: Readonly<Partial<RadiusTokens>>;
    fontFamily?: Readonly<Partial<HjmDesignProfile["tokens"]["fontFamily"]>>;
    typography?: Readonly<Partial<Record<keyof typeof typography, Partial<TypeToken>>>>;
    heading?: Readonly<Partial<Record<keyof typeof heading, Partial<TypeToken>>>>;
    shadow?: Readonly<Partial<Record<keyof typeof shadow, Partial<ShadowToken>>>>;
  }>;
  material?: Readonly<Partial<Pick<HjmDesignProfile["material"], "canvas" | "card">> & { surface?: Partial<SurfaceMaterial> | null }>;
  interactions?: Readonly<Partial<HjmDesignProfile["interactions"]>>;
  compositions?: Readonly<Partial<HjmDesignProfile["compositions"]>>;
  screens?: Readonly<Partial<HjmDesignProfile["screens"]>>;
}>;

const neutral: HjmDesignProfile = {
  id: "neutral", palette: THEMES,
  tokens: { radius, fontFamily, typography, heading, shadow },
  material: { canvas: null, card: null, surface: null },
  interactions: { contentTransition: "fade", selectionMotion: "none" },
  compositions: { collection: "rows", toolbar: "inline" },
  screens: { overview: "dashboard" },
};

/** Profiles deliberately differ in interaction and arrangement, not just hue.
 * No font asset is bundled or implied: custom font loading remains product-owned. */
const presetInputs: Readonly<Record<Exclude<HjmDesignPreset, "neutral">, HjmDesignProfileInput>> = {
  retro: {
    id: "retro",
    palette: {
      light: { bg: "#fff8e8", surface: "#fffdf5", surfaceAlt: "#eee0c5", surfaceAccent: "#f6d4a0", border: "#d1bd96", borderControl: "#75604b", primary: "#973c20", contentBrand: "#80321a", text: "#2c2119", textBody: "#413123", textMuted: "#594637", textSub: "#695646", textWeak: "#857461" },
      dark: { bg: "#211a16", surface: "#2d241d", surfaceAlt: "#3b3025", surfaceAccent: "#5e3827", border: "#807260", borderControl: "#b7a387", primary: "#af5437", contentBrand: "#ffc38b", text: "#fff5e1", textBody: "#ead8bb", textMuted: "#d5c1a3", textSub: "#bea88b", textWeak: "#a18e74" },
    },
    tokens: { radius: { sm: 2, md: 4, lg: 6, xl: 8 } },
    material: { canvas: { layers: ["noise"], intensity: 0.08, active: false, seed: "retro" } },
    interactions: { contentTransition: "slide", selectionMotion: "none" },
    compositions: { collection: "grid", toolbar: "inline" },
    screens: { overview: "dashboard" },
  },
  paper: {
    id: "paper",
    palette: {
      light: { bg: "#f9f5ed", surface: "#fffdf8", surfaceAlt: "#eee8dc", surfaceAccent: "#e7dac8", border: "#d6cabb", borderControl: "#776b5c", primary: "#665039", contentBrand: "#58432e", text: "#28231c", textBody: "#40382d", textMuted: "#5b5145", textSub: "#6e6253", textWeak: "#887b69" },
      dark: { bg: "#1b1916", surface: "#27231e", surfaceAlt: "#332d25", surfaceAccent: "#4f4132", border: "#847561", borderControl: "#b8a68c", primary: "#83684c", contentBrand: "#e3bf91", text: "#f8f0e1", textBody: "#e5d9c4", textMuted: "#d0c0a6", textSub: "#b8a78d", textWeak: "#a18e72" },
    },
    tokens: { radius: { sm: 4, md: 6, lg: 8, xl: 12 } },
    // A-02's ruled-paper finding is distinct from grain. A static low-opacity
    // tile adds that voice without rotating controls or aligning content baselines.
    material: { canvas: { layers: ["grain", "ruled"], ruledSpacing: 24, intensity: 0.06, active: false, seed: "paper" } },
    interactions: { contentTransition: "fade", selectionMotion: "none" },
    compositions: { collection: "rows", toolbar: "collapsible" },
    screens: { overview: "editorial" },
  },
  forest: {
    id: "forest",
    palette: {
      light: { bg: "#f2f7ef", surface: "#fbfdf8", surfaceAlt: "#e0ebda", surfaceAccent: "#d5e8c9", border: "#bdcdb5", borderControl: "#65765c", primary: "#285c35", contentBrand: "#23512d", text: "#1d2b1b", textBody: "#30422c", textMuted: "#485c41", textSub: "#5c6e54", textWeak: "#7b8b71" },
      dark: { bg: "#111c15", surface: "#1b2a1e", surfaceAlt: "#293a2a", surfaceAccent: "#304d32", border: "#6b816a", borderControl: "#95ac8d", primary: "#477c54", contentBrand: "#a8d994", text: "#eff7e9", textBody: "#d8e9cf", textMuted: "#bdd4b3", textSub: "#a1bd94", textWeak: "#87a17b" },
    },
    tokens: { radius: { sm: 10, md: 16, lg: 24, xl: 32 } },
    material: { canvas: { layers: ["mesh", "glow"], intensity: 0.1, active: false, seed: "forest" } },
    interactions: { contentTransition: "rise", selectionMotion: "slide" },
    compositions: { collection: "cards", toolbar: "collapsible" },
    screens: { overview: "landscape" },
  },
  minimal: {
    id: "minimal",
    palette: { light: { primary: "#404040", contentBrand: "#333333", surfaceAccent: "#eeeeee" }, dark: { primary: "#727272", contentBrand: "#dddddd", surfaceAccent: "#303030" } },
    tokens: { radius: { sm: 4, md: 8, lg: 12, xl: 16 }, shadow: { raised: { opacity: 0 }, floating: { opacity: 0.08 } } },

    interactions: { contentTransition: "fade", selectionMotion: "none" },
    compositions: { collection: "rows", toolbar: "inline" }, screens: { overview: "dashboard" },
  },
  editorial: {
    id: "editorial",
    palette: { light: { primary: "#59435f", contentBrand: "#513a57", surfaceAccent: "#eee4f0" }, dark: { primary: "#846b8e", contentBrand: "#ead0f2", surfaceAccent: "#392a3e" } },
    tokens: { radius: { sm: 0, md: 2, lg: 4, xl: 8 }, typography: { heading: { fontSize: 28, lineHeight: 38, fontWeight: fontWeight.medium }, body: { lineHeight: 24 } }, heading: { level1: { fontSize: 44, lineHeight: 54, fontWeight: fontWeight.medium }, level2: { fontSize: 34, lineHeight: 44, fontWeight: fontWeight.medium } } },

    interactions: { contentTransition: "rise", selectionMotion: "none" },
    compositions: { collection: "rows", toolbar: "collapsible" }, screens: { overview: "editorial" },
  },
  brutalist: {
    id: "brutalist",
    palette: { light: { primary: "#171717", contentBrand: "#171717", surfaceAccent: "#e8ed91", border: "#171717" }, dark: { primary: "#727272", contentBrand: "#f0f3a3", surfaceAccent: "#393a1c", border: "#cccccc" } },
    tokens: { radius: { sm: 0, md: 0, lg: 0, xl: 0 }, shadow: { raised: { radius: 0, offsetY: 4, opacity: 0.25 }, floating: { radius: 0, offsetY: 6, opacity: 0.3 } }, typography: { heading: { fontSize: 30, lineHeight: 38, fontWeight: fontWeight.heavy } }, heading: { level1: { fontSize: 48, lineHeight: 56 }, level2: { fontSize: 38, lineHeight: 46 } } },

    interactions: { contentTransition: "slide", selectionMotion: "none" },
    compositions: { collection: "cards", toolbar: "inline" }, screens: { overview: "editorial" },
  },
  glass: {
    id: "glass",
    palette: { // Stronger ink tiers keep glass visibly translucent under the existing
    // contrast rules; the neutral weak/subtle tiers required an opaque fill.
    light: { primary: "#435e91", contentBrand: "#354c78", surfaceAccent: "#e4ecf7", textSub: "#5b6879", textWeak: "#748292" }, dark: { primary: "#5673a3", contentBrand: "#c1d8ff", surfaceAccent: "#233654" } },
    tokens: { radius: { sm: 12, md: 18, lg: 26, xl: 36 }, shadow: { floating: { radius: 24, opacity: 0.12, offsetY: 8 } } },
    material: { canvas: { layers: ["mesh"], intensity: 0.16, active: false, seed: "glass" }, card: { layers: ["glow"], intensity: 0.06, active: false, seed: "glass-card" }, surface: { blurStrength: 0.75, fillOpacity: 0.88, insetShadows: [] } },
    interactions: { contentTransition: "fade", selectionMotion: "slide" },
    compositions: { collection: "cards", toolbar: "inline" }, screens: { overview: "landscape" },
  },
  aurora: {
    id: "aurora",
    palette: { light: { primary: "#62409b", contentBrand: "#58388b", surfaceAccent: "#ece2fa" }, dark: { primary: "#8161b1", contentBrand: "#dbc3ff", surfaceAccent: "#392651" } },
    tokens: { radius: { sm: 8, md: 14, lg: 22, xl: 30 } },
    material: { canvas: { layers: ["mesh", "glow"], intensity: 0.2, active: true, period: 30, seed: "aurora" } },
    interactions: { contentTransition: "scale", selectionMotion: "slide" },
    compositions: { collection: "grid", toolbar: "collapsible" }, screens: { overview: "landscape" },
  },
  terminal: {
    id: "terminal",
    palette: { light: { primary: "#235837", contentBrand: "#245435", surfaceAccent: "#deefdf" }, dark: { primary: "#467f54", contentBrand: "#95e2a6", surfaceAccent: "#203b28" } },
    tokens: { radius: { sm: 2, md: 4, lg: 6, xl: 8 }, fontFamily: { ui: fontFamily.code }, shadow: { raised: { opacity: 0 }, floating: { radius: 0, offsetY: 0, opacity: 0 } } },

    interactions: { contentTransition: "fade", selectionMotion: "none" },
    compositions: { collection: "rows", toolbar: "collapsible" }, screens: { overview: "dashboard" },
  },
  clay: {
    id: "clay",
    palette: { light: { primary: "#904663", contentBrand: "#803b57", surfaceAccent: "#f7e1eb" }, dark: { primary: "#a25e7d", contentBrand: "#f1bed4", surfaceAccent: "#482b3a" } },
    tokens: { radius: { sm: 14, md: 22, lg: 32, xl: 44 }, shadow: { raised: { radius: 16, offsetY: 6, opacity: 0.12 }, floating: { radius: 28, offsetY: 12, opacity: 0.18 } } },
    material: { card: { layers: ["grain"], intensity: 0.04, active: false, seed: "clay" }, surface: { blurStrength: 0, fillOpacity: 1, insetShadows: [
      { color: "#ffffff", opacity: 0.22, radius: 10, offsetX: 3, offsetY: 4 },
      { color: "#000000", opacity: 0.12, radius: 12, offsetX: -3, offsetY: -4 },
    ] } },
    interactions: { contentTransition: "scale", selectionMotion: "slide" },
    compositions: { collection: "cards", toolbar: "collapsible" }, screens: { overview: "dashboard" },
  },
};

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}

function choose<T extends string>(value: T, allowed: readonly T[], field: string): void {
  if (!allowed.includes(value)) throw new TypeError(`Unsupported design profile ${field}`);
}

function merge(base: HjmDesignProfile, input: HjmDesignProfileInput): HjmDesignProfile {
  for (const role of Object.keys(input.material ?? {})) {
    if (!["canvas", "card", "surface"].includes(role)) throw new TypeError("Unsupported design profile material role");
  }
  const requestedSurface = input.material?.surface;
  if (requestedSurface !== undefined && requestedSurface !== null && (typeof requestedSurface !== "object" || Array.isArray(requestedSurface))) throw new TypeError("Invalid design profile surface material");
  for (const key of Object.keys(requestedSurface ?? {})) {
    if (!["blurStrength", "fillOpacity", "insetShadows"].includes(key)) throw new TypeError("Unsupported design profile surface material field");
  }
  const palette = {
    light: { ...base.palette.light, ...input.palette?.light },
    dark: { ...base.palette.dark, ...input.palette?.dark },
  };
  // fromEntries loses fixed keys; iteration over the complete base preserves every role.
  const type = Object.fromEntries(Object.entries(base.tokens.typography).map(([key, value]) => [key, { ...value, ...input.tokens?.typography?.[key as keyof TypographyTokens] }])) as unknown as TypographyTokens;
  // Display levels need their own roles: deriving them from body text would erase
  // the hierarchy. Keep the original level3–5 typography aliases, with explicit
  // heading overrides last, and preserve inherited heading values on empty input.
  const aliases = { level3: "heading", level4: "titleLarge", level5: "title" } as const;
  for (const key of Object.keys(input.tokens?.heading ?? {})) {
    if (!Object.prototype.hasOwnProperty.call(heading, key)) throw new TypeError("Unsupported design profile heading level");
  }
  const headings = Object.fromEntries(Object.entries(base.tokens.heading).map(([key, value]) => {
    const level = key as keyof HeadingTokens;
    const alias = level in aliases ? aliases[level as keyof typeof aliases] : undefined;
    return [level, { ...value, ...(alias ? input.tokens?.typography?.[alias] : undefined), ...input.tokens?.heading?.[level] }];
  })) as unknown as HeadingTokens;
  // The complete base shadow record has the same key-preservation guarantee.
  const elevation = Object.fromEntries(Object.entries(base.tokens.shadow).map(([key, value]) => [key, { ...value, ...input.tokens?.shadow?.[key as keyof ShadowTokens] }])) as unknown as ShadowTokens;
  const requestedFonts = input.tokens?.fontFamily;
  for (const role of Object.keys(requestedFonts ?? {})) {
    if (!["ui", "code", "display", "reading"].includes(role)) throw new TypeError("Unsupported design profile font role");
    const families = requestedFonts?.[role as keyof FontFamilyRoles];
    if (families !== undefined && (!Array.isArray(families) || !families.length || families.some(family => typeof family !== "string" || !family.trim()))) throw new TypeError("Design profile font families must not be empty");
  }
  const display = requestedFonts?.display ?? base.tokens.fontFamily.display;
  const reading = requestedFonts?.reading ?? base.tokens.fontFamily.reading;
  const profile: HjmDesignProfile = {
    id: input.id ?? base.id, palette,
    tokens: {
      radius: { ...base.tokens.radius, ...input.tokens?.radius },
      // Copy caller-owned arrays: freezing the resolved profile must never freeze app input.
      fontFamily: { ui: [...(input.tokens?.fontFamily?.ui ?? base.tokens.fontFamily.ui)], code: [...(input.tokens?.fontFamily?.code ?? base.tokens.fontFamily.code)],
        ...(display ? { display: [...display] } : {}), ...(reading ? { reading: [...reading] } : {}) },
      typography: type, heading: headings, shadow: elevation,
    },
    material: { ...base.material, ...input.material, surface: input.material?.surface === null ? null
      : input.material?.surface === undefined ? base.material.surface ?? null
      : { blurStrength: 0, fillOpacity: 1, insetShadows: [], ...base.material.surface, ...input.material.surface } },
    interactions: { ...base.interactions, ...input.interactions },
    compositions: { ...base.compositions, ...input.compositions },
    screens: { ...base.screens, ...input.screens },
  };
  if (!profile.id.trim()) throw new TypeError("Design profile id must not be empty");
  for (const mode of ["light", "dark"] as const) {
    for (const [key, value] of Object.entries(palette[mode])) {
      if (!(key in THEMES[mode]) || !/^#[0-9a-f]{6}$/i.test(value)) throw new TypeError(`Invalid design profile palette ${mode}.${key}`);
    }
    if (checkPaletteContrast(palette[mode]).length) throw new RangeError(`Design profile ${mode} palette fails required contrast pairs`);
  }
  for (const [key, value] of Object.entries(profile.tokens.radius)) {
    if (!(key in radius) || !Number.isFinite(value) || value < 0 || value > 999) throw new RangeError("Invalid design profile radius");
  }
  // Circles/pills retain their semantic geometry; product corners apply to other roles.
  if (profile.tokens.radius.full !== radius.full) throw new RangeError("Design profile must preserve full radius");
  for (const value of [...Object.values(type), ...Object.values(headings)]) {
    if (!Number.isFinite(value.fontSize) || value.fontSize < 11 || value.fontSize > 96 || !Number.isFinite(value.lineHeight) || value.lineHeight < value.fontSize || value.lineHeight > 144) throw new RangeError("Invalid design profile typography");
    choose(value.fontWeight, ["400", "500", "600", "700", "800"], "fontWeight");
  }
  for (const families of Object.values(profile.tokens.fontFamily)) {
    if (!Array.isArray(families) || !families.length || families.some(family => typeof family !== "string" || !family.trim())) throw new TypeError("Design profile font families must not be empty");
  }
  for (const token of Object.values(elevation)) {
    if (!/^#[0-9a-f]{6}$/i.test(token.color) || !Number.isFinite(token.opacity) || token.opacity < 0 || token.opacity > 1 || !Number.isFinite(token.radius) || token.radius < 0 || token.radius > 96 || !Number.isFinite(token.offsetY) || Math.abs(token.offsetY) > 96) throw new RangeError("Invalid design profile shadow");
  }
  const surface = profile.material.surface;
  if (surface) {
    // Keep a readable semantic fill rather than copying a low-alpha reference card.
    // Native can fail to supply blur and must always retain its opaque fallback.
    if (!Number.isFinite(surface.blurStrength) || surface.blurStrength < 0 || surface.blurStrength > 1 || !Number.isFinite(surface.fillOpacity) || surface.fillOpacity < 0.85 || surface.fillOpacity > 1) throw new RangeError("Invalid design profile surface material");
    if (!Array.isArray(surface.insetShadows) || surface.insetShadows.length > 2) throw new RangeError("Invalid design profile inset shadows");
    for (const token of surface.insetShadows) {
      if (!/^#[0-9a-f]{6}$/i.test(token.color) || !Number.isFinite(token.opacity) || token.opacity < 0 || token.opacity > 1 || !Number.isFinite(token.radius) || token.radius < 0 || token.radius > 96 || !Number.isFinite(token.offsetY) || Math.abs(token.offsetY) > 96 || !Number.isFinite(token.offsetX) || Math.abs(token.offsetX) > 96) throw new RangeError("Invalid design profile inset shadow");
    }
  }
  const effects = Object.fromEntries((["canvas", "card"] as const).map(role => {
    const descriptor = profile.material[role];
    if (descriptor === null) return [role, null];
    resolveEffectSurface(descriptor);
    // Deep-copy material data as well: a preset resolver must not own caller state.
    return [role, { ...descriptor, ...(descriptor.layers ? { layers: [...descriptor.layers] } : {}), ...(descriptor.colors ? { colors: descriptor.colors.map(color => ({ ...color })) } : {}) }];
  })) as Pick<HjmDesignProfile["material"], "canvas" | "card">;
  const material = { ...effects, surface: surface ? { ...surface, insetShadows: surface.insetShadows.map(token => ({ ...token })) } : null };
  choose(profile.interactions.contentTransition, ["fade", "rise", "slide", "scale"], "contentTransition");
  choose(profile.interactions.selectionMotion, ["none", "slide"], "selectionMotion");
  choose(profile.compositions.collection, ["rows", "cards", "grid"], "collection");
  choose(profile.compositions.toolbar, ["inline", "collapsible"], "toolbar");
  choose(profile.screens.overview, ["dashboard", "editorial", "landscape"], "overview");
  return freeze({ ...profile, material });
}

export const hjmDesignPresets: Readonly<Record<HjmDesignPreset, HjmDesignProfile>> = freeze({
  neutral: merge(neutral, {}),
  retro: merge(neutral, presetInputs.retro),
  paper: merge(neutral, presetInputs.paper),
  forest: merge(neutral, presetInputs.forest),
  minimal: merge(neutral, presetInputs.minimal),
  editorial: merge(neutral, presetInputs.editorial),
  brutalist: merge(neutral, presetInputs.brutalist),
  glass: merge(neutral, presetInputs.glass),
  aurora: merge(neutral, presetInputs.aurora),
  terminal: merge(neutral, presetInputs.terminal),
  clay: merge(neutral, presetInputs.clay),
});

export function defineHjmDesignProfile(input: HjmDesignProfileInput = {}): HjmDesignProfile {
  const base = hjmDesignPresets[input.extends ?? "neutral"];
  if (!base) throw new TypeError("Unknown HJM design preset");
  return merge(base, input);
}

/** Resolve the readable fill against black/white backdrop extremes using the
 * final product palette, including brandPalette overrides. Blur is decorative:
 * it cannot be used as evidence of text contrast over arbitrary app content. */
export function resolveDesignProfileSurfaceMaterial(profile: HjmDesignProfile | undefined, palette: Readonly<ThemeColors>): SurfaceMaterial | null {
  const material = profile?.material.surface;
  if (!material) return null;
  // Transparency requires a real backdrop effect. Plain/clay surfaces stay solid
  // on both hosts instead of becoming tint-only imitations of a glass material.
  if (!material.blurStrength) return { ...material, fillOpacity: 1 };
  return { ...material, fillOpacity: resolveSurfaceFillOpacity(material.fillOpacity, palette) };
}
