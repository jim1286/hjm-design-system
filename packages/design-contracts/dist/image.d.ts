export type ImageFit = "cover" | "contain" | "fill";
export type ImageLoadStatus = "idle" | "loading" | "loaded" | "error";
export type ImageInspectionMode = "fit" | "double" | "pixels";
/** Exact image inspection sizes use layout units, not device physical pixels (Utilverse ADR-0020). */
export declare function resolveImageInspectionGeometry(image: Readonly<{
    width: number;
    height: number;
}>, viewport: Readonly<{
    width: number;
    height: number;
}>, mode: ImageInspectionMode): {
    scale: number;
    width: number;
    height: number;
    panBounds: {
        x: number;
        y: number;
    };
};
export declare const imageDefaults: {
    readonly fit: "cover";
};
type ImageAppearance = Readonly<{
    src: string;
    /** Intrinsic dimensions reserve layout space before the asset loads. */
    width: number;
    height: number;
    fit?: ImageFit;
}>;
/**
 * Same shape as Icon's decorative/informative split: a picture that only
 * repeats a caption or label already visible nearby stays decorative, and
 * only a self-sufficient picture requires localized alt copy.
 */
export type DecorativeImageDescriptor = ImageAppearance & Readonly<{
    decorative?: true;
    accessibilityLabel?: never;
}>;
export type InformativeImageDescriptor = ImageAppearance & Readonly<{
    decorative: false;
    accessibilityLabel: string;
}>;
export type ImageDescriptor = DecorativeImageDescriptor | InformativeImageDescriptor;
export type ResolvedImageDescriptor = (Required<Omit<DecorativeImageDescriptor, "accessibilityLabel">> & Readonly<{
    accessibilityLabel?: never;
}>) | Required<InformativeImageDescriptor>;
export declare function validateImageDescriptor(descriptor: ImageDescriptor): void;
export declare function resolveImageDescriptor(descriptor: ImageDescriptor): ResolvedImageDescriptor;
/**
 * Reserves layout space ahead of load so a slow asset never shifts
 * surrounding content — the same problem `width`/`height` solve for
 * `next/image`, translated without a bundler dependency.
 */
export declare function resolveImageAspectRatio(width: number, height: number): number;
/**
 * The fallback node on `error` always carries the resolved
 * `accessibilityLabel`, never a generic "broken image" string. An
 * informative picture's meaning does not disappear because the asset
 * failed to load; only its visual form changes.
 */
export declare function resolveImageFallbackAccessibilityLabel(descriptor: ResolvedImageDescriptor): string | undefined;
/**
 * Web `object-fit` and RN `resizeMode` diverge only in the `fill` case;
 * `fills` is the platform-neutral name and `nativeResizeModes` is the one
 * translation renderers need, kept here instead of re-derived per product.
 */
export declare const nativeResizeModes: {
    readonly cover: "cover";
    readonly contain: "contain";
    readonly fill: "stretch";
};
export declare const imageRecipe: {
    readonly slots: readonly ["root", "image", "placeholder", "fallbackIcon"];
    readonly defaults: {
        readonly fit: "cover";
    };
    readonly fits: readonly ImageFit[];
    readonly placeholder: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
    };
    readonly fallback: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly icon: {
            readonly name: "error";
            readonly tone: "secondary";
        };
    };
    readonly radius: "md";
};
/**
 * Press target that opens ImageViewer from product media (ImageViewerTrigger). 2026-10-23: the portfolio site
 * (`App.tsx` raw button) and Spint (`MarkPhoto`, `ComposeScreen` Pressable + Image) each wrapped an image to open the
 * viewer, with their own name, focus ring and cursor. The trigger owns the button semantics, the image-frame
 * radius for the focus ring, the zoom cursor and the pressed opacity; the media stays decorative inside it.
 */
export declare const imageViewerTriggerRecipe: {
    readonly radius: "md";
    readonly cursor: "zoom-in";
    readonly pressedOpacity: 0.86;
    readonly disabledOpacity: 0.5;
};
export declare function validateImageViewerTriggerLabel(label: string): void;
/**
 * Circular profile-photo crop (2026-10-29 user rule: profile photos are framed in a circle like Instagram before
 * upload). Web and Native draw the same square viewport with a circular mask; the product crops the returned
 * source-pixel square and uploads it. The square keeps the circle's bounding box, so a cover-fitted avatar shows
 * exactly the framed circle.
 */
