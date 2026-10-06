import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ChatScreen, MessageComposer, NotificationInboxScreen, NotificationItem, ScreenLayout, SettingsScreen } from "../src/screens.js";
import { Button } from "../src/actions.js";
import "../src/styles.css";
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("centers a replacement in the actual body and keeps long RTL large text and actions reachable", async () => {
  await page.viewport(390, 844);
  for (const theme of ["light", "dark"] as const) {
    for (const scale of [1, 2]) {
      await act(async () => root.render(<HjmProvider theme={theme} textScale={scale} direction="rtl"><div style={{ height: 650 }}>
        <ScreenLayout title="알림" state={{ kind: "error", title: "불러오지 못했어요", description: "연결을 확인한 뒤 다시 시도해 주세요." }} stateAction={<Button>다시 시도</Button>} />
      </div></HjmProvider>));
      const body = host.querySelector<HTMLElement>(".hjm-screen__body")!;
      const state = host.querySelector<HTMLElement>(".hjm-screen__state")!;
      expect(Math.abs((state.getBoundingClientRect().top + state.getBoundingClientRect().bottom) / 2 - (body.getBoundingClientRect().top + body.getBoundingClientRect().bottom) / 2)).toBeLessThan(3);
      expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth);
      expect(host.querySelector('[role="alert"]')?.contains(host.querySelector("button"))).toBe(false);
    }
  }
  await act(async () => root.render(<HjmProvider textScale={2}><div style={{ height: 380 }}><ScreenLayout title="긴 화면" state={{ kind: "error", title: "복구 안내", description: "긴 번역을 읽고 다시 시도해 주세요. ".repeat(40) }} stateAction={<Button>복구</Button>} /></div></HjmProvider>));
  const body = host.querySelector<HTMLElement>(".hjm-screen__body")!;
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(host.querySelector<HTMLElement>(".hjm-screen__state")!.getBoundingClientRect().top).toBeGreaterThanOrEqual(body.getBoundingClientRect().top);
  await page.getByRole("button", { name: "복구", exact: true }).click();
});

it("keeps filters during replacement and never marks read merely by rendering", async () => {
  const read = vi.fn();
  await act(async () => root.render(<HjmProvider><NotificationInboxScreen title="알림" filters={<Button>읽지 않음</Button>}>
    <NotificationItem title="답글" read={false} statusLabel="읽지 않음" timestamp="방금" onClick={read} />
  </NotificationInboxScreen></HjmProvider>));
  expect(read).not.toHaveBeenCalled();
  await page.getByRole("button", { name: /답글/ }).click();
  expect(read).toHaveBeenCalledTimes(1);
  await act(async () => root.render(<HjmProvider><NotificationInboxScreen title="알림" filters={<Button>읽지 않음</Button>} state={{ kind: "empty", title: "알림이 없어요" }}>{null}</NotificationInboxScreen></HjmProvider>));
  await expect.element(page.getByRole("button", { name: "읽지 않음" })).toBeVisible();
});

it("retains draft on failure, ignores blank/pending send, and leaves Enter as a newline", async () => {
  const send = vi.fn();
  function Demo({ pending = false }: { pending?: boolean }) {
    const [value, setValue] = useState("draft");
    return <MessageComposer label="메시지" sendLabel="보내기" value={value} onValueChange={setValue} onSend={send} pending={pending} />;
  }
  await act(async () => root.render(<HjmProvider><Demo /></HjmProvider>));
  await act(async () => { await page.getByRole("textbox", { name: "메시지" }).fill("  "); });
  await expect.element(page.getByRole("button", { name: "보내기" })).toBeDisabled();
  await act(async () => { await page.getByRole("textbox", { name: "메시지" }).fill("첫 줄\n둘째 줄"); });
  await page.getByRole("button", { name: "보내기" }).click();
  expect(send).toHaveBeenCalledWith("첫 줄\n둘째 줄");
  expect(host.querySelector("textarea")?.value).toBe("첫 줄\n둘째 줄");
  await act(async () => root.render(<HjmProvider><Demo pending /></HjmProvider>));
  await expect.element(page.getByRole("button", { name: "보내기" })).toBeDisabled();
});

