import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Progress } from "../src/feedback.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("keeps the real fraction and accessible value when a count already appears in its label", async () => {
  const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
  try {
    await act(async()=>root.render(<HjmProvider><Progress label="Friends met 1/30" value={1} max={30} showValue={false}/></HjmProvider>));
    const progress=host.querySelector("progress")!;
    expect(host.textContent).toBe("Friends met 1/30");expect(progress.value/progress.max).toBeCloseTo(1/30);
    expect(progress.getAttribute("aria-valuetext")).toBe("3%");expect(progress.getAttribute("aria-labelledby")).toBeTruthy();
  } finally {await act(async()=>root.unmount());host.remove();}
});
it.each(['ltr','rtl'] as const)('paints fractional segments in %s while retaining one semantic progress target', async direction => {
  const host=document.createElement('div');host.style.width='300px';document.body.append(host);const root=createRoot(host);
  try {
    await act(async()=>root.render(<HjmProvider direction={direction}><Progress label="Activity days 2.5/5" value={2.5} max={5} segments={5} showValue={false}/></HjmProvider>));
    const progress=host.querySelector('progress')!;const tracks=[...host.querySelectorAll<HTMLElement>('.hjm-progress__segments > span')];
    expect(progress.value).toBe(2.5);expect(progress.max).toBe(5);expect(progress.getAttribute('aria-valuetext')).toBe('50%');
    expect(getComputedStyle(progress).display).not.toBe('none');expect(tracks).toHaveLength(5);
    expect(tracks.map(node=>(node.firstElementChild as HTMLElement).style.width)).toEqual(['100%','100%','50%','0%','0%']);
    expect(getComputedStyle(tracks[0]!.parentElement!).direction).toBe(direction);
    expect(tracks[0]!.parentElement!.getAttribute('aria-hidden')).toBe('true');
    expect(tracks[0]!.getBoundingClientRect().width).toBeCloseTo(tracks[4]!.getBoundingClientRect().width,0);
  } finally {await act(async()=>root.unmount());host.remove();}
});
it('keeps the circular native progress available to accessibility', async()=>{
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
  try {
    await act(async()=>root.render(<HjmProvider><Progress label="Complete" shape="circular" value={100}/></HjmProvider>));
    expect(getComputedStyle(host.querySelector('progress')!).display).not.toBe('none');
  } finally {await act(async()=>root.unmount());host.remove();}
});
