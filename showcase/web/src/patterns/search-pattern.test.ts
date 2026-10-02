import {expect,it} from "vitest";
import {filterSearchEntries} from "../../../shared/search-pattern";
it("combines normalized query terms and category without mutating the source",()=>{
 expect(filterSearchEntries("", "all")).toHaveLength(4);
 expect(filterSearchEntries("  ＣＡＦＥ  ","all").map(item=>item.id)).toEqual(["cafe"]);
 expect(filterSearchEntries("산책 오후","memo").map(item=>item.id)).toEqual(["walk"]);
 expect(filterSearchEntries("산책","place")).toEqual([]);
 expect(filterSearchEntries("존재하지 않는 기록","all")).toEqual([]);
 expect(filterSearchEntries("", "all")).toHaveLength(4);
});
