import {expect,it} from "vitest";
import {resolveReactionOptions,nextReaction} from "../src/reactions.js";
import {isReplySwipe} from "../src/screen-patterns.js";
it("validates the combined catalog and toggles an additional reaction",()=>{
 const quick=[{id:"heart",emoji:"❤️",label:"하트"}];
 const all=resolveReactionOptions(quick,{label:"더 보기",options:[{id:"party",emoji:"🎉",label:"축하"}]});
 expect(nextReaction(all,"party","party")).toBeNull();
 expect(()=>resolveReactionOptions(quick,{label:"더 보기",options:quick})).toThrow();
 expect(()=>resolveReactionOptions(quick,{label:" ",options:quick})).toThrow();
});
it("requires a deliberate horizontal reply gesture",()=>{
 expect(isReplySwipe(60,10)).toBe(true);expect(isReplySwipe(-65,5)).toBe(true);
 expect(isReplySwipe(59,0)).toBe(false);expect(isReplySwipe(70,80)).toBe(false);
});
