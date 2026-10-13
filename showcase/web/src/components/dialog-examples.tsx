// Shared by the gallery and its focused interaction fixture; no catalog imports.
import { useId, useRef, useState } from "react";
import { Button as HjmButton } from "@hjmds/react/actions";
import { TextField as HjmTextField } from "@hjmds/react/forms";
import { Stack as HjmStack, Text as HjmText } from "@hjmds/react/layout";
import { AlertDialog as HjmAlertDialog, Dialog as HjmDialog } from "@hjmds/react/overlays";

export function DialogPreview() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState("주말 산책");
  // Keep the unsaved draft outside the portal so cancel/reopen can resume it.
  const [draft, setDraft] = useState(savedName);
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const formId = useId();
  const name = draft.trim();
  return <HjmStack>
    <HjmText>앨범 이름: {savedName}</HjmText>
    <HjmButton ref={trigger} onClick={() => { setMessage(""); setOpen(true); }}>이름 바꾸기</HjmButton>
    <p role="status">{message}</p>
    <HjmDialog open={open} onOpenChange={setOpen} initialFocusRef={input} returnFocusRef={trigger}
      title="앨범 이름 바꾸기" description="저장을 누르면 화면의 앨범 이름이 바뀌어요." closeLabel="이름 편집 닫기"
      footer={<><HjmButton tone="secondary" onClick={() => { setMessage("저장하지 않았어요. 입력한 이름은 다시 열어 수정할 수 있어요."); setOpen(false); }}>취소</HjmButton>
        <HjmButton type="submit" form={formId} disabled={!name || name === savedName}>저장</HjmButton></>}>
      <form id={formId} onSubmit={event => {
        event.preventDefault(); if (!name || name === savedName) return;
        setSavedName(name); setDraft(name); setMessage("이름을 저장했어요."); setOpen(false);
      }}>
        <HjmTextField ref={input} label="앨범 이름" value={draft} onChange={event => setDraft(event.target.value)}
          error={!name ? "이름을 입력해 주세요." : undefined} />
      </form>
    </HjmDialog>
  </HjmStack>;
}

export function AlertDialogPreview() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  return <HjmStack>
    <HjmText>{deleted ? "보관된 기록이 없어요." : "보관된 기록: 주말 산책"}</HjmText>
    <HjmButton ref={trigger} tone="secondary" onClick={() => {
      setMessage(""); if (deleted) setDeleted(false); else setOpen(true);
    }}>{deleted ? "예제 기록 다시 만들기" : "기록 삭제하기"}</HjmButton>
    <p role="status">{message}</p>
    <HjmAlertDialog open={open} returnFocusRef={trigger} onOpenChange={(next, detail) => {
      setOpen(next); if (!next && detail.reason !== "confirm") setMessage("삭제를 취소했어요. 기록은 그대로 남아 있어요.");
    }} request={{ mode: "confirm", tone: "danger", title: "주말 산책 기록을 삭제할까요?",
      description: "삭제하면 이 예제의 보관 목록에서 사라져요.", confirmLabel: "기록 삭제", cancelLabel: "취소",
      onConfirm: () => { setDeleted(true); setMessage("주말 산책 기록을 삭제했어요."); },
      fallbackErrorMessage: "기록을 삭제하지 못했어요. 다시 시도해 주세요.",
    }} />
    <HjmAlertDialog trigger={<button className="hjm-demo-button" type="button">설명 AlertDialog 열기</button>} request={{ mode: "confirm", tone: "info", title: "내 버전으로 만들까요?", description: "고치기 전에 이 항목을 내 보관함으로 한 벌 복사합니다.", confirmLabel: "내 버전 만들기", cancelLabel: "취소" }} />
  </HjmStack>;
}
