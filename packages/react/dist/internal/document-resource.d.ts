import { type ReactNode } from "react";
import { type DocumentResourceControls } from "@hjmds/design-contracts/document-resource";
export type DocumentResourceProps = DocumentResourceControls & Readonly<{
    preview?: ReactNode;
    moreAction?: ReactNode;
}>;
/** Rendering a host result never initiates file access or transfer. */
export declare function DocumentResource({ preview, moreAction, ...props }: DocumentResourceProps): import("react").JSX.Element;
//# sourceMappingURL=document-resource.d.ts.map