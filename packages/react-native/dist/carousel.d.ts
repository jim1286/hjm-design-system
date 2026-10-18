import { type ReactNode } from "react";
import { type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig, type ComposeCarouselAccessibleName, type ComposePageIndicatorAccessibleName } from "@hjmds/design-contracts/components/carousel";
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
export type PageIndicatorLabels = Readonly<{
    previous: string;
    next: string;
}>;
export type PageIndicatorProps = Readonly<{
    /** Name of the paged region, read before the current page name (e.g. "Home pages"). */
    label: string;
    count: number;
    /** Zero-based current page; the product pager owns it. */
    currentIndex: number;
    /** Requested page from a dot press or an adjustable action. It can repeat the current index. */
    onCurrentIndexChange: (index: number) => void;
    composeAccessibleName: ComposePageIndicatorAccessibleName;
    /** Localized names of the adjustable increment/decrement actions. */
    labels: PageIndicatorLabels;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}>;
/**
 * Carousel's position dots for a product-owned pager. The row is one adjustable element, like a platform page
 * control, so a screen reader hears "label: page name" and swipes up/down to move; each dot is a 44pt target.
 */
export declare function PageIndicator({ label, count, currentIndex, onCurrentIndexChange, composeAccessibleName, labels, layoutStyle, testID }: PageIndicatorProps): import("react").JSX.Element;
export declare function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle }: CarouselProps): import("react").JSX.Element;
//# sourceMappingURL=carousel.d.ts.map