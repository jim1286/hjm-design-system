// HJM 1.31 gaps from the 2026-10-18 app audit: auth header, editor step-back, pressable steps, profile edit placement,
// operator review and the chrome-less moderation form. Normal text size only (maximum text is out of scope, 2026-10-07).
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { AuthScreenHero, AuthScreenLayout } from "../src/auth-screen.js";
import { Steps } from "../src/steps.js";
import { EditorScreen, ModerationForm, ModerationScreen, ProfileScreen, ProfileSummary } from "../src/screen-flows.js";
import "../src/styles.css";

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });
const discard = { mode: "confirm" as const, title: "버릴까요", description: "초안", confirmLabel: "버리기", cancelLabel: "유지", fallbackErrorMessage: "실패" };

it("draws the auth route title and exit in the shared header band and steps the hero heading down", async () => {
  await page.viewport(390, 760);
  const close = vi.fn();
  await act(async () => root.render(<HjmProvider textScale={1}><AuthScreenLayout title="로그인" exit={{ kind: "close", label: "닫기", onClick: close }}
    hero={<AuthScreenHero title="다시 만나서 반가워요" />} main={<button type="button">Google</button>} /></HjmProvider>));
  const header = host.querySelector<HTMLElement>(".hjm-auth-screen__header")!;
  expect(header.querySelector("h1")?.textContent).toBe("로그인");
  expect(host.querySelector(".hjm-auth-screen__hero h2")?.textContent).toBe("다시 만나서 반가워요");
  const exit = header.querySelector<HTMLButtonElement>('button[aria-label="닫기"]')!;
  const band = header.getBoundingClientRect(), screen = host.querySelector<HTMLElement>(".hjm-auth-screen")!.getBoundingClientRect();
  // Full-bleed band at the screen edge: the exit sits in the shared 16px gutter, the title is centered.
  expect(Math.round(band.left)).toBe(Math.round(screen.left));
  expect(Math.round(band.width)).toBe(Math.round(screen.width));
  expect(band.height).toBeGreaterThanOrEqual(52);
  const title = header.querySelector("h1")!.getBoundingClientRect();
  expect(Math.abs((title.left + title.right) / 2 - (band.left + band.right) / 2)).toBeLessThan(1.5);
  await userEvent.click(exit);
  expect(close).toHaveBeenCalledOnce();
  // Without title/exit nothing changes: no band, hero stays the h1.
  await act(async () => root.render(<HjmProvider><AuthScreenLayout hero={<AuthScreenHero title="태그라인" />} main={null} /></HjmProvider>));
  expect(host.querySelector(".hjm-auth-screen__header")).toBeNull();
  expect(host.querySelector(".hjm-auth-screen__hero h1")?.textContent).toBe("태그라인");
});

it("turns the editor exit into a step-back chevron that never opens the discard prompt", async () => {
  const back = vi.fn(), leave = vi.fn();
  function Flow() {
    const [step, setStep] = useState(2);
    return <EditorScreen title="작성" dirty submit={{ label: "다음", onAction: () => {} }} cancel={{ label: "닫기", onAction: leave }} discard={discard}
      {...(step > 1 ? { stepBack: { label: "이전 단계", onAction: () => { back(); setStep(step - 1); } } } : {})}>본문</EditorScreen>;
  }
  await act(async () => root.render(<HjmProvider><Flow /></HjmProvider>));
  const backButton = host.querySelector<HTMLButtonElement>('button[aria-label="이전 단계"]')!;
  expect(backButton.querySelector('[data-kind="back"]')).not.toBeNull();
  expect(host.querySelector('button[aria-label="닫기"]')).toBeNull();
  await userEvent.click(backButton);
  expect(back).toHaveBeenCalledOnce();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  // First step: the close exit and its dirty-draft prompt come back.
  const close = host.querySelector<HTMLButtonElement>('button[aria-label="닫기"]')!;
  expect(close.querySelector('[data-kind="close"]')).not.toBeNull();
  await userEvent.click(close);
  await vi.waitFor(() => expect(document.querySelector('[role="alertdialog"]')).not.toBeNull());
  expect(leave).not.toHaveBeenCalled();
});

it("locks the step-back exit while saving", async () => {
  const back = vi.fn();
  await act(async () => root.render(<HjmProvider><EditorScreen title="작성" dirty={false} submit={{ label: "저장", pending: true, onAction: () => {} }} cancel={{ label: "닫기", onAction: () => {} }}
    discard={discard} stepBack={{ label: "이전 단계", onAction: back }}>본문</EditorScreen></HjmProvider>));
  expect(host.querySelector<HTMLButtonElement>('button[aria-label="이전 단계"]')!.disabled).toBe(true);
});

