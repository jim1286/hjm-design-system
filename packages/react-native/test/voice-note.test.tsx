import{act,create,type ReactTestRenderer}from"react-test-renderer";import{expect,it,vi}from"vitest";import{VoiceNote}from"../src/voice-note.js";import{Button}from"../src/actions.js";import{Slider}from"../src/slider.js";import{HjmNativeProvider}from"../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const base={descriptor:{title:"Memo",state:"paused" as const,duration:84,position:12},labels:{play:"Play",pause:"Pause",seek:"Position",loading:"Loading",error:"Failed",retry:"Retry",backward:"Back",forward:"Forward"},formatTime:(seconds:number)=>`${seconds}s`};

it("delegates seek/play/retry and disables unavailable metadata",()=>{
 let tree!:ReactTestRenderer;const play=vi.fn(),seek=vi.fn(),retry=vi.fn();
 const element=(state:"paused"|"error"|"loading")=><HjmNativeProvider><VoiceNote {...base} descriptor={{...base.descriptor,state}} onPlayingChange={play} onSeek={seek} onRetry={retry}/></HjmNativeProvider>;
 try{act(()=>{tree=create(element("paused"));});act(()=>tree.root.findByType(Button).props.onPress());expect(play).toHaveBeenCalledWith(true);
 act(()=>tree.root.findByType(Slider).props.onValueChange(20));expect(seek).toHaveBeenCalledWith(20);expect(tree.root.findByType(Slider).props.value).toBe(12);
 act(()=>tree.update(element("loading")));expect(tree.root.findByType(Slider).props.disabled).toBe(true);expect(tree.root.findByType(Button).props.loading).toBe(true);
 act(()=>tree.update(element("error")));act(()=>tree.root.findAllByType(Button)[1]!.props.onPress());expect(retry).toHaveBeenCalledOnce();
 }finally{act(()=>tree.unmount());}
});
