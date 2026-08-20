import {
  componentCatalog,
  componentIds,
  type ComponentCatalogEntry,
  type ComponentCategory,
  type ComponentName,
} from "@hjm/design-system";

type ComponentStoryTarget = Readonly<{
  category: ComponentCategory;
  name: string;
}>;

const sectionIds: Readonly<Record<ComponentCategory, string>> = {
  foundation: "foundation",
  layout: "layout",
  action: "actions",
  input: "inputs",
  navigation: "navigation",
  "data-display": "data-display",
  feedback: "feedback",
  overlay: "overlays",
  provider: "infrastructure",
  utility: "infrastructure",
};

const explorerStoryIds: Readonly<Record<ComponentCategory, string>> = {
  foundation: "foundation",
  layout: "layout",
  action: "actions",
  input: "inputs",
  navigation: "navigation",
  "data-display": "data-display",
  feedback: "feedback",
  overlay: "overlays",
  provider: "providers",
  utility: "utilities",
};

export type ComponentStoryClassification =
  | "web-renderer"
  | "contract-only"
  | "web-unsupported";

export function getComponentStoryClassification(
  name: ComponentName,
): ComponentStoryClassification {
  const entry: ComponentCatalogEntry | undefined = componentCatalog.find(
    (component) => component.name === name,
  );
  if (!entry) throw new Error(`Unknown canonical component: ${name}`);
  if (entry.status === "planned" || entry.status === "deprecated") return "contract-only";
  if (entry.platform === "native") return "web-unsupported";
  return "web-renderer";
}

export function componentStory(name: ComponentName) {
  const entry: ComponentCatalogEntry | undefined = componentCatalog.find(
    (component) => component.name === name,
  );
  if (!entry) throw new Error(`Unknown canonical component: ${name}`);
  const classification = getComponentStoryClassification(name);
  return {
    name,
    args: { name },
    tags: [`hjm-${classification}`],
    parameters: {
      hjm: {
        behavior: entry.behavior ?? null,
        classification,
        component: name,
        recipe: entry.recipe ?? null,
      },
    },
  };
}

export function componentStoryId(
  entry: ComponentStoryTarget,
): string {
  if (!Object.hasOwn(componentIds, entry.name)) {
    throw new Error(`Unknown canonical component: ${entry.name}`);
  }
  return `components-${sectionIds[entry.category]}--${componentIds[entry.name as ComponentName]}`;
}

export function componentStoryHref(
  entry: ComponentStoryTarget,
): string {
  return `?path=/story/${componentStoryId(entry)}`;
}

export function componentCategoryExplorerHref(category: ComponentCategory): string {
  return `?path=/story/components-overview--${explorerStoryIds[category]}`;
}
