import { type ReactNode } from "react";
import { type SortableItem } from "@hjmds/design-contracts/components/interaction-adapters";
export type CarouselMotionProps = {
    slides: readonly SortableItem[];
    currentKey: string;
    onCurrentKeyChange(key: string): void;
    renderSlide(item: SortableItem): ReactNode;
    label: string;
    previousLabel: string;
    nextLabel: string;
};
export declare function CarouselMotion(props: CarouselMotionProps): import("react").JSX.Element;
//# sourceMappingURL=carousel-motion.d.ts.map