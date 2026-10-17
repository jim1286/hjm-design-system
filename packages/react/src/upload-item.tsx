import {
  getUploadItemAvailableAction,
  resolveUploadItemAnnouncement,
  type UploadItemDescriptor,
  type UploadItemLabels,
} from "@hjmds/design-contracts/components/upload-item";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { IconButton } from "./actions.js";
import { Progress } from "./feedback.js";
import { Icon } from "./supplemental-display.js";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type UploadItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
  descriptor: UploadItemDescriptor;
  labels: UploadItemLabels;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  leading?: ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** One upload row whose available action is derived entirely from status. */
export const UploadItem = forwardRef<HTMLDivElement, UploadItemProps>(function UploadItem(
  { descriptor, labels, onCancel, onRetry, leading, className, layoutStyle, ...props },
  ref,
) {
  const announcement = resolveUploadItemAnnouncement(descriptor, labels);
  const action = getUploadItemAvailableAction(descriptor.state);
  if (action === "cancel" && onCancel === undefined) {
    throw new TypeError("UploadItem requires onCancel while status is uploading");
  }
  if (action === "retry" && onRetry === undefined) {
    throw new TypeError("UploadItem requires onRetry while status is error");
  }
  const isUploading = descriptor.state.status === "uploading";
  const progress = isUploading ? descriptor.state.progress : undefined;
  const progressValueText =
    isUploading && announcement.description !== labels.uploading
      ? announcement.description
      : undefined;
  return (
    <div
      {...props}
      style={{ ...props.style, ...layoutStyle }}
      ref={ref}
      aria-label={announcement.label}
      className={classNames("hjm-upload-item", className)}
      data-status={descriptor.state.status}
      role="group"
    >
      {leading === undefined ? null : <span aria-hidden="true" className="hjm-upload-item__leading">{leading}</span>}
      <div className="hjm-upload-item__body">
        <span className="hjm-upload-item__name">{descriptor.name}</span>
        {descriptor.sizeLabel === undefined ? null : <span className="hjm-upload-item__meta">{descriptor.sizeLabel}</span>}
        {isUploading ? (
          <>
            <span
              aria-atomic="true"
              aria-live="polite"
              className="hjm-upload-item__status hjm-visually-hidden"
            >
              {labels.uploading}
            </span>
            <Progress
              aria-label={labels.uploading}
              label={labels.uploading}
              {...(progress === null || progress === undefined ? {} : { value: progress * 100 })}
              {...(progressValueText === undefined ? {} : { valueText: progressValueText })}
            />
          </>
        ) : (
          <span className="hjm-upload-item__status" aria-live="polite">{announcement.description}</span>
        )}
      </div>
      {/* Row tool actions are icon buttons named by the localized label. Cancelling an upload is not destructive, so
          it stays neutral instead of the danger text it used to be (2026-10-17 review). edge="end" ends the glyph slot on
          the row's md inset, mirroring the file text's start inset (2026-10-17 measured audit: 26 vs 16). */}
      {action === "cancel" ? (
        <IconButton className="hjm-upload-item__action" edge="end" data-action="cancel" label={labels.cancel} onClick={() => onCancel?.(descriptor.id)} tone="ghost"><Icon name="close" /></IconButton>
      ) : action === "retry" ? (
        <IconButton className="hjm-upload-item__action" edge="end" data-action="retry" label={labels.retry} onClick={() => onRetry?.(descriptor.id)} tone="ghost"><Icon name="refresh" /></IconButton>
      ) : null}
    </div>
  );
});
