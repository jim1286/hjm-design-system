import { expect,it } from "vitest";
import { cubicBezierPoint,normalizeShortcut,resolveShortcutCapture,validateBezier } from "../src/authoring-tools.js";
it("validates both control points and evaluates all four editable coordinates",()=>{
 expect(cubicBezierPoint([0,0,1,1],0)).toEqual({x:0,y:0});expect(cubicBezierPoint([0,0,1,1],1)).toEqual({x:1,y:1});
 expect(cubicBezierPoint([.1,-1,.8,2],.5)).toEqual({x:.4625,y:.5});expect(()=>validateBezier([.2,0,1.1,1])).toThrow();expect(()=>validateBezier([0,NaN,1,1])).toThrow();
});
const event={code:"KeyK",ctrlKey:true,altKey:false,shiftKey:true,metaKey:false};
it("captures normalized physical keys while blocking OS/browser reservations and conflicts",()=>{
 const ready=resolveShortcutCapture(event,{platform:"windows"});expect(ready.status).toBe("ready");if(ready.status==="ready")expect(normalizeShortcut(ready.shortcut)).toBe("Ctrl+Shift+KeyK");
 expect(resolveShortcutCapture({...event,code:"KeyW"},{platform:"windows"}).status).toBe("reserved");expect(resolveShortcutCapture(event,{platform:"windows",conflicts:["Ctrl+Shift+KeyK"]}).status).toBe("conflict");
 expect(resolveShortcutCapture(event,{platform:"windows",reserved:["Ctrl+Shift+KeyK"]}).status).toBe("reserved");expect(resolveShortcutCapture({...event,repeat:true},{platform:"windows"}).status).toBe("ignored");expect(resolveShortcutCapture({...event,isComposing:true},{platform:"windows"}).status).toBe("ignored");expect(resolveShortcutCapture({...event,code:"Escape"},{platform:"windows"}).status).toBe("cancelled");expect(resolveShortcutCapture({...event,ctrlKey:false},{platform:"windows"}).status).toBe("invalid");
});
