# SettingsScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-08
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/설정/앱 설정`

## 언제 쓰나

앱의 설정 화면 전체에 쓴다. 제목, 선택적 프로필 영역, id가 있는 섹션 목록을 받아
[ScreenLayout](screen-layout.md) 안에 그룹으로 쌓는다(Web은 의미 있는 Section, Native는 Stack과 header 역할). 섹션 안의 행은
기존 ListRow·Switch·Select·Field를 그대로 넣는다.

2026-09-23 소비 감사에서 제품마다 같은 설정 화면을 직접 조립하고 있었다. 제목·섹션 틀·구분선·
상태 교체를 제품이 다시 만들지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 섹션 구조가 아닌 일반 화면 | [ScreenLayout](screen-layout.md) |
| 프로필 보기·편집 화면 | [ProfileScreen](profile-screen.md) |
| 설정 한 항목을 편집하는 입력 패널 | [Sheet](sheet.md) |
| 섹션 하나만 필요(다른 화면 안) | [Section](section.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SettingsScreen` | supplemental. root에서는 내보내지 않는다 | `/screens` | `/screens` |

## 최소 사용 예

```tsx
// Web — Switch는 /selection, ListRow는 /display, 행 이동은 onClick(또는 href)
import { SettingsScreen } from "@hjmds/react/screens";
import { Switch } from "@hjmds/react/selection";
import { ListRow } from "@hjmds/react/display";

<SettingsScreen
  title={t("settings.title")}
  sections={[
    { id: "notifications", title: t("settings.notifications"), children: (
      <Switch
        presentation="row"
        label={t("settings.push.label")}
        description={t("settings.push.description")}
        checked={pushEnabled}
        onCheckedChange={setPushEnabled}
      />
    ) },
    { id: "account", title: t("settings.account"), children: (
      <ListRow title={t("settings.language")} description={currentLanguageName} onClick={openLanguageSheet} />
    ) },
  ]}
/>
```

```tsx
// Native — Switch는 /inputs, ListRow는 /data-display, 행 이동은 onPress
import { SettingsScreen } from "@hjmds/react-native/screens";
import { Switch } from "@hjmds/react-native/inputs";
import { ListRow } from "@hjmds/react-native/data-display";

<SettingsScreen
  title={t("settings.title")}
  sections={[
    { id: "notifications", title: t("settings.notifications"), children: (
      <Switch
        presentation="row"
        label={t("settings.push.label")}
        description={t("settings.push.description")}
        checked={pushEnabled}
        onCheckedChange={setPushEnabled}
      />
    ) },
    { id: "account", title: t("settings.account"), children: (
      <ListRow title={t("settings.language")} description={currentLanguageName} onPress={openLanguageSheet} />
    ) },
  ]}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `sections` | `readonly { id: string; title: string; description?: string; children: ReactNode }[]` | 필수 | 각 항목을 설정 그룹 하나로 그린다. `id`는 안정적인 key |
| `profile` | `ReactNode` | 없음 | 섹션 위 프로필 영역 |
| 나머지 | `ScreenLayout`과 같음(`children`·`scroll` 제외) | — | `title` 필수, `state`·`stateAction`·`notice`·`footer`·`header`·`leading`·`actions`·`contentInset`. 화면 전체가 스크롤한다 |

두 플랫폼 모두 그룹 위의 별도 구분선과 카드 배경을 두지 않는다. 행 구분은 List·Switch의 계약을 따른다(2026-10-08 실제 설정 화면 재검토).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720) 안에서 섹션을 세로로 쌓는다; 행 높이는 ListRow·Switch row 계약 | `ScreenLayout`, `Section` |
| 간격 | 화면 padding `spacing.md` 16; `profile`·섹션 사이 `spacing.md` 16; 그룹 제목–내용 `spacing.xs` 8; Native 설명도 같은 Stack 간격. 행 간격·구분은 행 계약 | Web·Native `SettingsScreen` `Stack gap="md"` |
| 순서·정렬 | 헤더(제목) → `notice` → `profile` → `sections` 순서대로 → `footer` | 렌더 순서 |
| 고정·스크롤 | 헤더·footer 고정, 본문 화면 스크롤(`scroll` 고정 `"screen"`); 저장 실패는 `notice` | `ScreenLayout` |
| 좁은 폭·큰 글자 | 섹션 제목·행 문구는 줄바꿈되고 자르지 않는다 | Text와 각 행의 내용 기반 높이 |

## 꼭 지킬 것

- **켜고 끄는 행은 `Switch presentation="row"`로 만든다.** label·description·checked·onCheckedChange를
  넘기면 행 전체가 switch 하나다. Pressable·button·ListRow `onPress`로 다시 감싸지 않는다.
  Web 기본은 `inline`, Native 기본은 `row`이므로 Web·Native 같은 화면에서는 `presentation`을 명시한다.
- ListRow의 trailing에 Switch만 둘 때는 `labelVisibility="hidden"`을 쓰고 그 ListRow에는 `onPress`를 두지 않는다.
- 현재 선택값(언어·테마)은 행 `description`에 두고, 선택은 [Select](select.md) 또는 [Sheet](sheet.md)로 연다.
- 섹션 `id`는 안정적인 키로 둔다(번역 문구를 id로 쓰지 않는다).
- 저장 방식·낙관적 갱신·실패 복구·탈퇴 확인은 제품과 [action-session](../../action-session.md)이 소유한다.
  저장 실패는 `state`가 아니라 `notice`로 알린다.
- 배치: Web·Native 모두 `layoutStyle`(Web은 `className`도 있다). 섹션 색·여백을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 섹션 구분 | Section(`hjm-settings-section`), 별도 그룹 선 없음 | Stack + header 역할, 별도 그룹 선 없음 |
| 조각 import | `Switch` `/selection`, `ListRow` `/display` | `Switch` `/inputs`, `ListRow` `/data-display` |
| Switch 기본 `presentation` | `inline` | `row` |
| 행 이동 이벤트 | ListRow `href`/`onClick` | ListRow `onPress` |

2026-10-08 Spint 실화면 검토에서 일반 Section의 큰 제목과 상단 구분선이 설정 행보다 강하게
보였다. SettingsScreen은 화면 제목 아래의 그룹 이름을 `Text label / strong / muted`로 표시하고,
그룹 간격은 `md`, 제목과 내용 간격은 `xs`로 둔다. 그룹마다 추가하던 진한 선은 제거하며,
행 자체의 경계·터치 영역은 유지한다. 제품에서 내부 스타일을 덮거나 별도 설정 틀을 복제하지 않는다.
Web의 의미 있는 section heading과 Native의 header 역할은 유지한다.
