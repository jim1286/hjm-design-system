import { semanticColors } from "./semantic-colors.js";
import { opacity } from "./foundations.js";
/** Exact image inspection sizes use layout units, not device physical pixels (Utilverse ADR-0020). */
export function resolveImageInspectionGeometry(image, viewport, mode) {
    if (![image.width, image.height, viewport.width, viewport.height].every(value => Number.isFinite(value) && value > 0)) {
        throw new RangeError("Image inspection needs positive finite image and viewport sizes");
    }
    if (mode !== "fit" && mode !== "double" && mode !== "pixels")
        throw new TypeError("Unknown image inspection mode");
    // Fit can enlarge a small result, as the existing product preview does. Clamping
    // it to 1 would make fit and pixels indistinguishable for those images.
    const scale = mode === "pixels" ? 1 : Math.min(viewport.width / image.width, viewport.height / image.height) * (mode === "double" ? 2 : 1);
    const width = image.width * scale, height = image.height * scale;
    if (![scale, width, height].every(value => Number.isFinite(value) && value > 0)) {
        throw new RangeError("Image inspection geometry exceeds finite layout range");
    }
    return { scale, width, height, panBounds: {
            x: Math.max(0, width - viewport.width) / 2,
            y: Math.max(0, height - viewport.height) / 2,
        } };
}
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
        background: semanticColors.canvas,
    },
    fallback: {
        background: semanticColors.canvas,
        icon: { name: errorIconName, tone: fallbackIconTone },
    },
    radius: "md",
};
/**
 * Press target that opens ImageViewer from product media (ImageViewerTrigger). 2026-10-23: the portfolio site
 * (`App.tsx` raw button) and Spint (`MarkPhoto`, `ComposeScreen` Pressable + Image) each wrapped an image to open the
 * viewer, with their own name, focus ring and cursor. The trigger owns the button semantics, the image-frame
 * radius for the focus ring, the zoom cursor and the pressed opacity; the media stays decorative inside it.
 */
export const imageViewerTriggerRecipe = {
    radius: imageRecipe.radius,
    cursor: "zoom-in",
    pressedOpacity: opacity.pressed,
    disabledOpacity: opacity.disabled,
};
export function validateImageViewerTriggerLabel(label) {
    if (typeof label !== "string" || label.trim().length === 0)
        throw new TypeError("ImageViewerTrigger needs a localized label");
}
/**
 * Circular profile-photo crop (2026-10-29 user rule: profile photos are framed in a circle like Instagram before
 * upload). Web and Native draw the same square viewport with a circular mask; the product crops the returned
 * source-pixel square and uploads it. The square keeps the circle's bounding box, so a cover-fitted avatar shows
 * exactly the framed circle.
 */
export const circularPhotoCropRecipe = {
    /** Largest zoom over the cover scale; beyond this a small photo turns into blur. */
    maxZoom: 4,
    /** Mask outside the circle (on the black editing surface). */
    maskOpacity: 0.6,
    /** Hairline around the circle so its edge reads on dark and light photos. */
    ringWidth: 1,
    /** Horizontal space kept around the viewport, in px/pt. */
    gutter: 24,
};
/** Display px per source px at zoom 1: the photo covers the viewport on its short side. */
export function circularPhotoCoverScale(sourceWidth, sourceHeight, viewport) {
    if (!(sourceWidth > 0 && sourceHeight > 0 && viewport > 0))
        throw new RangeError("Crop needs positive source and viewport sizes");
    return viewport / Math.min(sourceWidth, sourceHeight);
}
/**
 * Keeps the photo covering the viewport: zoom within [1, maxZoom] and the offset (photo centre from viewport
 * centre, display px) within the overhang, so the circle never shows empty space.
 */
