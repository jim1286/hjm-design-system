import { type ComponentCatalogEntry, type ComponentStatus } from "./catalog.js";
export type ShowcaseTheme = "light" | "dark";
export type ShowcaseDirection = "ltr" | "rtl";
export type ShowcaseTextScale = 1 | 1.5 | 2;
export type ShowcaseMotionPreference = "full" | "reduced";
export type ShowcaseEnvironment = Readonly<{
    id: "default" | "dark" | "large-text" | "rtl" | "reduced-motion";
    label: string;
    theme: ShowcaseTheme;
    direction: ShowcaseDirection;
    textScale: ShowcaseTextScale;
    motion: ShowcaseMotionPreference;
}>;
/**
 * A small, deliberate environment matrix catches the high-risk differences
 * without multiplying every story into an unreadable Cartesian product.
 */
export declare const showcaseEnvironmentMatrix: readonly [{
    readonly id: "default";
    readonly label: "Light · LTR · 100%";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "dark";
    readonly label: "Dark · LTR · 100%";
    readonly theme: "dark";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "large-text";
    readonly label: "Light · LTR · 200%";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 2;
    readonly motion: "full";
}, {
    readonly id: "rtl";
    readonly label: "Light · RTL · 100%";
    readonly theme: "light";
    readonly direction: "rtl";
    readonly textScale: 1;
    readonly motion: "full";
}, {
    readonly id: "reduced-motion";
    readonly label: "Light · LTR · Reduced motion";
    readonly theme: "light";
    readonly direction: "ltr";
    readonly textScale: 1;
    readonly motion: "reduced";
}];
export type ShowcaseScenarioId = "contract" | "default" | "dark" | "long-copy" | "large-text" | "rtl" | "reduced-motion" | "accessibility" | "keyboard" | "platform-parity";
export type ShowcaseSurface = "contract" | "web" | "native";
export type ShowcaseScenario = Readonly<{
    id: ShowcaseScenarioId;
    label: string;
    description: string;
}>;
export declare const showcaseScenarios: readonly [{
    readonly id: "contract";
    readonly label: "Contract";
    readonly description: "Anatomy, defaults, supported axes, platform and maturity are visible.";
}, {
    readonly id: "default";
    readonly label: "Default";
    readonly description: "The normal state renders using recipe defaults without product overrides.";
}, {
    readonly id: "dark";
    readonly label: "Dark";
    readonly description: "Semantic colors remain legible on the dark theme.";
}, {
    readonly id: "long-copy";
    readonly label: "Long copy";
    readonly description: "Long Korean and English copy wraps without clipping or hiding meaning.";
}, {
    readonly id: "large-text";
    readonly label: "200% text";
    readonly description: "Text can grow to 200% without truncating required information.";
}, {
    readonly id: "rtl";
    readonly label: "RTL";
    readonly description: "Logical start/end layout and directional icons mirror correctly.";
}, {
    readonly id: "reduced-motion";
    readonly label: "Reduced motion";
    readonly description: "Motion follows the recipe reduced-motion fallback.";
}, {
    readonly id: "accessibility";
    readonly label: "Accessibility";
    readonly description: "Names, states, relationships, contrast and touch targets are inspectable.";
}, {
    readonly id: "keyboard";
    readonly label: "Keyboard";
    readonly description: "Focus order and documented keyboard behavior run as interaction tests.";
}, {
    readonly id: "platform-parity";
    readonly label: "Web / Native parity";
    readonly description: "Adaptive renderers preserve intent while using platform-native behavior.";
}];
export type ShowcaseComponentEntry = Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    requiredScenarios: readonly ShowcaseScenarioId[];
    requiredSurfaces: readonly ShowcaseSurface[];
}>;
export type ShowcaseEvidenceEntry = Readonly<{
    storyId: string;
    surface: ShowcaseSurface;
    scenarios: readonly ShowcaseScenarioId[];
}>;
export type ShowcaseCoverageEntry = Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    missingSurfaces: readonly ShowcaseSurface[];
    missingScenarios: readonly ShowcaseScenarioId[];
    complete: boolean;
}>;
export declare function getShowcaseStoryId(entry: ComponentCatalogEntry): string;
export declare function getRequiredShowcaseScenarios(entry: ComponentCatalogEntry): readonly ShowcaseScenarioId[];
export declare function getRequiredShowcaseSurfaces(entry: ComponentCatalogEntry): readonly ShowcaseSurface[];
export declare function createShowcaseManifest(entries?: readonly ComponentCatalogEntry[]): readonly ShowcaseComponentEntry[];
export declare const showcaseManifest: readonly Readonly<{
    storyId: string;
    component: ComponentCatalogEntry;
    requiredScenarios: readonly ShowcaseScenarioId[];
    requiredSurfaces: readonly ShowcaseSurface[];
}>[];
export declare function createShowcaseCoverage(evidence: readonly ShowcaseEvidenceEntry[], manifest?: readonly ShowcaseComponentEntry[]): readonly ShowcaseCoverageEntry[];
export declare function assertShowcaseCoverage(evidence: readonly ShowcaseEvidenceEntry[], manifest?: readonly ShowcaseComponentEntry[]): void;
export declare function summarizeShowcaseMaturity(entries?: readonly ComponentCatalogEntry[]): Readonly<Record<ComponentStatus, number>>;
//# sourceMappingURL=showcase.d.ts.map