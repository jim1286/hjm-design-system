import{act,create,type ReactTestRenderer}from'react-test-renderer';import{expect,it,vi}from'vitest';import{TaskList}from'../src/task-list.js';import{Checkbox}from'../src/inputs.js';import{HjmNativeProvider}from'../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it('keeps completion controlled and delegates disabled behavior to Checkbox',()=>{let tree!:ReactTestRenderer;const change=vi.fn();try{act(()=>{tree=create(<HjmNativeProvider><TaskList label="Tasks" items={[{id:'a',label:'First',completed:false},{id:'b',label:'Second',completed:true,disabled:true}]} onCompletedChange={change}/></HjmNativeProvider>);});const checks=tree.root.findAllByType(Checkbox);act(()=>checks[0]!.props.onCheckedChange(true));expect(change).toHaveBeenCalledWith('a',true);expect(checks[0]!.props.checked).toBe(false);expect(checks[1]!.props.disabled).toBe(true);}finally{act(()=>tree.unmount());}});

import { Button } from '../src/actions.js';
it('provides independent actions and effective disabled state through custom collections', () => {
 let tree!: ReactTestRenderer; const change=vi.fn(), action=vi.fn();
 try {
  act(() => { tree=create(<HjmNativeProvider><TaskList label="Tasks"
   items={[{id:'a',label:'First',completed:false},{id:'b',label:'Second',completed:true,disabled:true}]}
   onCompletedChange={change}
   renderItemAction={({item,disabled}) => <Button disabled={disabled} onPress={() => action(item.id)}>Remove {item.label}</Button>}
   renderCollection={({items,renderItem}) => <>{items.map(item => <ReactFragment key={item.id}>{renderItem(item)}</ReactFragment>)}</>}
  /></HjmNativeProvider>); });
  const buttons=tree.root.findAllByType(Button), checks=tree.root.findAllByType(Checkbox);
  expect(buttons[0]!.props.disabled).toBe(false); expect(buttons[1]!.props.disabled).toBe(true);
  expect(checks[0]!.findAllByType(Button)).toHaveLength(0);
  act(() => buttons[0]!.props.onPress()); expect(action).toHaveBeenCalledWith('a'); expect(change).not.toHaveBeenCalled();
  act(() => checks[0]!.props.onCheckedChange(true)); expect(change).toHaveBeenCalledWith('a',true); expect(action).toHaveBeenCalledTimes(1);
 } finally { act(() => tree.unmount()); }
});
import { Fragment as ReactFragment } from 'react';
