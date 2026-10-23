import type { ReactNode } from "react";
import { type PressableProps } from "react-native";
import type { HjmCompositionStyleProp } from "../composition-style.js";
export type ImageViewerTriggerProps = Omit<PressableProps, "children" | "style" | "accessibilityLabel" | "accessibilityRole"> & Readonly<{
    /** Localized accessible name, e.g. "사진 크게 보기". The media inside is decorative. */
    label: string;
    /** Product media (HJM `Image` with `decorative`). */
    children: ReactNode;
    onPress: () => void;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Pressable around product media that opens ImageViewer (imageViewerTriggerRecipe), exported from the image-viewer
 * subpath beside the viewer it opens; the product keeps the viewer's `open` state.
 */
export declare function ImageViewerTrigger({ label, children, onPress, disabled, layoutStyle, ...props }: ImageViewerTriggerProps): import("react").JSX.Element;
//# sourceMappingURL=image-viewer-trigger.d.ts.map