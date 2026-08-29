import {
  filePickerTriggerDefaults,
  resolveFilePickerDescriptor,
  resolveFilePickerSelection,
  validateFilePickerTriggers,
  type FilePickerCandidate,
  type FilePickerDescriptor,
  type FilePickerSelectionResult,
} from "@hjmds/design-contracts/components/file-picker";
import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { classNames, composeRefs } from "./internal.js";

export type FilePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> &
  Readonly<{
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

function defaultCandidateId(file: File, index: number): string {
  return `${file.name}:${file.size}:${file.lastModified}:${index}`;
}

/** Native file input plus an optional Web dropzone sharing one selection resolver. */
export const FilePicker = forwardRef<HTMLDivElement, FilePickerProps>(function FilePicker(
  {
    descriptor,
    label,
    buttonLabel,
    dropzoneLabel,
    onSelect,
    existingCount = 0,
    disabled = false,
    hint,
    error,
    inputId,
    getCandidateId = defaultCandidateId,
    className,
    ...props
  },
  ref,
) {
  validateFilePickerTriggers("web", filePickerTriggerDefaults.web);
  const resolved = resolveFilePickerDescriptor(descriptor);
  const generatedId = useId();
  const id = inputId ?? `hjm-file-${generatedId.replaceAll(":", "")}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const commit = (files: FileList | readonly File[]) => {
    const candidates: FilePickerCandidate[] = Array.from(files).map((file, index) => ({
      id: getCandidateId(file, index),
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }));
    onSelect(resolveFilePickerSelection(candidates, resolved, existingCount));
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) commit(event.currentTarget.files);
    event.currentTarget.value = "";
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) commit(event.dataTransfer.files);
  };

  return (
    <div {...props} ref={composeRefs(ref)} className={classNames("hjm-file-picker", className)} data-dragging={dragging || undefined} data-invalid={error !== undefined || undefined}>
      <span className="hjm-file-picker__label">{label}</span>
      <input
        accept={resolved.accept?.join(",")}
        className="hjm-visually-hidden"
        disabled={disabled}
        id={id}
        multiple={resolved.mode === "multiple"}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <div
        className="hjm-file-picker__dropzone"
        onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <span>{dropzoneLabel}</span>
        <button disabled={disabled} onClick={() => inputRef.current?.click()} type="button">{buttonLabel}</button>
      </div>
      {hint === undefined ? null : <span className="hjm-file-picker__hint">{hint}</span>}
      {error === undefined ? null : <span className="hjm-file-picker__error" role="alert">{error}</span>}
    </div>
  );
});
