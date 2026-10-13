import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { useDemoAction } from "./action-recovery-previews.js";

function InputSheet() {

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { session, state, request, busy, failureArmed, toggleFailure } = useDemoAction("");
  const save = async () => {
    if (!name.trim()) return;
    const submitted = name.trim();
    const result = await session.run(() => request(submitted));
    // Keep the sheet and draft on failure; only confirmed success closes it.
    if (result.status === "success") setOpen(false);
  };
  return <Stack gap="md">
    <Button onClick={() => setOpen(true)}>입력 시트 열기</Button>
    {state.status === "success" && !open ? <Text role="status">저장했어요.</Text> : null}
    <Text>저장된 이름: {state.value || "아직 없어요"}</Text>
    <Sheet open={open} onOpenChange={next => {
      if (session.getSnapshot().status !== "pending") setOpen(next);
    }} busy={busy} title="기록 이름" closeLabel="닫기"

      footer={<Button loading={busy} disabled={!name.trim()} onClick={() => { void save(); }}>{state.status === "error" ? "다시 저장" : "저장"}</Button>}>
      <Stack gap="md">
        <TextField label="이름" value={name} disabled={busy} onValueChange={value => {
          setName(value);
          if (state.status !== "idle") session.reset(state.value);
        }} />
        {state.status === "error" ? <Notice tone="danger" title="저장하지 못했어요. 입력한 이름은 남아 있어요." /> : null}
        <Button tone="secondary" selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 저장 실패시키기</Button>
        <Text>서버 통신 없이 실패와 복구를 확인하는 예제예요. 닫아도 이 화면이 유지되는 동안 입력한 이름은 남아 있어요.</Text>
        {Array.from({ length: 8 }, (_, index) => <Text key={index}>본문을 스크롤해도 저장 버튼에 접근할 수 있어요.</Text>)}
      </Stack>
    </Sheet>
  </Stack>;
}
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "patterns-input-sheet", title: "배포/구성/입력과 작성/입력 시트", component: InputSheet } satisfies Meta<typeof InputSheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2", viewport: { value: "mobile1", isRotated: false } } };
