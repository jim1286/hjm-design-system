import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ReactNode } from "react";
export declare function IdentityAction({ action, children, layoutStyle }: Readonly<{
    action: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    children: ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
}>): import("react").JSX.Element;
//# sourceMappingURL=identity-action.d.ts.map