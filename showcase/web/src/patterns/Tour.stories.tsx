import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tour } from "@hjmds/react/tour";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const steps = [
  { id: "list", anchorId: "tour-list", title: "여기에 기록이 쌓여요", description: "최근에 쓴 기록이 맨 위에 옵니다." },
  { id: "write", anchorId: "tour-write", title: "여기서 새 기록을 써요", description: "한 줄만 남겨도 괜찮아요." },
  { id: "settings", anchorId: "tour-settings", title: "알림은 여기서 바꿔요", description: "언제 물어볼지 직접 정할 수 있어요." },
] as const;

type StepId = (typeof steps)[number]["id"];

export function TourPreview() {
  const [stepId, setStepId] = useState<StepId>("list");
  const [open, setOpen] = useState(false);
  const [ending, setEnding] = useState<string | null>(null);
  return (
    <Section title="처음 오신 분께" description="어디에 무엇이 있는지 한 바퀴 돌아봐요.">
      <Stack gap="md">
        {ending ? <Notice title="둘러보기를 마쳤어요" description={ending} /> : null}
        <Button id="tour-write" tone="primary">새 기록 쓰기</Button>
        <div id="tour-list">
          <List label="내 기록">
            <ListRow title="느리게 걸었던 오후" description="골목을 한 바퀴 돌았어요" />
            <ListRow title="함께 먹은 저녁" description="국이 좀 짰지만 좋았어요" />
          </List>
        </div>
        <Button id="tour-settings" tone="secondary">알림 설정</Button>
        <Tour
          open={open}
          onOpenChange={(next, detail) => {
            setOpen(next);
            if (next) { setStepId("list"); setEnding(null); return; }
            setEnding(
              detail.reason === "complete" ? "끝까지 보셨어요. 언제든 다시 열 수 있어요."
                : detail.reason === "skip" ? "중간에 그만두셨어요. 필요하면 다시 열어 주세요."
                  : "둘러보기를 닫았어요.",
            );
          }}
          trigger={<Button tone="ghost">둘러보기 시작</Button>}
          descriptor={{
            accessibilityLabel: "기록 앱 둘러보기",
            currentStepId: stepId,
            labels: { next: "다음", previous: "이전", skip: "그만 보기", done: "다 봤어요" },
            steps: [...steps],
          }}
          resolveAnchor={(anchorId) => document.getElementById(anchorId)}
          composeAnnouncement={({ position, total, title, description }) => `${total}단계 중 ${position}단계, ${title}. ${description}`}
          onStepChange={(id) => setStepId(id as StepId)}
        />
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/Tour", component: TourPreview } satisfies Meta<typeof TourPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Onboarding: Story = {};
export const LargeText: Story = { globals: { textScale: "2" } };
