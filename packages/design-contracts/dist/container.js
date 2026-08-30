import { layout, spacing } from "./foundations.js";
export const containerDefaults = {
    size: "content",
    gutter: "regular",
};
export const containerRecipe = {
    slots: ["root"],
    defaults: containerDefaults,
    maxWidths: {
        reading: layout.readingMaxWidth,
        content: layout.contentMaxWidth,
        full: null,
    },
    gutters: {
        none: 0,
        compact: spacing.md,
        regular: spacing.lg,
        spacious: spacing.xl,
    },
    alignment: "inline-center",
};
const sizes = new Set(["reading", "content", "full"]);
const gutters = new Set(["none", "compact", "regular", "spacious"]);
export function validateContainerDescriptor(descriptor) {
    if (descriptor.size !== undefined && !sizes.has(descriptor.size)) {
        throw new TypeError(`Unsupported Container size: ${String(descriptor.size)}`);
    }
    if (descriptor.gutter !== undefined && !gutters.has(descriptor.gutter)) {
        throw new TypeError(`Unsupported Container gutter: ${String(descriptor.gutter)}`);
    }
}
export function resolveContainerDescriptor(descriptor = {}) {
    validateContainerDescriptor(descriptor);
    const size = descriptor.size ?? containerDefaults.size;
    const gutter = descriptor.gutter ?? containerDefaults.gutter;
    return {
        size,
        gutter,
        maxWidth: containerRecipe.maxWidths[size],
        paddingInline: containerRecipe.gutters[gutter],
    };
}
//# sourceMappingURL=container.js.map