import {
  assetRecipe,
  shouldAnimateAsset,
  validateAssetDescriptor,
  type AssetDescriptor,
} from "@hjmds/design-contracts/components/asset";
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type AssetProps = Readonly<{
  descriptor: AssetDescriptor;
  /**
   * The media itself. A player is the product's dependency, never this
   * package's — the frame is all the contract owns. `animate` is the
   * already-resolved answer to "may this move right now".
   */
  children: ReactNode | ((state: Readonly<{ animate: boolean }>) => ReactNode);
  /** A small mark on the frame's outer corner (play, status dot). */
  accessory?: ReactNode;
  className?: string;
}>;

export const Asset = forwardRef<HTMLDivElement, AssetProps>(function Asset(
  { descriptor, children, accessory, className },
  forwardedRef,
) {
  validateAssetDescriptor(descriptor);
  const theme = useOptionalHjmTheme();
  const size = assetRecipe.sizes[descriptor.size ?? assetRecipe.defaults.size];
  const shape = assetRecipe.shapes[descriptor.shape ?? assetRecipe.defaults.shape];
  const decorative = descriptor.decorative ?? false;
  // The frame reports whether motion is allowed so the product's player can
  // read one answer instead of re-deriving the preference per surface.
  const animate = shouldAnimateAsset(descriptor.kind, theme?.environment.reducedMotion ?? false);
  return (
    <div
      ref={forwardedRef}
      className={classNames("hjm-asset", className)}
      data-kind={descriptor.kind}
      data-animate={animate || undefined}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : descriptor.accessibilityLabel}
      style={{
        "--hjm-asset-size": `${size}px`,
        "--hjm-asset-radius": `${shape}px`,
        "--hjm-asset-accessory-offset": `${assetRecipe.accessory.offset}px`,
      } as CSSProperties}
    >
      <div className="hjm-asset__frame">
        <div className="hjm-asset__media">{typeof children === "function" ? children({ animate }) : children}</div>
      </div>
      {accessory ? <span className="hjm-asset__accessory">{accessory}</span> : null}
    </div>
  );
});

export type AssetGroupProps = Readonly<{
  /** Accessible name for the group; the overlap alone does not say what it is. */
  label: string;
  size?: AssetDescriptor["size"];
  children: ReactNode;
  className?: string;
}>;

/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export function AssetGroup({ label, size = assetRecipe.defaults.size, children, className }: AssetGroupProps) {
  const pixels = assetRecipe.sizes[size];
  return (
    <div
      className={classNames("hjm-asset-group", className)}
      role="group"
      aria-label={label}
      style={{ "--hjm-asset-overlap": `${-Math.round(pixels * assetRecipe.overlapRatio)}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
