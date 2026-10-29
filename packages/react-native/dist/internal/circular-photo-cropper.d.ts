import { type CircularPhotoCropRect } from "@hjmds/design-contracts/components/image";
export type CircularPhotoCropperProps = Readonly<{
    open: boolean;
    /** The picked photo with its intrinsic pixel size (expo-image-picker asset width/height). */
    source: Readonly<{
        uri: string;
        width: number;
        height: number;
    }>;
    title: string;
    /** Short instruction under the circle, e.g. "Drag and pinch to fit". */
    hint?: string;
    confirmLabel: string;
    cancelLabel: string;
    /** While the product crops/uploads; both actions are locked. */
    busy?: boolean;
    safeAreaInsets: Readonly<{
        top: number;
        bottom: number;
    }>;
    onCancel(): void;
    /** Source-pixel square under the circle; the product crops (expo-image-manipulator) and uploads it. */
    onConfirm(crop: CircularPhotoCropRect): void;
}>;
/**
 * Instagram-style circular framing for profile photos (2026-10-29 user rule, all apps): drag to move and pinch to zoom
 * inside a circular mask on the black photo surface. HJM owns the gestures, clamping and mask; the product owns picking,
 * cropping and upload.
 */
export declare function CircularPhotoCropper(props: CircularPhotoCropperProps): import("react").JSX.Element | null;
//# sourceMappingURL=circular-photo-cropper.d.ts.map