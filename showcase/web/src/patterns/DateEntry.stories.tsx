import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateEntry } from "@hjmds/react/date-entry";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { resolveDateEntryDraft, type DateEntryDraft, type DateEntryOrder } from "@hjmds/design-contracts/date-entry";
import { parseExampleDate, dateEntryLabels, dateEntryIssueText, dateEntryExampleDescription } from "../../../shared/date-entry-example";
function Demo() {
  const [value, setValue] = useState<DateEntryDraft>({ year: "", month: "", day: "" });
  const [order, setOrder] = useState<DateEntryOrder>(["year", "month", "day"]);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState("");
  return <Stack gap="md">
    <DateEntry value={value} onValueChange={next => { setValue(next); setResult(""); }}
      order={order} labels={dateEntryLabels} parse={parseExampleDate} formatIssue={dateEntryIssueText}
      required showErrors={showErrors} description={dateEntryExampleDescription(order)} />
    <Button onClick={() => { setShowErrors(true); const resolved = resolveDateEntryDraft({ draft: value, order, required: true, parse: parseExampleDate }); setResult(resolved.value ?? ""); }}>날짜 확인</Button>
    <Text role="status">{result ? `확인한 날짜: ${result}` : "아직 확인하지 않았습니다."}</Text>
    <PreviewTools><PreviewToolButton selected={order[0] === "day"} onClick={() => setOrder(order[0] === "year" ? ["day", "month", "year"] : ["year", "month", "day"])}>입력 순서 바꾸기</PreviewToolButton></PreviewTools>
  </Stack>;
}
const meta = { id: "compositions-input-date-entry", includeStories: ["Default", "Dark", "LargeText", "Rtl"], title: "배포/구성/입력과 작성/날짜 직접 입력", component: Demo, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
