import type { ReactNode } from "react";
import { resolveDocumentResourceControls, type DocumentResourceControls } from "@hjmds/design-contracts/document-resource";
import { Button } from "../actions.js";
import { Stack, Surface, Text } from "../layout.js";

/** Internal candidate. Rendering a host result never initiates file access or transfer. */
export function DocumentResource({ preview, moreAction, ...props }: DocumentResourceControls & Readonly<{ preview?: ReactNode; moreAction?: ReactNode }>) {
  const resource = resolveDocumentResourceControls(props);
  const { labels } = props;
  const previewFailed = resource.preview.status === "error";
  const saveFailed = resource.save.status === "error";
  return <Surface padding="md" radius="lg" role="group" aria-label={resource.name}>
    <Stack gap="sm">
      {/* A file name is not automatically a page heading. Keep it readable when the preview fails. */}
      <Text emphasis="strong" style={{ overflowWrap: "anywhere" }}>{resource.name}</Text>
      {resource.metadata.map((label, index) => <Text key={index} variant="caption" tone="muted">{label}</Text>)}
      {resource.description ? <Text>{resource.description}</Text> : null}
      {resource.preview.status === "ready" ? preview : null}
      {resource.preview.status === "none" ? <Text tone="muted">{labels.previewUnavailable}</Text> : null}
      {resource.preview.status === "loading" ? <Text role="status">{labels.previewLoading}</Text> : null}
      {previewFailed ? <Text tone="danger" role="alert">{resource.preview.status === "error" ? resource.preview.message : ""}</Text> : null}
      {/* Independent buttons prevent preview navigation from swallowing save/menu interaction. */}
      {props.onPreview ? <Button tone="secondary" disabled={!resource.canPreview} onClick={props.onPreview}>{labels.preview}</Button> : null}
      {previewFailed && resource.preview.retryable ? <Button tone="secondary" disabled={!resource.canRetryPreview} onClick={props.onRetryPreview}>{labels.retryPreview}</Button> : null}
      <Button disabled={saveFailed ? !resource.canRetrySave : !resource.canSave}
        loading={resource.save.status === "pending"}
        onClick={saveFailed ? props.onRetrySave : props.onSave}>
        {saveFailed ? labels.retrySave : resource.save.status === "pending" ? labels.saving : labels.save}
      </Button>
      {saveFailed ? <Text tone="danger" role="alert">{resource.save.status === "error" ? resource.save.message : ""}</Text> : null}
      {resource.save.status === "started" || resource.save.status === "saved" || resource.save.status === "cancelled"
        ? <Text role="status">{labels[resource.save.status]}</Text> : null}
      {moreAction}
    </Stack>
  </Surface>;
}