it("preserves settings field identity on notices and isolates virtual scrolling and restricted composer", async () => {
  const renderSettings = (notice?: string) => <HjmProvider><SettingsScreen title="설정" notice={notice} sections={[{ id: "account", title: "계정", children: <input aria-label="닉네임" defaultValue="초안" /> }]} /></HjmProvider>;
  await act(async () => root.render(renderSettings()));
  const input = host.querySelector("input");
  await act(async () => root.render(renderSettings("저장 실패")));
  expect(host.querySelector("input")).toBe(input);
  await act(async () => root.render(<HjmProvider><ChatScreen title="채팅" composer={<button>전송</button>}><div>가상 목록</div></ChatScreen></HjmProvider>));
  expect(host.querySelector(".hjm-screen__body")?.getAttribute("data-scroll")).toBe("content");
  await act(async () => root.render(<HjmProvider><ChatScreen title="채팅" state={{ kind: "restricted", title: "권한 필요" }} composer={<button>전송</button>}><div>비공개 메시지</div></ChatScreen></HjmProvider>));
  expect(host.textContent).not.toContain("비공개 메시지"); expect(host.textContent).not.toContain("전송");
});

it("lets the composer grow and shrink with content without a manual resize handle", async () => {
  function Composer() { const [value, setValue] = useState(""); return <MessageComposer label="댓글" sendLabel="게시" value={value} onValueChange={setValue} onSend={() => {}} />; }
  await act(async () => root.render(<HjmProvider><Composer /></HjmProvider>));
  const field = host.querySelector("textarea")!;
  const initial = field.clientHeight;
  expect(getComputedStyle(field).resize).toBe("none");
  await act(async () => { await page.getByRole("textbox", {name:"댓글"}).fill("첫 줄\n둘째 줄\n셋째 줄"); });
  expect(field.clientHeight).toBeGreaterThan(initial);
  await act(async () => { await page.getByRole("textbox", {name:"댓글"}).fill(Array(20).fill("긴 문장").join("\n")); });
  expect(field.scrollHeight).toBeGreaterThan(field.clientHeight);
  await act(async () => { await page.getByRole("textbox", {name:"댓글"}).fill(""); });
  expect(field.clientHeight).toBe(initial);
});

it("switches from attachment to send and retains removable photos until the product confirms success", async () => {
  const send = vi.fn(), remove = vi.fn();
  const props = {label:"메시지",sendLabel:"전송",value:"",onValueChange:vi.fn(),onSend:send,sendIcon:<span>↑</span>,attachmentAction:{label:"사진 추가",icon:<span>+</span>,onPress:vi.fn()},onRemoveAttachment:remove};
  await act(async () => root.render(<HjmProvider><MessageComposer {...props}/></HjmProvider>));
  await expect.element(page.getByRole("button",{name:"사진 추가"})).toBeVisible();
  expect(host.querySelector('[aria-label="전송"]')).toBeNull();
  const attachments = [{id:"a",removeLabel:"첫 사진 삭제",preview:<img alt="첫 사진"/>},{id:"b",removeLabel:"둘째 사진 삭제",preview:<img alt="둘째 사진"/>}];
  await act(async () => root.render(<HjmProvider><MessageComposer {...props} attachments={attachments}/></HjmProvider>));
  await page.getByRole("button",{name:"전송",exact:true}).click();
  expect(send).toHaveBeenCalledWith("");
  expect(host.querySelectorAll("img")).toHaveLength(2);
  await page.getByRole("button",{name:"첫 사진 삭제"}).click();
  expect(remove).toHaveBeenCalledWith("a");
  await act(async () => root.render(<HjmProvider><MessageComposer {...props} attachments={attachments} pending/></HjmProvider>));
  await expect.element(page.getByRole("button",{name:"전송",exact:true})).toBeDisabled();
  await expect.element(page.getByRole("button",{name:"첫 사진 삭제"})).toBeDisabled();
});

