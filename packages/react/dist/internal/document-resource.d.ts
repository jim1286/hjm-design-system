import type { ReactNode } from "react";
import { type DocumentResourceControls } from "@hjmds/design-contracts/document-resource";
/** Internal candidate. Rendering a host result never initiates file access or transfer. */
export declare function DocumentResource({ preview, moreAction, ...props }: DocumentResourceControls & Readonly<{
    preview?: ReactNode;
    moreAction?: ReactNode;
}>): import("react").JSX.Element;
//# sourceMappingURL=document-resource.d.ts.map