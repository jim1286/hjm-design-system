import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextFormat } from "@hjmds/react/text-formats";
import { ClipboardButton } from "@hjmds/react/clipboard";
import { CounterBadge } from "@hjmds/react/display";
import { Avatar, AvatarGroup } from "@hjmds/react/display";
import { ListRow, List } from "@hjmds/react/display";
import { Stack, Section } from "@hjmds/react/layout";

export function TextFormatPreview() {
  return (
    <Section title="의미 있는 글자 조각" description="크기가 아니라 요소입니다 — 보조기기가 다르게 읽어요.">
      <Stack gap="md">
        <p>
          저장은 <TextFormat kind="kbd">⌘</TextFormat> <TextFormat kind="kbd">S</TextFormat>로 할 수 있어요.
        </p>
        <p>
          설치는 <TextFormat kind="code">pnpm add @hjmds/react</TextFormat> 한 줄이면 됩니다.
        </p>
        <TextFormat kind="quote">기록은 짧아도 좋아요. 남기는 것 자체가 의미예요.</TextFormat>
      </Stack>
    </Section>
  );
}

export function ClipboardPreview() {
  return (
    <Section title="복사하고 알려주기" description="복사 상태를 화면에만 칠하지 않고 읽어 줍니다.">
      <Stack gap="md">
        <p>초대 코드: <TextFormat kind="code">HJM-2026-0918</TextFormat></p>
        <ClipboardButton
          tone="secondary"
          value="HJM-2026-0918"
          labels={{ idle: "초대 코드 복사", copied: "복사했어요" }}
        />
      </Stack>
    </Section>
  );
}

export function AvatarGroupPreview() {
  return (
    <Section title="함께한 사람들" description="겹침 비율은 레시피가 정하고, 남은 인원 문구는 제품이 만듭니다.">
      <List label="함께한 기록">
        <ListRow
          title="느리게 걸었던 오후"
          description="미나, 민수 외 3명"
          leading={
            <AvatarGroup label="함께한 사람 5명" overflow="+3">
              <Avatar name="미나" />
              <Avatar name="민수" />
            </AvatarGroup>
          }
          trailing={<CounterBadge count={1} dot accessibilityLabel="읽지 않은 댓글 있음" />}
        />
      </List>
    </Section>
  );
}

const meta = { title: "Patterns/TextFormat", component: TextFormatPreview } satisfies Meta<typeof TextFormatPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Formats: Story = {};
export const Clipboard: Story = { render: () => <ClipboardPreview /> };
export const GroupedAvatars: Story = { render: () => <AvatarGroupPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
