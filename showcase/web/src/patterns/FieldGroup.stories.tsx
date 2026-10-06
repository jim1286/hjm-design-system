import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldGroup } from "@hjmds/react/field-group";
import { TextField } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react";
function Demo() {
  const [values, setValues] = useState<Record<string, string>>({ street: "", city: "", country: "대한민국" });
  const [locked, setLocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reverse, setReverse] = useState(false);
  const fields = [{ id: "street", label: "도로명 주소", description: "건물 번호까지 입력하세요." },
    { id: "city", label: "도시" }, { id: "country", label: "국가", disabled: true }];
  const missing = fields.filter(field => !values[field.id]?.trim()).map(field => field.id);
  return <Stack gap="md">
    <Text>제출 없이 관련 입력을 묶는 예제입니다. 국가 입력은 제품 정책으로 항상 잠겨 있습니다.</Text>
    <FieldGroup descriptor={{ label: "배송지", description: "실제 주소 대신 예시를 입력하세요.", disabled: locked,
      fields: reverse ? [...fields].reverse() : fields,
      ...(failed ? { error: { message: missing.length ? "도로명 주소와 도시를 입력하세요." : "저장 실패 예제입니다. 입력은 유지됩니다.", fieldIds: missing } } : {}) }}
      renderField={({ id, controlProps, guardChange }) => <TextField {...controlProps} value={values[id] ?? ""}
        onValueChange={guardChange((value: string) => { setValues(previous => ({ ...previous, [id]: value })); setFailed(false); })} />} />
    <Button onClick={() => setFailed(true)}>실패 상태 확인</Button>
    <Button tone="secondary" onClick={() => setLocked(!locked)}>{locked ? "그룹 잠금 해제" : "그룹 잠그기"}</Button>
    <Button tone="secondary" onClick={() => setReverse(!reverse)}>입력 순서 바꾸기</Button>
  </Stack>;
}
const meta = { id: "compositions-input-field-group", includeStories: ["Default", "Dark", "LargeText", "Rtl"], title: "실험/구성/입력과 작성/관련 입력 묶음", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
