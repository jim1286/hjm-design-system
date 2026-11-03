import { useState, type ReactNode } from "react";
import {
  photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment,
  type PhotoAttachmentLabels, type PhotoAttachmentPhoto, type PhotoAttachmentUpload,
} from "@hjmds/design-contracts/components/image";
import type { UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { Button } from "../actions.js";
import { Image, type ImageProps } from "../data-display.js";
import { Notice } from "../feedback.js";
import { Stack, Text } from "../primitives.js";
import { UploadItem } from "../upload-item.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { ImageViewerTrigger } from "./image-viewer-trigger.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
import type { ImageViewerProps } from "../image-viewer.js";

export type { PhotoAttachmentLabels, PhotoAttachmentPhoto, PhotoAttachmentUpload } from "@hjmds/design-contracts/components/image";

/** ImageViewer's own copy (it validates every label even for one photo). */
export type PhotoAttachmentViewerLabels = Pick<ImageViewerProps, "closeLabel" | "previousLabel" | "nextLabel" | "loadingLabel" | "errorLabel" | "retryLabel">;
/** Product image hosts (auth headers, expo-image disk cache) for the preview and the viewer. Defaults use RN Image. */
export type PhotoAttachmentImageHost = Readonly<{
  sourceAdapter?: ImageProps["sourceAdapter"];
  renderImage?: ImageProps["renderImage"];
  renderViewerImage?: ImageViewerProps["renderImage"];
}>;

type ViewerProps = Readonly<{
  viewerLabels: PhotoAttachmentViewerLabels;
  safeAreaInsets: ImageViewerProps["safeAreaInsets"];
  imageHost?: PhotoAttachmentImageHost;
  /** The viewer component, passed by the image-viewer entry so this file does not import it back (cycle). */
  Viewer: (props: ImageViewerProps) => ReactNode;
}>;

function PhotoPreview({ photo, label, disabled, onLoadStatusChange, viewerLabels, safeAreaInsets, imageHost, Viewer }: ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto; label: string; disabled?: boolean; onLoadStatusChange?: ImageProps["onLoadStatusChange"];
}>) {
  const [open, setOpen] = useState(false);
  const frame = resolvePhotoAttachmentPreviewSize(photo);
  return <>
    <ImageViewerTrigger label={label} disabled={disabled} onPress={() => setOpen(true)} layoutStyle={{ alignSelf: "stretch" }}>
      <Image src={photo.uri} width={frame.width} height={frame.height} fit={frame.fit} decorative layoutStyle={{ width: "100%" }}
        {...(imageHost?.sourceAdapter ? { sourceAdapter: imageHost.sourceAdapter } : {})}
        {...(onLoadStatusChange ? { onLoadStatusChange } : {})}
        {...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {})} />
    </ImageViewerTrigger>
    <Viewer open={open} onClose={() => setOpen(false)} safeAreaInsets={safeAreaInsets}
      items={[{ id: photo.uri, uri: photo.uri, label, width: photo.width, height: photo.height }]} {...viewerLabels}
      {...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {})} />
  </>;
}

export type AttachedPhotoProps = Omit<ViewerProps, "Viewer"> & Readonly<{
  photo: PhotoAttachmentPhoto;
  /** Accessible name of the photo button and the viewer item, e.g. "View attached photo". */
  label: string;
  /** Load result of the photo under the text, e.g. to offer a retry when an authorized address is refused. */
  onLoadStatusChange?: ImageProps["onLoadStatusChange"];
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type PhotoAttachmentFieldProps = Omit<ViewerProps, "Viewer"> & Readonly<{
  photo: PhotoAttachmentPhoto | null;
  /** `upload` copy is needed only with the `upload` prop. */
  labels: PhotoAttachmentLabels & Readonly<{ source: PhotoSourceLabels; upload?: UploadItemLabels }>;
  /** Product picker for the chosen source; runs after the sheet has closed (iOS cannot present over a closing modal). */
  onSelectSource(source: PhotoSource): void;
  onRemove(): void;
  /** While the system picker is open. Locks choose/remove and shows the button's spinner. */
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
  /** Product message for a failed pick (permission, unreadable photo). The draft is kept. */
  error?: string;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function createAttachedPhoto(Viewer: ViewerProps["Viewer"]) {
  /** A posted photo under its text: tap to open the shared viewer (pull down to close). */
  return function AttachedPhoto({ photo, label, layoutStyle, ...viewer }: AttachedPhotoProps) {
    if (!label.trim() || !photo.uri.trim() || !(photo.width > 0 && photo.height > 0))
      throw new TypeError("AttachedPhoto needs a label and a sized photo");
    return <Stack {...(layoutStyle ? { layoutStyle } : {})}><PhotoPreview photo={photo} label={label} Viewer={Viewer} {...viewer} /></Stack>;
  };
}

export function createPhotoAttachmentField(Viewer: ViewerProps["Viewer"]) {
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
      <Button tone={photoAttachmentRecipe.chooseTone} disabled={actions.choose.disabled} loading={actions.choose.loading}
        onPress={() => setSourceOpen(true)}>{labels[actions.choose.label]}</Button>
      {props.hint ? <Text variant="caption" tone="muted">{props.hint}</Text> : null}
      <PhotoSourceSheet open={sourceOpen} onOpenChange={setSourceOpen} labels={labels.source} disabled={actions.choose.disabled}
        {...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable })} onSelect={props.onSelectSource} />
      {props.error ? <Notice tone="danger" announcement="assertive" title={props.error} /> : null}
      {props.photo ? <>
        <PhotoPreview photo={props.photo} label={labels.preview} viewerLabels={props.viewerLabels} safeAreaInsets={props.safeAreaInsets}
          Viewer={Viewer} {...(props.imageHost ? { imageHost: props.imageHost } : {})} />
        {props.upload && labels.upload ? <UploadItem labels={labels.upload}
          descriptor={{ id: props.photo.uri, name: labels.preview, state: props.upload.status === "uploading"
            ? { status: "uploading", progress: props.upload.progress, ...(props.upload.progressLabel ? { progressLabel: props.upload.progressLabel } : {}) }
            : { status: "error", message: props.upload.message } }}
          {...(props.onRetryUpload ? { onRetry: () => props.onRetryUpload!() } : {})}
          {...(props.onCancelUpload ? { onCancel: () => props.onCancelUpload!() } : {})} /> : null}
        <Button tone={photoAttachmentRecipe.removeTone} size={photoAttachmentRecipe.actionSize} disabled={actions.remove.disabled}
          onPress={props.onRemove}>{labels.remove}</Button>
      </> : null}
    </Stack>;
  };
}
