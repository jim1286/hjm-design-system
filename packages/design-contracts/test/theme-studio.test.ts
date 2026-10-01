import {expect,it} from "vitest";
import {applyStudioColor,studioReport,exportStudioPalette} from "../src/theme-studio.js";
it("keeps themes independent and exports exactly the provider overrides",()=>{
 const first=applyStudioColor({},"light","primary","#FFFFFF");
 expect(first).toEqual({light:{primary:"#ffffff"}});
 const next=applyStudioColor(first,"dark","primary","#000000");
 expect(first).toEqual({light:{primary:"#ffffff"}});
 expect(JSON.parse(exportStudioPalette(next))).toEqual({brandPalette:next});
 expect(()=>applyStudioColor({},"light","primary","red")).toThrow();
});
it("reports numeric contrast failures rather than declaring an entire theme accessible",()=>{
 const palette=applyStudioColor(applyStudioColor({},"light","primary","#ffffff"),"light","onPrimary","#ffffff");
 expect(studioReport(palette,"light").find(row=>row.foreground==="onPrimary")).toMatchObject({ratio:1,pass:false,minimum:4.5});
 expect(studioReport({},"light").every(row=>row.pass)).toBe(true);
});
