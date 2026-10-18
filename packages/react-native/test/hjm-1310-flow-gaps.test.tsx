// HJM 1.31 gaps from the 2026-10-18 app audit: auth header, editor step-back, pressable steps, profile edit placement,
// operator review and the chrome-less moderation form. Same behaviour as the Web suite of the same name.
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { Heading } from "../src/heading.js";
import { RadioGroup, TextArea } from "../src/inputs.js";
import { AlertDialog } from "../src/overlays.js";
import { AuthScreenHero, AuthScreenLayout } from "../src/auth-screen.js";
import { Steps } from "../src/steps.js";
import { EditorScreen, ModerationForm, ModerationScreen, ProfileScreen, ProfileSummary } from "../src/screen-flows.js";
import { ScreenLayout } from "../src/screens.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
function render(child: ReactNode) { let tree: ReactTestRenderer; act(() => { tree = create(<HjmNativeProvider textScale={1}>{child}</HjmNativeProvider>); }); return tree!; }
const discard = { mode: "confirm" as const, title: "버릴까요", description: "초안", confirmLabel: "버리기", cancelLabel: "유지", fallbackErrorMessage: "실패" };
const buttonNamed = (tree: ReactTestRenderer, label: string) => tree.root.findAllByType(Button).find(button => button.props.children === label)!;

it("draws the auth route title and exit above the scrolling body", () => {
  const close = vi.fn();
  const tree = render(<AuthScreenLayout testID="login" layoutStyle={{ flex: 1 }} title="로그인" exit={{ kind: "back", label: "뒤로", onPress: close }}
    hero={<AuthScreenHero title="다시 만나서 반가워요" />} main={null} />);
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.testID).toBe("login");
  // The band is outside the ScrollView, so it stays put while the body scrolls; placement moves to the outer View.
  expect(scroll.findAllByType(Heading)).toHaveLength(0);
  const heading = tree.root.findAllByType(Heading).find(node => node.props.children === "로그인")!;
  expect(heading.props.semanticLevel).toBe(1);
  const exit = tree.root.findAllByType(IconButton).find(button => button.props.label === "뒤로")!;
  act(() => exit.props.onPress());
  expect(close).toHaveBeenCalledOnce();
  expect(() => render(<AuthScreenLayout title=" " hero={null} main={null} />)).toThrow(/title/);
  act(() => tree.unmount());
});

it("keeps the auth layout root unchanged without title or exit", () => {
  const tree = render(<AuthScreenLayout testID="login" hero={<AuthScreenHero title="태그라인" />} main={null} />);
  expect(tree.toJSON()).toMatchObject({ type: "ScrollView", props: { testID: "login" } });
  act(() => tree.unmount());
});

