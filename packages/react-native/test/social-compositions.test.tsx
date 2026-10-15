import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { FollowProfileCard, EventAttendanceCard } from "../src/social-compositions.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { AnimatedStatistic } from "../src/statistic-motion.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const labels = { follow: "팔로우", following: "팔로잉", pending: "처리 중", count: "팔로워", error: "요청 실패" };
const eventLabels = { response: "참석 응답", pending: "처리 중", count: "참석자", calendar: "캘린더에 추가", calendarAdded: "캘린더 추가 완료", error: "요청 실패" };
const choices = [{ id: "yes", label: "참석", attending: true }, { id: "no", label: "불참", attending: false }];
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
it("rolls back optimistic follow counts and suppresses same-tick repeated presses", async () => {
 let reject!: (error: Error) => void; const change = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
 act(() => { tree = create(<HjmNativeProvider reducedMotion><FollowProfileCard profileId="a" name="기록가" state={{ following: false, count: 12 }} locale="ko-KR" labels={labels} onFollowChange={change} /></HjmNativeProvider>); });
 const press = tree!.root.findByType(Button).props.onPress; act(() => { press(); press(); }); expect(change).toHaveBeenCalledExactlyOnceWith(true); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(13);
 await act(async () => reject(new Error("failed"))); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(12); expect(tree!.root.findByType(Button).props.selected).toBe(false); expect(tree!.root.findAll(n => n.props.accessibilityRole === "alert").length).toBeGreaterThan(0);
});
it("detaches an old profile response and waits for the real calendar adapter", async () => {
 let reject!: (error: Error) => void; const change = () => new Promise<void>((_, fail) => { reject = fail; });
 const view = (id: string) => <HjmNativeProvider reducedMotion><FollowProfileCard profileId={id} name={id} state={{ following: false, count: 2 }} locale="ko-KR" labels={labels} onFollowChange={change} /></HjmNativeProvider>;
 act(() => { tree = create(view("a")); }); act(() => tree!.root.findByType(Button).props.onPress()); act(() => tree!.update(view("b"))); await act(async () => reject(new Error("old"))); expect(tree!.root.findAll(n => n.props.accessibilityRole === "alert")).toHaveLength(0);
 let done!: () => void; const calendar = vi.fn(() => new Promise<void>(resolve => { done = resolve; }));
 act(() => tree!.update(<HjmNativeProvider reducedMotion><EventAttendanceCard eventId="event" title="산책" dateLabel="10월 20일" state={{ responseId: null, count: 2 }} choices={choices} participants={[{ id: "a", name: "지민" }]} locale="ko-KR" labels={eventLabels} onResponseChange={() => undefined} onAddToCalendar={calendar} /></HjmNativeProvider>));
 const button = tree!.root.findAllByType(Button)[2]!; act(() => { button.props.onPress(); button.props.onPress(); }); expect(calendar).toHaveBeenCalledOnce(); expect(button.props.children).toBe("캘린더에 추가"); await act(async () => done()); expect(tree!.root.findAllByType(Button)[2]!.props.children).toBe("캘린더 추가 완료");
});
it("rolls back attendee proposals and allows retry after calendar permission rejection", async () => {
 let rejectResponse!: (error: Error) => void; const response = vi.fn(() => new Promise<void>((_, reject) => { rejectResponse = reject; })); const calendar = vi.fn().mockRejectedValueOnce(new Error("permission denied")).mockResolvedValue(undefined);
 act(() => { tree = create(<HjmNativeProvider reducedMotion><EventAttendanceCard eventId="event" title="산책" dateLabel="10월 20일" state={{ responseId: null, count: 2 }} choices={choices} participants={[]} locale="ko-KR" labels={eventLabels} onResponseChange={response} onAddToCalendar={calendar} /></HjmNativeProvider>); });
 const press = tree!.root.findAllByType(Button)[0]!.props.onPress; act(() => { press(); press(); }); expect(response).toHaveBeenCalledExactlyOnceWith("yes"); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(3);
 await act(async () => rejectResponse(new Error("failed"))); expect(tree!.root.findByType(AnimatedStatistic).props.value).toBe(2); expect(tree!.root.findAllByType(Button)[0]!.props.selected).toBe(false);
 await act(async () => tree!.root.findAllByType(Button)[2]!.props.onPress()); expect(tree!.root.findAllByType(Button)[2]!.props.children).toBe("캘린더에 추가");
 await act(async () => tree!.root.findAllByType(Button)[2]!.props.onPress()); expect(calendar).toHaveBeenCalledTimes(2); expect(tree!.root.findAllByType(Button)[2]!.props.children).toBe("캘린더 추가 완료");
});
