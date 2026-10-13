import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import {Result} from '../src/feedback.js';
import {HjmProvider} from '../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it('routes secondary and primary separately and uses current actions after result replacement',async()=>{
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);const old=vi.fn(),primary=vi.fn(),secondary=vi.fn();
 try{await act(()=>root.render(<HjmProvider><Result status="failure" title="Failed" actions={[{label:'Retry',onAction:old},{label:'Later',onAction:secondary}]}/></HjmProvider>));const buttons=()=>host.querySelectorAll<HTMLButtonElement>('button');expect([...buttons()].map(button=>button.textContent)).toEqual(['Later','Retry']);await act(()=>buttons()[0]!.click());expect(secondary).toHaveBeenCalledOnce();expect(old).not.toHaveBeenCalled();
 await act(()=>root.render(<HjmProvider><Result status="success" title="Saved" actions={[{label:'Done',accessibilityLabel:'Finish saving',onAction:primary}]}/></HjmProvider>));expect(host.querySelector('[role="status"]')).not.toBeNull();expect(buttons()).toHaveLength(1);expect(buttons()[0]!.getAttribute('aria-label')).toBe('Finish saving');await act(()=>buttons()[0]!.click());expect(primary).toHaveBeenCalledOnce();expect(old).not.toHaveBeenCalled();
 await act(()=>root.render(<HjmProvider><Result status="info" title="Complete"/></HjmProvider>));expect(buttons()).toHaveLength(0);
 }finally{await act(()=>root.unmount());host.remove();}
});
