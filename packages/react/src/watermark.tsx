import { useId, type ReactNode } from "react";
import { resolveWatermark } from "@hjmds/design-contracts/components/watermark";
export type WatermarkProps = Readonly<{ text: string | readonly string[]; children: ReactNode; tileWidth?: number; tileHeight?: number; rotate?: number; opacity?: number }>;
/** React escapes all text; an inline SVG pattern avoids canvas, external requests and markup interpolation. */
export function Watermark({ text, children, tileWidth, tileHeight, rotate, opacity }: WatermarkProps) {
  const config = resolveWatermark(text, tileWidth, tileHeight, rotate, opacity);
  const id = `hjm-watermark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return <div className="hjm-watermark" data-hjm-watermark>
    <div className="hjm-watermark__content">{children}</div>
    <svg className="hjm-watermark__overlay" aria-hidden="true" focusable="false" width="100%" height="100%">
      <defs><pattern id={id} width={config.width} height={config.height} patternUnits="userSpaceOnUse">
        <g transform={`rotate(${config.rotate} ${config.width / 2} ${config.height / 2})`} opacity={config.opacity} fill="currentColor">
          {config.lines.map((line, index) => <text key={index} x={config.width / 2} y={config.height / 2} dy={`${(index - (config.lines.length - 1) / 2) * 1.2}em`} textAnchor="middle" dominantBaseline="middle">{line}</text>)}
        </g>
      </pattern></defs><rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  </div>;
}
