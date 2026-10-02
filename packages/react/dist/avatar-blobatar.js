import { jsx as _jsx } from "react/jsx-runtime";
import { Blobatar } from "@blobatar/react";
import { happy } from "blobatar/expression";
import { resolveBlobatarFallback } from "@hjmds/design-contracts/avatar-fallback";
/** Optional, local artwork. Avatar owns naming and image-error recovery. */
export function createBlobatarFallback(options) {
    const { seed, expression } = resolveBlobatarFallback(options);
    return ({ size }) => _jsx(Blobatar, { name: seed, size: size, normalize: false, animate: false, ...(expression === "happy" ? { expression: happy } : {}), alt: "", "aria-hidden": "true", style: { display: "block" } });
}
//# sourceMappingURL=avatar-blobatar.js.map