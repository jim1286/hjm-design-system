import { type DrawingEditorProps } from '@hjmds/design-contracts/components/drawing-editor';
export type { DrawingEditorProps, DrawingEditorLabels, DrawingImage } from '@hjmds/design-contracts/components/drawing-editor';
/** Shared paint editor extracted from Diairy and Spint (2026-10-27).
 * Tools, history, crop preview and failed-save draft preservation have one owner per renderer.
 * The product supplies localized labels, upload and navigation; SVG/lucide stay optional entry peers. */
export declare function DrawingEditor({ labels, onSave, onCancel, cropPreview, testID }: DrawingEditorProps): import("react").JSX.Element;
//# sourceMappingURL=drawing-editor.d.ts.map