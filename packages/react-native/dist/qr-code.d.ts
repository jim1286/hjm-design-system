import { type ReactNode } from "react";
import { type QRErrorCorrection } from "@hjmds/design-contracts/components/qr-code";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type QRCodeProps = {
    value: string;
    label: string;
    size?: number;
    level?: QRErrorCorrection;
    fallback: ReactNode;
    /** Canonical layout-only placement on the root, matching Web QRCode (added 2026-10-06). Module geometry stays recipe-owned. */
    layoutStyle?: HjmCompositionStyleProp;
};
export declare function QRCode({ value, label, size, level, fallback, layoutStyle }: QRCodeProps): import("react").JSX.Element;
//# sourceMappingURL=qr-code.d.ts.map