import { readFile } from "node:fs/promises";

const index = JSON.parse(await readFile(new URL("../storybook-static/index.json", import.meta.url), "utf8"));
const entries = Object.values(index.entries ?? {});
const referenceStories = entries.filter((entry) => entry.title === "Components/Reference Gallery");
const expectedNames = [
  "Text", "Icon", "Surface", "Divider", "Section", "Button", "IconButton", "Link", "BottomCTA",
  "Field", "SearchField", "TextArea", "Checkbox", "Radio", "CheckboxGroup", "RadioGroup", "Switch", "Chip", "SegmentedControl", "Select", "Combobox",
  "Tabs", "TopBar", "BottomNavigation", "LoadMore", "Menu", "Avatar", "Badge", "CounterBadge", "Card", "List", "ListRow", "Accordion", "Statistic",
  "EmptyState", "Notice", "Progress", "Spinner", "Skeleton", "Toast", "Dialog", "AlertDialog", "Sheet", "Tooltip",
];
const canonicalName = (name) => name.replaceAll(" ", "");
const actualNames = new Set(referenceStories.map((entry) => canonicalName(entry.name)));
const missing = expectedNames.filter((name) => !actualNames.has(canonicalName(name)));
if (missing.length > 0 || referenceStories.length !== expectedNames.length) {
  throw new Error(`Static Storybook must contain 44 Stable/Beta component stories. Missing: ${missing.join(", ") || "none"}; found: ${referenceStories.length}`);
}
console.log(`Verified ${referenceStories.length} Stable/Beta component stories.`);
