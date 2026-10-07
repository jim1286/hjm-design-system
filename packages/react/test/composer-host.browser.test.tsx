import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { MessageComposer } from "../src/screens.js";
import "../src/styles.css";
it("separates visible copy, links validation, releases typing and preserves IME and pending drafts", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host), send = vi.fn(), blur = vi.fn(), remove = vi.fn();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const props = {label:"사진이나 메시지를 보내세요",placeholder:"메시지",sendLabel:"전송",value:"한글 초안",onValueChange:vi.fn(),onSend:send,onBlur:blur,submitMode:"send" as const,description:"20자 남음",invalid:true,sendIcon:<span>↑</span>,attachments:[{id:"photo",removeLabel:"사진 삭제",disabled:true,preview:<span>로컬 사진</span>}],onRemoveAttachment:remove};
  try {
    await act(async () => root.render(<HjmProvider><MessageComposer {...props}/></HjmProvider>));
    const input = host.querySelector("textarea")!;
    expect(input.placeholder).toBe("메시지"); expect(input.getAttribute("aria-label")).toBe(props.label);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("20자 남음");
    const key = async (extra: KeyboardEventInit = {}) => {const event = new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true,...extra}); await act(async () => {input.dispatchEvent(event);}); return event;};
    for (const extra of [{shiftKey:true},{isComposing:true},{keyCode:229}]) expect((await key(extra)).defaultPrevented).toBe(false);
    expect(send).not.toHaveBeenCalled();
    expect((await key()).defaultPrevented).toBe(true); expect(send).toHaveBeenCalledWith(props.value);
    await act(async () => {input.focus(); input.blur();}); expect(blur).toHaveBeenCalledOnce();
    expect(host.querySelector<HTMLButtonElement>('[aria-label="사진 삭제"]')?.disabled).toBe(true);
    await act(async () => root.render(<HjmProvider><MessageComposer {...props} pending/></HjmProvider>));
    await key(); expect(send).toHaveBeenCalledOnce(); expect(remove).not.toHaveBeenCalled(); expect(input.value).toBe(props.value);
  } finally {await act(async () => root.unmount()); host.remove();}
});
