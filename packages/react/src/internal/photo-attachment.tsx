"use client";

import { useState, type ReactNode } from "react";
import {
  photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment,
  type PhotoAttachmentLabels, type PhotoAttachmentPhoto, type PhotoAttachmentUpload,
} from "@hjmds/design-contracts/components/image";
import type { UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { Button } from "../actions.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { Notice } from "../feedback.js";
import type { ImageViewerProps, ImageViewerTrigger as ImageViewerTriggerType } from "../image-viewer.js";
import { Stack, Text } from "../layout.js";
import { Image, type ImageProps } from "../supplemental-display.js";
import { UploadItem } from "../upload-item.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";

export type { PhotoAttachmentLabels, PhotoAttachmentPhoto, PhotoAttachmentUpload } from "@hjmds/design-contracts/components/image";

/** ImageViewer's own copy (it validates every label even for one photo). */
export type PhotoAttachmentViewerLabels = Pick<ImageViewerProps, "closeLabel" | "previousLabel" | "nextLabel" | "loadingLabel" | "errorLabel" | "retryLabel">;
/** Product image hosts (framework image, authorized fetch) for the preview and the viewer. Defaults use `<img>`. */
export type PhotoAttachmentImageHost = Readonly<{
  renderImage?: ImageProps["renderImage"];
  renderViewerImage?: ImageViewerProps["renderImage"];
}>;

type ViewerParts = Readonly<{
  Viewer: (props: ImageViewerProps) => ReactNode;
  Trigger: typeof ImageViewerTriggerType;
}>;
type ViewerProps = Readonly<{ viewerLabels: PhotoAttachmentViewerLabels; imageHost?: PhotoAttachmentImageHost }>;

function PhotoPreview({ photo, label, disabled, onLoadStatusChange, viewerLabels, imageHost, parts }: ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto; label: string; disabled?: boolean; onLoadStatusChange?: ImageProps["onLoadStatusChange"]; parts: ViewerParts;
}>) {
  const [open, setOpen] = useState(false);
  const frame = resolvePhotoAttachmentPreviewSize(photo);
  const { Viewer, Trigger } = parts;
  return <>
    <Trigger label={label} disabled={disabled} onClick={() => setOpen(true)}>
      <Image src={photo.uri} width={frame.width} height={frame.height} fit={frame.fit} decorative
        {...(onLoadStatusChange ? { onLoadStatusChange } : {})}
        {...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {})} />
    </Trigger>
    <Viewer open={open} onClose={() => setOpen(false)} items={[{ id: photo.uri, uri: photo.uri, label }]} {...viewerLabels}
      {...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {})} />
  </>;
}

export type AttachedPhotoProps = ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto;
  /** Accessible name of the photo button and the viewer item, e.g. "View attached photo". */
  label: string;
  /** Load result of the photo under the text, e.g. to offer a retry when an authorized address is refused. */
  onLoadStatusChange?: ImageProps["onLoadStatusChange"];
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type PhotoAttachmentFieldProps = ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto | null;
  /** `upload` copy is needed only with the `upload` prop. */
  labels: PhotoAttachmentLabels & Readonly<{ source: PhotoSourceLabels; upload?: UploadItemLabels }>;
  /** Product picker for the chosen source; called inside the click so the file input keeps the user activation. */
  onSelectSource(source: PhotoSource): void;
  onRemove(): void;
  /** While the file chooser is open. Locks choose/remove and shows the button's spinner. */
  picking?: boolean;
  /** Only when the product uploads on pick; an upload that runs at submit stays with the submit action. */
  upload?: PhotoAttachmentUpload;
  onRetryUpload?(): void;
  onCancelUpload?(): void;
  /** Host lock (submitting, rate limit). The preview stays viewable. */
  disabled?: boolean;
  cameraAvailable?: boolean;
  /** Short note under the button, e.g. size or visibility of the photo. */
  hint?: string;
  /** Product message for a failed pick (unsupported or unreadable file). The draft is kept. */
  error?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function createAttachedPhoto(parts: ViewerParts) {
  /** A posted photo under its text: click to open the shared viewer. */
  return function AttachedPhoto({ photo, label, layoutStyle, ...viewer }: AttachedPhotoProps) {
    if (!label.trim() || !photo.uri.trim() || !(photo.width > 0 && photo.height > 0))
      throw new TypeError("AttachedPhoto needs a label and a sized photo");
    return <Stack {...(layoutStyle ? { layoutStyle } : {})}><PhotoPreview photo={photo} label={label} parts={parts} {...viewer} /></Stack>;
  };
}

export function createPhotoAttachmentField(parts: ViewerParts) {
  /**
   * One optional photo under written content (photoAttachmentRecipe): choose → PhotoSourceSheet → preview → viewer,
   * replace/remove, and the upload row when the product uploads on pick. The product keeps the draft and the photo.
   */
  return function PhotoAttachmentField(props: PhotoAttachmentFieldProps) {
    validatePhotoAttachment(props.labels, props.photo);
    if (props.upload && !props.labels.upload) throw new TypeError("PhotoAttachmentField needs labels.upload with an upload");
    const [sourceOpen, setSourceOpen] = useState(false);
    const actions = resolvePhotoAttachmentActions({
      hasPhoto: props.photo !== null,
      ...(props.picking === undefined ? {} : { picking: props.picking }),
      ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
      ...(props.upload ? { upload: props.upload.status } : {}),
    });
    const { labels } = props;
    return <Stack gap={photoAttachmentRecipe.gap} {...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {})}>
      <Button type="button" tone={photoAttachmentRecipe.chooseTone} disabled={actions.choose.disabled} loading={actions.choose.loading}
        onClick={() => setSourceOpen(true)}>{labels[actions.choose.label]}</Button>
      {props.hint ? <Text variant="caption" tone="muted">{props.hint}</Text> : null}
      <PhotoSourceSheet open={sourceOpen} onOpenChange={setSourceOpen} labels={labels.source} disabled={actions.choose.disabled}
        {...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable })} onSelect={props.onSelectSource} />
      {props.error ? <Notice tone="danger" title={props.error} /> : null}
      {props.photo ? <>
        <PhotoPreview photo={props.photo} label={labels.preview} viewerLabels={props.viewerLabels} parts={parts}
          {...(props.imageHost ? { imageHost: props.imageHost } : {})} />
        {props.upload && labels.upload ? <UploadItem labels={labels.upload}
          descriptor={{ id: props.photo.uri, name: labels.preview, state: props.upload.status === "uploading"
            ? { status: "uploading", progress: props.upload.progress, ...(props.upload.progressLabel ? { progressLabel: props.upload.progressLabel } : {}) }
            : { status: "error", message: props.upload.message } }}
          {...(props.onRetryUpload ? { onRetry: () => props.onRetryUpload!() } : {})}
          {...(props.onCancelUpload ? { onCancel: () => props.onCancelUpload!() } : {})} /> : null}
        <Button type="button" tone={photoAttachmentRecipe.removeTone} size={photoAttachmentRecipe.actionSize} disabled={actions.remove.disabled}
          onClick={props.onRemove}>{labels.remove}</Button>
      </> : null}
    </Stack>;
  };
}
