import type { HjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { type Dispatch, type Ref, type SetStateAction } from "react";
export declare function classNames(...values: readonly (string | false | null | undefined)[]): string | undefined;
export declare function assignRef<Element>(ref: Ref<Element> | undefined, value: Element | null): void;
export declare function composeRefs<Element>(...refs: readonly (Ref<Element> | undefined)[]): (value: Element | null) => void;
type ControllableStateOptions<Value> = Readonly<{
    value?: Value;
    defaultValue: Value;
    onChange?: (value: Value) => void;
}>;
export declare function useControllableState<Value>({ value, defaultValue, onChange, }: ControllableStateOptions<Value>): readonly [
    Value,
    Dispatch<SetStateAction<Value>>
];
export declare function useWindowWidth(): number;
export declare function useElementWidth<Element extends HTMLElement>(externalRef?: Ref<Element>): readonly [number | undefined, (node: Element | null) => void];
export declare const DesignProfileContext: import("react").Context<Readonly<{
    id: string;
    palette: Readonly<Record<import("@hjmds/design-contracts/colors").ResolvedTheme, Readonly<import("@hjmds/design-contracts/colors").ThemeColors>>>;
    tokens: Readonly<{
        radius: Readonly<Record<"sm" | "md" | "lg" | "xl" | "full", number>>;
        fontFamily: Readonly<{
            ui: readonly string[];
            code: readonly string[];
        }>;
        typography: Readonly<Record<"heading" | "caption" | "label" | "body" | "bodyLarge" | "title" | "titleLarge", Readonly<{
            fontSize: number;
            lineHeight: number;
            fontWeight: import("@hjmds/design-contracts/foundations").FontWeightValue;
        }>>>;
        heading: Readonly<Record<"level1" | "level2" | "level3" | "level4" | "level5", Readonly<{
            fontSize: number;
            lineHeight: number;
            fontWeight: import("@hjmds/design-contracts/foundations").FontWeightValue;
        }>>>;
        shadow: Readonly<Record<"overlay" | "raised" | "floating", Readonly<{
            color: string;
            opacity: number;
            radius: number;
            offsetY: number;
        }>>>;
    }>;
    material: Readonly<Record<"canvas" | "card", import("@hjmds/design-contracts/effect-surface").EffectSurfaceDescriptor | null>>;
    interactions: Readonly<{
        contentTransition: import("@hjmds/design-contracts/content-transition").ContentTransitionPreset;
        selectionMotion: "none" | "slide";
    }>;
    compositions: Readonly<{
        collection: "rows" | "cards" | "grid";
        toolbar: "inline" | "collapsible";
    }>;
    screens: Readonly<{
        overview: "dashboard" | "editorial" | "landscape";
    }>;
}> | undefined>;
export declare function useDesignProfileDefaults(): HjmDesignProfile | undefined;
export {};
//# sourceMappingURL=internal.d.ts.map