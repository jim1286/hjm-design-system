# 프로필

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screen-flows.tsx`(`ProfileScreen`·`EditorScreen`), 예제 `showcase/*/screen-flow-previews.tsx`(`AccountFlowPreview`)·`saved-profile-previews.tsx`(`ProfileEditFields`), 기본 얼굴 `showcase/web/src/patterns/ProfileStudio.previews.tsx`·`showcase/native/src/profile-face-preview.tsx`·`showcase/shared/profile-studio.ts`. 2026-10-06 사용자 승인으로 실험 `공통 화면/프로필`을 배포하면서 같은 프로필 수정을 직접 조립으로 보이던 배포 `화면/프로필 편집`과 합쳤다(API 기반 우선, Web id `patterns-profile-studio` 보존, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/계정/프로필`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

내 프로필을 보고(요약·게시물·계정 메뉴) 고치는(사진·이름·소개) 화면을 ProfileScreen과 EditorScreen으로 구성한다.
보기와 수정은 같은 route 안에서 바뀌고, 수정 저장은 footer primary 하나, 저장하지 않고 닫으면 버리기 확인을 띄운다.
스토리는 `기본`(보기에서 수정·계정 메뉴·게시물 상세까지 직접 조작), `프로필 수정`(수정 화면을 바로 연 상태), `기본 얼굴 고르기`,
`불러오는 중`·`비어 있음`·`오류`·`로그인 필요`, `실패와 복구`(다음 저장 실패 → 다시 저장)다.
기본 얼굴(사진이 없을 때의 Blobatar) 고르기는 `기본 얼굴 고르기` 스토리와 아래 [기본 얼굴 고르기](#기본-얼굴-고르기) 절에 있다.
사용자 데이터·저장·로그아웃은 제품이 공급하며 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
보기 — ProfileScreen = ScreenLayout(최대 720, 바깥 padding spacing.md 16), footer 없음
┌ 머리(고정): jimin                                   [☰] ← 계정 메뉴 IconButton ghost ┐
│ (저장 실패 등) notice                                                               │
├──────────────────────────── 본문 스크롤 ───────────────────────────────────────────┤
│ summary(제품): 사진 · 게시물/팔로워/팔로잉 수 · 이름 · 소개 · @아이디                  │
│               ↕ spacing.md 16                                                     │
│ [프로필 수정]  ← edit, ghost                                                        │
│               ↕ spacing.xl 24                                                     │
│ children(제품): [게시물][저장됨] ← ghost+selected, 사진 격자 3열(gap xxs)              │
│               ↕ 24                                                                │
│ accountActions(선택): 본문 끝 계정 행동                                               │
└───────────────────────────────────────────────────────────────────────────────────┘
계정 메뉴 Sheet: 연결된 계정 ListRow / footer [로그아웃] → AlertDialog 확인

수정 — EditorScreen(submitPlacement="footer")
┌ 머리(고정): [닫기] 프로필 수정                                                        ┐
├──────────────────────────── 본문 스크롤 ───────────────────────────────────────────┤
│ 사진 + [프로필 사진 변경] (secondary small → 사진 고르기 Sheet)                         │
│ 공개 프로필: 이름 TextField(최대 30, 비면 오류) · 소개 TextArea(최대 160) + 글자 수     │
│ 사용자 이름(읽기 전용 Surface)                                                        │
├──────────────────────────── footer(고정) ──────────────────────────────────────────┤
│ 초안 상태 caption("이 화면에 초안을 보관했어요")                                       │
│ [            변경사항 저장            ] ← primary, 바뀐 것이 없거나 이름이 비면 비활성   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ProfileScreen · EditorScreen(둘 다 ScreenLayout) | route 본문, host가 남은 높이·safe area·키보드를 준다 | 폭 최대 720, 바깥 padding `spacing.md` 16([ScreenLayout 배치](../components/screen-layout.md#배치)), 본문 스크롤 |
| 머리 | `title` + `actions`(IconButton ghost 계정 메뉴) | 맨 위, 고정 | 제목 열 최소 120 × 글자 배율 |
| 요약 | `summary`(제품) | 본문 맨 위 | 요약 안 배치는 제품 소유 |
| 수정 진입 | `edit` → Button ghost | 요약 아래 | 요약과 `spacing.md` 16. 프로필 카드 안에 두는 제품은 `editPlacement="summary"`(ProfileSummary 행동 줄 맨 앞, `secondary` `small`, 1.31.0) |
| 게시물 | `children` > Stack `gap="md"` > 탭 Button 줄 + Grid `columns={{ compact: 3 }}` | 수정 아래 | 요약 묶음과 `spacing.xl` 24, 격자 간격 `spacing.xxs` |
| 계정 메뉴 | Sheet > ListRow, `footer` > Button ghost 로그아웃 → AlertDialog | 오버레이 | footer 고정 |
| 수정 화면 | EditorScreen `submitPlacement="footer"` > 사진·이름·소개 필드 | 같은 route에서 보기 대신 | footer: 초안 상태 → 저장 primary, 사이 `spacing.sm` 12 |

### 기본 얼굴 고르기

사진이 없을 때 보일 기본 얼굴(Blobatar)을 고르는 상태다. 옛 `프로필 편집`의 고유 상태라 `기본 얼굴 고르기` 스토리는 그 직접 조립 화면을 연다.
제품은 이 고르기를 수정 화면 사진 영역(또는 사진 고르기 Sheet)에 넣는다.

```text
[◉][◯][◯][◯]   ← ImageChoiceGroup selectionMode="single", 타일 72, 사이 spacing.xs 8
미리보기 Avatar 64 renderFallback = 고른 얼굴
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 수정 화면 본문(EditorScreen) 안 | 사진 영역 | 위 표의 수정 화면을 따른다 |
| 얼굴 줄 | [ImageChoiceGroup](../components/image-choice-group.md) `selectionMode="single"`, 항목 `image` = `createBlobatarFallback({ seed })({ size: imageChoiceRecipe.tileSize, decorative: true })`, 이름은 항목 `label` | 사진 아래 | 타일 `imageChoiceRecipe.tileSize` 72, 사이 `imageChoiceRecipe.gap`(`spacing.xs` 8), 미리보기 64 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 프로필 수정 | `edit` → Button ghost(`editPlacement="summary"`면 ProfileSummary 안 `secondary` `small`) | 요약 아래(또는 요약 카드 안 행동 줄 맨 앞) | 1 |
| 계정 메뉴 | IconButton ghost(접근성 이름 "계정 메뉴") | 머리 끝(`actions`) | 1. 로그아웃·연결 계정은 메뉴 안 |
| 게시물·저장됨 전환 | [SegmentedControl](../components/segmented-control.md)(label "프로필 보기") | 게시물 영역 맨 위 | 2개 항목, 단일 선택. 선택 상태를 ghost Button으로 흉내 내지 않는다 |
| 게시물 열기 | 사진 칸 전체 | 격자 | 칸마다 1. 상세는 ScreenLayout + `exit` 뒤로 아이콘 |
| 로그아웃 | 계정 Sheet `footer` Button ghost → AlertDialog `confirm` | Sheet 아래 | 1. 확인 뒤 실행 |
| 저장 | EditorScreen `submit` → Button primary(`pending`이면 `loading`) | 수정 footer 끝 | 1. 바뀐 것이 없거나 이름이 비면 비활성 |
| 닫기 | EditorScreen `cancel` → 헤더 시작 쪽 × 아이콘(`exit` `close`) | 수정 머리 앞 | 1. dirty면 `discard` 확인(danger) |
| 사진 변경 | Button `secondary` `small` → Sheet | 수정 본문 사진 아래 | 1 |
| 기본 얼굴 고르기 | ImageChoiceGroup `selectionMode="single"` | 사진 영역 | 얼굴 수만큼, 단일 선택 |
| 다시 시도 | `stateAction` Button | 상태 안내 아래 | 오류·로그인 필요일 때 1 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 머리 · 요약 · 프로필 수정 · 게시물 탭과 격자 | 수정 · 계정 메뉴 · 게시물 열기 |
| 프로필 수정 | `프로필 수정` 스토리: EditorScreen, 저장은 footer primary 하나, 초안 상태 caption, 닫기는 dirty면 버리기 확인 | 저장 · 닫기 |
| 기본 얼굴 고르기 | `기본 얼굴 고르기` 스토리: 얼굴을 고르면 미리보기 Avatar가 바로 바뀌고, 이름이 비면 오류·저장 비활성 | 얼굴 선택 · 적용 · 되돌리기 |
| 로딩 | `불러오는 중`: `state={{ kind: "loading" }}`로 본문을 상태 안내로 바꾼다. 저장 중에는 저장 Button `loading` | 기다림 |
| 빈 | `비어 있음`: `state={{ kind: "empty" }}` 안내. 게시물 0개는 제품이 게시물 영역에 빈 안내를 둔다 | 첫 게시물 쓰기 등 맥락 행동 |
| 오류 | `오류`: 불러오기 실패 안내 + `stateAction` 다시 시도. 저장 실패는 수정 화면에 머물고 이전 프로필과 초안을 모두 보존, 머리 아래 notice 자리에 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`)로 알린다 | 다시 시도 · 다시 저장 |
| 로그인 필요 | `로그인 필요`: `state={{ kind: "restricted" }}` + `stateAction` | 로그인 |
| 실패와 복구 | `실패와 복구`: 다음 저장 실패를 예약한 뒤 저장 → 실패 문구, 초안 유지 → 다시 저장 | 같은 저장 행동 |
| 로그아웃 확인 | AlertDialog: 제목·설명·[취소][로그아웃] | 확인 뒤 제품이 세션을 끝낸다 |


### 프로필과 게시물 상태 분리

| 상황 | 연결 | 유지·복구 |
| --- | --- | --- |
| 프로필 조회 전 | 지역화된 기본 title + loading | user가 없을 때 handle·summary를 평가하지 않는다 |
| 게시물 0개 | 프로필 ready + 게시물 영역만 empty | 프로필과 수정 행동은 계속 보인다 |
| 프로필 저장 실패 | EditorScreen ready + notice | 보기용 원본과 편집용 초안을 모두 보존한다 |
| 계정 변경·로그아웃 | 제품 세션과 데이터 초기화 | 이전 계정의 늦은 응답이나 draft를 다음 계정에 재사용하지 않는다 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ProfileScreen](../components/profile-screen.md) | 보기 화면의 슬롯·순서 |
| [EditorScreen](../components/editor-screen.md) | 수정 화면, 저장 위치, 버리기 확인 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·상태 안내·notice·스크롤 소유 |
| [Notice](../components/notice.md) | 저장 실패(notice 자리) |
| [IconButton](../components/icon-button.md) | 계정 메뉴 |
| [Button](../components/button.md) | 수정·탭·저장·사진 변경·얼굴 선택 |
| [Sheet](../components/sheet.md) · [AlertDialog](../components/alert-dialog.md) | 계정 메뉴 · 로그아웃 확인 |
| [Field](../components/field.md) | 이름 `TextField`·소개 `TextArea` |
| [Avatar](../components/avatar.md) | 사진, `createBlobatarFallback` 기본 얼굴 |
| [Grid](../components/grid.md) | 게시물 격자 |
| [저장한 항목](common-saved.md) | 저장됨 탭을 따로 키울 때 |

## 코드 골격

```tsx
// Web
import { ProfileScreen, EditorScreen } from "@hjmds/react/screen-flows";
import { IconButton, Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Stack } from "@hjmds/react/layout";
import { Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";

const faceRow = <Stack axis="inline" wrap gap="sm">{faces.map((face) =>
  <Button key={face.seed} tone="ghost" selected={draft.seed === face.seed} aria-label={t(face.labelKey)}
    onClick={() => setDraft({ ...draft, seed: face.seed })}>
    <Avatar name={t(face.labelKey)} alt="" size="medium" renderFallback={createBlobatarFallback({ seed: face.seed })} />
  </Button>)}</Stack>;

editing ? <EditorScreen title={t("profile.edit")} submitPlacement="footer" dirty={dirty}
  cancel={{ label: t("common.close"), onAction: closeEditor }}
  submit={{ label: t("profile.save"), onAction: save, pending: saving, disabled: !dirty || !draft.name.trim() }}
  discard={{ mode: "confirm", tone: "danger", title: t("profile.discard.title"), description: t("profile.discard.body"),
    confirmLabel: t("profile.discard.confirm"), cancelLabel: t("profile.discard.cancel"), fallbackErrorMessage: t("common.retryLater") }}>
  <Stack gap="xl">
    {faceRow}
    <TextField label={t("profile.name")} value={draft.name} onValueChange={(name) => setDraft({ ...draft, name })}
      {...(!draft.name.trim() ? { error: t("profile.nameRequired") } : {})} />
  </Stack>
</EditorScreen> : <ProfileScreen
  title={user?.handle ?? t("profile.title")}
  actions={<IconButton label={t("profile.accountMenu")} tone="ghost" onClick={openAccountMenu}>{menuIcon}</IconButton>}
  summary={user ? <ProfileSummary user={user} /> : null}
  edit={{ label: t("profile.edit"), onAction: openEditor }}
  state={user ? { kind: "ready" } : { kind: "loading", title: t("profile.loading") }}
>
  <MyPostsSection />
</ProfileScreen>
```

```tsx
// Native
import { ProfileScreen, EditorScreen } from "@hjmds/react-native/screen-flows";
import { IconButton, Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Stack } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";

const faceRow = <Stack axis="inline" wrap gap="sm">{faces.map((face) =>
  <Button key={face.seed} tone="ghost" selected={draft.seed === face.seed} accessibilityLabel={t(face.labelKey)}
    onPress={() => setDraft({ ...draft, seed: face.seed })}>
    <Avatar name={t(face.labelKey)} decorative size={40} renderFallback={createBlobatarFallback({ seed: face.seed })} />
  </Button>)}</Stack>;

editing ? <EditorScreen title={t("profile.edit")} submitPlacement="footer" dirty={dirty}
  cancel={{ label: t("common.close"), onAction: closeEditor }}
  submit={{ label: t("profile.save"), onAction: save, pending: saving, disabled: !dirty || !draft.name.trim() }}
  discard={{ mode: "confirm", tone: "danger", title: t("profile.discard.title"), description: t("profile.discard.body"),
    confirmLabel: t("profile.discard.confirm"), cancelLabel: t("profile.discard.cancel"), fallbackErrorMessage: t("common.retryLater") }}>
  <Stack gap="xl">
    {faceRow}
    <TextField label={t("profile.name")} value={draft.name} onValueChange={(name) => setDraft({ ...draft, name })}
      {...(!draft.name.trim() ? { error: t("profile.nameRequired") } : {})} />
  </Stack>
</EditorScreen> : <ProfileScreen
  title={user?.handle ?? t("profile.title")}
  actions={<IconButton label={t("profile.accountMenu")} tone="ghost" onPress={openAccountMenu}>{menuIcon}</IconButton>}
  summary={user ? <ProfileSummary user={user} /> : null}
  edit={{ label: t("profile.edit"), onAction: openEditor }}
  state={user ? { kind: "ready" } : { kind: "loading", title: t("profile.loading") }}
>
  <MyPostsSection />
</ProfileScreen>
```

`ProfileSummary`·`MyPostsSection`·`faces`·`openAccountMenu`(계정 Sheet와 로그아웃 AlertDialog)는 제품이 공급한다.
`save`가 실패하면 `editing`을 유지하고 초안을 지우지 않는다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환한다. Blobatar 얼굴은 seed가 정하고 테마와 무관하다 |
| 좁은 폭 | 320부터 한 열, 게시물 격자는 3열 그대로 칸이 작아진다 |
| 키보드 | 수정 화면에서 Native host가 safe area와 키보드를 한 번 처리한다. Web은 포커스된 필드가 footer에 가리지 않는지 확인 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 얼굴 선택지 | Avatar `size="medium"`(40) `alt=""`, Button `aria-label` | Avatar `size={40}` `decorative`, Button `accessibilityLabel` |
| 소개 입력 | TextArea `onChange` | TextArea `onValueChange` |
| 저장 실패 발표 | Notice `danger`가 `role="alert"`로 읽힌다 | Notice `announcement="assertive"`를 줘야 읽힌다 |
| `기본 얼굴 고르기` 스토리 | 옛 직접 조립 화면(두 열, showcase CSS `profile-studio.css`) | 옛 직접 조립 화면(한 열, `View` style) |

## 함정

- 수정 실패는 이전 프로필과 초안 모두 보존한다. 저장 성공 전에 요약을 바꾸지 않는다.
- ProfileScreen에는 footer가 없다. 로그아웃·탈퇴를 footer에 두려 하지 말고 계정 메뉴(Sheet) 또는 본문 끝 `accountActions`에 둔다.
- 현재 `기본 얼굴 고르기` 스토리는 ProfileScreen·EditorScreen이 아닌 옛 직접 조립 화면이다. `hjm-profile-studio*` 클래스는 공개 스타일이 아니므로 제품에서 가져다 쓰지 않는다. 제품은 위 코드처럼 수정 화면 안에 얼굴 줄을 둔다.
- `createBlobatarFallback`은 seed가 바뀔 때만 다시 만들도록 `useMemo`로 묶는다.
- Storybook은 실제 서버·세션·라우터 연동 증거가 아니다. 기본·어두운 테마와 실패와 복구를 각각 확인한다.

계정 예제 상태: 실패한 프로필 초안은 유지하고 성공 뒤에만 요약을 갱신한다. 계정 Sheet와 로그아웃 AlertDialog의 returnFocusRef는 계정 메뉴 행동을 가리킨다. 로그아웃을 확정하면 열림 상태도 함께 정리하므로 예제를 다시 열 때 확인창이 되살아나지 않는다. 이는 로컬 예제 상태이며 실제 세션 종료·Native OS 초점/발표 검증과 구분한다.

## 프로필 요약

`ProfileSummary`(`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`)는 아바타·이름·배지·이름 행동 → 통계 → 행동 → 추가 소개의 기본 배치를 제공한다.
`name`/`avatar`/`badge`/`nameActions`와 `stats: {id,value,label,onPress?,disabled?}[]`, `actions`, `children`을 연결한다.
통계의 목적지·팔로우 요청·차단 권한·문구는 제품이 소유하며 요약은 저장 성공을 추정하지 않는다.
`ProfileScreen.summary`나 제품의 가상화 목록 header에서 같은 요약을 재사용한다.
단일 팔로우 카드는 `FollowProfileCard`의 요청/실패 계약을 유지하고 다중 통계를 위한 대체 엔진으로 복제하지 않는다.

`headingLevel`은 화면의 제목 계층에 맞춰 선택한다(기본 2). 아바타 72px 원형 프레임과 수치·행동 배치는 HJM이 소유한다.

## 근거

- 프로필과 게시물 상태 분리 상황 표: 2026-10-13 전수 점검 — 최초 조회와 변경 요청의 상태를 같은 골격으로 설명하던 부분을 구체화했다.
- 한 항목 구성: 2026-10-06 같은 예제를 그리던 `기본 흐름/프로필과 계정`(실험 정리 단계)과 배포 직접 조립 `프로필 편집`을 합쳤고, 프로필 편집 고유의 기본 얼굴 고르기를 별도 스토리·절로 옮겼다.
- 계정 예제 상태(초안 유지·returnFocusRef·로그아웃 정리): 2026-10-13 실제 계정 예제 검수.
- 게시물·저장됨 전환과 기본 얼굴 고르기 컴포넌트: 2026-10-17 화면 검토(S6)에서 지침의 "Button ghost + selected"가 선택 규칙(선택 상태 ghost 버튼 흉내 금지)과 실제 예제(SegmentedControl, ImageChoiceGroup)와 다른 것을 확인해 실제 구현에 맞췄다.
