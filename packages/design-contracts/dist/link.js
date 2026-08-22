import { semanticIconNames, } from "./icon.js";
const externalProtocols = new Set(["https:", "http:", "mailto:", "tel:"]);
const semanticNames = new Set(semanticIconNames);
const descriptorKeys = new Set([
    "label",
    "accessibilityLabel",
    "destination",
    "leadingIcon",
    "trailingIcon",
]);
const destinationKeys = new Set(["kind", "href"]);
const iconKeys = new Set(["name", "decorative"]);
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validateCopy(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Link ${field} must not be empty`);
    }
    if (value !== value.trim()) {
        throw new TypeError(`Link ${field} must not start or end with whitespace`);
    }
}
function rejectUnknownKeys(value, allowed, field) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
            throw new TypeError(`Unsupported ${field} field: ${key}`);
        }
    }
}
function normalizedCopy(value) {
    return value.normalize("NFKC").toLocaleLowerCase();
}
function validateHref(href, kind) {
    validateCopy(href, "href");
    if (/\s/u.test(href)) {
        throw new TypeError("Link href must encode whitespace");
    }
    if (kind === "internal") {
        if (href.includes("\\")) {
            throw new TypeError("Internal Link href must not contain backslashes");
        }
        if ((href.startsWith("/") && !href.startsWith("//")) ||
            href.startsWith("?") ||
            href.startsWith("#")) {
            return;
        }
        throw new TypeError("Internal Link href must be root-relative, query-relative, or a fragment");
    }
    let parsed;
    try {
        parsed = new URL(href);
    }
    catch {
        throw new TypeError("External Link href must be an absolute URL");
    }
    if (!externalProtocols.has(parsed.protocol)) {
        throw new TypeError(`Unsupported external Link protocol: ${parsed.protocol}`);
    }
    if (parsed.username.length > 0 || parsed.password.length > 0) {
        throw new TypeError("External Link href must not contain credentials");
    }
}
function rejectCommandFields(value) {
    for (const field of [
        "disabled",
        "onClick",
        "onPress",
        "download",
        "visited",
    ]) {
        if (Object.prototype.hasOwnProperty.call(value, field)) {
            throw new TypeError(`Link must not provide ${field}`);
        }
    }
}
export function validateLinkDestination(destination) {
    if (!isObject(destination)) {
        throw new TypeError("Link destination must be an object");
    }
    const candidate = destination;
    rejectCommandFields(candidate);
    rejectUnknownKeys(candidate, destinationKeys, "Link destination");
    const kind = candidate.kind;
    if (kind !== "internal" && kind !== "external") {
        throw new TypeError(`Unsupported Link destination kind: ${String(kind)}`);
    }
    validateHref(candidate.href, kind);
}
function validateLinkIcon(icon, field) {
    if (!isObject(icon)) {
        throw new TypeError(`Link ${field} must be an icon descriptor`);
    }
    const candidate = icon;
    if (candidate.decorative !== undefined &&
        candidate.decorative !== true) {
        throw new TypeError(`Link ${field} must be decorative`);
    }
    rejectUnknownKeys(candidate, iconKeys, `Link ${field}`);
    if (typeof candidate.name !== "string" || !semanticNames.has(candidate.name)) {
        throw new TypeError(`Link ${field} must use an HJM semantic icon name`);
    }
}
export function validateLinkDescriptor(descriptor) {
    if (!isObject(descriptor)) {
        throw new TypeError("Link descriptor must be an object");
    }
    const candidate = descriptor;
    rejectCommandFields(candidate);
    rejectUnknownKeys(candidate, descriptorKeys, "Link descriptor");
    validateCopy(descriptor.label, "label");
    if (descriptor.accessibilityLabel !== undefined) {
        validateCopy(descriptor.accessibilityLabel, "accessibilityLabel");
        if (!normalizedCopy(descriptor.accessibilityLabel).includes(normalizedCopy(descriptor.label))) {
            throw new TypeError("Link accessibilityLabel must include the visible label");
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
function resolveLinkIcon(icon) {
    return icon === undefined ? null : { name: icon.name, decorative: true };
}
export function resolveLinkDescriptor(descriptor) {
    validateLinkDescriptor(descriptor);
    return {
        label: descriptor.label,
        resolvedAccessibilityLabel: descriptor.accessibilityLabel ?? descriptor.label,
        destination: {
            kind: descriptor.destination.kind,
            href: descriptor.destination.href,
        },
        leadingIcon: resolveLinkIcon(descriptor.leadingIcon),
        trailingIcon: resolveLinkIcon(descriptor.trailingIcon),
    };
}
//# sourceMappingURL=link.js.map