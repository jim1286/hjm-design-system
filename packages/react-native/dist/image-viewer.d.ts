export type ImageViewerItem = {
    id: string;
    uri: string;
    label: string;
};
export type ImageViewerProps = {
    open: boolean;
    items: readonly ImageViewerItem[];
    initialIndex?: number;
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