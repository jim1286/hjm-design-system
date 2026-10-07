import { type ResolvedTheme, type ThemeColors } from "./colors.js";
import { radius, typography, heading, shadow, type FontWeightValue } from "./foundations.js";
import { type EffectSurfaceDescriptor } from "./effect-surface.js";
import type { ContentTransitionPreset } from "./content-transition.js";
/** A product chooses one portable profile; the renderer owns each host translation.
 * Keep business state/callbacks outside it so a visual change cannot replace a draft.
 * See docs/design-profile.md for the staged renderer integration and coverage limits. */
export type HjmDesignPreset = "neutral" | "retro" | "paper" | "forest" | "minimal" | "editorial" | "brutalist" | "glass" | "aurora" | "terminal" | "clay";
type RadiusTokens = Readonly<Record<keyof typeof radius, number>>;
type TypeToken = Readonly<{
    fontSize: number;
    lineHeight: number;
    fontWeight: FontWeightValue;
}>;
type TypographyTokens = Readonly<Record<keyof typeof typography, TypeToken>>;
type HeadingTokens = Readonly<Record<keyof typeof heading, TypeToken>>;
type ShadowToken = Readonly<{
    color: string;
    opacity: number;
    radius: number;
    offsetY: number;
}>;
type ShadowTokens = Readonly<Record<keyof typeof shadow, ShadowToken>>;
type SurfaceMaterial = Readonly<{
    /** Host-relative strength; Web maps 1 to 32px, Native host calibrates its own blur. */
    blurStrength: number;
    /** Requested semantic fill; the renderer raises opacity when background contrast requires it. */
    fillOpacity: number;
    insetShadows: readonly Readonly<ShadowToken & {
        offsetX: number;
    }>[];
}>;
type Palette = Readonly<Record<ResolvedTheme, Readonly<ThemeColors>>>;
export type HjmDesignProfile = Readonly<{
    id: string;
    palette: Palette;
    tokens: Readonly<{
        radius: RadiusTokens;
        fontFamily: Readonly<{
            ui: readonly string[];
            code: readonly string[];
        }>;
        typography: TypographyTokens;
        heading: HeadingTokens;
        shadow: ShadowTokens;
    }>;
    material: Readonly<Record<"canvas" | "card", EffectSurfaceDescriptor | null> & {
        surface?: SurfaceMaterial | null;
    }>;
    interactions: Readonly<{
        contentTransition: ContentTransitionPreset;
        selectionMotion: "none" | "slide";
    }>;
    compositions: Readonly<{
        collection: "rows" | "cards" | "grid";
        toolbar: "inline" | "collapsible";
    }>;
    screens: Readonly<{
        overview: "dashboard" | "editorial" | "landscape";
    }>;
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
    material?: Readonly<Partial<Pick<HjmDesignProfile["material"], "canvas" | "card">> & {
        surface?: Partial<SurfaceMaterial> | null;
    }>;
    interactions?: Readonly<Partial<HjmDesignProfile["interactions"]>>;
    compositions?: Readonly<Partial<HjmDesignProfile["compositions"]>>;
    screens?: Readonly<Partial<HjmDesignProfile["screens"]>>;
}>;
export declare const hjmDesignPresets: Readonly<Record<HjmDesignPreset, HjmDesignProfile>>;
export declare function defineHjmDesignProfile(input?: HjmDesignProfileInput): HjmDesignProfile;
/** Resolve the readable fill against black/white backdrop extremes using the
 * final product palette, including brandPalette overrides. Blur is decorative:
 * it cannot be used as evidence of text contrast over arbitrary app content. */
export declare function resolveDesignProfileSurfaceMaterial(profile: HjmDesignProfile | undefined, palette: Readonly<ThemeColors>): SurfaceMaterial | null;
export {};
//# sourceMappingURL=design-profile.d.ts.map