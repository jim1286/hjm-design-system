import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheet } from "@hjmds/react/overlays";
import { Steps } from "@hjmds/react/steps";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { ContentTransition } from "@hjmds/react/content-transition";
import { familyCopy as copy, familyStepName } from "../../../shared/family-drawer.js";
import { useDemoAction } from "./action-recovery-previews.js";


function FamilyDrawer() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { session, state, request, busy, failureArmed, toggleFailure } = useDemoAction(false);
  const panel = copy.panels[step]!;
  const advance = async () => {
    if (session.getSnapshot().status === "pending") return;
    if (step < copy.steps.length - 1) { setStep(step + 1); return; }
    const result = await session.run(() => request(true));
    if (result.status === "success") setOpen(false);
  };
  return <Stack gap="xl">
    <Heading level="level2">{copy.title}</Heading>
    <Text>{copy.description}</Text>
    <Button onClick={() => {
      // Reopen an unfinished flow at its current step; reset only after success.
      if (state.status === "success") { session.reset(false); setStep(0); }
      setOpen(true);
    }}>{copy.open}</Button>
    {state.status === "success" && !open ? <Text role="status">{copy.saved}</Text> : null}
    <Sheet open={open} busy={busy} onOpenChange={next => {
      if (session.getSnapshot().status !== "pending") setOpen(next);
    }} title={copy.title} closeLabel={copy.close} footer={<>
      <Button tone="ghost" disabled={step === 0 || busy} onClick={() => { session.reset(false); setStep(step - 1); }}>{copy.back}</Button>
      <Button loading={busy} onClick={() => { void advance(); }}>{step === 2 ? state.status === "error" ? "다시 저장" : copy.finish : copy.next}</Button>
    </>}>
      <Stack gap="xl">
        <Steps descriptor={{ steps: copy.steps, currentStepId: copy.steps[step]!.id, currentStepStatus: state.status === "error" ? "error" : "current" }} statusLabels={copy.statusLabels} composeAccessibleName={familyStepName} />
        <ContentTransition stateKey={String(step)} preset="slide"><Stack gap="md"><Heading level="level3">{panel.title}</Heading><Text>{panel.body}</Text></Stack></ContentTransition>
        {state.status === "error" ? <Notice tone="danger" title="설정을 저장하지 못했어요. 현재 단계에서 다시 시도해 주세요." /> : null}
        <Button tone="secondary" selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 저장 실패시키기</Button>
        <Text>서버 통신 없는 단계·복구 예제예요. 닫은 뒤 다시 열면 현재 단계로 이어져요.</Text>
      </Stack>
    </Sheet>
  </Stack>;
}
export default { id: "patterns-family-drawer", title: "배포/구성/입력과 작성/단계별 드로어", component: FamilyDrawer } satisfies Meta<typeof FamilyDrawer>;
export const Default: StoryObj<typeof FamilyDrawer> = { name: "기본" };
export const Dark: StoryObj = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj = { name: "큰 글자", globals: { textScale: "2" } };
