# 시간 선택

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/TimeSelection.stories.tsx`, `showcase/native/src/TimeSelection.stories.tsx`, `showcase/native/src/pattern-status.tsx`, `showcase/shared/time-example.ts`, `src/foundations.ts`(`control`, `spacing`), `src/component-recipes.ts`(`stackRecipe`, `sectionRecipe`), `src/container.ts`
- 스토리북: `배포/구성/선택과 필터/시간 선택`

## 언제 쓰나

알림 시각·마감 시각처럼 하루 안의 시각 하나를 시·분 두 Select로 나눠 고르게 할 때 쓴다. 둘 다 고른 뒤에만
확정 버튼이 열리고, 확정하면 같은 흐름 아래에 성공 Notice가 붙는다. 날짜까지 함께 고르면
[DatePicker](../components/date-picker.md)를, 길이(시·분·초)를 고르면 `DurationField`([NumberField](../components/number-field.md) 지침)를 먼저 검토한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Section` | 제목과 한 줄 설명(양쪽 모두 Section) | [Section](../components/section.md) |
| `Stack` `gap="md"` | 세로 흐름 전체 | [Stack](../components/stack.md) |
| `Select` × 2 | 시(0~23), 분(0~59). 항목은 `{ id, label, textValue }` | [Select](../components/select.md) |
| 상태 문구 `Text` | "선택한 시각 HH:MM" 또는 "시와 분을 모두 선택해 주세요". Web `role="status"`, Native live region(iOS는 announce 보완) | [Text](../components/text.md) |
| `Button` `tone="primary"` | 선택 완료. 둘 다 고르기 전엔 `disabled`, 저장 중 `loading` | [Button](../components/button.md) |
| `Button` `tone="ghost"` | 다시 고르기(두 값과 결과를 비움) | [Button](../components/button.md) |
| `Notice` `tone="success"` / `"danger"` | 확정 결과 / 저장 실패. 결과가 나기 전엔 마운트하지 않는다 | [Notice](../components/notice.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
┌ Section(스크롤과 함께 흐름) ───────────┐
│ 제목 (Section title)                   │
│ 설명 (muted)                           │  제목–설명 spacing.xxs 4
│            ↕ spacing.xs 8              │  머리–내용(sectionRecipe.gap)
│ 시                                     │
│ [ 시 선택                        ▾ ]   │  필드 높이 44
│            ↕ spacing.md 16             │
│ 분                                     │
│ [ 분 선택                        ▾ ]   │
│            ↕ spacing.md 16             │
│ 선택한 시각 09:30        ← 상태 문구   │
│            ↕ spacing.md 16             │
│ [            선택 완료             ]   │  ← 주 행동(primary), 꽉 찬 폭
│            ↕ spacing.md 16             │
│ [            다시 고르기           ]   │  ← 보조 행동(ghost)
│            ↕ spacing.md 16             │
│ ┌ ✓ 시간을 정했어요 · 09:30 ────────┐  │  ← 확정 후에만
│ └────────────────────────────────────┘  │
└────────────────────────────────────────┘
  고정 영역 없음. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다(Web 스토리는 Section만 그린다). Native는 `ScrollView` 안 [Container](../components/container.md)에 둔다. Select는 키보드 대신 목록 표면(Web popover, Native modal sheet)을 열어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 머리 | Section 제목·설명 | 흐름 맨 위, 스크롤과 함께 | 제목–설명 `spacing.xxs` 4, 머리–내용 `spacing.xs` 8 |
| 입력 | Select 시 → 분 | 머리 아래, 시가 먼저 | 필드 `control.fieldHeight` 44, 사이 `spacing.md` 16 |
| 상태 | 상태 문구 | 입력 바로 아래 | 위 `spacing.md` 16 |
| 행동 | Button primary → ghost | 상태 아래, 세로로 쌓음. Stack 기본 `align="stretch"`라 꽉 찬 폭 | 높이 `control.buttonHeight.medium` 44, 사이 `spacing.md` 16 |
| 결과 | Notice success / danger | 행동 아래 | 위 `spacing.md` 16 |

- 주 행동이 위, 되돌리기(ghost)가 아래다. 가로로 놓아야 하면 [Button 배치](../components/button.md#배치)의 보조 → 주 순서를 따른다.
- 이 구성에는 고정 영역이 없다. 긴 화면 하단에 확정을 고정해야 하면 "선택 완료"를 [BottomCTA](../components/bottom-cta.md)로 옮긴다.

## 흐름과 상태

1. 시 Select를 연다(Web은 트리거에 붙은 listbox popover, Native는 modal sheet) → 시를 고른다.
2. 분 Select를 같은 방식으로 고른다. 어느 값을 바꿔도 이전 확정 결과를 지운다.
3. 두 값이 모두 있으면 상태 문구가 시각으로 바뀌고 "선택 완료"가 활성화된다.
4. "선택 완료" → (서버에 저장하면 버튼 `loading`) → success Notice가 붙는다. "다시 고르기" → 두 Select와 Notice를 비운다.
5. 저장이 실패하면 danger Notice가 붙고 고른 값은 그대로 남아 "선택 완료"를 다시 누를 수 있다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 두 Select에 placeholder, 상태 문구 "시와 분을 모두 선택해 주세요", 선택 완료 `disabled` | 상태 문구가 live region |
| 하나만 고름 | 초기와 같은 상태 문구, 선택 완료 `disabled` | — |
| 둘 다 고름 | 상태 문구에 "선택한 시각 HH:MM", 선택 완료 활성 | 상태 문구 변경을 알린다(Native iOS는 announce 보완) |
| 진행 중 | 서버에 저장하는 제품이면 선택 완료 `loading`, 두 Select `busy`(포커스 순서 유지, 조작 막음), 다시 고르기 `disabled` | 포커스는 버튼에 남는다 |
| 실패 | 행동 아래 Notice danger(값 유지), 선택 완료 다시 활성 | Web `danger`는 `role="alert"`, Native는 `announcement="assertive"` |
| 확정 | 행동 아래 Notice success | Web Notice는 `role="status"`로 알린다. Native는 `announcement="polite"`를 줘야 알린다. 포커스는 버튼에 남는다 |

- Select는 선택 해제가 기본 허용이라 `onSelectionChange`에 `null`이 올 수 있다. 값은 `string | null`로 둔다.
- 값은 `"HH"`·`"MM"` 문자열 키다. 시간대·예약 계산은 제품 소유다.
- 문구 키는 상태별 상수로 둔다. 상태 이름으로 키를 조립하지 않는다.

| 상태 | 상태 문구 키 | Notice 키 |
| --- | --- | --- |
| 기본·하나만 고름 | `reminder.time.incomplete` | — |
| 둘 다 고름 | `reminder.time.selected`(`value`) | — |
| 실패 | 둘 다 고름과 같다 | `reminder.time.saveFailed` |
| 확정 | 둘 다 고름과 같다 | `reminder.time.saved` |

## 코드 골격

```tsx
// Web
import { Select } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { Section, Stack, Text } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";

<Section title={t("reminder.time.title")} description={t("reminder.time.description")}>
  <Stack gap="md">
    <Select label={t("reminder.time.hour")} placeholder={t("reminder.time.hourPlaceholder")}
      emptySelectionLabel={t("reminder.time.hourClear")} busy={saving}
      items={hourOptions} selectedKey={hour} onSelectionChange={changeHour} />
    <Select label={t("reminder.time.minute")} placeholder={t("reminder.time.minutePlaceholder")}
      emptySelectionLabel={t("reminder.time.minuteClear")} busy={saving}
      items={minuteOptions} selectedKey={minute} onSelectionChange={changeMinute} />
    <Text role="status">{value ? t("reminder.time.selected", { value }) : t("reminder.time.incomplete")}</Text>
    <Button disabled={!value} loading={saving} onClick={confirm}>{t("reminder.time.confirm")}</Button>
    <Button tone="ghost" disabled={saving} onClick={reset}>{t("reminder.time.reset")}</Button>
    {result === "saved" && value ? <Notice tone="success" title={t("reminder.time.saved")} description={value} /> : null}
    {result === "failed" ? <Notice tone="danger" title={t("reminder.time.saveFailed")} /> : null}
  </Stack>
</Section>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Select } from "@hjmds/react-native/forms";
import { Button } from "@hjmds/react-native/actions";
import { Container, Section, Stack, Text } from "@hjmds/react-native/primitives";
import { Notice } from "@hjmds/react-native/feedback";

const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Section title={t("reminder.time.title")} description={t("reminder.time.description")}>
      <Stack gap="md">
        <Select label={t("reminder.time.hour")} placeholder={t("reminder.time.hourPlaceholder")}
          dismissLabel={t("reminder.time.hourClose")} busy={saving}
          items={hourOptions} selectedKey={hour} onSelectionChange={changeHour} />
        <Select label={t("reminder.time.minute")} placeholder={t("reminder.time.minutePlaceholder")}
          dismissLabel={t("reminder.time.minuteClose")} busy={saving}
          items={minuteOptions} selectedKey={minute} onSelectionChange={changeMinute} />
        {/* iOS는 live region을 무시하므로 문구가 바뀔 때 AccessibilityInfo.announceForAccessibility로 보완한다 */}
        <Text accessibilityLiveRegion="polite">{value ? t("reminder.time.selected", { value }) : t("reminder.time.incomplete")}</Text>
        <Button disabled={!value} loading={saving} onPress={confirm}>{t("reminder.time.confirm")}</Button>
        <Button tone="ghost" disabled={saving} onPress={reset}>{t("reminder.time.reset")}</Button>
        {result === "saved" && value ? <Notice tone="success" announcement="polite" title={t("reminder.time.saved")} description={value} /> : null}
        {result === "failed" ? <Notice tone="danger" announcement="assertive" title={t("reminder.time.saveFailed")} /> : null}
      </Stack>
    </Section>
  </Container>
</ScrollView>;
```

`hourOptions`·`minuteOptions`(항목 라벨 "9시"·"30분")와 문구는 제품 소유이며 라벨도 i18n으로 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 목록 표면 | 트리거에 붙은 listbox popover | modal sheet |
| 필수 문구 | `emptySelectionLabel`(선택 해제 항목) | `dismissLabel`(시트 닫기) |
| 상태 문구 낭독 | `role="status"` | `accessibilityLiveRegion`(Android), iOS는 `announceForAccessibility`로 보완(스토리 `PatternStatus`) |
| 테마·글자 스토리 | 기본·어두운 테마·큰 글자(textScale 2) | 기본·어두운 테마·큰 글자(textScale 2) |
| 확정 Notice 발표 | 늘 live region | `announcement`를 지정해야 발표(기본 `none`) |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView` > `Container` |

## 함정

- 값을 바꾸면 이전 확정 결과(`result`)를 지운다. 남겨 두면 새로 고른 시각과 다른 확정 Notice가 보인다.
- 스토리의 확정은 로컬 상태만 바꾼다. 서버 저장의 진행·실패·재시도 검증을 대신하지 않는다.
- 2026-10-06 검수에서 예제도 Container·Section·Text와 Native 확정 Notice의 `announcement="polite"`를 사용하도록 맞췄다. 제목 의미와 iOS 알림을 개별 View/Text 스타일로 다시 만들지 않는다.
