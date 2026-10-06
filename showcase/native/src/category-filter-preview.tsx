import { useState } from "react";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { PatternStatus } from "./pattern-status";

// 2026-10-06: moved from the experimental 카테고리 필터 story into 버튼형 선택 as the pills presentation.
// SegmentedControl presentation="pills" is not a separate public API, so it is a story, not an item.
// Category ids map to copy (product: id → i18n key); the status sentence is not assembled from a template.
const categories = [
 { value: "all", label: "전체", status: "모든 기록을 보고 있어요." },
 { value: "place", label: "장소", status: "장소 기록을 보고 있어요." },
 { value: "daily", label: "일상", status: "일상 기록을 보고 있어요." },
 { value: "ideas", label: "나중에 볼 아이디어", status: "나중에 볼 아이디어를 보고 있어요." },
 { value: "soon", label: "준비 중", status: "", disabled: true },
] as const;
type CategoryId = (typeof categories)[number]["value"];
export function CategoryFilterPreview({ disabled = false }: { disabled?: boolean }) {
 const [selected, setSelected] = useState<CategoryId>("all");
 return <Container gutter="compact"><Stack gap="md">
  <Heading level="level4">카테고리 필터</Heading>
  <Text tone="muted">분류를 고르면 보이는 기록의 범위가 바뀝니다.</Text>
  <SegmentedControl label="기록 카테고리" presentation="pills" disabled={disabled} value={selected} onValueChange={value => setSelected(value as CategoryId)}
   items={categories.map(({ value, label, ...item }) => ({ value, label, ...("disabled" in item ? { disabled: item.disabled } : {}) }))}/>
  <PatternStatus>{categories.find(item => item.value === selected)?.status ?? ""}</PatternStatus>
 </Stack></Container>;
}
