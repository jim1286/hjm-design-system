import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { DrawingImage } from '@hjmds/design-contracts/components/drawing-editor';
import { DrawingEditor } from '../src/drawing-editor.js';
import { HjmProvider } from '../src/provider.js';
import { drawingEditorLabels as labels } from '../../../showcase/shared/drawing-editor.js';
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); host.style.width = '400px'; document.body.append(host); root = createRoot(host);
  // Synthetic pointer events exercise ownership; the browser has no hardware pointer to capture for them.
  vi.spyOn(SVGElement.prototype, 'setPointerCapture').mockImplementation(() => {});
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); });
const canvas = () => host.querySelector<SVGSVGElement>('[data-testid="drawing-editor-canvas"]')!;
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => (node.getAttribute('aria-label') ?? node.textContent?.trim()) === label)!;
async function draw() {
  await act(async () => {
    const box = canvas().getBoundingClientRect();
    canvas().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, button: 0, clientX: box.x + 20, clientY: box.y + 30 }));
    canvas().dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: box.x + 80, clientY: box.y + 90 }));
    canvas().dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
  });
}
it('preserves a failed drawing and retries with a real JPEG excluding the crop overlay', async () => {
  const save = vi.fn(async (_image: DrawingImage) => {}); save.mockRejectedValueOnce(new Error('offline'));
  await act(async () => root.render(<HjmProvider><DrawingEditor labels={labels} cropPreview="circle" onSave={save} onCancel={() => {}} /></HjmProvider>));
  expect(button(labels.save).disabled).toBe(true);
  await draw();
  expect(canvas().querySelectorAll('path')).toHaveLength(1);
  await act(async () => button(labels.save).click());
  await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(host.textContent).toContain(labels.failed);
  expect(canvas().querySelectorAll('path')).toHaveLength(1);
  expect(canvas().querySelector('circle')).toBeNull();
  await act(async () => button(labels.save).click());
  await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1]?.[0]).toMatchObject({ mimeType: 'image/jpeg', base64: expect.stringMatching(/^\/9j\//) });
});
it('undo and redo restore the same stroke', async () => {
  await act(async () => root.render(<HjmProvider><DrawingEditor labels={labels} onSave={async () => {}} onCancel={() => {}} /></HjmProvider>));
  await draw();
  await act(async () => button(labels.undo).click()); expect(canvas().querySelectorAll('path')).toHaveLength(0);
  expect(button(labels.save).disabled).toBe(true);
  await act(async () => button(labels.redo).click()); expect(canvas().querySelectorAll('path')).toHaveLength(1);
});
