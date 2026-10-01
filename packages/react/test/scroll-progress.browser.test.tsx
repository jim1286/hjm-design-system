import {act,useState} from 'react';import {createRoot} from 'react-dom/client';import {expect,it} from 'vitest';
import {ScrollProgress,useScrollMetrics} from '../src/scroll-progress.js';import {HjmProvider} from '../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it('measures the explicit host, observes content growth and detaches from replaced hosts',async()=>{
 const node=document.createElement('div');document.body.append(node);const root=createRoot(node);
 function Demo(){const [host,setHost]=useState<HTMLDivElement|null>(null);const metrics=useScrollMetrics(host);return <HjmProvider><ScrollProgress label="Reading" metrics={metrics}/><div ref={setHost} style={{height:100,overflow:'auto'}}><div style={{height:300}}>Article</div></div></HjmProvider>;}
 const settle=()=>act(async()=>{await new Promise(resolve=>setTimeout(resolve,60));});
 try{await act(()=>root.render(<Demo/>));await settle();const scroller=node.querySelectorAll('div')[node.querySelectorAll('div').length-2]!;scroller.scrollTop=100;scroller.dispatchEvent(new Event('scroll'));await settle();expect(node.querySelector('progress')!.value).toBe(.5);
 const article=scroller.firstElementChild as HTMLElement;article.style.height='500px';await settle();expect(node.querySelector('progress')!.value).toBe(.25);
 }finally{await act(()=>root.unmount());node.remove();}
});
