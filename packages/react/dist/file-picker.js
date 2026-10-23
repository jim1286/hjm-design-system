"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { filePickerTriggerDefaults, resolveFilePickerDescriptor, resolveFilePickerSelection, validateFilePickerTriggers, } from "@hjmds/design-contracts/components/file-picker";
import { forwardRef, useEffect, useId, useRef, useState, } from "react";
import { classNames, composeRefs } from "./internal.js";
function defaultCandidateId(file, index) {
    return `${file.name}:${file.size}:${file.lastModified}:${index}`;
}
/** Native file input plus an optional Web dropzone sharing one selection resolver. */
export const FilePicker = forwardRef(function FilePicker({ descriptor, label, buttonLabel, dropzoneLabel, onSelect, existingCount = 0, disabled = false, hint, error, inputId, getCandidateId = defaultCandidateId, className, layoutStyle, ...props }, ref) {
    validateFilePickerTriggers("web", filePickerTriggerDefaults.web);
    const resolved = resolveFilePickerDescriptor(descriptor);
    const generatedId = useId();
    const id = inputId ?? `hjm-file-${generatedId.replaceAll(":", "")}`;
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    useEffect(() => { if (disabled)
        setDragging(false); }, [disabled]);
    const commit = (files) => {
        // The OS dialog may finish after the owner locks this field. Empty input
        // changes represent no selection and must not erase a product's file list.
        if (disabled || files.length === 0)
            return;
        const sources = Array.from(files);
        const candidates = sources.map((file, index) => ({
            id: getCandidateId(file, index),
            name: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
        }));
        const result = resolveFilePickerSelection(candidates, resolved, existingCount);
        const accepted = new Set(result.accepted.map(candidate => candidate.id));
        onSelect(result, new Map(candidates.flatMap((candidate, index) => accepted.has(candidate.id) ? [[candidate.id, sources[index]]] : [])));
    };
    const handleChange = (event) => {
        try {
            if (event.currentTarget.files)
                commit(event.currentTarget.files);
        }
        finally {
            event.currentTarget.value = "";
        }
    };
    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled && event.dataTransfer.files.length > 0)
            commit(event.dataTransfer.files);
    };
    return (_jsxs("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: composeRefs(ref), className: classNames("hjm-file-picker", className), "data-dragging": (!disabled && dragging) || undefined, "data-invalid": error !== undefined || undefined, children: [_jsx("span", { className: "hjm-file-picker__label", id: `${id}-label`, children: label }), _jsx("input", { accept: resolved.accept?.join(","), "aria-labelledby": `${id}-label`, className: "hjm-visually-hidden", disabled: disabled, id: id, tabIndex: -1, multiple: resolved.mode === "multiple", onChange: handleChange, ref: inputRef, type: "file" }), _jsxs("div", { className: "hjm-file-picker__dropzone", onDragEnter: (event) => { event.preventDefault(); if (!disabled)
                    setDragging(true); }, onDragLeave: (event) => { if (!event.currentTarget.contains(event.relatedTarget))
                    setDragging(false); }, onDragOver: (event) => event.preventDefault(), onDrop: handleDrop, children: [_jsx("span", { children: dropzoneLabel }), _jsx("button", { disabled: disabled, onClick: () => inputRef.current?.click(), type: "button", children: buttonLabel })] }), hint === undefined ? null : _jsx("span", { className: "hjm-file-picker__hint", children: hint }), error === undefined ? null : _jsx("span", { className: "hjm-file-picker__error", role: "alert", children: error })] }));
});
//# sourceMappingURL=file-picker.js.map