import { jsx as _jsx } from "react/jsx-runtime";
import { resolveProgressiveBlur } from '@hjmds/design-contracts/progressive-blur';
import { useHjmTheme } from './provider.js';
/** Place after the content inside a positioned, clipped host. Never wrap content. */
export function ProgressiveBlur({ descriptor }) {
    const { environment } = useHjmTheme();
    const effect = resolveProgressiveBlur(descriptor, environment.direction);
    if (!effect.visible)
        return null;
    const vertical = effect.side === 'top' || effect.side === 'bottom';
    const toward = { top: 'top', bottom: 'bottom', left: 'left', right: 'right' }[effect.side];
    return _jsx("div", { "aria-hidden": "true", "data-hjm-progressive-blur": effect.side, style: { position: 'absolute', pointerEvents: 'none', [effect.side]: 0, ...(vertical ? { left: 0, right: 0, height: effect.extent } : { top: 0, bottom: 0, width: effect.extent }) }, children: effect.layers.map((layer, index) => {
            const mask = `linear-gradient(to ${toward}, transparent ${layer.start * 100}%, black ${layer.end * 100}%)`;
            // Pixel mapping is Web-only. Native hosts calibrate their own intensity;
            // a CSS radius is not portable to platform blur engines.
            const blur = `blur(${layer.strength * 16}px)`;
            return _jsx("div", { style: { position: 'absolute', inset: 0, pointerEvents: 'none', backdropFilter: blur, WebkitBackdropFilter: blur, maskImage: mask, WebkitMaskImage: mask } }, index);
        }) });
}
//# sourceMappingURL=progressive-blur.js.map