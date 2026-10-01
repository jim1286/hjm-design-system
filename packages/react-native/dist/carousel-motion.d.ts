import { type ReactNode } from "react";
import type { SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";
import { type ComposeCarouselAccessibleName } from "@hjmds/design-contracts/components/carousel";
export type CarouselMotionProps = {
    slides: readonly SortableItem[];
    currentKey: string;
    onCurrentKeyChange(key: string): void;
    /** Optional localized position/name composer shared with the base Carousel. */
    composeAccessibleName?: ComposeCarouselAccessibleName;
    renderSlide(item: SortableItem): ReactNode;
    label: string;
    previousLabel: string;
    nextLabel: string;
    /** Measured host space, not a device-width assumption. */
    width: number;
    height: number;
};
export declare function CarouselMotion(props: CarouselMotionProps): import("react").JSX.Element;
//# sourceMappingURL=carousel-motion.d.ts.map