import { type ReactNode } from "react";
import { type ImageInspectionMode } from "@hjmds/design-contracts/components/image";
export type ImageViewerInspection = Readonly<{
    mode: ImageInspectionMode;
    onModeChange: (mode: ImageInspectionMode) => void;
    labels: Readonly<{
        mode: string;
        fit: string;
        double: string;
        pixels: string;
        left: string;
        right: string;
        up: string;
        down: string;
        center: string;
    }>;
    /** Image-relative viewport offset and limits, in layout units; products localize the result. */
    getPositionText: (position: Readonly<{
        x: number;
        y: number;
        maxX: number;
        maxY: number;
    }>) => string;
}>;
/** Internal exact-size viewport; the parent owns lifetime, modes, feedback and image readiness. */
export declare function ImageInspection({ imageSize, config, controlsInset, feedbackLabels, renderImage }: {
    imageSize: {
        width: number;
        height: number;
    };
    config: ImageViewerInspection;
    controlsInset: {
        paddingLeft: number;
        paddingRight: number;
    };
    feedbackLabels: {
        loading: string;
        error: string;
        retry: string;
    };
    renderImage: (width: number, height: number, report: (status: "loading" | "ready" | "error") => void) => ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=image-inspection.d.ts.map