import { type DrawingEditorProps as DrawingEditorContractProps } from '@hjmds/design-contracts/components/drawing-editor';
import type { HjmCompositionStyleProp } from './composition-style.js';
export type { DrawingEditorLabels, DrawingImage } from '@hjmds/design-contracts/components/drawing-editor';
/** The shared contract plus Web placement of the editor screen root (every in-flow Web root takes `layoutStyle`). */
export type DrawingEditorProps = DrawingEditorContractProps & Readonly<{
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Shared paint editor extracted from Diairy and Spint (2026-10-27).
 * Tools, history, crop preview and failed-save draft preservation have one owner per renderer.
 * The product supplies localized labels, upload and navigation; SVG/lucide stay optional entry peers. */
export declare function DrawingEditor({ labels, onSave, onCancel, cropPreview, testID, layoutStyle }: DrawingEditorProps): import("react").JSX.Element;
//# sourceMappingURL=drawing-editor.d.ts.map