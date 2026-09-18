import { type ComposeTourStepAnnouncement, type TourDescriptor, type TourOpenReason, type TourStepChangeHandler } from "@hjmds/design-contracts/components/tour";
import { type OverlayTrigger } from "./modal.js";
export type TourProps<Id extends string = string> = Readonly<{
    descriptor: TourDescriptor<Id>;
    /** Resolves the product-owned anchor key to the element to point at. */
    resolveAnchor: (anchorId: string) => HTMLElement | null;
    composeAnnouncement: ComposeTourStepAnnouncement;
    onStepChange: TourStepChangeHandler<Id>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: Readonly<{
        reason: TourOpenReason;
    }>) => void;
    trigger?: OverlayTrigger;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const Tour: <Id extends string = string>(props: TourProps<Id> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=tour.d.ts.map