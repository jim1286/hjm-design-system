import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { type CircularPhotoCropRect } from "@hjmds/design-contracts/components/image";
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
    /** Localized accessible name, e.g. "View photo". The media inside is decorative. */
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
export declare const ImageViewerTrigger: import("react").ForwardRefExoticComponent<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "style" | "aria-label"> & Readonly<{
    /** Localized accessible name, e.g. "View photo". The media inside is decorative. */
    label: string;
    /** Product media (HJM `Image` with `decorative`, `<img alt="">`). */
    children: ReactNode;
    /** Layout-only placement; the trigger fills its container width by default, set `width` for a thumbnail. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLButtonElement>>;
/** Full viewport photo presentation; shares modal isolation, focus return and Escape with Dialog. */
export declare function ImageViewer(props: ImageViewerProps): import("react").JSX.Element | null;
export type CircularPhotoCropperProps = Readonly<{
    open: boolean;
    /** The picked photo with its intrinsic pixel size (read from the decoded image). */
    source: Readonly<{
        uri: string;
        width: number;
        height: number;
    }>;
    title: string;
    /** Short instruction under the circle, e.g. "Drag and scroll or pinch to fit". */
    hint?: string;
    confirmLabel: string;
    cancelLabel: string;
    /** While the product crops/uploads; both actions are locked. */
    busy?: boolean;
    onCancel(): void;
    /** Source-pixel square under the circle; the product crops (canvas) and uploads it. */
    onConfirm(crop: CircularPhotoCropRect): void;
}>;
/**
 * Instagram-style circular framing for profile photos (2026-10-29 user rule, all apps and web): drag to move, wheel or
 * pinch to zoom inside a circular mask on the black photo surface. Same geometry as Native (contract functions).
 */
export declare function CircularPhotoCropper(props: CircularPhotoCropperProps): import("react").JSX.Element | null;
//# sourceMappingURL=image-viewer.d.ts.map