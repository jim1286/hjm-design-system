/// <reference types="vite/client" />
// This browser scenario imports the private Vite Showcase, whose provider logo reads import.meta.env.
import "../src/styles.css";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { HjmProvider } from "../src/provider.js";
import { ChatScreenPreview } from "../../../showcase/web/src/patterns/common-screen-previews.js";
import { GroupChatPreview } from "../../../showcase/web/src/patterns/group-chat-preview.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("opens the selected header, message and group member profiles and returns to the conversation", async () => {
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
 const click=async(label:string)=>{const button=host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;expect(button).not.toBeNull();expect(button.closest('[aria-hidden="true"]')).toBeNull();await act(async()=>button.click());};
 try {
  await act(async()=>root.render(<HjmProvider><ChatScreenPreview/></HjmProvider>));
  const targets=host.querySelectorAll<HTMLButtonElement>('button[aria-label="서연 프로필 보기"]');expect(targets.length).toBe(4);
  for (const target of targets) { expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);expect(target.getBoundingClientRect().height).toBeGreaterThanOrEqual(44); }
  await click("서연 프로필 보기");expect(host.textContent).toContain("산책하며 일상");await click("대화로 돌아가기");expect(host.textContent).toContain("그럼 입구에서 만나요");
  const message=host.querySelectorAll<HTMLButtonElement>('button[aria-label="서연 프로필 보기"]')[1]!;
  await act(async()=>{message.focus();await userEvent.keyboard("{Enter}");});
  expect(host.textContent).toContain("산책하며 일상");await click("대화로 돌아가기");
  await act(async()=>root.render(<HjmProvider><GroupChatPreview/></HjmProvider>));
  await click("민준 프로필 보기");expect(host.querySelector("h1")?.textContent).toBe("민준");await click("대화로 돌아가기");
  await click("지우 프로필 보기");expect(host.querySelector("h1")?.textContent).toBe("지우");
 } finally {await act(async()=>root.unmount());host.remove();}
});
