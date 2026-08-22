import { semanticColors } from "./semantic-colors.js";
export const imageDefaults = {
    fit: "cover",
};
const fits = ["cover", "contain", "fill"];
function assertCopy(value, field) {
    if (value.trim().length === 0) {
        throw new TypeError(`Image ${field} must not be empty`);
    }
}
function assertDimension(value, field) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new RangeError(`Image ${field} must be a positive finite number`);
    }
}
export function validateImageDescriptor(descriptor) {
    assertCopy(descriptor.src, "src");
    assertDimension(descriptor.width, "width");
    assertDimension(descriptor.height, "height");
    if (descriptor.fit !== undefined && !fits.includes(descriptor.fit)) {
        throw new TypeError(`Unsupported Image fit: ${String(descriptor.fit)}`);
    }
    const runtimeDecorative = descriptor.decorative;
    const runtimeLabel = descriptor.accessibilityLabel;
    if (runtimeDecorative !== undefined &&
        runtimeDecorative !== true &&
        runtimeDecorative !== false) {
        throw new TypeError("Image decorative must be a boolean when provided");
    }
    if (runtimeDecorative === false) {
        if (typeof runtimeLabel !== "string" || runtimeLabel.trim().length === 0) {
            throw new TypeError("Informative Image accessibilityLabel must not be empty");
        }
    }
    else if (runtimeLabel !== undefined) {
        throw new TypeError("Decorative Image must not provide accessibilityLabel");
    }
}
export function resolveImageDescriptor(descriptor) {
    validateImageDescriptor(descriptor);
    const common = {
        src: descriptor.src,
        width: descriptor.width,
        height: descriptor.height,
        fit: descriptor.fit ?? imageDefaults.fit,
    };
    if (descriptor.decorative === false) {
        return {
            ...common,
            decorative: false,
            accessibilityLabel: descriptor.accessibilityLabel,
        };
    }
    return { ...common, decorative: true };
}
/**
 * Reserves layout space ahead of load so a slow asset never shifts
 * surrounding content — the same problem `width`/`height` solve for
 * `next/image`, translated without a bundler dependency.
 */
export function resolveImageAspectRatio(width, height) {
    assertDimension(width, "width");
    assertDimension(height, "height");
    return width / height;
}
/**
 * The fallback node on `error` always carries the resolved
 * `accessibilityLabel`, never a generic "broken image" string. An
 * informative picture's meaning does not disappear because the asset
 * failed to load; only its visual form changes.
 */
export function resolveImageFallbackAccessibilityLabel(descriptor) {
    return descriptor.decorative ? undefined : descriptor.accessibilityLabel;
}
const errorIconName = "error";
const fallbackIconTone = "secondary";
/**
 * Web `object-fit` and RN `resizeMode` diverge only in the `fill` case;
 * `fills` is the platform-neutral name and `nativeResizeModes` is the one
 * translation renderers need, kept here instead of re-derived per product.
 */
export const nativeResizeModes = {
    cover: "cover",
    contain: "contain",
    fill: "stretch",
};
export const imageRecipe = {
    slots: ["root", "image", "placeholder", "fallbackIcon"],
    defaults: imageDefaults,
    fits,
    placeholder: {
        background: semanticColors.surface.sunken,
    },
    fallback: {
        background: semanticColors.surface.sunken,
        icon: { name: errorIconName, tone: fallbackIconTone },
    },
    radius: "md",
};
//# sourceMappingURL=image.js.map