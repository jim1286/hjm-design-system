import { useState, type ReactNode } from "react";
import { View } from "react-native";
import {
  photoAttachmentRecipe, resolvePhotoAttachmentActions, resolvePhotoAttachmentPreviewSize, validatePhotoAttachment,
  type PhotoAttachmentLabels, type PhotoAttachmentPhoto,
} from "@hjmds/design-contracts/components/image";
import type { PhotoSource, PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { glyph } from "@hjmds/design-contracts/foundations";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { Button, IconButton } from "../actions.js";
import { Image, type ImageProps } from "../data-display.js";
import { Notice } from "../feedback.js";
import { Stack } from "../primitives.js";
import { useHjmNativeTheme } from "../provider.js";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { ImageViewerProps } from "../image-viewer.js";
import { DrawnClose } from "./drawn-glyphs.js";
import { ImageViewerTrigger } from "./image-viewer-trigger.js";
import { PhotoSourceGlyph } from "./photo-source-icon.js";
import { PhotoSourceSheet } from "./photo-source-sheet.js";

export type { PhotoAttachmentLabels, PhotoAttachmentPhoto } from "@hjmds/design-contracts/components/image";

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

function PhotoPreview({ photo, label, onLoadStatusChange, viewerLabels, safeAreaInsets, imageHost, Viewer, corner }: ViewerProps & Readonly<{
  photo: PhotoAttachmentPhoto; label: string; onLoadStatusChange?: ImageProps["onLoadStatusChange"]; corner?: ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const { tokens } = useHjmNativeTheme();
  const frame = resolvePhotoAttachmentPreviewSize(photo);
  const inset = tokens.spacing[photoAttachmentRecipe.removeInset];
  return <View>
    <ImageViewerTrigger label={label} onPress={() => setOpen(true)} layoutStyle={{ alignSelf: "stretch" }}>
      <Image src={photo.uri} width={frame.width} height={frame.height} fit={frame.fit} decorative layoutStyle={{ width: "100%" }}
        {...(onLoadStatusChange ? { onLoadStatusChange } : {})}
        {...(imageHost?.sourceAdapter ? { sourceAdapter: imageHost.sourceAdapter } : {})}
        {...(imageHost?.renderImage ? { renderImage: imageHost.renderImage } : {})} />
    </ImageViewerTrigger>
    {/* A sibling over the trigger, not inside it: nesting a button in the preview button would merge their names. */}
    {corner ? <View style={{ position: "absolute", top: inset, end: inset }}>{corner}</View> : null}
    <Viewer open={open} onClose={() => setOpen(false)} safeAreaInsets={safeAreaInsets}
      items={[{ id: photo.uri, uri: photo.uri, label, width: photo.width, height: photo.height }]} {...viewerLabels}
      {...(imageHost?.renderViewerImage ? { renderImage: imageHost.renderViewerImage } : {})} />
  </View>;
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
  labels: PhotoAttachmentLabels & Readonly<{ source: PhotoSourceLabels }>;
  /** Product picker for the chosen source; runs after the sheet has closed (iOS cannot present over a closing modal). */
  onSelectSource(source: PhotoSource): void;
  onRemove(): void;
  /** While the system picker is open. Locks choose and shows its spinner. */
  picking?: boolean;
  /** Host lock (submitting, rate limit). The preview stays viewable. */
  disabled?: boolean;
  cameraAvailable?: boolean;
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
   * One optional photo under written content (photoAttachmentRecipe): a small choose action → PhotoSourceSheet, then
   * the preview (opens the viewer) with a corner remove button. The product keeps the draft and uploads at submit.
   */
  return function PhotoAttachmentField(props: PhotoAttachmentFieldProps) {
    validatePhotoAttachment(props.labels, props.photo);
    const { colors } = useHjmNativeTheme();
    const [sourceOpen, setSourceOpen] = useState(false);
    const actions = resolvePhotoAttachmentActions({
      hasPhoto: props.photo !== null,
      ...(props.picking === undefined ? {} : { picking: props.picking }),
      ...(props.disabled === undefined ? {} : { disabled: props.disabled }),
    });
    const { labels } = props;
    return <Stack gap={photoAttachmentRecipe.gap} {...(props.layoutStyle ? { layoutStyle: props.layoutStyle } : {})}>
      {actions.choose.visible ? <View style={{ alignSelf: "flex-start" }}>
        <Button tone={photoAttachmentRecipe.chooseTone} size={photoAttachmentRecipe.chooseSize} edge="start"
          disabled={actions.choose.disabled} loading={actions.choose.loading}
          leading={<PhotoSourceGlyph source="library" color={colors.textMuted} background="transparent" size={glyph.sm} />}
          onPress={() => setSourceOpen(true)}>{labels.add}</Button>
      </View> : null}
      <PhotoSourceSheet open={sourceOpen} onOpenChange={setSourceOpen} labels={labels.source} disabled={actions.choose.disabled}
        {...(props.cameraAvailable === undefined ? {} : { cameraAvailable: props.cameraAvailable })} onSelect={props.onSelectSource} />
      {props.error ? <Notice tone="danger" announcement="assertive" title={props.error} /> : null}
      {props.photo ? <PhotoPreview photo={props.photo} label={labels.preview} viewerLabels={props.viewerLabels}
        safeAreaInsets={props.safeAreaInsets} Viewer={Viewer} {...(props.imageHost ? { imageHost: props.imageHost } : {})}
        corner={<IconButton label={labels.remove} tone={photoAttachmentRecipe.removeTone} size={photoAttachmentRecipe.removeSize}
          shape={photoAttachmentRecipe.removeShape} disabled={actions.remove.disabled} onPress={props.onRemove}>
          <DrawnClose size={glyph[iconButtonRecipe.sizes[photoAttachmentRecipe.removeSize].glyph]} color={colors.text} />
        </IconButton>} /> : null}
    </Stack>;
  };
}
