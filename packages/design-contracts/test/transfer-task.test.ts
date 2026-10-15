import { expect,it } from "vitest";
import { resolveTransferObservation,isConfirmedTransferAbort } from "../src/transfer-task.js";
it("learns actual totals without advancing completed work and preserves unknown totals",()=>{
 const unknown=resolveTransferObservation({completed:12,total:null});const known=resolveTransferObservation({completed:12,total:100},unknown);
 expect(known.completed).toBe(12);expect(Object.isFrozen(known)).toBe(true);expect(()=>resolveTransferObservation({completed:11,total:100},known)).toThrow();
 expect(()=>resolveTransferObservation({completed:101,total:100})).toThrow();expect(()=>resolveTransferObservation({completed:0,total:0})).toThrow();
});
it("distinguishes a confirmed abort from both an abort request and a transport error",()=>{
 const c=new AbortController(),error=Object.assign(new Error("abort"),{name:"AbortError"});expect(isConfirmedTransferAbort(error,c.signal)).toBe(false);c.abort();expect(isConfirmedTransferAbort(error,c.signal)).toBe(true);expect(isConfirmedTransferAbort(new Error("offline"),c.signal)).toBe(false);
});
