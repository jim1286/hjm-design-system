import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { ProgressiveBlur } from '../src/progressive-blur.js';
import { useScrollMetrics } from '../src/scroll-progress.js';
import { HjmProvider } from '../src/provider.js';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it('uncovers measured boundaries, focus and resized content without intercepting pointer targets', async () => {
 const mount = document.createElement('div'); document.body.append(mount); const root = createRoot(mount);
 function Demo() {
  const [host, setHost] = useState<HTMLDivElement | null>(null); const metrics = useScrollMetrics(host); const [focused, setFocused] = useState(false);
  return <HjmProvider><div style={{ position: 'relative', width: 240 }}>
   <div data-scroll ref={setHost} style={{ height: 100, overflow: 'auto' }} onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
    <div data-content style={{ height: 300 }}><button>Readable action</button></div>
   </div><ProgressiveBlur descriptor={{ edge: 'bottom', extent: 64, strength: .5, content: { kind: 'scroll', metrics, focused } }}/>
  </div></HjmProvider>;
 }
 const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 60)); });
 try {
  await act(() => root.render(<Demo/>)); await settle();
  const effect = () => mount.querySelector('[data-hjm-progressive-blur]');
  expect(effect()).not.toBeNull(); expect(getComputedStyle(effect()!).pointerEvents).toBe('none'); expect(effect()!.getAttribute('aria-hidden')).toBe('true');
  await act(() => mount.querySelector('button')!.focus()); expect(effect()).toBeNull();
  await act(() => mount.querySelector('button')!.blur()); expect(effect()).not.toBeNull();
  const scroll = mount.querySelector('[data-scroll]') as HTMLElement;
  scroll.scrollTop = 200; scroll.dispatchEvent(new Event('scroll')); await settle(); expect(effect()).toBeNull();
  scroll.scrollTop = 0; scroll.dispatchEvent(new Event('scroll')); await settle(); expect(effect()).not.toBeNull();
  (mount.querySelector('[data-content]') as HTMLElement).style.height = '50px'; await settle(); expect(effect()).toBeNull();
 } finally { await act(() => root.unmount()); mount.remove(); }
});
