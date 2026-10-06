# ProfileScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합](../screen-patterns.md) (supplemental)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ProfileScreen` | `/screen-flows` | `/screen-flows` | supplemental, 루트 barrel에 없음 |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web (Native는 import 경로만 @hjmds/react-native/screen-flows)
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

## 제품이 공급할 것

| 슬롯·prop | 내용 |
| --- | --- |
| `summary` | 아바타·닉네임·소개 등 요약(필수). Avatar·Heading·Text를 제품이 조합한다 |
| `edit` | 수정 진입 행동 `{ label, onAction, disabled?, pending? }`(필수). ghost 버튼으로 요약 아래에 놓인다 |
| `children` | 활동·통계 등 본문 |
| `accountActions` | 로그아웃·탈퇴 버튼 등. 본문 맨 아래 |
| ScreenLayout props | `title`, `description`, `header`, `leading`, `actions`, `notice`, `state`, `stateAction` 등(`footer` 제외) |

## 꼭 지킬 것

- 계정 정보 조회, 인증, 로그아웃·탈퇴 mutation과 그 확인([AlertDialog](alert-dialog.md))은 제품 소유다.
- 프로필 이미지·닉네임 문구 등 표시 데이터는 제품이 넘긴다. HJM은 계정 모델을 모른다.
- 요약 자리에 브랜드 색을 하드코딩하지 않고 HJM 토큰·제품 테마로 연결한다.
