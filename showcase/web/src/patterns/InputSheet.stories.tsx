import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { Stack, Text } from "@hjmds/react/layout";

function InputSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return <Stack gap="md">
    <Button onClick={() => setOpen(true)}>입력 시트 열기</Button>
    <Sheet open={open} onOpenChange={setOpen} title="기록 이름" closeLabel="닫기"
      footer={<Button onClick={() => setOpen(false)}>완료</Button>}>
      <TextField label="이름" value={name} onValueChange={setName} />
      {Array.from({ length: 8 }, (_, index) => <Text key={index}>작은 화면에서도 본문을 스크롤하고 완료 버튼에 접근할 수 있어요.</Text>)}
    </Sheet>
  </Stack>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-input-sheet", title: "배포/구성/입력과 작성/입력 시트", component: InputSheet } satisfies Meta<typeof InputSheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2", viewport: { value: "mobile1", isRotated: false } } };
