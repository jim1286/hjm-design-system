import type { ReactNode } from "react";
import { resolveDocumentResourceControls, type DocumentResourceControls } from "@hjmds/design-contracts/document-resource";
import { Button } from "../actions.js";
import { Stack, Surface, Text } from "../primitives.js";

/** Internal candidate; the native file/share host stays product-owned. */
export function DocumentResource({ preview, moreAction, ...props }: DocumentResourceControls & Readonly<{ preview?: ReactNode; moreAction?: ReactNode }>) {
  const resource = resolveDocumentResourceControls(props);
  const { labels } = props;
  const previewFailed = resource.preview.status === "error";
  const saveFailed = resource.save.status === "error";
  return <Surface padding="md" radius="lg" accessible={false}>
    <Stack gap="sm">
      <Text emphasis="strong">{resource.name}</Text>
      {resource.metadata.map((label, index) => <Text key={index} variant="caption" tone="muted">{label}</Text>)}
      {resource.description ? <Text>{resource.description}</Text> : null}
      {resource.preview.status === "ready" ? preview : null}
      {resource.preview.status === "none" ? <Text tone="muted">{labels.previewUnavailable}</Text> : null}
      {resource.preview.status === "loading" ? <Text accessibilityLiveRegion="polite">{labels.previewLoading}</Text> : null}
      {previewFailed ? <Text tone="danger" accessibilityRole="alert">{resource.preview.status === "error" ? resource.preview.message : ""}</Text> : null}
      {props.onPreview ? <Button growWithContent tone="secondary" disabled={!resource.canPreview} onPress={props.onPreview}>{labels.preview}</Button> : null}
      {previewFailed && resource.preview.retryable ? <Button growWithContent tone="secondary" disabled={!resource.canRetryPreview} onPress={props.onRetryPreview}>{labels.retryPreview}</Button> : null}
      <Button growWithContent disabled={saveFailed ? !resource.canRetrySave : !resource.canSave}
        loading={resource.save.status === "pending"}
        onPress={saveFailed ? props.onRetrySave : props.onSave}>
        {saveFailed ? labels.retrySave : resource.save.status === "pending" ? labels.saving : labels.save}
      </Button>
      {saveFailed ? <Text tone="danger" accessibilityRole="alert">{resource.save.status === "error" ? resource.save.message : ""}</Text> : null}
      {resource.save.status === "started" || resource.save.status === "saved" || resource.save.status === "cancelled"
        ? <Text accessibilityLiveRegion="polite">{labels[resource.save.status]}</Text> : null}
      {moreAction}
    </Stack>
  </Surface>;
}
