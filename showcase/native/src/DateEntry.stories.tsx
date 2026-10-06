import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { DateEntry } from "@hjmds/react-native/date-entry";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { resolveDateEntryDraft, type DateEntryDraft, type DateEntryOrder } from "@hjmds/design-contracts/date-entry";
import { parseExampleDate, dateEntryLabels, dateEntryIssueText } from "../../shared/date-entry-example";
function Demo() {
  const [value, setValue] = useState<DateEntryDraft>({ year: "", month: "", day: "" });
  const [order, setOrder] = useState<DateEntryOrder>(["year", "month", "day"]);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState("");
  // The example owns screen scrolling; the reusable field must not create a nested scroll view.
  return <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={{ paddingBottom: spacing.xl }}><Stack gap="md">
    <Text>날짜를 직접 입력하고 확인합니다. 월은 숫자 또는 영어 이름으로 입력할 수 있습니다. 서버에 저장하지 않는 예제입니다.</Text>
    <DateEntry value={value} onValueChange={next => { setValue(next); setResult(""); }}
      order={order} labels={dateEntryLabels} parse={parseExampleDate} formatIssue={dateEntryIssueText}
      required showErrors={showErrors} description={`예: ${order.map(part => ({ year: "2024", month: "Feb", day: "29" })[part]).join(" / ")}`} />
    <Button onPress={() => { setShowErrors(true); const resolved = resolveDateEntryDraft({ draft: value, order, required: true, parse: parseExampleDate }); setResult(resolved.value ?? ""); }}>날짜 확인</Button>
    <Button tone="secondary" onPress={() => setOrder(order[0] === "year" ? ["day", "month", "year"] : ["year", "month", "day"])}>입력 순서 바꾸기</Button>
    <Text accessibilityLiveRegion="polite">{result ? `확인한 날짜: ${result}` : "아직 확인하지 않았습니다."}</Text>
  </Stack></ScrollView>;
}
const meta = { title: "실험/구성/입력과 작성/날짜 직접 입력", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
