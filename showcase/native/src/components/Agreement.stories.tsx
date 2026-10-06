import { useState } from "react";
import { Agreement } from "@hjmds/react-native/agreement";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";

import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/입력/약관 동의", component: NativeComponentPreview, args: { componentId: "agreement", variant: "default" }, parameters: { hjm: { componentIds: ["agreement"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Disabled: Story = { name: "비활성", render: () => <AgreementLockedPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function AgreementLockedPreview() {
  const [disabled, setDisabled] = useState(true);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set(['terms']));
  const [detail, setDetail] = useState('');
  return <Stack gap="md">
    <Text>제출 중 동의 변경만 잠급니다. 전문은 계속 읽을 수 있습니다.</Text>
    <Agreement descriptor={{ accessibilityLabel: '가입 약관', allLabel: '전체 동의', disabled, items: [
      {id:'terms',label:'서비스 이용약관',required:true,detail:{label:'이용약관 읽기'}},
      {id:'privacy',label:'개인정보 처리방침',required:true,detail:{label:'개인정보 처리방침 읽기'}},
    ] }} checkedIds={checked} onCheckedIdsChange={setChecked} onDetail={setDetail} requiredLabel="(필수)" optionalLabel="(선택)" />
    {detail ? <Text>{detail === 'terms' ? '이용약관 예시 본문' : '개인정보 처리방침 예시 본문'} — 실제 가입이나 동의 저장은 하지 않습니다.</Text> : null}
    <Button tone="secondary" onPress={() => setDisabled(!disabled)}>{disabled ? '동의 잠금 해제' : '동의 변경 잠그기'}</Button>
  </Stack>;
}
