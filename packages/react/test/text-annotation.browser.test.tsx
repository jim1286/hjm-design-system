import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { HjmProvider } from '../src/provider.js';
import { TextAnnotation } from '../src/text-annotation.js';
import { textAnnotationActions } from '@hjmds/design-contracts/text-annotation';
import '../src/styles.css';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); host.style.width = '280px'; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); window.getSelection()?.removeAllRanges(); });
const text = '강조할 긴 문장이 다음 줄로 이어져도 각 줄의 위치를 알아야 합니다';
function rects() {
  const range = document.createRange(); range.selectNodeContents(host.querySelector('[data-hjm-annotation-text]')!);
  return Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
}
function aligned() {
  const glyphs = rects(), paths = host.querySelectorAll<SVGPathElement>('path');
  for (const path of paths) {
    const line = glyphs[Number(path.dataset.line)]!;
    const box = path.getBoundingClientRect();
    expect(box.left).toBeLessThanOrEqual(line.left + 0.01);
    expect(box.right).toBeGreaterThanOrEqual(line.right - 0.01);
    expect(box.top).toBeLessThanOrEqual(line.top + 0.01);
    expect(box.bottom).toBeGreaterThanOrEqual(line.bottom - 0.01);
  }
  expect(paths).toHaveLength(glyphs.length);
}

it('decorates only the inline fragment while preserving original wrapping, selection and surrounding text', async () => {
  await act(async () => root.render(<HjmProvider reducedMotion><p>앞 문장 <TextAnnotation>{text}</TextAnnotation> 뒤 문장</p><p data-plain="">앞 문장 {text} 뒤 문장</p></HjmProvider>));
  expect(rects().length).toBeGreaterThan(1); aligned();
  expect(host.querySelector('p')!.getBoundingClientRect().height).toBe(host.querySelector('[data-plain]')!.getBoundingClientRect().height);
  const range = document.createRange(); range.selectNodeContents(host.querySelector('p')!); window.getSelection()!.addRange(range);
  expect(window.getSelection()!.toString()).toBe(`앞 문장 ${text} 뒤 문장`);
  expect(host.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  expect(getComputedStyle(host.querySelector('svg')!).pointerEvents).toBe('none');
  expect(host.querySelectorAll('button,[tabindex],a')).toHaveLength(0);
});

it('remeasures large RTL text after narrowing without replaying entry motion', async () => {
  await act(async () => root.render(<HjmProvider theme="dark" direction="rtl" textScale={2} reducedMotion><p style={{fontSize:32}}>قبل <TextAnnotation>{'نص عربي طويل مع English 123 ثم نص عربي طويل لاختبار التفاف السطور'}</TextAnnotation> بعد</p></HjmProvider>));
  aligned();
  const before = host.querySelector('path')!.getAttribute('d');
  await act(async () => { host.style.width = '184px'; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await expect.poll(() => host.querySelector('path')!.getAttribute('d')).not.toBe(before);
  aligned(); expect(host.getAnimations({ subtree: true })).toHaveLength(0);
});

it('updates after a preceding sibling changes even if the paragraph size stays the same', async () => {
  const render = (prefix: string) => act(async () => root.render(<HjmProvider reducedMotion><p><span>{prefix}</span><TextAnnotation>{text}</TextAnnotation></p></HjmProvider>));
  await render('앞 '); aligned();
  await render('앞 문장 내용 ');
  await act(async () => { await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await expect.poll(() => { try { aligned(); return true; } catch { return false; } }).toBe(true);
});

it('replaces measured paths when text becomes short or empty', async () => {
  const render = (value: string) => act(async () => root.render(<HjmProvider reducedMotion><p><TextAnnotation>{value}</TextAnnotation></p></HjmProvider>));
  await render(text); expect(host.querySelectorAll('path').length).toBeGreaterThan(1);
  await render('짧음'); aligned(); expect(host.querySelectorAll('path')).toHaveLength(1);
  await render(''); expect(host.querySelector('svg')).toBeNull();
});

it('renders every action without replacing the readable text or exposing the decoration', async () => {
  for (const action of textAnnotationActions) {
    await act(async () => root.render(<HjmProvider reducedMotion><p><TextAnnotation action={action}>{text}</TextAnnotation></p></HjmProvider>));
    expect(host.querySelector('p')!.textContent).toBe(text);
    expect(host.querySelectorAll('path')).toHaveLength(rects().length * (action === 'highlight' ? 1 : 2));
    expect(host.getAnimations({subtree:true})).toHaveLength(0);
  }
});

it('cancels running decorations when reduced motion is enabled', async () => {
  const render = (reducedMotion: boolean) => act(async () => root.render(<HjmProvider reducedMotion={reducedMotion}><p><TextAnnotation action="underline">선 그리기</TextAnnotation></p></HjmProvider>));
  await render(false); expect(host.getAnimations({subtree:true}).length).toBeGreaterThan(0);
  await render(true); expect(host.getAnimations({subtree:true})).toHaveLength(0);
  expect(host.querySelector('[data-hjm-annotation-text]')!.textContent).toBe('선 그리기');
});

it('keeps the surrounding loop stroke outside every measured glyph rectangle at large text', async () => {
  await act(async () => root.render(<HjmProvider reducedMotion><p style={{fontSize:32,lineHeight:1.8}}>앞 <TextAnnotation action="circle">강조할 긴 문장이 줄을 넘어 이어집니다</TextAnnotation> 뒤</p></HjmProvider>));
  const glyphs = rects();
  for (const path of host.querySelectorAll<SVGPathElement>('path')) {
    const line = glyphs[Number(path.dataset.line)]!;
    const transform = path.getScreenCTM()!;
    const length = path.getTotalLength();
    // Inspect the drawn curve, not just its bounding box: an ellipse can have
    // a large bounding box while crossing the first and last letters inside it.
    for (let distance = 0; distance <= length; distance += 0.5) {
      const local = path.getPointAtLength(distance);
      const point = new DOMPoint(local.x, local.y).matrixTransform(transform);
      const halfStroke = Number(path.getAttribute('stroke-width')) / 2;
      const outside = point.x + halfStroke <= line.left || point.x - halfStroke >= line.right || point.y + halfStroke <= line.top || point.y - halfStroke >= line.bottom;
      expect(outside, `Loop overlaps text at ${point.x},${point.y}`).toBe(true);
    }
  }
});
