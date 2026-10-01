import {expect,it} from "vitest";
import {resolveVoiceNote} from "../src/voice-note.js";
it("distinguishes missing metadata, zero duration, loading and usable playback",()=>{
 const base={title:"Memo",position:12,state:"paused" as const};
 for(const duration of [null,0])expect(resolveVoiceNote({...base,duration})).toMatchObject({canPlay:false,canSeek:false,position:0});
 expect(resolveVoiceNote({...base,duration:8})).toMatchObject({canPlay:true,canSeek:true,position:8});
 for(const state of ["loading","error"] as const)expect(resolveVoiceNote({...base,duration:20,state})).toMatchObject({canPlay:false,canSeek:false});
 expect(resolveVoiceNote({...base,duration:20,disabled:true})).toMatchObject({canPlay:false,canSeek:false});
 for(const duration of [-1,NaN,Infinity])expect(()=>resolveVoiceNote({...base,duration})).toThrow();
});
