import qrcode from "qrcode-generator";
import { useMemo, type ReactNode } from "react";
import { createQRMatrix, qrPath, qrCodeRecipe, type QRErrorCorrection } from "@hjmds/design-contracts/components/qr-code";
import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
export type QRCodeProps = { value: string; label: string; size?: number; level?: QRErrorCorrection; fallback: ReactNode };
export function QRCode({ value, label, size = 192, level = "M", fallback }: QRCodeProps) {
  const matrix = useMemo(() => createQRMatrix(value, qrcode, level), [value, level]);
  const modules = matrix.count + matrix.quietZone * 2;
  if (!label.trim() || fallback == null || fallback === false || !Number.isFinite(size) || size < modules * qrCodeRecipe.minModuleSize) throw new TypeError("QRCode needs an accessible label, alternative action and at least two pixels per module");
  // Integer-sized modules plus a four-module white quiet zone preserve scan geometry in both themes.
  const actualSize = Math.floor(size / modules) * modules;
  return <View><View accessible accessibilityRole="image" accessibilityLabel={label}>
    <Svg width={actualSize} height={actualSize} viewBox={`0 0 ${modules} ${modules}`} accessible={false}>
      <Rect width={modules} height={modules} fill={qrCodeRecipe.background} /><Path d={qrPath(matrix)} fill={qrCodeRecipe.foreground} />
    </Svg>
  </View>{fallback}</View>;
}
