"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment, } from "@hjmds/design-contracts/components/image";
import { Button } from "../actions.js";
import { Notice } from "../feedback.js";
import { Stack, Text } from "../layout.js";
import { Image } from "../supplemental-display.js";
import { UploadItem } from "../upload-item.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
function PhotoPreview({ photo, label, disabled, viewerLabels, imageHost, parts }) {
    const [open, setOpen] = useState(false);
    const frame = resolvePhotoAttachmentPreviewSize(photo);
    const { Viewer, Trigger } = parts;
    return _jsxs(_Fragment, { children: [_jsx(Trigger, { label: label, disabled: disabled, onClick: () => setOpen(true), children: _jsx(Image, { src: photo.uri, width: frame.width, height: frame.height, fit: frame.fit, decorative: true, ...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {}) }) }), _jsx(Viewer, { open: open, onClose: () => setOpen(false), items: [{ id: photo.uri, uri: photo.uri, label }], ...viewerLabels, ...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {}) })] });
}
export function createAttachedPhoto(parts) {
    /** A posted photo under its text: click to open the shared viewer. */
    return function AttachedPhoto({ photo, label, layoutStyle, ...viewer }) {
        if (!label.trim() || !photo.uri.trim() || !(photo.width > 0 && photo.height > 0))
            throw new TypeError("AttachedPhoto needs a label and a sized photo");
        return _jsx(Stack, { ...(layoutStyle ? { layoutStyle } : {}), children: _jsx(PhotoPreview, { photo: photo, label: label, parts: parts, ...viewer }) });
    };
}
export function createPhotoAttachmentField(parts) {
    /**
     * One optional photo under written content (photoAttachmentRecipe): choose → PhotoSourceSheet → preview → viewer,
     * replace/remove, and the upload row when the product uploads on pick. The product keeps the draft and the photo.
     */
    return function PhotoAttachmentField(props) {
        validatePhotoAttachment(props.labels, props.photo);
        const [sourceOpen, setSourceOpen] = useState(false);
        const actions = resolvePhotoAttachmentActions({
            hasPhoto: props.photo !== null,
            ...(props.picking === undefined ? {} : { picking: props.picking }),
            ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
            ...(props.upload ? { upload: props.upload.status } : {}),
        });
        const { labels } = props;
        return _jsxs(Stack, { gap: photoAttachmentRecipe.gap, ...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {}), children: [_jsx(Button, { type: "button", tone: photoAttachmentRecipe.chooseTone, disabled: actions.choose.disabled, loading: actions.choose.loading, onClick: () => setSourceOpen(true), children: labels[actions.choose.label] }), props.hint ? _jsx(Text, { variant: "caption", tone: "muted", children: props.hint }) : null, _jsx(PhotoSourceSheet, { open: sourceOpen, onOpenChange: setSourceOpen, labels: labels.source, disabled: actions.choose.disabled, ...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable }), onSelect: props.onSelectSource }), props.error ? _jsx(Notice, { tone: "danger", title: props.error }) : null, props.photo ? _jsxs(_Fragment, { children: [_jsx(PhotoPreview, { photo: props.photo, label: labels.preview, viewerLabels: props.viewerLabels, parts: parts, ...(props.imageHost ? { imageHost: props.imageHost } : {}) }), props.upload ? _jsx(UploadItem, { labels: labels.upload, descriptor: { id: props.photo.uri, name: labels.preview, state: props.upload.status === "uploading"
                                    ? { status: "uploading", progress: props.upload.progress, ...(props.upload.progressLabel ? { progressLabel: props.upload.progressLabel } : {}) }
                                    : { status: "error", message: props.upload.message } }, ...(props.onRetryUpload ? { onRetry: () => props.onRetryUpload() } : {}), ...(props.onCancelUpload ? { onCancel: () => props.onCancelUpload() } : {}) }) : null, _jsx(Button, { type: "button", tone: photoAttachmentRecipe.removeTone, size: photoAttachmentRecipe.actionSize, disabled: actions.remove.disabled, onClick: props.onRemove, children: labels.remove })] }) : null] });
    };
}
//# sourceMappingURL=photo-attachment.js.map