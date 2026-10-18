import {
  type BottomNavigationDensity,
  type BottomNavigationDistribution,
  type BottomNavigationPresentation,
  bottomNavigationRecipeDefaults,
} from "./bottom-navigation-defaults.js";
import { formatCounterBadgeCount } from "./counter-badge.js";
import {
  type SemanticIconName,
} from "./icon.js";
import type { DesignSystemDirection } from "./design-system-provider.js";

export type BottomNavigationDirection = DesignSystemDirection;
export type BottomNavigationKeyboardBehavior = "hide" | "remain";
/**
 * `hidden` drops the visible destination name and keeps it as the item's
 * accessible name. Icon-only bars rely on the icon stroke/scale emphasis (and
 * any product selection mark) for non-color selected evidence, so products
 * choose it deliberately; the default keeps labels visible. Added 2026-10-10
 * for BurnTok's icon-only dock instead of letting the app hide labels with
 * deprecated styles or transparent palette overrides.
 */
export type BottomNavigationLabels = "visible" | "hidden";

export type BottomNavigationConfiguration = Readonly<{
  presentation?: BottomNavigationPresentation;
  distribution?: BottomNavigationDistribution;
  density?: BottomNavigationDensity;
  direction?: BottomNavigationDirection;
  keyboardBehavior?: BottomNavigationKeyboardBehavior;
  labels?: BottomNavigationLabels;
  /** Inset selected destination card, with equal widths and persistent labels. Floating only. */
  selection?: "emphasis" | "tile";
  /**
   * `raised` paints the tile bar as a thick plank: a sunken surface role with a
   * control-colored lower edge, and a darker lower edge under the selected tile.
   * Tile selection only. Added 2026-10-13 for Spint's wooden-sign tab bar so the
   * product supplies colors through palette roles instead of deprecated styles.
   */
  surface?: BottomNavigationSurface;
  /**
   * Icon slot size. `standard` keeps the density glyph; `large`/`xlarge` reserve an app-icon sized slot
   * (`bottomNavigationRecipe.iconSizes`) for artwork rendered through `renderIcon`. Added 2026-10-18 for
   * Utilverse's dock, which drew its own Surface/Button row to show 38-54pt app icons.
   */
  iconSize?: BottomNavigationIconSize;
  /**
   * Frame of the floating surface (`bottomNavigationRecipe.shapes`): corner radius and the inner padding between
   * the frame and the destinations. `standard` keeps the floating recipe. Floating + emphasis selection only.
   * Added 2026-10-18 for Utilverse's home shells (iPhone rounded dock, Android pill, macOS compact dock,
   * Linux/Windows square taskbar), which otherwise assembled their own Surface/Button bar per shell.
   */
  shape?: BottomNavigationShape;
  /**
   * Selected icon emphasis (`bottomNavigationRecipe.icon`). `scale` is the default glyph emphasis; `lift` also
   * raises the selected icon and dims idle icons, the non-color cue for full-color artwork from `renderIcon` that
   * cannot take the selected tint. Added 2026-10-18 with `shape` for the same Utilverse dock.
   */
  iconEmphasis?: BottomNavigationIconEmphasis;
}>;

export type BottomNavigationSurface = "flat" | "raised";
export type BottomNavigationIconSize = "standard" | "large" | "xlarge";
export type BottomNavigationShape = "standard" | "rounded" | "pill" | "compact" | "square";
export type BottomNavigationIconEmphasis = "scale" | "lift";

export type ResolvedBottomNavigationConfiguration = Readonly<{
  presentation: BottomNavigationPresentation;
  distribution: BottomNavigationDistribution;
  density: BottomNavigationDensity;
  direction: BottomNavigationDirection;
  keyboardBehavior: BottomNavigationKeyboardBehavior;
  labels: BottomNavigationLabels;
  selection: "emphasis" | "tile";
  surface: BottomNavigationSurface;
  iconSize: BottomNavigationIconSize;
  shape: BottomNavigationShape;
  iconEmphasis: BottomNavigationIconEmphasis;
}>;

