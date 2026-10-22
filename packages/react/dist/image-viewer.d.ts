import { type ReactNode } from "react";
export type ImageViewerItem = {
    id: string;
    uri: string;
    label: string;
};
export type ImageViewerProps = {
    actions?: ReactNode;
    open: boolean;
    items: readonly ImageViewerItem[];
    initialIndex?: number;
    onClose: () => void;
    onIndexChange?: (index: number) => void;
    closeLabel: string;
    previousLabel: string;
    nextLabel: string;
    loadingLabel: string;
    errorLabel: string;
    retryLabel: string;
    /** Authorized image hosts keep their fetching, loading and retry policy. Only the selected item mounts. */
    renderImage?: (item: ImageViewerItem) => ReactNode;
};
/** Full viewport photo presentation; shares modal isolation, focus return and Escape with Dialog. */
export declare function ImageViewer(props: ImageViewerProps): import("react").JSX.Element | null;
//# sourceMappingURL=image-viewer.d.ts.map