import { expect,it } from "vitest";
import { resolveComposerLimit,validateReplyTarget } from "../src/communication.js";
it("reveals only near the actual UTF-16 max and preserves over-limit observations",()=>{
 expect(resolveComposerLimit("abc",10).near).toBe(false);expect(resolveComposerLimit("abcdefgh",10)).toMatchObject({used:8,near:true,exceeded:false});expect(resolveComposerLimit("abcdefghijk",10).exceeded).toBe(true);expect(resolveComposerLimit("😀",2).used).toBe(2);expect(()=>resolveComposerLimit("",0)).toThrow();
});
it("requires actual reply ID, including independently from visible excerpt",()=>{expect(()=>validateReplyTarget({id:" ",author:"A",excerpt:"message"})).toThrow();expect(()=>validateReplyTarget({id:"m-72",author:"A",excerpt:"message"})).not.toThrow();validateReplyTarget(null);});