/**
 * Bottom navigation only accepts numeric counters. A silent status dot is too
 * ambiguous for a persistent, top-level destination.
 */
export type BottomNavigationCounterBadge = Readonly<{
  count: number;
  max?: number;
  /** Product-localized copy, for example "3 unread messages". */
  accessibilityLabel: string;
}>;

/**
 * BottomNavigation owns icon appearance through its density and state recipe.
 * Products may extend the semantic name registry, but never override size,
 * tone, stroke weight, accessibility, or logical direction at the call site.
 */
export type BottomNavigationIconDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{
  name: IconName;
  decorative?: true;
  accessibilityLabel?: never;
  size?: never;
  tone?: never;
  weight?: never;
  directionality?: never;
}>;

export type ResolvedBottomNavigationIconDescriptor<
  IconName extends string = SemanticIconName,
> = Readonly<{
  name: IconName;
  decorative: true;
}>;

/**
 * Items are stable top-level destinations, never actions. The icon is always
 * decorative because the visible/item accessibility label already names it.
 */
export type BottomNavigationItemDescriptor<
  Key extends string = string,
  IconName extends string = SemanticIconName,
> = Readonly<{
  id: Key;
  label: string;
  accessibilityLabel?: string;
  icon: BottomNavigationIconDescriptor<IconName>;
  badge?: BottomNavigationCounterBadge;
  disabled?: boolean;
  /**
   * Raised center destination: a selectable route drawn as a lifted brand circle above the bar, with its label
   * below. Only the middle item of an odd item count may be prominent. Unlike `primaryAction` it is a real
   * destination (selected state, reselect, router-owned). Added 2026-10-18 for Diairy's "write" tab, which
   * replaced the shared bar with Expo Router's default tab bar to draw it.
   */
  prominent?: boolean;
}>;

/** The router owns selectedKey; the design-system never keeps a second copy. */
export type BottomNavigationDescriptor<
  Key extends string = string,
  IconName extends string = SemanticIconName,
> = Readonly<{
  accessibilityLabel: string;
  items: readonly BottomNavigationItemDescriptor<Key, IconName>[];
  selectedKey: Key;
}>;

/**
 * The resolved badge intentionally has no accessible label. Renderers hide its
 * subtree and use only the item's resolvedAccessibilityLabel, preventing the
 * counter from being announced twice.
 */
export type ResolvedBottomNavigationCounterBadge = Readonly<{
  visibleLabel: string;
  hiddenFromAccessibility: true;
}>;

export type ResolvedBottomNavigationItemDescriptor<
  Key extends string = string,
  IconName extends string = SemanticIconName,
> = Readonly<{
  id: Key;
  label: string;
  icon: ResolvedBottomNavigationIconDescriptor<IconName>;
  disabled: boolean;
  badge: ResolvedBottomNavigationCounterBadge | null;
  resolvedAccessibilityLabel: string;
  prominent: boolean;
}>;

export type ResolvedBottomNavigationDescriptor<
  Key extends string = string,
  IconName extends string = SemanticIconName,
> = Readonly<{
  accessibilityLabel: string;
  items: readonly ResolvedBottomNavigationItemDescriptor<Key, IconName>[];
  selectedKey: Key;
}>;

export type BottomNavigationActivation<Key extends string = string> = Readonly<{
  key: Key;
  reason: "navigate" | "reselect";
}>;

/**
 * `maxItems` follows the platform bars rather than Material's five-destination
 * guidance: iOS tab bars and Android navigation bars both render six labelled
 * destinations without collapsing, and products that ship six need the shared
 * contract to describe them instead of routing around it.
 */
