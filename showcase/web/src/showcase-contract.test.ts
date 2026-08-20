import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  antDesignReferenceComponents,
  behaviorRegistry,
  componentCatalog,
  componentDefinitions,
  recipeRegistry,
  resolveColorReference,
  resolveDesignSystemProviderValue,
  summarizeAntDesignCoverage,
  type ColorReference,
  type ComponentName,
  type ComponentStatus,
} from "@hjm/design-system";
import { showcaseManifest, showcaseScenarios } from "@hjm/design-system/showcase";
import {
  ContractStory,
  summarizeWebShowcaseCoverage,
  webRendererRegistry,
  webRendererComponentNames,
} from "./components/preview-registry";
import {
  componentCategoryExplorerHref,
  componentStory,
  getComponentStoryClassification,
} from "./components/story-factory";
import { WebDesignSystemProvider } from "./runtime/WebDesignSystemProvider";
import { Introduction } from "./Introduction.stories";
import { ComponentExplorer } from "./components/ComponentExplorer.stories";

function isMatureStatus(status: ComponentStatus): boolean {
  return status === "stable" || status === "beta";
}

function recipeValueAtPath(recipe: unknown, path: string): unknown {
  return path.split(".").slice(1).reduce<unknown>((current, segment) => {
    if (typeof current !== "object" || current === null || !Object.hasOwn(current, segment)) {
      return undefined;
    }
    return (current as Readonly<Record<string, unknown>>)[segment];
  }, recipe);
}

function isColorReferenceValue(value: unknown): value is ColorReference {
  if (typeof value !== "object" || value === null) return false;
  const source = (value as Readonly<Record<string, unknown>>).source;
  const key = (value as Readonly<Record<string, unknown>>).key;
  return (
    (source === "theme" || source === "accent" || source === "accentFill") &&
    typeof key === "string"
  );
}

function renderWithProvider(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(
    createElement(
      WebDesignSystemProvider,
      {
        children: element,
        input: {
          theme: "light",
          direction: "ltr",
          textScale: 1,
          reducedMotion: false,
        },
        systemTheme: "light",
      },
    ),
  );
}

