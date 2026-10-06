# EditorScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/콘텐츠/작성과 수정`, `배포/화면/계정/프로필`

## 언제 쓰나

글쓰기·프로필 수정처럼 한 화면 전체가 편집 흐름일 때 쓴다. 닫기 버튼, 수정 중 닫기 확인
(AlertDialog), 저장 버튼의 busy 표시, 초안 상태 안내를 ScreenLayout 위에 한 번에 묶어 준다.
검증·초안 저장·저장 mutation·라우터/OS 뒤로가기 guard는 제품이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 편집 흐름이 없는 일반 화면 | [ScreenLayout](screen-layout.md) |
| 화면 일부의 입력 묶음과 submit | [Form](form.md) |
| 편집 없이 확인만 받기 | [AlertDialog](alert-dialog.md) |
| 짧은 입력을 화면 위에 띄움 | [Sheet](sheet.md), [Dialog](dialog.md) |
| 프로필 요약과 수정 진입 | [ProfileScreen](profile-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `EditorScreen` | 편집 화면 흐름 | `/screen-flows` | `/screen-flows` |
| `ScreenFlowAction` (타입) | `submit`·`cancel` 행동 | `/screen-flows` | `/screen-flows` |

루트(`@hjmds/react`, `@hjmds/react-native`)에서는 import 할 수 없다. granular subpath만 쓴다.

## 최소 사용 예

```tsx
// Web
import { EditorScreen } from "@hjmds/react/screen-flows";
import { Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";

<EditorScreen
  title={t("post.edit.title")}
  dirty={draft !== saved}
  submit={{ label: t("post.edit.save"), pending: saving, disabled: !draft.trim(), onAction: save }}
  cancel={{ label: t("post.edit.close"), onAction: close }}
  discard={{
    mode: "confirm",
    title: t("post.discard.title"),
    description: t("post.discard.description"),
    confirmLabel: t("post.discard.confirm"),
    cancelLabel: t("post.discard.keep"),
    tone: "danger",
    fallbackErrorMessage: t("common.error"),
  }}
  draftStatus={<Text variant="caption" tone="muted">{t("post.edit.draftSaved")}</Text>}
>
  <TextField label={t("post.edit.body")} value={draft} onValueChange={setDraft} />
</EditorScreen>
```

```tsx
// Native — props는 같다. 조각은 Native subpath에서 가져온다.
import { EditorScreen } from "@hjmds/react-native/screen-flows";
import { Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";

<EditorScreen
  title={t("post.edit.title")}
  dirty={draft !== saved}
  submit={{ label: t("post.edit.save"), pending: saving, disabled: !draft.trim(), onAction: save }}
  cancel={{ label: t("post.edit.close"), onAction: close }}
  discard={{
    mode: "confirm",
    title: t("post.discard.title"),
    description: t("post.discard.description"),
    confirmLabel: t("post.discard.confirm"),
    cancelLabel: t("post.discard.keep"),
    tone: "danger",
    fallbackErrorMessage: t("common.error"),
  }}
  draftStatus={<Text variant="caption" tone="muted">{t("post.edit.draftSaved")}</Text>}
>
  <TextField label={t("post.edit.body")} value={draft} onValueChange={setDraft} />
</EditorScreen>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `dirty` | `boolean` | 필수 | `true`에서 닫기를 누르면 `discard` 확인창을 띄우고, 확인하면 `cancel.onAction`을 부른다. `false`면 바로 부른다 |
| `submit` | `ScreenFlowAction`(`{ label, onAction(), disabled?, pending? }`) | 필수 | `pending`이면 loading·비활성. 그동안 닫기 버튼도 비활성 |
| `cancel` | `ScreenFlowAction` | 필수 | `leading` 자리의 ghost 닫기 버튼 |
| `discard` | AlertDialog confirm 요청에서 `onConfirm`을 뺀 것 + `fallbackErrorMessage: string` | 필수 | `onConfirm`은 EditorScreen이 채운다 |
| `submitPlacement` | `"footer"` · `"header"` | `"footer"` | `header`면 저장이 상단 `actions` 자리로 가고 footer에는 `draftStatus`만 남는다 |
| `draftStatus` | `ReactNode` | 없음 | 초안 저장 상태 안내. footer에 놓인다 |
| `children` | `ReactNode` | 필수 | 편집 본문 |
| 나머지 | `ScreenLayout`과 같음(`children`·`footer` 제외) | — | `leading`은 닫기 버튼으로 덮인다. `submitPlacement="footer"`일 때만 `actions`가 그대로 전달된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720) 안에 입력 본문; 저장·닫기는 `Button` 기본 크기 | `ScreenLayout`, `screen-flows.tsx` `Action` |
| 간격 | 화면 padding `spacing.md` 16; footer 안 `draftStatus`–저장 `spacing.sm` 12(`Stack gap="sm"`); 본문 안 입력 간격은 제품(Form 등) 소유 | Web·Native `EditorScreen` |
| 순서·정렬 | 헤더(닫기 → 제목 → [저장: header 배치]) → 본문 → footer(`draftStatus` → 저장) | `EditorScreen` 렌더 순서 |
| 고정·스크롤 | 헤더·footer 고정, 본문 스크롤(`scroll` 기본 `"screen"`); 이탈 확인은 AlertDialog 오버레이 | `ScreenLayout`, `AlertDialog` |
| 좁은 폭·큰 글자 | 제목 열 최소 폭 120 × 글자 배율, 모자라면 header 저장 버튼이 다음 줄로 내려간다; 키보드·safe area는 host | `screenPatternRecipe.headerMinWidth` |

## 꼭 지킬 것

- 모든 문구(`label`, `discard`의 제목·설명·버튼)는 i18n 키로 넣는다. 컴포넌트는 기본 문구를 갖지 않는다.
- `discard`는 `fallbackErrorMessage`까지 필수 타입이다. `onConfirm`은 EditorScreen이 채우므로 넘기지 않는다.
- 확인 후 초안을 되돌리는 일은 `cancel.onAction` 안에서 제품이 한다.
- 라우터 뒤로가기·Android back·브라우저 이탈은 이 컴포넌트가 막지 않는다. 제품이 `dirty`로 guard를 건다.
- 저장 성공 판정·오류 표시는 제품 상태(`notice`, Toast 등)로 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 화면 셸 전용 props | `as`, `className` | `testID`, `scrollRef`, `scrollProps` (`layoutStyle`은 양쪽 모두 받는다) |
| 버튼 이벤트 | 내부에서 `onClick` → `onAction` | 내부에서 `onPress` → `onAction` |
