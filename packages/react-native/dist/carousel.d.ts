import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type CarouselSlideDescriptor, type CarouselSelection, type CarouselAutoplayConfig, type ComposeCarouselAccessibleName } from "@hjmds/design-contracts/components/carousel";
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
    style?: StyleProp<ViewStyle>;
}>;
export declare function Carousel({ label, slides, renderSlide, composeAccessibleName, labels, autoplay, currentKey, defaultCurrentKey, onCurrentKeyChange, style }: CarouselProps): import("react").JSX.Element;
//# sourceMappingURL=carousel.d.ts.map