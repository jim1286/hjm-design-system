import { resolveScrollEdges, type ScrollMetrics } from './scroll-progress.js';
export type ProgressiveBlurDescriptor = Readonly<{
  edge: 'top' | 'bottom' | 'start' | 'end';
  /** Physical extent in logical pixels; choose after measuring the content host. */
  extent: number;
  /** Host-relative blur strength, not a cross-platform pixel-equivalence claim. */
  strength: number;
  layers?: number;
  content: { kind: 'decoration' } | { kind: 'scroll'; metrics: ScrollMetrics; focused: boolean };
}>;
export type ProgressiveBlurLayer = Readonly<{ strength: number; start: number; end: number }>;
export function resolveProgressiveBlur(descriptor: ProgressiveBlurDescriptor, direction: 'ltr' | 'rtl' = 'ltr') {
  const { edge, extent, strength, content } = descriptor;
  if (!['top', 'bottom', 'start', 'end'].includes(edge)) throw new TypeError('Unknown blur edge');
  if (!Number.isFinite(extent) || extent <= 0 || extent > 160) throw new RangeError('Blur extent must be between 0 and 160');
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) throw new RangeError('Blur strength must be between 0 and 1');
  // Four layers are an experimental bounded starting point, not a measured
  // performance promise. Unlike copying the upstream eight layers, callers can
  // compare 2–8 on their real host before enabling the decoration.
  const count = descriptor.layers ?? 4;
  if (!Number.isInteger(count) || count < 2 || count > 8) throw new RangeError('Blur layers must be an integer between 2 and 8');
  if (content.kind !== 'scroll' && content.kind !== 'decoration') throw new TypeError('Unknown blur content kind');
  const side: 'top' | 'bottom' | 'left' | 'right' = edge === 'start' ? (direction === 'rtl' ? 'right' : 'left') : edge === 'end' ? (direction === 'rtl' ? 'left' : 'right') : edge;
  let visible = strength > 0;
  if (content.kind === 'scroll') {
    const edges = resolveScrollEdges(content.metrics);
    visible &&= !content.focused && (edge === 'top' || edge === 'start' ? edges.before : edges.after);
  }
  return { side, extent, visible, layers: Array.from({ length: count }, (_, index): ProgressiveBlurLayer => ({
    strength: strength * (index + 1) / count, start: index / count, end: (index + 1) / count,
  })) };
}
