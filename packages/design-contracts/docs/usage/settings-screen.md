# SettingsScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
설계: [반복 화면 조합](../screen-patterns.md)(상태: 실험, supplemental),
채택: [1.4 제품 채택 가이드 · 설정 한 행](../product-adoption-1.4.md#설정-한-행). 카탈로그 계약은 없다.

## 언제 쓰나

앱의 설정 화면 전체에 쓴다. 제목, 선택적 프로필 영역, id가 있는 섹션 목록을 받아
[ScreenLayout](screen-layout.md) 안에 [Section](section.md)으로 쌓는다. 섹션 안의 행은
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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SettingsScreen` | `/screens` | `/screens` | supplemental. root에서는 내보내지 않는다 |

## 최소 사용 예

```tsx
// Native — Web은 import를 "@hjmds/react/screens"로 바꾸고 Switch는 "@hjmds/react/selection"
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

- `title`(필수), `sections`(필수, `{ id, title, description?, children }[]`), `profile`(섹션 위).
- 나머지는 ScreenLayout과 같다(`state`, `stateAction`, `notice`, `footer`, `header`, `leading`, `actions`, `contentInset`).
  `children`과 `scroll`은 받지 않는다. 화면 전체가 스크롤한다.
- Native는 섹션 내용 위에 구분선을 그린다. 회색 카드 배경은 쓰지 않는다(2026-10-05 사용자 결정).

## 꼭 지킬 것

- **켜고 끄는 행은 `Switch presentation="row"`로 만든다.** label·description·checked·onCheckedChange를
  넘기면 행 전체가 switch 하나다. Pressable·button·ListRow `onPress`로 다시 감싸지 않는다.
  Web 기본은 `inline`, Native 기본은 `row`이므로 Web·Native 같은 화면에서는 `presentation`을 명시한다.
- ListRow의 trailing에 Switch만 둘 때는 `labelVisibility="hidden"`을 쓰고 그 ListRow에는 `onPress`를 두지 않는다.
- 현재 선택값(언어·테마)은 행 `description`에 두고, 선택은 [Select](select.md) 또는 [Sheet](sheet.md)로 연다.
- 섹션 `id`는 안정적인 키로 둔다(번역 문구를 id로 쓰지 않는다).
- 저장 방식·낙관적 갱신·실패 복구·탈퇴 확인은 제품과 [action-session](../action-session.md)이 소유한다.
  저장 실패는 `state`가 아니라 `notice`로 알린다.
- 배치: Web `className`, Native `layoutStyle`. 섹션 색·여백을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 섹션 구분 | Section(`hjm-settings-section`) CSS | Section + 내용 위 1px 구분선 |
| Switch 기본 `presentation` | `inline` | `row` |
| 행 이동 이벤트 | ListRow `href`/`onClick` | ListRow `onPress` |
