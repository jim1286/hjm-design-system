import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
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
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `carouselRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, layoutStyle, style }: CarouselProps): import("react").JSX.Element;
//# sourceMappingURL=carousel.d.ts.map