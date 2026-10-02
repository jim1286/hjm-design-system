// Anchored overlay contracts share shape validation, but preserve their public
// component-specific error messages instead of merging Tooltip/Popover semantics.
export function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
  component: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new TypeError(`Unsupported ${component} ${field} field: ${key}`);
  }
}
