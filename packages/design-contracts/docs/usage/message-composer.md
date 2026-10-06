# MessageComposer 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합](../screen-patterns.md) (supplemental)

## 언제 쓰나

채팅·DM·댓글 입력창에 쓴다. 1~5줄로 자라는 TextArea와 전송 버튼, 선택적으로 사진 첨부 미리보기,
답장 대상 표시, 첨부 버튼을 하나로 조합한다. 값은 완전 제어형이고 HJM은 초안을 지우지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 폼의 여러 줄 입력 | [TextArea](text-area.md) |
| @멘션 자동완성 입력 | [Mentions](mentions.md) |
| 채팅 화면 전체 틀(타임라인 + 작성창 자리) | [ChatScreen](chat-screen.md)의 `composer` 슬롯에 이 컴포넌트를 넣는다 |
| 댓글 화면 전체 | [CommentThreadScreen](comment-thread-screen.md)의 `composer` 슬롯 |
| 키보드 위에 붙이기 | [KeyboardDock](keyboard-dock.md) 등 keyboard 계열과 합성 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `MessageComposer` | `/screens` | `/screens` | supplemental, 루트 barrel에 없음 |

`@hjmds/react/screens`, `@hjmds/react-native/screens`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { MessageComposer } from "@hjmds/react/screens";

<MessageComposer
  label={t("chat.input")}
  sendLabel={t("chat.send")}
  value={draft}
  onValueChange={setDraft}
  pending={sending}
  onSend={async (text) => { const ok = await send(text, photos); if (ok) { setDraft(""); setPhotos([]); } }}
/>
```

```tsx
// Native
import { MessageComposer } from "@hjmds/react-native/screens";

<MessageComposer
  label={t("chat.input")}
  sendLabel={t("chat.send")}
  value={draft}
  onValueChange={setDraft}
  pending={sending}
  sendIcon={<ArrowUpIcon />}
  sendPresentation="circle"
  attachmentAction={{ label: t("chat.attachPhoto"), icon: <PhotoIcon />, onPress: openPhotoSource }}
  attachments={photos.map((p) => ({ id: p.id, preview: <Image source={{ uri: p.uri }} />, removeLabel: t("chat.removePhoto") }))}
  onRemoveAttachment={removePhoto}
  onSend={sendDraft}
/>
```

## 축과 기본값

- 전송 가능 조건: `disabled`·`pending`·`sendDisabled`가 아니고, 글(공백 제외)·첨부·`additionalContent` 중 하나가 있을 때.
- `pending` 또는 `disabled`이면 입력·첨부·삭제·답장 취소가 모두 잠긴다. `sendDisabled`는 전송만 막고 편집은 열어 둔다.
- `sendIcon`을 주면 아이콘 모드: 빈 입력에서는 입력창 안에 `attachmentAction`을, 내용이 있으면 전송 아이콘을 보인다. 생략하면 텍스트 전송 버튼.
- `sendPresentation`: `inline`(기본) · `circle`(primary 원형 버튼, 댓글·DM 레퍼런스).
- `replyTo={{ author, excerpt, cancelLabel, onCancel }}`는 답장 대상을 입력창 위에 표시한다. `context`는 그 위 임의 슬롯이다.
- `maxLength`, `leadingAction`(입력창 앞 도구), `inputRef`(답글 선택 후 포커스 유지)를 받는다.

## 꼭 지킬 것

- 문구(`label`은 placeholder 겸 접근성 이름, `sendLabel`, `removeLabel`, `cancelLabel`)는 모두 i18n 키로 넣는다.
- `onSend(value)`는 현재 문자열만 넘긴다. 첨부 목록은 제품 상태에서 읽고, **서버 성공 뒤에만** 제품이 글·첨부·답장 대상을 지운다.
- 첨부 `id`는 비어 있지 않고 유일해야 하며 `removeLabel`이 필요하다. 첨부가 있으면 `onRemoveAttachment`가 필수다. 어기면 던진다.
- 사진 권한·선택기·업로드·개수 제한은 제품 소유다. 출처 선택 UI는 [PhotoSourceSheet](photo-source-sheet.md)를 쓴다.
- Enter는 줄바꿈이다(IME 조합 보호). Enter 전송을 덧붙이지 않는다.
- 스타일 통로가 없다. 배치는 감싸는 레이아웃에서 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `inputRef` 타입 | `HTMLTextAreaElement` | `TextInput` |
| 첨부 목록 | CSS 클래스 `hjm-message-composer__attachments` | 가로 ScrollView |
| 이벤트 이름 | `attachmentAction.onPress`(내부에서 onClick으로 연결) | `onPress` |
