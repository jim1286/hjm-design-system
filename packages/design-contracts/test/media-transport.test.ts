import { expect, it } from "vitest";
import { mediaTransportGlyphOpacity, mediaTransportLucideNames, resolveMediaPlayback } from "../src/media-transport.js";
it("keeps unknown/live and empty media unseekable while bounding an observed finite position",()=>{
 expect(resolveMediaPlayback({playing:false,position:4,duration:null}).seekable).toBe(false);
 expect(resolveMediaPlayback({playing:false,position:0,duration:0}).seekable).toBe(false);
 expect(resolveMediaPlayback({playing:true,position:6.01,duration:6}).position).toBe(6);
 expect(()=>resolveMediaPlayback({playing:true,position:NaN,duration:6})).toThrow();
 expect(()=>resolveMediaPlayback({playing:true,position:0,duration:Infinity})).toThrow();
});
it("cross-fades the Lucide play and pause icons over one progress value",()=>{
 expect(mediaTransportLucideNames).toEqual({play:"play",pause:"pause"});
 expect(mediaTransportGlyphOpacity(0)).toEqual({play:1,pause:0});expect(mediaTransportGlyphOpacity(1)).toEqual({play:0,pause:1});
 expect(mediaTransportGlyphOpacity(.25)).toEqual({play:.75,pause:.25});expect(mediaTransportGlyphOpacity(4)).toEqual({play:0,pause:1});expect(()=>mediaTransportGlyphOpacity(NaN)).toThrow();
});
