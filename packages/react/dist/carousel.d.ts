import { type HTMLAttributes, type ReactNode } from "react";
import { type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig, type ComposeCarouselAccessibleName, type ComposePageIndicatorAccessibleName } from "@hjmds/design-contracts/components/carousel";
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
    /** Available content height in a bounded host. Navigation stays outside the scrolling slide. */
    slideMaxHeight?: number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export type PageIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & Readonly<{
    /** Name of the paged region (e.g. "Home pages"); the group's accessible name. */
    label: string;
    count: number;
    /** Zero-based current page; the product pager owns it. */
    currentIndex: number;
    /** Limit visible dots while retaining absolute page names and navigation. */
    maxVisibleDots?: number;
    /** Position-only dots when separate pager controls own navigation. Default true retains 44pt dot targets. */
    interactive?: boolean;
    /** Requested page from a dot or an arrow key. It can repeat the current index. */
    onCurrentIndexChange: (index: number) => void;
    composeAccessibleName: ComposePageIndicatorAccessibleName;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * Carousel's position dots for a product-owned pager (scroll-snap row, virtualized pager). Arrow keys on a dot move
 * one page in reading direction, as in Carousel's controls.
 */
export declare const PageIndicator: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & Readonly<{
    /** Name of the paged region (e.g. "Home pages"); the group's accessible name. */
    label: string;
    count: number;
    /** Zero-based current page; the product pager owns it. */
    currentIndex: number;
    /** Limit visible dots while retaining absolute page names and navigation. */
    maxVisibleDots?: number;
    /** Position-only dots when separate pager controls own navigation. Default true retains 44pt dot targets. */
    interactive?: boolean;
    /** Requested page from a dot or an arrow key. It can repeat the current index. */
    onCurrentIndexChange: (index: number) => void;
    composeAccessibleName: ComposePageIndicatorAccessibleName;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
/** Finite keyed cards. Hidden slides stay mounted but cannot receive focus. */
export declare const Carousel: import("react").ForwardRefExoticComponent<CarouselProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=carousel.d.ts.map