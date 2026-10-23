import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { RotateCcw } from "lucide-react-native";
import { useState } from "react";
import type { StepsPresentation } from "@hjmds/design-contracts/components/steps";
import { Steps } from "@hjmds/react-native/steps";
import { Button, IconButton } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Stack, Text } from "@hjmds/react-native/primitives";

const items = [{ id: "name", label: "기본 정보" }, { id: "interests", label: "취향 선택" }, { id: "review", label: "확인" }];
const labels = { pending: "예정", current: "진행 중", complete: "완료", error: "입력을 확인해 주세요" };
const name = ({ position, total, label }: { position: number; total: number; label: string }) => `${total}단계 중 ${position}단계, ${label}`;

/** A real controlled draft demonstrates revisit/preservation; vertical supplies only its active content slot. */
export function StepsPresentationPreview({ presentation = "focus", initialError = false }: { presentation?: StepsPresentation; initialError?: boolean }) {
  const { colors } = useHjmNativeTheme();
  const [index, setIndex] = useState(1);
  const [values, setValues] = useState(["지민", initialError ? "" : "디자인과 일상"]);
  const [error, setError] = useState(initialError);
  const [finished, setFinished] = useState(false);
  const go = (next: number) => { setIndex(next); setError(false); setFinished(false); };
  const next = () => {
    if (index < 2 && !values[index]?.trim()) { setError(true); return; }
    if (index === 2) setFinished(true); else go(index + 1);
  };
  const body = () => <Stack gap="md">
    <Text variant="title">{finished ? "준비됐어요" : index === 0 ? "어떻게 불러드릴까요?" : index === 1 ? "어떤 이야기를 좋아하세요?" : "이대로 시작할까요?"}</Text>
    {finished ? <Text>프로필 설정을 마쳤어요.</Text> : index < 2 ? <TextField label={index === 0 ? "이름" : "관심 주제"} value={values[index]!}
      onValueChange={value => setValues(previous => previous.map((item, position) => position === index ? value : item))} /> : <Text>{values.join(" · ")}</Text>}
    {error ? <Text tone="danger">빈칸을 입력해 주세요. 입력한 다른 내용은 유지돼요.</Text> : null}
    <Stack axis="inline" gap="sm">
      {finished ? <IconButton label="다시 살펴보기" tone="secondary" onPress={() => go(0)}><RotateCcw size={20} color={colors.text} accessible={false} /></IconButton> : <>
        <Button tone="secondary" disabled={index === 0} onPress={() => go(index - 1)}>이전</Button>
        <Button onPress={next}>{index === 2 ? "완료하기" : "다음으로"}</Button>
      </>}
    </Stack>
  </Stack>;
  return <Stack gap="lg" layoutStyle={{ maxWidth: 560, width: "100%" }}>
    <Text tone="muted" variant="caption">프로필 만들기</Text>
    <Steps presentation={presentation} overviewLabel="전체 단계" descriptor={{ steps: items, currentStepId: items[index]!.id, currentStepStatus: finished ? "complete" : error ? "error" : "current" }}
      statusLabels={labels} composeAccessibleName={name} onStepPress={id => go(items.findIndex(item => item.id === id))}
      {...(presentation === "vertical" ? { renderStepContent: body } : {})} />
    {presentation === "vertical" ? null : body()}
  </Stack>;
}
