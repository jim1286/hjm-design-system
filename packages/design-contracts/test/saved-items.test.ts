import { describe, expect, it } from "vitest";
import { resolveSavedItems } from "../src/screen-patterns.js";
const items=[{id:"a",title:"장소"},{id:"b",title:"일상"}];
const collections=[{id:"places",title:"장소",itemIds:["deleted","a"]}];
describe("saved collection navigation",()=>{
 it("distinguishes overview, all posts and one collection",()=>{expect(resolveSavedItems(items,collections,undefined,undefined).home).toBe(true);expect(resolveSavedItems(items,collections,null,null).visible).toEqual(items);expect(resolveSavedItems(items,collections,"places",null).visible).toEqual([items[0]]);});
 it("returns to overview for a removed collection and never opens a stale detail there",()=>{const state=resolveSavedItems(items,collections,"gone","a");expect(state.home).toBe(true);expect(state.selected).toBeUndefined();});
 it("does not open an item outside the selected collection",()=>{expect(resolveSavedItems(items,collections,"places","b").selected).toBeUndefined();});
 it("removes unsaved items from views without mutating collection membership",()=>{const remaining=resolveSavedItems([items[1]!],collections,"places","a");expect(remaining.visible).toEqual([]);expect(remaining.selected).toBeUndefined();expect(collections[0]!.itemIds).toEqual(["deleted","a"]);});
 it("rejects ambiguous identities",()=>{expect(()=>resolveSavedItems([items[0]!,items[0]!],[],null,null)).toThrow();expect(()=>resolveSavedItems(items,[collections[0]!,collections[0]!],null,null)).toThrow();});
});
