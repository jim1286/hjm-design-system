import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FollowProfileCard, EventAttendanceCard } from "../src/social-compositions.js";
import { HjmProvider } from "../src/provider.js";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
const labels = { follow: "팔로우", following: "팔로잉", pending: "처리 중", count: "팔로워", error: "요청 실패" };
const eventLabels = { response: "참석 응답", pending: "처리 중", count: "참석자", calendar: "캘린더에 추가", calendarAdded: "캘린더 추가 완료", error: "요청 실패" };
const choices = [{ id: "yes", label: "참석", attending: true }, { id: "no", label: "불참", attending: false }];
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "375px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it("shows a pending follow proposal, blocks duplicate writes, then rolls back after the actual rejection", async () => {
 let reject!: (error: Error) => void; const change = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
 await act(async () => root.render(<HjmProvider reducedMotion><FollowProfileCard profileId="a" name="기록가" state={{ following: false, count: 12 }} locale="ko-KR" labels={labels} onFollowChange={change} /></HjmProvider>));
 const button = host.querySelector("button")!; await act(async () => { button.click(); button.click(); });
 expect(change).toHaveBeenCalledExactlyOnceWith(true); expect(button.getAttribute("aria-pressed")).toBe("true"); expect(host.textContent).toContain("13");
 await act(async () => reject(new Error("network"))); expect(host.textContent).toContain("12"); expect(host.querySelector('[role="alert"]')?.textContent).toBe("요청 실패"); expect(button.getAttribute("aria-pressed")).toBe("false");
});
it("uses the server's confirmed follow count and detaches stale failures on a profile change", async () => {
 let reject!: (error: Error) => void; const change = () => new Promise<void>((_, fail) => { reject = fail; });
 const view = (id: string) => <HjmProvider reducedMotion><FollowProfileCard profileId={id} name={id} state={{ following: false, count: 4 }} locale="ko-KR" labels={labels} onFollowChange={change} /></HjmProvider>;
 await act(async () => root.render(view("a"))); await act(async () => host.querySelector("button")!.click());
 await act(async () => root.render(view("b"))); await act(async () => reject(new Error("old response"))); expect(host.querySelector('[role="alert"]')).toBeNull(); expect(host.textContent).toContain("4");
 function Confirmed() { const [state, setState] = useState({ following: false, count: 12 }); return <FollowProfileCard profileId="confirmed" name="확정" state={state} locale="ko-KR" labels={labels} onFollowChange={async following => { setState({ following, count: 20 }); }} />; }
 await act(async () => root.render(<HjmProvider reducedMotion><Confirmed /></HjmProvider>)); await act(async () => host.querySelector("button")!.click()); expect(host.textContent).toContain("20"); expect(host.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
});
it("keeps confirmed attendees, rolls back response failure, and reports calendar completion only after fulfillment", async () => {
 let reject!: (error: Error) => void, resolve!: () => void; const respond = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; })); const calendar = vi.fn(() => new Promise<void>(done => { resolve = done; }));
 await act(async () => root.render(<HjmProvider reducedMotion><EventAttendanceCard eventId="event" title="산책" dateLabel="10월 20일" state={{ responseId: null, count: 2 }} choices={choices} participants={[{ id: "a", name: "지민" }]} locale="ko-KR" labels={eventLabels} onResponseChange={respond} onAddToCalendar={calendar} /></HjmProvider>));
 const yes = host.querySelector<HTMLInputElement>('input[type="radio"][value="yes"]'), add = host.querySelector("button"); await act(async () => { yes!.click(); yes!.click(); }); expect(respond).toHaveBeenCalledExactlyOnceWith("yes"); expect(host.textContent).toContain("3"); expect(host.textContent).toContain("지민");
 await act(async () => reject(new Error("failed"))); expect(yes!.checked).toBe(false); expect(host.textContent).toContain("2");
 await act(async () => { add!.click(); add!.click(); }); expect(calendar).toHaveBeenCalledOnce(); expect(host.textContent).not.toContain("캘린더 추가 완료"); await act(async () => resolve()); expect(host.textContent).toContain("캘린더 추가 완료"); expect(add!.disabled).toBe(true);
});
it("inherits two brand palettes and light/dark without overflow", async () => {
 for (const brandPalette of Object.values(compositionBrandFixtures)) for (const theme of ["light", "dark"] as const) {
 await act(async () => root.render(<HjmProvider brandPalette={brandPalette} theme={theme} reducedMotion><EventAttendanceCard eventId="event" title="함께 기록하기" dateLabel="10월 20일" state={{ responseId: "yes", count: 2 }} choices={choices} participants={[{ id: "a", name: "지민" }, { id: "b", name: "민수" }]} locale="ko-KR" labels={eventLabels} onResponseChange={() => undefined} onAddToCalendar={() => undefined} /></HjmProvider>));
 expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth); expect(host.querySelector<HTMLInputElement>('input[type="radio"][value="yes"]')!.checked).toBe(true);
 }
});
it("does not confirm rejected calendar writes and detaches a pending calendar after an event switch", async () => {
 let fail!: (error: Error) => void, finish!: () => void; let requests = 0;
 const calendar = () => { requests++; return new Promise<void>((resolve, reject) => { finish = resolve; fail = reject; }); };
 const view = (id: string) => <HjmProvider reducedMotion><EventAttendanceCard eventId={id} title={id} dateLabel="10월 20일" state={{ responseId: null, count: 2 }} choices={choices} participants={[]} locale="ko-KR" labels={eventLabels} onResponseChange={() => undefined} onAddToCalendar={calendar} /></HjmProvider>;
 await act(async () => root.render(view("a"))); await act(async () => host.querySelector("button")!.click()); await act(async () => fail(new Error("permission denied")));
 expect(host.textContent).not.toContain("캘린더 추가 완료"); expect(host.querySelector('[role="alert"]')).not.toBeNull();
 await act(async () => host.querySelector("button")!.click()); expect(requests).toBe(2); await act(async () => root.render(view("b"))); await act(async () => finish()); expect(host.textContent).not.toContain("캘린더 추가 완료"); expect(host.querySelector("button")!.disabled).toBe(false);
});
