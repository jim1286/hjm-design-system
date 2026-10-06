import { type ReactNode } from "react";
import { type ModalProps } from "react-native";
import { type ImageViewerInspection } from "./internal/image-inspection.js";
export type { ImageViewerInspection } from "./internal/image-inspection.js";
export type ImageViewerItem = {
    id: string;
    uri: string;
    label: string;
    width?: number;
    height?: number;
};
export type ImageViewerImageStatus = "loading" | "ready" | "error";
export type ImageViewerImageRenderProps = Readonly<{
    item: ImageViewerItem;
    width: number;
    height: number;
    /** Product host readiness: Expo hosts can use onDisplay instead of onLoad. */
    onReady: () => void;
    onError: () => void;
}>;
export type ImageViewerImageStatusEvent = Readonly<{
    item: ImageViewerItem;
    status: ImageViewerImageStatus;
}>;
export type ImageViewerProps = {
    open: boolean;
    items: readonly ImageViewerItem[];
    initialIndex?: number;
    /** Exact-size review requires positive intrinsic width/height on every item. */
    inspection?: ImageViewerInspection;
    /** The frame, feedback and retry remain HJM-owned; caching/display belong to the host. */
    renderImage?: (props: ImageViewerImageRenderProps) => ReactNode;
    /** Per mounted image, including offscreen pages. Not an export approval or visibility proof. */
    onImageStatusChange?: (event: ImageViewerImageStatusEvent) => void;
    onClose: () => void;
    onIndexChange?: (index: number) => void;
    safeAreaInsets: {
        top: number;
        bottom: number;
        left?: number;
        right?: number;
    };
    /** Allowed orientations still depend on the product manifest and OS rotation lock. */
    supportedOrientations?: ModalProps["supportedOrientations"];
    closeLabel: string;
    previousLabel: string;
    nextLabel: string;
    loadingLabel: string;
    errorLabel: string;
    retryLabel: string;
};
/** Unmount the session on close so every open starts at the requested image. */
export declare function ImageViewer(props: ImageViewerProps): import("react").JSX.Element | null;
//# sourceMappingURL=image-viewer.d.ts.map