import { Blobatar } from "@blobatar/react";
import { happy } from "blobatar/expression";
import { resolveBlobatarFallback, type AvatarFallbackContext, type BlobatarFallbackOptions } from "@hjmds/design-contracts/avatar-fallback";
import type { ReactNode } from "react";
export type { BlobatarFallbackOptions } from "@hjmds/design-contracts/avatar-fallback";
/** Optional, local artwork. Avatar owns naming and image-error recovery. */
export function createBlobatarFallback(options: BlobatarFallbackOptions): (context: AvatarFallbackContext) => ReactNode {
  const { seed, expression } = resolveBlobatarFallback(options);
  return ({ size }) => <Blobatar name={seed} size={size} normalize={false} animate={false}
    {...(expression === "happy" ? { expression: happy } : {})}
    alt="" aria-hidden="true" style={{ display: "block" }} />;
}
