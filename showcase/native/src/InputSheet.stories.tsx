import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { Stack, Text } from "@hjmds/react-native/primitives";

function InputSheet() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  return <Stack gap="md">
    <Button onPress={() => setOpen(true)}>입력 시트 열기</Button>
    <Sheet open={open} onOpenChange={setOpen} title="기록 이름" closeLabel="닫기"
      keyboardAvoidance scrollable safeAreaInsets={insets}
      footer={<Button onPress={() => setOpen(false)}>완료</Button>}>
      <TextField label="이름" value={name} onValueChange={setName} />
      {Array.from({ length: 8 }, (_, index) => <Text key={index}>키보드가 올라와도 본문을 스크롤하고 완료 버튼에 접근할 수 있어요.</Text>)}
    </Sheet>
  </Stack>;
}
const meta = { title: "Patterns/Input sheet", component: InputSheet } satisfies Meta<typeof InputSheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
