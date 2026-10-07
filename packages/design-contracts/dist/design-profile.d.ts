import { type ResolvedTheme, type ThemeColors } from "./colors.js";
import { radius, typography, shadow, type FontWeightValue } from "./foundations.js";
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
type ShadowToken = Readonly<{
    color: string;
    opacity: number;
    radius: number;
    offsetY: number;
}>;
type ShadowTokens = Readonly<Record<keyof typeof shadow, ShadowToken>>;
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
        shadow: ShadowTokens;
    }>;
    material: Readonly<Record<"canvas" | "card", EffectSurfaceDescriptor | null>>;
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
        shadow?: Readonly<Partial<Record<keyof typeof shadow, Partial<ShadowToken>>>>;
    }>;
    material?: Readonly<Partial<HjmDesignProfile["material"]>>;
    interactions?: Readonly<Partial<HjmDesignProfile["interactions"]>>;
    compositions?: Readonly<Partial<HjmDesignProfile["compositions"]>>;
    screens?: Readonly<Partial<HjmDesignProfile["screens"]>>;
}>;
export declare const hjmDesignPresets: Readonly<Record<HjmDesignPreset, HjmDesignProfile>>;
export declare function defineHjmDesignProfile(input?: HjmDesignProfileInput): HjmDesignProfile;
export {};
//# sourceMappingURL=design-profile.d.ts.map