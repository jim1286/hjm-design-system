# MessageComposer

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/입력과 작성/메시지 작성`, `배포/구성/입력과 작성/댓글 작성`, `배포/화면/소통/채팅`

## 언제 쓰나

채팅·DM·댓글 입력창에 쓴다. 1~5줄로 자라는 TextArea와 전송 버튼, 선택적으로 사진 첨부 미리보기,
답장 대상 표시, 첨부 버튼을 하나로 조합한다. 값은 완전 제어형이고 HJM은 초안을 지우지 않는다.

용도별 조합은 [댓글 작성](../compositions/purpose-input-comment.md)과 [메시지 작성](../compositions/purpose-input-message.md)을 먼저 선택한다. 입력·전송 엔진은 같고 답글·첨부·문구만 목적에 맞게 연결한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 폼의 여러 줄 입력 | [TextArea](text-area.md) |
| @멘션 자동완성 입력 | [Mentions](mentions.md) |
| 채팅 화면 전체 틀(타임라인 + 작성창 자리) | [ChatScreen](chat-screen.md)의 `composer` 슬롯에 이 컴포넌트를 넣는다 |
| 댓글 화면 전체 | [CommentThreadScreen](comment-thread-screen.md)의 `composer` 슬롯 |
| 키보드 위에 붙이기 | [KeyboardDock](keyboard-dock.md) 등 keyboard 계열과 합성 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `MessageComposer` | supplemental, 루트 barrel에 없음 | `/screens` | `/screens` |

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
import { Image } from "react-native";

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | 필수 | 완전 제어형. HJM은 초안을 지우지 않는다 |
| `label` | `string` | 필수 | placeholder 겸 접근성 이름 |
| `sendLabel` | `string` | 필수 | 전송 버튼 문구·접근성 이름 |
| `onValueChange` | `(value: string) => void` | 필수 | 입력 변경 |
| `onSend` | `(value: string) => void` | 필수 | 현재 문자열만 넘긴다 |
| `disabled` · `pending` | `boolean` | `false` | 둘 중 하나면 입력·첨부·삭제·답장 취소가 모두 잠긴다. `pending`은 전송 버튼 loading |
| `sendDisabled` | `boolean` | `false` | 전송만 막고 편집은 열어 둔다 |
| `additionalContent` | `boolean` | `false` | 글·첨부 밖에 보낼 내용이 있으면 `true`. 전송 가능 판정에 더한다 |
| `maxLength` | `number` | 없음 | 입력 최대 글자 수 |
| `leadingAction` | `ReactNode` | 없음 | 입력 테두리 **안** 글자 앞 시작 쪽 도구 버튼. 자라는 입력의 세로 가운데에 맞춘다(Web `.hjm-field__leading` `align-self: center`, Native `alignSelf: "center"`). 행동이라 흐린 affix 색을 쓰지 않는다 |
| `inputRef` | Web `Ref<HTMLTextAreaElement>` · Native `Ref<TextInput>` | 없음 | 답글 선택 뒤 포커스 유지 |
| `context` | `ReactNode` | 없음 | 답장 대상 위 임의 슬롯 |
| `replyTo` | `{ author, excerpt, cancelLabel, onCancel() }` | 없음 | 입력창 위 답장 대상과 취소 버튼 |
| `sendIcon` | `ReactNode` | 없음 | 주면 아이콘 모드: 빈 입력에서는 입력창 안에 `attachmentAction`, 내용이 있거나 `pending`이면 전송 아이콘. 없으면 입력창 옆 텍스트 `Button` |
| `sendPresentation` | `"inline"` · `"circle"` | `"inline"` | `circle`은 primary 원형 `IconButton size="small"`(댓글·DM 레퍼런스). `sendIcon`이 있을 때만 의미가 있다 |
| `attachmentAction` | `{ label, icon, onPress(), disabled? }` | 없음 | 첨부 버튼(ghost `IconButton`) |
| `attachments` | `readonly { id, removeLabel, preview }[]` | `[]` | 첨부 미리보기. 있으면 `onRemoveAttachment` 필수 |
| `onRemoveAttachment` | `(id: string) => void` | 없음 | 첨부 제거 |
| Web `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 작성창 루트 배치(margin·width·flex 등). 미게시(1.12.1 이후) |

