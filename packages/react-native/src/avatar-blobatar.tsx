import { Blobatar } from "@blobatar/react-native";
import { happy } from "blobatar/expression";
import { resolveBlobatarFallback, type AvatarFallbackContext, type BlobatarFallbackOptions } from "@hjmds/design-contracts/avatar-fallback";
import type { ReactNode } from "react";
export type { BlobatarFallbackOptions } from "@hjmds/design-contracts/avatar-fallback";
/** Static entry deliberately excludes upstream animated/Reanimated imports. */
export function createBlobatarFallback(options: BlobatarFallbackOptions): (context: AvatarFallbackContext) => ReactNode {
  const { seed, expression } = resolveBlobatarFallback(options);
  return ({ size }) => <Blobatar name={seed} size={size} normalize={false}
    {...(expression === "happy" ? { expression: happy } : {})}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
