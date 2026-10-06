/** Candidate composition contract; file access, transfer and receipt verification stay with the host. */
export type DocumentPreviewState =
  | Readonly<{ status: "none" | "loading" | "ready" }>
  | Readonly<{ status: "error"; message: string; retryable: boolean }>;

export type DocumentSaveState =
  | Readonly<{ status: "idle" | "pending" | "started" | "saved" | "cancelled" }>
  | Readonly<{ status: "error"; message: string; retryable: boolean }>;

export type DocumentResourceDescriptor = Readonly<{
  /** Include a revision when reusing a resource id for different file contents. */
  id: string;
  name: string;
  formatLabel?: string;
  sizeLabel?: string;
  description?: string;
  disabled?: boolean;
  preview: DocumentPreviewState;
  save: DocumentSaveState;
}>;

export type DocumentResourceLabels = Readonly<{
  preview: string;
  previewLoading: string;
  previewUnavailable: string;
  retryPreview: string;
  save: string;
  saving: string;
  started: string;
  saved: string;
  cancelled: string;
  retrySave: string;
}>;

export type DocumentResourceControls = Readonly<{
  descriptor: DocumentResourceDescriptor;
  labels: DocumentResourceLabels;
  onPreview?: () => void;
  onRetryPreview?: () => void;
  onSave: () => void;
  onRetrySave?: () => void;
}>;

/** Controlled UI only: hosts connect the existing action session to their verified results. */
export function resolveDocumentResourceControls(props: DocumentResourceControls) {
  const resource = resolveDocumentResource(props.descriptor);
  for (const key of ["preview", "previewLoading", "previewUnavailable", "retryPreview", "save", "saving", "started", "saved", "cancelled", "retrySave"] as const) {
    text(props.labels[key], `labels.${key}`);
  }
  if (typeof props.onSave !== "function") throw new TypeError("Document resource requires onSave");
  for (const key of ["onPreview", "onRetryPreview", "onRetrySave"] as const) {
    if (props[key] !== undefined && typeof props[key] !== "function") throw new TypeError(`Document resource ${key} must be a function`);
  }
  if (resource.preview.status === "error" && resource.preview.retryable && !props.onRetryPreview) throw new TypeError("Retryable preview requires onRetryPreview");
  if (resource.save.status === "error" && resource.save.retryable && !props.onRetrySave) throw new TypeError("Retryable save requires onRetrySave");
  return resource;
}

function text(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`Document resource ${field} must be nonempty text`);
}

function state(value: unknown, states: readonly string[], field: string): void {
  if (!value || typeof value !== "object" || !("status" in value) || !states.includes(value.status as string)) {
    throw new TypeError(`Document resource ${field} has an unsupported status`);
  }
  if (value.status === "error") {
    const error = value as { message?: unknown; retryable?: unknown };
    text(error.message, `${field} error`);
    // An uncertain native save can have committed. Retry permission is explicit,
    // just like action-session; an error alone never authorizes another write.
    if (typeof error.retryable !== "boolean") throw new TypeError(`Document resource ${field} retryable must be boolean`);
  }
}

export function resolveDocumentResource(descriptor: DocumentResourceDescriptor) {
  text(descriptor.id, "id");
  text(descriptor.name, "name");
  for (const key of ["formatLabel", "sizeLabel", "description"] as const) {
    if (descriptor[key] !== undefined) text(descriptor[key], key);
  }
  if (descriptor.disabled !== undefined && typeof descriptor.disabled !== "boolean") {
    throw new TypeError("Document resource disabled must be boolean");
  }
  state(descriptor.preview, ["none", "loading", "ready", "error"], "preview");
  state(descriptor.save, ["idle", "pending", "started", "saved", "cancelled", "error"], "save");
  const disabled = descriptor.disabled ?? false;
  const preview = Object.freeze({ ...descriptor.preview });
  const save = Object.freeze({ ...descriptor.save });
  return Object.freeze({
    id: descriptor.id,
    name: descriptor.name,
    // Preserve product formatting and order; neither URL extensions nor inferred
    // byte counts are reliable metadata for remote/signed/local resources.
    metadata: Object.freeze([descriptor.formatLabel, descriptor.sizeLabel].filter((value): value is string => value !== undefined)),
    description: descriptor.description,
    disabled,
    preview,
    save,
    canPreview: !disabled && preview.status === "ready",
    canRetryPreview: !disabled && preview.status === "error" && preview.retryable,
    // Keep failures on the explicit retry path. A second ordinary save must not
    // bypass a host's retryable=false policy after an ambiguous OS response.
    canSave: !disabled && save.status !== "pending" && save.status !== "error",
    canRetrySave: !disabled && save.status === "error" && save.retryable,
    // Browser anchor activation proves initiation, not file-system completion.
    saved: save.status === "saved",
  });
}
