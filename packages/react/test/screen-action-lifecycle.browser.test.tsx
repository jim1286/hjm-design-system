import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { EditorScreen, ModerationScreen, PermissionScreen, type EditorScreenProps } from "../src/screen-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const discard = { mode: "confirm", title: "초안을 버릴까요?", description: "입력이 사라집니다", confirmLabel: "버리기", cancelLabel: "계속 작성", fallbackErrorMessage: "실패" } as const;
const renderEditor = async (props: Partial<EditorScreenProps> = {}) => {
  await act(async () => root.render(<HjmProvider reducedMotion><EditorScreen title="작성" dirty submit={{ label: "저장", onAction: vi.fn() }} cancel={{ label: "닫기", onAction: vi.fn() }} discard={discard} {...props}><input aria-label="초안" defaultValue="유지할 입력" /></EditorScreen></HjmProvider>));
};
it("blocks editor submit while content is unavailable at either action placement", async () => {
  for (const submitPlacement of ["header", "footer"] as const) {
    for (const kind of ["loading", "error", "restricted", "empty"] as const) {
      await renderEditor({ submitPlacement, state: { kind, title: "아직 편집할 수 없습니다" } });
      await expect.element(page.getByRole("button", { name: "저장", exact: true })).toBeDisabled();
      await expect.element(page.getByRole("button", { name: "닫기", exact: true })).toBeEnabled();
    }
    await renderEditor({ submitPlacement });
    await expect.element(page.getByRole("button", { name: "저장", exact: true })).toBeEnabled();
  }
});
it("retires an open discard prompt when saving begins without losing the draft or reopening later", async () => {
  const leave = vi.fn();
  const props = (pending: boolean) => ({ cancel: { label: "닫기", onAction: leave }, submit: { label: "저장", pending, onAction: vi.fn() } });
  await renderEditor(props(false)); const input = host.querySelector("input");
  await act(async () => page.getByRole("button", { name: "닫기", exact: true }).click());
  await expect.element(page.getByRole("alertdialog")).toBeVisible();
  await renderEditor(props(true));
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  await renderEditor(props(false));
  expect(host.querySelector("input")).toBe(input); expect(input?.value).toBe("유지할 입력");
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  expect(leave).not.toHaveBeenCalled();
  await act(async () => page.getByRole("button", { name: "닫기", exact: true }).click());
  await act(async () => page.getByRole("button", { name: "버리기", exact: true }).click());
  expect(leave).toHaveBeenCalledOnce();
});
it("does not revive a withdrawn block confirmation when another block action is supplied", async () => {
  const blockUser = vi.fn();
  const block = { action: { label: "차단", onAction: vi.fn() }, confirmation: { ...discard, title: "대상을 차단할까요?", onConfirm: blockUser } };
  const render = async (available: boolean) => act(async () => root.render(<HjmProvider reducedMotion><ModerationScreen title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason="spam" reasonLabel="사유" onReasonChange={() => {}} submit={{ label: "신고하기", onAction: vi.fn() }} {...(available ? { block } : {})} /></HjmProvider>));
  await render(true); await act(async () => page.getByRole("button", { name: "차단", exact: true }).click());
  await expect.element(page.getByRole("alertdialog")).toBeVisible();
  await render(false); await render(true);
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  expect(blockUser).not.toHaveBeenCalled();
});
it("routes each permission status only from its visible action and preserves the alternative", async () => {
  const request = vi.fn(), settings = vi.fn(), next = vi.fn(), skip = vi.fn();
  const cases = [["prompt", "허용", request], ["denied", "설정", settings], ["granted", "계속", next], ["unavailable", null, null]] as const;
  for (const [status, label, callback] of cases) {
    await act(async () => root.render(<HjmProvider><PermissionScreen title="권한" status={status} explanation="사용 이유" request={{ label: "허용", onAction: request }} settings={{ label: "설정", onAction: settings }} continueAction={{ label: "계속", onAction: next }} skip={{ label: "나중에", onAction: skip }} /></HjmProvider>));
    expect(host.querySelectorAll("button")).toHaveLength(label ? 2 : 1);
    if (label) { await act(async () => page.getByRole("button", { name: label, exact: true }).click()); expect(callback).toHaveBeenCalledOnce(); }
  }
  await act(async () => page.getByRole("button", { name: "나중에", exact: true }).click()); expect(skip).toHaveBeenCalledOnce();
});

it("keeps a failed asynchronous discard open for retry with the same draft", async () => {
  const failure = Promise.reject(new Error("discard failed"));
  // Observe the fixture rejection even if a regression drops its return value.
  void failure.catch(() => {});
  const leave = vi.fn<() => Promise<void>>().mockReturnValueOnce(failure).mockResolvedValue(undefined);
  await renderEditor({ cancel: { label: "닫기", onAction: leave } });
  const input = host.querySelector("input");
  await act(async () => page.getByRole("button", { name: "닫기", exact: true }).click());
  await act(async () => page.getByRole("button", { name: "버리기", exact: true }).click());
  await expect.element(page.getByRole("alertdialog")).toBeVisible();
  await expect.element(page.getByRole("alert")).toHaveTextContent("실패");
  expect(host.querySelector("input")).toBe(input);
  await act(async () => page.getByRole("button", { name: "버리기", exact: true }).click());
  await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  expect(leave).toHaveBeenCalledTimes(2);
});
