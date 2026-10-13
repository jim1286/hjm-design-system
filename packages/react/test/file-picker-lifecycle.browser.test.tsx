import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {FilePicker} from '../src/file-picker.js';
import {HjmProvider} from '../src/provider.js';
let host:HTMLDivElement,root:Root;
beforeEach(()=>{(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(()=>root.unmount());host.remove();});
const file=new File(['image'],'photo.png',{type:'image/png'});
const render=(onSelect:React.ComponentProps<typeof FilePicker>['onSelect'],disabled=false,existingCount=0,error?:string)=>act(()=>root.render(<HjmProvider><FilePicker descriptor={{mode:'multiple',maxCount:1,accept:['image/*']}} label="Attachments" buttonLabel="Choose" dropzoneLabel="Drop" onSelect={onSelect} disabled={disabled} existingCount={existingCount} {...(error?{error}:{})}/></HjmProvider>));
async function change(files:File[]) {const input=host.querySelector('input')!;Object.defineProperty(input,'files',{value:files,configurable:true});await act(()=>{input.dispatchEvent(new Event('change',{bubbles:true}));});}
it('ignores an OS selection arriving after the picker is disabled and resets its input',async()=>{
 const selected=vi.fn();await render(selected);await render(selected,true);await change([file]);expect(selected).not.toHaveBeenCalled();expect(host.querySelector('input')!.value).toBe('');await render(selected);await change([file]);expect(selected).toHaveBeenCalledOnce();
});
it('clears drag affordance when locked and ignores the locked drop',async()=>{
 const selected=vi.fn();await render(selected);const zone=host.querySelector('.hjm-file-picker__dropzone')!;await act(()=>{zone.dispatchEvent(new DragEvent('dragenter',{bubbles:true}));});expect(host.querySelector('[data-dragging="true"]')).not.toBeNull();await render(selected,true);expect(host.querySelector('[data-dragging="true"]')).toBeNull();const transfer=new DataTransfer();transfer.items.add(file);await act(()=>{zone.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:transfer}));});expect(selected).not.toHaveBeenCalled();
});
it('keeps cancellation silent and permits the same file after rejection and external removal',async()=>{
 const selected=vi.fn();await render(selected);const button=host.querySelector('button')!;await act(()=>button.focus());await change([]);expect(selected).not.toHaveBeenCalled();expect(document.activeElement).toBe(button);
 await render(selected,false,1,'Too many files');await change([file]);expect(selected.mock.calls.at(-1)?.[0]).toMatchObject({accepted:[],rejected:[{reason:'count-exceeded'}]});await render(selected,false,0);await change([file]);expect(selected.mock.calls.at(-1)?.[0]).toMatchObject({accepted:[{name:'photo.png'}],rejected:[]});await change([file]);expect(selected).toHaveBeenCalledTimes(3);expect(document.activeElement).toBe(button);expect(host.querySelector('[role="alert"]')).toBeNull();
});
