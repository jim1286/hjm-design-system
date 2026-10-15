import { expect, it } from "vitest";
import { mediaTransportPaths, resolveMediaPlayback } from "../src/media-transport.js";
it("keeps unknown/live and empty media unseekable while bounding an observed finite position",()=>{
 expect(resolveMediaPlayback({playing:false,position:4,duration:null}).seekable).toBe(false);
 expect(resolveMediaPlayback({playing:false,position:0,duration:0}).seekable).toBe(false);
 expect(resolveMediaPlayback({playing:true,position:6.01,duration:6}).position).toBe(6);
 expect(()=>resolveMediaPlayback({playing:true,position:NaN,duration:6})).toThrow();
 expect(()=>resolveMediaPlayback({playing:true,position:0,duration:Infinity})).toThrow();
});
it("uses corresponding path vertices for a real continuous play/pause morph",()=>{
 const play=mediaTransportPaths(0),pause=mediaTransportPaths(1),mid=mediaTransportPaths(.5);
 expect(play).not.toEqual(pause);expect(mid).not.toEqual(play);expect(mid).not.toEqual(pause);
 expect(play[0]).toBe("M6 4L12 8L12 16L6 20Z");expect(pause[1]).toBe("M14 4L18 4L18 20L14 20Z");expect(mediaTransportPaths(4)).toEqual(pause);expect(()=>mediaTransportPaths(NaN)).toThrow();
});