export const bottomNavigationBehaviorDefaults = {
  direction: "ltr",
  keyboardBehavior: "hide",
  labels: "visible",
  selection: "emphasis",
  surface: "flat",
  iconSize: "standard",
  shape: "standard",
  iconEmphasis: "scale",
  minItems: 2,
  maxItems: 6,
} as const satisfies Readonly<{
  direction: BottomNavigationDirection;
  keyboardBehavior: BottomNavigationKeyboardBehavior;
  labels: BottomNavigationLabels;
  selection: "emphasis" | "tile";
  surface: BottomNavigationSurface;
  iconSize: BottomNavigationIconSize;
  shape: BottomNavigationShape;
  iconEmphasis: BottomNavigationIconEmphasis;
  minItems: number;
  maxItems: number;
}>;

function validateTrimmedCopy(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must not be empty`);
  }
  if (value !== value.trim()) {
    throw new TypeError(`${field} must not start or end with whitespace`);
  }
}

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const configurationKeys = new Set([
  "presentation",
  "distribution",
  "density",
  "direction",
  "keyboardBehavior",
  "labels",
  "selection",
  "surface",
  "iconSize",
  "shape",
  "iconEmphasis",
]);
const descriptorKeys = new Set(["accessibilityLabel", "items", "selectedKey"]);
const itemKeys = new Set([
  "id",
  "label",
  "accessibilityLabel",
  "icon",
  "badge",
  "disabled",
  "prominent",
]);
const iconKeys = new Set(["name", "decorative"]);
const badgeKeys = new Set(["count", "max", "accessibilityLabel"]);

function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new TypeError(`Unsupported BottomNavigation ${field} field: ${key}`);
    }
  }
}

function normalizedCopy(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase();
}

function validateBadge(badge: BottomNavigationCounterBadge): void {
  if (!isObject(badge)) {
    throw new TypeError("BottomNavigation badge must be an object");
  }
  rejectUnknownKeys(badge, badgeKeys, "badge");
  if (!Number.isSafeInteger(badge.count) || badge.count < 0) {
    throw new TypeError("BottomNavigation badge count must be a non-negative safe integer");
  }
  if (
    badge.max !== undefined &&
    (!Number.isSafeInteger(badge.max) || badge.max < 1)
  ) {
    throw new TypeError("BottomNavigation badge max must be a positive safe integer");
  }
  validateTrimmedCopy(
    badge.accessibilityLabel,
    "BottomNavigation badge accessibilityLabel",
  );
}

function validateItem<Key extends string, IconName extends string>(
  item: BottomNavigationItemDescriptor<Key, IconName>,
): void {
  if (!isObject(item)) {
    throw new TypeError("BottomNavigation item must be an object");
  }
  rejectUnknownKeys(item, itemKeys, "item");
  validateTrimmedCopy(item.id, "BottomNavigation item id");
  validateTrimmedCopy(item.label, "BottomNavigation item label");
  if (item.accessibilityLabel !== undefined) {
    validateTrimmedCopy(
      item.accessibilityLabel,
      "BottomNavigation item accessibilityLabel",
    );
    if (
      !normalizedCopy(item.accessibilityLabel).includes(
        normalizedCopy(item.label),
      )
    ) {
      throw new TypeError(
        "BottomNavigation item accessibilityLabel must include the visible label",
      );
    }
  }
  if (!isObject(item.icon)) {
    throw new TypeError("BottomNavigation item icon must be an object");
  }
  if (item.icon.decorative !== undefined && item.icon.decorative !== true) {
    throw new TypeError("BottomNavigation item icon must be decorative");
  }
  rejectUnknownKeys(item.icon, iconKeys, "item icon");
  validateTrimmedCopy(item.icon.name, "BottomNavigation item icon name");
  if (item.disabled !== undefined && typeof item.disabled !== "boolean") {
    throw new TypeError("BottomNavigation item disabled must be a boolean");
  }
  if (item.badge !== undefined) validateBadge(item.badge);
  if (item.prominent !== undefined && typeof item.prominent !== "boolean") {
    throw new TypeError("BottomNavigation item prominent must be a boolean");
  }
}

const presentations = new Set<BottomNavigationPresentation>(["bar", "floating", "capsule"]);
const distributions = new Set<BottomNavigationDistribution>(["equal", "center-gap"]);
const densities = new Set<BottomNavigationDensity>(["compact", "regular"]);
const directions = new Set<BottomNavigationDirection>(["ltr", "rtl"]);
const keyboardBehaviors = new Set<BottomNavigationKeyboardBehavior>([
  "hide",
  "remain",
]);
const labelModes = new Set<BottomNavigationLabels>(["visible", "hidden"]);
const iconSizes = new Set<BottomNavigationIconSize>(["standard", "large", "xlarge"]);
const shapes = new Set<BottomNavigationShape>(["standard", "rounded", "pill", "compact", "square"]);
const iconEmphases = new Set<BottomNavigationIconEmphasis>(["scale", "lift"]);

export function validateBottomNavigationConfiguration(
  configuration: BottomNavigationConfiguration,
  itemCount: number,
): void {
  if (!isObject(configuration)) {
    throw new TypeError("BottomNavigation configuration must be an object");
  }
  rejectUnknownKeys(configuration, configurationKeys, "configuration");
  if (
    !Number.isSafeInteger(itemCount) ||
    itemCount < bottomNavigationBehaviorDefaults.minItems ||
    itemCount > bottomNavigationBehaviorDefaults.maxItems
  ) {
    throw new RangeError(
      `BottomNavigation configuration requires ${bottomNavigationBehaviorDefaults.minItems} to ${bottomNavigationBehaviorDefaults.maxItems} destinations`,
    );
  }
  if (
    configuration.presentation !== undefined &&
    !presentations.has(configuration.presentation)
  ) {
    throw new TypeError(
      `Unsupported BottomNavigation presentation: ${String(configuration.presentation)}`,
    );
  }
  if (
    configuration.distribution !== undefined &&
    !distributions.has(configuration.distribution)
  ) {
    throw new TypeError(
      `Unsupported BottomNavigation distribution: ${String(configuration.distribution)}`,
    );
  }
  if (configuration.density !== undefined && !densities.has(configuration.density)) {
    throw new TypeError(
      `Unsupported BottomNavigation density: ${String(configuration.density)}`,
    );
  }
  if (
    configuration.direction !== undefined &&
    !directions.has(configuration.direction)
  ) {
    throw new TypeError(
      `Unsupported BottomNavigation direction: ${String(configuration.direction)}`,
    );
  }
  if (
    configuration.keyboardBehavior !== undefined &&
    !keyboardBehaviors.has(configuration.keyboardBehavior)
  ) {
    throw new TypeError(
      `Unsupported BottomNavigation keyboardBehavior: ${String(configuration.keyboardBehavior)}`,
    );
  }
  if (configuration.labels !== undefined && !labelModes.has(configuration.labels)) {
    throw new TypeError(
      `Unsupported BottomNavigation labels: ${String(configuration.labels)}`,
    );
  }
  if (configuration.selection !== undefined && !["emphasis", "tile"].includes(configuration.selection)) {
    throw new TypeError("Unsupported BottomNavigation selection");
  }
  // Spint's selected card must not inherit capsule's hidden names or unequal widths.
  if (configuration.selection === "tile" &&
      (configuration.presentation !== "floating" || configuration.distribution === "center-gap" || configuration.labels === "hidden")) {
    throw new TypeError("BottomNavigation tile selection requires floating, equal distribution and visible labels");
  }
  if (configuration.surface !== undefined && !["flat", "raised"].includes(configuration.surface)) {
    throw new TypeError("Unsupported BottomNavigation surface");
  }
  // The lower edges belong to the tile row; an emphasis bar has no selected card to lift.
  if (configuration.surface === "raised" && configuration.selection !== "tile") {
    throw new TypeError("BottomNavigation raised surface requires tile selection");
  }
  // Capsule actions sit beside the destination surface, so reserving a central gap would duplicate their space.
  if (configuration.presentation === "capsule" && configuration.distribution === "center-gap") {
    throw new TypeError("BottomNavigation capsule uses an adjacent action, not center-gap");
  }
  if (configuration.iconSize !== undefined && !iconSizes.has(configuration.iconSize)) {
    throw new TypeError(
      `Unsupported BottomNavigation iconSize: ${String(configuration.iconSize)}`,
    );
  }
  if (configuration.shape !== undefined && !shapes.has(configuration.shape)) {
    throw new TypeError(`Unsupported BottomNavigation shape: ${String(configuration.shape)}`);
  }
  // A shape reframes the floating surface only: bar spans the viewport, capsule is already a pill, and the tile
  // row owns its own inner padding and card radius.
  if (
    configuration.shape !== undefined &&
    configuration.shape !== "standard" &&
    (configuration.presentation !== "floating" || configuration.selection === "tile")
  ) {
    throw new TypeError("BottomNavigation shape requires floating presentation and emphasis selection");
  }
  if (configuration.iconEmphasis !== undefined && !iconEmphases.has(configuration.iconEmphasis)) {
    throw new TypeError(
      `Unsupported BottomNavigation iconEmphasis: ${String(configuration.iconEmphasis)}`,
    );
  }
  if (configuration.distribution === "center-gap" && itemCount % 2 !== 0) {
    throw new RangeError(
      "BottomNavigation center-gap distribution requires an even destination count",
    );
  }
}

export function resolveBottomNavigationConfiguration(
  configuration: BottomNavigationConfiguration,
  itemCount: number,
): ResolvedBottomNavigationConfiguration {
  validateBottomNavigationConfiguration(configuration, itemCount);
  return {
    presentation:
      configuration.presentation ?? bottomNavigationRecipeDefaults.presentation,
    distribution:
      configuration.distribution ?? bottomNavigationRecipeDefaults.distribution,
    density: configuration.density ?? bottomNavigationRecipeDefaults.density,
    direction: configuration.direction ?? bottomNavigationBehaviorDefaults.direction,
    keyboardBehavior:
      configuration.keyboardBehavior ??
      bottomNavigationBehaviorDefaults.keyboardBehavior,
    labels: configuration.labels ?? bottomNavigationBehaviorDefaults.labels,
    selection: configuration.selection ?? bottomNavigationBehaviorDefaults.selection,
    surface: configuration.surface ?? bottomNavigationBehaviorDefaults.surface,
    iconSize: configuration.iconSize ?? bottomNavigationBehaviorDefaults.iconSize,
    shape: configuration.shape ?? bottomNavigationBehaviorDefaults.shape,
    iconEmphasis: configuration.iconEmphasis ?? bottomNavigationBehaviorDefaults.iconEmphasis,
  };
}

export function validateBottomNavigationDescriptor<
  Key extends string,
  IconName extends string,
>(descriptor: BottomNavigationDescriptor<Key, IconName>): void {
  if (!isObject(descriptor)) {
    throw new TypeError("BottomNavigation descriptor must be an object");
  }
  rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
  validateTrimmedCopy(
    descriptor.accessibilityLabel,
    "BottomNavigation accessibilityLabel",
  );
  if (!Array.isArray(descriptor.items)) {
    throw new TypeError("BottomNavigation items must be an array");
  }
  validateTrimmedCopy(
    descriptor.selectedKey,
    "BottomNavigation selectedKey",
  );
  if (
    descriptor.items.length < bottomNavigationBehaviorDefaults.minItems ||
    descriptor.items.length > bottomNavigationBehaviorDefaults.maxItems
  ) {
    throw new RangeError(
      `BottomNavigation must contain ${bottomNavigationBehaviorDefaults.minItems} to ${bottomNavigationBehaviorDefaults.maxItems} destinations`,
    );
  }

  const ids = new Set<Key>();
  for (const item of descriptor.items) {
    validateItem(item);
    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate BottomNavigation item id: ${item.id}`);
    }
    ids.add(item.id);
  }

  const selected = descriptor.items.find(
    (item) => item.id === descriptor.selectedKey,
  );
  if (!selected) {
    throw new RangeError(
      `BottomNavigation selectedKey must exist: ${descriptor.selectedKey}`,
    );
  }
  if (selected.disabled) {
    throw new RangeError("BottomNavigation selected destination must be enabled");
  }
  const prominentIndex = descriptor.items.findIndex((item) => item.prominent === true);
  if (prominentIndex !== -1) {
    // The lifted circle is centered over the bar; any other slot would sit off-center and overlap a neighbour.
    if (
      descriptor.items.length % 2 === 0 ||
      prominentIndex !== (descriptor.items.length - 1) / 2 ||
      descriptor.items.filter((item) => item.prominent === true).length > 1
    ) {
      throw new RangeError(
        "BottomNavigation prominent destination must be the single middle item of an odd item count",
      );
    }
  }
}

