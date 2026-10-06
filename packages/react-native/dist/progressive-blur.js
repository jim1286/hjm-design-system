import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
import { View } from 'react-native';
import { resolveProgressiveBlur } from '@hjmds/design-contracts/progressive-blur';
import { useHjmNativeTheme } from './provider.js';
/** Content stays a sibling so losing the optional native host cannot lose its state. */
export function ProgressiveBlur({ descriptor, renderLayer }) {
    const { environment } = useHjmNativeTheme();
    const effect = resolveProgressiveBlur(descriptor, environment.direction);
    if (!effect.visible)
        return null;
    const vertical = effect.side === 'top' || effect.side === 'bottom';
    return _jsx(View, { pointerEvents: "none", accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", style: { position: 'absolute', [effect.side]: 0, ...(vertical ? { left: 0, right: 0, height: effect.extent } : { top: 0, bottom: 0, width: effect.extent }) }, children: _jsx(DecorationBoundary, { children: effect.layers.map((layer, index) => _jsx(HostLayer, { layer: { ...layer, side: effect.side }, renderLayer: renderLayer }, index)) }) });
}
// Native blur availability/failure is local to decoration. Retrying on each
// content render would repeatedly throw, so recovery requires an explicit remount.
class DecorationBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? null : this.props.children; }
}
function HostLayer({ layer, renderLayer }) {
    return renderLayer(layer);
}
//# sourceMappingURL=progressive-blur.js.map