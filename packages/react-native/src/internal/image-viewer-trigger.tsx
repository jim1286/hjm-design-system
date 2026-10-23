import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { imageViewerTriggerRecipe, validateImageViewerTriggerLabel } from "@hjmds/design-contracts/components/image";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { useHjmNativeTheme } from "../provider.js";

export type ImageViewerTriggerProps = Omit<PressableProps, "children" | "style" | "accessibilityLabel" | "accessibilityRole"> & Readonly<{
  /** Localized accessible name, e.g. "View photo full screen". The media inside is decorative. */
  label: string;
  /** Product media (HJM `Image` with `decorative`). */
  children: ReactNode;
  onPress: () => void;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/**
 * Pressable around product media that opens ImageViewer (imageViewerTriggerRecipe), exported from the image-viewer
 * subpath beside the viewer it opens; the product keeps the viewer's `open` state.
 */
export function ImageViewerTrigger({ label, children, onPress, disabled, layoutStyle, ...props }: ImageViewerTriggerProps) {
  validateImageViewerTriggerLabel(label);
  const { tokens } = useHjmNativeTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="imagebutton"
      accessibilityLabel={label}
      accessibilityState={{ ...props.accessibilityState, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: tokens.radius[imageViewerTriggerRecipe.radius],
          opacity: disabled ? imageViewerTriggerRecipe.disabledOpacity : pressed ? imageViewerTriggerRecipe.pressedOpacity : 1,
          overflow: "hidden",
        },
        layoutStyle,
      ]}
    >
      {children}
    </Pressable>
  );
}
