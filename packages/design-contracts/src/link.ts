import {
  semanticIconNames,
  type SemanticIconName,
} from "./icon.js";

type ForbiddenLinkCommands = Readonly<{
  /** Unavailable destinations render as text; links are never disabled controls. */
  disabled?: never;
  /** Navigation is owned by href and its platform router, not an action callback. */
  onClick?: never;
  onPress?: never;
  /** Downloads are a separate platform workflow. */
  download?: never;
  /** Visited is a Web pseudo-state, not cross-platform application state. */
  visited?: never;
}>;

export type InternalLinkDestination = ForbiddenLinkCommands &
  Readonly<{
    kind: "internal";
    href: string;
  }>;

export type ExternalLinkDestination = ForbiddenLinkCommands &
  Readonly<{
    kind: "external";
    href: string;
  }>;

export type LinkDestination =
  | InternalLinkDestination
  | ExternalLinkDestination;

/**
 * Link owns icon appearance through linkRecipe. Callers only choose an HJM
 * semantic mark; size, tone, weight, and directionality cannot drift.
 */
export type LinkIconDescriptor = Readonly<{
  name: SemanticIconName;
  decorative?: true;
  accessibilityLabel?: never;
  size?: never;
  tone?: never;
  weight?: never;
  directionality?: never;
}>;

export type ResolvedLinkIconDescriptor = Readonly<{
  name: SemanticIconName;
  decorative: true;
}>;

export type LinkDescriptor = ForbiddenLinkCommands &
  Readonly<{
    label: string;
    accessibilityLabel?: string;
    destination: LinkDestination;
    leadingIcon?: LinkIconDescriptor;
    trailingIcon?: LinkIconDescriptor;
  }>;

export type ResolvedLinkDescriptor = Readonly<{
  label: string;
  resolvedAccessibilityLabel: string;
  destination: LinkDestination;
  leadingIcon: ResolvedLinkIconDescriptor | null;
  trailingIcon: ResolvedLinkIconDescriptor | null;
}>;

const externalProtocols = new Set(["https:", "http:", "mailto:", "tel:"]);
const semanticNames = new Set<string>(semanticIconNames);
const descriptorKeys = new Set([
  "label",
  "accessibilityLabel",
  "destination",
  "leadingIcon",
  "trailingIcon",
]);
const destinationKeys = new Set(["kind", "href"]);
const iconKeys = new Set(["name", "decorative"]);

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateCopy(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Link ${field} must not be empty`);
  }
  if (value !== value.trim()) {
    throw new TypeError(`Link ${field} must not start or end with whitespace`);
  }
}

function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new TypeError(`Unsupported ${field} field: ${key}`);
    }
  }
}

function normalizedCopy(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase();
}

function validateHref(href: unknown, kind: LinkDestination["kind"]): void {
  validateCopy(href, "href");
  if (/\s/u.test(href)) {
    throw new TypeError("Link href must encode whitespace");
  }
  if (kind === "internal") {
    if (href.includes("\\")) {
      throw new TypeError("Internal Link href must not contain backslashes");
    }
    if (
      (href.startsWith("/") && !href.startsWith("//")) ||
      href.startsWith("?") ||
      href.startsWith("#")
    ) {
      return;
    }
    throw new TypeError(
      "Internal Link href must be root-relative, query-relative, or a fragment",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    throw new TypeError("External Link href must be an absolute URL");
  }
  if (!externalProtocols.has(parsed.protocol)) {
    throw new TypeError(
      `Unsupported external Link protocol: ${parsed.protocol}`,
    );
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    throw new TypeError("External Link href must not contain credentials");
  }
}

function rejectCommandFields(value: Readonly<Record<string, unknown>>): void {
  for (const field of [
    "disabled",
    "onClick",
    "onPress",
    "download",
    "visited",
  ] as const) {
    if (Object.prototype.hasOwnProperty.call(value, field)) {
      throw new TypeError(`Link must not provide ${field}`);
    }
  }
}

export function validateLinkDestination(
  destination: LinkDestination,
): void {
  if (!isObject(destination)) {
    throw new TypeError("Link destination must be an object");
  }
  const candidate = destination as Readonly<Record<string, unknown>>;
  rejectCommandFields(candidate);
  rejectUnknownKeys(candidate, destinationKeys, "Link destination");
  const kind = candidate.kind;
  if (kind !== "internal" && kind !== "external") {
    throw new TypeError(
      `Unsupported Link destination kind: ${String(kind)}`,
    );
  }
  validateHref(candidate.href, kind);
}

function validateLinkIcon(
  icon: LinkIconDescriptor,
  field: string,
): void {
  if (!isObject(icon)) {
    throw new TypeError(`Link ${field} must be an icon descriptor`);
  }
  const candidate = icon as Readonly<Record<string, unknown>>;
  if (
    candidate.decorative !== undefined &&
    candidate.decorative !== true
  ) {
    throw new TypeError(`Link ${field} must be decorative`);
  }
  rejectUnknownKeys(candidate, iconKeys, `Link ${field}`);
  if (typeof candidate.name !== "string" || !semanticNames.has(candidate.name)) {
    throw new TypeError(`Link ${field} must use an HJM semantic icon name`);
  }
}

export function validateLinkDescriptor(descriptor: LinkDescriptor): void {
  if (!isObject(descriptor)) {
    throw new TypeError("Link descriptor must be an object");
  }
  const candidate = descriptor as Readonly<Record<string, unknown>>;
  rejectCommandFields(candidate);
  rejectUnknownKeys(candidate, descriptorKeys, "Link descriptor");
  validateCopy(descriptor.label, "label");
  if (descriptor.accessibilityLabel !== undefined) {
    validateCopy(descriptor.accessibilityLabel, "accessibilityLabel");
    if (
      !normalizedCopy(descriptor.accessibilityLabel).includes(
        normalizedCopy(descriptor.label),
      )
    ) {
      throw new TypeError(
        "Link accessibilityLabel must include the visible label",
      );
    }
  }
  validateLinkDestination(descriptor.destination);
  if (descriptor.leadingIcon !== undefined) {
    validateLinkIcon(descriptor.leadingIcon, "leadingIcon");
  }
  if (descriptor.trailingIcon !== undefined) {
    validateLinkIcon(descriptor.trailingIcon, "trailingIcon");
  }
}

function resolveLinkIcon(
  icon: LinkIconDescriptor | undefined,
): ResolvedLinkIconDescriptor | null {
  return icon === undefined ? null : { name: icon.name, decorative: true };
}

export function resolveLinkDescriptor(
  descriptor: LinkDescriptor,
): ResolvedLinkDescriptor {
  validateLinkDescriptor(descriptor);
  return {
    label: descriptor.label,
    resolvedAccessibilityLabel:
      descriptor.accessibilityLabel ?? descriptor.label,
    destination: {
      kind: descriptor.destination.kind,
      href: descriptor.destination.href,
    },
    leadingIcon: resolveLinkIcon(descriptor.leadingIcon),
    trailingIcon: resolveLinkIcon(descriptor.trailingIcon),
  };
}
