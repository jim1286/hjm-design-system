import { type ReactNode } from "react";
import { type PhotoAttachmentLabels, type PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ImageViewerProps, ImageViewerTrigger as ImageViewerTriggerType } from "../image-viewer.js";
import { type ImageProps } from "../supplemental-display.js";
export type { PhotoAttachmentLabels, PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";
/** ImageViewer's own copy (it validates every label even for one photo). */
export type PhotoAttachmentViewerLabels = Pick<ImageViewerProps, "closeLabel" | "previousLabel" | "nextLabel" | "loadingLabel" | "errorLabel" | "retryLabel">;
/** Product image hosts (framework image, authorized fetch) for the preview and the viewer. Defaults use `<img>`. */
export type PhotoAttachmentImageHost = Readonly<{
    renderImage?: ImageProps["renderImage"];
    renderViewerImage?: ImageViewerProps["renderImage"];
}>;
type ViewerParts = Readonly<{
    Viewer: (props: ImageViewerProps) => ReactNode;
    Trigger: typeof ImageViewerTriggerType;
}>;
type ViewerProps = Readonly<{
    viewerLabels: PhotoAttachmentViewerLabels;
    imageHost?: PhotoAttachmentImageHost;
}>;
export type AttachedPhotoProps = ViewerProps & Readonly<{
    photo: PhotoAttachmentPhoto;
    /** Accessible name of the photo button and the viewer item, e.g. "View attached photo". */
    label: string;
    /** Load result of the photo under the text, e.g. to offer a retry when an authorized address is refused. */
    onLoadStatusChange?: ImageProps["onLoadStatusChange"];
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type PhotoAttachmentFieldProps = ViewerProps & Readonly<{
    photo: PhotoAttachmentPhoto | null;
    labels: PhotoAttachmentLabels & Readonly<{
        source: PhotoSourceLabels;
    }>;
    /** Product picker for the chosen source; called inside the click so the file input keeps the user activation. */
    onSelectSource(source: PhotoSource): void;
    onRemove(): void;
    /** While the file chooser or the product's shrinking runs. Locks choose and shows its spinner. */
    picking?: boolean;
    /** Host lock (submitting, rate limit). The preview stays viewable. */
    disabled?: boolean;
    cameraAvailable?: boolean;
    /** Product message for a failed pick (unsupported or unreadable file). The draft is kept. */
    error?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function createAttachedPhoto(parts: ViewerParts): ({ photo, label, layoutStyle, ...viewer }: AttachedPhotoProps) => import("react").JSX.Element;
export declare function createPhotoAttachmentField(parts: ViewerParts): (props: PhotoAttachmentFieldProps) => import("react").JSX.Element;
//# sourceMappingURL=photo-attachment.d.ts.map