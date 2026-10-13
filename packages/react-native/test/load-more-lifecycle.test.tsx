import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LoadMore, type LoadMoreHandle } from "../src/navigation.js";
import { HjmNativeProvider } from "../src/provider.js";
let renderer: ReactTestRenderer;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => { act(() => renderer?.unmount()); });
const labels = { loadMore:"More", loading:"Loading", retry:"Retry", complete:"Done" };
const deferred = () => { let resolve!:()=>void; let reject!:(error:Error)=>void; const promise=new Promise<void>((yes,no)=>{resolve=yes;reject=no;}); return {promise,resolve,reject}; };
it("does not retire a next cursor whose viewport request was blocked by the previous page", async () => {
 const pending=deferred(); const load=vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined);
 const ref={current:null as LoadMoreHandle|null};
 const view=(key:string)=><HjmNativeProvider><LoadMore ref={ref} descriptor={{state:{status:"ready",requestKey:key},labels}} onLoadMore={load}/></HjmNativeProvider>;
 await act(async()=>{renderer=create(view("a"));});
 let first!:Promise<unknown>; act(()=>{first=ref.current!.onEndReached();});
 await act(async()=>renderer.update(view("b")));
 expect(await ref.current!.onEndReached()).toBe("already-requesting");
 await act(async()=>{pending.resolve();await first;});
 await act(async()=>{await ref.current!.onEndReached();});
 expect(load.mock.calls.map(([request])=>request.requestKey)).toEqual(["a","b"]);
});
it("allows the viewport to retry a failed request without poisoning its cursor", async () => {
 const load=vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined); const error=vi.fn();
 const ref={current:null as LoadMoreHandle|null};
 await act(async()=>{renderer=create(<HjmNativeProvider><LoadMore ref={ref} descriptor={{state:{status:"ready",requestKey:"a"},labels}} onLoadMore={load} onRequestError={error}/></HjmNativeProvider>);});
 await act(async()=>{await ref.current!.onEndReached();});
 await act(async()=>{await ref.current!.onEndReached();});
 expect(error).toHaveBeenCalledOnce(); expect(load).toHaveBeenCalledTimes(2);
});
it.each([false,true])("does not notify a retired footer after unmount (failure=%s)", async failure=>{
 const pending=deferred(); const outcome=vi.fn(),error=vi.fn(); const ref={current:null as LoadMoreHandle|null};
 await act(async()=>{renderer=create(<HjmNativeProvider><LoadMore ref={ref} descriptor={{state:{status:"ready",requestKey:"a"},labels}} onLoadMore={()=>pending.promise} onRequestOutcome={outcome} onRequestError={error}/></HjmNativeProvider>);});
 let request!:Promise<unknown>; act(()=>{request=ref.current!.onEndReached();}); act(()=>renderer.unmount());
 await act(async()=>{failure?pending.reject(new Error("late")):pending.resolve();await request;});
 expect(outcome).not.toHaveBeenCalled();expect(error).not.toHaveBeenCalled();
});
it("ignores a queued FlatList callback after its footer unmounts",async()=>{
 const ref={current:null as LoadMoreHandle|null};const load=vi.fn(async()=>{}),error=vi.fn(),outcome=vi.fn();
 await act(async()=>{renderer=create(<HjmNativeProvider><LoadMore ref={ref} descriptor={{state:{status:'ready',requestKey:'a'},labels}} onLoadMore={load} onRequestError={error} onRequestOutcome={outcome}/></HjmNativeProvider>);});
 const queued=ref.current!.onEndReached;act(()=>renderer.unmount());await queued();
 expect(load).not.toHaveBeenCalled();expect(error).not.toHaveBeenCalled();expect(outcome).not.toHaveBeenCalled();
});
