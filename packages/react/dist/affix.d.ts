import { type ReactNode } from "react";
export type AffixProps = Readonly<{
    children: ReactNode;
    offset?: number;
    disabled?: boolean;
    onChange?: (affixed: boolean) => void;
}>;
/** CSS keeps natural flow, parent boundaries and focus intact; JS only observes state and oversize content. */
export declare function Affix({ children, offset, disabled, onChange }: AffixProps): import("react").JSX.Element;
//# sourceMappingURL=affix.d.ts.map