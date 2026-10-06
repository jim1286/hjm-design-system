import { useState } from "react";
import { View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveImageComparison, type ImageComparisonDescriptor } from "@hjmds/design-contracts/reference-controls";
import { Slider } from "./slider.js";
import { Image } from "./data-display.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
export type ImageComparisonProps = ImageComparisonDescriptor & Readonly<{ onValueChange: (value: number) => void; getValueText: (value: number) => string; disabled?: boolean; decrementLabel: string; incrementLabel: string }>;
export function ImageComparison(props: ImageComparisonProps) {
  const { before, after, label, value, onValueChange, getValueText, disabled = false, decrementLabel, incrementLabel } = props;
  const { aspectRatio, fraction } = resolveImageComparison(props);
  const { colors } = useHjmNativeTheme();
  const [width, setWidth] = useState(0);
  // Render both images at the full measured width. Resizing the clipped image
  // itself would zoom it and make before/after coordinates incomparable.
  const height = width / aspectRatio;
  // Match the physical left/right image coordinates instead of mirroring only
  // the captions in RTL; the slider keeps its normal localized interaction.
  return <View style={{ gap: spacing.xs }}><View style={{ direction: "ltr", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.sm }}><Text>{before.label}</Text><Text>{after.label}</Text></View>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ aspectRatio, width: "100%", overflow: "hidden", backgroundColor: colors.surfaceAlt, direction: "ltr" }}>
      {width > 0 ? <>
        <Image src={after.src} width={width} height={height} decorative={false} accessibilityLabel={after.label} />
        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: width * fraction, overflow: "hidden" }}><Image src={before.src} width={width} height={height} decorative={false} accessibilityLabel={before.label} /></View>
        <View pointerEvents="none" accessible={false} style={{ position: "absolute", left: width * fraction, top: 0, bottom: 0, borderLeftWidth: 2, borderColor: colors.border }} />
      </> : null}
    </View>
    <Slider label={label} min={0} max={100} step={1} value={value} onValueChange={onValueChange} getValueText={getValueText} disabled={disabled} decrementLabel={decrementLabel} incrementLabel={incrementLabel} />
  </View>;
}