it("opens reactions through keyboard and hold, cancels moving gestures and toggles the same reaction off", async () => {
  const {ChatMessage} = await import("../src/screens.js");
  const change = vi.fn();
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="지금" reactions={{label:"메시지 반응",closeLabel:"닫기",options:[{id:"heart",emoji:"❤️",label:"좋아요"}],value:"heart",onValueChange:change}}>안녕</ChatMessage></HjmProvider>));
  const trigger = host.querySelector<HTMLElement>('[aria-label="메시지 반응"]')!;
  await act(async () => {trigger.focus(); trigger.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));});
  await page.getByRole("button",{name:"좋아요",exact:true}).click();
  expect(change).toHaveBeenCalledWith(null);
  await act(async () => {
    trigger.dispatchEvent(new PointerEvent("pointerdown",{button:0,clientX:10,clientY:10,bubbles:true}));
    trigger.dispatchEvent(new PointerEvent("pointermove",{clientX:40,clientY:10,bubbles:true}));
    await new Promise(resolve => setTimeout(resolve,500));
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => {
    trigger.dispatchEvent(new PointerEvent("pointerdown",{button:0,clientX:10,clientY:10,bubbles:true}));
    await new Promise(resolve => setTimeout(resolve,500));
  });
  await expect.element(page.getByRole("button",{name:"좋아요",exact:true})).toBeVisible();
});

it("expands the plus button and selects an emoji outside the quick reactions", async () => {
  const {ReactionPicker} = await import("../src/reaction-picker.js");
  const change = vi.fn();
  await act(async () => root.render(<HjmProvider><ReactionPicker label="반응" layout="strip" options={[{id:"heart",emoji:"❤️",label:"하트"}]} more={{label:"더 많은 이모지",options:[{id:"party",emoji:"🎉",label:"축하"}]}} value="party" onValueChange={change}/></HjmProvider>));
  await act(async () => {await page.getByRole("button",{name:"더 많은 이모지"}).click();});
  await expect.element(page.getByRole("button",{name:"더 많은 이모지"})).toHaveAttribute("aria-expanded","true");
  await act(async () => {await page.getByRole("button",{name:"축하",exact:true}).click();});
  expect(change).toHaveBeenCalledWith(null);
  await expect.element(page.getByRole("button",{name:"더 많은 이모지"})).toHaveAttribute("aria-expanded","false");
});

it("starts replies with a horizontal swipe but leaves vertical scrolling alone", async () => {
  const {ChatMessage} = await import("../src/screens.js");
  const reply = vi.fn(), jump = vi.fn(), cancel = vi.fn();
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="지금" replyAction={{label:"답장",onPress:reply}} reply={<span>원문</span>} replyLink={{label:"원문으로 이동",onPress:jump}}>메시지</ChatMessage><MessageComposer label="메시지" sendLabel="전송" value="초안" onValueChange={()=>{}} onSend={()=>{}} replyTo={{author:"서연",excerpt:"원문",cancelLabel:"답장 취소",onCancel:cancel}}/></HjmProvider>));
  expect(host.querySelectorAll("button")).not.toHaveLength(0);
  expect([...host.querySelectorAll("button")].some(button => button.textContent === "답장")).toBe(false);
  const bubble=host.querySelector<HTMLElement>('.hjm-chat-message__bubble')!;
  await act(async () => {
    bubble.dispatchEvent(new PointerEvent("pointerdown",{button:0,clientX:10,clientY:10,bubbles:true}));
    bubble.dispatchEvent(new PointerEvent("pointermove",{clientX:15,clientY:90,bubbles:true}));
    bubble.dispatchEvent(new PointerEvent("pointerup",{clientX:15,clientY:90,bubbles:true}));
  });
  expect(reply).not.toHaveBeenCalled();
  await act(async () => {
    bubble.dispatchEvent(new PointerEvent("pointerdown",{button:0,clientX:10,clientY:10,bubbles:true}));
    bubble.dispatchEvent(new PointerEvent("pointermove",{clientX:90,clientY:15,bubbles:true}));
    bubble.dispatchEvent(new PointerEvent("pointerup",{clientX:90,clientY:15,bubbles:true}));
  });
  expect(reply).toHaveBeenCalledTimes(1);
  await act(async () => {
    bubble.dispatchEvent(new PointerEvent("pointerdown",{button:0,clientX:100,clientY:10,bubbles:true}));
    bubble.dispatchEvent(new PointerEvent("pointerup",{clientX:20,clientY:15,bubbles:true}));
  });
  expect(reply).toHaveBeenCalledTimes(2);
  await act(async () => {await page.getByRole("button",{name:"원문으로 이동"}).click();await page.getByRole("button",{name:"답장 취소"}).click();});
  expect(jump).toHaveBeenCalledTimes(1);expect(cancel).toHaveBeenCalledTimes(1);
  expect(host.querySelector('textarea')?.value).toBe("초안");
});
