# EditorScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [기본 흐름 공개 조합](../screen-patterns.md#기본-흐름-공개-조합-2026-10-05), 별도 보조 기능(supplemental)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `EditorScreen` | `/screen-flows` | `/screen-flows` | 편집 화면 흐름 |
| `ScreenFlowAction` (타입) | `/screen-flows` | `/screen-flows` | `submit`·`cancel` 행동 |

루트(`@hjmds/react`, `@hjmds/react-native`)에서는 import 할 수 없다. granular subpath만 쓴다.

## 최소 사용 예

```tsx
// Web
import { EditorScreen } from "@hjmds/react/screen-flows";

<EditorScreen
  title={t("post.edit.title")}
  dirty={draft !== saved}
  submit={{ label: t("post.edit.save"), pending: saving, disabled: !draft.trim(), onAction: save }}
  cancel={{ label: t("post.edit.close"), onAction: close }}
  discard={{
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
// Native — props는 같고 import만 다르다.
import { EditorScreen } from "@hjmds/react-native/screen-flows";
```

## 축과 기본값

- `submitPlacement`: `footer`(기본) · `header`. `header`면 저장이 상단 `actions` 자리로 가고
  footer에는 `draftStatus`만 남는다. `footer`면 `draftStatus` 아래에 저장 버튼을 둔다.
- `ScreenFlowAction`: `{ label, onAction, disabled?, pending? }`. `pending`이면 버튼이 loading·비활성이 된다.
- `submit.pending` 동안 닫기 버튼도 비활성이 된다.
- `dirty`가 `true`일 때 닫기를 누르면 `discard` 확인창을 띄우고, 확인하면 `cancel.onAction`을 부른다.
  `false`면 바로 `cancel.onAction`을 부른다.
- 나머지 props(`title`, `description`, `notice`, `state`, `header`, `contentInset` 등)는 ScreenLayout으로 그대로
  전달된다. `leading`은 닫기 버튼으로 덮이고 `footer`는 받지 않는다.

## 꼭 지킬 것

- 모든 문구(`label`, `discard`의 제목·설명·버튼)는 i18n 키로 넣는다. 컴포넌트는 기본 문구를 갖지 않는다.
- `discard`는 `fallbackErrorMessage`까지 필수 타입이다. `onConfirm`은 EditorScreen이 채우므로 넘기지 않는다.
- 확인 후 초안을 되돌리는 일은 `cancel.onAction` 안에서 제품이 한다.
- 라우터 뒤로가기·Android back·브라우저 이탈은 이 컴포넌트가 막지 않는다. 제품이 `dirty`로 guard를 건다.
- 저장 성공 판정·오류 표시는 제품 상태(`notice`, Toast 등)로 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 화면 셸 전용 props | `as`, `className` | `scroll`, `layoutStyle`, `testID`, `scrollRef`, `scrollProps` |
| 버튼 이벤트 | 내부에서 `onClick` → `onAction` | 내부에서 `onPress` → `onAction` |
