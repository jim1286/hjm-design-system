import { Heading } from "@hjmds/react/heading";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { useDemoAction } from "./action-recovery-previews";

// Scope and result copy are id→copy tables like the product's id→i18n-key tables (selection-scope.md).
const scopeCopy = { cover: "대표 사진만", group: "묶음 전체" } as const;
const scopeCount = { cover: 1, group: 3 } as const;
type Scope = keyof typeof scopeCopy;
const resultCopy = {
  idle: () => "범위를 고른 뒤 적용하세요.",
  applied: (count: number) => `${count}개를 공유 대상으로 정했어요. 실제로 전송하지는 않았어요.`,
  failed: () => "공유 대상을 정하지 못했어요. 고른 범위는 그대로예요. 다시 적용해 주세요.",
} as const;

function SelectionScopePreview() {
  const [scope, setScope] = useState<Scope>("cover");
  // Reuse the demo action session so failure and duplicate-tap blocking follow action-session.md.
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction<Scope | null>(null);
  const count = scopeCount[scope];
  const result = state.status === "error" ? "failed" : state.status === "success" && state.value === scope ? "applied" : "idle";
  const choose = (next: Scope) => { setScope(next); session.reset(null); };
  return (
    <Container gutter="compact" size="reading">
      <Stack gap="md">
        <Heading level="level3" semanticLevel={2}>이 묶음에서 무엇을 공유할까요?</Heading>
        <Text>여행 사진 묶음에는 대표 사진 1개를 포함해 모두 3개가 있어요.</Text>
        <Stack gap="sm">
          {(Object.keys(scopeCopy) as Scope[]).map(id => (
            <Button key={id} tone="secondary" selected={scope === id} disabled={busy} onClick={() => choose(id)}>
              {`${scopeCopy[id]} · ${scopeCount[id]}개`}
            </Button>
          ))}
        </Stack>
        <Text>선택 범위: {scopeCopy[scope]} ({count}개)</Text>
        <Button loading={busy} onClick={() => { const submitted = scope; void session.run(() => request(submitted), { retryable: true }); }}>
          {`${count}개 공유 대상으로 정하기`}
        </Button>
        <Text role="status">{resultCopy[result](count)}</Text>
        <Button tone="ghost" selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 적용 실패시키기</Button>
      </Stack>
    </Container>
  );
}

const meta = {
  includeStories: ["Default","Dark","LargeText"],
  id: "experimental-selection-scope",
  title: "배포/구성/선택과 필터/대표 항목과 묶음 전체 선택",
  component: SelectionScopePreview,
} satisfies Meta<typeof SelectionScopePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
