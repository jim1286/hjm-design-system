import { createActionSession } from "@hjmds/design-contracts/action-session";
import { ScrollView } from "react-native";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { DocumentResource } from "@hjmds/react-native/document-resource";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";
import type { DocumentPreviewState, DocumentSaveState } from "@hjmds/design-contracts/document-resource";
import { createDocumentResourceExample, documentResourceLabels, exampleDocumentText } from "../../shared/document-resource-example";
import { documentFileHostAvailable, exportExampleDocument } from "./document-resource-file-host";
function Demo() {
  const [example] = useState(() => createDocumentResourceExample(createActionSession, exportExampleDocument));
  const state = useSyncExternalStore(example.session.subscribe, example.session.getSnapshot, example.session.getSnapshot);
  const [file, setFile] = useState(1);
  const [preview, setPreview] = useState<DocumentPreviewState>({ status: "ready" });
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(false);
  useEffect(() => () => example.reset(), [example]);
  const name = `문서-예제-${file}.txt`;
  const save: DocumentSaveState = state.status === "pending" ? { status: "pending" }
    : state.status === "error" ? { status: "error", message: "문서를 내보내지 못했습니다. 다시 시도할 수 있습니다.", retryable: true }
    : state.value;
  return <ScrollView><Stack gap="md">
    <Text>자체 생성 TXT 파일을 공유합니다. 공유창을 연 것은 저장 완료나 취소 확인이 아닙니다.</Text>
    {!documentFileHostAvailable ? <Text>현재 개발 앱에는 파일 공유 기능이 없습니다.</Text> : null}
    <DocumentResource descriptor={{ id: name, name, disabled: !documentFileHostAvailable, formatLabel: "TXT", description: "자체 생성 문서 · 첫 시도는 실패 예제", preview, save }}
      labels={{ ...documentResourceLabels, started: "공유창을 열었습니다. 저장 여부는 선택한 앱에서 확인하세요." }} preview={expanded ? <Text>{exampleDocumentText}</Text> : <Text>HJM 문서 예제</Text>}
      onPreview={() => setExpanded(!expanded)} onRetryPreview={() => setPreview({ status: "ready" })}
      onSave={() => { void example.save(name); }} onRetrySave={() => { void example.retry(); }}
      moreAction={<Button tone="ghost" onPress={() => setDetails(!details)}>{details ? "문서 정보 닫기" : "문서 정보"}</Button>} />
    {details ? <Text>현재 파일: {name}. 실제 개인 자료나 서버 요청은 없습니다.</Text> : null}
    <Button tone="secondary" onPress={() => { example.reset(); setFile(value => value + 1); setExpanded(false); setDetails(false); }}>다른 문서로 바꾸기</Button>
    <Button tone="secondary" onPress={() => setPreview({ status: "error", message: "미리보기 오류 예제입니다.", retryable: true })}>미리보기 실패 확인</Button>
    <Button tone="secondary" onPress={() => setPreview({ status: "none" })}>미리보기 없는 문서</Button>
    <Button tone="secondary" onPress={() => { example.reset(); example.failNext(); }}>내보내기 실패 다시 설정</Button>
  </Stack></ScrollView>;
}
const meta = { title: "실험/구성/정보 표시/문서와 파일", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
