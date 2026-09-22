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
      <TextField label="이름" value={name} onChange={(event) => setName(event.currentTarget.value)} />
      {Array.from({ length: 8 }, (_, index) => <Text key={index}>작은 화면에서도 본문을 스크롤하고 완료 버튼에 접근할 수 있어요.</Text>)}
    </Sheet>
  </Stack>;
}
const meta = { title: "Patterns/Input sheet", component: InputSheet } satisfies Meta<typeof InputSheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LargeText: Story = { globals: { textScale: "2", viewport: { value: "mobile1", isRotated: false } } };
