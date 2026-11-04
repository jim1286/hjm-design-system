import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { View } from "react-native";
import { photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment, } from "@hjmds/design-contracts/components/image";
import { glyph } from "@hjmds/design-contracts/foundations";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { Button, IconButton } from "../actions.js";
import { Image } from "../data-display.js";
import { Notice } from "../feedback.js";
import { Stack } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import { DrawnClose } from "./drawn-glyphs.js";
import { ImageViewerTrigger } from "./image-viewer-trigger.js";
import { PhotoSourceGlyph } from "./photo-source-icon.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
function PhotoPreview({ photo, label, onLoadStatusChange, viewerLabels, safeAreaInsets, imageHost, Viewer, corner, decoratePreview }) {
    const [open, setOpen] = useState(false);
    const { tokens } = useHjmNativeTheme();
    const frame = resolvePhotoAttachmentPreviewSize(photo);
    const inset = tokens.spacing[photoAttachmentRecipe.removeInset];
    const decorate = decoratePreview ?? ((image) => image);
    return _jsxs(View, { children: [_jsx(ImageViewerTrigger, { label: label, onPress: () => setOpen(true), layoutStyle: { alignSelf: "stretch" }, children: decorate(_jsx(Image, { src: photo.uri, width: frame.width, height: frame.height, fit: frame.fit, decorative: true, layoutStyle: { width: "100%" }, ...(onLoadStatusChange ? { onLoadStatusChange } : {}), ...(imageHost?.sourceAdapter ? { sourceAdapter: imageHost.sourceAdapter } : {}), ...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {}) })) }), corner ? _jsx(View, { style: { position: "absolute", top: inset, end: inset }, children: corner }) : null, _jsx(Viewer, { open: open, onClose: () => setOpen(false), safeAreaInsets: safeAreaInsets, items: [{ id: photo.uri, uri: photo.uri, label, width: photo.width, height: photo.height }], ...viewerLabels, ...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {}) })] });
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
     * One optional photo under written content (photoAttachmentRecipe): a small choose action → PhotoSourceSheet, then
     * the preview (opens the viewer) with a corner remove button. The product keeps the draft and uploads at submit.
     */
    return function PhotoAttachmentField(props) {
        validatePhotoAttachment(props.labels, props.photo);
        const { colors } = useHjmNativeTheme();
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
        return _jsxs(Stack, { gap: photoAttachmentRecipe.gap, ...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {}), children: [actions.choose.visible && props.chooseAction !== "none" ? _jsx(View, { style: { alignSelf: "flex-start" }, children: _jsx(Button, { tone: photoAttachmentRecipe.chooseTone, size: photoAttachmentRecipe.chooseSize, edge: "start", disabled: actions.choose.disabled, loading: actions.choose.loading, leading: _jsx(PhotoSourceGlyph, { source: "library", color: colors.textMuted, background: "transparent", size: glyph.sm }), onPress: () => setSourceOpen(true), children: labels.add }) }) : null, _jsx(PhotoSourceSheet, { open: sourceOpen, onOpenChange: setSourceOpen, labels: labels.source, disabled: actions.choose.disabled, ...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable }), onSelect: props.onSelectSource }), props.error ? _jsx(Notice, { tone: "danger", announcement: "assertive", title: props.error }) : null, props.photo ? _jsx(PhotoPreview, { photo: props.photo, label: labels.preview, viewerLabels: props.viewerLabels, ...(props.decoratePreview ? { decoratePreview: props.decoratePreview } : {}), safeAreaInsets: props.safeAreaInsets, Viewer: Viewer, ...(props.imageHost ? { imageHost: props.imageHost } : {}), corner: _jsx(IconButton, { label: labels.remove, tone: photoAttachmentRecipe.removeTone, size: photoAttachmentRecipe.removeSize, shape: photoAttachmentRecipe.removeShape, disabled: actions.remove.disabled, onPress: props.onRemove, children: _jsx(DrawnClose, { size: glyph[iconButtonRecipe.sizes[photoAttachmentRecipe.removeSize].glyph], color: colors.text }) }) }) : null] });
    };
}
//# sourceMappingURL=photo-attachment.js.map