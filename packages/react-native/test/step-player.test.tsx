import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { StepPlayer } from "../src/step-player.js";
import { Button } from "../src/actions.js";
import { Progress } from "../src/feedback.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const base = { descriptor: { steps: [{id:"a",label:"First"},{id:"b",label:"Second"}],currentStepId:"b" }, statusLabels: {pending:"Pending",current:"Current",complete:"Complete",error:"Error"}, composeAccessibleName: ({label}:{label:string})=>label, labels: {play:"Play",pause:"Pause",replay:"Replay",progress:"Playback"}, progress:0.5, playing:false };

it("keeps host playback state and forwards accessible progress",()=>{
 let tree!:ReactTestRenderer;const change=vi.fn(),replay=vi.fn();
 try {
  act(()=>{tree=create(<HjmNativeProvider><StepPlayer {...base} onPlayingChange={change} onReplay={replay}/></HjmNativeProvider>);});
  const buttons=tree.root.findAllByType(Button);
  act(()=>buttons[0]!.props.onPress());expect(change).toHaveBeenCalledWith(true);
  expect(buttons[0]!.props.children).toBe("Play");
  act(()=>buttons[1]!.props.onPress());expect(replay).toHaveBeenCalledOnce();
  expect(tree.root.findByType(Progress).props).toMatchObject({value:0.5,max:1,label:"Playback"});
  act(()=>tree.update(<HjmNativeProvider><StepPlayer {...base} playing disabled onPlayingChange={change} onReplay={replay}/></HjmNativeProvider>));
  expect(tree.root.findAllByType(Button).every(button=>button.props.disabled)).toBe(true);
  expect(tree.root.findAllByType(Button)[0]!.props.children).toBe("Pause");
 }finally{act(()=>tree.unmount());}
});
