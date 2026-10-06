import { createActionSession } from "@hjmds/design-contracts/action-session";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocumentResource } from "@hjmds/react/document-resource";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import type { DocumentPreviewState, DocumentSaveState } from "@hjmds/design-contracts/document-resource";
import { createDocumentResourceExample, documentResourceLabels, exampleDocumentText } from "../../../shared/document-resource-example";
async function exportDocument(name: string, body: string): Promise<DocumentSaveState> {
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  // Give the browser download task time to consume the URL; click is not a save receipt.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { status: "started" };
}
function Demo() {
  const [example] = useState(() => createDocumentResourceExample(createActionSession, exportDocument));
  const state = useSyncExternalStore(example.session.subscribe, example.session.getSnapshot, example.session.getSnapshot);
  const [file, setFile] = useState(1);
  const [longName, setLongName] = useState(false);
  const [preview, setPreview] = useState<DocumentPreviewState>({ status: "ready" });
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(false);
  useEffect(() => () => example.reset(), [example]);
  const name = longName ? `${"분기별_검토_".repeat(6)}document-resource-${file}.txt` : `문서-예제-${file}.txt`;
  const save: DocumentSaveState = state.status === "pending" ? { status: "pending" }
    : state.status === "error" ? { status: "error", message: "예시 실패입니다. 같은 문서를 다시 내보낼 수 있습니다.", retryable: true }
    : state.value;
  return <Stack gap="md">
    <Text>브라우저에서 자체 생성 텍스트 파일을 다운로드합니다. 시작 안내는 저장 완료를 뜻하지 않습니다.</Text>
    <DocumentResource descriptor={{ id: name, name, formatLabel: "TXT", description: "자체 생성 문서 · 첫 시도는 실패 예제", preview, save }}
      labels={documentResourceLabels} preview={expanded ? <Text>{exampleDocumentText}</Text> : <Text>HJM 문서 예제</Text>}
      onPreview={() => setExpanded(!expanded)} onRetryPreview={() => setPreview({ status: "ready" })}
      onSave={() => { void example.save(name); }} onRetrySave={() => { void example.retry(); }}
      moreAction={<Button tone="ghost" onClick={() => setDetails(!details)}>{details ? "문서 정보 닫기" : "문서 정보"}</Button>} />
    {details ? <Text>현재 파일: {name}. 실제 개인 자료나 서버 요청은 없습니다.</Text> : null}
    <Button tone="secondary" onClick={() => { example.reset(); setFile(value => value + 1); setExpanded(false); setDetails(false); }}>다른 문서로 바꾸기</Button>
    <Button tone="secondary" onClick={() => setPreview({ status: "error", message: "미리보기 오류 예제입니다.", retryable: true })}>미리보기 실패 확인</Button>
    <Button tone="secondary" onClick={() => { example.reset(); setLongName(!longName); }}>{longName ? "짧은 파일명으로 복원" : "긴 파일명 확인"}</Button>
    <Button tone="secondary" onClick={() => setPreview({ status: "loading" })}>미리보기 준비 중 확인</Button>
    <Button tone="secondary" onClick={() => setPreview({ status: "none" })}>미리보기 없는 문서</Button>
    <Button tone="secondary" onClick={() => { example.reset(); example.failNext(); }}>내보내기 실패 다시 설정</Button>
  </Stack>;
}
const meta = { id: "compositions-information-document-resource", includeStories: ["Default", "Dark", "LargeText", "Rtl"], title: "실험/구성/정보 표시/문서와 파일", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
