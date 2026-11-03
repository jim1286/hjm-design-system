import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment, } from "@hjmds/design-contracts/components/image";
import { Button } from "../actions.js";
import { Image } from "../data-display.js";
import { Notice } from "../feedback.js";
import { Stack, Text } from "../primitives.js";
import { UploadItem } from "../upload-item.js";
import { ImageViewerTrigger } from "./image-viewer-trigger.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
function PhotoPreview({ photo, label, disabled, viewerLabels, safeAreaInsets, imageHost, Viewer }) {
    const [open, setOpen] = useState(false);
    const frame = resolvePhotoAttachmentPreviewSize(photo);
    return _jsxs(_Fragment, { children: [_jsx(ImageViewerTrigger, { label: label, disabled: disabled, onPress: () => setOpen(true), layoutStyle: { alignSelf: "stretch" }, children: _jsx(Image, { src: photo.uri, width: frame.width, height: frame.height, fit: frame.fit, decorative: true, layoutStyle: { width: "100%" }, ...(imageHost?.sourceAdapter ? { sourceAdapter: imageHost.sourceAdapter } : {}), ...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {}) }) }), _jsx(Viewer, { open: open, onClose: () => setOpen(false), safeAreaInsets: safeAreaInsets, items: [{ id: photo.uri, uri: photo.uri, label, width: photo.width, height: photo.height }], ...viewerLabels, ...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {}) })] });
}
export function createAttachedPhoto(Viewer) {
    /** A posted photo under its text: tap to open the shared viewer (pull down to close). */
    return function AttachedPhoto({ photo, label, layoutStyle, ...viewer }) {
        if (!label.trim() || !photo.uri.trim() || !(photo.width > 0 && photo.height > 0))
            throw new TypeError("AttachedPhoto needs a label and a sized photo");
        return _jsx(Stack, { ...(layoutStyle ? { layoutStyle } : {}), children: _jsx(PhotoPreview, { photo: photo, label: label, Viewer: Viewer, ...viewer }) });
    };
}
export function createPhotoAttachmentField(Viewer) {
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
        return _jsxs(Stack, { gap: photoAttachmentRecipe.gap, ...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {}), children: [_jsx(Button, { tone: photoAttachmentRecipe.chooseTone, disabled: actions.choose.disabled, loading: actions.choose.loading, onPress: () => setSourceOpen(true), children: labels[actions.choose.label] }), props.hint ? _jsx(Text, { variant: "caption", tone: "muted", children: props.hint }) : null, _jsx(PhotoSourceSheet, { open: sourceOpen, onOpenChange: setSourceOpen, labels: labels.source, disabled: actions.choose.disabled, ...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable }), onSelect: props.onSelectSource }), props.error ? _jsx(Notice, { tone: "danger", announcement: "assertive", title: props.error }) : null, props.photo ? _jsxs(_Fragment, { children: [_jsx(PhotoPreview, { photo: props.photo, label: labels.preview, viewerLabels: props.viewerLabels, safeAreaInsets: props.safeAreaInsets, Viewer: Viewer, ...(props.imageHost ? { imageHost: props.imageHost } : {}) }), props.upload ? _jsx(UploadItem, { labels: labels.upload, descriptor: { id: props.photo.uri, name: labels.preview, state: props.upload.status === "uploading"
                                    ? { status: "uploading", progress: props.upload.progress, ...(props.upload.progressLabel ? { progressLabel: props.upload.progressLabel } : {}) }
                                    : { status: "error", message: props.upload.message } }, ...(props.onRetryUpload ? { onRetry: () => props.onRetryUpload() } : {}), ...(props.onCancelUpload ? { onCancel: () => props.onCancelUpload() } : {}) }) : null, _jsx(Button, { tone: photoAttachmentRecipe.removeTone, size: photoAttachmentRecipe.actionSize, disabled: actions.remove.disabled, onPress: props.onRemove, children: labels.remove })] }) : null] });
    };
}
//# sourceMappingURL=photo-attachment.js.map