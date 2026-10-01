import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Select } from "@hjmds/react-native/forms";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";

// Native uses successive named Select controls rather than the Web Tree popup.
// Selecting an ancestor clears stale descendant choices; stored paths stay product-owned.
const nodes = [
  { id: "seoul", label: "서울", textValue: "서울", children: [{ id: "jongno", label: "종로구", textValue: "종로구" }, { id: "mapo", label: "마포구", textValue: "마포구" }] },
  { id: "busan", label: "부산", textValue: "부산", children: [{ id: "haeundae", label: "해운대구", textValue: "해운대구" }] },
];
function CascaderExample() {
  const [city, setCity] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const parent = nodes.find(item => item.id === city);
  return <Stack gap="md">
    <Select label="도시" placeholder="도시 선택" dismissLabel="도시 선택 닫기" items={nodes} selectedKey={city}
      onSelectionChange={value => { setCity(value); setDistrict(null); }} />
    {parent ? <Select key={parent.id} label="지역" placeholder="지역 선택" dismissLabel="지역 선택 닫기"
      items={parent.children} selectedKey={district} onSelectionChange={setDistrict} /> : null}
    <PatternStatus>{parent ? [parent.label, parent.children.find(item => item.id === district)?.label].filter(Boolean).join(" / ") : "지역을 선택해 주세요"}</PatternStatus>
    <Button onPress={() => { setCity(null); setDistrict(null); }}>선택 초기화</Button>
  </Stack>;
}
const meta = { title: "배포/컴포넌트/입력/단계별 선택", component: CascaderExample } satisfies Meta<typeof CascaderExample>;
export default meta;
export const ChooseRegion: StoryObj<typeof meta> = { name: "지역 선택",};
