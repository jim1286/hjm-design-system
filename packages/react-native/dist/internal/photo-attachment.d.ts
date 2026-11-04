import { type ReactNode } from "react";
import { type PhotoAttachmentLabels, type PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { type ImageProps } from "../data-display.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ImageViewerProps } from "../image-viewer.js";
export type { PhotoAttachmentLabels, PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";
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
    /** Load result of the photo under the text, e.g. to offer a retry when an authorized address is refused. */
    onLoadStatusChange?: ImageProps["onLoadStatusChange"];
    /**
     * Product art around and over the preview image (a postcard frame, stickers). Receives the image and returns what the
     * preview button shows; the corner remove button and the viewer stay HJM's. The viewer opens the bare photo.
     */
    decoratePreview?: (image: ReactNode) => ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type PhotoAttachmentFieldProps = Omit<ViewerProps, "Viewer"> & Readonly<{
    photo: PhotoAttachmentPhoto | null;
    labels: PhotoAttachmentLabels & Readonly<{
        source: PhotoSourceLabels;
    }>;
    /** Product picker for the chosen source; runs after the sheet has closed (iOS cannot present over a closing modal). */
    onSelectSource(source: PhotoSource): void;
    onRemove(): void;
    /** While the system picker is open. Locks choose and shows its spinner. */
    picking?: boolean;
    /** Host lock (submitting, rate limit). The preview stays viewable. */
    disabled?: boolean;
    cameraAvailable?: boolean;
    /** Product message for a failed pick (permission, unreadable photo). The draft is kept. */
    error?: string;
    /**
     * `none`: the host shows its own choose action (for example in a compose toolbar) and opens the source sheet through
     * `sourceOpen`. The preview, error and sheet stay here so a toolbar product does not rebuild them.
     */
    chooseAction?: "inline" | "none";
    /** Controlled source sheet. Uncontrolled when omitted. */
    sourceOpen?: boolean;
    onSourceOpenChange?(open: boolean): void;
    /**
     * Product art around and over the preview image (a postcard frame, stickers). Receives the image and returns what the
     * preview button shows; the corner remove button and the viewer stay HJM's. The viewer opens the bare photo.
     */
    decoratePreview?: (image: ReactNode) => ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function createAttachedPhoto(Viewer: ViewerProps["Viewer"]): ({ photo, label, layoutStyle, ...viewer }: AttachedPhotoProps) => import("react").JSX.Element;
export declare function createPhotoAttachmentField(Viewer: ViewerProps["Viewer"]): (props: PhotoAttachmentFieldProps) => import("react").JSX.Element;
//# sourceMappingURL=photo-attachment.d.ts.map