import { useState } from "react";
import { spacing } from "@hjmds/design-contracts/foundations";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";
import { SegmentedControl } from "@hjmds/react/selection";
export function TextureComparisonPreview() {
  const [strength, setStrength] = useState("subtle");
  const [lastAction, setLastAction] = useState("");
  // Equal intensity makes the two masks comparable. Strong is a stress case,
  // not a recommendation to place product text over high-contrast decoration.
  const content = <Stack gap="lg">
    <Text>같은 배경과 강도에서 반복 점과 불규칙 질감을 비교해요.</Text>
    <SegmentedControl label="질감 강도" items={[{value:"subtle",label:"기본 22%"},{value:"strong",label:"비교 60%"}]} value={strength} onValueChange={setStrength} />
    {([{layer:"grain",label:"반복 점"},{layer:"noise",label:"불규칙 질감"}] as const).map(item => <EffectSurface key={item.layer} descriptor={{ layers:[item.layer], intensity:strength === "subtle" ? 0.22 : 0.6, seed:"texture-comparison", active:false }}>
      <div style={{padding:spacing.lg}}><Stack gap="md">
        <Text variant="title">{item.label}</Text><Text>배경이 달라도 이 문장을 읽고 입력할 수 있어야 해요.</Text>
        <TextField label={`${item.label} 메모`} />
        <Button tone="secondary" onClick={()=>setLastAction(item.label)}>{item.label} 선택</Button>
      </Stack></div>
    </EffectSurface>)}
    <Text role="status">{lastAction ? `${lastAction}에서 눌렀어요.` : "각 배경 안의 입력과 버튼을 확인하세요."}</Text>
    <Text>정적 타일 비교이며 원본 SVG 필터와 픽셀·성능이 같다는 뜻은 아니에요.</Text>
  </Stack>;
  return content;
}
