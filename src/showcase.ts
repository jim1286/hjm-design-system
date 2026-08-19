import {
  componentCatalog,
  type ComponentCatalogEntry,
  type ComponentStatus,
} from "./catalog.js";

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
export const showcaseEnvironmentMatrix = [
  {
    id: "default",
    label: "Light · LTR · 100%",
    theme: "light",
    direction: "ltr",
    textScale: 1,
    motion: "full",
  },
  {
    id: "dark",
    label: "Dark · LTR · 100%",
    theme: "dark",
    direction: "ltr",
    textScale: 1,
    motion: "full",
  },
  {
    id: "large-text",
    label: "Light · LTR · 200%",
    theme: "light",
    direction: "ltr",
    textScale: 2,
    motion: "full",
  },
  {
    id: "rtl",
    label: "Light · RTL · 100%",
    theme: "light",
    direction: "rtl",
    textScale: 1,
    motion: "full",
  },
  {
    id: "reduced-motion",
    label: "Light · LTR · Reduced motion",
    theme: "light",
    direction: "ltr",
    textScale: 1,
    motion: "reduced",
  },
] as const satisfies readonly ShowcaseEnvironment[];

export type ShowcaseScenarioId =
  | "contract"
  | "default"
  | "dark"
  | "long-copy"
  | "large-text"
  | "rtl"
  | "reduced-motion"
  | "accessibility"
  | "keyboard"
  | "platform-parity";

export type ShowcaseSurface = "contract" | "web" | "native";

export type ShowcaseScenario = Readonly<{
  id: ShowcaseScenarioId;
  label: string;
  description: string;
}>;

export const showcaseScenarios = [
  {
    id: "contract",
    label: "Contract",
    description: "Anatomy, defaults, supported axes, platform and maturity are visible.",
  },
  {
    id: "default",
    label: "Default",
    description: "The normal state renders using recipe defaults without product overrides.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Semantic colors remain legible on the dark theme.",
  },
  {
    id: "long-copy",
    label: "Long copy",
    description: "Long Korean and English copy wraps without clipping or hiding meaning.",
  },
  {
    id: "large-text",
    label: "200% text",
    description: "Text can grow to 200% without truncating required information.",
  },
  {
    id: "rtl",
    label: "RTL",
    description: "Logical start/end layout and directional icons mirror correctly.",
  },
  {
    id: "reduced-motion",
    label: "Reduced motion",
    description: "Motion follows the recipe reduced-motion fallback.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "Names, states, relationships, contrast and touch targets are inspectable.",
  },
  {
    id: "keyboard",
    label: "Keyboard",
    description: "Focus order and documented keyboard behavior run as interaction tests.",
  },
  {
    id: "platform-parity",
    label: "Web / Native parity",
    description: "Adaptive renderers preserve intent while using platform-native behavior.",
  },
] as const satisfies readonly ShowcaseScenario[];

const plannedRequirements = ["contract"] as const satisfies readonly ShowcaseScenarioId[];
const visualRequirements = [
  "contract",
  "default",
  "dark",
  "long-copy",
  "large-text",
  "rtl",
  "reduced-motion",
  "accessibility",
] as const satisfies readonly ShowcaseScenarioId[];

export type ShowcaseComponentEntry = Readonly<{
  storyId: string;
  component: ComponentCatalogEntry;
  requirements: readonly ShowcaseEvidenceRequirement[];
  requiredScenarios: readonly ShowcaseScenarioId[];
  requiredSurfaces: readonly ShowcaseSurface[];
}>;

export type ShowcaseEvidenceRequirement = Readonly<{
  surface: ShowcaseSurface;
  scenarios: readonly ShowcaseScenarioId[];
}>;

export type ShowcaseEvidenceEntry = Readonly<{
  storyId: string;
  surface: ShowcaseSurface;
  scenarios: readonly ShowcaseScenarioId[];
}>;

export type ShowcaseCoverageEntry = Readonly<{
  storyId: string;
  component: ComponentCatalogEntry;
  missingEvidence: readonly Readonly<{
    surface: ShowcaseSurface;
    scenario: ShowcaseScenarioId;
  }>[];
  missingSurfaces: readonly ShowcaseSurface[];
  missingScenarios: readonly ShowcaseScenarioId[];
  complete: boolean;
}>;

