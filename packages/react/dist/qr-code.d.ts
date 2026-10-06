import { type ReactNode } from "react";
import { type QRErrorCorrection } from "@hjmds/design-contracts/components/qr-code";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type QRCodeProps = {
    value: string;
    label: string;
    size?: number;
    level?: QRErrorCorrection;
    fallback: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
};
export declare function QRCode({ value, label, size, level, fallback, layoutStyle }: QRCodeProps): import("react").JSX.Element;
//# sourceMappingURL=qr-code.d.ts.map