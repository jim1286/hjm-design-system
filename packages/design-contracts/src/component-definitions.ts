import {
  componentCatalog,
  componentIdOf,
  getComponentSurfaceStatus,
  type ComponentCatalogEntry,
  type ComponentCategory,
  type ComponentName,
  type ComponentPlatform,
  type ComponentStatus,
  type ComponentSurface as CatalogComponentSurface,
  type ComponentSurfaceStatus as CatalogComponentSurfaceStatus,
  type RecipeName,
} from "./catalog.js";
import type { BehaviorName } from "./behaviors.js";

export type ComponentKind = "primitive" | "component" | "provider" | "utility";
/** Kept here as aliases for existing `component-definitions` consumers. */
export type ComponentSurface = CatalogComponentSurface;
export type ComponentSurfaceStatus = CatalogComponentSurfaceStatus;

type Letter<C extends string> = C extends Lowercase<C> ? (C extends Uppercase<C> ? "other" : "lower") : "upper";
type NextIsLower<T extends string> = T extends `${infer N}${string}` ? (Letter<N> extends "lower" ? true : false) : false;
type Separator<Prev extends string, H extends string, T extends string> = Letter<H> extends "upper"
  ? (Prev extends "" ? "" : Letter<Prev> extends "upper" ? (NextIsLower<T> extends true ? "-" : "") : "-")
  : "";
/** Type-level twin of `componentIdOf` so ids stay literal types without a second hand-kept map. */
export type KebabCase<S extends string, Prev extends string = "", Acc extends string = ""> =
  S extends `${infer H}${infer T}` ? KebabCase<T, H, `${Acc}${Separator<Prev, H, T>}${Lowercase<H>}`> : Acc;
type CatalogEntry = (typeof componentCatalog)[number];
type ComponentIdOf<E extends CatalogEntry> = E extends { readonly id: infer I extends string } ? I : KebabCase<E["name"]>;

/**
 * Stable IDs survive display-name and category changes. Since 2026-10-18 they derive from the catalog row
 * (`id` override, else kebab of `name`) instead of a second hand-kept map that every registration had to touch.
 */
export const componentIds = Object.fromEntries(
  componentCatalog.map((entry) => [entry.name, componentIdOf(entry)]),
) as { readonly [E in CatalogEntry as E["name"]]: ComponentIdOf<E> };

export type ComponentId = (typeof componentIds)[ComponentName];

export type ComponentDefinition = Readonly<{
  id: ComponentId;
  name: ComponentName;
  /** Korean Storybook item name; falls back to the API name for rows authored without one. */
  label: string;
  category: ComponentCategory;
  /** Public symbols that belong to this contract (named regions, variants) and optional extensions of it. */
  companions: readonly string[];
  extensions: readonly string[];
  kind: ComponentKind;
  contract: Readonly<{
    status: ComponentStatus;
    recipes: readonly RecipeName[];
    behaviors: readonly BehaviorName[];
    roadmap?: ComponentCatalogEntry["roadmap"];
  }>;
  surfaces: Readonly<{
    parity: ComponentPlatform;
    web: Readonly<{ status: ComponentSurfaceStatus }>;
    native: Readonly<{ status: ComponentSurfaceStatus }>;
  }>;
  docs: Readonly<{
    /** Stable documentation key; aliases are catalog search terms, not alternate component implementations. */
    storyId: `components/${ComponentId}`;
    aliases: readonly string[];
  }>;
}>;

const kindByCategory: Readonly<Record<ComponentCategory, ComponentKind>> = {
  foundation: "primitive",
  layout: "primitive",
  action: "component",
  input: "component",
  navigation: "component",
  "data-display": "component",
  feedback: "component",
  overlay: "component",
  provider: "provider",
  utility: "utility",
};

/**
 * Normalized catalog view. Consumers should prefer this shape so a component can evolve to multiple recipes,
 * behaviors, and different Web/Native maturity without another API rewrite.
 */
export const componentDefinitions: readonly ComponentDefinition[] = componentCatalog.map((rawEntry) => {
  const entry: ComponentCatalogEntry = rawEntry;
  const name = entry.name as ComponentName;
  const id = componentIds[name];
  return {
    id,
    name,
    label: entry.label ?? name,
    category: entry.category,
    companions: entry.companions ?? [],
    extensions: entry.extensions ?? [],
    kind: kindByCategory[entry.category],
    contract: {
      status: entry.status,
      recipes: entry.recipe ? [entry.recipe] : [],
      behaviors: entry.behavior ? [entry.behavior] : [],
      roadmap: entry.roadmap,
    },
    surfaces: {
      parity: entry.platform,
      web: { status: getComponentSurfaceStatus(entry, "web") },
      native: { status: getComponentSurfaceStatus(entry, "native") },
    },
    docs: {
      storyId: `components/${id}`,
      aliases: entry.aliases ?? [],
    },
  };
});

export function getComponentDefinition(
  idOrName: ComponentId | ComponentName,
): ComponentDefinition | undefined {
  return componentDefinitions.find(
    (definition) => definition.id === idOrName || definition.name === idOrName,
  );
}
