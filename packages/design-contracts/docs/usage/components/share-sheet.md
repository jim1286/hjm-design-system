# ShareSheet

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.47.0 이후)
- 검토일: 2026-10-26
- 근거: `src/share-sheet.ts`의 `shareSheetRecipe`·`resolveShareSheetSendOutcome`·`filterShareSheetRecipients`; Web `src/share-sheet.tsx`, Native `src/share-sheet.tsx`
- 스토리북: `실험/컴포넌트/오버레이/공유 시트`

## 언제 쓰나

링크 하나를 **앱 안의 받는 사람에게 보내거나(선택), 링크를 복사하거나, 기기 공유 시트로 내보내는** 공유 시트에 쓴다. 단톡방에 보내기·팔로잉에게 DM 보내기처럼 앱 안 대상이 있으면 `recipients`를 주고, 외부 공유만 있으면 생략한다. Sheet·ImageChoiceGroup·버튼을 제품에서 다시 조립하지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 링크 없이 값 하나만 복사 | `ClipboardButton`·`ClipboardIconButton`(Web) |
| 받는 사람을 고른 뒤 대화방을 새로 만들거나 초대하는 흐름 | `ChatRoomCreate`·`ChatRoomInvite` |
| 사진·파일 원본을 보내기 | 제품 업로드 흐름 + 기기 공유 |
| 공유 외 여러 행동이 섞인 메뉴 | `Menu` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ShareSheet` | 기본. 공유 시트 | `@hjmds/react/share-sheet` | `@hjmds/react-native/share-sheet` |
| `ShareSheetProps`, `ShareSheetRecipients`, `ShareSheetRecipient`, `ShareSheetRecipientSearch` | 보조. 타입 | `@hjmds/react/share-sheet` | `@hjmds/react-native/share-sheet` |
| `shareSheetRecipe`, `resolveShareSheetSendOutcome`, `filterShareSheetRecipients`, `resolveShareSheetPickerValue`, `validateShareSheet` | 보조. 배치 값·보내기 결과 규칙 | `@hjmds/design-contracts/share-sheet` | 같음 |

## 최소 사용 예

```tsx
// Web
import { ShareSheet } from "@hjmds/react/share-sheet";

<ShareSheet open={open} onOpenChange={setOpen} title={t("share.title")} link={url} shareTitle={room.name}
  labels={{ close: t("common.close"), copyLink: t("share.copyLink"), systemShare: t("share.shareTo"), linkCopied: t("share.linkCopied"), actionFailed: t("share.failed") }}
  onLinkCopied={() => track("share", { method: "copy_link" })}
  recipients={{
    items: chats.map(chat => ({ id: chat.id, label: chat.name, image: <Avatar name={chat.name} decorative /> })),
    labels: recipientLabels, status: chatsQuery.isError ? "error" : chatsQuery.isLoading ? "loading" : "ready", onRetry: () => void chatsQuery.refetch(),
    onSend: async ids => sendToChats(ids, url),   // { sentIds, error? }
  }} />
```

```tsx
// Native
import * as Clipboard from "expo-clipboard";
import { ShareSheet } from "@hjmds/react-native/share-sheet";

