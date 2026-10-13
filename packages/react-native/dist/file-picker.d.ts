import { type FilePickerCandidate, type FilePickerDescriptor, type FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type FilePickerProps = Readonly<{
    descriptor: FilePickerDescriptor;
    label: string;
    buttonLabel: string;
    /** Product adapter around Expo DocumentPicker, native modules, or another platform picker. */
    onPick: () => Promise<readonly FilePickerCandidate[] | null>;
    /** Receives native picker failures so rejected adapter promises never become unhandled. */
    onPickError: (error: unknown) => void;
    onSelect: (result: FilePickerSelectionResult) => void;
    existingCount?: number;
    disabled?: boolean;
    hint?: string;
    error?: string;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Expo-independent Native trigger; products inject the platform picker adapter. */
export declare function FilePicker({ descriptor, label, buttonLabel, onPick, onPickError, onSelect, existingCount, disabled, hint, error, layoutStyle, }: FilePickerProps): import("react").JSX.Element;
//# sourceMappingURL=file-picker.d.ts.map