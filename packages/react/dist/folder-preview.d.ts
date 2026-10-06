import type { ReactNode } from 'react';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type FolderPreviewProps = Readonly<{
    label: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previews: readonly ReactNode[];
    children: ReactNode;
    disabled?: boolean;
    /** Canonical layout-only placement on the root Collapsible. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Preview slots are decorative snapshots; expanded children own real actions and accessible content. */
export declare function FolderPreview({ label, open, onOpenChange, previews, children, disabled, layoutStyle }: FolderPreviewProps): import("react").JSX.Element;
//# sourceMappingURL=folder-preview.d.ts.map