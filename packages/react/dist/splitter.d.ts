import { type SplitterAxis } from "@hjmds/design-contracts/components/splitter";
import { type CSSProperties, type ReactNode } from "react";
export type SplitterProps = Readonly<{
    /** Required accessible name for the separator. */
    label: string;
    min: number;
    max: number;
    step?: number;
    axis?: SplitterAxis;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Fires once when a drag settles, for owners that persist the size. */
    onValueChangeEnd?: (value: number) => void;
    /** Product-owned announcement of the current size, e.g. "35%" or "320px". */
    getValueText?: (value: number) => string;
    disabled?: boolean;
    /** The pane the value sizes, and the pane that takes the remaining space. */
    primaryPane: ReactNode;
    secondaryPane: ReactNode;
    className?: string;
    style?: CSSProperties;
}>;
export declare const Splitter: import("react").ForwardRefExoticComponent<Readonly<{
    /** Required accessible name for the separator. */
    label: string;
    min: number;
    max: number;
    step?: number;
    axis?: SplitterAxis;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Fires once when a drag settles, for owners that persist the size. */
    onValueChangeEnd?: (value: number) => void;
    /** Product-owned announcement of the current size, e.g. "35%" or "320px". */
    getValueText?: (value: number) => string;
    disabled?: boolean;
    /** The pane the value sizes, and the pane that takes the remaining space. */
    primaryPane: ReactNode;
    secondaryPane: ReactNode;
    className?: string;
    style?: CSSProperties;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=splitter.d.ts.map