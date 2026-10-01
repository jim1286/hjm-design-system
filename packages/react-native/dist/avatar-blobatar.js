import { jsx as _jsx } from "react/jsx-runtime";
import { Blobatar } from "@blobatar/react-native";
import { happy } from "blobatar/expression";
import { resolveBlobatarFallback } from "@hjmds/design-contracts/avatar-fallback";
/** Static entry deliberately excludes upstream animated/Reanimated imports. */
export function createBlobatarFallback(options) {
    const { seed, expression } = resolveBlobatarFallback(options);
    return ({ size }) => _jsx(Blobatar, { name: seed, size: size, normalize: false, ...(expression === "happy" ? { expression: happy } : {}), accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" });
}
//# sourceMappingURL=avatar-blobatar.js.map