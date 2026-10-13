// Keep these interactive examples independent of the full component catalog.
import { useRef, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Dialog, AlertDialog } from "@hjmds/react-native/overlays";
import { Text } from "@hjmds/react-native/primitives";

function StoryFrame({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

export function DialogExample() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState("주말 산책");
  // The example owns its draft outside the modal so dismissing does not lose input.
  const [draft, setDraft] = useState(savedName);
  const [message, setMessage] = useState("");
  const trigger = useRef<View>(null);
  const name = draft.trim();
  return <StoryFrame>
    <Text>앨범 이름: {savedName}</Text>
    <Button ref={trigger} onPress={() => { setMessage(""); setOpen(true); }}>이름 바꾸기</Button>
    {message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); }} returnFocusRef={trigger}
      title="앨범 이름 바꾸기" description="저장을 누르면 화면의 앨범 이름이 바뀌어요."
      closeLabel="이름 편집 닫기"
      primaryAction={{ label: "저장", disabled: !name || name === savedName, onPress: () => {
        setSavedName(name); setDraft(name); setMessage("이름을 저장했어요.");
      } }}
      secondaryAction={{ label: "취소", tone: "secondary", onPress: () => setMessage("저장하지 않았어요. 입력한 이름은 다시 열어 수정할 수 있어요.") }}>
      <TextField label="앨범 이름" value={draft} onValueChange={setDraft}
        {...(!name ? { error: "이름을 입력해 주세요." } : {})} />
    </Dialog>
  </StoryFrame>;
}

export function AlertDialogExample() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [message, setMessage] = useState("");
  const trigger = useRef<View>(null);
  return <StoryFrame>
    <Text>{deleted ? "보관된 기록이 없어요." : "보관된 기록: 주말 산책"}</Text>
    <Button ref={trigger} tone="secondary" onPress={() => {
      setMessage("");
      if (deleted) setDeleted(false); else setOpen(true);
    }}>{deleted ? "예제 기록 다시 만들기" : "기록 삭제하기"}</Button>
    {message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}
    <AlertDialog open={open} onOpenChange={setOpen} returnFocusRef={trigger}
      onResult={(result) => { if (result.outcome === "cancelled") setMessage("삭제를 취소했어요. 기록은 그대로 남아 있어요."); }}
      request={{ mode: "confirm", tone: "danger", title: "주말 산책 기록을 삭제할까요?",
        description: "삭제하면 이 예제의 보관 목록에서 사라져요.", confirmLabel: "기록 삭제", cancelLabel: "취소",
        onConfirm: () => { setDeleted(true); setMessage("주말 산책 기록을 삭제했어요."); },
        fallbackErrorMessage: "기록을 삭제하지 못했어요. 다시 시도해 주세요.",
      }} />
  </StoryFrame>;
}
