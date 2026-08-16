import { type SemanticIconName } from "./icon.js";
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
export type InternalLinkDestination = ForbiddenLinkCommands & Readonly<{
    kind: "internal";
    href: string;
}>;
export type ExternalLinkDestination = ForbiddenLinkCommands & Readonly<{
    kind: "external";
    href: string;
}>;
export type LinkDestination = InternalLinkDestination | ExternalLinkDestination;
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
export type LinkDescriptor = ForbiddenLinkCommands & Readonly<{
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
export declare function validateLinkDestination(destination: LinkDestination): void;
export declare function validateLinkDescriptor(descriptor: LinkDescriptor): void;
export declare function resolveLinkDescriptor(descriptor: LinkDescriptor): ResolvedLinkDescriptor;
export {};
//# sourceMappingURL=link.d.ts.map