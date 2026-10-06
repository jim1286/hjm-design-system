import { type HTMLAttributes, type ReactNode } from "react";
import { type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig, type ComposeCarouselAccessibleName } from "@hjmds/design-contracts/components/carousel";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CarouselLabels = Readonly<{
    previous: string;
    next: string;
    pause: string;
    resume: string;
    navigation: string;
}>;
export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & CarouselSelection & Readonly<{
    label: string;
    slides: readonly CarouselSlideDescriptor[];
    renderSlide: (slide: CarouselSlideDescriptor) => ReactNode;
    composeAccessibleName: ComposeCarouselAccessibleName;
    labels: CarouselLabels;
    autoplay?: CarouselAutoplayConfig;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Finite keyed cards. Hidden slides stay mounted but cannot receive focus. */
export declare const Carousel: import("react").ForwardRefExoticComponent<CarouselProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=carousel.d.ts.map