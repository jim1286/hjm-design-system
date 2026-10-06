/**
 * Experimental drawing geometry, not a public TextFormat variant. A renderer
 * supplies measured visual line rectangles; estimating widths from character
 * counts would break proportional fonts, Korean wrapping, and bidirectional text.
 * See docs/text-annotation.md for the unfinished renderer boundary.
 */
export const textAnnotationActions = [
  'highlight', 'underline', 'box', 'circle', 'strike-through', 'crossed-off', 'bracket',
] as const;
export type TextAnnotationAction = typeof textAnnotationActions[number];
export type TextAnnotationRect = Readonly<{ x: number; y: number; width: number; height: number }>;
export type TextAnnotationPath = Readonly<{
  d: string;
  /** Filled marker strokes belong behind the text; outlines are unfilled. */
  paint: 'fill' | 'stroke';
  strokeWidth: number;
  lineIndex: number;
}>;
export type TextAnnotationGeometry = Readonly<{
  paths: readonly TextAnnotationPath[];
  bounds: TextAnnotationRect | null;
}>;

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

/**
 * Small deterministic offsets give the two passes a hand-drawn character.
 * Random-per-render geometry was rejected: unrelated state updates must not
 * make the annotation jump or create server/client output differences.
 */
export function resolveTextAnnotationGeometry(
  lines: readonly TextAnnotationRect[],
  action: TextAnnotationAction,
  options: Readonly<{ strokeWidth?: number; padding?: number }> = {},
): TextAnnotationGeometry {
  if (!(textAnnotationActions as readonly string[]).includes(action)) throw new TypeError('Unknown text annotation action');
  // These are drawing parameters, not layout spacing. 1.5px keeps a doubled
  // outline lighter than a focus ring; the 2px gap avoids touching glyph edges.
  const strokeWidth = options.strokeWidth ?? 1.5;
  const padding = options.padding ?? 2;
  finite(strokeWidth, 'strokeWidth'); finite(padding, 'padding');
  if (strokeWidth <= 0) throw new RangeError('strokeWidth must be positive');
  if (padding < 0) throw new RangeError('padding must not be negative');
  const paths: TextAnnotationPath[] = [];
  let bounds: TextAnnotationRect | null = null;
  for (const [lineIndex, line] of lines.entries()) {
    for (const name of ['x', 'y', 'width', 'height'] as const) finite(line[name], name);
    if (line.width < 0 || line.height < 0) throw new RangeError('Line dimensions must not be negative');
    // Empty lines and a not-yet-laid-out host do not produce stray marker dots.
    if (line.width === 0 || line.height === 0) continue;
    // Scale the wobble down for tiny fragments; it must not swallow punctuation.
    const wobble = Math.min(1, line.width / 8, line.height / 8);
    // The surrounding loop must clear the actual text even if callers choose
    // zero padding or a thick pen. Strike-through/crossed-off intentionally do not.
    const gap = action === 'circle' ? Math.max(padding, strokeWidth / 2 + wobble) : padding;
    const l = line.x - gap, r = line.x + line.width + gap;
    const t = line.y - gap, b = line.y + line.height + gap;
    const cx = l + (r - l) / 2, cy = t + (b - t) / 2;
    // A modest outward bow keeps a loop distinct from the box without extending
    // an ellipse by 40% of a long line's width into neighboring text or the screen edge.
    const bow = action === 'circle' ? Math.min(line.width, line.height) * 0.12 : 0;
    const add = (d: string, paint: 'fill' | 'stroke') => paths.push({ d, paint, strokeWidth, lineIndex });
    if (action === 'highlight') {
      add(`M ${l} ${t + wobble} Q ${cx} ${t - wobble} ${r} ${t} L ${r - wobble} ${b} Q ${cx} ${b + wobble} ${l} ${b - wobble} Z`, 'fill');
    } else {
      for (const offset of [-wobble / 2, wobble / 2]) {
        const x1 = l + offset, x2 = r + offset, y1 = t + offset, y2 = b + offset;
        switch (action) {
          case 'underline':
            add(`M ${x1} ${y2} Q ${cx} ${y2 + wobble} ${x2} ${y2 - wobble / 2}`, 'stroke'); break;
          case 'strike-through':
            add(`M ${x1} ${cy + offset} Q ${cx} ${cy - wobble} ${x2} ${cy + offset}`, 'stroke'); break;
          case 'crossed-off':
            add(`M ${x1} ${y1} Q ${cx} ${cy - wobble} ${x2} ${y2} M ${x2} ${y1} Q ${cx} ${cy + wobble} ${x1} ${y2}`, 'stroke'); break;
          case 'box':
            add(`M ${x1} ${y1} Q ${cx} ${y1 - wobble} ${x2} ${y1} L ${x2} ${y2} Q ${cx} ${y2 + wobble} ${x1} ${y2} Z`, 'stroke'); break;
          case 'circle':
            // The original inscribed ellipse cut through end glyphs at 32px.
            // Bow each edge outward through the padded corners instead: every
            // segment stays outside the text rectangle while retaining a loose loop.
            add(`M ${x1} ${cy} Q ${x1 - bow} ${y1} ${x1} ${y1} Q ${cx} ${y1 - bow} ${x2} ${y1} Q ${x2 + bow} ${cy} ${x2} ${y2} Q ${cx} ${y2 + bow} ${x1} ${y2} Q ${x1 - bow} ${cy} ${x1} ${cy} Z`, 'stroke'); break;
          case 'bracket': {
            const arm = Math.min(line.height / 3, line.width / 4);
            add(`M ${x1 + arm} ${y1} L ${x1} ${y1} L ${x1} ${y2} L ${x1 + arm} ${y2} M ${x2 - arm} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x2 - arm} ${y2}`, 'stroke'); break;
          }
        }
      }
    }
    // Include control points, both sketch passes and stroke caps so the SVG
    // viewBox cannot clip an underline or a bracket at large text sizes.
    const outset = Math.max(2 * wobble, bow + wobble / 2) + strokeWidth / 2;
    const left = l - outset, top = t - outset, right = r + outset, bottom = b + outset;
    if (!bounds) bounds = { x: left, y: top, width: right - left, height: bottom - top };
    else {
      const x = Math.min(bounds.x, left), y = Math.min(bounds.y, top);
      bounds = { x, y, width: Math.max(bounds.x + bounds.width, right) - x, height: Math.max(bounds.y + bounds.height, bottom) - y };
    }
  }
  // Overflow can occur even with finite inputs. Reject it here instead of
  // handing NaN/Infinity geometry to a native SVG implementation.
  if (bounds) for (const value of Object.values(bounds)) finite(value, 'Annotation bounds');
  return { paths, bounds };
}
