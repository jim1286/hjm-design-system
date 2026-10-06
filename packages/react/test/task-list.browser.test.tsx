import{act,useState}from'react';import{createRoot}from'react-dom/client';import{expect,it}from'vitest';import{TaskList}from'../src/task-list.js';import{HjmProvider}from'../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it('updates only the chosen task and preserves disabled tasks',async()=>{const host=document.createElement('div');document.body.append(host);const root=createRoot(host);function Demo(){const[items,setItems]=useState([{id:'a',label:'First',completed:false},{id:'b',label:'Second',completed:false,disabled:true}]);return <HjmProvider><TaskList label="Tasks" items={items} onCompletedChange={(id,completed)=>setItems(old=>old.map(item=>item.id===id?{...item,completed}:item))}/></HjmProvider>;}try{await act(()=>root.render(<Demo/>));const inputs=host.querySelectorAll<HTMLInputElement>('input');await act(()=>inputs[0]!.click());expect(inputs[0]!.checked).toBe(true);await act(()=>inputs[1]!.click());expect(inputs[1]!.checked).toBe(false);}finally{await act(()=>root.unmount());host.remove();}});

it('keeps row actions outside selection and preserves them in a custom collection', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host); const changes: unknown[] = []; const actions: string[] = [];
  const contexts: boolean[] = [];
  try {
    await act(() => root.render(<HjmProvider><TaskList label="Tasks"
      items={[{id:'a',label:'First',completed:false},{id:'b',label:'Second',completed:false,disabled:true}]}
      onCompletedChange={(...args) => changes.push(args)}
      renderItemAction={({item,disabled}) => { contexts.push(disabled); return <button disabled={disabled} onClick={() => actions.push(item.id)}>Remove {item.label}</button>; }}
      renderCollection={({items,renderItem}) => <section>{items.map(item => <div key={item.id}>{renderItem(item)}</div>)}</section>}
    /></HjmProvider>));
    const buttons = host.querySelectorAll('button');
    expect(buttons[0]!.closest('label')).toBeNull();
    await act(() => buttons[0]!.click());
    await act(() => buttons[1]!.click());
    expect(actions).toEqual(['a']); expect(changes).toEqual([]);
    expect(contexts).toContain(false); expect(contexts).toContain(true);
    await act(() => host.querySelector<HTMLInputElement>('input')!.click());
    expect(changes).toEqual([['a',true]]); expect(actions).toEqual(['a']);
  } finally { await act(() => root.unmount()); host.remove(); }
});