describe("web showcase coverage", () => {
  it("has a documented definition for every required scenario", () => {
    const known = new Set(showcaseScenarios.map(({ id }) => id));
    for (const entry of showcaseManifest) {
      for (const scenario of entry.requiredScenarios) {
        expect(known.has(scenario), `${entry.storyId}/${scenario}`).toBe(true);
      }
    }
  });

  it("keeps planned entries out of implementation evidence", () => {
    for (const entry of showcaseManifest.filter(({ component }) => component.status === "planned")) {
      expect(entry.requiredScenarios).toEqual(["contract"]);
      expect(webRendererRegistry).not.toHaveProperty(entry.component.name);
      expect(getComponentStoryClassification(entry.component.name as ComponentName)).toBe(
        "contract-only",
      );
    }
  });

  it("renders planned stories as contract documents without renderer DOM", () => {
    for (const entry of componentCatalog.filter(({ status }) => status === "planned")) {
      const html = renderToStaticMarkup(
        createElement(ContractStory, { name: entry.name }),
      );
      expect(html, entry.name).toContain('data-showcase-mode="contract-only"');
      expect(html, entry.name).not.toContain("data-hjm-renderer=");
    }
  });

  it("exposes the full canonical scope and Ant Design crosswalk to the explorer", () => {
    expect(componentDefinitions).toHaveLength(showcaseManifest.length);
    expect(antDesignReferenceComponents).toHaveLength(73);
    expect(summarizeAntDesignCoverage()).toMatchObject({ total: 73, tracked: 73 });
  });

  it("uses stable documentation IDs for every canonical component", () => {
    expect(new Set(componentDefinitions.map(({ id }) => id)).size).toBe(componentDefinitions.length);
    expect(new Set(componentDefinitions.map(({ docs }) => docs.storyId)).size).toBe(
      componentDefinitions.length,
    );
  });

  it("registers exactly the mature Web-supported component set", () => {
    const expected = componentCatalog
      .filter(
        ({ platform, status }) =>
          (status === "stable" || status === "beta") && platform !== "native",
      )
      .map(({ name }) => name)
      .sort();
    expect([...webRendererComponentNames].sort()).toEqual(expected);
    expect(Object.keys(webRendererRegistry).sort()).toEqual(expected);
    expect(summarizeWebShowcaseCoverage()).toEqual({
      canonical: componentCatalog.length,
      webReferences: 51,
      contractOnly: 38,
      nativeOnly: 2,
    });
  });

  it("renders the canonical 51/38/2 evidence split in Home and Explorer", () => {
    const homeHtml = renderToStaticMarkup(createElement(Introduction));
    expect(homeHtml).toContain("<strong>51</strong><span>Web references</span>");
    expect(homeHtml).toContain("<strong>38</strong><span>contract-only stories</span>");
    expect(homeHtml).toContain("<strong>2</strong><span>Native-only stories</span>");
    expect(homeHtml).toContain(componentCategoryExplorerHref("input"));
    expect(homeHtml).not.toContain("args=initialCategory");

    const explorerHtml = renderToStaticMarkup(createElement(ComponentExplorer));
    expect(explorerHtml).toContain("<strong>51</strong> Web references");
    expect(explorerHtml).toContain("<strong>38</strong> contract-only stories");
    expect(explorerHtml).toContain("<strong>2</strong> Native-only stories");
    expect(explorerHtml.match(/Open Native-only contract/g)).toHaveLength(2);
    expect(explorerHtml).toContain("Open Web reference");
    expect(explorerHtml).toContain("Open contract &amp; decision");
  });

  it("binds recipe evidence or the explicit nonvisual provider adapter", () => {
    for (const definition of Object.values(webRendererRegistry)) {
      const component = definition.component;
      expect(definition.evidenceSource.owner).toBe("@hjm/design-system");
      if (definition.adapterKind === "provider-value-presentation") {
        expect(component).toMatchObject({
          name: "DesignSystemProvider",
          nonVisualEvidence: "provider-adapter",
        });
        expect(definition.recipe).toBeNull();
        expect(definition.behavior).toBeNull();
        expect(definition.evidenceSource).toMatchObject({
          contract: "resolveDesignSystemProviderValue",
          recipe: null,
          behavior: null,
        });
        continue;
      }
      expect(component.recipe).toBeDefined();
      expect(definition.recipe.name).toBe(component.recipe);
      expect(definition.recipe.value).toBe(recipeRegistry[definition.recipe.name]);
      expect(definition.evidenceSource.recipe).toBe(definition.recipe);
      if (component.behavior) {
        expect(definition.behavior?.name).toBe(component.behavior);
        expect(definition.behavior?.value).toBe(behaviorRegistry[component.behavior]);
        expect(definition.adapterKind).toBe("recipe-behavior-presentation");
      } else {
        expect(definition.behavior).toBeNull();
        expect(definition.adapterKind).toBe("recipe-presentation");
      }
      expect(definition.evidenceSource.behavior).toBe(definition.behavior);
    }
  });

  it("consumes canonical recipe values in every renderer presentation", () => {
    const light = resolveDesignSystemProviderValue(
      { theme: "light", direction: "ltr", textScale: 1, reducedMotion: false },
      { systemTheme: "light" },
    );
    const darkRtl = resolveDesignSystemProviderValue(
      { theme: "dark", direction: "rtl", textScale: 1.5, reducedMotion: true },
      { systemTheme: "dark" },
    );

    for (const [name, definition] of Object.entries(webRendererRegistry)) {
      if (definition.adapterKind === "provider-value-presentation") continue;
      const presentation = definition.resolvePresentation(light);
      const alternate = definition.resolvePresentation(darkRtl);
      const consumedRecipeValues = presentation.consumption.recipePaths.map((path) =>
        recipeValueAtPath(definition.recipe.value, path),
      );

      expect(presentation.consumption.recipePaths.length, name).toBeGreaterThan(0);
      expect(presentation.consumption.sourcePaths, name).toEqual(
        presentation.consumption.recipePaths,
      );
      expect(consumedRecipeValues.every((value) => value !== undefined), name).toBe(true);
      expect(presentation.attributes["data-hjm-evidence-source"], name).toBe(
        definition.recipe.name,
      );
      expect(presentation.attributes["data-hjm-adapter-kind"], name).toBe(
        definition.adapterKind,
      );
      expect(presentation.attributes["data-hjm-consumed-paths"], name).not.toBe("");
      expect(presentation.style.direction, name).toBe("ltr");
      expect(alternate.style.direction, name).toBe("rtl");
      expect(
        presentation.attributes["data-hjm-presentation-signature"],
        name,
      ).not.toBe(alternate.attributes["data-hjm-presentation-signature"]);
      expect(
        presentation.style["--hjm-evidence-signature"],
        name,
      ).toBe(presentation.attributes["data-hjm-presentation-signature"]);
      expect(presentation.consumption.resolvedColor !== null ||
        presentation.consumption.resolvedMetric !== null, name).toBe(true);
      expect(
        presentation.style.minHeight !== undefined ||
          presentation.style.minWidth !== undefined ||
          presentation.style.color !== undefined ||
          presentation.style.backgroundColor !== undefined ||
          presentation.style.gap !== undefined ||
          presentation.style.paddingBlock !== undefined ||
          presentation.style.paddingInline !== undefined ||
          presentation.style.paddingInlineEnd !== undefined ||
          presentation.style.paddingInlineStart !== undefined ||
          presentation.style.borderWidth !== undefined ||
          presentation.style.maxWidth !== undefined ||
          presentation.style.borderRadius !== undefined,
        `${name} must apply a recipe value to a standard CSS property`,
      ).toBe(true);
      if (presentation.consumption.resolvedMetric !== null) {
        expect(presentation.consumption.resolvedMetricProperty, name).not.toBeNull();
        expect(consumedRecipeValues, name).toContain(
          presentation.consumption.resolvedMetric,
        );
        expect(presentation.style["--hjm-evidence-metric"], name).toBe(
          `${presentation.consumption.resolvedMetric}px`,
        );
      }
      if (presentation.consumption.resolvedColor !== null) {
        const canonicalColors = consumedRecipeValues.flatMap((value) => {
          if (isColorReferenceValue(value)) {
            return [resolveColorReference(value, light.palette)];
          }
          if (typeof value === "string" && Object.hasOwn(light.palette.theme, value)) {
            return [
              light.palette.theme[value as keyof typeof light.palette.theme],
            ];
          }
          return [];
        });
        expect(canonicalColors, name).toContain(presentation.consumption.resolvedColor);
        expect(presentation.style["--hjm-evidence-color"], name).toBe(
          presentation.consumption.resolvedColor,
        );
      }
    }

    const buttonPresentation = webRendererRegistry.Button.resolvePresentation(light);
    expect(buttonPresentation.consumption.resolvedMetric).toBe(
      recipeRegistry.buttonRecipe.sizes.medium.height,
    );
    expect(buttonPresentation.style.minHeight).toBe(
      recipeRegistry.buttonRecipe.sizes.medium.height,
    );

    const dialogPresentation = webRendererRegistry.Dialog.resolvePresentation(light);
    expect(dialogPresentation.consumption.resolvedMetric).toBe(
      recipeRegistry.dialogRecipe.sizes.medium.maxWidth,
    );
    expect(dialogPresentation.style.maxWidth).toBe(
      recipeRegistry.dialogRecipe.sizes.medium.maxWidth,
    );

    const listPresentation = webRendererRegistry.List.resolvePresentation(light);
    expect(listPresentation.consumption.resolvedMetric).toBe(
      recipeRegistry.listRecipe.separators.indented.insetStart,
    );
    expect(listPresentation.consumption.resolvedMetricProperty).toBe(
      "paddingInlineStart",
    );
    expect(listPresentation.style.paddingInlineStart).toBe(
      recipeRegistry.listRecipe.separators.indented.insetStart,
    );
  });

  it("presents the resolved provider environment and palette without a fake recipe", () => {
    const light = resolveDesignSystemProviderValue(
      { theme: "light", direction: "ltr", textScale: 1, reducedMotion: false },
      { systemTheme: "light" },
    );
    const darkRtl = resolveDesignSystemProviderValue(
      { theme: "dark", direction: "rtl", textScale: 1.5, reducedMotion: true },
      { systemTheme: "dark" },
    );
    const definition = webRendererRegistry.DesignSystemProvider;
    const presentation = definition.resolvePresentation(light);
    const alternate = definition.resolvePresentation(darkRtl);

    expect(definition.recipe).toBeNull();
    expect(presentation.consumption.recipePaths).toEqual([]);
    expect(presentation.consumption.sourcePaths).toEqual(expect.arrayContaining([
      "environment.theme",
      "environment.direction",
      "environment.textScale",
      "environment.reducedMotion",
      "palette.theme.bg",
      "palette.theme.text",
      "palette.statusAccents.info",
    ]));
    expect(presentation.attributes).toMatchObject({
      "data-hjm-adapter-kind": "provider-value-presentation",
      "data-hjm-evidence-source": "resolveDesignSystemProviderValue",
    });
    expect(presentation.style).toMatchObject({
      backgroundColor: light.palette.theme.bg,
      color: light.palette.theme.text,
      direction: "ltr",
      fontSize: "calc(var(--hjm-type-body-size) * 1)",
    });
    expect(alternate.style).toMatchObject({
      backgroundColor: darkRtl.palette.theme.bg,
      color: darkRtl.palette.theme.text,
      direction: "rtl",
      fontSize: "calc(var(--hjm-type-body-size) * 1.5)",
    });
    expect(
      presentation.attributes["data-hjm-presentation-signature"],
    ).not.toBe(alternate.attributes["data-hjm-presentation-signature"]);

    const html = renderWithProvider(
      createElement(ContractStory, { name: "DesignSystemProvider" }),
    );
    expect(html).toContain('data-hjm-recipe="none"');
    expect(html).toContain("Resolved environment + palette");
    expect(html).toContain("<dd>light</dd>");
    expect(html).toContain(`info: ${light.palette.statusAccents.info}`);
  });

  it("marks Native-only mature stories as Web unsupported", () => {
    const nativeOnly = componentCatalog.filter(
      ({ platform, status }) => platform === "native" && isMatureStatus(status),
    );
    expect(nativeOnly.length).toBeGreaterThan(0);
    for (const entry of nativeOnly) {
      expect(webRendererRegistry).not.toHaveProperty(entry.name);
      expect(getComponentStoryClassification(entry.name)).toBe("web-unsupported");
      const html = renderToStaticMarkup(
        createElement(ContractStory, { name: entry.name }),
      );
      expect(html).toContain('data-showcase-mode="web-unsupported"');
      expect(html).not.toContain("data-hjm-renderer=");
    }
  });

  it("renders every registered component through the explicit Web path", () => {
    for (const name of webRendererComponentNames) {
      const definition = webRendererRegistry[name];
      const html = renderWithProvider(createElement(ContractStory, { name }));
      expect(html, name).toContain('data-showcase-mode="web-renderer"');
      expect(html, name).toContain(`data-hjm-renderer="${name}"`);
      expect(html, name).toContain("data-hjm-evidence-source=");
      expect(html, name).toContain("data-hjm-adapter-kind=");
      expect(html, name).toContain("data-hjm-consumed-paths=");
      expect(html, name).toContain("--hjm-evidence-signature:");
      expect(html, name).toContain(
        `data-hjm-recipe="${definition.recipe?.name ?? "none"}"`,
      );
    }
  });

  it("adds stable classification tags and metadata to every canonical story", () => {
    for (const entry of componentCatalog) {
      const story = componentStory(entry.name);
      const classification = getComponentStoryClassification(entry.name);
      expect(story.tags).toContain(`hjm-${classification}`);
      expect(story.parameters.hjm).toMatchObject({
        classification,
        component: entry.name,
        recipe: "recipe" in entry ? entry.recipe ?? null : null,
        behavior: "behavior" in entry ? entry.behavior ?? null : null,
      });
    }
  });
});
