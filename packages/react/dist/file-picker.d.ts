import { type FilePickerDescriptor, type FilePickerSelectionResult } from "@hjmds/design-contracts/components/file-picker";
import { type HTMLAttributes, type ReactNode } from "react";
export type FilePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & Readonly<{
    descriptor: FilePickerDescriptor;
    label: ReactNode;
    buttonLabel: string;
    dropzoneLabel: ReactNode;
    onSelect: (result: FilePickerSelectionResult) => void;
    existingCount?: number;
    disabled?: boolean;
    hint?: ReactNode;
    error?: ReactNode;
    inputId?: string;
    getCandidateId?: (file: File, index: number) => string;
}>;
/** Native file input plus an optional Web dropzone sharing one selection resolver. */
export declare const FilePicker: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & Readonly<{
    descriptor: FilePickerDescriptor;
    label: ReactNode;
    buttonLabel: string;
    dropzoneLabel: ReactNode;
    onSelect: (result: FilePickerSelectionResult) => void;
    existingCount?: number;
    disabled?: boolean;
    hint?: ReactNode;
    error?: ReactNode;
    inputId?: string;
    getCandidateId?: (file: File, index: number) => string;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=file-picker.d.ts.map