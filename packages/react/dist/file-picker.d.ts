import { type FilePickerDescriptor, type FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type FilePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & Readonly<{
    descriptor: FilePickerDescriptor;
    label: ReactNode;
    buttonLabel: string;
    dropzoneLabel: ReactNode;
    /**
     * `files` maps each accepted candidate id to the browser `File`, so the product can read or upload
     * the bytes it accepted. Before this a Web product had no access to the File and fell back to a raw
     * `<input type="file">` (2026-10-17 mockup studio review). Native products already own the file
     * reference through their `onPick` adapter, so Native keeps the single-argument callback.
     */
    onSelect: (result: FilePickerSelectionResult, files: ReadonlyMap<string, File>) => void;
    existingCount?: number;
    disabled?: boolean;
    hint?: ReactNode;
    error?: ReactNode;
    inputId?: string;
    getCandidateId?: (file: File, index: number) => string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Native file input plus an optional Web dropzone sharing one selection resolver. */
export declare const FilePicker: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & Readonly<{
    descriptor: FilePickerDescriptor;
    label: ReactNode;
    buttonLabel: string;
    dropzoneLabel: ReactNode;
    /**
     * `files` maps each accepted candidate id to the browser `File`, so the product can read or upload
     * the bytes it accepted. Before this a Web product had no access to the File and fell back to a raw
     * `<input type="file">` (2026-10-17 mockup studio review). Native products already own the file
     * reference through their `onPick` adapter, so Native keeps the single-argument callback.
     */
    onSelect: (result: FilePickerSelectionResult, files: ReadonlyMap<string, File>) => void;
    existingCount?: number;
    disabled?: boolean;
    hint?: ReactNode;
    error?: ReactNode;
    inputId?: string;
    getCandidateId?: (file: File, index: number) => string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=file-picker.d.ts.map