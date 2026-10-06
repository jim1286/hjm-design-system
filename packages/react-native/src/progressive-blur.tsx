import { Component, type ReactNode } from 'react';
import { View } from 'react-native';
import { resolveProgressiveBlur, type ProgressiveBlurDescriptor, type ProgressiveBlurLayer } from '@hjmds/design-contracts/progressive-blur';
import { useHjmNativeTheme } from './provider.js';
export type ProgressiveBlurHostLayer = ProgressiveBlurLayer & Readonly<{ side: 'top' | 'bottom' | 'left' | 'right' }>;
export type ProgressiveBlurProps = Readonly<{
  descriptor: ProgressiveBlurDescriptor;
  /** Product host supplies real backdrop blur and an alpha mask; no simulated tint fallback. */
  renderLayer: (layer: ProgressiveBlurHostLayer) => ReactNode;
}>;
/** Content stays a sibling so losing the optional native host cannot lose its state. */
export function ProgressiveBlur({ descriptor, renderLayer }: ProgressiveBlurProps) {
  const { environment } = useHjmNativeTheme();
  const effect = resolveProgressiveBlur(descriptor, environment.direction);
  if (!effect.visible) return null;
  const vertical = effect.side === 'top' || effect.side === 'bottom';
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ position: 'absolute', [effect.side]: 0, ...(vertical ? { left: 0, right: 0, height: effect.extent } : { top: 0, bottom: 0, width: effect.extent }) }}>
    <DecorationBoundary>{effect.layers.map((layer, index) => <HostLayer key={index} layer={{ ...layer, side: effect.side }} renderLayer={renderLayer} />)}</DecorationBoundary>
  </View>;
}
// Native blur availability/failure is local to decoration. Retrying on each
// content render would repeatedly throw, so recovery requires an explicit remount.
class DecorationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? null : this.props.children; }
}
function HostLayer({ layer, renderLayer }: { layer: ProgressiveBlurHostLayer; renderLayer: ProgressiveBlurProps['renderLayer'] }) {
  return renderLayer(layer);
}
