import { describe, expect, it } from 'vitest';
import { mergeTextAnnotationFragments as merge, resolveTextAnnotationGeometry as resolve, textAnnotationActions } from '../src/text-annotation.js';

describe('text annotation measured geometry', () => {
  const lines = [{ x: 20, y: 0, width: 200, height: 32 }, { x: 20, y: 40, width: 64, height: 32 }];
  it('keeps wrapped line fragments independent rather than filling the paragraph bounding box', () => {
    const result = resolve(lines, 'highlight');
    expect(result.paths).toHaveLength(2);
    expect(result.paths.map(path => path.lineIndex)).toEqual([0, 1]);
    expect(result.paths.every(path => path.paint === 'fill')).toBe(true);
    const coordinates = result.paths[1]!.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    expect(Math.max(...coordinates.filter((_, index) => index % 2 === 0))).toBeLessThan(90);
    expect(result.bounds!.x).toBeLessThan(18);
    expect(result.bounds!.y + result.bounds!.height).toBeGreaterThan(74);
  });
  it('keeps physical RTL and mixed-direction fragment positions supplied by the text engine', () => {
    const rtl = [{ x: 130, y: 0, width: 60, height: 24 }, { x: 10, y: 0, width: 45, height: 24 }];
    const result = resolve(rtl, 'underline');
    expect(result.paths[0]!.d).toMatch(/^M 127.5 /);
    expect(result.paths[2]!.d).toMatch(/^M 7.5 /);
    expect(result.paths.map(path => path.lineIndex)).toEqual([0, 0, 1, 1]);
  });
  it.each(textAnnotationActions)('%s is stable across rerenders, accepts fractional and negative host offsets', action => {
    const fractional = [{ x: -5.25, y: 2.5, width: 0.25, height: 48.75 }];
    const before = JSON.stringify(fractional);
    const first = resolve(fractional, action);
    expect(first).toEqual(resolve(fractional, action));
    expect(first.paths.length).toBeGreaterThan(0);
    expect(first.paths.every(path => !/NaN|Infinity/.test(path.d))).toBe(true);
    expect(JSON.stringify(fractional)).toBe(before);
    expect(first.bounds!.x).toBeLessThan(fractional[0]!.x);
  });
  it('does not draw unloaded hosts or empty lines', () => {
    expect(resolve([], 'box')).toEqual({ paths: [], bounds: null });
    expect(resolve([{ x: 0, y: 0, width: 0, height: 20 }, { x: 0, y: 0, width: 20, height: 0 }], 'underline')).toEqual({ paths: [], bounds: null });
  });
  it('remeasures geometry without carrying the previous text position or line count', () => {
    const wide = resolve(lines, 'bracket');
    const narrow = resolve([{ x: 20, y: 0, width: 80, height: 64 }], 'bracket');
    expect(narrow.paths).toHaveLength(2);
    expect(narrow.bounds!.width).toBeLessThan(wide.bounds!.width);
    expect(resolve([], 'bracket').paths).toHaveLength(0);
  });
  it('rejects malformed geometry before a renderer consumes SVG paths', () => {
    for (const patch of [{ width: -1 }, { height: -1 }, { x: Infinity }, { y: NaN }, { width: Infinity }]) {
      expect(() => resolve([{ ...lines[0]!, ...patch }], 'circle')).toThrow(RangeError);
    }
    for (const options of [{ strokeWidth: 0 }, { strokeWidth: -1 }, { strokeWidth: NaN }, { padding: -1 }, { padding: Infinity }]) {
      expect(() => resolve(lines, 'box', options)).toThrow(RangeError);
    }
    expect(() => resolve([{ x: Number.MAX_VALUE, y: 0, width: Number.MAX_VALUE, height: 24 }], 'box')).toThrow(RangeError);
    // Runtime JavaScript consumers can supply values outside the TypeScript union.
    expect(() => resolve(lines, 'unknown' as 'box')).toThrow(TypeError);
  });
  it('coalesces adjacent font fallback runs without darkening their overlapping padding', () => {
    const fragments = [
      { lineIndex:0,x:75.62,y:7.8,width:62.279991,height:28.8 },
      { lineIndex:0,x:137.899994,y:10.92,width:6.660004,height:24 },
      { lineIndex:0,x:144.559998,y:7.8,width:20.76001,height:28.8 },
      { lineIndex:1,x:0,y:46.8,width:20.76,height:28.8 },
    ];
    const original = JSON.stringify(fragments), result = merge(fragments);
    expect(result).toHaveLength(2);
    expect(result[0]!.x).toBe(75.62);
    expect(result[0]!.width).toBeCloseTo(89.700008,5);
    expect(result[0]!.height).toBeCloseTo(28.8,5);
    expect(resolve(result,'highlight').paths).toHaveLength(2);
    expect(JSON.stringify(fragments)).toBe(original);
  });
  it('keeps unselected bidi gaps and distinct visual lines separate regardless of logical input order', () => {
    const result = merge([
      {lineIndex:0,x:100,y:0,width:30,height:24},
      {lineIndex:1,x:0,y:20,width:40,height:24},
      {lineIndex:0,x:0,y:0,width:40,height:24},
      {lineIndex:0,x:20,y:0,width:20,height:24},
    ]);
    expect(result).toEqual([{x:0,y:0,width:40,height:24},{x:100,y:0,width:30,height:24},{x:0,y:20,width:40,height:24}]);
  });
  it('rejects invalid line identities and drops empty measured runs', () => {
    const base={lineIndex:0,x:0,y:0,width:40,height:24};
    for(const patch of [{lineIndex:-1},{lineIndex:0.5},{lineIndex:NaN},{width:-1},{y:Infinity}]) expect(()=>merge([{...base,...patch}])).toThrow(RangeError);
    expect(merge([{...base,width:0},{...base,height:0}])).toEqual([]);
    expect(()=>merge([{...base,x:-Number.MAX_VALUE,width:Number.MAX_VALUE},{...base,width:Number.MAX_VALUE}])).toThrow(RangeError);
  });
});
