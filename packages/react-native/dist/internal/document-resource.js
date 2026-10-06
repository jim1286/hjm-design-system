import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveDocumentResourceControls } from "@hjmds/design-contracts/document-resource";
import { Button } from "../actions.js";
import { Stack, Surface, Text } from "../primitives.js";
/** Internal candidate; the native file/share host stays product-owned. */
export function DocumentResource({ preview, moreAction, ...props }) {
    const resource = resolveDocumentResourceControls(props);
    const { labels } = props;
    const previewFailed = resource.preview.status === "error";
    const saveFailed = resource.save.status === "error";
    return _jsx(Surface, { padding: "md", radius: "lg", accessible: false, children: _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { emphasis: "strong", children: resource.name }), resource.metadata.map((label, index) => _jsx(Text, { variant: "caption", tone: "muted", children: label }, index)), resource.description ? _jsx(Text, { children: resource.description }) : null, resource.preview.status === "ready" ? preview : null, resource.preview.status === "none" ? _jsx(Text, { tone: "muted", children: labels.previewUnavailable }) : null, resource.preview.status === "loading" ? _jsx(Text, { accessibilityLiveRegion: "polite", children: labels.previewLoading }) : null, previewFailed ? _jsx(Text, { tone: "danger", accessibilityRole: "alert", children: resource.preview.status === "error" ? resource.preview.message : "" }) : null, props.onPreview ? _jsx(Button, { growWithContent: true, tone: "secondary", disabled: !resource.canPreview, onPress: props.onPreview, children: labels.preview }) : null, previewFailed && resource.preview.retryable ? _jsx(Button, { growWithContent: true, tone: "secondary", disabled: !resource.canRetryPreview, onPress: props.onRetryPreview, children: labels.retryPreview }) : null, _jsx(Button, { growWithContent: true, disabled: saveFailed ? !resource.canRetrySave : !resource.canSave, loading: resource.save.status === "pending", onPress: saveFailed ? props.onRetrySave : props.onSave, children: saveFailed ? labels.retrySave : resource.save.status === "pending" ? labels.saving : labels.save }), saveFailed ? _jsx(Text, { tone: "danger", accessibilityRole: "alert", children: resource.save.status === "error" ? resource.save.message : "" }) : null, resource.save.status === "started" || resource.save.status === "saved" || resource.save.status === "cancelled"
                    ? _jsx(Text, { accessibilityLiveRegion: "polite", children: labels[resource.save.status] }) : null, moreAction] }) });
}
//# sourceMappingURL=document-resource.js.map