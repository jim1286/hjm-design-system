"use client";

import { useState, type ReactNode } from "react";
import {
  photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment,
  type PhotoAttachmentLabels, type PhotoAttachmentPhoto,
} from "@hjmds/design-contracts/components/image";
import { glyph } from "@hjmds/design-contracts/foundations";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { Button, IconButton } from "../actions.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { Notice } from "../feedback.js";
import type { ImageViewerProps, ImageViewerTrigger as ImageViewerTriggerType } from "../image-viewer.js";
import { Stack } from "../layout.js";
import { Image, type ImageProps } from "../supplemental-display.js";
import { PhotoSourceGlyph } from "./photo-source-icon.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";
import { X } from "lucide";
import { LucideGlyph } from "./lucide-glyph.js";

export type { PhotoAttachmentLabels, PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";

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

function PhotoPreview({ photo, label, onLoadStatusChange, viewerLabels, imageHost, parts, corner, decoratePreview }: ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto; label: string; onLoadStatusChange?: ImageProps["onLoadStatusChange"]; parts: ViewerParts; corner?: ReactNode;
  decoratePreview?: (image: ReactNode) => ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const frame = resolvePhotoAttachmentPreviewSize(photo);
  const { Viewer, Trigger } = parts;
  const decorate = decoratePreview ?? ((image: ReactNode) => image);
  return <div className="hjm-photo-attachment__preview">
    <Trigger label={label} onClick={() => setOpen(true)}>
      {decorate(<Image src={photo.uri} width={frame.width} height={frame.height} fit={frame.fit} decorative
        {...(onLoadStatusChange ? { onLoadStatusChange } : {})}
        {...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {})} />)}
    </Trigger>
    {/* A sibling over the trigger, not inside it: a button cannot contain another button. */}
    {corner ? <div className="hjm-photo-attachment__corner">{corner}</div> : null}
    <Viewer open={open} onClose={() => setOpen(false)} items={[{ id: photo.uri, uri: photo.uri, label }]} {...viewerLabels}
      {...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {})} />
  </div>;
}

export type AttachedPhotoProps = ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto;
  /** Accessible name of the photo button and the viewer item, e.g. "View attached photo". */
  label: string;
  /** Load result of the photo under the text, e.g. to offer a retry when an authorized address is refused. */
  onLoadStatusChange?: ImageProps["onLoadStatusChange"];
  /**
   * Product art around and over the preview image (a postcard frame, stickers). Receives the image and returns what the
   * preview button shows; the corner remove button and the viewer stay HJM's. The viewer opens the bare photo.
   */
  decoratePreview?: (image: ReactNode) => ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

export type PhotoAttachmentFieldProps = ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto | null;
  labels: PhotoAttachmentLabels & Readonly<{ source: PhotoSourceLabels }>;
  /** Product picker for the chosen source; called inside the click so the file input keeps the user activation. */
  onSelectSource(source: PhotoSource): void;
  onRemove(): void;
  /** While the file chooser or the product's shrinking runs. Locks choose and shows its spinner. */
  picking?: boolean;
  /** Host lock (submitting, rate limit). The preview stays viewable. */
  disabled?: boolean;
  cameraAvailable?: boolean;
  /** Product message for a failed pick (unsupported or unreadable file). The draft is kept. */
  error?: string;
  /**
   * `none`: the host shows its own choose action (for example in a compose toolbar) and opens the source sheet through
   * `sourceOpen`. The preview, error and sheet stay here so a toolbar product does not rebuild them.
   */
  chooseAction?: "inline" | "none";
  /** Controlled source sheet. Uncontrolled when omitted. */
  sourceOpen?: boolean;
  onSourceOpenChange?(open: boolean): void;
  /**
   * Product art around and over the preview image (a postcard frame, stickers). Receives the image and returns what the
   * preview button shows; the corner remove button and the viewer stay HJM's. The viewer opens the bare photo.
   */
  decoratePreview?: (image: ReactNode) => ReactNode;
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
   * One optional photo under written content (photoAttachmentRecipe): a small choose action → PhotoSourceSheet, then
   * the preview (opens the viewer) with a corner remove button. The product keeps the draft and uploads at submit.
   */
  return function PhotoAttachmentField(props: PhotoAttachmentFieldProps) {
    validatePhotoAttachment(props.labels, props.photo);
    const [ownSourceOpen, setOwnSourceOpen] = useState(false);
    const sourceOpen = props.sourceOpen ?? ownSourceOpen;
    const setSourceOpen = (open: boolean) => { if (props.sourceOpen === undefined) setOwnSourceOpen(open); props.onSourceOpenChange?.(open); };
    const actions = resolvePhotoAttachmentActions({
      hasPhoto: props.photo !== null,
      ...(props.picking === undefined ? {} : { picking: props.picking }),
      ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
    });
    const { labels } = props;
    return <Stack gap={photoAttachmentRecipe.gap} {...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {})}>
      {actions.choose.visible && props.chooseAction !== "none" ? <div className="hjm-photo-attachment__choose">
        <Button type="button" tone={photoAttachmentRecipe.chooseTone} size={photoAttachmentRecipe.chooseSize} edge="start"
          disabled={actions.choose.disabled} loading={actions.choose.loading}
          leading={<PhotoSourceGlyph source="library" size={glyph.sm} />}
          onClick={() => setSourceOpen(true)}>{labels.add}</Button>
      </div> : null}
      <PhotoSourceSheet open={sourceOpen} onOpenChange={setSourceOpen} labels={labels.source} disabled={actions.choose.disabled}
        {...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable })} onSelect={props.onSelectSource} />
      {props.error ? <Notice tone="danger" title={props.error} /> : null}
      {props.photo ? <PhotoPreview photo={props.photo} label={labels.preview} viewerLabels={props.viewerLabels}
        {...(props.decoratePreview ? { decoratePreview: props.decoratePreview } : {})} parts={parts}
        {...(props.imageHost ? { imageHost: props.imageHost } : {})}
        corner={<IconButton type="button" label={labels.remove} tone={photoAttachmentRecipe.removeTone} size={photoAttachmentRecipe.removeSize}
          shape={photoAttachmentRecipe.removeShape} disabled={actions.remove.disabled} onClick={props.onRemove}><LucideGlyph node={X} /></IconButton>} /> : null}
    </Stack>;
  };
}
