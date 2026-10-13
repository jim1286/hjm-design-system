import { type ReactNode } from "react";
import { type FieldGroupLayout, type FieldGroupDescriptor } from "@hjmds/design-contracts/field-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type FieldGroupBinding = Readonly<{
    id: string;
    controlProps: Readonly<{
        label: string;
        accessibilityLabel: string;
        accessibilityHint?: string;
        disabled: boolean;
        invalid: boolean;
    }>;
    guardChange: <Args extends unknown[]>(callback: (...args: Args) => void) => (...args: Args) => void;
}>;
export type FieldGroupProps = Readonly<{
    descriptor: FieldGroupDescriptor;
    renderField: (field: FieldGroupBinding) => ReactNode;
    layout?: FieldGroupLayout;
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function FieldGroup({ descriptor, renderField, layout, layoutStyle }: FieldGroupProps): import("react").JSX.Element;
//# sourceMappingURL=field-group.d.ts.map