export function getShowcaseStoryId(entry: ComponentCatalogEntry): string {
  const slug = entry.name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${entry.category}/${slug}`;
}

export function getRequiredShowcaseScenarios(
  entry: ComponentCatalogEntry,
): readonly ShowcaseScenarioId[] {
  if (entry.status === "planned" || entry.status === "deprecated") {
    return plannedRequirements;
  }

  const requirements: ShowcaseScenarioId[] = [...visualRequirements];
  if (entry.behavior) {
    requirements.push("keyboard");
  }
  if (entry.platform === "adaptive") {
    requirements.push("platform-parity");
  }
  return requirements;
}

export function getRequiredShowcaseSurfaces(
  entry: ComponentCatalogEntry,
): readonly ShowcaseSurface[] {
  return getRequiredShowcaseEvidence(entry).map(({ surface }) => surface);
}

export function getRequiredShowcaseEvidence(
  entry: ComponentCatalogEntry,
): readonly ShowcaseEvidenceRequirement[] {
  if (entry.status === "planned" || entry.status === "deprecated") {
    return [{ surface: "contract", scenarios: ["contract"] }];
  }

  const rendererScenarios = getRequiredShowcaseScenarios(entry).filter(
    (scenario) => scenario !== "contract",
  );
  const requirements: ShowcaseEvidenceRequirement[] = [
    { surface: "contract", scenarios: ["contract"] },
  ];
  if (entry.platform !== "native") {
    requirements.push({ surface: "web", scenarios: rendererScenarios });
  }
  if (entry.platform !== "web") {
    requirements.push({ surface: "native", scenarios: rendererScenarios });
  }
  return requirements;
}

export function createShowcaseManifest(
  entries: readonly ComponentCatalogEntry[] = componentCatalog,
): readonly ShowcaseComponentEntry[] {
  return entries.map((component) => ({
    storyId: getShowcaseStoryId(component),
    component,
    requirements: getRequiredShowcaseEvidence(component),
    requiredScenarios: getRequiredShowcaseScenarios(component),
    requiredSurfaces: getRequiredShowcaseSurfaces(component),
  }));
}

export const showcaseManifest = createShowcaseManifest();

export function createShowcaseCoverage(
  evidence: readonly ShowcaseEvidenceEntry[],
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): readonly ShowcaseCoverageEntry[] {
  return manifest.map(({ storyId, component, requirements }) => {
    const componentEvidence = evidence.filter((entry) => entry.storyId === storyId);
    const missingEvidence = requirements.flatMap(({ surface, scenarios }) =>
      scenarios
        .filter(
          (scenario) =>
            !componentEvidence.some(
              (entry) => entry.surface === surface && entry.scenarios.includes(scenario),
            ),
        )
        .map((scenario) => ({ surface, scenario })),
    );
    const missingSurfaces = [...new Set(missingEvidence.map(({ surface }) => surface))];
    const missingScenarios = [...new Set(missingEvidence.map(({ scenario }) => scenario))];
    return {
      storyId,
      component,
      missingEvidence,
      missingSurfaces,
      missingScenarios,
      complete: missingSurfaces.length === 0 && missingScenarios.length === 0,
    };
  });
}

export function assertShowcaseCoverage(
  evidence: readonly ShowcaseEvidenceEntry[],
  manifest: readonly ShowcaseComponentEntry[] = showcaseManifest,
): void {
  const missing = createShowcaseCoverage(evidence, manifest).filter(({ complete }) => !complete);
  if (missing.length === 0) return;
  const details = missing
    .map(({ storyId, missingEvidence }) =>
      `${storyId} (${missingEvidence.map(({ surface, scenario }) => `${surface}/${scenario}`).join(", ") || "none"})`,
    )
    .join("\n");
  throw new Error(`Showcase evidence is incomplete:\n${details}`);
}

export function summarizeShowcaseMaturity(
  entries: readonly ComponentCatalogEntry[] = componentCatalog,
): Readonly<Record<ComponentStatus, number>> {
  return entries.reduce<Record<ComponentStatus, number>>(
    (summary, entry) => {
      summary[entry.status] += 1;
      return summary;
    },
    { stable: 0, beta: 0, planned: 0, deprecated: 0 },
  );
}
