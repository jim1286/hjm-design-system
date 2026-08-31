import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { getUploadItemAvailableAction, resolveUploadItemAnnouncement, } from "@hjmds/design-contracts/components/upload-item";
import { forwardRef } from "react";
import { Progress } from "./feedback.js";
import { classNames } from "./internal.js";
/** One upload row whose available action is derived entirely from status. */
export const UploadItem = forwardRef(function UploadItem({ descriptor, labels, onCancel, onRetry, leading, className, ...props }, ref) {
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
    const progressValueText = isUploading && announcement.description !== labels.uploading
        ? announcement.description
        : undefined;
    return (_jsxs("div", { ...props, ref: ref, "aria-label": announcement.label, className: classNames("hjm-upload-item", className), "data-status": descriptor.state.status, role: "group", children: [leading === undefined ? null : _jsx("span", { "aria-hidden": "true", className: "hjm-upload-item__leading", children: leading }), _jsxs("div", { className: "hjm-upload-item__body", children: [_jsx("span", { className: "hjm-upload-item__name", children: descriptor.name }), descriptor.sizeLabel === undefined ? null : _jsx("span", { className: "hjm-upload-item__meta", children: descriptor.sizeLabel }), isUploading ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-atomic": "true", "aria-live": "polite", className: "hjm-upload-item__status hjm-visually-hidden", children: labels.uploading }), _jsx(Progress, { "aria-label": labels.uploading, label: labels.uploading, ...(progress === null || progress === undefined ? {} : { value: progress * 100 }), ...(progressValueText === undefined ? {} : { valueText: progressValueText }) })] })) : (_jsx("span", { className: "hjm-upload-item__status", "aria-live": "polite", children: announcement.description }))] }), action === "cancel" ? (_jsx("button", { className: "hjm-upload-item__action", "data-action": "cancel", onClick: () => onCancel?.(descriptor.id), type: "button", children: labels.cancel })) : action === "retry" ? (_jsx("button", { className: "hjm-upload-item__action", "data-action": "retry", onClick: () => onRetry?.(descriptor.id), type: "button", children: labels.retry })) : null] }));
});
//# sourceMappingURL=upload-item.js.map