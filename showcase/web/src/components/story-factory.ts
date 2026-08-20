import { componentIds, type ComponentCategory, type ComponentName } from "@hjm/design-system";

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

export function componentStory(name: ComponentName) {
  return { name, args: { name } } as const;
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