it("turns the editor exit into a step-back chevron that never opens the discard prompt", () => {
  const back = vi.fn(), leave = vi.fn();
  function Flow() {
    const [step, setStep] = useState(2);
    return <EditorScreen title="작성" dirty submit={{ label: "다음", onAction: () => {} }} cancel={{ label: "닫기", onAction: leave }} discard={discard}
      {...(step > 1 ? { stepBack: { label: "이전 단계", onAction: () => { back(); setStep(step - 1); } } } : {})}>본문</EditorScreen>;
  }
  const tree = render(<Flow />);
  expect(tree.root.findByType(ScreenLayout).props.exit).toMatchObject({ kind: "back", label: "이전 단계" });
  act(() => tree.root.findAllByType(IconButton).find(button => button.props.label === "이전 단계")!.props.onPress());
  expect(back).toHaveBeenCalledOnce();
  expect(tree.root.findByType(AlertDialog).props.open).toBe(false);
  // First step: the close exit and its dirty-draft prompt come back.
  expect(tree.root.findByType(ScreenLayout).props.exit).toMatchObject({ kind: "close", label: "닫기" });
  act(() => tree.root.findAllByType(IconButton).find(button => button.props.label === "닫기")!.props.onPress());
  expect(tree.root.findByType(AlertDialog).props.open).toBe(true);
  expect(leave).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

it("locks the step-back exit while saving", () => {
  const tree = render(<EditorScreen title="작성" dirty={false} submit={{ label: "저장", pending: true, onAction: () => {} }} cancel={{ label: "닫기", onAction: () => {} }}
    discard={discard} stepBack={{ label: "이전 단계", onAction: () => {} }}>본문</EditorScreen>);
  expect(tree.root.findByType(ScreenLayout).props.exit.disabled).toBe(true);
  act(() => tree.unmount());
});

it("makes only steps before the cursor named buttons", () => {
  const press = vi.fn();
  const tree = render(<Steps descriptor={{ currentStepId: "emoji", steps: [{ id: "color", label: "색" }, { id: "emoji", label: "이모지" }, { id: "text", label: "글" }] }}
    statusLabels={{ pending: "예정", current: "진행 중", complete: "완료", error: "오류" }} composeAccessibleName={({ position, total, label }) => `${total}단계 중 ${position}단계 ${label}`}
    onStepPress={press} />);
  const buttons = tree.root.findAllByType(Pressable);
  expect(buttons.map(button => [button.props.accessibilityRole, button.props.accessibilityLabel, button.props.accessibilityHint]))
    .toEqual([["button", "3단계 중 1단계 색", "완료"]]);
  expect(buttons[0]!.props.style.minHeight).toBe(44);
  act(() => buttons[0]!.props.onPress());
  expect(press).toHaveBeenCalledExactlyOnceWith("color");
  // Without a handler every step stays static.
  act(() => tree.update(<HjmNativeProvider><Steps descriptor={{ currentStepId: "emoji", steps: [{ id: "color", label: "색" }, { id: "emoji", label: "이모지" }] }}
    statusLabels={{ pending: "예정", current: "진행 중", complete: "완료", error: "오류" }} composeAccessibleName={({ label }) => label} /></HjmNativeProvider>));
  expect(tree.root.findAllByType(Pressable)).toHaveLength(0);
  act(() => tree.unmount());
});

it("places the profile edit action first in the summary action row on request", () => {
  const edit = vi.fn();
  const tree = render(<ProfileScreen title="계정" editPlacement="summary" edit={{ label: "프로필 수정", onAction: edit }}
    summary={<View testID="card"><ProfileSummary name="지민" avatar={null} actions={<Button>공유</Button>} /></View>} />);
  const card = tree.root.findByProps({ testID: "card" });
  expect(card.findAllByType(Button).map(button => button.props.children)).toEqual(["프로필 수정", "공유"]);
  expect(buttonNamed(tree, "프로필 수정").props).toMatchObject({ tone: "secondary", size: "small" });
  expect(tree.root.findAllByType(Button).filter(button => button.props.children === "프로필 수정")).toHaveLength(1);
  act(() => buttonNamed(tree, "프로필 수정").props.onPress());
  expect(edit).toHaveBeenCalledOnce();
  act(() => tree.unmount());
  const fallback = render(<ProfileScreen title="계정" edit={{ label: "프로필 수정", onAction: edit }} summary={<View testID="card"><ProfileSummary name="지민" avatar={null} /></View>} />);
  expect(fallback.root.findByProps({ testID: "card" }).findAllByType(Button)).toHaveLength(0);
  expect(buttonNamed(fallback, "프로필 수정").props.tone).toBe("ghost");
  act(() => fallback.unmount());
});

it("locks operator decisions until a reason is written and confirms a destructive decision first", () => {
  const dismiss = vi.fn(), hide = vi.fn();
  function Review() {
    const [reason, setReason] = useState("");
    return <ModerationScreen variant="review" title="신고 검토" decisionReason={{ label: "처리 사유", value: reason, onValueChange: setReason }}
      decisions={[{ id: "dismiss", label: "기각", onAction: dismiss }, { id: "hide", label: "숨기기", tone: "danger", onAction: () => {},
        confirmation: { mode: "confirm", tone: "danger", title: "숨길까요?", description: "작성자에게 보이지 않아요", confirmLabel: "숨기기", cancelLabel: "취소", fallbackErrorMessage: "실패", onConfirm: hide } }]}>
      <View /></ModerationScreen>;
  }
  const tree = render(<Review />);
  expect(buttonNamed(tree, "기각").props.disabled).toBe(true);
  act(() => tree.root.findByType(TextArea).props.onValueChange("스팸 확인"));
  expect(buttonNamed(tree, "기각").props.disabled).toBe(false);
  expect(buttonNamed(tree, "숨기기").props.tone).toBe("danger");
  act(() => buttonNamed(tree, "숨기기").props.onPress());
  expect(hide).not.toHaveBeenCalled();
  expect(tree.root.findByType(AlertDialog).props).toMatchObject({ open: true, request: expect.objectContaining({ title: "숨길까요?" }) });
  act(() => buttonNamed(tree, "기각").props.onPress());
  expect(dismiss).toHaveBeenCalledOnce();
  act(() => tree.unmount());
});

it("locks every decision and the reason while one decision is pending, and shows the resolution instead once decided", () => {
  const tree = render(<ModerationScreen variant="review" title="신고 검토" decisionReason={{ label: "처리 사유", value: "확인", onValueChange: () => {} }}
    decisions={[{ id: "uphold", label: "유지", pending: true, onAction: () => {} }, { id: "overturn", label: "번복", onAction: () => {} }]}><View /></ModerationScreen>);
  expect(buttonNamed(tree, "번복").props.disabled).toBe(true);
  expect(tree.root.findByType(TextArea).props.disabled).toBe(true);
  act(() => tree.update(<HjmNativeProvider><ModerationScreen variant="review" title="신고 검토" decisionReason={{ label: "처리 사유", value: "", onValueChange: () => {} }}
    decisions={[{ id: "uphold", label: "유지", onAction: () => {} }]} resolution={<View testID="resolution" />}><View /></ModerationScreen></HjmNativeProvider>));
  expect(tree.root.findAllByType(TextArea)).toHaveLength(0);
  expect(tree.root.findAllByType(Button)).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: "resolution" }).length).toBeGreaterThan(0);
  act(() => tree.unmount());
});

it("renders the report form without screen chrome for a letter or sheet", () => {
  const send = vi.fn(), cancel = vi.fn(), select = vi.fn();
  const tree = render(<ModerationForm title="신고" reasons={[{ value: "spam", label: "스팸" }]} reason={null} onReasonChange={select} reasonLabel="신고 사유"
    submit={{ label: "신고하기", onAction: send }} cancel={{ label: "취소", onAction: cancel }} />);
  expect(tree.root.findAllByType(ScreenLayout)).toHaveLength(0);
  expect(tree.root.findAllByType(Button).map(button => [button.props.children, button.props.tone])).toEqual([["신고하기", "primary"], ["취소", "ghost"]]);
  expect(buttonNamed(tree, "신고하기").props.disabled).toBe(true);
  act(() => tree.root.findByType(RadioGroup).props.onValueChange("spam"));
  expect(select).toHaveBeenCalledExactlyOnceWith("spam");
  act(() => buttonNamed(tree, "취소").props.onPress());
  expect(cancel).toHaveBeenCalledOnce();
  act(() => tree.unmount());
});
