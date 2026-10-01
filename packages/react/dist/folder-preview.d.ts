import type { ReactNode } from 'react';
export type FolderPreviewProps = Readonly<{
    label: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previews: readonly ReactNode[];
    children: ReactNode;
    disabled?: boolean;
}>;
/** Preview slots are decorative snapshots; expanded children own real actions and accessible content. */
export declare function FolderPreview({ label, open, onOpenChange, previews, children, disabled }: FolderPreviewProps): import("react").JSX.Element;
//# sourceMappingURL=folder-preview.d.ts.map