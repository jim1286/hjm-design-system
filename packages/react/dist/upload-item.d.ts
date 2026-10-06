import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type UploadItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    descriptor: UploadItemDescriptor;
    labels: UploadItemLabels;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    leading?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** One upload row whose available action is derived entirely from status. */
export declare const UploadItem: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    descriptor: UploadItemDescriptor;
    labels: UploadItemLabels;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    leading?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=upload-item.d.ts.map