import { useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { Blobatar } from "@blobatar/react-native";
import { AnimatedBlobatar } from "@blobatar/react-native/animated";
import { idle, happy, sad, surprised, wink, sleepy, thinking } from "blobatar/expression";
import { resolveBlobatarMotion, type BlobatarMotionOptions, type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { useHjmNativeTheme } from "./provider.js";

const expressions = { idle, happy, sad, surprised, wink, sleepy, thinking };
function Artwork({ size, options }: { size: number; options: BlobatarMotionOptions }) {
  const spec = resolveBlobatarMotion(options);
  const { environment } = useHjmNativeTheme();
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  useEffect(() => {
    const sub = AppState.addEventListener("change", state => setForeground(state === "active"));
    return () => sub.remove();
  }, []);
  const moving = spec.active && spec.visible && foreground && !environment.reducedMotion;
  const props = {
    name: spec.seed, size, normalize: false, expression: expressions[spec.expression],
    accessible: false, accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants" as const,
  };
  // Upstream 2.7.0 keeps useFrameCallback active even with animate=false (measured on iOS).
  // Unmount its animation runtime when paused; the static renderer preserves seed and expression.
  return moving ? <AnimatedBlobatar {...props} animate/> : <Blobatar {...props}/>;
}
/** Host supplies route/item visibility; AppState alone cannot identify an offscreen list item. */
export function createAnimatedBlobatarFallback(options: BlobatarMotionOptions): (context: AvatarFallbackContext) => ReactNode {
  resolveBlobatarMotion(options);
  return ({ size }) => <Artwork size={size} options={options}/>;
}
