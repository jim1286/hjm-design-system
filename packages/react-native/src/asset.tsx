import {
  assetRecipe,
  shouldAnimateAsset,
  validateAssetDescriptor,
  type AssetDescriptor,
} from "@hjmds/design-contracts/components/asset";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useHjmNativeTheme } from "./provider.js";

export type AssetProps = Readonly<{
  descriptor: AssetDescriptor;
  /**
   * The media itself. A Lottie or video player is the product's dependency;
   * `animate` is the already-resolved answer to "may this move right now".
   */
  children: ReactNode | ((state: Readonly<{ animate: boolean }>) => ReactNode);
  /** A small mark on the frame's outer corner (play, status dot). */
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function Asset({ descriptor, children, accessory, style }: AssetProps) {
  validateAssetDescriptor(descriptor);
  const { palette, environment } = useHjmNativeTheme();
  const size = assetRecipe.sizes[descriptor.size ?? assetRecipe.defaults.size];
  const shape = assetRecipe.shapes[descriptor.shape ?? assetRecipe.defaults.shape];
  const decorative = descriptor.decorative ?? false;
  // The frame freezes nothing itself — it has no player. It hands the one
  // answer to the slot so the product does not re-derive the preference.
  const animate = shouldAnimateAsset(descriptor.kind, environment.reducedMotion);
  return (
    <View
      style={[{ position: "relative" }, style]}
      accessible={!decorative}
      accessibilityRole={decorative ? "none" : "image"}
      {...(decorative
        ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const }
        : { accessibilityLabel: descriptor.accessibilityLabel })}
    >
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: shape,
          borderWidth: 1,
          borderColor: resolveColorReference(assetRecipe.border, palette),
          backgroundColor: resolveColorReference(assetRecipe.background, palette),
        }}
      >
        {typeof children === "function" ? children({ animate }) : children}
      </View>
      {accessory ? (
        <View
          // Outside the frame's corner so it never covers the media's middle.
          style={{ position: "absolute", bottom: -assetRecipe.accessory.offset, right: -assetRecipe.accessory.offset }}
        >
          {accessory}
        </View>
      ) : null}
    </View>
  );
}

export type AssetGroupProps = Readonly<{
  /** Accessible name for the group; the overlap alone does not say what it is. */
  label: string;
  size?: AssetDescriptor["size"];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export function AssetGroup({ label, size = assetRecipe.defaults.size, children, style }: AssetGroupProps) {
  const overlap = -Math.round(assetRecipe.sizes[size] * assetRecipe.overlapRatio);
  return (
    <View accessibilityRole="none" accessible accessibilityLabel={label} style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View key={index} style={index === 0 ? undefined : { marginStart: overlap }}>{child}</View>
          ))
        : children}
    </View>
  );
}
