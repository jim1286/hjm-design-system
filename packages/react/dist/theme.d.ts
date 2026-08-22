import type { DesignSystemProviderValue } from "@hjm/design-contracts/components/design-system-provider";
import type { CSSProperties } from "react";
export type HjmThemeStyle = CSSProperties & Record<`--hjm-${string}`, string | number>;
export declare function createHjmThemeStyle(value: DesignSystemProviderValue): HjmThemeStyle;
//# sourceMappingURL=theme.d.ts.map