# ProfileScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/계정/프로필`

## 언제 쓰나

내 프로필(또는 계정) 화면 틀에 쓴다. 상단 요약, 그 아래 “프로필 수정” 보조 버튼, 이어지는 본문,
맨 아래 계정 행동(로그아웃·탈퇴) 슬롯을 [ScreenLayout](screen-layout.md) 위에 이 순서로 쌓는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 섹션별 설정 항목이 중심 | [SettingsScreen](settings-screen.md) |
| 프로필 수정 폼 자체 | [EditorScreen](editor-screen.md) |
| 다른 사용자 프로필의 신고·차단 | [ModerationScreen](moderation-screen.md) |
| 아바타 한 개 | [Avatar](avatar.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ProfileScreen` | supplemental, 루트 barrel에 없음 | `/screen-flows` | `/screen-flows` |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { ProfileScreen } from "@hjmds/react/screen-flows";

<ProfileScreen
  title={t("profile.title")}
  summary={<ProfileSummary user={user} />}
  edit={{ label: t("profile.edit"), onAction: openEditor }}
  accountActions={<AccountActions onSignOut={signOut} onDelete={confirmDelete} />}
  state={user ? { kind: "ready" } : { kind: "loading", title: t("profile.loading") }}
>
  <MyPostsSection />
</ProfileScreen>
```

```tsx
// Native — props는 Web과 같다
import { ProfileScreen } from "@hjmds/react-native/screen-flows";

<ProfileScreen
  title={t("profile.title")}
  summary={<ProfileSummary user={user} />}
  edit={{ label: t("profile.edit"), onAction: openEditor }}
  accountActions={<AccountActions onSignOut={signOut} onDelete={confirmDelete} />}
  state={user ? { kind: "ready" } : { kind: "loading", title: t("profile.loading") }}
>
  <MyPostsSection />
</ProfileScreen>
```

### 제품이 공급할 것

| 슬롯·prop | 내용 |
| --- | --- |
| `summary` | 아바타·닉네임·소개 등 요약(필수). Avatar·Heading·Text를 제품이 조합한다 |
| `edit` | 수정 진입 행동 `{ label, onAction, disabled?, pending? }`(필수). 기본은 ghost 버튼으로 요약 아래에 놓인다 |
| `editPlacement` | 1.31.0. `"below-summary"`(기본) · `"summary"`. `summary`면 `edit`을 `summary` 안 [ProfileSummary](profile-summary.md)의 행동 줄 맨 앞에 `secondary` `small` 버튼으로 그린다(`profileSummaryRecipe.editAction`). 요약을 카드(Surface)로 감싸도 그 안의 ProfileSummary가 받는다. `summary`에 ProfileSummary가 없으면 수정 버튼이 그려지지 않는다 |
| `children` | 활동·통계 등 본문 |
| `accountActions` | 로그아웃·탈퇴 버튼 등. 본문 맨 아래 |
| ScreenLayout props | `title`, `description`, `header`, `leading`, `actions`, `notice`, `state`, `stateAction` 등(`footer` 제외) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 수정은 ghost `Button` 기본 크기 | `ProfileScreen` |
| 간격 | 화면 padding `spacing.md` 16; summary–수정 `spacing.md` 16; (summary·수정 묶음)–`children`–`accountActions` `spacing.xl` 24 | Web·Native `ProfileScreen` `Stack gap="xl"`·`gap="md"` |
| 순서·정렬 | 헤더(제목) → summary → 수정 → `children` → `accountActions`. `editPlacement="summary"`면 수정이 summary 안(ProfileSummary 수치 아래 행동 줄 맨 앞)으로 들어가고 summary 바로 다음이 `children`(`spacing.xl` 24) | 렌더 순서 |
| 고정·스크롤 | 헤더 고정, 본문 전체 화면 스크롤(footer 없음); 계정 행동은 본문 끝 | `ScreenLayout` |
| 좁은 폭·큰 글자 | 요약 줄바꿈·아바타 크기는 `summary`(제품) 소유; 제목 열 최소 폭 120 × 글자 배율 | `screenPatternRecipe.headerMinWidth` |

## 꼭 지킬 것

- 계정 정보 조회, 인증, 로그아웃·탈퇴 mutation과 그 확인([AlertDialog](alert-dialog.md))은 제품 소유다.
- 프로필 이미지·닉네임 문구 등 표시 데이터는 제품이 넘긴다. HJM은 계정 모델을 모른다.
- 요약 자리에 브랜드 색을 하드코딩하지 않고 HJM 토큰·제품 테마로 연결한다.
- 수정 행동을 프로필 카드 안에 두려고 ProfileScreen 대신 ScreenLayout + ProfileSummary `actions`로 다시 조립하지 않는다. `editPlacement="summary"`를 쓴다. 비로그인 계정 화면처럼 같은 자리에 "로그인"을 두는 경우도 `edit`의 `label`·`onAction`을 바꿔 연결한다.

## 근거

- `editPlacement`(1.31.0): 2026-10-15 사용자 결정으로 utilverse 계정 화면은 프로필 수정(비로그인 때 로그인) 행동을 프로필 카드 안에 둔다. ProfileScreen은 수정을 요약 밖 ghost 버튼으로 고정해서, 2026-10-18 채택 때 utilverse가 ProfileScreen을 쓰지 못하고 ScreenLayout과 ProfileSummary `actions`로 같은 틀을 다시 조립했다.
