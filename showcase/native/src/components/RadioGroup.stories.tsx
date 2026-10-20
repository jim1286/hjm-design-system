import { useState } from "react";
import { CheckboxGroup, RadioGroup } from "@hjmds/react-native/inputs";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { Text as PreviewText } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/입력/라디오 버튼 그룹", component: NativeComponentPreview, args: { componentId: "radio-group", variant: "default" }, parameters: { hjm: { componentIds: ["radio-group"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function OptionActionsPreview() {
  const [value, setValue] = useState<string | null>("default"), [managed, setManaged] = useState(false);
  return <Stack gap="sm"><RadioGroup label="글씨체" value={value} onValueChange={setValue}
    items={[{value:"default",label:"기본"}, {value:"personal",label:"나의 글씨", action:{label:"이름 변경",onAction:()=>setManaged(true)}}]}
    renderLabel={item => <PreviewText style={{fontFamily:"Georgia"}}>{item.label}</PreviewText>} />
    <Text>{managed ? "선택을 바꾸지 않고 이름 변경을 열었습니다." : "보조 행동과 선택을 따로 사용할 수 있습니다."}</Text>
  </Stack>;
}
export const OptionActions: Story = { name: "미리보기와 항목 행동 · 미게시", render: () => <OptionActionsPreview /> };

// Unpublished: unlike SegmentedControl, these chip groups permit no selection or several selections.
function ChipChoicesPreview() {
  const [season, setSeason] = useState<string | null>(null);
  const [years, setYears] = useState<ReadonlySet<string>>(new Set());
  const options = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
  return <Stack gap="md"><RadioGroup label="시즌" presentation="chips" size="small" value={season} onValueChange={setSeason}
    items={options.map(value => ({value,label:value}))} />
    <CheckboxGroup label="드래프트 연도" presentation="chips" size="small" value={years} onValueChange={setYears}
      items={options.map(id => ({id,label:id}))} />
    <Text>{season ?? "시즌 미선택"} · {years.size}개 선택</Text>
  </Stack>;
}
export const ChipChoices: Story = { name: "칩 선택과 미선택 · 미게시", render: () => <ChipChoicesPreview /> };

function EqualCardsPreview() {
  const [value, setValue] = useState<string | null>("public");
  return <RadioGroup label="공개 범위" size="small" value={value} onValueChange={setValue}
    grid={{ columns: { compact: 2 }, gap: { compact: "xs" }, minColumnWidth: { compact: 152 } }}
    items={[{ value: "public", label: "장소 공개 허용", description: "설명이 길어도 같은 폭으로 비교해요" }, { value: "private", label: "받는 사람만", description: "한 사람에게 전해요" }]} />;
}
export const EqualCards: Story = { name: "동일 폭 선택 카드 · 미게시", render: () => <EqualCardsPreview /> };