<ShareSheet open={open} onOpenChange={setOpen} title={t("share.title")} link={url} shareTitle={drop.title} labels={labels}
  copyLink={async link => { if (!(await Clipboard.setStringAsync(link))) throw new Error("clipboard"); }}
  icons={{ copyLink: <Link size={24} color={colors.text} />, systemShare: <Share size={24} color={colors.text} /> }}
  recipients={{ items: following.map(user => ({ id: user.id, label: user.nickname, image: <UserAvatar user={user} /> })), labels: recipientLabels,
    onSend: async ids => sendDirectMessages(ids) }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `open`·`onOpenChange` | `boolean` · `(open: boolean, detail: { reason }) => void` | 필수 | 제어형. 닫히면 선택·보낸 표시·검색어·안내가 처음으로 돌아간다 |
| `title` | `string` | 필수 | 시트 제목. Native Android 기기 공유 선택창 제목으로도 쓴다 |
| `labels` | `{ close, copyLink, systemShare, linkCopied, actionFailed }` | 필수 | 지역화 문구. 빈 문자열이면 `TypeError` |
| `link` | `string` | 필수 | 복사·공유할 URL. 바뀌면 이전 "복사함" 안내를 지운다 |
| `shareTitle`·`shareText` | `string` | — | 기기 공유 시트에 링크와 함께 넘기는 제목·문구 |
| `copyLink` | Web `((link: string) => Promise<void>) \| false` · Native `((link: string) => Promise<void>) \| null` | Web `navigator.clipboard.writeText` · Native 필수 | 링크 복사. Web `false`·Native `null`이면 복사 행동을 숨긴다. 거부되면 실패 안내를 보인다 |
| `systemShare` | Web `((content) => Promise<void>) \| false` · Native `((content) => Promise<"completed" \| "dismissed">) \| false` | Web `navigator.share`(없는 브라우저는 숨김) · Native `Share.share` | 기기 공유. `false`면 숨긴다. iOS 미리보기용 제품 모듈 등으로 바꿀 수 있다. `content`는 `{ url, title?, text? }` |
| `onLinkCopied` | `() => void` | — | 복사가 끝난 뒤. 분석 기록용 |
| `onSystemShare` | `(outcome: "completed" \| "dismissed") => void` | — | 기기 공유 시트가 닫힌 뒤. `completed`도 전달 확인이 아니다 |
| `icons` | Web `{ copyLink?, systemShare? }` · Native `{ copyLink, systemShare }` | Web HJM `copy`·`share` 아이콘 · Native 필수 | 두 원형 행동의 그림 |
| `recipients` | 아래 표 | — | 앱 안 받는 사람. 없으면 외부 공유만 |
| `notice` | `ReactNode` | — | 본문 맨 위 제품 안내(보내기 보상 등) |

| `recipients` 필드 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `{ id, label, image, description?, disabled? }[]` | 필수 | 받는 사람. id 중복·빈 이름이면 `TypeError` |
| `labels` | `{ group, search, clearSearch, loading, loadFailed, retry, empty, noResults, sent, sendFailed, send(count) }` | 필수 | 지역화 문구. `send`는 개수를 받아 버튼 문구를 만든다 |
| `status` | `"ready"` · `"loading"` · `"error"` | `"ready"` | 목록 상태. `error`면 `onRetry`가 있을 때 다시 시도 버튼을 붙인다 |
| `onRetry`·`retrying` | `() => void` · `boolean` | — | 불러오기 다시 시도와 그 진행 표시 |
| `search` | `{ query?, onQueryChange?, searching? }` | — | 생략하면 이름으로 이 안에서 거른다. `onQueryChange`를 주면 제품이 검색어와 결과 `items`를 맡는다(서버 검색) |
| `sentIds` | `readonly string[]` | `[]` | 시트를 열기 전에 이미 보낸 받는 사람. 체크된 채 잠긴다 |
| `onSend` | `(ids: readonly string[]) => Promise<{ sentIds; error? }>` | 필수 | 고른 사람에게 보낸다. `sentIds`는 잠기고 나머지는 선택된 채 남는다. `error`가 없으면 `labels.sendFailed`를 보인다. 요청하지 않은 id를 돌려주면 `TypeError` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 받는 사람이 있으면 Sheet `size="large"`(Native는 본문 스크롤), 없으면 `auto`. 원형 행동 IconButton `large`(지름 52) `secondary`, 보내기 Button `large` `primary` 가득 폭 | `shareSheetRecipe.size`·`actionButton`·`sendButton` |
| 간격 | 본문 영역 사이 `spacing.md` 16, footer의 보내기–행동 줄 `spacing.xs` 8, 두 원형 행동 사이 `spacing.xxxl` 40, 버튼–글자 `spacing.xs` 8 | `shareSheetRecipe.bodyGap`·`footerGap`·`actionGap`·`actionCaptionGap` |
| 순서·정렬 | 본문: 제품 `notice` → 보내기 오류 → 복사·공유 안내 → 검색 → 목록(또는 불러오는 중·오류·빈 상태). footer: 보내기 버튼(고른 사람이 있을 때만) → 가운데 정렬 [링크 복사][공유하기], 각 버튼 아래 caption 글자 | 두 렌더러 |
| 고정·스크롤 | footer는 Sheet가 고정하고 본문만 스크롤한다. 받는 사람은 ImageChoiceGroup 타일(이름 2줄) | Sheet footer, `shareSheetRecipe.picker` |
| 좁은 폭·큰 글자 | 타일은 폭에 맞춰 줄바꿈하고 크기는 유지한다. 두 원형 행동은 한 줄 가운데에 둔다 | ImageChoiceGroup |

```text
┌──────────────────────────────┐
│ ─── 공유                     │ ← Sheet 머리(끌어서 닫기)
├──────────────────────────────┤ ← 본문(스크롤)
│ [제품 안내]                  │
│ [보내기 오류 / 링크 복사 안내] │
│ [🔍 이름 검색            ×]  │
│ [얼굴][얼굴][얼굴][얼굴]      │
│ 서연  민준  지우  하린        │
│ 보냄                          │ ← 보낸 사람: 체크·잠금·설명 줄
├──────────────────────────────┤ ← footer(고정)
│ [      2명에게 보내기      ] │ ← 고른 사람이 있을 때만
│       (🔗)        (↗)        │
│     링크 복사    공유하기     │
└──────────────────────────────┘ ← 안전 영역
```

## 꼭 지킬 것

- 보이는 문구·접근성 이름은 모두 `labels`로 준다. 컴포넌트가 만드는 문구는 없다.
- 기기 공유 시트는 열렸다 닫힌 것만 안다. 전달됐다고 안내하거나 "보냄"으로 표시하지 않는다. 앱 안 보내기만 `onSend` 결과로 "보냄"을 표시한다.
- `onSend`는 실제로 전달한 id만 `sentIds`로 돌려준다. 실패한 사람은 선택된 채 남아 다시 누르면 그 사람만 보낸다(이미 보낸 사람에게 두 번 보내지 않는다).
- 보내는 동안 시트는 사용자가 닫을 수 없고(`busy`) 목록은 잠긴다. 연속 탭은 요청 하나로 묶인다. 로그인 만료처럼 시트를 닫아야 하는 실패는 제품이 `onOpenChange`의 제어 상태를 `false`로 바꾼다.
- 검색칸에 자동 포커스를 주지 않는다. 하단 시트는 열릴 때 입력에 포커스하지 않으므로 키보드가 목록과 공유 버튼을 가리지 않는다.
- Native 복사는 제품이 `copyLink`로 준다(`expo-clipboard` 등). HJM Native 핵심은 클립보드 모듈을 설치하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 복사 기본값 | `navigator.clipboard.writeText` | 없음. `copyLink` 필수(`null`이면 숨김) |
| 기기 공유 기본값 | `navigator.share({ url, title?, text? })`. 없는 브라우저와 서버 렌더에서는 숨김 | `Share.share`. iOS는 링크를 `url`로, Android는 `url`을 버리므로 제목·문구 다음 줄에 링크를 붙인 `message`로 보낸다 |
| 공유 취소 | `AbortError` 거부 → `onSystemShare("dismissed")`, 실패 안내 없음 | iOS `dismissedAction` → `dismissed`. Android는 항상 `completed` |
| 교체 함수의 결과 | `Promise<void>`, 취소는 `AbortError`로 거부 | `Promise<"completed" \| "dismissed">` |
| 아이콘 | 생략하면 HJM `copy`·`share` | `icons` 필수(핵심이 그림을 그리지 않는다) |
| 안내 알림 | 복사 성공 `status`, 실패 `alert` | 복사 성공 polite, 실패 assertive 알림 |

## 근거

- 도입: 2026-10-26 사용자 지시 "공유에 대해서 디자인 시스템에 넣고 꺼내서 쓰자 번뚝 공유 그대로 공통화 해". 번뚝 Web·Native 공유 시트(받는 사람 검색·다중 선택·보낸 사람 잠금·부분 실패 재시도·두 원형 외부 행동)를 제품 중립 API로 옮겼다. 오늘갈게 단톡방 보내기처럼 다른 제품도 같은 시트를 쓴다.
- 기기 공유는 전달을 주장하지 않음: 번뚝 공유가 공유 시트를 연 것만 관측할 수 있어 시도만 기록했다. `onSystemShare`의 `completed`도 같은 뜻이다.
- 실패한 사람만 선택 유지: 번뚝 부분 실패 재시도에서 이미 보낸 DM이 중복되지 않게 했다. 요청하지 않은 id 보고는 보내지 않은 사람을 "보냄"으로 표시하므로 오류로 둔다.
- 별도 보조 기능(supplemental): Sheet에 새 상태 축을 더하지 않고 Sheet·ImageChoiceGroup·IconButton·SearchField를 조합한 공유 전용 구성이라 catalog canonical 행이나 Sheet companion으로 두지 않고 자기 지침과 스토리를 가진다(`ChoiceRow`와 같은 방식, `scripts/sync-public-component-map.mjs`).
