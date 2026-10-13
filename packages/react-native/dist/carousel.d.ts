import { type ReactNode } from "react";
import { type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig, type ComposeCarouselAccessibleName } from "@hjmds/design-contracts/components/carousel";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CarouselLabels = Readonly<{
    previous: string;
    next: string;
    pause: string;
    resume: string;
    navigation: string;
}>;
export type CarouselProps = CarouselSelection & Readonly<{
    label: string;
    slides: readonly CarouselSlideDescriptor[];
    renderSlide: (slide: CarouselSlideDescriptor) => ReactNode;
    composeAccessibleName: ComposeCarouselAccessibleName;
    labels: CarouselLabels;
    autoplay?: CarouselAutoplayConfig;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle }: CarouselProps): import("react").JSX.Element;
//# sourceMappingURL=carousel.d.ts.map