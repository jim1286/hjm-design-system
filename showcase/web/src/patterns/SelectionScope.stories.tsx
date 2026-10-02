import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";

function SelectionScopePreview() {
  const [scope, setScope] = useState<"cover" | "group">("cover");
  const [result, setResult] = useState("");
  const count = scope === "cover" ? 1 : 3;

  return (
    <Stack gap="md">
      <Text variant="heading">이 묶음에서 무엇을 공유할까요?</Text>
      <Text>여행 사진 묶음에는 대표 사진 1개를 포함해 모두 3개가 있어요.</Text>
      <Stack gap="sm">
        <Button tone="secondary" selected={scope === "cover"} onClick={() => { setScope("cover"); setResult(""); }}>
          대표 사진만 · 1개
        </Button>
        <Button tone="secondary" selected={scope === "group"} onClick={() => { setScope("group"); setResult(""); }}>
          묶음 전체 · 3개
        </Button>
      </Stack>
      <Text>선택 범위: {scope === "cover" ? "대표 사진만" : "묶음 전체"} ({count}개)</Text>
      <Button onClick={() => setResult(`${count}개를 공유 대상으로 정했어요. 실제로 전송하지는 않았어요.`)}>
        {count}개 공유 대상으로 정하기
      </Button>
      <Text role="status">{result || "범위를 고른 뒤 적용하세요."}</Text>
    </Stack>
  );
}

const meta = {
  includeStories: ["Default", "Dark", "LargeText"],
  id: "experimental-selection-scope",
  title: "실험/구성/상호작용 예제/대표 항목과 묶음 전체 선택",
  component: SelectionScopePreview,
} satisfies Meta<typeof SelectionScopePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
