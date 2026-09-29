import { type ReactNode } from "react";
import { type QRErrorCorrection } from "@hjmds/design-contracts/components/qr-code";
export type QRCodeProps = {
    value: string;
    label: string;
    size?: number;
    level?: QRErrorCorrection;
    fallback: ReactNode;
};
export declare function QRCode({ value, label, size, level, fallback }: QRCodeProps): import("react").JSX.Element;
//# sourceMappingURL=qr-code.d.ts.map