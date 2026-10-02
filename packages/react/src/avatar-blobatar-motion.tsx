import{useEffect,useRef,useState,type ReactNode}from'react';import{Blobatar}from'@blobatar/react';import{idle,happy,sad,surprised,wink,sleepy,thinking}from'blobatar/expression';import'blobatar/motion.css';
import{resolveBlobatarMotion,type BlobatarMotionOptions,type AvatarFallbackContext}from'@hjmds/design-contracts/avatar-fallback';import{useHjmTheme}from'./provider.js';
const expressions={idle,happy,sad,surprised,wink,sleepy,thinking};
function Artwork({size,options}:{size:number;options:BlobatarMotionOptions}){const spec=resolveBlobatarMotion(options);const{environment}=useHjmTheme();const host=useRef<HTMLSpanElement>(null);const[visible,setVisible]=useState(false);const[foreground,setForeground]=useState(false);
 useEffect(()=>{const update=()=>setForeground(!document.hidden);update();document.addEventListener('visibilitychange',update);const observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)));if(host.current)observer.observe(host.current);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};},[]);
 const active=spec.active&&spec.visible&&visible&&foreground&&!environment.reducedMotion;
 return <span ref={host} aria-hidden="true" style={{display:'block'}}><Blobatar name={spec.seed} size={size} normalize={false} expression={expressions[spec.expression]} animate={active?'always':false} alt="" aria-hidden="true"/></span>;
}
/** Optional animated entry. Static avatar imports never load motion CSS. */
export function createAnimatedBlobatarFallback(options:BlobatarMotionOptions):(context:AvatarFallbackContext)=>ReactNode{resolveBlobatarMotion(options);return({size})=><Artwork size={size} options={options}/>;}
