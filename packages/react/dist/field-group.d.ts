import { type ReactNode } from "react";
import { type FieldGroupDescriptor } from "@hjmds/design-contracts/field-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type FieldGroupBinding = Readonly<{
    id: string;
    controlProps: Readonly<{
        id: string;
        label: string;
        disabled: boolean;
        "aria-invalid": boolean;
        "aria-describedby"?: string;
    }>;
    guardChange: <Args extends unknown[]>(callback: (...args: Args) => void) => (...args: Args) => void;
}>;
export type FieldGroupProps = Readonly<{
    descriptor: FieldGroupDescriptor;
    renderField: (field: FieldGroupBinding) => ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Named related fields inside an existing form; never creates a submission boundary. */
export declare function FieldGroup({ descriptor, renderField, layoutStyle }: FieldGroupProps): import("react").JSX.Element;
//# sourceMappingURL=field-group.d.ts.map