import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { InlineConfirm } from "../src/inline-confirm.js";
import { DurationField } from "../src/duration-field.js";
import { NumberField } from "../src/number-field.js";
import { Button } from "../src/actions.js";
import { Text } from "../src/primitives.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT=true;
it("uses the same async confirmation session and product-facing error on Native",async()=>{
 let tree!:ReactTestRenderer;let resolve!:()=>void;let reject!:(e:Error)=>void;
 const action=vi.fn(()=>new Promise<void>((a,b)=>{resolve=a;reject=b;}));
 const copy={label:'Delete',prompt:'Delete draft?',confirmLabel:'Confirm',cancelLabel:'Cancel',pendingLabel:'Deleting',successLabel:'Deleted',errorLabel:'Try again'};
 const button=(label:string)=>tree.root.findAllByType(Button).find(b=>b.props.children===label)!;
 try{
  await act(()=>{tree=create(<HjmNativeProvider><InlineConfirm {...copy} onConfirm={action}/></HjmNativeProvider>);});
  await act(()=>button('Delete').props.onPress());expect(action).not.toHaveBeenCalled();
  await act(()=>{const press=button('Confirm').props.onPress;press();press();});expect(action).toHaveBeenCalledTimes(1);expect(button('Cancel').props.disabled).toBe(true);
  await act(()=>reject(new Error('private')));expect(tree.root.findAllByType(Text).some(n=>n.props.children==='Try again')).toBe(true);
  await act(()=>button('Confirm').props.onPress());await act(()=>resolve());expect(tree.root.findAllByType(Text).some(n=>n.props.children==='Deleted')).toBe(true);
 }finally{act(()=>tree.unmount());}
});
it("disables unavailable hours and clamps Native unit edits through the shared contract",()=>{
 let tree!:ReactTestRenderer;const change=vi.fn();
 try{act(()=>{tree=create(<HjmNativeProvider><DurationField value={1490} max={1500} onValueChange={change} labels={{label:'Duration',hours:'Hours',minutes:'Minutes',seconds:'Seconds',increment:u=>`${u}+`,decrement:u=>`${u}-`}}/></HjmNativeProvider>);});const fields=tree.root.findAllByType(NumberField);expect(fields[0]!.props.disabled).toBe(true);act(()=>fields[1]!.props.onValueChange(25));expect(change).toHaveBeenCalledWith(1500);}finally{act(()=>tree.unmount());}
});

import { ReactionPicker } from '../src/reaction-picker.js';
import { NotificationBell } from '../src/notification-bell.js';
import { IconButton } from '../src/actions.js';
import { AppState, startedAnimatedTimings } from './react-native.mock.js';
it('shares controlled reaction semantics and suspends new-notification motion on Native',()=>{
 let tree!:ReactTestRenderer;const change=vi.fn();const press=vi.fn();const options=[{id:'like',emoji:'👍',label:'Like',count:4}];
 const render=(count:number,reducedMotion=false,value:string|null=null)=><HjmNativeProvider reducedMotion={reducedMotion}><ReactionPicker label="Reactions" options={options} value={value} onValueChange={change}/><NotificationBell label={`${count} unread`} count={count} icon={null} onPress={press}/></HjmNativeProvider>;
 try{
  AppState.currentState='active';startedAnimatedTimings.splice(0);act(()=>{tree=create(render(0));});expect(startedAnimatedTimings).toHaveLength(0);
  expect(tree.root.findAllByType(Text).some(node => node.props.children === '👍 4')).toBe(true);
  act(()=>tree.root.findByType(Button).props.onPress());expect(change).toHaveBeenLastCalledWith('like');
  act(()=>tree.update(render(1,false,'like')));expect(startedAnimatedTimings.length).toBeGreaterThan(0);
  act(()=>tree.root.findByType(Button).props.onPress());expect(change).toHaveBeenLastCalledWith(null);
  startedAnimatedTimings.splice(0);act(()=>tree.update(render(2,true)));expect(startedAnimatedTimings).toHaveLength(0);
  AppState.currentState='background';act(()=>tree.update(render(3)));expect(startedAnimatedTimings).toHaveLength(0);
  act(()=>tree.root.findByType(IconButton).props.onPress());expect(press).toHaveBeenCalledTimes(1);
 }finally{AppState.currentState='active';act(()=>tree.unmount());}
});

import { AccessibilityInfo, Platform } from 'react-native';
it.each(['ios','android'])('announces inline confirmation transitions once on %s without background speech',async(os)=>{
 const previousOS=Platform.OS;Platform.OS=os as typeof Platform.OS;AppState.currentState='active';
 const announce=vi.spyOn(AccessibilityInfo,'announceForAccessibilityWithOptions');announce.mockClear();
 let tree!:ReactTestRenderer;let resolve!:()=>void;let reject!:(error:Error)=>void;
 const action=()=>new Promise<void>((a,b)=>{resolve=a;reject=b;});
 const copy={label:'Delete',prompt:'Delete draft?',confirmLabel:'Confirm',cancelLabel:'Cancel',pendingLabel:'Deleting',successLabel:'Deleted',errorLabel:'Try again'};
 const render=()=> <HjmNativeProvider><InlineConfirm {...copy} onConfirm={action}/></HjmNativeProvider>;
 const press=(label:string)=>tree.root.findAllByType(Button).find(n=>n.props.children===label)!.props.onPress();
 try {
  await act(()=>{tree=create(render());});expect(announce).not.toHaveBeenCalled();
  await act(()=>press('Delete'));await act(()=>tree.update(render()));
  await act(()=>press('Confirm'));await act(()=>reject(new Error('private')));
  await act(()=>press('Confirm'));await act(()=>resolve());
  expect(announce.mock.calls.map(call=>call[0])).toEqual(os==='ios'?['Delete draft?','Deleting','Try again','Deleting','Deleted']:[]);
  if(os==='ios')expect(announce.mock.calls[2]?.[1]).toEqual({queue:false});
  act(()=>tree.unmount());announce.mockClear();AppState.currentState='background';
  await act(()=>{tree=create(render());});await act(()=>press('Delete'));
  expect(announce).not.toHaveBeenCalled();
 }finally {act(()=>tree.unmount());Platform.OS=previousOS;AppState.currentState='active';announce.mockRestore();}
});
