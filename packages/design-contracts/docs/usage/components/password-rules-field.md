# PasswordRulesField

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [작업 선택 계약](../../task-controls.md), `src/task-controls.ts`의 `resolvePasswordRules`, 양 renderer `src/task-controls.tsx`
- 스토리북: `배포/구성/입력과 작성/비밀번호 규칙 확인`

## 언제 쓰나

새 비밀번호 입력 아래에 제품이 정한 규칙의 충족 개수와 규칙별 상태를 함께 보여 줄 때 쓴다.
[PasswordField](password-field.md)에 진행 막대와 규칙 목록을 붙인 구성이며, 충족 개수만 센다.
비밀번호 보안 강도(entropy)는 추정하지 않는다. 묶음 사용 기준은 [선택과 실제 실행](../compositions/task-controls.md)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 로그인처럼 규칙 표시가 없는 비밀번호 입력 | [PasswordField](password-field.md) |
| 일반 텍스트 입력 | `TextField`([Field](field.md)) |
| 보안 강도 점수 표시 | 제품 전용 구성(HJM은 강도를 계산하지 않는다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `PasswordRulesField` | 비밀번호 입력 + 규칙 충족 막대·목록 | `@hjmds/react/task-controls` | `@hjmds/react-native/task-controls` |

루트 barrel에는 없다. 규칙 타입 `PasswordRule`과 `resolvePasswordRules`는 `@hjmds/design-contracts/task-controls`에 있다.

## 최소 사용 예

```tsx
// Web
import { PasswordRulesField } from "@hjmds/react/task-controls";

<PasswordRulesField label={t("password.new")} value={password} onValueChange={setPassword}
  autofillHint="new" revealLabel={t("password.reveal")} concealLabel={t("password.conceal")}
  progressLabel={t("password.rules")}
  summaryLabel={(satisfied, total) => t("password.summary", { satisfied, total })}
  ruleLabel={rule => t(rule.satisfied ? "password.met" : "password.unmet", { rule: rule.label })}
  rules={[{ id: "length", label: t("password.length"), test: v => v.length >= 8 }]} />
```

```tsx
// Native
import { PasswordRulesField } from "@hjmds/react-native/task-controls";

<PasswordRulesField label={t("password.new")} value={password} onValueChange={setPassword}
  autofillHint="new" revealLabel={t("password.reveal")} concealLabel={t("password.conceal")}
  progressLabel={t("password.rules")}
  summaryLabel={(satisfied, total) => t("password.summary", { satisfied, total })}
  ruleLabel={rule => t(rule.satisfied ? "password.met" : "password.unmet", { rule: rule.label })}
  rules={rules} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 입력 이름 |
| `value` / `onValueChange` | `string` / `(value) => void` | 필수 | controlled 전용. `defaultValue`는 받지 않는다 |
| `rules` | `{ id, label, test(value) }[]` | 필수 | 비어 있거나 id가 겹치면 `TypeError`(`resolvePasswordRules`) |
| `progressLabel` | `string` | 필수 | 진행 막대 이름 |
| `summaryLabel` | `(satisfied, total) => string` | 필수 | 막대의 값 문구(`valueText`) |
| `ruleLabel` | `(rule: { id, label, satisfied }) => string` | 필수 | 규칙 한 줄 문구. 충족 여부를 글자로 포함한다 |
| 나머지 | `PasswordFieldProps` | — | `autofillHint`·`revealLabel`·`concealLabel`·`description`·`error` 등은 [PasswordField](password-field.md)로 그대로 전달 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 입력은 PasswordField 기본, 막대는 Progress 기본(`max`=규칙 수) | 양 renderer `PasswordRulesField` |
| 간격 | 입력·막대·규칙 줄 사이 `Stack gap="sm"`(12) | 같은 구현, `foundations.ts` space.sm |
| 순서·정렬 | 비밀번호 입력 → 충족 막대 → 규칙별 caption(`rules` 순서) | 렌더 순서 |
| 고정·스크롤 | 자체 고정·스크롤 없음, 바깥 폼 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 규칙 문구는 caption Text로 줄바꿈된다 | 양 renderer `Text variant="caption"` |

## 꼭 지킬 것

- 충족 개수를 "보안 강도"라고 부르지 않는다. 규칙 `test`는 순수 함수이고 예외를 던지지 않게 만든다.
- 충족 여부는 색(`primary`/`muted`)만으로 구분하지 않는다. `ruleLabel`이 "충족/미충족"을 글자로 말해야 한다.
- 제출 가능 여부·서버 검증은 제품이 결정한다. 이 구성은 제출을 막지 않는다.

## 상태와 상호작용

입력이 바뀔 때마다 `resolvePasswordRules(value, rules)`로 다시 센다. 충족한 규칙은 `tone="primary"`, 미충족은 `tone="muted"`로 표시한다.
보이기/숨기기와 자동 채움은 PasswordField 계약을 따른다.
