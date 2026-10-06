import { type ReactNode } from "react";
export type ImageViewerItem = {
    id: string;
    uri: string;
    label: string;
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
    /** The frame, feedback and retry remain HJM-owned; caching/display belong to the host. */
    renderImage?: (props: ImageViewerImageRenderProps) => ReactNode;
    /** Per mounted image, including offscreen pages. Not an export approval or visibility proof. */
    onImageStatusChange?: (event: ImageViewerImageStatusEvent) => void;
    onClose: () => void;
    onIndexChange?: (index: number) => void;
    safeAreaInsets: {
        top: number;
        bottom: number;
    };
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