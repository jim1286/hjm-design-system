import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup } from "@hjmds/react/toggle-group";
import { TagsInput } from "@hjmds/react/tags-input";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

export function ToggleGroupPreview() {
  const [style, setStyle] = useState<ReadonlySet<string>>(new Set(["bold"]));
  const [filters, setFilters] = useState<ReadonlySet<string>>(new Set());
  const preview = [...style].sort().join(" + ") || "꾸미지 않음";
  return (
    <Section title="여러 개를 함께 켜기" description="하나만 고르는 자리는 SegmentedControl이 맡습니다.">
      <Stack gap="md">
        <ToggleGroup
          descriptor={{
            accessibilityLabel: "글자 꾸미기",
            items: [
              { id: "bold", label: "굵게" },
              { id: "italic", label: "기울임" },
              { id: "underline", label: "밑줄" },
              { id: "strike", label: "취소선", disabled: true },
            ],
          }}
          pressedIds={style}
          onPressedIdsChange={setStyle}
        />
        <p role="status">{preview}</p>
        <ToggleGroup
          size="small"
          descriptor={{
            accessibilityLabel: "기록 필터",
            items: [
              { id: "photo", label: "사진 있음" },
              { id: "long", label: "긴 글" },
              { id: "favorite", label: "즐겨찾기" },
            ],
          }}
          pressedIds={filters}
          onPressedIdsChange={setFilters}
        />
      </Stack>
    </Section>
  );
}

export function TagsInputPreview() {
  const [tags, setTags] = useState<readonly string[]>(["산책"]);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Section title="태그로 모아두기" description="목록에 없는 말도 직접 만들 수 있어요.">
      <Stack gap="md">
        <TagsInput
          label="태그"
          description="Enter로 추가하고, 빈 칸에서 지우기를 두 번 누르면 마지막 태그가 지워져요."
          placeholder="태그를 적어보세요"
          tags={tags}
          onTagsChange={(next) => { setTags(next); setMessage(null); }}
          policy={{ maxTags: 5 }}
          onReject={(result) => setMessage(
            result.reason === "duplicate" ? `${result.value}은(는) 이미 있어요`
              : result.reason === "limit" ? "태그는 5개까지 넣을 수 있어요"
                : null,
          )}
          composeRemoveLabel={(tag) => `${tag} 지우기`}
        />
        {/* 문구는 제품이 만든다 — 계약은 거절 사유만 알려 준다. */}
        {message ? <Notice tone="warning" title={message} /> : null}
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/ToggleGroup", component: ToggleGroupPreview } satisfies Meta<typeof ToggleGroupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Toggles: Story = {};
export const Tags: Story = { render: () => <TagsInputPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
