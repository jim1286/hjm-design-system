"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment, } from "@hjmds/design-contracts/components/image";
import { glyph } from "@hjmds/design-contracts/foundations";
import { Button, IconButton } from "../actions.js";
import { Notice } from "../feedback.js";
import { Stack } from "../layout.js";
import { Image } from "../supplemental-display.js";
import { PhotoSourceGlyph } from "./photo-source-icon.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
function PhotoPreview({ photo, label, onLoadStatusChange, viewerLabels, imageHost, parts, corner, decoratePreview }) {
    const [open, setOpen] = useState(false);
    const frame = resolvePhotoAttachmentPreviewSize(photo);
    const { Viewer, Trigger } = parts;
    const decorate = decoratePreview ?? ((image) => image);
    return _jsxs("div", { className: "hjm-photo-attachment__preview", children: [_jsx(Trigger, { label: label, onClick: () => setOpen(true), children: decorate(_jsx(Image, { src: photo.uri, width: frame.width, height: frame.height, fit: frame.fit, decorative: true, ...(onLoadStatusChange ? { onLoadStatusChange } : {}), ...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {}) })) }), corner ? _jsx("div", { className: "hjm-photo-attachment__corner", children: corner }) : null, _jsx(Viewer, { open: open, onClose: () => setOpen(false), items: [{ id: photo.uri, uri: photo.uri, label }], ...viewerLabels, ...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {}) })] });
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
     * One optional photo under written content (photoAttachmentRecipe): a small choose action → PhotoSourceSheet, then
     * the preview (opens the viewer) with a corner remove button. The product keeps the draft and uploads at submit.
     */
    return function PhotoAttachmentField(props) {
        validatePhotoAttachment(props.labels, props.photo);
        const [ownSourceOpen, setOwnSourceOpen] = useState(false);
        const sourceOpen = props.sourceOpen ?? ownSourceOpen;
        const setSourceOpen = (open) => { if (props.sourceOpen === undefined)
            setOwnSourceOpen(open); props.onSourceOpenChange?.(open); };
        const actions = resolvePhotoAttachmentActions({
            hasPhoto: props.photo !== null,
            ...(props.picking === undefined ? {} : { picking: props.picking }),
            ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
        });
        const { labels } = props;
        return _jsxs(Stack, { gap: photoAttachmentRecipe.gap, ...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {}), children: [actions.choose.visible && props.chooseAction !== "none" ? _jsx("div", { className: "hjm-photo-attachment__choose", children: _jsx(Button, { type: "button", tone: photoAttachmentRecipe.chooseTone, size: photoAttachmentRecipe.chooseSize, edge: "start", disabled: actions.choose.disabled, loading: actions.choose.loading, leading: _jsx(PhotoSourceGlyph, { source: "library", size: glyph.sm }), onClick: () => setSourceOpen(true), children: labels.add }) }) : null, _jsx(PhotoSourceSheet, { open: sourceOpen, onOpenChange: setSourceOpen, labels: labels.source, disabled: actions.choose.disabled, ...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable }), onSelect: props.onSelectSource }), props.error ? _jsx(Notice, { tone: "danger", title: props.error }) : null, props.photo ? _jsx(PhotoPreview, { photo: props.photo, label: labels.preview, viewerLabels: props.viewerLabels, ...(props.decoratePreview ? { decoratePreview: props.decoratePreview } : {}), parts: parts, ...(props.imageHost ? { imageHost: props.imageHost } : {}), corner: _jsx(IconButton, { type: "button", label: labels.remove, tone: photoAttachmentRecipe.removeTone, size: photoAttachmentRecipe.removeSize, shape: photoAttachmentRecipe.removeShape, disabled: actions.remove.disabled, onClick: props.onRemove, children: "\u00D7" }) }) : null] });
    };
}
//# sourceMappingURL=photo-attachment.js.map