it("makes only steps before the cursor named buttons", async () => {
  const press = vi.fn();
  await act(async () => root.render(<HjmProvider><Steps descriptor={{ currentStepId: "emoji", steps: [{ id: "color", label: "색" }, { id: "emoji", label: "이모지" }, { id: "text", label: "글" }] }}
    statusLabels={{ pending: "예정", current: "진행 중", complete: "완료", error: "오류" }} composeAccessibleName={({ position, total, label }) => `${total}단계 중 ${position}단계 ${label}`}
    onStepPress={press} /></HjmProvider>));
  const buttons = [...host.querySelectorAll<HTMLButtonElement>(".hjm-steps button")];
  expect(buttons.map(button => button.getAttribute("aria-label"))).toEqual(["3단계 중 1단계 색"]);
  expect(document.getElementById(buttons[0]!.getAttribute("aria-describedby")!)?.textContent).toBe("완료");
  expect(buttons[0]!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  expect(host.querySelector('[aria-current="step"]')?.getAttribute("aria-label")).toBe("3단계 중 2단계 이모지");
  buttons[0]!.focus();
  await userEvent.keyboard("{Enter}");
  expect(press).toHaveBeenCalledExactlyOnceWith("color");
});

it("places the profile edit action first in the summary action row on request", async () => {
  const edit = vi.fn();
  await act(async () => root.render(<HjmProvider><ProfileScreen title="계정" editPlacement="summary" edit={{ label: "프로필 수정", onAction: edit }}
    summary={<section data-testid="card"><ProfileSummary name="지민" avatar={<span>J</span>} actions={<button type="button">공유</button>} /></section>} /></HjmProvider>));
  const card = host.querySelector('[data-testid="card"]')!;
  const buttons = [...card.querySelectorAll("button")].map(button => button.textContent);
  expect(buttons).toEqual(["프로필 수정", "공유"]);
  expect([...host.querySelectorAll("button")].filter(button => button.textContent === "프로필 수정")).toHaveLength(1);
  await userEvent.click(card.querySelector("button")!);
  expect(edit).toHaveBeenCalledOnce();
  // Default stays the ghost button below the summary.
  await act(async () => root.render(<HjmProvider><ProfileScreen title="계정" edit={{ label: "프로필 수정", onAction: edit }}
    summary={<section data-testid="card"><ProfileSummary name="지민" avatar={<span>J</span>} /></section>} /></HjmProvider>));
  expect(host.querySelector('[data-testid="card"] button')).toBeNull();
  expect(host.querySelector("button")?.textContent).toBe("프로필 수정");
});

it("locks operator decisions until a reason is written and confirms a destructive decision first", async () => {
  const dismiss = vi.fn(), hide = vi.fn();
  function Review() {
    const [reason, setReason] = useState("");
    return <ModerationScreen variant="review" title="신고 검토" decisionReason={{ label: "처리 사유", value: reason, onValueChange: setReason }}
      decisions={[{ id: "dismiss", label: "기각", onAction: dismiss }, { id: "hide", label: "숨기기", tone: "danger", onAction: () => {},
        confirmation: { mode: "confirm", tone: "danger", title: "숨길까요?", description: "작성자에게 보이지 않아요", confirmLabel: "숨기기", cancelLabel: "취소", fallbackErrorMessage: "실패", onConfirm: hide } }]}>
      <p>신고된 댓글</p></ModerationScreen>;
  }
  await act(async () => root.render(<HjmProvider><Review /></HjmProvider>));
  const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("footer button")].find(item => item.textContent === label)!;
  expect(button("기각").disabled).toBe(true);
  expect(button("숨기기").disabled).toBe(true);
  await userEvent.type(host.querySelector("textarea")!, "스팸 확인");
  expect(button("기각").disabled).toBe(false);
  await userEvent.click(button("숨기기"));
  expect(hide).not.toHaveBeenCalled();
  const dialog = await vi.waitFor(() => { const found = document.querySelector<HTMLElement>('[role="alertdialog"]'); if (!found) throw new Error("no dialog"); return found; });
  await userEvent.click([...dialog.querySelectorAll("button")].find(item => item.textContent === "숨기기")!);
  await vi.waitFor(() => expect(hide).toHaveBeenCalledOnce());
  await userEvent.click(button("기각"));
  expect(dismiss).toHaveBeenCalledOnce();
});

it("replaces the reason field and decisions with the resolution", async () => {
  await act(async () => root.render(<HjmProvider><ModerationScreen variant="review" title="신고 검토" decisionReason={{ label: "처리 사유", value: "", onValueChange: () => {} }}
    decisions={[{ id: "uphold", label: "유지", onAction: () => {} }]} resolution={<p>숨김 처리됨</p>}><p>내용</p></ModerationScreen></HjmProvider>));
  expect(host.querySelector("textarea")).toBeNull();
  expect(host.querySelector("footer")).toBeNull();
  expect(host.textContent).toContain("숨김 처리됨");
});

it("renders the report form without screen chrome for a letter or sheet", async () => {
  const send = vi.fn(), cancel = vi.fn();
  function Inline() {
    const [reason, setReason] = useState<string | null>(null);
    return <ModerationForm title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason={reason} onReasonChange={setReason} reasonLabel="신고 사유"
      submit={{ label: "신고하기", onAction: send }} cancel={{ label: "취소", onAction: cancel }} />;
  }
  await act(async () => root.render(<HjmProvider><Inline /></HjmProvider>));
  expect(host.querySelector("main, header, footer, .hjm-screen")).toBeNull();
  expect(host.querySelector("h3")?.textContent).toBe("신고");
  const buttons = () => [...host.querySelectorAll<HTMLButtonElement>("button")].filter(item => item.textContent === "신고하기" || item.textContent === "취소");
  expect(buttons().map(item => item.textContent)).toEqual(["신고하기", "취소"]);
  expect(buttons()[0]!.disabled).toBe(true);
  await userEvent.click(host.querySelector<HTMLElement>('input[type="radio"]')!);
  await userEvent.click(buttons()[0]!);
  expect(send).toHaveBeenCalledOnce();
  await userEvent.click(buttons()[1]!);
  expect(cancel).toHaveBeenCalledOnce();
});
