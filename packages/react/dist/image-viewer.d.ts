import { type ButtonHTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
export type ImageViewerTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "type" | "style"> & Readonly<{
    /** Localized accessible name, e.g. "사진 크게 보기". The media inside is decorative. */
    label: string;
    /** Product media (HJM `Image` with `decorative`, `<img alt="">`). */
    children: ReactNode;
    /** Layout-only placement; the trigger fills its container width by default, set `width` for a thumbnail. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Button around product media that opens ImageViewer. The product keeps the viewer's `open` state and calls it from
 * `onClick`; the trigger owns the name, focus ring on the image frame radius, zoom cursor and pressed opacity.
 */
export declare const ImageViewerTrigger: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "aria-label" | "type"> & Readonly<{
    /** Localized accessible name, e.g. "사진 크게 보기". The media inside is decorative. */
    label: string;
    /** Product media (HJM `Image` with `decorative`, `<img alt="">`). */
    children: ReactNode;
    /** Layout-only placement; the trigger fills its container width by default, set `width` for a thumbnail. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
/** Full viewport photo presentation; shares modal isolation, focus return and Escape with Dialog. */
export declare function ImageViewer(props: ImageViewerProps): import("react").JSX.Element | null;
//# sourceMappingURL=image-viewer.d.ts.map