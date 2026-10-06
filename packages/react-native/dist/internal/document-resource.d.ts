import type { ReactNode } from "react";
import { type DocumentResourceControls } from "@hjmds/design-contracts/document-resource";
export type DocumentResourceProps = DocumentResourceControls & Readonly<{
    preview?: ReactNode;
    moreAction?: ReactNode;
}>;
/** The native file/share host stays product-owned. */
export declare function DocumentResource({ preview, moreAction, ...props }: DocumentResourceProps): import("react").JSX.Element;
//# sourceMappingURL=document-resource.d.ts.map