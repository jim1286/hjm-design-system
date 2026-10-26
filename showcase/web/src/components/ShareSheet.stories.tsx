import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { ShareSheet, type ShareSheetRecipientStatus } from "@hjmds/react/share-sheet";

// ShareSheet (2026-10-26, generalized from BurnTok): recipients + copy link + OS share in one Sheet.
const labels = { close: "닫기", copyLink: "링크 복사", systemShare: "공유하기", linkCopied: "링크를 복사했어요", actionFailed: "공유하지 못했어요. 다시 시도해 주세요" };
const recipientLabels = {
  group: "보낼 사람 고르기", search: "이름 검색", clearSearch: "검색어 지우기", loading: "불러오는 중", loadFailed: "목록을 불러오지 못했어요", retry: "다시 시도",
  empty: "아직 보낼 사람이 없어요", noResults: "검색 결과가 없어요", sent: "보냄", sendFailed: "보내지 못했어요", send: (count: number) => `${count}명에게 보내기`,
};
const people = ["서연", "민준", "아주 긴 닉네임의 지우", "하린", "도윤", "수아"].map((name, index) => ({ id: `p${index}`, label: name }));
// Initial-letter face so the example needs no photo assets; products pass their own avatar.
const Face = ({ name }: { name: string }) => <span style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", background: "var(--hjm-color-surface-alt)" }}><Text variant="title">{name.slice(0, 1)}</Text></span>;

type PreviewProps = Readonly<{ state?: ShareSheetRecipientStatus | "external" }>;
function Preview({ state = "ready" }: PreviewProps) {
  const [open, setOpen] = useState(true);
  const [log, setLog] = useState("");
  const recipients = state === "external" ? undefined : {
    items: people.map(person => ({ ...person, image: <Face name={person.label} /> })),
    labels: recipientLabels,
    status: state,
    sentIds: ["p0"],
    onRetry: () => setLog("목록 다시 불러오기"),
    // The example delivers every recipient except 하린, to show the partial-failure retry.
    onSend: async (ids: readonly string[]) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const sentIds = ids.filter(id => id !== "p3");
      setLog(`${sentIds.length}명에게 보냄`);
      return sentIds.length === ids.length ? { sentIds } : { sentIds, error: "하린에게 보내지 못했어요" };
    },
  };
  return <Stack gap="sm">
    <Button onClick={() => setOpen(true)}>공유 시트 열기</Button>
    {log ? <Text tone="muted">{log}</Text> : null}
    <ShareSheet open={open} onOpenChange={setOpen} title="공유" labels={labels} link="https://example.com/c/demo" shareTitle="점심 룰렛"
      onSystemShare={outcome => setLog(outcome === "completed" ? "공유 시트를 닫음" : "공유 취소")} {...(recipients ? { recipients } : {})} />
  </Stack>;
}

const meta = { id: "components-overlays-share-sheet", title: "실험/컴포넌트/오버레이/공유 시트", component: Preview, args: { state: "ready" } } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const ExternalOnly: Story = { name: "외부 공유만", args: { state: "external" } };
export const Loading: Story = { name: "불러오는 중", args: { state: "loading" } };
export const Error: Story = { name: "오류", args: { state: "error" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