export declare const circularPhotoCropRecipe: {
    /** Largest zoom over the cover scale; beyond this a small photo turns into blur. */
    readonly maxZoom: 4;
    /** Mask outside the circle (on the black editing surface). */
    readonly maskOpacity: 0.6;
    /** Hairline around the circle so its edge reads on dark and light photos. */
    readonly ringWidth: 1;
    /** Horizontal space kept around the viewport, in px/pt. */
    readonly gutter: 24;
};
export type CircularPhotoCropState = Readonly<{
    zoom: number;
    x: number;
    y: number;
}>;
export type CircularPhotoCropRect = Readonly<{
    originX: number;
    originY: number;
    width: number;
    height: number;
}>;
/** Display px per source px at zoom 1: the photo covers the viewport on its short side. */
export declare function circularPhotoCoverScale(sourceWidth: number, sourceHeight: number, viewport: number): number;
/**
 * Keeps the photo covering the viewport: zoom within [1, maxZoom] and the offset (photo centre from viewport
 * centre, display px) within the overhang, so the circle never shows empty space.
 */
export declare function clampCircularPhotoCrop(state: CircularPhotoCropState, sourceWidth: number, sourceHeight: number, viewport: number): CircularPhotoCropState;
/** Source-pixel square under the viewport, rounded inside the photo bounds. */
export declare function resolveCircularPhotoCrop(state: CircularPhotoCropState, sourceWidth: number, sourceHeight: number, viewport: number): CircularPhotoCropRect;
/**
 * One optional photo attached to written content (2026-11-03 user request: Spint marks and Diairy letters attach a
 * photo the same way, so the add → source sheet → preview → viewer → replace/remove flow lives here once instead of in
 * each compose screen). HJM owns the order, the action states and the viewer; the product owns picking (system picker,
 * permission, decoding), the upload and when it runs, and every message. One photo only: several photos are the
 * MediaSelectionScreen/MessageComposer flows.
 */
export declare const photoAttachmentRecipe: {
    /** Space between the choose button, preview and its actions. */
    readonly gap: "xs";
    /** Choose sits under the text like other secondary field actions; remove is the quieter neighbour of replace. */
    readonly chooseTone: "secondary";
    readonly removeTone: "ghost";
    readonly actionSize: "small";
    /**
     * Preview keeps the photo's ratio down to 3:4; a taller photo is cover-cropped to 3:4 so it cannot push the text
     * off screen. A ratio (not a height) keeps Web and Native identical at every width. The viewer shows the whole photo.
     */
    readonly previewMinAspectRatio: number;
};
export type PhotoAttachmentPhoto = Readonly<{
    uri: string;
    width: number;
    height: number;
}>;
/** Product upload of the attached photo; absent when the product uploads later (at submit) or already finished. */
export type PhotoAttachmentUpload = Readonly<{
    status: "uploading";
    progress: number | null;
    progressLabel?: string;
}> | Readonly<{
    status: "error";
    message: string;
}>;
export type PhotoAttachmentActionState = Readonly<{
    choose: Readonly<{
        label: "add" | "replace";
        disabled: boolean;
        loading: boolean;
    }>;
    remove: Readonly<{
        visible: boolean;
        disabled: boolean;
    }>;
    /** Opening the viewer never changes the draft, so only an absent photo hides it. */
    preview: Readonly<{
        visible: boolean;
    }>;
}>;
/**
 * While the system picker is open or the photo is uploading, choose and remove are locked: a second picker or a removal
 * would race the result the product is waiting for (Spint ComposeScreen kept a ref for this). An upload error unlocks
 * them again — the user may retry, replace or drop the photo. `disabled` is the host's own lock (submitting, limits).
 */
export declare function resolvePhotoAttachmentActions(input: Readonly<{
    hasPhoto: boolean;
    picking?: boolean;
    disabled?: boolean;
    upload?: PhotoAttachmentUpload["status"];
}>): PhotoAttachmentActionState;
export type PhotoAttachmentLabels = Readonly<{
    add: string;
    replace: string;
    remove: string;
    /** Accessible name of the preview button and the viewer item, e.g. "View attached photo". */
    preview: string;
}>;
export declare function validatePhotoAttachment(labels: PhotoAttachmentLabels, photo: PhotoAttachmentPhoto | null): void;
/** Preview frame size for Image: the photo's own size, or a 3:4 frame of the same width for taller photos. */
export declare function resolvePhotoAttachmentPreviewSize(photo: PhotoAttachmentPhoto): Readonly<{
    width: number;
    height: number;
    fit: "cover";
}>;
export {};
//# sourceMappingURL=image.d.ts.map