export function clampCircularPhotoCrop(state, sourceWidth, sourceHeight, viewport) {
    const zoom = Math.min(circularPhotoCropRecipe.maxZoom, Math.max(1, state.zoom));
    const scale = circularPhotoCoverScale(sourceWidth, sourceHeight, viewport) * zoom;
    const limitX = Math.max(0, (sourceWidth * scale - viewport) / 2);
    const limitY = Math.max(0, (sourceHeight * scale - viewport) / 2);
    return { zoom, x: Math.min(limitX, Math.max(-limitX, state.x)), y: Math.min(limitY, Math.max(-limitY, state.y)) };
}
/** Source-pixel square under the viewport, rounded inside the photo bounds. */
export function resolveCircularPhotoCrop(state, sourceWidth, sourceHeight, viewport) {
    const clamped = clampCircularPhotoCrop(state, sourceWidth, sourceHeight, viewport);
    const scale = circularPhotoCoverScale(sourceWidth, sourceHeight, viewport) * clamped.zoom;
    const size = Math.min(sourceWidth, sourceHeight, Math.round(viewport / scale));
    const centreX = sourceWidth / 2 - clamped.x / scale;
    const centreY = sourceHeight / 2 - clamped.y / scale;
    const originX = Math.min(sourceWidth - size, Math.max(0, Math.round(centreX - size / 2)));
    const originY = Math.min(sourceHeight - size, Math.max(0, Math.round(centreY - size / 2)));
    return { originX, originY, width: size, height: size };
}
/**
 * One optional photo attached to written content (2026-11-03 user request: Spint marks and Diairy letters attach a
 * photo the same way). Shape follows common composers the user asked to reference (Threads/X post composer, Slowly
 * letters): a small icon action under the text, then the attached photo as a preview with a corner remove button —
 * no full-width buttons and no separate replace (remove, then add). No hint copy (2026-11-03 user decision). HJM owns
 * the order, the locks and the viewer; the product owns picking, the upload (at submit) and the messages. One photo
 * only: several photos are the MediaSelectionScreen/MessageComposer flows.
 */
export const photoAttachmentRecipe = {
    /** Space between the text above, the choose action and the preview. */
    gap: "xs",
    /** The choose action is quieter than the text and the submit action. */
    chooseTone: "ghost",
    chooseSize: "small",
    /**
     * Remove sits inside the preview's top-end corner, always visible: a hover-only remove cannot be used on touch
     * screens. A filled circle keeps it readable over light and dark photos.
     */
    removeTone: "secondary",
    removeSize: "small",
    removeShape: "circle",
    removeInset: "xs",
    /**
     * Preview keeps the photo's ratio down to 3:4; a taller photo is cover-cropped to 3:4 so it cannot push the text
     * off screen. A ratio (not a height) keeps Web and Native identical at every width. The viewer shows the whole photo.
     */
    previewMinAspectRatio: 3 / 4,
};
/**
 * While the system picker is open, choose shows its spinner and cannot open a second picker (Spint ComposeScreen kept a
 * ref for this). `disabled` is the host's own lock (submitting, limits): it locks choose and remove, not the viewer.
 */
export function resolvePhotoAttachmentActions(input) {
    const locked = Boolean(input.picking) || Boolean(input.disabled);
    return {
        choose: { visible: !input.hasPhoto, disabled: locked, loading: Boolean(input.picking) },
        remove: { visible: input.hasPhoto, disabled: locked },
        preview: { visible: input.hasPhoto },
    };
}
export function validatePhotoAttachment(labels, photo) {
    if ([labels.add, labels.remove, labels.preview].some((label) => typeof label !== "string" || !label.trim()))
        throw new TypeError("PhotoAttachmentField needs localized add, remove and preview labels");
    if (photo && (!photo.uri.trim() || !(photo.width > 0 && photo.height > 0)))
        throw new TypeError("PhotoAttachmentField needs a sized photo");
}
/** Preview frame size for Image: the photo's own size, or a 3:4 frame of the same width for taller photos. */
export function resolvePhotoAttachmentPreviewSize(photo) {
    const height = Math.min(photo.height, Math.round(photo.width / photoAttachmentRecipe.previewMinAspectRatio));
    return { width: photo.width, height, fit: "cover" };
}
//# sourceMappingURL=image.js.map