/**
 * A prominent destination needs the plain row: center-gap reserves the same slot for a primaryAction, capsule
 * places actions beside the surface, and a tile card would paint behind the lifted circle.
 */
export function validateBottomNavigationProminence(
  items: readonly Readonly<{ prominent?: boolean }>[],
  configuration: ResolvedBottomNavigationConfiguration,
): void {
  if (!items.some((item) => item.prominent === true)) return;
  if (
    configuration.distribution !== "equal" ||
    configuration.presentation === "capsule" ||
    configuration.selection === "tile"
  ) {
    throw new TypeError(
      "BottomNavigation prominent destination requires equal distribution, bar or floating presentation and emphasis selection",
    );
  }
}

export function resolveBottomNavigationItem<
  Key extends string,
  IconName extends string,
>(
  item: BottomNavigationItemDescriptor<Key, IconName>,
): ResolvedBottomNavigationItemDescriptor<Key, IconName> {
  validateItem(item);
  const baseAccessibilityLabel = item.accessibilityLabel ?? item.label;
  const visibleBadgeLabel = item.badge
    ? formatCounterBadgeCount(item.badge.count, item.badge.max)
    : null;
  const badge = visibleBadgeLabel
    ? ({
        visibleLabel: visibleBadgeLabel,
        hiddenFromAccessibility: true,
      } as const)
    : null;

  return {
    id: item.id,
    label: item.label,
    icon: { name: item.icon.name, decorative: true },
    disabled: item.disabled ?? false,
    prominent: item.prominent ?? false,
    badge,
    resolvedAccessibilityLabel:
      badge && item.badge
        ? `${baseAccessibilityLabel}, ${item.badge.accessibilityLabel}`
        : baseAccessibilityLabel,
  };
}

export function resolveBottomNavigationDescriptor<
  Key extends string,
  IconName extends string,
>(
  descriptor: BottomNavigationDescriptor<Key, IconName>,
): ResolvedBottomNavigationDescriptor<Key, IconName> {
  validateBottomNavigationDescriptor(descriptor);
  return {
    accessibilityLabel: descriptor.accessibilityLabel,
    items: descriptor.items.map(resolveBottomNavigationItem),
    selectedKey: descriptor.selectedKey,
  };
}

/**
 * Produces navigation intent without mutating selectedKey. A renderer forwards
 * the request to its router, which updates selectedKey only after navigation.
 */
export function resolveBottomNavigationActivation<
  Key extends string,
  IconName extends string,
>(
  descriptor: BottomNavigationDescriptor<Key, IconName>,
  key: Key,
): BottomNavigationActivation<Key> | null {
  validateBottomNavigationDescriptor(descriptor);
  const item = descriptor.items.find((candidate) => candidate.id === key);
  if (!item || item.disabled) return null;
  return {
    key,
    reason: key === descriptor.selectedKey ? "reselect" : "navigate",
  };
}
