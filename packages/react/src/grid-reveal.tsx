import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gridRevealTiles, gridRevealDuration } from "@hjmds/design-contracts/grid-reveal";
import { useHjmTheme } from "./provider.js";
export type GridRevealProps=Readonly<{ready:boolean;active?:boolean;children:ReactNode}>;
/** Connect ready to Image.onLoadStatusChange; the image retains loading/error/accessibility. */
export function GridReveal({ready,active=true,children}:GridRevealProps){
 const{environment}=useHjmTheme();const overlay=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  if(!ready||!active||environment.reducedMotion||document.hidden)return;
  const animations=[...overlay.current!.children].map((node,index)=>node.animate([{opacity:1},{opacity:0}],{duration:gridRevealDuration,delay:gridRevealTiles[index]!.delay,fill:"backwards",easing:"ease-out"}));
  const stop=()=>animations.forEach(animation=>animation.cancel());
  const visibility=()=>{if(document.hidden)stop();};document.addEventListener("visibilitychange",visibility);
  return()=>{stop();document.removeEventListener("visibilitychange",visibility);};
 },[ready,active,environment.reducedMotion]);
 return <div style={{position:"relative"}}>{children}<div ref={overlay} aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gridTemplateRows:"repeat(4, 1fr)"}}>{gridRevealTiles.map(tile=><span key={tile.id} style={{opacity:0,background:"var(--hjm-color-bg)"}}/>)}</div></div>;
}
