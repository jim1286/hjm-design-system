import { useEffect, useState } from 'react';
import { resolveScrollProgress, type ScrollMetrics } from '@hjmds/design-contracts/scroll-progress';
import { Progress, type ProgressProps } from './feedback.js';
export type ScrollProgressProps = Omit<ProgressProps,'value'|'max'> & Readonly<{metrics:ScrollMetrics}>;
/** Existing Progress owns its accessible name, range and visual presentation. */
export function ScrollProgress({metrics,...props}:ScrollProgressProps){return <Progress {...props} value={resolveScrollProgress(metrics)} max={1}/>;}
const empty:ScrollMetrics={offset:0,contentSize:0,viewportSize:0};
/** Pass an actual vertical scroll host; never implicitly attach to window. */
export function useScrollMetrics(host:HTMLElement|null):ScrollMetrics{
 const [metrics,setMetrics]=useState<ScrollMetrics>(empty);
 useEffect(()=>{
  if(!host){setMetrics(empty);return;}
  let frame=0;
  const measure=()=>{frame=0;const next={offset:host.scrollTop,contentSize:host.scrollHeight,viewportSize:host.clientHeight};setMetrics(old=>old.offset===next.offset&&old.contentSize===next.contentSize&&old.viewportSize===next.viewportSize?old:next);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  // Observe children too: an image/font can change scroll extent without resizing the host.
  const resize=new ResizeObserver(schedule);
  const observe=()=>{resize.disconnect();resize.observe(host);for(const child of host.children)resize.observe(child);schedule();};
  const mutation=new MutationObserver(observe);mutation.observe(host,{childList:true,subtree:true,characterData:true});
  observe();cancelAnimationFrame(frame);measure();host.addEventListener('scroll',schedule,{passive:true});
  return()=>{cancelAnimationFrame(frame);resize.disconnect();mutation.disconnect();host.removeEventListener('scroll',schedule);};
 },[host]);
 return metrics;
}
