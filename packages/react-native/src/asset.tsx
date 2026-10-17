import {
  assetRecipe,
  shouldAnimateAsset,
  validateAssetDescriptor,
  type AssetDescriptor,
} from "@hjmds/design-contracts/components/asset";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import type { ReactNode } from "react";
import { View } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Asset({ descriptor, children, accessory, layoutStyle }: AssetProps) {
  validateAssetDescriptor(descriptor);
  const { palette, environment, tokens } = useHjmNativeTheme();
  const size = assetRecipe.sizes[descriptor.size ?? assetRecipe.defaults.size];
  const shapeKey = descriptor.shape ?? assetRecipe.defaults.shape;
  // Rounded follows the nearest profile; square/circle keep their explicit
  // geometry so a brand radius cannot turn a circular illustration into a card.
  const shape = shapeKey === "rounded" ? tokens.radius.md : assetRecipe.shapes[shapeKey];
  const decorative = descriptor.decorative ?? false;
  // The frame freezes nothing itself — it has no player. It hands the one
  // answer to the slot so the product does not re-derive the preference.
  const animate = shouldAnimateAsset(descriptor.kind, environment.reducedMotion);
  return (
    <View
      style={[{ position: "relative" }, layoutStyle]}
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
          // Outside the frame's end/bottom corner so it never covers the media's middle; `end` mirrors in RTL like Web.
          style={{ position: "absolute", bottom: -assetRecipe.accessory.offset, end: -assetRecipe.accessory.offset }}
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
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export function AssetGroup({ label, size = assetRecipe.defaults.size, children, layoutStyle }: AssetGroupProps) {
  const overlap = -Math.round(assetRecipe.sizes[size] * assetRecipe.overlapRatio);
  return (
    <View accessibilityRole="none" accessible accessibilityLabel={label} style={[{ flexDirection: "row", alignItems: "center" }, layoutStyle]}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View key={index} style={index === 0 ? undefined : { marginStart: overlap }}>{child}</View>
          ))
        : children}
    </View>
  );
}
