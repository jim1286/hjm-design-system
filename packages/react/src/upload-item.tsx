import {
  getUploadItemAvailableAction,
  resolveUploadItemAnnouncement,
  type UploadItemDescriptor,
  type UploadItemLabels,
} from "@hjmds/design-contracts/components/upload-item";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Progress } from "./feedback.js";
import { classNames } from "./internal.js";

export type UploadItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
  descriptor: UploadItemDescriptor;
  labels: UploadItemLabels;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  leading?: ReactNode;
}>;

/** One upload row whose available action is derived entirely from status. */
export const UploadItem = forwardRef<HTMLDivElement, UploadItemProps>(function UploadItem(
  { descriptor, labels, onCancel, onRetry, leading, className, ...props },
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
  const progress = descriptor.state.status === "uploading" ? descriptor.state.progress : undefined;
  return (
    <div
      {...props}
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
        <span className="hjm-upload-item__status" aria-live="polite">{announcement.description}</span>
        {descriptor.state.status === "uploading" ? (
          <Progress
            label={announcement.description}
            {...(progress === null || progress === undefined ? {} : { value: progress * 100 })}
            valueText={announcement.description}
          />
        ) : null}
      </div>
      {action === "cancel" ? (
        <button className="hjm-upload-item__action" data-action="cancel" onClick={() => onCancel?.(descriptor.id)} type="button">{labels.cancel}</button>
      ) : action === "retry" ? (
        <button className="hjm-upload-item__action" data-action="retry" onClick={() => onRetry?.(descriptor.id)} type="button">{labels.retry}</button>
      ) : null}
    </div>
  );
});
