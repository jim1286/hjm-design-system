import { useState } from "react";
import { Button, IconButton } from "@hjmds/react/actions";
import { Field } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
import { AuthProviderButton } from "@hjmds/react/provider-button";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { ProviderLogo } from "../patterns/provider-logo";

// State previews for the individual component items (2026-10-06). The default story of each item reuses the
// preview registry (ContractStory); these cover only states the registry preview does not show. Copy is showcase-owned.

// Moved from 배포/컴포넌트/동작/로딩 상태 (2026-10-06): a state is a story of its component, not an item of its own.
export function ButtonStatePreview({ state }: { state: "pending" | "disabled" }) {
  return <Stack axis="inline" gap="sm" wrap>
    <Button loading={state === "pending"} disabled={state === "disabled"}>저장</Button>
    <Button tone="secondary" loading={state === "pending"} disabled={state === "disabled"}>임시 저장</Button>
  </Stack>;
}

export function IconButtonStatePreview({ state }: { state: "pending" | "disabled" }) {
  return <Stack axis="inline" gap="sm">
    <IconButton label="좋아요" loading={state === "pending"} disabled={state === "disabled"}>♡</IconButton>
    <IconButton label="닫기" tone="ghost" loading={state === "pending"} disabled={state === "disabled"}>×</IconButton>
  </Stack>;
}

export function AuthProviderButtonPendingPreview() {
  return <AuthProviderButton descriptor={{ provider: "google", label: "Google", busy: true }} logo={<ProviderLogo provider="google" />} />;
}

export function FieldStatePreview({ state }: { state: "error" | "disabled" }) {
  const [value, setValue] = useState(state === "error" ? "" : "홍길동");
  return <Field
    controlId={`showcase-field-${state}`}
    label="이름"
    description="다른 사람에게 표시할 이름이에요."
    disabled={state === "disabled"}
    {...(state === "error" && !value.trim() ? { error: "이름을 입력해 주세요." } : {})}
  >
    {(controlProps) => <input {...controlProps} value={value} onChange={(event) => setValue(event.currentTarget.value)} />}
  </Field>;
}

// Moved from 실험/컴포넌트/입력/카테고리 필터 (2026-10-06): the pill presentation of SegmentedControl, not a separate API.
// Category ids map to copy (product: id → i18n key); the status sentence is not assembled from a template.
const categories = [
  { value: "all", label: "전체", status: "모든 기록을 보고 있어요." },
  { value: "place", label: "장소", status: "장소 기록을 보고 있어요." },
  { value: "daily", label: "일상", status: "일상 기록을 보고 있어요." },
  { value: "ideas", label: "나중에 볼 아이디어", status: "나중에 볼 아이디어를 보고 있어요." },
  { value: "soon", label: "준비 중", status: "", disabled: true },
] as const;
type CategoryId = (typeof categories)[number]["value"];

export function SegmentedPillsPreview({ disabled = false }: { disabled?: boolean }) {
  const [selected, setSelected] = useState<CategoryId>("all");
  return <Container gutter="compact"><Stack gap="md">
    <Heading level="level4">카테고리 필터</Heading>
    <Text tone="muted">분류를 고르면 보이는 기록의 범위가 바뀝니다.</Text>
    <SegmentedControl label="기록 카테고리" presentation="pills" disabled={disabled} value={selected} onValueChange={(value) => setSelected(value as CategoryId)}
      items={categories.map(({ value, label, ...item }) => ({ value, label, ...("disabled" in item ? { disabled: item.disabled } : {}) }))} />
    <Text role="status">{categories.find((item) => item.value === selected)?.status}</Text>
  </Stack></Container>;
}