전송 가능 조건: `disabled`·`pending`·`sendDisabled`가 아니고, 글(공백 제외)·첨부·`additionalContent` 중 하나가 있을 때(`canSubmitMessage`).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 입력 `composerMinLines` 1 ~ `composerMaxLines` 5줄(넘으면 입력 안에서 스크롤), `shape="large"`; 첨부 썸네일 `attachmentSize` 80(radius `radius.md`); 제거 버튼은 `IconButton size="small"` 36 + 사방 hit 4(실제 타깃 44), 그 안 보이는 원 `attachmentRemoveSize` 24; circle 전송은 `IconButton size="small"` 36 | `screen-patterns.ts`, `icon-button-recipe.ts` `sizes.small`, Web `styles.css`, Native `MessageComposer` |
| 간격 | 세로 묶음(context·답장 대상·첨부·입력 줄) 사이와 입력–텍스트 전송 버튼 사이 `screenPatternRecipe.itemGap`(`spacing.sm` 12, 두 플랫폼. 2026-10-06까지 Web은 8, 1.12.1 이후 미게시); 답장 대상 줄·첨부 사이 `spacing.sm` 12; circle 전송은 입력 글자와 `spacing.sm` 12, 오른쪽 끝 8 | `screenPatternRecipe.itemGap`, Web `.hjm-message-composer`·`__row`(`--hjm-message-composer-gap`), Native `Stack gap="sm"`·`itemGap` |
| 순서·정렬 | `context` → 답장 대상(작성자·발췌 → 취소) → 첨부 썸네일(→ 첨부 버튼) → 입력·전송 한 줄, 전송은 입력 아래쪽(`flex-end`)에 맞춘다. 입력 줄 안은 `leadingAction` → 글자 → (아이콘 모드) 전송/첨부 | 렌더 순서, Web `forms.tsx` `hjm-field__leading` |
| 고정·스크롤 | 자체 고정 없음: 화면 composer 슬롯(footer)에 넣는다; 첨부는 가로 스크롤; 키보드 adapter는 host 하나만 | ChatScreen·CommentThreadScreen `composer` |
| 좁은 폭·큰 글자 | 입력이 남은 폭을 채우고(`flex: 1`, 최소 폭 0) 전송 버튼은 줄지 않는다; 큰 글자에서도 5줄 상한 뒤 입력 안 스크롤로 기록을 가리지 않는다 | Web `.hjm-message-composer__row`, Native `layoutStyle={{ flex: 1 }}` |

## 꼭 지킬 것

- 문구(`label`은 placeholder 겸 접근성 이름, `sendLabel`, `removeLabel`, `cancelLabel`)는 모두 i18n 키로 넣는다.
- `onSend(value)`는 현재 문자열만 넘긴다. 첨부 목록은 제품 상태에서 읽고, **서버 성공 뒤에만** 제품이 글·첨부·답장 대상을 지운다.
- 첨부 `id`는 비어 있지 않고 유일해야 하며 `removeLabel`이 필요하다. 첨부가 있으면 `onRemoveAttachment`가 필수다. 어기면 던진다.
- 사진 권한·선택기·업로드·개수 제한은 제품 소유다. 출처 선택 UI는 [PhotoSourceSheet](photo-source-sheet.md)를 쓴다.
- Enter는 줄바꿈이다(IME 조합 보호). Enter 전송을 덧붙이지 않는다.
- Web 배치는 `layoutStyle`로 한다. Native는 스타일 통로가 없어 감싸는 레이아웃에서 배치한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `inputRef` 타입 | `HTMLTextAreaElement` | `TextInput` |
| 첨부 목록 | CSS 클래스 `hjm-message-composer__attachments` | 가로 ScrollView |
| 이벤트 이름 | `attachmentAction.onPress`(내부에서 onClick으로 연결) | `onPress` |
| 배치 prop | `layoutStyle`(루트) | 없음 |


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.
