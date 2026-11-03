import { type ReactNode } from "react";
import { type PhotoAttachmentLabels, type PhotoAttachmentPhoto, type PhotoAttachmentUpload } from "@hjmds/design-contracts/components/image";
import type { UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { type ImageProps } from "../data-display.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ImageViewerProps } from "../image-viewer.js";
export type { PhotoAttachmentLabels, PhotoAttachmentPhoto, PhotoAttachmentUpload } from "@hjmds/design-contracts/components/image";
/** ImageViewer's own copy (it validates every label even for one photo). */
export type PhotoAttachmentViewerLabels = Pick<ImageViewerProps, "closeLabel" | "previousLabel" | "nextLabel" | "loadingLabel" | "errorLabel" | "retryLabel">;
/** Product image hosts (auth headers, expo-image disk cache) for the preview and the viewer. Defaults use RN Image. */
export type PhotoAttachmentImageHost = Readonly<{
    sourceAdapter?: ImageProps["sourceAdapter"];
    renderImage?: ImageProps["renderImage"];
    renderViewerImage?: ImageViewerProps["renderImage"];
}>;
type ViewerProps = Readonly<{
    viewerLabels: PhotoAttachmentViewerLabels;
    safeAreaInsets: ImageViewerProps["safeAreaInsets"];
    imageHost?: PhotoAttachmentImageHost;
    /** The viewer component, passed by the image-viewer entry so this file does not import it back (cycle). */
    Viewer: (props: ImageViewerProps) => ReactNode;
}>;
export type AttachedPhotoProps = Omit<ViewerProps, "Viewer"> & Readonly<{
    photo: PhotoAttachmentPhoto;
    /** Accessible name of the photo button and the viewer item, e.g. "View attached photo". */
    label: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type PhotoAttachmentFieldProps = Omit<ViewerProps, "Viewer"> & Readonly<{
    photo: PhotoAttachmentPhoto | null;
    labels: PhotoAttachmentLabels & Readonly<{
        source: PhotoSourceLabels;
        upload: UploadItemLabels;
    }>;
    /** Product picker for the chosen source; runs after the sheet has closed (iOS cannot present over a closing modal). */
    onSelectSource(source: PhotoSource): void;
    onRemove(): void;
    /** While the system picker is open. Locks choose/remove and shows the button's spinner. */
    picking?: boolean;
    /** Only when the product uploads on pick; an upload that runs at submit stays with the submit action. */
    upload?: PhotoAttachmentUpload;
    onRetryUpload?(): void;
    onCancelUpload?(): void;
    /** Host lock (submitting, rate limit). The preview stays viewable. */
    disabled?: boolean;
    cameraAvailable?: boolean;
    /** Short note under the button, e.g. size or visibility of the photo. */
    hint?: string;
    /** Product message for a failed pick (permission, unreadable photo). The draft is kept. */
    error?: string;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function createAttachedPhoto(Viewer: ViewerProps["Viewer"]): ({ photo, label, layoutStyle, ...viewer }: AttachedPhotoProps) => import("react").JSX.Element;
export declare function createPhotoAttachmentField(Viewer: ViewerProps["Viewer"]): (props: PhotoAttachmentFieldProps) => import("react").JSX.Element;
//# sourceMappingURL=photo-attachment.d.ts.map